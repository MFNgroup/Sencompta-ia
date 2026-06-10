// app/api/auth/magic-link/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { upsertUser, setMagicToken } from '@/lib/db';

export async function POST(req) {
  try {
    const { phone, boutique_name } = await req.json();

    if (!phone || !/^\+221[0-9]{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Numéro invalide. Format : +221XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Test connexion DB
    let user;
    try {
      user = await upsertUser(phone, boutique_name || 'Ma Boutique');
    } catch (dbErr) {
      console.error('[Magic Link DB error]', dbErr.message);
      return NextResponse.json(
        { error: `Erreur base de données : ${dbErr.message}` },
        { status: 500 }
      );
    }

    const token     = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    try {
      await setMagicToken(user.id, token, expiresAt);
    } catch (tokenErr) {
      console.error('[Magic Link token error]', tokenErr.message);
      return NextResponse.json(
        { error: `Erreur token : ${tokenErr.message}` },
        { status: 500 }
      );
    }

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
    const message   = `🔐 *SenCompta IA* — Votre lien de connexion :\n${magicLink}\n\n_Valide 15 minutes._`;

    // Envoi via Hostinger send.php
    const webhookUrl    = process.env.WEBHOOK_URL || '';
    const webhookSecret = process.env.WEBHOOK_SECRET || 'sencompta-webhook-2025';
    const sendUrl       = webhookUrl.replace('webhook.php', 'send.php');

    let sent = false;
    if (sendUrl && sendUrl !== webhookUrl) {
      try {
        const res = await fetch(sendUrl, {
          method:  'POST',
          headers: {
            'Content-Type':     'application/json',
            'X-Webhook-Secret': webhookSecret,
          },
          body: JSON.stringify({ to: phone, body: message }),
        });
        sent = res.ok;
        if (!sent) {
          const errBody = await res.text();
          console.error('[send.php error]', res.status, errBody);
        }
      } catch (e) {
        console.error('[send.php fetch error]', e.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: sent ? 'Lien envoyé sur WhatsApp !' : 'Lien créé — vérifiez votre WhatsApp.',
      debug_link: magicLink, // temporaire pour debug — retirer en prod finale
    });

  } catch (err) {
    console.error('[Magic Link error]', err);
    return NextResponse.json(
      { error: `Erreur : ${err.message}` },
      { status: 500 }
    );
  }
}
