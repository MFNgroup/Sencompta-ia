// app/api/webhook/whatsapp/route.js
// Webhook WhatsApp — reçoit les messages, interprète via Gemini, sauvegarde en base

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  getUser, upsertUser, createTransaction,
  getRecentTransactions, getKPIs, getKPIsForDate,
  createDebt, getDebts, markDebtPaid,
  createPendingValidation, getPendingValidation,
  confirmPendingValidation, cancelPendingValidation,
} from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Catégories reconnues ──────────────────────────────────────
const CATEGORIES = {
  RECETTE: [
    'Vente marchandises', 'Vente services', 'Prestation', 'Acompte client',
    'Remboursement reçu', 'Autre recette',
  ],
  DEPENSE: [
    'Achat marchandises', 'Transport', 'Loyer', 'Électricité / Eau',
    'Salaires', 'Téléphone / Internet', 'Emballages', 'Publicité',
    'Taxes / Impôts', 'Entretien / Réparation', 'Alimentation',
    'Fournitures bureau', 'Frais bancaires', 'Autre dépense',
  ],
};

// ── System prompt principal ───────────────────────────────────
const SYSTEM_PROMPT = `Tu es SenCompta IA, l'assistant comptable intelligent de SenCompta — une plateforme de gestion financière pour les commerçants sénégalais. Tu communiques exclusivement via WhatsApp.

PERSONNALITÉ :
- Tu es comme un ami de confiance, un bon collègue qui s'y connaît en comptabilité
- Chaleureux, bienveillant, direct et spontané
- Tu tutoies l'utilisateur naturellement
- Tu es parfaitement bilingue français-wolof — tu réponds dans la langue du message ou en mélange naturel (franwolof)
- Tu utilises librement les expressions wolof, les tournures locales, les blagues douces pour créer de la proximité
- Tu peux dire "waaw", "dëkk", "naka nga def", "bu baax na", "yëgël na" naturellement
- Tu es précis sur les chiffres, jamais vague

RÔLE STRICT :
- Tu enregistres les transactions comptables (recettes, dépenses, créances)
- Tu fournis des analyses basées UNIQUEMENT sur les données réelles fournies dans le contexte
- Tu NE génères JAMAIS de chiffres inventés — si tu n'as pas la donnée, tu le dis clairement
- Tu NE fais PAS de conseil juridique, fiscal officiel ou médical
- Pour les conseils financiers importants, tu rappelles que tu es un assistant automatisé

COMMANDES QUE TU DOIS RECONNAÎTRE :
1. TRANSACTION RECETTE — "vendu", "reçu", "encaissé", "yëgël", "jaay", "bind", "dëkk"
   Exemples : "vendu tissus 25000", "jaay dëkk bi 15000", "yëgël na 8000 ci muñ bi"

2. TRANSACTION DÉPENSE — "payé", "acheté", "dépensé", "dëkk", "jënd", "fey"
   Exemples : "payé transport 3500", "jënd stock 45000", "fey loyer 60000"

3. CRÉANCE — "doit", "crédit", "dette", "bokk", "jox crédit"
   Exemples : "Amadou me doit 20000", "jox crédit Fatou 15000"

4. BILAN — "solde", "bilan", "combien", "naka", "résumé", "nit"
   Périodes reconnues :
   - Aujourd'hui / Today / Bés bi / Jours : → periode: "TODAY"
   - Cette semaine / Semaine / Ayi domm : → periode: "7"
   - Ce mois / Mois / Lewél bi : → periode: "30"
   - Cette année / Année / Ané bi : → periode: "365"
   Exemples : "bilan du jour", "solde ce mois", "naka lewél bi", "combien cette année"

5. HISTORIQUE — "historique", "liste", "transactions", "dernier", "bés yi"
   Exemples : "mes dernières transactions", "historique semaine", "bés yi"

6. CRÉANCES EN COURS — "mes dettes", "qui me doit", "créances", "crédit yi"

7. AIDE — "aide", "help", "comment", "naka"

FORMAT DE RÉPONSE (JSON strict, aucun texte avant ou après) :
{
  "intent": "TRANSACTION" | "BILAN" | "HISTORIQUE" | "DETTES" | "ANNULER" | "INCONNU" | "SALUTATION" | "AIDE",
  "transaction": {
    "type": "RECETTE" | "DEPENSE",
    "montant": number,
    "libelle": "string",
    "categorie": "string",
    "date": "YYYY-MM-DD"
  },
  "dette": {
    "clientName": "string",
    "amount": number,
    "description": "string"
  },
  "periode": "TODAY" | "7" | "30" | "365",
  "message_utilisateur": "string (réponse chaleureuse à envoyer à l'utilisateur)",
  "needs_confirmation": boolean,
  "langue_detectee": "fr" | "wo" | "mix"
}

RÈGLES IMPORTANTES :
- Si le montant est ambigu ou manquant → needs_confirmation: true, demande clarification dans message_utilisateur
- Si l'intent est INCONNU → redirige poliment vers les fonctions comptables
- Pour BILAN → génère un résumé clair basé sur les données fournies dans le contexte
- Pour les catégories, choisis parmi : ${[...CATEGORIES.RECETTE, ...CATEGORIES.DEPENSE].join(', ')}
- Ne JAMAIS inventer des chiffres — si tu n'as pas les données, dis-le clairement
- Rappel légal si conseil financier important : "Je suis un assistant automatisé, consulte un expert-comptable agréé pour les décisions importantes."`;

// ── Envoyer un message WhatsApp ───────────────────────────────
async function sendWhatsAppMessage(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token         = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    console.log('[WhatsApp] Variables manquantes — message non envoyé:', message);
    return;
  }

  await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message },
      }),
    }
  );
}

// ── Construire le contexte utilisateur pour Gemini ────────────
async function buildUserContext(userId) {
  const [transactions, kpis, debts] = await Promise.all([
    getRecentTransactions(userId, 30),
    getKPIs(userId, 30),
    getDebts(userId),
  ]);

  const lastTx = transactions.slice(0, 5).map(t =>
    `${t.date} | ${t.type} | ${t.montant.toLocaleString('fr-SN')} FCFA | ${t.libelle}`
  ).join('\n');

  const debtsActives = debts.filter(d => d.status === 'PENDING');

  return `CONTEXTE FINANCIER (30 derniers jours) :
CA : ${kpis.ca.toLocaleString('fr-SN')} FCFA
Charges : ${kpis.charges.toLocaleString('fr-SN')} FCFA
Net : ${kpis.net.toLocaleString('fr-SN')} FCFA

DERNIÈRES TRANSACTIONS :
${lastTx || 'Aucune transaction récente'}

CRÉANCES ACTIVES : ${debtsActives.length} client(s) doivent un total de ${
    debtsActives.reduce((s, d) => s + Number(d.amount), 0).toLocaleString('fr-SN')
  } FCFA`;
}

// ── Traiter un message entrant ────────────────────────────────
async function processMessage(phone, messageText) {
  // Normaliser le numéro (WhatsApp envoie sans +)
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  // Récupérer ou créer l'utilisateur
  let user = await getUser(normalizedPhone);
  if (!user) {
    user = await upsertUser(normalizedPhone);
    await sendWhatsAppMessage(phone,
      `👋 Bienvenue sur SenCompta IA !\n\nJe suis ton assistant comptable intelligent. Pour commencer, abonne-toi sur ${process.env.NEXT_PUBLIC_APP_URL}/pricing\n\nUne fois abonné, tu pourras enregistrer tes recettes et dépenses directement ici ! 💼`
    );
    return;
  }

  // Vérifier l'abonnement
  const isActive = user.subscription_expiry && new Date(user.subscription_expiry) > new Date();
  if (!isActive) {
    await sendWhatsAppMessage(phone,
      `⏰ Ton abonnement SenCompta IA est expiré ou inactif.\n\nRenouvelle-le ici : ${process.env.NEXT_PUBLIC_APP_URL}/pricing\n\nPas d'abonnement ? Choisis ton plan et reviens ! 🙏`
    );
    return;
  }

  // Construire le contexte et appeler Gemini
  const userContext = await buildUserContext(user.id);

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `${SYSTEM_PROMPT}

${userContext}

Message de l'utilisateur : "${messageText}"
Date du jour : ${new Date().toISOString().slice(0, 10)}

Réponds UNIQUEMENT en JSON valide.`;

  let parsed;
  try {
    const result   = await model.generateContent(prompt);
    const rawText  = result.response.text().trim();
    const cleaned  = rawText.replace(/```json|```/g, '').trim();
    parsed         = JSON.parse(cleaned);
  } catch (err) {
    console.error('[Gemini parse error]', err);
    await sendWhatsAppMessage(phone,
      "Désolé, je n'ai pas bien compris. Essaie par exemple :\n• \"vendu tissus 25000\"\n• \"payé transport 3500\"\n• \"mon solde\""
    );
    return;
  }

  const { intent, transaction, dette, message_utilisateur, needs_confirmation, periode } = parsed;

  // ── Gérer les intents ────────────────────────────────────────
  switch (intent) {

    case 'TRANSACTION': {
      if (!transaction || !transaction.montant || !transaction.type) {
        await sendWhatsAppMessage(phone, message_utilisateur || "Je n'ai pas bien compris le montant. Peux-tu préciser ?");
        return;
      }

      if (needs_confirmation) {
        const pendingId = await createPendingValidation(user.id, transaction);
        await sendWhatsAppMessage(phone,
          `${message_utilisateur}\n\nConfirme avec *OUI* ou annule avec *NON* (réf: ${pendingId})`
        );
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

      await sendWhatsAppMessage(phone, message_utilisateur);
      break;
    }

    case 'DETTES': {
      if (dette?.clientName && dette?.amount) {
        await createDebt({
          userId:      user.id,
          clientName:  dette.clientName,
          amount:      dette.amount,
          description: dette.description || '',
        });
        await sendWhatsAppMessage(phone, message_utilisateur);
      } else {
        // Lister les dettes
        const debts       = await getDebts(user.id);
        const actives     = debts.filter(d => d.status === 'PENDING');
        if (actives.length === 0) {
          await sendWhatsAppMessage(phone, "✅ Aucune créance active en ce moment. Bonne nouvelle !");
        } else {
          const list = actives.map((d, i) =>
            `${i + 1}. ${d.client_name} — ${Number(d.amount).toLocaleString('fr-SN')} FCFA`
          ).join('\n');
          const total = actives.reduce((s, d) => s + Number(d.amount), 0);
          await sendWhatsAppMessage(phone,
            `📋 *Créances actives (${actives.length})* :\n\n${list}\n\n*Total : ${total.toLocaleString('fr-SN')} FCFA*`
          );
        }
      }
      break;
    }

    case 'BILAN': {
      let kpis, periode_label;

      if (periode === 'TODAY') {
        // Bilan du jour — requête spéciale sur la date du jour
        const today = new Date().toISOString().slice(0, 10);
        kpis = await getKPIsForDate(user.id, today);
        periode_label = "aujourd'hui";
      } else {
        const days = parseInt(periode || '30');
        kpis = await getKPIs(user.id, days);
        periode_label =
          days === 7   ? '7 derniers jours' :
          days === 365 ? "cette année" :
                         'ce mois';
      }

      const emoji = kpis.net >= 0 ? '✅' : '⚠️';
      await sendWhatsAppMessage(phone,
        `📊 *Bilan — ${periode_label}*\n\n` +
        `💚 Recettes : *${kpis.ca.toLocaleString('fr-SN')} FCFA*\n` +
        `🔴 Dépenses : *${kpis.charges.toLocaleString('fr-SN')} FCFA*\n` +
        `━━━━━━━━━━━━━━\n` +
        `${emoji} Net : *${kpis.net.toLocaleString('fr-SN')} FCFA*\n\n` +
        `_Dashboard complet : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard_`
      );
      break;
    }

    case 'HISTORIQUE': {
      const days = parseInt(periode || '30');
      const txs  = await getRecentTransactions(user.id, days);
      if (txs.length === 0) {
        await sendWhatsAppMessage(phone, "📭 Aucune transaction enregistrée sur cette période.");
        return;
      }
      const list = txs.slice(0, 8).map(t =>
        `${t.type === 'RECETTE' ? '💚' : '🔴'} ${t.date} | ${Number(t.montant).toLocaleString('fr-SN')} FCFA | ${t.libelle}`
      ).join('\n');
      await sendWhatsAppMessage(phone,
        `📋 *${txs.length} transaction(s)* :\n\n${list}${txs.length > 8 ? `\n\n_...et ${txs.length - 8} autres sur ton dashboard_` : ''}`
      );
      break;
    }

    case 'SALUTATION': {
      const kpis = await getKPIs(user.id, 30);
      await sendWhatsAppMessage(phone,
        `Bonjour ! 👋 Je suis SenCompta IA, ton assistant comptable.\n\n` +
        `📊 Ce mois-ci : *${kpis.ca.toLocaleString('fr-SN')} FCFA* de recettes\n\n` +
        `Que puis-je enregistrer pour toi ?\n` +
        `• Une recette → "vendu [article] [montant]"\n` +
        `• Une dépense → "payé [article] [montant]"\n` +
        `• Ton bilan → "mon solde"`
      );
      break;
    }

    case 'AIDE': {
      await sendWhatsAppMessage(phone,
        `🤖 *SenCompta IA — Guide rapide*\n\n` +
        `*Enregistrer une recette :*\n"vendu tissus 25 000"\n\n` +
        `*Enregistrer une dépense :*\n"payé transport 3 500"\n\n` +
        `*Créance client :*\n"Amadou me doit 20 000"\n\n` +
        `*Voir le bilan :*\n"mon solde" ou "bilan du mois"\n\n` +
        `*Historique :*\n"mes dernières transactions"\n\n` +
        `_Je comprends le français et le wolof_ 🇸🇳\n\n` +
        `⚠️ Je suis un assistant automatisé — pour les décisions importantes, consulte un expert-comptable agréé.`
      );
      break;
    }

    case 'INCONNU':
    default: {
      await sendWhatsAppMessage(phone,
        message_utilisateur ||
        `Je suis SenCompta IA, spécialisé dans la comptabilité de ta boutique 📚\n\n` +
        `Je peux enregistrer tes recettes, dépenses et créances.\n` +
        `Tape *aide* pour voir comment je fonctionne.`
      );
    }
  }
}

// ── GET — Vérification du webhook Meta ───────────────────────
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// ── POST — Réception des messages ────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();

    // Sécurité : vérifier que c'est bien WhatsApp
    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    const entry    = body.entry?.[0];
    const change   = entry?.changes?.[0];
    const value    = change?.value;
    const messages = value?.messages;

    if (!messages?.length) {
      // Accusé de lecture ou statut — on ignore
      return NextResponse.json({ status: 'ok' });
    }

    const message = messages[0];
    const phone   = message.from;
    const type    = message.type;

    // On traite uniquement les messages texte pour l'instant
    if (type !== 'text') {
      await sendWhatsAppMessage(phone,
        "Pour l'instant je traite uniquement les messages texte. Écris-moi ta transaction en texte 📝"
      );
      return NextResponse.json({ status: 'ok' });
    }

    const text = message.text?.body?.trim();
    if (!text) return NextResponse.json({ status: 'ok' });

    // Traitement asynchrone — on répond 200 immédiatement à Meta
    processMessage(phone, text).catch(err =>
      console.error('[Webhook processMessage error]', err)
    );

    return NextResponse.json({ status: 'ok' });

  } catch (err) {
    console.error('[Webhook POST error]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
