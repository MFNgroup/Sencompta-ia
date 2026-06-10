<?php
// Test rapide Gemini — à supprimer après debug
define('GEMINI_KEY', 'METTRE_GEMINI_API_KEY_ICI');

$url  = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . GEMINI_KEY;
$body = json_encode([
    'contents' => [['parts' => [['text' => 'Reponds juste: {"intent":"SALUTATION","message_utilisateur":"Bonjour!"}']]]],
    'generationConfig' => ['temperature' => 0.1, 'maxOutputTokens' => 100],
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_TIMEOUT        => 15,
]);
$resp    = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err     = curl_error($ch);
curl_close($ch);

header('Content-Type: application/json');
echo json_encode([
    'http_code' => $httpCode,
    'curl_error' => $err ?: null,
    'gemini_key_length' => strlen(GEMINI_KEY),
    'response' => json_decode($resp, true),
]);
