// app/api/callback/payment/route.js
import { NextResponse } from 'next/server';
import { activateSubscription, getUserById, setMagicToken } from '@/lib/db';
import crypto from 'crypto';

async function sendMagicLinkWhatsApp(phone, token) {
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL;
  const magicLink  = `${appUrl}/api/auth/verify?token=${token}`;
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[PayTech] WEBHOOK_URL manquant');
    return;
  }

  const message =
    `Bienvenue sur SenCompta IA !\n\n` +
    `Ton abonnement est actif. Clique sur ce lien pour accéder à ton dashboard :\n\n` +
    `${magicLink}\n\n` +
    `Ce lien est valide pendant 15 minutes.\n\n` +
    `Après connexion, envoie "aide" ici pour commencer.`;

  try {
    const res = await fetch(`${webhookUrl}/send.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Secret': process.env.WEBHOOK_SECRET,
      },
      body: JSON.stringify({ phone, message }),
    });
    console.log('[PayTech] Magic link envoyé:', res.status);
  } catch (err) {
    console.error('[PayTech] Erreur envoi WhatsApp:', err.message);
  }
}

export async function POST(req) {
  try {
    const body   = await req.text();
    const params = new URLSearchParams(body);

    const type_event        = params.get('type_event');
    const ref_command       = params.get('ref_command');
    const custom_field_raw  = params.get('custom_field');
    const api_key_sha256    = params.get('api_key_sha256');
    const api_secret_sha256 = params.get('api_secret_sha256');

    const expectedKeyHash    = crypto.createHash('sha256').update(process.env.PAYTECH_API_KEY).digest('hex');
    const expectedSecretHash = crypto.createHash('sha256').update(process.env.PAYTECH_API_SECRET).digest('hex');

    if (api_key_sha256 !== expectedKeyHash || api_secret_sha256 !== expectedSecretHash) {
      console.error('[PayTech IPN] Signature invalide');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
    }

    if (type_event !== 'sale_complete') {
      return NextResponse.json({ status: 'ignored', type_event });
    }

    const custom = JSON.parse(custom_field_raw || '{}');
    const { user_id, plan, duration = 1 } = custom;

    if (!user_id || !plan) {
      console.error('[PayTech IPN] Données manquantes', custom);
      return NextResponse.json({ error: 'Données insuffisantes' }, { status: 400 });
    }

    await activateSubscription(user_id, plan, ref_command, duration);
    console.log(`[PayTech IPN] Abonnement ${plan} activé — user_id=${user_id}`);

    const user = await getUserById(user_id);
    if (user?.phone) {
      const token     = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await setMagicToken(user_id, token, expiresAt);
      await sendMagicLinkWhatsApp(user.phone, token);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('[PayTech IPN error]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
