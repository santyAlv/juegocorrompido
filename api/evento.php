<?php
/**
 * Glitch.TEC — registra un evento de gameplay
 * POST { match_id, event_type, detail }
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$matchId = (int)($body['match_id'] ?? 0);
$type    = trim((string)($body['event_type'] ?? ''));
$detail  = $body['detail'] ?? [];

if ($matchId <= 0 || $type === '') {
    json_error('match_id y event_type son obligatorios');
}

$type = mb_substr(preg_replace('/[^a-z0-9_\-]/i', '', $type) ?? 'event', 0, 40);

try {
    $stmt = db()->prepare(
        'INSERT INTO eventos (partida_id, event_type, detail_json, created_at)
         VALUES (:pid, :etype, :detail, NOW())'
    );
    $stmt->execute([
        ':pid'    => $matchId,
        ':etype'  => $type,
        ':detail' => json_encode($detail, JSON_UNESCAPED_UNICODE),
    ]);
    json_out(['ok' => true]);
} catch (Throwable $e) {
    json_error('No se pudo registrar el evento: ' . $e->getMessage(), 500);
}
