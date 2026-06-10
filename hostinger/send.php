<?php
// hostinger/send.php — Envoie un message WhatsApp via Meta Cloud API
// Appelé par Next.js Vercel (qui ne peut pas appeler Meta directement)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Webhook-Secret');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

// Vérification du secret
$secret = $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '';
define('WEBHOOK_SECRET', getenv('WEBHOOK_SECRET') ?: 'sencompta-webhook-2025');
if ($secret !== WEBHOOK_SECRET) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

define('META_PHONE_ID', '988352281037795');
define('META_TOKEN',    'METTRE_ACCESS_TOKEN_ICI');
define('META_API_URL',  'https://graph.facebook.com/v19.0');

$input = json_decode(file_get_contents('php://input'), true);
$to    = preg_replace('/\D/', '', $input['to']   ?? '');
$body  = trim($input['body'] ?? '');

if (!$to || !$body) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing to or body']);
    exit;
}

$data = json_encode([
    'messaging_product' => 'whatsapp',
    'recipient_type'    => 'individual',
    'to'                => $to,
    'type'              => 'text',
    'text'              => ['preview_url' => false, 'body' => $body],
]);

$ch = curl_init(META_API_URL . '/' . META_PHONE_ID . '/messages');
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

$resp    = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err     = curl_error($ch);
curl_close($ch);

if ($err) {
    http_response_code(500);
    echo json_encode(['error' => $err]);
    exit;
}

http_response_code($httpCode >= 200 && $httpCode < 300 ? 200 : 500);
echo $resp;
