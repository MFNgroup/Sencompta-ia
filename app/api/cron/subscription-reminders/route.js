// app/api/cron/subscription-reminders/route.js
// Cron job Vercel — tourne chaque jour à 9h00 (UTC)
// Envoie des rappels WhatsApp pour les abonnements qui expirent

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// ── Envoyer un message WhatsApp ───────────────────────────────
async function sendWhatsAppMessage(to, message) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token         = process.env.WHATSAPP_TOKEN;

  if (!phoneNumberId || !token) {
    console.log('[Cron] WhatsApp non configuré — message simulé pour', to);
    console.log('[Cron] Message:', message);
    return;
  }

  // Normaliser le numéro (enlever le +)
  const normalizedTo = to.replace('+', '');

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to:    normalizedTo,
        type:  'text',
        text:  { body: message },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error('[Cron] WhatsApp send error:', err);
  }
}

// ── Messages de rappel ────────────────────────────────────────
function messageExpireSoon(user, daysLeft) {
  const plan  = user.plan === 'PREMIUM' ? 'Premium' : 'Standard';
  const price = user.plan === 'PREMIUM' ? '15 000' : '10 000';
  const emoji = daysLeft === 1 ? '🚨' : '⏰';

  return `${emoji} *SenCompta IA — Rappel abonnement*\n\n` +
    `Salut ${user.boutique_name || 'ami'} ! Ton abonnement *${plan}* expire ` +
    `dans *${daysLeft} jour${daysLeft > 1 ? 's' : ''}*.\n\n` +
    `Pour continuer à enregistrer tes transactions sans interruption, renouvelle maintenant :\n` +
    `👉 ${process.env.NEXT_PUBLIC_APP_URL}/pricing\n\n` +
    `*${price} FCFA/mois* — paiement Wave ou Orange Money 🇸🇳\n\n` +
    `_Ton dashboard et tout ton historique restent accessibles après renouvellement._`;
}

function messageExpiredToday(user) {
  const plan  = user.plan === 'PREMIUM' ? 'Premium' : 'Standard';
  const price = user.plan === 'PREMIUM' ? '15 000' : '10 000';

  return `❌ *SenCompta IA — Abonnement expiré*\n\n` +
    `Salut ${user.boutique_name || 'ami'} ! Ton abonnement *${plan}* a expiré aujourd'hui.\n\n` +
    `Renouvelle maintenant pour retrouver toutes tes fonctionnalités :\n` +
    `👉 ${process.env.NEXT_PUBLIC_APP_URL}/pricing\n\n` +
    `*${price} FCFA/mois* — Wave ou Orange Money 🇸🇳\n\n` +
    `_Ton historique et tes données sont conservés — rien n'est perdu !_ 🙏`;
}

function messageExpired7Days(user) {
  return `📣 *SenCompta IA — On t'attend !*\n\n` +
    `Salut ${user.boutique_name || 'ami'} ! Ça fait 7 jours que ton abonnement SenCompta IA a expiré.\n\n` +
    `Tes données sont toujours là, en sécurité. Reviens quand tu veux :\n` +
    `👉 ${process.env.NEXT_PUBLIC_APP_URL}/pricing\n\n` +
    `_Ce message est le dernier rappel — on ne voulait pas t'embêter_ 😊`;
}

// ── Handler principal ─────────────────────────────────────────
export async function GET(req) {
  // Sécurité — vérifier le token cron Vercel
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today    = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Calculer les dates cibles
  const in3days  = new Date(today); in3days.setDate(today.getDate() + 3);
  const in1day   = new Date(today); in1day.setDate(today.getDate() + 1);
  const ago7days = new Date(today); ago7days.setDate(today.getDate() - 7);

  const fmt = (d) => d.toISOString().slice(0, 10);

  try {
    // ── 1. Expire dans 3 jours ──
    const expiring3 = await query(
      `SELECT * FROM users WHERE DATE(subscription_expiry) = ? AND plan IS NOT NULL`,
      [fmt(in3days)]
    );

    // ── 2. Expire demain ──
    const expiring1 = await query(
      `SELECT * FROM users WHERE DATE(subscription_expiry) = ? AND plan IS NOT NULL`,
      [fmt(in1day)]
    );

    // ── 3. Expiré aujourd'hui ──
    const expiredToday = await query(
      `SELECT * FROM users WHERE DATE(subscription_expiry) = ? AND plan IS NOT NULL`,
      [todayStr]
    );

    // ── 4. Expiré il y a 7 jours (dernier rappel) ──
    const expired7 = await query(
      `SELECT * FROM users WHERE DATE(subscription_expiry) = ? AND plan IS NOT NULL`,
      [fmt(ago7days)]
    );

    let sent = 0;
    const errors = [];

    // Envoyer les messages
    for (const user of expiring3) {
      try {
        await sendWhatsAppMessage(user.phone, messageExpireSoon(user, 3));
        sent++;
      } catch (e) { errors.push({ phone: user.phone, error: e.message }); }
    }

    for (const user of expiring1) {
      try {
        await sendWhatsAppMessage(user.phone, messageExpireSoon(user, 1));
        sent++;
      } catch (e) { errors.push({ phone: user.phone, error: e.message }); }
    }

    for (const user of expiredToday) {
      try {
        await sendWhatsAppMessage(user.phone, messageExpiredToday(user));
        sent++;
      } catch (e) { errors.push({ phone: user.phone, error: e.message }); }
    }

    for (const user of expired7) {
      try {
        await sendWhatsAppMessage(user.phone, messageExpired7Days(user));
        sent++;
      } catch (e) { errors.push({ phone: user.phone, error: e.message }); }
    }

    console.log(`[Cron] Rappels envoyés : ${sent} | Erreurs : ${errors.length}`);

    return NextResponse.json({
      success: true,
      date:    todayStr,
      sent,
      details: {
        expiring_3days: expiring3.length,
        expiring_1day:  expiring1.length,
        expired_today:  expiredToday.length,
        expired_7days:  expired7.length,
      },
      errors: errors.length ? errors : undefined,
    });

  } catch (err) {
    console.error('[Cron] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
