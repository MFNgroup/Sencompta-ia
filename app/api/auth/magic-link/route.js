// app/api/auth/magic-link/route.js
// Génère et envoie un magic link de connexion

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { upsertUser, setMagicToken } from '@/lib/db';

export async function POST(req) {
  try {
    const { phone, boutique_name } = await req.json();

    if (!phone || !/^\+221[0-9]{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Numéro invalide. Format attendu : +221XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Créer ou récupérer l'utilisateur
    const user = await upsertUser(phone, boutique_name);

    // Générer un token sécurisé
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await setMagicToken(user.id, token, expiresAt);

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

    // En production → envoyer via l'API WhatsApp Business
    // Ici on simule (log) pour le MVP
    console.log(`[MAGIC LINK] ${phone} → ${magicLink}`);

    // TODO: Remplacer par l'appel à votre fournisseur WhatsApp
    // await sendWhatsAppMessage(phone,
    //   `🔐 *SenCompta* - Votre lien de connexion :\n${magicLink}\n\n_Valide 15 minutes. Ne partagez pas ce lien._`
    // );

    return NextResponse.json({
      success: true,
      message: 'Lien de connexion envoyé sur WhatsApp !',
      // En dev uniquement — retirer en prod
      ...(process.env.NODE_ENV === 'development' && { debug_link: magicLink }),
    });
  } catch (err) {
    console.error('[Magic Link error]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
