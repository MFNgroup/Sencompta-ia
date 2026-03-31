// lib/whatsapp.js
// Helper pour envoyer des messages WhatsApp via l'API Cloud (Meta)
// Adaptable à Twilio ou 360Dialog selon votre provider

const WA_API_URL = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

/**
 * Envoie un message texte via WhatsApp Business Cloud API
 * @param {string} to   - Numéro destination au format international sans '+'  ex: "221771234567"
 * @param {string} text - Message à envoyer (markdown WhatsApp supporté : *gras*, _italique_)
 */
export async function sendWhatsAppMessage(to, text) {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_ID) {
    console.warn('[WhatsApp] Variables WHATSAPP_TOKEN / WHATSAPP_PHONE_ID manquantes. Message non envoyé.');
    console.log(`[WhatsApp DEV] À: ${to}\n${text}`);
    return { success: false, reason: 'config_missing' };
  }

  // Normaliser le numéro (enlever le '+')
  const phone = to.replace(/^\+/, '');

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type:    'individual',
    to:                phone,
    type:              'text',
    text:              { preview_url: false, body: text },
  };

  const res = await fetch(WA_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[WhatsApp] Erreur API:', data);
    return { success: false, error: data };
  }

  return { success: true, message_id: data.messages?.[0]?.id };
}

/**
 * Envoie un message de Magic Link
 */
export async function sendMagicLinkMessage(phone, magicLink) {
  return sendWhatsAppMessage(
    phone,
    `🔐 *SenCompta IA* — Lien de connexion\n\n` +
    `Cliquez ici pour accéder à votre dashboard :\n${magicLink}\n\n` +
    `_Ce lien est valide 15 minutes et à usage unique._`
  );
}

/**
 * Envoie une notification de paiement confirmé
 */
export async function sendPaymentConfirmationMessage(phone, plan, amount) {
  return sendWhatsAppMessage(
    phone,
    `✅ *Paiement confirmé !*\n\n` +
    `Abonnement *${plan}* activé pour 1 mois.\n` +
    `Montant : *${new Intl.NumberFormat('fr-SN').format(amount)} FCFA*\n\n` +
    `🚀 Accédez à votre dashboard : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
  );
}

/**
 * Envoie un rappel de créance
 */
export async function sendDebtReminderMessage(phone, clientName, amount) {
  return sendWhatsAppMessage(
    phone,
    `💬 *Rappel de paiement*\n\n` +
    `Bonjour, vous avez une créance en attente de *${clientName}* :\n` +
    `Montant dû : *${new Intl.NumberFormat('fr-SN').format(amount)} FCFA*\n\n` +
    `Consultez votre dashboard pour plus de détails : ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/debts`
  );
}
