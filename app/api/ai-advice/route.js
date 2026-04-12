// app/api/ai-advice/route.js
import { NextResponse } from 'next/server';
import { getRecentTransactions, getKPIs } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

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
        action: "Envoyez votre première transaction sur WhatsApp",
      }],
      score_sante: null,
      resume: "Données insuffisantes pour l'analyse.",
    });
  }

  // Construire le contexte
  const depensesParCat = transactions
    .filter(t => t.type === 'DEPENSE')
    .reduce((acc, t) => {
      acc[t.categorie] = (acc[t.categorie] || 0) + Number(t.montant);
      return acc;
    }, {});

  const context = `
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

DÉPENSES PAR CATÉGORIE :
${Object.entries(depensesParCat)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, total]) => `- ${cat} : ${total.toLocaleString()} FCFA`)
  .join('\n')}`;

  // Appeler Hostinger (qui appelle l'IA)
  const webhookUrl = process.env.WEBHOOK_URL;
  const secret     = process.env.WEBHOOK_SECRET;

  if (!webhookUrl) {
    return NextResponse.json({ error: 'Service IA non configuré' }, { status: 500 });
  }

  try {
    const res  = await fetch(`${webhookUrl}/advice.php`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret':     secret,
      },
      body: JSON.stringify({ context }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[AI Advice] Hostinger error:', err);
      return NextResponse.json({ error: 'Erreur du service IA' }, { status: 500 });
    }

    const advice = await res.json();
    return NextResponse.json(advice);

  } catch (err) {
    console.error('[AI Advice] Fetch error:', err.message);
    return NextResponse.json({ error: 'Service IA indisponible' }, { status: 500 });
  }
}
