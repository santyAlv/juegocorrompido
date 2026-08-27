<?php
/**
 * Glitch.TEC — ranking de mejores puntajes
 * GET api/ranking.php?limit=10
 */
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$limit = (int)($_GET['limit'] ?? 10);
if ($limit < 1)  $limit = 10;
if ($limit > 50) $limit = 50;

try {
    $stmt = db()->prepare(
        'SELECT player_name AS player,
                score,
                won,
                level_reached AS level,
                elapsed_sec AS time,
                finished_at AS at
         FROM partidas
         WHERE finished_at IS NOT NULL
         ORDER BY score DESC, finished_at ASC
         LIMIT :lim'
    );
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    // Cast numéricos para el front
    foreach ($rows as &$r) {
        $r['score'] = (int)$r['score'];
        $r['won']   = (bool)$r['won'];
        $r['level'] = (int)$r['level'];
        $r['time']  = (int)$r['time'];
    }
    unset($r);

    json_out(['ok' => true, 'offline' => false, 'ranking' => $rows]);
} catch (Throwable $e) {
    json_error('No se pudo obtener el ranking: ' . $e->getMessage(), 500);
}
