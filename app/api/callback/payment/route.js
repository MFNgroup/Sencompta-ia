// app/api/callback/payment/route.js
// IPN (Instant Payment Notification) de PayTech.sn
// Appelé par PayTech après paiement réussi

import { NextResponse } from 'next/server';
import { activateSubscription } from '@/lib/db';

export async function POST(req) {
  try {
    // PayTech envoie les données en form-urlencoded
    const body = await req.text();
    const params = new URLSearchParams(body);

    const type_event  = params.get('type_event');
    const ref_command = params.get('ref_command');
    const custom_field_raw = params.get('custom_field');
    const api_key_sha256   = params.get('api_key_sha256');
    const api_secret_sha256 = params.get('api_secret_sha256');

    // ── Vérification de la signature ─────────────────────────
    const crypto = await import('crypto');
    const expectedKeyHash    = crypto.createHash('sha256').update(process.env.PAYTECH_API_KEY).digest('hex');
    const expectedSecretHash = crypto.createHash('sha256').update(process.env.PAYTECH_API_SECRET).digest('hex');

    if (api_key_sha256 !== expectedKeyHash || api_secret_sha256 !== expectedSecretHash) {
      console.error('[PayTech IPN] Signature invalide');
      return NextResponse.json({ error: 'Signature invalide' }, { status: 403 });
    }

    // ── Traiter uniquement les paiements réussis ─────────────
    if (type_event !== 'sale_complete') {
      return NextResponse.json({ status: 'ignored', type_event });
    }

    // ── Extraire les données custom ──────────────────────────
    const custom = JSON.parse(custom_field_raw || '{}');
    const { user_id, plan, duration = 1 } = custom;

    if (!user_id || !plan) {
      console.error('[PayTech IPN] Données custom manquantes', custom);
      return NextResponse.json({ error: 'Données insuffisantes' }, { status: 400 });
    }

    // ── Activer / prolonger l'abonnement ─────────────────────
    await activateSubscription(user_id, plan, ref_command, duration);

    console.log(`[PayTech IPN] ✅ Abonnement ${plan} activé — user_id=${user_id} | ref=${ref_command}`);

    // PayTech attend un 200 OK
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PayTech IPN error]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
