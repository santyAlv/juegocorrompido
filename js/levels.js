/* ============================================================
   Glitch.TEC — progresion por niveles y objetivos
   Cada nivel define sus objetivos, su narrativa de entrada, sus
   pistas y su condicion de avance. Es el pegamento entre la
   Terminal, el Administrador de tareas, el correo y el jefe final.
   ============================================================ */
(function (window, document) {
  'use strict';

  var GT = window.GlitchTec;
  var levels = GT.levels = {};

  var advancing = false;

  /* ============================================================
     Definicion de niveles
     ============================================================ */
  var DEFS = {

    /* ---------------- NIVEL 1 ---------------- */
    1: {
      name: 'Reconocimiento',
      bonus: 250,
      objectives: [
        { id: 'l1_help',    text: 'Escribir "help" en la Terminal' },
        { id: 'l1_note',    text: 'Leer C:\\Documentos\\leeme.txt' },
        { id: 'l1_scan',    text: 'Analizar el archivo con doble extensión' },
        { id: 'l1_log',     text: 'Leer C:\\Sistema\\registro.log' },
        { id: 'l1_unlock',  text: 'Desbloquear la carpeta cuarentena' },
        { id: 'l1_payload', text: 'Analizar payload.bin' }
      ],
      intro: [
        { text: 'Hola, estudiante. Gracias por abrir esa foto tan linda que te mandaron.' },
        { text: 'Ahora vivo acá. En tu disco. Entre tus apuntes y tus contraseñas en texto plano.' },
        { text: 'Adelante, buscame. Te dejo la terminal abierta. No vas a encontrar nada.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Abrí la Terminal y escribí "help". Empezá leyendo tus propias notas en C:\\Documentos.' }
      ],
      outro: [
        { text: 'Encontraste mi cuerpo. Muy bien. Pero un archivo no es un proceso.' },
        { text: 'Yo ya estoy corriendo en memoria. Borrame el .bin, no me hace ni cosquillas.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Se habilitó el Administrador de tareas. Buscá qué está consumiendo la CPU.' }
      ],
      hint: function () {
        var f = doneMap();
        if (!f.l1_help)    return 'Escribí  help  en la Terminal y presioná Enter.';
        if (!f.l1_note)    return 'Usá:  cd Documentos   y después   type leeme.txt';
        if (!f.l1_scan)    return 'En C:\\Descargas hay un archivo que termina en .jpg.exe. Usá:  scan foto_vacaciones.jpg.exe';
        if (!f.l1_log)     return 'Andá a C:\\Sistema con  cd \\Sistema  y leé:  type registro.log';
        if (!f.l1_unlock)  return 'El log dice bin2dec(101101). Pasá 101101 de binario a decimal y usá:  unlock <numero>';
        if (!f.l1_payload) return 'Entrá con  cd cuarentena  y ejecutá:  scan payload.bin';
        return 'Ya completaste todo este nivel.';
      }
    },

    /* ---------------- NIVEL 2 ---------------- */
    2: {
      name: 'Contención',
      bonus: 350,
      objectives: [
        { id: 'l2_open', text: 'Abrir el Administrador de tareas' },
        { id: 'l2_kill', text: 'Terminar los procesos sin firma digital', count: 0, total: 4 }
      ],
      intro: [
        { text: 'Contá conmigo: cuatro procesos míos, y suben la CPU cada segundo que dudás.' },
        { text: 'Ah, y algunos tienen nombres parecidos a los tuyos. Suerte con eso.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Los procesos legítimos están firmados por "WinTEC Corp.". Los del malware no tienen firma. Terminalos con el botón o con  kill <pid>  en la Terminal.' }
      ],
      outro: [
        { text: 'Me sacaste de la memoria. Bien. Igual tengo cómo volver a entrar.' },
        { text: 'Tu casilla de correo, por ejemplo. Ya te mandé algunas cositas.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Se habilitó TEC-Mail. Revisá la bandeja y clasificá cada correo antes de que el malware reingrese.' }
      ],
      hint: function () {
        var f = doneMap();
        if (!f.l2_open) return 'Doble click en el icono "Administrador de tareas" del escritorio.';
        return 'Mirá la columna FIRMA DIGITAL: los que dicen "Sin firma ✘" son del malware. ' +
               'Ojo con svch0st.exe, tiene un CERO en lugar de la letra O.';
      }
    },

    /* ---------------- NIVEL 3 ---------------- */
    3: {
      name: 'Phishing',
      bonus: 350,
      objectives: [
        { id: 'l3_open',   text: 'Abrir TEC-Mail' },
        { id: 'l3_triage', text: 'Clasificar todos los correos', count: 0, total: 5 }
      ],
      intro: [
        { text: 'Cinco correos. Algunos son míos. Otros no. ¿Sabés cuáles?' },
        { text: 'Si te equivocás, me abrís la puerta de nuevo. Y esta vez traigo amigos.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Antes de decidir, mirá el dominio real del remitente, los adjuntos y a dónde apunta el enlace.' }
      ],
      outro: [
        { text: 'Basta. Ya no me divertís.' },
        { text: 'Vení al núcleo si tenés tanto coraje. Terminal. Escribí purge. Te espero.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Última fase: escribí  purge  en la Terminal para atacar el núcleo del malware.' }
      ],
      hint: function () {
        var f = doneMap();
        if (!f.l3_open) return 'Doble click en el icono "TEC-Mail" del escritorio.';
        return 'Revisá el dominio DESPUÉS de la última arroba y antes de la primera barra: ' +
               'en "tec-edu.verificacion-cuenta.com" el dominio real es verificacion-cuenta.com.';
      }
    },

    /* ---------------- NIVEL 4 ---------------- */
    4: {
      name: 'Purga',
      bonus: 500,
      objectives: [
        { id: 'l4_open', text: 'Escribir "purge" en la Terminal' },
        { id: 'l4_boss', text: 'Reducir la integridad del malware a 0', count: 0, total: 5 }
      ],
      intro: [
        { text: 'Estoy en el núcleo del sistema. Para sacarme tenés que demostrar que entendiste algo.' },
        { text: 'Cinco preguntas. Cada respuesta correcta me borra un pedazo. Cada error, te borra a vos.' },
        { friendly: true, who: 'SISTEMA',
          text: 'Escribí  purge  en la Terminal para iniciar la secuencia final.' }
      ],
      hint: function () {
        return 'Escribí  purge  en la Terminal. Después respondé con lo que aprendiste en los niveles anteriores.';
      }
    }
  };

  levels.DEFS = DEFS;

  function doneMap() {
    var m = {};
    GT.state.objectives.forEach(function (o) { m[o.id] = o.done; });
    return m;
  }

  /* ============================================================
     Arranque de nivel
     ============================================================ */
  levels.start = function (n) {
    var def = DEFS[n];
    if (!def) return;

    advancing = false;
    GT.state.level = n;
    GT.state.objectives = def.objectives.map(function (o) {
      return { id: o.id, text: o.text, done: false, count: o.count, total: o.total };
    });

    levels.renderObjectives();
    GT.emit('hud');

    // Herramientas que se habilitan en cada nivel
    if (n >= 2) GT.ui.setIconLocked('taskmgr', false);
    if (n >= 3) GT.ui.setIconLocked('mail', false);

    if (n === 2) {
      GT.procs.init();
      GT.ui.pulseIcon('taskmgr', true);
    }
    if (n === 3) {
      GT.procs.stop();
      GT.mail.init();
      GT.ui.pulseIcon('mail', true);
    }
    if (n === 4) {
      GT.ui.toast('Escribí  purge  en la Terminal', 'warn');
    }

    GT.ui.say(def.intro, function () {
      if (n === 1) {
        GT.popups.start();
        GT.terminal.open();
      }
    });
  };

  /* ============================================================
     Objetivos
     ============================================================ */
  levels.find = function (id) {
    for (var i = 0; i < GT.state.objectives.length; i++) {
      if (GT.state.objectives[i].id === id) return GT.state.objectives[i];
    }
    return null;
  };

  /** Marca un objetivo como cumplido (ignora ids desconocidos). */
  levels.complete = function (id) {
    var o = levels.find(id);
    if (!o || o.done) return;

    o.done = true;
    if (o.total) o.count = o.total;

    GT.addScore(80, 'objetivo cumplido');
    GT.audio.ok();
    GT.ui.toast('✔ Objetivo: ' + o.text, 'info');
    levels.renderObjectives(id);
    checkLevelDone();
  };

  /** Suma progreso a un objetivo con contador. */
  levels.progress = function (id, amount) {
    var o = levels.find(id);
    if (!o || o.done) return;

    o.count = (o.count || 0) + (amount || 1);

    if (id === 'l2_kill') {
      // El total crece si el malware reinyecta procesos
      o.total = o.count + GT.procs.remainingHostile();
      if (GT.procs.remainingHostile() === 0) { o.done = true; }
    } else if (o.total && o.count >= o.total) {
      o.done = true;
    }

    if (o.done) {
      GT.addScore(80, 'objetivo cumplido');
      GT.audio.ok();
      GT.ui.toast('✔ Objetivo: ' + o.text, 'info');
    }

    levels.renderObjectives(id);
    checkLevelDone();
  };

  levels.renderObjectives = function (flashId) {
    var ul = document.getElementById('objective-list');
    if (!ul) return;
    ul.innerHTML = '';

    GT.state.objectives.forEach(function (o) {
      var li = document.createElement('li');
      li.className = (o.done ? 'done' : '') + (o.id === flashId ? ' fresh' : '');
      var counter = (o.total && !o.done) ? ' (' + (o.count || 0) + '/' + o.total + ')' : '';
      li.innerHTML = '<span class="mark">' + (o.done ? '[x]' : '[ ]') + '</span>' +
                     '<span>' + GT.escapeHtml(o.text + counter) + '</span>';
      ul.appendChild(li);
    });
  };

  levels.getHint = function () {
    var def = DEFS[GT.state.level];
    return def && def.hint ? def.hint() : null;
  };

  /* ============================================================
     Avance
     ============================================================ */
  function allDone() {
    return GT.state.objectives.length > 0 &&
           GT.state.objectives.every(function (o) { return o.done; });
  }

  function checkLevelDone() {
    if (advancing || GT.state.finished || !allDone()) return;

    var n = GT.state.level;

    // Nivel 3: castigo extra si no llego al minimo de aciertos
    if (n === 3 && GT.mail.correctCount() < GT.mail.requiredCorrect) {
      GT.damage(10, 'demasiados correos mal clasificados');
      GT.ui.toast('Clasificaste mal varios correos: el malware amplió su acceso', 'bad');
    }

    advancing = true;
    var def = DEFS[n];

    GT.addScore(def.bonus, 'nivel completado');
    GT.audio.levelUp();
    GT.ui.flash('gain');

    // Recompensa de integridad por terminar limpio
    if (GT.state.integrity < 90) GT.heal(8, 'nivel completado');

    setTimeout(function () {
      if (GT.state.finished) return;

      if (def.outro && def.outro.length) {
        GT.ui.say(def.outro, function () { goNext(n); });
      } else {
        goNext(n);
      }
    }, 700);
  }

  function goNext(n) {
    if (GT.state.finished) return;
    if (DEFS[n + 1]) {
      levels.start(n + 1);
    } else {
      GT.emit('victory');
    }
  }

  /** El jefe final avisa por aca cuando el malware muere. */
  levels.finishBoss = function () {
    var o = levels.find('l4_boss');
    if (o) { o.done = true; o.count = o.total; }
    levels.renderObjectives('l4_boss');
    GT.emit('victory');
  };

  levels.reset = function () { advancing = false; };

})(window, document);
