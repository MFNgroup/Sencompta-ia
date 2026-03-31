// lib/db.js
// Connexion MySQL poolée pour Hostinger + helpers typés
// Usage : import { query, getUser, createTransaction } from '@/lib/db'

import mysql from 'mysql2/promise';

// ── Pool de connexions ────────────────────────────────────────
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

// ── Requête générique ─────────────────────────────────────────
/**
 * @template T
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<T[]>}
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// ── USERS ─────────────────────────────────────────────────────

/** Récupère ou crée un utilisateur par numéro de téléphone */
export async function upsertUser(phone, boutique_name = 'Ma Boutique') {
  await query(
    `INSERT INTO users (phone, boutique_name)
     VALUES (?, ?)
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

/** Vérifie si l'abonnement est actif */
export function isSubscriptionActive(user) {
  if (!user?.subscription_expiry) return false;
  return new Date(user.subscription_expiry) > new Date();
}

/** Sauvegarde le magic token */
export async function setMagicToken(userId, token, expiresAt) {
  await query(
    'UPDATE users SET magic_token = ?, magic_token_expiry = ? WHERE id = ?',
    [token, expiresAt, userId]
  );
}

/** Consomme le magic token et retourne l'utilisateur ou null */
export async function consumeMagicToken(token) {
  const [user] = await query(
    `SELECT * FROM users
     WHERE magic_token = ?
       AND magic_token_expiry > NOW()`,
    [token]
  );
  if (!user) return null;
  // Invalider immédiatement (one-time use)
  await query(
    'UPDATE users SET magic_token = NULL, magic_token_expiry = NULL WHERE id = ?',
    [user.id]
  );
  return user;
}

/** Mise à jour de l'abonnement après paiement réussi */
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

/** Transactions des N derniers jours */
export async function getRecentTransactions(userId, days = 30) {
  return query(
    `SELECT * FROM transactions
     WHERE user_id = ?
       AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     ORDER BY date DESC, created_at DESC`,
    [userId, days]
  );
}

/** KPIs : CA, Charges, Net */
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

/** Série journalière pour le AreaChart (30j) */
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

/** Répartition par catégorie pour le PieChart */
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
  await query(
    'UPDATE pending_validations SET status = "CONFIRMED" WHERE id = ?',
    [id]
  );
}

export async function cancelPendingValidation(id) {
  await query(
    'UPDATE pending_validations SET status = "CANCELLED" WHERE id = ?',
    [id]
  );
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

export default pool;
