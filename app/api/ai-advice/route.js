// app/api/ai-advice/route.js
// Analyse les transactions et génère 3 conseils stratégiques (Premium)

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getRecentTransactions, getKPIs } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const COACH_PROMPT = `Tu es un conseiller financier expert pour les commerçants africains (Sénégal).
Analyse les données comptables fournies et génère exactement 3 conseils stratégiques personnalisés.

RÈGLES :
- Conseils concrets, actionnables, adaptés au contexte sénégalais
- Utilise des références culturelles pertinentes si approprié
- Mentionne des montants précis basés sur les données
- Évite le jargon financier trop technique
- Ton encourageant mais direct

FORMAT DE RÉPONSE : JSON uniquement, aucun texte avant/après.
{
  "conseils": [
    {
      "titre": "Titre court du conseil",
      "description": "Conseil détaillé en 2-3 phrases",
      "impact": "ÉLEVÉ" | "MOYEN" | "FAIBLE",
      "emoji": "🎯"
    },
    { ... },
    { ... }
  ],
  "score_sante": 85,
  "resume": "Une phrase résumant la santé financière de l'entreprise"
}`;

export async function GET(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  if (user.plan !== 'PREMIUM') {
    return NextResponse.json(
      { error: 'Fonctionnalité réservée aux abonnés Premium' },
      { status: 403 }
    );
  }

  const [transactions, kpis] = await Promise.all([
    getRecentTransactions(user.id, 30),
    getKPIs(user.id, 30),
  ]);

  if (transactions.length < 3) {
    return NextResponse.json({
      conseils: [{
        titre: "Commencez à enregistrer vos opérations",
        description: "Vous n'avez pas encore assez de données pour une analyse complète. Enregistrez vos ventes et dépenses via WhatsApp chaque jour pour obtenir des conseils personnalisés.",
        impact: "ÉLEVÉ",
        emoji: "📝",
      }],
      score_sante: null,
      resume: "Données insuffisantes pour l'analyse.",
    });
  }

  const dataContext = `
Boutique : ${user.boutique_name}
Période : 30 derniers jours

INDICATEURS :
- Chiffre d'affaires : ${kpis.ca.toLocaleString('fr-SN')} FCFA
- Charges totales : ${kpis.charges.toLocaleString('fr-SN')} FCFA
- Résultat net : ${kpis.net.toLocaleString('fr-SN')} FCFA
- Marge nette : ${kpis.ca > 0 ? ((kpis.net / kpis.ca) * 100).toFixed(1) : 0}%

DERNIÈRES TRANSACTIONS (${transactions.length}) :
${transactions.slice(0, 20).map(t =>
  `[${t.date}] ${t.type} | ${t.montant.toLocaleString()} FCFA | ${t.libelle} | ${t.categorie}`
).join('\n')}

RÉPARTITION DES DÉPENSES PAR CATÉGORIE :
${Object.entries(
  transactions
    .filter(t => t.type === 'DEPENSE')
    .reduce((acc, t) => {
      acc[t.categorie] = (acc[t.categorie] || 0) + Number(t.montant);
      return acc;
    }, {})
)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, total]) => `- ${cat} : ${total.toLocaleString()} FCFA`)
  .join('\n')}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent({
    systemInstruction: COACH_PROMPT,
    contents: [{ role: 'user', parts: [{ text: dataContext }] }],
  });

  const raw = result.response.text().trim().replace(/```json\n?|```/g, '').trim();
  const advice = JSON.parse(raw);

  return NextResponse.json(advice);
}
