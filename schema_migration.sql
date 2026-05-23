-- ============================================================
-- SENCOMPTA IA — Migration v2
-- À exécuter sur Railway après la v1 initiale
-- ============================================================

-- ── 1. AJOUTER LE PLAN FREE ──────────────────────────────────
-- Modifie l'enum plan pour inclure FREE
ALTER TABLE users
  MODIFY COLUMN plan ENUM('FREE','STANDARD','PREMIUM') NOT NULL DEFAULT 'FREE';

-- Mettre les anciens utilisateurs sans abonnement sur FREE
UPDATE users
  SET plan = 'FREE'
  WHERE subscription_expiry IS NULL OR subscription_expiry < NOW();

-- ── 2. AJOUTER NINEA ET VILLE AU PROFIL ──────────────────────
ALTER TABLE users
  ADD COLUMN ninea       VARCHAR(30)  NULL  COMMENT 'NINEA fiscal DGI' AFTER boutique_name,
  ADD COLUMN adresse     VARCHAR(255) NULL  COMMENT 'Adresse boutique'  AFTER ninea,
  ADD COLUMN ville       VARCHAR(80)  NULL DEFAULT 'Dakar'              AFTER adresse,
  ADD COLUMN telephone   VARCHAR(20)  NULL                              AFTER ville;

-- ── 3. TABLE FACTURES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          INT UNSIGNED  NOT NULL,
  numero           VARCHAR(30)   NOT NULL COMMENT 'Ex: SC-2025-001',
  client_name      VARCHAR(120)  NOT NULL,
  client_tel       VARCHAR(20)   NULL,
  client_ninea     VARCHAR(30)   NULL,
  client_adresse   VARCHAR(255)  NULL,
  date_emission    DATE          NOT NULL,
  date_echeance    DATE          NULL,
  tva_applicable   TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1 si TVA 18% incluse',
  montant_ht       DECIMAL(14,0) NOT NULL DEFAULT 0,
  montant_tva      DECIMAL(14,0) NOT NULL DEFAULT 0,
  montant_ttc      DECIMAL(14,0) NOT NULL DEFAULT 0,
  statut           ENUM('BROUILLON','ENVOYEE','PAYEE','ANNULEE') NOT NULL DEFAULT 'BROUILLON',
  notes            TEXT          NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_inv_user    (user_id),
  INDEX idx_inv_statut  (statut),
  INDEX idx_inv_date    (date_emission)
) ENGINE=InnoDB;

-- ── 4. TABLE LIGNES DE FACTURE ────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id  INT UNSIGNED  NOT NULL,
  description VARCHAR(255)  NOT NULL,
  quantite    DECIMAL(10,2) NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(14,0) NOT NULL,
  total       DECIMAL(14,0) NOT NULL,
  CONSTRAINT fk_item_inv FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  INDEX idx_item_inv (invoice_id)
) ENGINE=InnoDB;

-- ── 5. COMPTEUR MENSUEL (vue pour FREE : limite 20 tx/mois) ────
CREATE OR REPLACE VIEW v_monthly_tx_count AS
  SELECT
    user_id,
    COUNT(*) AS tx_count,
    DATE_FORMAT(CURDATE(), '%Y-%m') AS month_year
  FROM transactions
  WHERE DATE_FORMAT(date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
  GROUP BY user_id;

-- ── 6. INDEX SUPPLEMENTAIRES ──────────────────────────────────
ALTER TABLE transactions
  ADD INDEX IF NOT EXISTS idx_user_month (user_id, date);
