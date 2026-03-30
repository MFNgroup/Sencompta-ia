// app/api/checkout/route.js
// Initialise un paiement PayTech.sn

import { NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';

const PAYTECH_BASE = 'https://paytech.sn/api/payment/request-payment';

export async function POST(req) {
  const user = await getUserFromSession(req);
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { plan } = await req.json();

  const PLANS = {
    STANDARD: { label: 'SenCompta Standard — 1 mois', amount: 3000, duration: 1 },
    PREMIUM:  { label: 'SenCompta Premium — 1 mois',  amount: 7500, duration: 1 },
  };

  const selectedPlan = PLANS[plan];
  if (!selectedPlan) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
  }

  const ref = `SC-${user.id}-${plan}-${Date.now()}`;

  const payload = {
    item_name:    selectedPlan.label,
    item_price:   selectedPlan.amount,
    currency:     'XOF',
    ref_command:  ref,
    command_name: `Abonnement ${plan} SenCompta`,
    env:          process.env.NODE_ENV === 'production' ? 'prod' : 'test',
    ipn_url:      `${process.env.NEXT_PUBLIC_APP_URL}/api/callback/payment`,
    success_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
    cancel_url:   `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
    custom_field: JSON.stringify({ user_id: user.id, plan, duration: selectedPlan.duration }),
  };

  const resp = await fetch(PAYTECH_BASE, {
    method: 'POST',
    headers: {
      'Content-Type':     'application/json',
      'API_KEY':          process.env.PAYTECH_API_KEY,
      'API_SECRET':       process.env.PAYTECH_API_SECRET,
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (data.success !== 1) {
    console.error('[PayTech error]', data);
    return NextResponse.json({ error: 'Erreur PayTech', detail: data }, { status: 502 });
  }

  return NextResponse.json({ redirect_url: data.redirect_url });
}
