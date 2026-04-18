// app/api/checkout/route.js
import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { upsertUser } from '@/lib/db';

const PLANS = {
  STANDARD: { label: 'SenCompta Standard — 1 mois', amount: 10000, duration: 1 },
  PREMIUM:  { label: 'SenCompta Premium — 1 mois',  amount: 15000, duration: 1 },
};

export async function POST(req) {
  const body = await req.json();
  const { plan, phone } = body;

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
  }

  // Récupérer l'utilisateur connecté OU créer depuis le numéro fourni
  let user = await getUserFromSession(req);

  if (!user && phone) {
    // Nouveau client — créer le compte depuis le numéro
    const { getUser, upsertUser: upsert } = await import('@/lib/db');
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    user = await upsert(normalizedPhone);
  }

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const ref     = `SC-${user.id}-${plan}-${Date.now()}`;
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL;

  const payload = {
    item_name:    selectedPlan.label,
    item_price:   selectedPlan.amount,
    currency:     'XOF',
    ref_command:  ref,
    command_name: `Abonnement ${plan} SenCompta IA`,
    env:          'prod',
    ipn_url:      `${appUrl}/api/callback/payment`,
    success_url:  `${appUrl}/dashboard?payment=success`,
    cancel_url:   `${appUrl}/pricing?payment=cancelled`,
    custom_field: JSON.stringify({ user_id: user.id, plan, duration: selectedPlan.duration }),
  };

  // Passer par Hostinger pour contourner la restriction Vercel
  const webhookUrl = process.env.WEBHOOK_URL;
  const secret     = process.env.WEBHOOK_SECRET;

  if (!webhookUrl) {
    return NextResponse.json({ error: 'Service de paiement non configuré' }, { status: 500 });
  }

  try {
    const resp = await fetch(`${webhookUrl}/checkout.php`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret':     secret,
      },
      body: JSON.stringify({
        payload,
        api_key:    process.env.PAYTECH_API_KEY,
        api_secret: process.env.PAYTECH_API_SECRET,
      }),
    });

    const data = await resp.json();

    if (data.success !== 1) {
      console.error('[PayTech error]', data);
      return NextResponse.json({ error: 'Erreur paiement', detail: data }, { status: 502 });
    }

    return NextResponse.json({ redirect_url: data.redirect_url });

  } catch (err) {
    console.error('[Checkout error]', err.message);
    return NextResponse.json({ error: 'Service indisponible' }, { status: 500 });
  }
}
