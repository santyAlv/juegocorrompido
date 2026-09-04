<?php
/**
 * Glitch.TEC — inicia una partida
 * POST { player_name, mode, started_at }  →  { ok, id }
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$body = read_json_body();
$name = trim((string)($body['player_name'] ?? 'estudiante'));
$name = mb_substr($name !== '' ? $name : 'estudiante', 0, 40);

// Modo de juego: 'virus' (PC corrompida) o 'tecnico' (servicio tecnico)
$mode = (string)($body['mode'] ?? 'virus');
$mode = ($mode === 'tecnico') ? 'tecnico' : 'virus';

try {
    $stmt = db()->prepare(
        'INSERT INTO partidas (player_name, modo, started_at, status)
         VALUES (:name, :modo, NOW(), \'running\')'
    );
    $stmt->execute([':name' => $name, ':modo' => $mode]);
    $id = (int) db()->lastInsertId();

    // Evento de arranque
    $ev = db()->prepare(
        'INSERT INTO eventos (partida_id, event_type, detail_json, created_at)
         VALUES (:pid, \'match_start\', :detail, NOW())'
    );
    $ev->execute([
        ':pid'    => $id,
        ':detail' => json_encode(['player' => $name, 'mode' => $mode], JSON_UNESCAPED_UNICODE),
    ]);

    json_out(['ok' => true, 'id' => $id]);
} catch (Throwable $e) {
    json_error('No se pudo crear la partida: ' . $e->getMessage(), 500);
}
