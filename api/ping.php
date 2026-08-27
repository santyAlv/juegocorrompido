<?php
/**
 * Glitch.TEC — healthcheck del backend
 * GET api/ping.php  →  { ok: true, db: true/false }
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$dbOk = false;
try {
    db()->query('SELECT 1');
    $dbOk = true;
} catch (Throwable $e) {
    $dbOk = false;
}

json_out([
    'ok'      => true,
    'db'      => $dbOk,
    'service' => 'Glitch.TEC API',
    'version' => '0.4',
    'time'    => date('c'),
]);
