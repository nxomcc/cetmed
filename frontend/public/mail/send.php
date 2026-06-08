<?php
declare(strict_types=1);

// Replace this value on cPanel after deploy. Do not commit real tokens.
$MAIL_WEBHOOK_TOKEN = 'REPLACE_WITH_MAIL_WEBHOOK_TOKEN';
$MAIL_FROM = 'no-reply@cetmed.cl';
$MAIL_FROM_NAME = 'CETMED Capacitaciones';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$providedToken = $_SERVER['HTTP_X_MAIL_TOKEN'] ?? '';
if (!hash_equals($MAIL_WEBHOOK_TOKEN, $providedToken)) {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
  http_response_code(400);
  echo json_encode(['error' => 'Invalid JSON']);
  exit;
}

$to = filter_var($payload['to'] ?? '', FILTER_VALIDATE_EMAIL);
$subject = trim((string)($payload['subject'] ?? ''));
$html = (string)($payload['html'] ?? '');

if (!$to || $subject === '' || $html === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Missing to, subject or html']);
  exit;
}

$headers = [
  'MIME-Version: 1.0',
  'Content-type: text/html; charset=UTF-8',
  'From: ' . $MAIL_FROM_NAME . ' <' . $MAIL_FROM . '>',
  'Reply-To: contacto@cetmed.cl',
  'Return-Path: ' . $MAIL_FROM,
];

$ok = mail($to, $subject, $html, implode("\r\n", $headers));
if (!$ok) {
  http_response_code(500);
  echo json_encode(['error' => 'mail() failed']);
  exit;
}

echo json_encode(['ok' => true]);
