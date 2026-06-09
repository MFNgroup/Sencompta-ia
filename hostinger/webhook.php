<?php
// ============================================================
// SenCompta IA — webhook.php (Hostinger) — Meta Cloud API
// ============================================================

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// ── CONFIG ───────────────────────────────────────────────────
define('DB_HOST',          'localhost');
define('DB_PORT',          '3306');
define('DB_NAME',          'u824414783_Sencomptaia');
define('DB_USER',          'u824414783_Sencomptaia');
define('DB_PASS',          'METTRE_MOT_DE_PASSE_ICI');

// Meta Cloud API — remplacer le token par un token permanent en production
define('META_PHONE_ID',    '988352281037795');
define('META_TOKEN',       'METTRE_ACCESS_TOKEN_ICI'); // Token temporaire ou permanent
define('META_API_VERSION', 'v19.0');
define('META_API_URL',     'https://graph.facebook.com/' . META_API_VERSION);

define('GEMINI_KEY',       'METTRE_GEMINI_API_KEY_ICI');
define('VERIFY_TOKEN',     'sencompta-webhook-2025');
define('APP_URL',          'https://sencompta-ia-fypb.vercel.app');

// ── VERIFICATION META WEBHOOK (GET) ──────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (
        ($_GET['hub_mode']         ?? '') === 'subscribe' &&
        ($_GET['hub_verify_token'] ?? '') === VERIFY_TOKEN
    ) {
        echo $_GET['hub_challenge'] ?? '';
    } else {
        http_response_code(403);
        echo 'Forbidden';
    }
    exit;
}

// ── CATEGORIES ───────────────────────────────────────────────
$ALL_CATS = 'Vente marchandises, Vente services, Prestation, Acompte client, Remboursement reçu, Autre recette, Achat marchandises, Transport, Loyer, Électricité / Eau, Salaires, Téléphone / Internet, Emballages, Publicité, Taxes / Impôts, Entretien / Réparation, Alimentation, Fournitures bureau, Frais bancaires, Autre dépense';

// ── SYSTEM PROMPT ─────────────────────────────────────────────
$SYSTEM_PROMPT = <<<PROMPT
Tu es SenCompta IA, l'assistant comptable intelligent pour les commerçants sénégalais. Tu communiques via WhatsApp.

PERSONNALITÉ :
- Chaleureux, direct, comme un ami de confiance
- Tu tutoies l'utilisateur naturellement
- Parfaitement bilingue français-wolof — tu réponds dans la langue du message
- Tu utilises librement : "waaw", "dëkk bi", "naka nga def", "bu baax na", "yëgël na"
- Tu ne mentionnes JAMAIS Gemini, Google ou tout autre IA tiers

INTENTS RECONNUS (JSON uniquement) :
1. TRANSACTION — recette ou dépense
2. BILAN — solde et analyse (périodes: TODAY, 7, 30, 365)
3. HISTORIQUE — liste des transactions
4. DETTES — créances clients
5. FACTURE_GUIDE — demande de facture sans détails suffisants
6. FACTURE_RAPIDE — facture avec client + montant + description
7. ANNULER — annulation en attente
8. SALUTATION — bonjour etc.
9. AIDE — aide, help
10. INCONNU — tout le reste

FORMAT JSON STRICT :
{
  "intent": "TRANSACTION|BILAN|HISTORIQUE|DETTES|FACTURE_GUIDE|FACTURE_RAPIDE|ANNULER|INCONNU|SALUTATION|AIDE",
  "transaction": {"type":"RECETTE|DEPENSE","montant":0,"libelle":"","categorie":"","date":"YYYY-MM-DD"},
  "dette": {"clientName":"","amount":0,"description":""},
  "facture_rapide": {"clientName":"","description":"","montant":0,"tva":false},
  "periode": "TODAY|7|30|365",
  "message_utilisateur": "",
  "needs_confirmation": false,
  "langue_detectee": "fr|wo|mix"
}

Catégories disponibles : PROMPT . $ALL_CATS;

// ── ENVOYER UN MESSAGE WHATSAPP (Meta Cloud API) ──────────────
function sendWhatsApp(string $to, string $body): void {
    // Nettoyer le numéro — Meta veut format international sans +
    $to = preg_replace('/\D/', '', $to);
    if (str_starts_with($to, '00')) $to = substr($to, 2);

    $url  = META_API_URL . '/' . META_PHONE_ID . '/messages';
    $data = json_encode([
        'messaging_product' => 'whatsapp',
        'recipient_type'    => 'individual',
        'to'                => $to,
        'type'              => 'text',
        'text'              => ['preview_url' => false, 'body' => $body],
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . META_TOKEN,
        ],
        CURLOPT_POSTFIELDS     => $data,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $resp = curl_exec($ch);
    if (curl_errno($ch)) error_log('[Meta Send] ' . curl_error($ch));
    curl_close($ch);
}

// ── TÉLÉCHARGER UN MÉDIA META ─────────────────────────────────
function downloadMetaMedia(string $mediaId): ?array {
    // 1. Obtenir l'URL du média
    $ch = curl_init(META_API_URL . '/' . $mediaId);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . META_TOKEN],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $resp = curl_exec($ch);
    curl_close($ch);

    $info = json_decode($resp, true);
    $url  = $info['url']       ?? null;
    $mime = $info['mime_type'] ?? 'image/jpeg';
    if (!$url) return null;

    // 2. Télécharger le fichier
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . META_TOKEN],
        CURLOPT_TIMEOUT        => 20,
    ]);
    $data = curl_exec($ch);
    curl_close($ch);

    if (!$data) return null;
    return ['base64' => base64_encode($data), 'mime' => $mime];
}

// ── DB ────────────────────────────────────────────────────────
function getDB(): ?PDO {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        return new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (Exception $e) {
        error_log('[SenCompta DB] ' . $e->getMessage());
        return null;
    }
}

function getOrCreateUser(PDO $db, string $phone): ?array {
    $phone = '+' . preg_replace('/\D/', '', $phone);
    $stmt  = $db->prepare('SELECT * FROM users WHERE phone = ?');
    $stmt->execute([$phone]);
    $user  = $stmt->fetch();
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
    return isActive($user) && in_array($user['plan'], ['STANDARD', 'PREMIUM']);
}

function getMonthlyTxCount(PDO $db, int $userId): int {
    $stmt = $db->prepare("SELECT COUNT(*) FROM transactions WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=DATE_FORMAT(CURDATE(),'%Y-%m')");
    $stmt->execute([$userId]);
    return (int)$stmt->fetchColumn();
}

function getKPIs(PDO $db, int $userId, int $days = 30): array {
    $stmt = $db->prepare("SELECT COALESCE(SUM(CASE WHEN type='RECETTE' THEN montant ELSE 0 END),0) AS ca, COALESCE(SUM(CASE WHEN type='DEPENSE' THEN montant ELSE 0 END),0) AS charges FROM transactions WHERE user_id=? AND date>=DATE_SUB(CURDATE(),INTERVAL ? DAY)");
    $stmt->execute([$userId, $days]);
    $r = $stmt->fetch();
    return ['ca' => (int)$r['ca'], 'charges' => (int)$r['charges'], 'net' => (int)$r['ca'] - (int)$r['charges']];
}

function getKPIsToday(PDO $db, int $userId): array {
    $stmt = $db->prepare("SELECT COALESCE(SUM(CASE WHEN type='RECETTE' THEN montant ELSE 0 END),0) AS ca, COALESCE(SUM(CASE WHEN type='DEPENSE' THEN montant ELSE 0 END),0) AS charges FROM transactions WHERE user_id=? AND date=CURDATE()");
    $stmt->execute([$userId]);
    $r = $stmt->fetch();
    return ['ca' => (int)$r['ca'], 'charges' => (int)$r['charges'], 'net' => (int)$r['ca'] - (int)$r['charges']];
}

function getRecentTx(PDO $db, int $userId, int $days = 30): array {
    $stmt = $db->prepare('SELECT * FROM transactions WHERE user_id=? AND date>=DATE_SUB(CURDATE(),INTERVAL ? DAY) ORDER BY date DESC,created_at DESC LIMIT 8');
    $stmt->execute([$userId, $days]);
    return $stmt->fetchAll();
}

function getDebts(PDO $db, int $userId): array {
    $stmt = $db->prepare("SELECT * FROM debts WHERE user_id=? AND status IN ('PENDING','UNPAID') ORDER BY due_date ASC");
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

function createTransaction(PDO $db, int $userId, array $tx): void {
    $db->prepare('INSERT INTO transactions (user_id,type,montant,libelle,categorie,source,date) VALUES (?,?,?,?,?,?,?)')
       ->execute([$userId, $tx['type'], (int)$tx['montant'], $tx['libelle'], $tx['categorie'] ?? 'Autre', $tx['source'] ?? 'WHATSAPP', $tx['date'] ?? date('Y-m-d')]);
}

function createDebt(PDO $db, int $userId, array $d): void {
    $db->prepare('INSERT INTO debts (user_id,client_name,amount,description) VALUES (?,?,?,?)')
       ->execute([$userId, $d['clientName'], (int)$d['amount'], $d['description'] ?? '']);
}

function generateInvoiceNumber(PDO $db, int $userId): string {
    $year = date('Y');
    $stmt = $db->prepare('SELECT COUNT(*) FROM invoices WHERE user_id=? AND YEAR(date_emission)=?');
    $stmt->execute([$userId, $year]);
    return 'SC-' . $year . '-' . str_pad((int)$stmt->fetchColumn() + 1, 3, '0', STR_PAD_LEFT);
}

function createQuickInvoice(PDO $db, int $userId, array $f): int {
    $numero = generateInvoiceNumber($db, $userId);
    $ht     = (int)$f['montant'];
    $tva    = !empty($f['tva']) ? 1 : 0;
    $tvaAmt = $tva ? (int)round($ht * 0.18) : 0;
    $ttc    = $ht + $tvaAmt;
    $db->prepare('INSERT INTO invoices (user_id,numero,client_name,date_emission,tva_applicable,montant_ht,montant_tva,montant_ttc,statut) VALUES (?,?,?,CURDATE(),?,?,?,?,\'BROUILLON\')')
       ->execute([$userId, $numero, $f['clientName'], $tva, $ht, $tvaAmt, $ttc]);
    $id = (int)$db->lastInsertId();
    $db->prepare('INSERT INTO invoice_items (invoice_id,description,quantite,prix_unitaire,total) VALUES (?,?,1,?,?)')
       ->execute([$id, $f['description'] ?? 'Prestation', $ht, $ht]);
    return $id;
}

function fcfa(int $n): string {
    return number_format($n, 0, ',', ' ') . ' FCFA';
}

// ── PENDING CONFIRMATIONS ─────────────────────────────────────
function savePendingConfirmation(PDO $db, int $userId, array $data): void {
    $db->prepare("UPDATE pending_validations SET status='CANCELLED' WHERE user_id=? AND status='WAITING'")->execute([$userId]);
    $db->prepare("INSERT INTO pending_validations (user_id,temp_data,status) VALUES (?,?,'WAITING')")->execute([$userId, json_encode($data)]);
}

function getPendingConfirmation(PDO $db, int $userId): ?array {
    $stmt = $db->prepare("SELECT * FROM pending_validations WHERE user_id=? AND status='WAITING' ORDER BY id DESC LIMIT 1");
    $stmt->execute([$userId]);
    $row  = $stmt->fetch();
    if (!$row) return null;
    $data = json_decode($row['temp_data'], true);
    if (!in_array($data['type'] ?? '', ['VOICE_CONFIRM', 'PHOTO_CONFIRM'])) return null;
    return array_merge(['id' => $row['id']], $data);
}

function resolvePending(PDO $db, int $id, string $status): void {
    $db->prepare('UPDATE pending_validations SET status=? WHERE id=?')->execute([$status, $id]);
}

function isConfirmation(string $msg): bool {
    return in_array(mb_strtolower(trim($msg)), ['oui','yes','waaw','ok','okay','o','correct','confirme','valide','d\'accord','exactement']);
}

function isRejection(string $msg): bool {
    return in_array(mb_strtolower(trim($msg)), ['non','no','deedeet','nope','n','annule','annuler','faux','incorrect','pas ça','refuser']);
}

function buildContext(PDO $db, array $user): string {
    $kpis  = getKPIs($db, $user['id'], 30);
    $txs   = getRecentTx($db, $user['id'], 30);
    $debts = getDebts($db, $user['id']);
    $lines = array_map(fn($t) => $t['date'].' | '.$t['type'].' | '.fcfa((int)$t['montant']).' | '.$t['libelle'], array_slice($txs, 0, 5));
    return "CONTEXTE (30j) :\nCA : ".fcfa($kpis['ca'])."\nCharges : ".fcfa($kpis['charges'])."\nNet : ".fcfa($kpis['net'])."\n\nDERNIÈRES TX :\n".(implode("\n",$lines)?:'Aucune')."\n\nCRÉANCES ACTIVES : ".count($debts)." — Total : ".fcfa(array_sum(array_column($debts,'amount')))."\nPlan : ".$user['plan'];
}

// ── GEMINI TEXT ───────────────────────────────────────────────
function callGemini(string $prompt): ?array {
    $url  = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . GEMINI_KEY;
    $body = json_encode(['contents' => [['parts' => [['text' => $prompt]]]], 'generationConfig' => ['temperature' => 0.3, 'maxOutputTokens' => 1024]]);
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => $body, CURLOPT_TIMEOUT => 20]);
    $resp = curl_exec($ch);
    if (curl_errno($ch)) { error_log('[Gemini] '.curl_error($ch)); curl_close($ch); return null; }
    curl_close($ch);
    $data = json_decode($resp, true);
    $text = preg_replace('/```json|```/i', '', trim($data['candidates'][0]['content']['parts'][0]['text'] ?? ''));
    $parsed = json_decode(trim($text), true);
    return is_array($parsed) ? $parsed : null;
}

// ── GEMINI AUDIO ──────────────────────────────────────────────
function transcribeAudio(string $audioBase64, string $mimeType): ?string {
    $url  = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . GEMINI_KEY;
    $body = json_encode(['contents' => [['parts' => [['text' => 'Transcris ce message vocal. La personne parle en wolof, français, ou les deux. Retourne UNIQUEMENT la transcription brute. Si inaudible, réponds : [inaudible].'], ['inline_data' => ['mime_type' => $mimeType, 'data' => $audioBase64]]]]], 'generationConfig' => ['temperature' => 0.1, 'maxOutputTokens' => 300]]);
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => $body, CURLOPT_TIMEOUT => 25]);
    $resp = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($resp, true);
    return trim($data['candidates'][0]['content']['parts'][0]['text'] ?? '') ?: null;
}

// ── GEMINI VISION ─────────────────────────────────────────────
function callGeminiVision(string $imageBase64, string $mimeType): ?array {
    $OCR = 'Tu es un assistant OCR pour reçus sénégalais. Analyse cette image et extrait les infos comptables. Montant en FCFA. Type: DEPENSE si achat, RECETTE si vente. Réponds UNIQUEMENT en JSON: {"found":true,"type":"DEPENSE|RECETTE","montant":0,"libelle":"","categorie":"","date":"YYYY-MM-DD|null","confidence":"high|medium|low","details":""}';
    $url  = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . GEMINI_KEY;
    $body = json_encode(['contents' => [['parts' => [['text' => $OCR], ['inline_data' => ['mime_type' => $mimeType, 'data' => $imageBase64]]]]], 'generationConfig' => ['temperature' => 0.1, 'maxOutputTokens' => 512]]);
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_HTTPHEADER => ['Content-Type: application/json'], CURLOPT_POSTFIELDS => $body, CURLOPT_TIMEOUT => 30]);
    $resp = curl_exec($ch);
    curl_close($ch);
    $data = json_decode($resp, true);
    $text = preg_replace('/```json|```/i', '', trim($data['candidates'][0]['content']['parts'][0]['text'] ?? ''));
    $parsed = json_decode(trim($text), true);
    return is_array($parsed) ? $parsed : null;
}

// ── TRAITER MESSAGE VOCAL ─────────────────────────────────────
function processVoice(string $phone, string $mediaId, string $mimeType): void {
    $db   = getDB();
    $user = $db ? getOrCreateUser($db, $phone) : null;
    if (!$user || !isActive($user)) { sendWhatsApp($phone, 'Abonnement requis : ' . APP_URL . '/pricing'); return; }
    sendWhatsApp($phone, '🎤 Vocal reçu, je transcris...');
    $media = downloadMetaMedia($mediaId);
    if (!$media) { sendWhatsApp($phone, 'Je n\'ai pas pu lire le vocal. Réessaie ou écris ta transaction.'); return; }
    $transcription = transcribeAudio($media['base64'], $mimeType);
    if (!$transcription || $transcription === '[inaudible]') { sendWhatsApp($phone, 'Je n\'ai pas bien entendu. Parle plus près du micro, ou écris ta transaction.'); return; }
    error_log('[Voice->Text] ' . $phone . ': ' . $transcription);
    savePendingConfirmation($db, $user['id'], ['type' => 'VOICE_CONFIRM', 'transcription' => $transcription]);
    sendWhatsApp($phone, "🎤 J'ai compris :\n\n_\"$transcription\"_\n\nC'est correct ? Réponds *OUI* pour enregistrer ou *NON* pour annuler.");
}

// ── TRAITER PHOTO ─────────────────────────────────────────────
function processPhoto(string $phone, string $mediaId, string $mimeType): void {
    $db   = getDB();
    $user = $db ? getOrCreateUser($db, $phone) : null;
    if (!$user || !isActive($user)) { sendWhatsApp($phone, 'Abonnement requis : ' . APP_URL . '/pricing'); return; }
    if ($user['plan'] === 'FREE' && getMonthlyTxCount($db, $user['id']) >= 20) { sendWhatsApp($phone, 'Limite gratuite atteinte. ' . APP_URL . '/pricing'); return; }
    sendWhatsApp($phone, '📷 Photo reçue, j\'analyse le reçu...');
    $media = downloadMetaMedia($mediaId);
    if (!$media) { sendWhatsApp($phone, 'Je n\'ai pas pu lire l\'image. Réessaie ou saisis manuellement.'); return; }
    $result = callGeminiVision($media['base64'], $media['mime']);
    if (!$result || empty($result['found'])) { sendWhatsApp($phone, "Je ne reconnais pas de reçu.\nEnvoie-moi : \"payé [article] [montant]\""); return; }
    if (!$result['montant']) { sendWhatsApp($phone, "J'ai vu un reçu mais le montant n'est pas lisible.\nDis-moi : \"payé " . ($result['libelle'] ?? 'achat') . " [montant]\""); return; }
    $tx = ['type' => $result['type'] ?? 'DEPENSE', 'montant' => (int)$result['montant'], 'libelle' => $result['libelle'] ?? 'Achat (photo)', 'categorie' => $result['categorie'] ?? 'Autre dépense', 'date' => $result['date'] ?? date('Y-m-d')];
    savePendingConfirmation($db, $user['id'], ['type' => 'PHOTO_CONFIRM', 'transaction' => $tx]);
    $conf = match($result['confidence'] ?? 'medium') { 'high' => '', 'medium' => ' _(approximatif)_', default => ' _(faible confiance)_' };
    sendWhatsApp($phone, "📋 *J'ai lu ce reçu*$conf\n\n" . ucfirst(strtolower($tx['type'])) . " · " . fcfa($tx['montant']) . "\nObjet : " . $tx['libelle'] . "\nCatégorie : " . $tx['categorie'] . ($tx['date'] ? "\nDate : " . $tx['date'] : '') . "\n\nC'est correct ? Réponds *OUI* pour enregistrer ou *NON* pour annuler.");
}

// ── TRAITER MESSAGE TEXTE ─────────────────────────────────────
function processMessage(string $phone, string $msgBody): void {
    global $SYSTEM_PROMPT;
    $db   = getDB();
    if (!$db) { sendWhatsApp($phone, 'Erreur technique. Réessaie dans un instant.'); return; }
    $user = getOrCreateUser($db, $phone);
    if (!$user) { sendWhatsApp($phone, 'Erreur de compte.'); return; }

    // Nouveau utilisateur
    if (strtotime($user['created_at']) > time() - 30) {
        sendWhatsApp($phone, "*Bienvenue sur SenCompta IA !*\n\nJe suis ton assistant comptable. Envoie-moi tes transactions en français ou en wolof.\n\n- \"vendu tissus 25 000\"\n- \"payé transport 3 500\"\n- \"mon solde\"\n- \"facture pour Aminata 50 000\"\n\nDashboard : " . APP_URL . "/dashboard");
        return;
    }

    if (!isActive($user)) { sendWhatsApp($phone, 'Abonnement expiré. Renouvelle : ' . APP_URL . '/pricing'); return; }

    // Vérifier confirmation en attente
    $pending = getPendingConfirmation($db, $user['id']);
    if ($pending) {
        if (isConfirmation($msgBody)) {
            resolvePending($db, $pending['id'], 'CONFIRMED');
            if ($pending['type'] === 'VOICE_CONFIRM') {
                sendWhatsApp($phone, '✓ Transcription confirmée. Je traite ta demande...');
                $msgBody = $pending['transcription'];
            } elseif ($pending['type'] === 'PHOTO_CONFIRM') {
                $tx = $pending['transaction'];
                createTransaction($db, $user['id'], $tx);
                sendWhatsApp($phone, "✓ *" . ucfirst(strtolower($tx['type'])) . " enregistrée*\n\n" . fcfa((int)$tx['montant']) . " · " . $tx['libelle'] . "\nCatégorie : " . $tx['categorie']);
                return;
            }
        } elseif (isRejection($msgBody)) {
            resolvePending($db, $pending['id'], 'CANCELLED');
            sendWhatsApp($phone, 'Annulé. Envoie un nouveau message ou vocal.');
            return;
        } else {
            resolvePending($db, $pending['id'], 'CANCELLED');
        }
    }

    // Appel Gemini
    $context = buildContext($db, $user);
    $prompt  = $SYSTEM_PROMPT . "\n\n" . $context . "\n\nMessage : \"$msgBody\"\nDate : " . date('Y-m-d') . "\n\nJSON uniquement.";
    $parsed  = callGemini($prompt);
    if (!$parsed) { sendWhatsApp($phone, "Je n'ai pas compris. Essaie : \"vendu tissus 25 000\" ou \"mon solde\""); return; }

    $intent  = $parsed['intent'] ?? 'INCONNU';
    $msg_usr = $parsed['message_utilisateur'] ?? '';
    $isFree  = $user['plan'] === 'FREE';

    switch ($intent) {
        case 'TRANSACTION':
            $tx = $parsed['transaction'] ?? null;
            if (!$tx || !$tx['montant'] || !$tx['type']) { sendWhatsApp($phone, $msg_usr ?: "Je n'ai pas compris le montant."); break; }
            if ($isFree && getMonthlyTxCount($db, $user['id']) >= 20) { sendWhatsApp($phone, "Tu as utilisé tes 20 transactions gratuites ce mois.\n" . APP_URL . '/pricing'); break; }
            if (!empty($parsed['needs_confirmation'])) { sendWhatsApp($phone, $msg_usr); break; }
            createTransaction($db, $user['id'], ['type' => $tx['type'], 'montant' => (int)$tx['montant'], 'libelle' => $tx['libelle'] ?? $msgBody, 'categorie' => $tx['categorie'] ?? 'Autre', 'date' => $tx['date'] ?? date('Y-m-d')]);
            $suffix = '';
            if ($isFree) { $rem = 20 - getMonthlyTxCount($db, $user['id']); if ($rem <= 3) $suffix = "\n\n_Il te reste $rem transaction(s) gratuite(s) ce mois._"; }
            sendWhatsApp($phone, $msg_usr . $suffix);
            break;

        case 'BILAN':
            $periode = $parsed['periode'] ?? '30';
            $kpis = $periode === 'TODAY' ? getKPIsToday($db, $user['id']) : getKPIs($db, $user['id'], (int)$periode);
            $label = match($periode) { 'TODAY' => "aujourd'hui", '7' => '7 derniers jours', '365' => 'cette année', default => 'ce mois' };
            sendWhatsApp($phone, "*Bilan — $label*\n\nRecettes  " . fcfa($kpis['ca']) . "\nDépenses  " . fcfa($kpis['charges']) . "\n━━━━━━━━━━━━━━\nNet       " . ($kpis['net'] >= 0 ? '+' : '') . fcfa($kpis['net']) . (canDashboard($user) ? "\n\nDashboard : " . APP_URL . "/dashboard" : ''));
            break;

        case 'HISTORIQUE':
            $txs = getRecentTx($db, $user['id'], (int)($parsed['periode'] ?? 30));
            if (empty($txs)) { sendWhatsApp($phone, 'Aucune transaction sur cette période.'); break; }
            $lines = array_map(fn($t) => ($t['type']==='RECETTE'?'+':'-') . ' ' . $t['date'] . ' | ' . fcfa((int)$t['montant']) . ' | ' . $t['libelle'], $txs);
            sendWhatsApp($phone, count($txs) . " transaction(s) :\n\n" . implode("\n", $lines));
            break;

        case 'DETTES':
            $dette = $parsed['dette'] ?? null;
            if ($dette && !empty($dette['clientName']) && !empty($dette['amount'])) {
                createDebt($db, $user['id'], $dette);
                sendWhatsApp($phone, $msg_usr ?: 'Créance enregistrée pour ' . $dette['clientName'] . ' — ' . fcfa((int)$dette['amount']));
            } else {
                $debts = getDebts($db, $user['id']);
                if (empty($debts)) { sendWhatsApp($phone, 'Aucune créance active. Bonne nouvelle !'); break; }
                $list  = array_map(fn($d, $i) => ($i+1).'. '.$d['client_name'].' — '.fcfa((int)$d['amount']), $debts, array_keys($debts));
                sendWhatsApp($phone, "*Créances (" . count($debts) . ")*\n\n" . implode("\n", $list) . "\n\nTotal : " . fcfa(array_sum(array_column($debts, 'amount'))));
            }
            break;

        case 'FACTURE_GUIDE':
            if (!canDashboard($user)) { sendWhatsApp($phone, "Factures disponibles en plan Standard.\n" . APP_URL . '/pricing'); break; }
            sendWhatsApp($phone, "*Créer une facture*\n\nDis-moi :\n\"facture pour [nom] [montant] [description]\"\n\nEx : \"facture pour Amadou 75 000 couture\"\n\nOu depuis ton dashboard :\n" . APP_URL . '/dashboard/invoices');
            break;

        case 'FACTURE_RAPIDE':
            if (!canDashboard($user)) { sendWhatsApp($phone, "Factures disponibles en plan Standard.\n" . APP_URL . '/pricing'); break; }
            $f = $parsed['facture_rapide'] ?? null;
            if (!$f || empty($f['clientName']) || empty($f['montant'])) { sendWhatsApp($phone, "Précise : \"facture pour [nom] [montant] [description]\""); break; }
            createQuickInvoice($db, $user['id'], $f);
            sendWhatsApp($phone, "✓ *Facture créée — brouillon*\n\nClient : " . $f['clientName'] . "\nMontant : " . fcfa((int)$f['montant']) . "\n\nTélécharge le PDF :\n" . APP_URL . '/dashboard/invoices');
            break;

        case 'SALUTATION':
            $kpis = getKPIs($db, $user['id'], 30);
            $note = $isFree ? "\n\n_Plan gratuit — " . (20 - getMonthlyTxCount($db, $user['id'])) . " transactions restantes ce mois_" : '';
            sendWhatsApp($phone, "Bonjour ! Je suis SenCompta IA.\n\nCe mois : *" . fcfa($kpis['ca']) . "* de recettes\n\n- Enregistrer une vente ou dépense\n- Afficher ton bilan\n- Créer une facture\n- Suivre tes créances" . $note);
            break;

        case 'AIDE':
            sendWhatsApp($phone, "*SenCompta IA — Guide*\n\n💰 \"vendu tissus 25 000\"\n🛒 \"payé transport 3 500\"\n📊 \"mon solde\"\n📋 \"Amadou me doit 20 000\"\n🧾 \"facture pour Aminata 50 000 couture\"\n\nJe comprends le français et le wolof.\nDashboard : " . APP_URL . '/dashboard');
            break;

        default:
            sendWhatsApp($phone, $msg_usr ?: 'Tape *aide* pour voir comment je fonctionne.');
    }
}

// ── ENTRY POINT (POST — Meta JSON) ───────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);

    // Vérifier que c'est bien un message WhatsApp
    if (($payload['object'] ?? '') !== 'whatsapp_business_account') {
        http_response_code(200);
        echo json_encode(['status' => 'ignored']);
        exit;
    }

    $changes  = $payload['entry'][0]['changes'][0]['value'] ?? [];
    $messages = $changes['messages'] ?? [];

    if (empty($messages)) {
        http_response_code(200);
        echo json_encode(['status' => 'no_message']);
        exit;
    }

    $message = $messages[0];
    $from    = $message['from'] ?? '';
    $type    = $message['type'] ?? 'text';

    if (!$from) {
        http_response_code(200);
        echo json_encode(['status' => 'no_from']);
        exit;
    }

    // Répondre immédiatement à Meta (200 obligatoire en < 5s)
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
    if (ob_get_level()) ob_end_flush();
    flush();
    if (function_exists('fastcgi_finish_request')) fastcgi_finish_request();

    // Traitement asynchrone
    if ($type === 'text') {
        $body = $message['text']['body'] ?? '';
        if ($body) processMessage($from, $body);

    } elseif ($type === 'image') {
        $mediaId   = $message['image']['id']        ?? '';
        $mimeType  = $message['image']['mime_type'] ?? 'image/jpeg';
        $caption   = $message['image']['caption']   ?? '';
        if ($mediaId) {
            // Si la photo a une légende, traiter aussi comme texte
            if ($caption) processMessage($from, $caption);
            else processPhoto($from, $mediaId, $mimeType);
        }

    } elseif ($type === 'audio') {
        $mediaId  = $message['audio']['id']        ?? '';
        $mimeType = $message['audio']['mime_type'] ?? 'audio/ogg; codecs=opus';
        if ($mediaId) processVoice($from, $mediaId, $mimeType);

    } elseif ($type === 'document') {
        // Document (PDF etc.) — ignorer
        sendWhatsApp($from, 'Envoie-moi une photo de reçu ou un message vocal pour enregistrer une transaction.');
    }

    exit;
}

http_response_code(200);
echo json_encode(['status' => 'ok']);
