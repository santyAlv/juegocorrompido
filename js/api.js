/* ============================================================
   Glitch.TEC — cliente API (PHP + MySQL)
   Guarda partidas y eventos en el servidor. Si PHP no está
   disponible (abrir index.html en file://), cae a localStorage
   para que el prototipo siga funcionando offline.
   ============================================================ */
(function (window) {
  'use strict';

  var GT = window.GlitchTec || (window.GlitchTec = {});
  var api = GT.api = {};

  var BASE = 'api';
  var matchId = null;
  var offline = false;
  var playerName = 'estudiante';

  function storageKey() { return 'glitchtec_scores'; }

  /** Modo de juego actual: 'virus' (PC corrompida) o 'tecnico' (taller). */
  function currentMode() {
    return (GT.state && GT.state.mode === 'tecnico') ? 'tecnico' : 'virus';
  }

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(storageKey()) || '[]'); }
    catch (e) { return []; }
  }

  function saveLocal(rows) {
    try { localStorage.setItem(storageKey(), JSON.stringify(rows.slice(0, 50))); }
    catch (e) { /* ignore */ }
  }

  function post(path, body) {
    return fetch(BASE + '/' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function get(path) {
    return fetch(BASE + '/' + path).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /** Comprueba si el backend PHP responde. */
  api.ping = function () {
    return get('ping.php').then(function (data) {
      offline = !(data && data.ok);
      return !offline;
    }).catch(function () {
      offline = true;
      return false;
    });
  };

  api.isOffline = function () { return offline; };

  api.setPlayerName = function (name) {
    playerName = String(name || 'estudiante').slice(0, 40);
  };

  /** Abre una partida nueva (al iniciar el juego). */
  api.startMatch = function () {
    matchId = null;
    var payload = {
      player_name: playerName,
      mode: currentMode(),
      started_at: new Date().toISOString()
    };

    if (offline) {
      matchId = 'local-' + Date.now();
      return Promise.resolve({ id: matchId, offline: true });
    }

    return post('partida_start.php', payload).then(function (data) {
      matchId = data.id;
      return data;
    }).catch(function () {
      offline = true;
      matchId = 'local-' + Date.now();
      return { id: matchId, offline: true };
    });
  };

  /** Registra un evento de juego (opcional, para analytics). */
  api.logEvent = function (type, detail) {
    if (!matchId) return;
    var payload = {
      match_id: matchId,
      event_type: type,
      detail: detail || {},
      at: new Date().toISOString()
    };
    if (offline) return;
    post('evento.php', payload).catch(function () { /* silencioso */ });
  };

  /** Cierra la partida con el resumen final. */
  api.finishMatch = function (summary) {
    var row = {
      match_id: matchId,
      player_name: playerName,
      mode: summary.mode || currentMode(),
      won: !!summary.won,
      score: summary.total || summary.base || 0,
      base_score: summary.base || 0,
      level_reached: summary.level || 0,
      elapsed_sec: summary.elapsed || 0,
      integrity: summary.integrity || 0,
      mistakes: summary.mistakes || 0,
      hints: summary.hints || 0,
      popups_closed: summary.popupsClosed || 0,
      finished_at: new Date().toISOString()
    };

    // Siempre guarda en local como respaldo
    var local = loadLocal();
    local.unshift({
      player: row.player_name,
      modo: row.mode,
      score: row.score,
      won: row.won,
      level: row.level_reached,
      time: row.elapsed_sec,
      at: row.finished_at
    });
    saveLocal(local);

    if (offline) return Promise.resolve({ offline: true, saved: true });

    return post('partida_end.php', row).catch(function () {
      offline = true;
      return { offline: true, saved: true };
    });
  };

  /** Ranking (servidor o local). */
  api.getRanking = function (limit, modo) {
    limit = limit || 10;
    var filtro = (modo === 'virus' || modo === 'tecnico') ? modo : null;

    function localRanking() {
      var rows = loadLocal();
      if (filtro) {
        rows = rows.filter(function (r) { return (r.modo || 'virus') === filtro; });
      }
      return rows.slice(0, limit);
    }

    if (offline) {
      return Promise.resolve({ offline: true, modo: filtro || 'todos', ranking: localRanking() });
    }

    return get('ranking.php?limit=' + limit + (filtro ? '&modo=' + filtro : '')).then(function (data) {
      return data;
    }).catch(function () {
      offline = true;
      return { offline: true, modo: filtro || 'todos', ranking: localRanking() };
    });
  };

  // Al cargar la página, intentar detectar el backend
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
      api.ping().then(function (ok) {
        if (ok) console.info('[Glitch.TEC] API PHP conectada');
        else console.info('[Glitch.TEC] Modo offline (localStorage)');
      });
    });
  }

})(window);
