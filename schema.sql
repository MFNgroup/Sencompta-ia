-- ============================================================
-- SENCOMPTA IA — Schéma MySQL
-- Compatible Hostinger MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS sencompta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sencompta;

-- ── 1. UTILISATEURS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  phone              VARCHAR(20)  NOT NULL UNIQUE COMMENT 'Format international : +221xxxxxxxxx',
  boutique_name      VARCHAR(120) NOT NULL DEFAULT 'Ma Boutique',
  plan               ENUM('STANDARD','PREMIUM') NOT NULL DEFAULT 'STANDARD',
  subscription_expiry DATETIME    NULL     COMMENT 'NULL = abonnement inactif',
  last_payment_id    VARCHAR(100) NULL     COMMENT 'Référence PayTech',
  magic_token        VARCHAR(128) NULL     COMMENT 'Token Magic Link (one-time use)',
  magic_token_expiry DATETIME    NULL,
  created_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_plan  (plan)
) ENGINE=InnoDB;

-- ── 2. TRANSACTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  type        ENUM('RECETTE','DEPENSE') NOT NULL,
  montant     DECIMAL(14,0) NOT NULL COMMENT 'En FCFA, pas de centimes',
  libelle     VARCHAR(255)  NOT NULL,
  categorie   VARCHAR(80)   NOT NULL DEFAULT 'Autre',
  source      ENUM('WHATSAPP','WEB') NOT NULL DEFAULT 'WHATSAPP',
  date        DATE          NOT NULL,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date),
  INDEX idx_type      (type)
) ENGINE=InnoDB;

-- ── 3. VALIDATIONS EN ATTENTE (flux Premium) ─────────────────
CREATE TABLE IF NOT EXISTS pending_validations (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  temp_data   JSON         NOT NULL COMMENT '{"type","montant","libelle","categorie"}',
  status      ENUM('WAITING','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'WAITING',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status)
) ENGINE=InnoDB;

-- ── 4. CRÉANCES / DETTES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS debts (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  client_name  VARCHAR(120) NOT NULL,
  amount       DECIMAL(14,0) NOT NULL,
  description  VARCHAR(255) NULL,
  due_date     DATE         NULL,
  status       ENUM('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at      DATETIME     NULL,
  CONSTRAINT fk_debt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_debt_user_status (user_id, status)
) ENGINE=InnoDB;

-- ── 5. DONNÉES DE DÉMO (optionnel, à commenter en prod) ──────
-- INSERT INTO users (phone, boutique_name, plan, subscription_expiry)
-- VALUES ('+221700000001', 'Boutique Aminata', 'PREMIUM', DATE_ADD(NOW(), INTERVAL 30 DAY));
