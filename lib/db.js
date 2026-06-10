// lib/db.js — SenCompta IA v2
// Connexion MySQL poolée + tous les helpers DB

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               parseInt(process.env.DB_PORT || '3306'),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'sencompta',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
  timezone:           '+00:00',
});

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ── PLAN HELPERS ──────────────────────────────────────────────

/** Limites et droits par plan */
export const PLAN_LIMITS = {
  FREE:     { txPerMonth: 20, dashboard: false, invoices: false, debts: false, aiAdvice: false },
  STANDARD: { txPerMonth: Infinity, dashboard: true,  invoices: true,  debts: true,  aiAdvice: true  },
  PREMIUM:  { txPerMonth: Infinity, dashboard: true,  invoices: true,  debts: true,  aiAdvice: true  },
};

/**
 * Vérifie si l'accès WhatsApp est actif.
 * FREE = toujours actif. STANDARD/PREMIUM = vérifie subscription_expiry.
 */
export function isSubscriptionActive(user) {
  if (!user) return false;
  if (user.plan === 'FREE') return true;
  // NULL expiry sur plan payant = activé manuellement (admin) → actif
  if (!user.subscription_expiry) return true;
  return new Date(user.subscription_expiry) > new Date();
}

/**
 * Vérifie si l'utilisateur peut accéder au dashboard web et ses fonctionnalités.
 * FREE = WhatsApp uniquement → dashboard bloqué.
 */
export function canAccessDashboard(user) {
  if (!user) return false;
  const limits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.FREE;
  if (!limits.dashboard) return false;
  return isSubscriptionActive(user);
}

/** Compte les transactions du mois courant pour un user */
export async function getMonthlyTxCount(userId) {
  const [row] = await query(
    `SELECT COUNT(*) AS cnt FROM transactions
     WHERE user_id = ?
       AND DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`,
    [userId]
  );
  return Number(row?.cnt || 0);
}

/** Compte les factures du mois courant pour un user */
export async function getMonthlyInvoiceCount(userId) {
  const [row] = await query(
    `SELECT COUNT(*) AS cnt FROM invoices
     WHERE user_id = ?
       AND DATE_FORMAT(date_emission, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`,
    [userId]
  );
  return Number(row?.cnt || 0);
}

// ── USERS ─────────────────────────────────────────────────────

export async function upsertUser(phone, boutique_name = 'Ma Boutique') {
  await query(
    `INSERT INTO users (phone, boutique_name, plan)
     VALUES (?, ?, 'FREE')
     ON DUPLICATE KEY UPDATE updated_at = NOW()`,
    [phone, boutique_name]
  );
  const [user] = await query('SELECT * FROM users WHERE phone = ?', [phone]);
  return user;
}

export async function getUser(phone) {
  const [user] = await query('SELECT * FROM users WHERE phone = ?', [phone]);
  return user || null;
}

export async function getUserById(id) {
  const [user] = await query('SELECT * FROM users WHERE id = ?', [id]);
  return user || null;
}

export async function setMagicToken(userId, token, expiresAt) {
  await query(
    'UPDATE users SET magic_token = ?, magic_token_expiry = ? WHERE id = ?',
    [token, expiresAt, userId]
  );
}

export async function consumeMagicToken(token) {
  const [user] = await query(
    `SELECT * FROM users
     WHERE magic_token = ? AND magic_token_expiry > NOW()`,
    [token]
  );
  if (!user) return null;
  await query(
    'UPDATE users SET magic_token = NULL, magic_token_expiry = NULL WHERE id = ?',
    [user.id]
  );
  return user;
}

export async function activateSubscription(userId, plan, paymentId, months = 1) {
  await query(
    `UPDATE users
     SET plan = ?,
         subscription_expiry = DATE_ADD(
           GREATEST(COALESCE(subscription_expiry, NOW()), NOW()),
           INTERVAL ? MONTH
         ),
         last_payment_id = ?,
         updated_at = NOW()
     WHERE id = ?`,
    [plan, months, paymentId, userId]
  );
}

export async function updateUserProfile(userId, { boutique_name, ninea, adresse, ville, telephone }) {
  await query(
    `UPDATE users SET
       boutique_name = COALESCE(?, boutique_name),
       ninea         = COALESCE(?, ninea),
       adresse       = COALESCE(?, adresse),
       ville         = COALESCE(?, ville),
       telephone     = COALESCE(?, telephone),
       updated_at    = NOW()
     WHERE id = ?`,
    [boutique_name, ninea, adresse, ville, telephone, userId]
  );
}

// ── TRANSACTIONS ──────────────────────────────────────────────

export async function createTransaction({ userId, type, montant, libelle, categorie, source = 'WHATSAPP', date }) {
  const d = date || new Date().toISOString().slice(0, 10);
  const [result] = await pool.execute(
    `INSERT INTO transactions (user_id, type, montant, libelle, categorie, source, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, type, montant, libelle, categorie, source, d]
  );
  return result.insertId;
}

export async function getRecentTransactions(userId, days = 30) {
  return query(
    `SELECT * FROM transactions
     WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY date DESC, created_at DESC`,
    [userId, days]
  );
}

export async function getKPIs(userId, days = 30) {
  const [row] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'RECETTE' THEN montant ELSE 0 END), 0) AS ca,
       COALESCE(SUM(CASE WHEN type = 'DEPENSE' THEN montant ELSE 0 END), 0) AS charges
     FROM transactions
     WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
    [userId, days]
  );
  return {
    ca:      Number(row.ca),
    charges: Number(row.charges),
    net:     Number(row.ca) - Number(row.charges),
  };
}

export async function getKPIsForDate(userId, date) {
  const [row] = await query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'RECETTE' THEN montant ELSE 0 END), 0) AS ca,
       COALESCE(SUM(CASE WHEN type = 'DEPENSE' THEN montant ELSE 0 END), 0) AS charges
     FROM transactions
     WHERE user_id = ? AND date = ?`,
    [userId, date]
  );
  return {
    ca:      Number(row.ca),
    charges: Number(row.charges),
    net:     Number(row.ca) - Number(row.charges),
  };
}

export async function getDailySeries(userId, days = 30) {
  return query(
    `SELECT
       date,
       SUM(CASE WHEN type = 'RECETTE' THEN montant ELSE 0 END) AS recettes,
       SUM(CASE WHEN type = 'DEPENSE' THEN montant ELSE 0 END) AS depenses
     FROM transactions
     WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY date
     ORDER BY date ASC`,
    [userId, days]
  );
}

export async function getCategoryBreakdown(userId, days = 30) {
  return query(
    `SELECT
       categorie,
       SUM(montant) AS total
     FROM transactions
     WHERE user_id = ?
       AND type = 'DEPENSE'
       AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY categorie
     ORDER BY total DESC`,
    [userId, days]
  );
}

// ── PENDING VALIDATIONS ───────────────────────────────────────

export async function createPendingValidation(userId, tempData) {
  const [result] = await pool.execute(
    `INSERT INTO pending_validations (user_id, temp_data) VALUES (?, ?)`,
    [userId, JSON.stringify(tempData)]
  );
  return result.insertId;
}

export async function getPendingValidation(id) {
  const [row] = await query(
    'SELECT * FROM pending_validations WHERE id = ? AND status = "WAITING"',
    [id]
  );
  return row || null;
}

export async function confirmPendingValidation(id) {
  await query('UPDATE pending_validations SET status = "CONFIRMED" WHERE id = ?', [id]);
}

export async function cancelPendingValidation(id) {
  await query('UPDATE pending_validations SET status = "CANCELLED" WHERE id = ?', [id]);
}

// ── DEBTS ─────────────────────────────────────────────────────

export async function getDebts(userId) {
  return query(
    `SELECT * FROM debts WHERE user_id = ? ORDER BY status ASC, due_date ASC`,
    [userId]
  );
}

export async function createDebt({ userId, clientName, amount, description, dueDate }) {
  const [result] = await pool.execute(
    `INSERT INTO debts (user_id, client_name, amount, description, due_date)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, clientName, amount, description || null, dueDate || null]
  );
  return result.insertId;
}

export async function markDebtPaid(debtId, userId) {
  await query(
    `UPDATE debts SET status = 'PAID', paid_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [debtId, userId]
  );
}

// ── INVOICES ──────────────────────────────────────────────────

/** Génère un numéro de facture unique : SC-YYYY-NNN */
export async function generateInvoiceNumber(userId) {
  const year = new Date().getFullYear();
  const [row] = await query(
    `SELECT COUNT(*) AS cnt FROM invoices
     WHERE user_id = ? AND YEAR(date_emission) = ?`,
    [userId, year]
  );
  const seq = String(Number(row.cnt) + 1).padStart(3, '0');
  return `SC-${year}-${seq}`;
}

export async function createInvoice({
  userId, clientName, clientTel, clientNinea, clientAdresse,
  dateEmission, dateEcheance, tvaApplicable, items, notes,
}) {
  const numero = await generateInvoiceNumber(userId);
  const tva = tvaApplicable ? 0.18 : 0;

  const montantHT  = items.reduce((s, i) => s + i.quantite * i.prixUnitaire, 0);
  const montantTVA = Math.round(montantHT * tva);
  const montantTTC = montantHT + montantTVA;

  const [result] = await pool.execute(
    `INSERT INTO invoices
       (user_id, numero, client_name, client_tel, client_ninea, client_adresse,
        date_emission, date_echeance, tva_applicable, montant_ht, montant_tva, montant_ttc, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, numero, clientName, clientTel || null, clientNinea || null, clientAdresse || null,
      dateEmission, dateEcheance || null, tvaApplicable ? 1 : 0,
      montantHT, montantTVA, montantTTC, notes || null,
    ]
  );
  const invoiceId = result.insertId;

  for (const item of items) {
    const total = Math.round(item.quantite * item.prixUnitaire);
    await pool.execute(
      `INSERT INTO invoice_items (invoice_id, description, quantite, prix_unitaire, total)
       VALUES (?, ?, ?, ?, ?)`,
      [invoiceId, item.description, item.quantite, item.prixUnitaire, total]
    );
  }

  return invoiceId;
}

export async function getInvoices(userId) {
  return query(
    `SELECT * FROM invoices WHERE user_id = ? ORDER BY date_emission DESC, id DESC`,
    [userId]
  );
}

export async function getInvoiceById(invoiceId, userId) {
  const [invoice] = await query(
    `SELECT * FROM invoices WHERE id = ? AND user_id = ?`,
    [invoiceId, userId]
  );
  if (!invoice) return null;
  const items = await query(
    `SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC`,
    [invoiceId]
  );
  return { ...invoice, items };
}

export async function updateInvoiceStatus(invoiceId, userId, statut) {
  await query(
    `UPDATE invoices SET statut = ?, updated_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [statut, invoiceId, userId]
  );
}

export async function deleteInvoice(invoiceId, userId) {
  await query(
    `DELETE FROM invoices WHERE id = ? AND user_id = ? AND statut = 'BROUILLON'`,
    [invoiceId, userId]
  );
}

export default pool;
