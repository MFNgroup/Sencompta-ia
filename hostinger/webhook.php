<?php
// ============================================================
// SenCompta IA — webhook.php (Hostinger)
// Reçoit les messages WhatsApp Twilio → Gemini → DB → Twilio
// ============================================================

header('Content-Type: text/xml');
header('Access-Control-Allow-Origin: *');

// ── CONFIG ───────────────────────────────────────────────────
define('DB_HOST',     getenv('DB_HOST')     ?: 'gondola.proxy.rlwy.net');
define('DB_PORT',     getenv('DB_PORT')     ?: '21728');
define('DB_NAME',     getenv('DB_NAME')     ?: 'railway');
define('DB_USER',     getenv('DB_USER')     ?: '');
define('DB_PASS',     getenv('DB_PASS')     ?: '');
define('GEMINI_KEY',  getenv('GEMINI_API_KEY') ?: '');
define('TWILIO_SID',  getenv('TWILIO_ACCOUNT_SID') ?: '');
define('TWILIO_AUTH', getenv('TWILIO_AUTH_TOKEN')  ?: '');
define('TWILIO_FROM', getenv('TWILIO_WHATSAPP_NUMBER') ?: 'whatsapp:+14155238886');
define('APP_URL',     getenv('NEXT_PUBLIC_APP_URL') ?: 'https://sencompta-ia-fypb.vercel.app');
define('VERIFY_TOKEN',getenv('WHATSAPP_VERIFY_TOKEN') ?: 'sencompta-webhook-2025');

// ── VERIFICATION GET ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (($_GET['hub_mode'] ?? '') === 'subscribe' &&
        ($_GET['hub_verify_token'] ?? '') === VERIFY_TOKEN) {
        echo $_GET['hub_challenge'] ?? '';
    }
    exit;
}

// ── CATEGORIES ───────────────────────────────────────────────
$CATS_RECETTE = ['Vente marchandises','Vente services','Prestation','Acompte client','Remboursement reçu','Autre recette'];
$CATS_DEPENSE = ['Achat marchandises','Transport','Loyer','Électricité / Eau','Salaires','Téléphone / Internet','Emballages','Publicité','Taxes / Impôts','Entretien / Réparation','Alimentation','Fournitures bureau','Frais bancaires','Autre dépense'];
$ALL_CATS = implode(', ', array_merge($CATS_RECETTE, $CATS_DEPENSE));

// ── SYSTEM PROMPT ─────────────────────────────────────────────
$SYSTEM_PROMPT = <<<PROMPT
Tu es SenCompta IA, l'assistant comptable intelligent pour les commerçants sénégalais. Tu communiques via WhatsApp.

PERSONNALITÉ :
- Chaleureux, direct, comme un ami de confiance qui s'y connaît en comptabilité
- Tu tutoies l'utilisateur naturellement
- Parfaitement bilingue français-wolof — tu réponds dans la langue du message
- Tu utilises librement : "waaw", "dëkk bi", "naka nga def", "bu baax na", "yëgël na", "soxna bi", "ak jaamu"
- Tu es précis sur les chiffres, jamais vague

INTENTS RECONNUS (réponds UNIQUEMENT en JSON) :

1. TRANSACTION — recette ou dépense
   Déclencheurs : "vendu", "reçu", "jaay", "jënd", "payé", "acheté", "dépensé", "yëgël", "fey", "bind"

2. BILAN — solde et analyse
   Déclencheurs : "solde", "bilan", "combien", "naka", "résumé", "argent", "xaalis"
   Périodes : "aujourd'hui"→TODAY, "semaine"→7, "mois"→30, "année"→365

3. HISTORIQUE — liste des transactions
   Déclencheurs : "historique", "liste", "transactions", "dernières"

4. DETTES — créances clients
   Déclencheurs : "doit", "crédit", "bokk", "jox crédit", "mes créances", "qui me doit"

5. FACTURE — création ou gestion de factures
   Déclencheurs : "facture", "facturer", "reçu officiel", "document", "invoice", "faire une facture", "créer une facture"
   Si l'utilisateur donne client + montant + description → intent FACTURE_RAPIDE
   Sinon → intent FACTURE_GUIDE (on redirige vers le dashboard)

6. ANNULER — annulation de la dernière action en attente

7. SALUTATION — bonjour, hello, naka nga def, etc.

8. AIDE — help, aide, comment ça marche

9. INCONNU — tout le reste → rediriger vers les fonctions comptables

FORMAT DE RÉPONSE JSON STRICT (aucun texte avant ou après) :
{
  "intent": "TRANSACTION" | "BILAN" | "HISTORIQUE" | "DETTES" | "FACTURE_GUIDE" | "FACTURE_RAPIDE" | "ANNULER" | "INCONNU" | "SALUTATION" | "AIDE",
  "transaction": {
    "type": "RECETTE" | "DEPENSE",
    "montant": number,
    "libelle": "string",
    "categorie": "string",
    "date": "YYYY-MM-DD"
  },
  "dette": {
    "clientName": "string",
    "amount": number,
    "description": "string"
  },
  "facture_rapide": {
    "clientName": "string",
    "description": "string",
    "montant": number,
    "tva": false
  },
  "periode": "TODAY" | "7" | "30" | "365",
  "message_utilisateur": "string",
  "needs_confirmation": boolean,
  "langue_detectee": "fr" | "wo" | "mix"
}

RÈGLES CRITIQUES :
- Montant ambigu ou manquant → needs_confirmation: true
- Ne JAMAIS inventer des chiffres ou des données
- Ne JAMAIS mentionner Gemini, Google ou tout autre IA tiers
- Tu représentes SenCompta IA uniquement
- Catégories disponibles : {$ALL_CATS}
- Pour FACTURE_RAPIDE : extraire clientName, description, montant du message
- Pour FACTURE_GUIDE : message_utilisateur = message invitant à utiliser le dashboard
PROMPT;

// ── DB ────────────────────────────────────────────────────────
function getDB(): ?PDO {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        return new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (Exception $e) {
        error_log("[SenCompta DB] " . $e->getMessage());
        return null;
    }
}

// ── TWILIO SEND ───────────────────────────────────────────────
function sendWhatsApp(string $to, string $body): void {
    if (!TWILIO_SID || !TWILIO_AUTH) return;
    $to = str_starts_with($to, 'whatsapp:') ? $to : "whatsapp:+$to";
    $url = "https://api.twilio.com/2010-04-01/Accounts/" . TWILIO_SID . "/Messages.json";
    $ch  = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD        => TWILIO_SID . ':' . TWILIO_AUTH,
        CURLOPT_POSTFIELDS     => http_build_query([
            'From' => TWILIO_FROM,
            'To'   => $to,
            'Body' => $body,
        ]),
    ]);
    $result = curl_exec($ch);
    if (curl_errno($ch)) error_log("[Twilio] " . curl_error($ch));
    curl_close($ch);
}

// ── GEMINI TEXT ───────────────────────────────────────────────
function callGemini(string $prompt): ?array {
    $url  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . GEMINI_KEY;
    $body = json_encode([
        'contents' => [['parts' => [['text' => $prompt]]]],
        'generationConfig' => ['temperature' => 0.3, 'maxOutputTokens' => 1024],
    ]);
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_TIMEOUT        => 20,
    ]);
    $resp = curl_exec($ch);
    if (curl_errno($ch)) { error_log("[Gemini] " . curl_error($ch)); curl_close($ch); return null; }
    curl_close($ch);

    $data = json_decode($resp, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $text = preg_replace('/```json|```/i', '', trim($text));

    $parsed = json_decode(trim($text), true);
    return is_array($parsed) ? $parsed : null;
}

// ── GEMINI VISION (OCR reçu photo) ───────────────────────────
function callGeminiVision(string $imageBase64, string $mimeType): ?array {
    $OCR_PROMPT = <<<PROMPT
Tu es un assistant OCR spécialisé dans les reçus commerciaux pour commerçants sénégalais.
Analyse cette image et extrait les informations comptables.

RÈGLES :
- Montant toujours en FCFA (XOF). Si une autre devise, convertis mentalement.
- Type : "DEPENSE" si c'est un achat/reçu de paiement, "RECETTE" si c'est une vente encaissée.
- Si l'image n'est pas un reçu ou ticket de caisse, met found: false.
- Si le montant n'est pas lisible, met montant: null.
- Date : format YYYY-MM-DD. Si absente, mets null.
- Libelle : nom du commerce ou description courte (max 60 caractères).
- Categorie : choisis parmi : Achat marchandises, Transport, Loyer, Électricité / Eau, Salaires, Téléphone / Internet, Emballages, Publicité, Taxes / Impôts, Entretien / Réparation, Alimentation, Fournitures bureau, Frais bancaires, Vente marchandises, Vente services, Autre recette, Autre dépense.

Réponds UNIQUEMENT en JSON valide, aucun texte avant ou après :
{
  "found": true,
  "type": "DEPENSE" | "RECETTE",
  "montant": number | null,
  "libelle": "string",
  "categorie": "string",
  "date": "YYYY-MM-DD" | null,
  "confidence": "high" | "medium" | "low",
  "details": "brève description de ce que tu vois sur le reçu"
}
PROMPT;

    $url  = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . GEMINI_KEY;
    $body = json_encode([
        'contents' => [[
            'parts' => [
                ['text' => $OCR_PROMPT],
                ['inline_data' => ['mime_type' => $mimeType, 'data' => $imageBase64]],
            ]
        ]],
        'generationConfig' => ['temperature' => 0.1, 'maxOutputTokens' => 512],
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => $body,
        CURLOPT_TIMEOUT        => 30,
    ]);
    $resp = curl_exec($ch);
    if (curl_errno($ch)) { error_log("[GeminiVision] " . curl_error($ch)); curl_close($ch); return null; }
    curl_close($ch);

    $data = json_decode($resp, true);
    $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
    $text = preg_replace('/```json|```/i', '', trim($text));

    $parsed = json_decode(trim($text), true);
    return is_array($parsed) ? $parsed : null;
}

// ── TÉLÉCHARGE IMAGE TWILIO ───────────────────────────────────
function downloadTwilioImage(string $mediaUrl): ?string {
    $ch = curl_init($mediaUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_USERPWD        => TWILIO_SID . ':' . TWILIO_AUTH,
        CURLOPT_TIMEOUT        => 20,
        CURLOPT_USERAGENT      => 'SenCompta-IA/1.0',
    ]);
    $data = curl_exec($ch);
    if (curl_errno($ch) || $data === false) {
        error_log("[TwilioMedia] " . curl_error($ch));
        curl_close($ch);
        return null;
    }
    curl_close($ch);
    return base64_encode($data);
}

// ── TRAITE UNE PHOTO ─────────────────────────────────────────
function processPhoto(string $rawPhone, string $mediaUrl, string $mimeType): void {
    $phone = '+' . preg_replace('/\D/', '', $rawPhone);

    $db = getDB();
    if (!$db) { sendWhatsApp($rawPhone, "Erreur technique. Réessaie dans un instant."); return; }

    $user = getOrCreateUser($db, $phone);
    if (!$user || !isActive($user)) {
        sendWhatsApp($rawPhone, "Abonnement requis. " . APP_URL . "/pricing");
        return;
    }

    // Limite FREE
    if ($user['plan'] === 'FREE') {
        $count = getMonthlyTxCount($db, $user['id']);
        if ($count >= 20) {
            sendWhatsApp($rawPhone,
                "Tu as atteint ta limite gratuite (20 tx/mois).\n\nPasser au Standard : " . APP_URL . "/pricing"
            );
            return;
        }
    }

    // Signaler que l'analyse est en cours
    sendWhatsApp($rawPhone, "📷 Photo reçue, j'analyse le reçu...");

    // Télécharger + encoder l'image
    $imageBase64 = downloadTwilioImage($mediaUrl);
    if (!$imageBase64) {
        sendWhatsApp($rawPhone, "Je n'ai pas pu lire l'image. Envoie-la à nouveau ou saisis la transaction manuellement.");
        return;
    }

    // Appel Gemini Vision
    $result = callGeminiVision($imageBase64, $mimeType);

    if (!$result || empty($result['found'])) {
        sendWhatsApp($rawPhone,
            "Je ne reconnais pas de reçu dans cette image.\n\n" .
            "Envoie-moi directement : \"payé [article] [montant]\""
        );
        return;
    }

    if (!$result['montant']) {
        sendWhatsApp($rawPhone,
            "J'ai vu un reçu mais le montant n'est pas lisible.\n\n" .
            "Dis-moi : \"payé " . ($result['libelle'] ?? 'achat') . " [montant]\""
        );
        return;
    }

    // Enregistrer la transaction
    createTransaction($db, $user['id'], [
        'type'      => $result['type'] ?? 'DEPENSE',
        'montant'   => (int)$result['montant'],
        'libelle'   => $result['libelle'] ?? 'Achat (photo)',
        'categorie' => $result['categorie'] ?? 'Autre dépense',
        'date'      => $result['date'] ?? date('Y-m-d'),
    ]);

    $typeLabel  = ($result['type'] ?? 'DEPENSE') === 'RECETTE' ? 'Recette' : 'Dépense';
    $confidence = match($result['confidence'] ?? 'medium') {
        'high'   => '',
        'medium' => ' _(détection approximative)_',
        default  => ' _(faible confiance — vérifie)_',
    };

    // Avertissement limite FREE
    $suffix = '';
    if ($user['plan'] === 'FREE') {
        $remaining = 20 - getMonthlyTxCount($db, $user['id']);
        if ($remaining <= 3) {
            $suffix = "\n\n_Il te reste $remaining transaction(s) gratuite(s) ce mois._";
        }
    }

    sendWhatsApp($rawPhone,
        "✓ *$typeLabel enregistrée depuis le reçu*$confidence\n\n" .
        fcfa((int)$result['montant']) . " · " . ($result['libelle'] ?? 'Achat') . "\n" .
        "Catégorie : " . ($result['categorie'] ?? 'Autre') . "\n" .
        ($result['date'] ? "Date : " . $result['date'] . "\n" : '') .
        "\n_" . ($result['details'] ?? '') . "_" .
        $suffix
    );
}

// ── DB HELPERS ────────────────────────────────────────────────
function getOrCreateUser(PDO $db, string $phone): ?array {
    $phone = preg_replace('/\D/', '', $phone);
    if (!str_starts_with($phone, '+')) $phone = '+' . $phone;

    $stmt = $db->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    if (!$user) {
        $db->prepare("INSERT INTO users (phone, boutique_name, plan) VALUES (?, 'Ma Boutique', 'FREE')")
           ->execute([$phone]);
        $stmt->execute([$phone]);
        $user = $stmt->fetch();
    }
    return $user ?: null;
}

function isActive(array $user): bool {
    if ($user['plan'] === 'FREE') return true;
    if (!$user['subscription_expiry']) return false;
    return strtotime($user['subscription_expiry']) > time();
}

function canDashboard(array $user): bool {
    if (!isActive($user)) return false;
    return in_array($user['plan'], ['STANDARD', 'PREMIUM']);
}

function getMonthlyTxCount(PDO $db, int $userId): int {
    $stmt = $db->prepare("SELECT COUNT(*) FROM transactions WHERE user_id = ? AND DATE_FORMAT(date,'%Y-%m') = DATE_FORMAT(CURDATE(),'%Y-%m')");
    $stmt->execute([$userId]);
    return (int) $stmt->fetchColumn();
}

function getKPIs(PDO $db, int $userId, int $days = 30): array {
    $stmt = $db->prepare("
        SELECT
          COALESCE(SUM(CASE WHEN type='RECETTE' THEN montant ELSE 0 END),0) AS ca,
          COALESCE(SUM(CASE WHEN type='DEPENSE' THEN montant ELSE 0 END),0) AS charges
        FROM transactions
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ");
    $stmt->execute([$userId, $days]);
    $row = $stmt->fetch();
    return ['ca' => (int)$row['ca'], 'charges' => (int)$row['charges'], 'net' => (int)$row['ca'] - (int)$row['charges']];
}

function getKPIsToday(PDO $db, int $userId): array {
    $stmt = $db->prepare("
        SELECT
          COALESCE(SUM(CASE WHEN type='RECETTE' THEN montant ELSE 0 END),0) AS ca,
          COALESCE(SUM(CASE WHEN type='DEPENSE' THEN montant ELSE 0 END),0) AS charges
        FROM transactions WHERE user_id = ? AND date = CURDATE()
    ");
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    return ['ca' => (int)$row['ca'], 'charges' => (int)$row['charges'], 'net' => (int)$row['ca'] - (int)$row['charges']];
}

function getRecentTx(PDO $db, int $userId, int $days = 30): array {
    $stmt = $db->prepare("SELECT * FROM transactions WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY) ORDER BY date DESC, created_at DESC LIMIT 8");
    $stmt->execute([$userId, $days]);
    return $stmt->fetchAll();
}

function getDebts(PDO $db, int $userId): array {
    $stmt = $db->prepare("SELECT * FROM debts WHERE user_id = ? AND status IN ('PENDING','UNPAID') ORDER BY due_date ASC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

function createTransaction(PDO $db, int $userId, array $tx): void {
    $db->prepare("INSERT INTO transactions (user_id, type, montant, libelle, categorie, source, date) VALUES (?,?,?,?,?,?,?)")
       ->execute([$userId, $tx['type'], $tx['montant'], $tx['libelle'], $tx['categorie'] ?? 'Autre', 'WHATSAPP', $tx['date'] ?? date('Y-m-d')]);
}

function createDebt(PDO $db, int $userId, array $d): void {
    $db->prepare("INSERT INTO debts (user_id, client_name, amount, description) VALUES (?,?,?,?)")
       ->execute([$userId, $d['clientName'], $d['amount'], $d['description'] ?? '']);
}

function generateInvoiceNumber(PDO $db, int $userId): string {
    $year = date('Y');
    $stmt = $db->prepare("SELECT COUNT(*) FROM invoices WHERE user_id = ? AND YEAR(date_emission) = ?");
    $stmt->execute([$userId, $year]);
    $seq = str_pad((int)$stmt->fetchColumn() + 1, 3, '0', STR_PAD_LEFT);
    return "SC-{$year}-{$seq}";
}

function createQuickInvoice(PDO $db, int $userId, array $f): int {
    $numero     = generateInvoiceNumber($db, $userId);
    $montantHT  = (int)$f['montant'];
    $tva        = !empty($f['tva']) ? 1 : 0;
    $montantTVA = $tva ? (int)round($montantHT * 0.18) : 0;
    $montantTTC = $montantHT + $montantTVA;

    $db->prepare("INSERT INTO invoices (user_id, numero, client_name, date_emission, tva_applicable, montant_ht, montant_tva, montant_ttc, statut) VALUES (?,?,?,CURDATE(),?,?,?,?,'BROUILLON')")
       ->execute([$userId, $numero, $f['clientName'], $tva, $montantHT, $montantTVA, $montantTTC]);

    $invoiceId = (int)$db->lastInsertId();

    $db->prepare("INSERT INTO invoice_items (invoice_id, description, quantite, prix_unitaire, total) VALUES (?,?,1,?,?)")
       ->execute([$invoiceId, $f['description'], $montantHT, $montantHT]);

    return $invoiceId;
}

function fcfa(int $n): string {
    return number_format($n, 0, ',', ' ') . ' FCFA';
}

// ── CONTEXT BUILDER ───────────────────────────────────────────
function buildContext(PDO $db, array $user): string {
    $kpis = getKPIs($db, $user['id'], 30);
    $txs  = getRecentTx($db, $user['id'], 30);
    $debts = getDebts($db, $user['id']);

    $txLines = array_map(fn($t) =>
        $t['date'] . ' | ' . $t['type'] . ' | ' . fcfa((int)$t['montant']) . ' | ' . $t['libelle'],
        array_slice($txs, 0, 5)
    );

    $debtTotal = array_sum(array_column($debts, 'amount'));

    return "CONTEXTE (30 derniers jours) :
CA : " . fcfa($kpis['ca']) . "
Charges : " . fcfa($kpis['charges']) . "
Net : " . fcfa($kpis['net']) . "

DERNIÈRES TRANSACTIONS :
" . (implode("\n", $txLines) ?: 'Aucune') . "

CRÉANCES ACTIVES : " . count($debts) . " client(s) — Total : " . fcfa($debtTotal) . "
Plan actuel : " . $user['plan'];
}

// ── PROCESS MESSAGE ───────────────────────────────────────────
function processMessage(string $rawPhone, string $msgBody): void {
    global $SYSTEM_PROMPT;

    $phone = '+' . preg_replace('/\D/', '', $rawPhone);

    $db = getDB();
    if (!$db) {
        sendWhatsApp($rawPhone, "Désolé, une erreur technique s'est produite. Réessaie dans quelques instants.");
        return;
    }

    $user = getOrCreateUser($db, $phone);
    if (!$user) { sendWhatsApp($rawPhone, "Erreur de compte. Contacte le support."); return; }

    // Nouvel utilisateur — message de bienvenue
    $isNew = (strtotime($user['created_at']) > time() - 30);
    if ($isNew) {
        $limit = canDashboard($user) ? 'illimité' : '20 transactions/mois gratuitement';
        sendWhatsApp($rawPhone,
            "*Bienvenue sur SenCompta IA !*\n\n" .
            "Je suis ton assistant comptable. Envoie-moi tes transactions en français ou en wolof.\n\n" .
            "Exemples :\n" .
            "- \"vendu tissus 25 000\"\n" .
            "- \"payé transport 3 500\"\n" .
            "- \"mon solde\"\n" .
            "- \"facture pour Aminata 50 000\"\n\n" .
            "Accès : $limit\n" .
            "Dashboard : " . APP_URL . "/dashboard"
        );
        return;
    }

    // Vérifier accès
    if (!isActive($user)) {
        sendWhatsApp($rawPhone,
            "Ton abonnement SenCompta IA est expiré.\n\nRenouvelle ici : " . APP_URL . "/pricing"
        );
        return;
    }

    // Vérifier limite FREE
    $plan   = $user['plan'];
    $isFree = ($plan === 'FREE');
    if ($isFree) {
        $monthCount = getMonthlyTxCount($db, $user['id']);
        // La limite est vérifiée plus tard, après avoir parsé l'intent
    }

    // Contexte + prompt
    $context = buildContext($db, $user);
    $today   = date('Y-m-d');
    $fullPrompt = $SYSTEM_PROMPT . "\n\n" . $context . "\n\nMessage utilisateur : \"" . $msgBody . "\"\nDate aujourd'hui : $today\n\nRéponds UNIQUEMENT en JSON valide, sans texte avant ou après.";

    $parsed = callGemini($fullPrompt);

    if (!$parsed) {
        sendWhatsApp($rawPhone,
            "Je n'ai pas bien compris. Essaie :\n" .
            "- \"vendu [article] [montant]\"\n" .
            "- \"payé [article] [montant]\"\n" .
            "- \"mon solde\"\n" .
            "- \"facture pour [client] [montant]\""
        );
        return;
    }

    $intent  = $parsed['intent']  ?? 'INCONNU';
    $msg_usr = $parsed['message_utilisateur'] ?? '';

    switch ($intent) {

        // ── TRANSACTION ──────────────────────────────────────────
        case 'TRANSACTION': {
            $tx = $parsed['transaction'] ?? null;
            if (!$tx || !isset($tx['montant'], $tx['type'])) {
                sendWhatsApp($rawPhone, $msg_usr ?: "Je n'ai pas compris le montant. Peux-tu préciser ?");
                break;
            }

            // Limite FREE
            if ($isFree) {
                $monthCount = getMonthlyTxCount($db, $user['id']);
                if ($monthCount >= 20) {
                    sendWhatsApp($rawPhone,
                        "Tu as utilisé tes 20 transactions gratuites ce mois.\n\n" .
                        "Passe au plan Standard pour continuer sans limite + dashboard, factures, créances :\n" . APP_URL . "/pricing"
                    );
                    break;
                }
            }

            if (!empty($parsed['needs_confirmation'])) {
                // Stocke dans session ou DB — pour simplifier, on enregistre directement
                // TODO: implémenter confirmation avec pending_validations si nécessaire
                sendWhatsApp($rawPhone, $msg_usr);
                break;
            }

            createTransaction($db, $user['id'], [
                'type'      => $tx['type'],
                'montant'   => (int)$tx['montant'],
                'libelle'   => $tx['libelle'] ?? $msgBody,
                'categorie' => $tx['categorie'] ?? ($tx['type'] === 'RECETTE' ? 'Autre recette' : 'Autre dépense'),
                'date'      => $tx['date'] ?? $today,
            ]);

            // Avertissement proche limite FREE
            $suffix = '';
            if ($isFree) {
                $newCount  = getMonthlyTxCount($db, $user['id']);
                $remaining = 20 - $newCount;
                if ($remaining <= 3) {
                    $suffix = "\n\n_Il te reste $remaining transaction(s) gratuite(s) ce mois. Pour continuer : " . APP_URL . "/pricing_";
                }
            }
            sendWhatsApp($rawPhone, $msg_usr . $suffix);
            break;
        }

        // ── BILAN ────────────────────────────────────────────────
        case 'BILAN': {
            $periode = $parsed['periode'] ?? '30';
            if ($periode === 'TODAY') {
                $kpis  = getKPIsToday($db, $user['id']);
                $label = "aujourd'hui";
            } else {
                $days  = (int)$periode;
                $kpis  = getKPIs($db, $user['id'], $days);
                $label = match($days) { 7 => '7 derniers jours', 365 => "cette année", default => 'ce mois' };
            }

            sendWhatsApp($rawPhone,
                "*Bilan — $label*\n\n" .
                "Recettes  " . fcfa($kpis['ca'])      . "\n" .
                "Dépenses  " . fcfa($kpis['charges'])  . "\n" .
                "━━━━━━━━━━━━━━\n" .
                "Net       " . ($kpis['net'] >= 0 ? '+' : '') . fcfa($kpis['net']) . "\n\n" .
                (canDashboard($user) ? "Dashboard : " . APP_URL . "/dashboard" : "Dashboard disponible en Standard : " . APP_URL . "/pricing")
            );
            break;
        }

        // ── HISTORIQUE ───────────────────────────────────────────
        case 'HISTORIQUE': {
            $days = (int)($parsed['periode'] ?? 30);
            $txs  = getRecentTx($db, $user['id'], $days);
            if (empty($txs)) {
                sendWhatsApp($rawPhone, "Aucune transaction sur cette période.");
                break;
            }
            $lines = array_map(fn($t) =>
                ($t['type'] === 'RECETTE' ? '+' : '-') . ' ' . $t['date'] . ' | ' . fcfa((int)$t['montant']) . ' | ' . $t['libelle'],
                $txs
            );
            $extra = count($txs) >= 8 ? "\n\n...et plus sur " . APP_URL . "/dashboard" : '';
            sendWhatsApp($rawPhone, count($txs) . " transaction(s) :\n\n" . implode("\n", $lines) . $extra);
            break;
        }

        // ── DETTES ───────────────────────────────────────────────
        case 'DETTES': {
            $dette = $parsed['dette'] ?? null;
            if ($dette && !empty($dette['clientName']) && !empty($dette['amount'])) {
                createDebt($db, $user['id'], $dette);
                sendWhatsApp($rawPhone, $msg_usr ?: "Créance enregistrée pour " . $dette['clientName'] . " — " . fcfa((int)$dette['amount']));
            } else {
                $debts = getDebts($db, $user['id']);
                if (empty($debts)) {
                    sendWhatsApp($rawPhone, "Aucune créance active. Bonne nouvelle !");
                } else {
                    $total = array_sum(array_column($debts, 'amount'));
                    $list  = array_map(fn($d, $i) => ($i+1) . ". " . $d['client_name'] . " — " . fcfa((int)$d['amount']), $debts, array_keys($debts));
                    sendWhatsApp($rawPhone,
                        "*Créances actives (" . count($debts) . ")*\n\n" .
                        implode("\n", $list) . "\n\n" .
                        "Total : " . fcfa($total)
                    );
                }
            }
            break;
        }

        // ── FACTURE GUIDE (redirige vers dashboard) ──────────────
        case 'FACTURE_GUIDE': {
            if (!canDashboard($user)) {
                sendWhatsApp($rawPhone,
                    "La création de factures est disponible à partir du plan Standard.\n\n" .
                    "Tes factures seront conformes DGI (NINEA, TVA 18%), numérotées automatiquement et exportables en PDF.\n\n" .
                    "Passer au Standard : " . APP_URL . "/pricing"
                );
            } else {
                sendWhatsApp($rawPhone,
                    "*Créer une facture*\n\n" .
                    "Tu peux me donner les détails directement :\n" .
                    "\"facture pour [nom client] [montant] [description]\"\n\n" .
                    "Ex : \"facture pour Amadou 75 000 prestation couture\"\n\n" .
                    "Ou crée-la depuis ton dashboard :\n" . APP_URL . "/dashboard/invoices"
                );
            }
            break;
        }

        // ── FACTURE RAPIDE (création directe) ───────────────────
        case 'FACTURE_RAPIDE': {
            if (!canDashboard($user)) {
                sendWhatsApp($rawPhone,
                    "La facturation est disponible en plan Standard (10 000 FCFA/mois).\n\n" . APP_URL . "/pricing"
                );
                break;
            }

            $f = $parsed['facture_rapide'] ?? null;
            if (!$f || empty($f['clientName']) || empty($f['montant'])) {
                sendWhatsApp($rawPhone,
                    "Je n'ai pas pu extraire tous les détails. Précise :\n" .
                    "\"facture pour [nom] [montant] [description]\"\n\n" .
                    "Ex : \"facture pour Aminata 50 000 tissus wax\""
                );
                break;
            }

            $invoiceId = createQuickInvoice($db, $user['id'], $f);
            $montantTTC = (int)$f['montant'];

            sendWhatsApp($rawPhone,
                "✓ *Facture créée — brouillon*\n\n" .
                "Client : " . $f['clientName'] . "\n" .
                "Montant : " . fcfa($montantTTC) . "\n" .
                "Objet : " . ($f['description'] ?? '-') . "\n\n" .
                "Télécharge le PDF et finalise sur ton dashboard :\n" .
                APP_URL . "/dashboard/invoices"
            );
            break;
        }

        // ── SALUTATION ───────────────────────────────────────────
        case 'SALUTATION': {
            $kpis  = getKPIs($db, $user['id'], 30);
            $planNote = $isFree
                ? "\n\n_Plan gratuit — " . (20 - getMonthlyTxCount($db, $user['id'])) . " transactions restantes ce mois_"
                : '';
            sendWhatsApp($rawPhone,
                "Bonjour ! Je suis SenCompta IA, ton assistant comptable.\n\n" .
                "Ce mois : *" . fcfa($kpis['ca']) . "* de recettes\n\n" .
                "Que puis-je faire ?\n" .
                "- Enregistrer une vente ou dépense\n" .
                "- Afficher ton bilan\n" .
                "- Créer une facture\n" .
                "- Suivre tes créances" .
                $planNote
            );
            break;
        }

        // ── AIDE ─────────────────────────────────────────────────
        case 'AIDE': {
            sendWhatsApp($rawPhone,
                "*SenCompta IA — Guide rapide*\n\n" .
                "💰 Recette : \"vendu tissus 25 000\"\n" .
                "🛒 Dépense : \"payé transport 3 500\"\n" .
                "📊 Bilan : \"mon solde\" ou \"bilan du mois\"\n" .
                "📋 Créance : \"Amadou me doit 20 000\"\n" .
                "🧾 Facture : \"facture pour Aminata 50 000 couture\"\n" .
                "📜 Historique : \"mes dernières transactions\"\n\n" .
                "Je comprends le français et le wolof.\n" .
                "Dashboard : " . APP_URL . "/dashboard"
            );
            break;
        }

        // ── INCONNU / DEFAULT ────────────────────────────────────
        default: {
            sendWhatsApp($rawPhone,
                $msg_usr ?:
                "Je suis spécialisé en comptabilité. Tape *aide* pour voir comment je fonctionne."
            );
        }
    }
}

// ── ENTRY POINT ───────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $from      = str_replace('whatsapp:', '', $_POST['From'] ?? '');
    $body      = trim($_POST['Body'] ?? '');
    $numMedia  = (int)($_POST['NumMedia'] ?? 0);

    if ($from) {
        if ($numMedia > 0) {
            // ── MESSAGE AVEC PHOTO ───────────────────────────
            $mediaUrl      = $_POST['MediaUrl0']         ?? '';
            $mediaType     = $_POST['MediaContentType0'] ?? 'image/jpeg';
            $isImage       = str_starts_with($mediaType, 'image/');

            if ($isImage && $mediaUrl) {
                register_shutdown_function(function() use ($from, $mediaUrl, $mediaType) {
                    processPhoto($from, $mediaUrl, $mediaType);
                });
            } else {
                // Fichier non-image (PDF, audio, etc.) — ignorer ou informer
                register_shutdown_function(function() use ($from) {
                    sendWhatsApp($from, "Envoie-moi une photo de ton reçu ou ticket de caisse, ou saisis ta transaction en texte.");
                });
            }

        } elseif ($body) {
            // ── MESSAGE TEXTE ────────────────────────────────
            register_shutdown_function(function() use ($from, $body) {
                processMessage($from, $body);
            });
        }
    }

    echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    exit;
}

echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
