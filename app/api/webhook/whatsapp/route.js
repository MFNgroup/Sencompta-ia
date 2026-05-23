// app/api/webhook/whatsapp/route.js — SenCompta IA v2
// Corrections : gemini-2.5-flash + plan FREE (20 tx/mois, WhatsApp uniquement)

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getUser, upsertUser, createTransaction,
  getRecentTransactions, getKPIs, getKPIsForDate,
  createDebt, getDebts, markDebtPaid,
  createPendingValidation,
  isSubscriptionActive, getMonthlyTxCount, PLAN_LIMITS,
} from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CATEGORIES = {
  RECETTE: ['Vente marchandises','Vente services','Prestation','Acompte client','Remboursement reçu','Autre recette'],
  DEPENSE: ['Achat marchandises','Transport','Loyer','Électricité / Eau','Salaires','Téléphone / Internet','Emballages','Publicité','Taxes / Impôts','Entretien / Réparation','Alimentation','Fournitures bureau','Frais bancaires','Autre dépense'],
};

const SYSTEM_PROMPT = `Tu es SenCompta IA, l'assistant comptable intelligent de SenCompta — une plateforme de gestion financière pour les commerçants sénégalais. Tu communiques exclusivement via WhatsApp.

PERSONNALITÉ :
- Tu es comme un ami de confiance, un bon collègue qui s'y connaît en comptabilité
- Chaleureux, bienveillant, direct et spontané
- Tu tutoies l'utilisateur naturellement
- Tu es parfaitement bilingue français-wolof — tu réponds dans la langue du message ou en mélange naturel (franwolof)
- Tu utilises librement les expressions wolof : "waaw", "dëkk", "naka nga def", "bu baax na", "yëgël na"
- Tu es précis sur les chiffres, jamais vague

RÔLE STRICT :
- Tu enregistres les transactions comptables (recettes, dépenses, créances)
- Tu fournis des analyses basées UNIQUEMENT sur les données réelles fournies dans le contexte
- Tu NE génères JAMAIS de chiffres inventés
- Tu NE fais PAS de conseil juridique, fiscal officiel ou médical

COMMANDES RECONNUES :
1. RECETTE — "vendu", "reçu", "encaissé", "yëgël", "jaay", "bind"
2. DÉPENSE — "payé", "acheté", "dépensé", "jënd", "fey"
3. CRÉANCE — "doit", "crédit", "bokk", "jox crédit"
4. BILAN — "solde", "bilan", "combien", "naka", "résumé" | Périodes : TODAY, 7, 30, 365
5. HISTORIQUE — "historique", "liste", "transactions"
6. CRÉANCES — "mes dettes", "qui me doit"
7. AIDE — "aide", "help", "comment"

FORMAT DE RÉPONSE (JSON strict, aucun texte avant ou après) :
{
  "intent": "TRANSACTION" | "BILAN" | "HISTORIQUE" | "DETTES" | "ANNULER" | "INCONNU" | "SALUTATION" | "AIDE",
  "transaction": { "type": "RECETTE" | "DEPENSE", "montant": number, "libelle": "string", "categorie": "string", "date": "YYYY-MM-DD" },
  "dette": { "clientName": "string", "amount": number, "description": "string" },
  "periode": "TODAY" | "7" | "30" | "365",
  "message_utilisateur": "string",
  "needs_confirmation": boolean,
  "langue_detectee": "fr" | "wo" | "mix"
}

RÈGLES :
- Montant ambigu → needs_confirmation: true
- Intent INCONNU → redirige vers fonctions comptables
- Catégories disponibles : ${[...CATEGORIES.RECETTE, ...CATEGORIES.DEPENSE].join(', ')}
- Ne JAMAIS inventer des chiffres`;

async function sendWhatsAppMessage(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!accountSid || !authToken) {
    console.log('[Twilio] Variables manquantes — message simulé:', message);
    return;
  }

  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+' + to}`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
          To:   toFormatted,
          Body: message,
        }),
      }
    );
    if (!res.ok) {
      const err = await res.text();
      console.error('[Twilio] Send error:', err);
    }
  } catch (err) {
    console.error('[Twilio] Fetch error:', err);
  }
}

async function buildUserContext(userId) {
  const [transactions, kpis, debts] = await Promise.all([
    getRecentTransactions(userId, 30),
    getKPIs(userId, 30),
    getDebts(userId),
  ]);

  const lastTx = transactions.slice(0, 5).map(t =>
    `${t.date} | ${t.type} | ${Number(t.montant).toLocaleString('fr-SN')} FCFA | ${t.libelle}`
  ).join('\n');

  const debtsActives = debts.filter(d => d.status === 'PENDING' || d.status === 'UNPAID');

  return `CONTEXTE FINANCIER (30 derniers jours) :
CA : ${kpis.ca.toLocaleString('fr-SN')} FCFA
Charges : ${kpis.charges.toLocaleString('fr-SN')} FCFA
Net : ${kpis.net.toLocaleString('fr-SN')} FCFA

DERNIÈRES TRANSACTIONS :
${lastTx || 'Aucune transaction récente'}

CRÉANCES ACTIVES : ${debtsActives.length} client(s) — Total : ${
    debtsActives.reduce((s, d) => s + Number(d.amount), 0).toLocaleString('fr-SN')
  } FCFA`;
}

async function processMessage(phone, messageText) {
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  // ── Upsert user (toujours FREE par défaut) ────────────────
  let user = await getUser(normalizedPhone);
  if (!user) {
    user = await upsertUser(normalizedPhone);
    await sendWhatsAppMessage(phone,
      `Bienvenue sur *SenCompta IA* !\n\nJe suis ton assistant comptable. Tu es sur le *plan gratuit* — 20 transactions/mois via WhatsApp.\n\nCommence maintenant :\n- "vendu tissus 25 000"\n- "payé transport 3 500"\n- "mon solde"\n\nPour le dashboard, factures et plus : ${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    );
    return;
  }

  // ── Vérifier accès ────────────────────────────────────────
  if (!isSubscriptionActive(user)) {
    await sendWhatsAppMessage(phone,
      `Ton abonnement SenCompta IA est expiré.\n\nRenouvelle ici : ${process.env.NEXT_PUBLIC_APP_URL}/pricing`
    );
    return;
  }

  // ── Vérifier limite mensuelle (plan FREE) ─────────────────
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE;

  const userContext = await buildUserContext(user.id);

  // ── IA : Gemini 2.5 Flash ─────────────────────────────────
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `${SYSTEM_PROMPT}\n\n${userContext}\n\nMessage : "${messageText}"\nDate : ${new Date().toISOString().slice(0, 10)}\n\nRéponds UNIQUEMENT en JSON valide.`;

  let parsed;
  try {
    const result  = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const cleaned = rawText.replace(/```json|```/g, '').trim();
    parsed        = JSON.parse(cleaned);
  } catch (err) {
    console.error('[Gemini parse error]', err);
    await sendWhatsAppMessage(phone,
      "Je n'ai pas bien compris. Essaie :\n- \"vendu tissus 25000\"\n- \"payé transport 3500\"\n- \"mon solde\""
    );
    return;
  }

  const { intent, transaction, dette, message_utilisateur, needs_confirmation, periode } = parsed;

  switch (intent) {
    case 'TRANSACTION': {
      if (!transaction?.montant || !transaction?.type) {
        await sendWhatsAppMessage(phone, message_utilisateur || "Je n'ai pas compris le montant. Peux-tu préciser ?");
        return;
      }

      // Vérifier limite FREE avant d'enregistrer
      if (limits.txPerMonth !== Infinity) {
        const monthCount = await getMonthlyTxCount(user.id);
        if (monthCount >= limits.txPerMonth) {
          await sendWhatsAppMessage(phone,
            `Tu as utilisé tes 20 transactions gratuites ce mois.\n\nPasse au plan Standard pour continuer sans limite + accès dashboard, factures, créances : ${process.env.NEXT_PUBLIC_APP_URL}/pricing`
          );
          return;
        }
      }

      if (needs_confirmation) {
        const pendingId = await createPendingValidation(user.id, transaction);
        await sendWhatsAppMessage(phone, `${message_utilisateur}\n\nConfirme avec OUI ou annule avec NON (réf: ${pendingId})`);
        return;
      }
      await createTransaction({
        userId:    user.id,
        type:      transaction.type,
        montant:   transaction.montant,
        libelle:   transaction.libelle || messageText,
        categorie: transaction.categorie || (transaction.type === 'RECETTE' ? 'Autre recette' : 'Autre dépense'),
        source:    'WHATSAPP',
        date:      transaction.date || new Date().toISOString().slice(0, 10),
      });

      // Avertissement proche de la limite FREE
      if (limits.txPerMonth !== Infinity) {
        const newCount = await getMonthlyTxCount(user.id);
        const remaining = limits.txPerMonth - newCount;
        let suffix = '';
        if (remaining <= 3) {
          suffix = `\n\n_Il te reste ${remaining} transaction(s) gratuites ce mois. Passe au Standard : ${process.env.NEXT_PUBLIC_APP_URL}/pricing_`;
        }
        await sendWhatsAppMessage(phone, message_utilisateur + suffix);
      } else {
        await sendWhatsAppMessage(phone, message_utilisateur);
      }
      break;
    }

    case 'DETTES': {
      if (dette?.clientName && dette?.amount) {
        await createDebt({ userId: user.id, clientName: dette.clientName, amount: dette.amount, description: dette.description || '' });
        await sendWhatsAppMessage(phone, message_utilisateur);
      } else {
        const debts   = await getDebts(user.id);
        const actives = debts.filter(d => d.status === 'PENDING' || d.status === 'UNPAID');
        if (actives.length === 0) {
          await sendWhatsAppMessage(phone, "Aucune créance active en ce moment. Bonne nouvelle !");
        } else {
          const list  = actives.map((d, i) => `${i+1}. ${d.client_name} — ${Number(d.amount).toLocaleString('fr-SN')} FCFA`).join('\n');
          const total = actives.reduce((s, d) => s + Number(d.amount), 0);
          await sendWhatsAppMessage(phone, `Créances actives (${actives.length}) :\n\n${list}\n\nTotal : ${total.toLocaleString('fr-SN')} FCFA`);
        }
      }
      break;
    }

    case 'BILAN': {
      let kpis, periode_label;
      if (periode === 'TODAY') {
        const today = new Date().toISOString().slice(0, 10);
        kpis = await getKPIsForDate(user.id, today);
        periode_label = "aujourd'hui";
      } else {
        const days = parseInt(periode || '30');
        kpis = await getKPIs(user.id, days);
        periode_label = days === 7 ? '7 derniers jours' : days === 365 ? "cette année" : 'ce mois';
      }
      await sendWhatsAppMessage(phone,
        `*Bilan — ${periode_label}*\n\n` +
        `Recettes : ${kpis.ca.toLocaleString('fr-SN')} FCFA\n` +
        `Dépenses : ${kpis.charges.toLocaleString('fr-SN')} FCFA\n` +
        `Net : ${kpis.net >= 0 ? '+' : ''}${kpis.net.toLocaleString('fr-SN')} FCFA\n\n` +
        `Dashboard : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      );
      break;
    }

    case 'HISTORIQUE': {
      const days = parseInt(periode || '30');
      const txs  = await getRecentTransactions(user.id, days);
      if (txs.length === 0) {
        await sendWhatsAppMessage(phone, "Aucune transaction sur cette période.");
        return;
      }
      const list = txs.slice(0, 8).map(t =>
        `${t.type === 'RECETTE' ? '+' : '-'} ${t.date} | ${Number(t.montant).toLocaleString('fr-SN')} FCFA | ${t.libelle}`
      ).join('\n');
      await sendWhatsAppMessage(phone,
        `${txs.length} transaction(s) :\n\n${list}${txs.length > 8 ? `\n\n...et ${txs.length - 8} autres sur ton dashboard` : ''}`
      );
      break;
    }

    case 'SALUTATION': {
      const kpis = await getKPIs(user.id, 30);
      const planMsg = user.plan === 'FREE'
        ? `\n\n_Plan gratuit : 20 transactions/mois via WhatsApp.\nDashboard & factures : ${process.env.NEXT_PUBLIC_APP_URL}/pricing_`
        : '';
      await sendWhatsAppMessage(phone,
        `Bonjour ! Je suis SenCompta IA, ton assistant comptable.\n\n` +
        `Ce mois-ci : *${kpis.ca.toLocaleString('fr-SN')} FCFA* de recettes\n\n` +
        `Que puis-je enregistrer ?\n- Une recette : "vendu [article] [montant]"\n- Une dépense : "payé [article] [montant]"\n- Ton bilan : "mon solde"` +
        planMsg
      );
      break;
    }

    case 'AIDE': {
      await sendWhatsAppMessage(phone,
        `*SenCompta IA — Guide rapide*\n\n` +
        `Recette : "vendu tissus 25 000"\n` +
        `Dépense : "payé transport 3 500"\n` +
        `Créance : "Amadou me doit 20 000"\n` +
        `Bilan : "mon solde" ou "bilan du mois"\n` +
        `Historique : "mes dernières transactions"\n\n` +
        `Je comprends le français et le wolof.\n` +
        `Dashboard : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      );
      break;
    }

    default: {
      await sendWhatsAppMessage(phone,
        message_utilisateur ||
        `Je suis SenCompta IA, spécialisé en comptabilité.\nTape "aide" pour voir comment je fonctionne.`
      );
    }
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('OK', { status: 200 });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const body     = formData.get('Body')?.trim();
    const from     = formData.get('From')?.replace('whatsapp:', '') || '';

    if (!body || !from) {
      return new Response('', { status: 200 });
    }

    processMessage(from, body).catch(err =>
      console.error('[Webhook processMessage error]', err)
    );

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } }
    );
  } catch (err) {
    console.error('[Webhook POST error]', err);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      { status: 200, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
