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

    // Créer ou récupérer l'utilisateur
    const user = await upsertUser(phone, boutique_name || 'Ma Boutique');

    // Générer le token
    const token    = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await setMagicToken(user.id, token, expiresAt);

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;
    const message   = `🔐 *SenCompta IA* — Votre lien de connexion :\n${magicLink}\n\n_Valide 15 minutes. Ne partagez pas ce lien._`;

    // Envoyer via Hostinger send.php (proxy Meta Cloud API)
    const webhookUrl    = process.env.WEBHOOK_URL || '';
    const webhookSecret = process.env.WEBHOOK_SECRET || 'sencompta-webhook-2025';
    const sendUrl       = webhookUrl.replace('webhook.php', 'send.php');

    let sent = false;
    if (sendUrl && sendUrl !== webhookUrl) {
      try {
        const res = await fetch(sendUrl, {
          method:  'POST',
          headers: {
            'Content-Type':      'application/json',
            'X-Webhook-Secret':  webhookSecret,
          },
          body: JSON.stringify({ to: phone, body: message }),
        });
        sent = res.ok;
      } catch (e) {
        console.error('[send.php error]', e.message);
      }
    }

    console.log(`[MAGIC LINK] ${phone} → ${magicLink} | sent: ${sent}`);

    return NextResponse.json({
      success: true,
      message: sent
        ? 'Lien envoyé sur WhatsApp !'
        : 'Lien créé. Vérifiez votre WhatsApp.',
      // En dev — retirer en prod
      ...(process.env.NODE_ENV !== 'production' && { debug_link: magicLink }),
    });

  } catch (err) {
    console.error('[Magic Link error]', err);
    return NextResponse.json({ error: 'Erreur serveur. Réessayez.' }, { status: 500 });
  }
}
