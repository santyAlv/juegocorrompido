/* ============================================================
   Glitch.TEC — estado global del juego
   Centraliza integridad (vidas), puntaje, tiempo, nivel e infeccion.
   Cualquier modulo lee/escribe aca y avisa por el bus de eventos.
   ============================================================ */
(function (window) {
  'use strict';

  var GT = window.GlitchTec || (window.GlitchTec = {});

  GT.CONFIG = {
    MAX_INTEGRITY: 100,
    POPUP_DRAIN_PER_SEC: 0.55,   // integridad que roba cada pop-up abierto
    POPUP_MAX_ON_SCREEN: 6,
    HINT_COST: 40,
    TICK_MS: 250
  };

  /* ---------------- Bus de eventos minimo ---------------- */
  var listeners = {};

  GT.on = function (evt, fn) {
    (listeners[evt] || (listeners[evt] = [])).push(fn);
  };

  GT.emit = function (evt, payload) {
    var fns = listeners[evt];
    if (!fns) return;
    for (var i = 0; i < fns.length; i++) {
      try { fns[i](payload); } catch (e) { console.error('[' + evt + ']', e); }
    }
  };

  /* ---------------- Estado ---------------- */
  GT.state = null;

  GT.resetState = function () {
    GT.state = {
      running: false,
      finished: false,
      mode: 'virus',            // 'virus' (PC corrompida) | 'tecnico' (servicio tecnico)
      level: 0,                 // 0 = todavia no arranco
      integrity: GT.CONFIG.MAX_INTEGRITY,
      score: 0,
      elapsed: 0,               // segundos jugados
      hintsUsed: 0,
      mistakes: 0,
      popupsClosed: 0,
      popupsSpawned: 0,
      objectives: [],           // objetivos del nivel actual
      flags: {},                // marcas de progreso libres (ej. archivo escaneado)
      learned: [],              // conceptos educativos desbloqueados

      /* Modo tecnico */
      techMinutes: 0,           // minutos de taller consumidos
      techCost: 0,              // plata gastada en repuestos
      techSolved: 0             // ordenes de trabajo cerradas
    };
    return GT.state;
  };

  GT.resetState();

  /* ---------------- Puntaje ---------------- */
  GT.addScore = function (points, reason) {
    var s = GT.state;
    if (!s.running) return;
    s.score = Math.max(0, s.score + points);
    GT.emit('score', { delta: points, reason: reason, total: s.score });
    GT.emit('hud');
  };

  /* ---------------- Integridad (vidas) ---------------- */
  GT.damage = function (amount, reason) {
    var s = GT.state;
    if (!s.running || s.finished) return;
    s.integrity = Math.max(0, s.integrity - amount);
    GT.emit('damage', { amount: amount, reason: reason, integrity: s.integrity });
    GT.emit('hud');
    if (s.integrity <= 0) GT.emit('gameover', { reason: reason });
  };

  GT.heal = function (amount, reason) {
    var s = GT.state;
    if (!s.running) return;
    s.integrity = Math.min(GT.CONFIG.MAX_INTEGRITY, s.integrity + amount);
    GT.emit('heal', { amount: amount, reason: reason });
    GT.emit('hud');
  };

  /* La infeccion es el reverso de la integridad, con un piso por nivel:
     aunque estes al 100%, avanzar de nivel implica un sistema mas comprometido. */
  GT.getInfection = function () {
    var s = GT.state;
    var base = Math.min(40, s.level * 8);
    var fromDamage = (GT.CONFIG.MAX_INTEGRITY - s.integrity) * 0.75;
    return Math.max(0, Math.min(100, Math.round(base + fromDamage)));
  };

  /* ---------------- Conceptos aprendidos ---------------- */
  GT.learn = function (concept) {
    if (GT.state.learned.indexOf(concept) === -1) GT.state.learned.push(concept);
  };

  /* ---------------- Utilidades ---------------- */
  GT.formatTime = function (totalSeconds) {
    var m = Math.floor(totalSeconds / 60);
    var sec = Math.floor(totalSeconds % 60);
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  };

  GT.rand = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  GT.pick = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  GT.escapeHtml = function (str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

})(window);
