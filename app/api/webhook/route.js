// app/api/webhook/route.js — v2
// Compatible UltraMsg (sandbox) ET Meta Cloud API (production)

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getUser, upsertUser, createTransaction,
  createPendingValidation, confirmPendingValidation,
  cancelPendingValidation, getPendingValidation, isSubscriptionActive,
} from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Tu es l'assistant comptable de SenCompta, spécialisé pour les commerçants sénégalais.
Tu comprends le français standard, le français familier, le wolof et les mélanges des deux (code-switching).
Réponds UNIQUEMENT avec un objet JSON valide, aucun texte avant ou après.
FORMAT : {"type":"RECETTE"|"DEPENSE","montant":number,"libelle":"string","categorie":"string","date":"YYYY-MM-DD"|null,"confiance":"HAUTE"|"MOYENNE"|"FAIBLE"}
CATÉGORIES RECETTE : Vente marchandise, Prestation de service, Remboursement, Autre recette
CATÉGORIES DEPENSE : Achat marchandise, Transport, Loyer, Salaires, Téléphone/Internet, Électricité/Eau, Alimentation, Santé, Autre dépense
RÈGLES : bind/binde=dépense, jënd=recette, 5k=5000, 10k=10000, 1m=1000000
Si pas d'info comptable : {"error":"NON_COMPTABLE"}`;

function normalizeBody(body) {
  if (body?.data?.from) {
    return {
      phone: '+' + body.data.from.replace('@c.us', '').replace('@s.whatsapp.net', ''),
      message: body.data.type === 'chat' ? body.data.body : null,
      audio_url: body.data.type === 'audio' ? (body.data.mediaUrl || body.data.media) : null,
      action: null, validation_id: null,
    };
  }
  if (body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
    const msg = body.entry[0].changes[0].value.messages[0];
    return {
      phone: '+' + msg.from,
      message: msg.type === 'text' ? msg.text?.body : null,
      audio_url: msg.type === 'audio' ? `META:${msg.audio?.id}` : null,
      action: null, validation_id: null,
    };
  }
  return { phone: body.phone, message: body.message, audio_url: body.audio_url, action: body.action, validation_id: body.validation_id };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN || 'sencompta2025')) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ status: 'SenCompta Webhook actif ✅' });
}

async function parseTextWithGemini(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text }] }],
  });
  return JSON.parse(result.response.text().trim().replace(/```json\n?|```/g, '').trim());
}

async function parseAudioWithGemini(audioUrl) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const resp = await fetch(audioUrl);
  const buf = Buffer.from(await resp.arrayBuffer()).toString('base64');
  const mime = resp.headers.get('content-type') || 'audio/ogg';
  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: mime, data: buf } }, { text: 'Analyse ce vocal comptable.' }] }],
  });
  return JSON.parse(result.response.text().trim().replace(/```json\n?|```/g, '').trim());
}

const fcfa = (n) => new Intl.NumberFormat('fr-SN').format(n) + ' FCFA';

export async function POST(req) {
  try {
    const rawBody = await req.json();
    const { phone, message, audio_url, action, validation_id } = normalizeBody(rawBody);
    if (!phone) return NextResponse.json({ error: 'Numéro manquant' }, { status: 400 });

    let user = await getUser(phone);
    if (!user) user = await upsertUser(phone);

    const isPremium = user.plan === 'PREMIUM' && isSubscriptionActive(user);
    const today = new Date().toISOString().slice(0, 10);

    if (action && validation_id) {
      const pending = await getPendingValidation(validation_id);
      if (!pending || pending.user_id !== user.id) return NextResponse.json({ reply: '❌ Validation introuvable.' });
      if (action === 'CANCEL') { await cancelPendingValidation(validation_id); return NextResponse.json({ reply: '✅ Transaction annulée.' }); }
      if (action === 'CONFIRM') {
        const d = pending.temp_data;
        await createTransaction({ userId: user.id, type: d.type, montant: d.montant, libelle: d.libelle, categorie: d.categorie, date: d.date || today });
        await confirmPendingValidation(validation_id);
        return NextResponse.json({ reply: `✅ *Enregistré !*\n${d.type === 'RECETTE' ? '💰' : '💸'} *${d.libelle}* — ${fcfa(d.montant)}` });
      }
    }

    if (!message && !audio_url) return NextResponse.json({ reply: 'Envoie une opération en texte ou vocal 🎤' });
    if (audio_url && !isPremium) return NextResponse.json({ reply: `🎙️ Saisie vocale réservée aux abonnés *Premium*.\nUpgrade : ${process.env.NEXT_PUBLIC_APP_URL}/pricing` });

    let parsed;
    try { parsed = audio_url ? await parseAudioWithGemini(audio_url) : await parseTextWithGemini(message); }
    catch { return NextResponse.json({ reply: '🤖 Message non compris. Ex: *vendu riz 15000* ou *bind légumes 8500*' }); }

    if (parsed.error === 'NON_COMPTABLE') return NextResponse.json({ reply: 'ℹ️ Envoie une opération:\n• *vendu X pour Y FCFA*\n• *acheté X à Y FCFA*' });

    const { type, montant, libelle, categorie, date, confiance } = parsed;

    if (isPremium) {
      const pendingId = await createPendingValidation(user.id, { type, montant, libelle, categorie, date: date || today });
      const warn = confiance !== 'HAUTE' ? ` ⚠️ (confiance: ${confiance})` : '';
      return NextResponse.json({
        reply: `${type === 'RECETTE' ? '💰' : '💸'} *Confirmer ?*${warn}\n\nType : *${type}*\nMontant : *${fcfa(montant)}*\nLibellé : ${libelle}\nDate : ${date || today}\n\n👉 Réponds *OUI* ou *NON*`,
        requires_confirmation: true, validation_id: pendingId,
      });
    }

    await createTransaction({ userId: user.id, type, montant, libelle, categorie, date: date || today });
    return NextResponse.json({
      reply: `✅ *Enregistré !*\n${type === 'RECETTE' ? '💰' : '💸'} *${libelle}*\n${fcfa(montant)} · ${categorie}\n\n_Dashboard : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard_`,
    });
  } catch (err) {
    console.error('[Webhook error]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
