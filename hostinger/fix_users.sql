-- Fix users avec plan payant mais subscription_expiry NULL
-- À exécuter une fois dans phpMyAdmin

-- Active tous les comptes STANDARD/PREMIUM sans date d'expiry
UPDATE users 
SET subscription_expiry = '2027-12-31 23:59:59'
WHERE plan IN ('STANDARD', 'PREMIUM') 
  AND subscription_expiry IS NULL;

-- Vérification
SELECT id, phone, plan, subscription_expiry FROM users;
