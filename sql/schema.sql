-- ============================================================
-- Glitch.TEC — esquema MySQL / MariaDB
-- Ejecutar en phpMyAdmin o: mysql -u root < sql/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS glitchtec
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE glitchtec;

-- ------------------------------------------------------------
-- Partidas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partidas (
  id             INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  player_name    VARCHAR(40)      NOT NULL DEFAULT 'estudiante',
  status         ENUM('running','won','lost','abandoned')
                                  NOT NULL DEFAULT 'running',
  won            TINYINT(1)       NOT NULL DEFAULT 0,
  score          INT              NOT NULL DEFAULT 0,
  base_score     INT              NOT NULL DEFAULT 0,
  level_reached  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  elapsed_sec    INT UNSIGNED     NOT NULL DEFAULT 0,
  integrity_end  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  mistakes       INT UNSIGNED     NOT NULL DEFAULT 0,
  hints_used     INT UNSIGNED     NOT NULL DEFAULT 0,
  popups_closed  INT UNSIGNED     NOT NULL DEFAULT 0,
  started_at     DATETIME         NOT NULL,
  finished_at    DATETIME         NULL,
  PRIMARY KEY (id),
  KEY idx_score (score DESC),
  KEY idx_status (status),
  KEY idx_finished (finished_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Eventos de gameplay (analytics / debugging)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eventos (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  partida_id   INT UNSIGNED    NOT NULL,
  event_type   VARCHAR(40)     NOT NULL,
  detail_json  JSON            NULL,
  created_at   DATETIME        NOT NULL,
  PRIMARY KEY (id),
  KEY idx_partida (partida_id),
  KEY idx_type (event_type),
  CONSTRAINT fk_eventos_partida
    FOREIGN KEY (partida_id) REFERENCES partidas(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Datos de ejemplo (opcionales, para probar el ranking)
-- ------------------------------------------------------------
INSERT INTO partidas
  (player_name, status, won, score, base_score, level_reached,
   elapsed_sec, integrity_end, mistakes, hints_used, popups_closed,
   started_at, finished_at)
VALUES
  ('Nayla',   'won',  1, 2840, 2100, 4, 720, 78, 2, 1, 14,
   DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 12 MINUTE),
  ('Santiago','won',  1, 2510, 1950, 4, 840, 61, 4, 2, 11,
   DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 14 MINUTE),
  ('Alex',    'lost', 0, 980,  980,  2, 310,  0, 5, 1,  6,
   DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR) + INTERVAL 5 MINUTE),
  ('Morena',  'won',  1, 3120, 2300, 4, 690, 92, 1, 0, 18,
   DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR) + INTERVAL 11 MINUTE);
