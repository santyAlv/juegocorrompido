/* ============================================================
   Glitch.TEC — Nivel 4: Purga (enfrentamiento final)
   El malware solo se borra si el jugador demuestra lo aprendido.
   Cinco preguntas contra reloj: cada acierto destruye el 20% del
   nucleo, cada error cuesta integridad y desata pop-ups.
   ============================================================ */
(function (window, document) {
  'use strict';

  var GT = window.GlitchTec;
  var boss = GT.boss = {};

  var WIN_ID = 'boss';

  var TIME_LIMIT = 120;          // segundos para completar la purga
  var DAMAGE_PER_HIT = 20;       // % de nucleo destruido por acierto

  var hp = 100;
  var timeLeft = TIME_LIMIT;
  var idx = 0;
  var answered = false;
  var active = false;

  var QUESTIONS = [
    {
      q: '¿Qué tipo de malware cifra tus archivos y exige un pago para devolvértelos?',
      options: ['Adware', 'Ransomware', 'Keylogger', 'Rootkit'],
      correct: 1,
      why: 'El <b>ransomware</b> cifra la información y pide un rescate. En el Nivel 2 lo viste ' +
           'como crypt0_lock.exe: consumía muchísima CPU justamente porque estaba cifrando el disco.'
    },
    {
      q: 'Te llega un adjunto llamado <b>curriculum.pdf.exe</b>. ¿Por qué es peligroso?',
      options: [
        'Porque los PDF siempre tienen virus',
        'Porque pesa demasiado para ser un currículum',
        'Porque la extensión real es .exe: es un programa disfrazado de documento',
        'Porque viene comprimido'
      ],
      correct: 2,
      why: 'Es una <b>doble extensión</b>. Windows oculta la extensión conocida, así que el usuario ve ' +
           '"curriculum.pdf" y ejecuta un programa sin darse cuenta. Igual que foto_vacaciones.jpg.exe.'
    },
    {
      q: '¿Cuál es la función de un <b>keylogger</b>?',
      options: [
        'Registrar todo lo que escribís con el teclado',
        'Acelerar el arranque del sistema',
        'Bloquear la pantalla hasta pagar',
        'Duplicar archivos para hacer copias de seguridad'
      ],
      correct: 0,
      why: 'Un <b>keylogger</b> captura cada pulsación y la envía al atacante: así obtiene usuarios, ' +
           'contraseñas y datos de tarjetas sin necesidad de romper ningún cifrado.'
    },
    {
      q: 'En el enlace <b>http://tec-edu.verificacion-cuenta.com/login</b>, ¿cuál es el dominio real?',
      options: ['tec-edu.com', 'tec-edu', 'verificacion-cuenta.com', 'login'],
      correct: 2,
      why: 'El dominio real son las <b>dos últimas partes antes de la primera barra</b>: ' +
           'verificacion-cuenta.com. Todo lo que está a la izquierda es un subdominio que el ' +
           'atacante puede escribir como quiera para imitar una marca.'
    },
    {
      q: 'Si <b>svchost.exe</b> es un proceso legítimo, ¿por qué <b>svch0st.exe</b> es sospechoso?',
      options: [
        'Porque consume menos memoria',
        'Porque imita el nombre real cambiando la "o" por un cero (typosquatting)',
        'Porque los procesos del sistema no terminan en .exe',
        'Porque tiene un PID muy alto'
      ],
      correct: 1,
      why: 'Se llama <b>typosquatting</b>: cambiar un carácter para pasar desapercibido en una lista larga. ' +
           'La verificación confiable no es el nombre sino la <b>firma digital</b> del proceso.'
    }
  ];

  /* ============================================================
     Ciclo
     ============================================================ */
  boss.reset = function () {
    hp = 100;
    timeLeft = TIME_LIMIT;
    idx = 0;
    answered = false;
    active = false;
  };

  boss.isActive = function () { return active; };
  boss.getHp = function () { return hp; };

  boss.open = function () {
    if (GT.ui.isOpen(WIN_ID)) { GT.ui.focusWindow(WIN_ID); return; }

    GT.levels.complete('l4_open');
    active = true;

    var body = document.createElement('div');
    body.className = 'boss';
    body.innerHTML =
      '<div class="boss-head">' +
        '<div class="who">NÚCLEO DEL MALWARE — GLITCH.CORE</div>' +
        '<div id="boss-canvas" style="height:74px;margin-bottom:9px;"></div>' +
        '<div class="boss-hpwrap">' +
          '<span class="lbl">INTEGRIDAD</span>' +
          '<div class="boss-hp"><i id="boss-hp-bar" style="width:100%"></i></div>' +
          '<span class="pct" id="boss-hp-pct">100%</span>' +
        '</div>' +
        '<div class="boss-timer" id="boss-timer">TIEMPO RESTANTE: 02:00</div>' +
      '</div>' +
      '<div class="boss-body" id="boss-body"></div>' +
      '<div class="boss-foot">' +
        '<span class="info" id="boss-info">Respondé con lo que aprendiste en los niveles anteriores.</span>' +
        '<button class="boss-next" id="boss-next" disabled>SIGUIENTE ▸</button>' +
      '</div>';

    GT.ui.openWindow({
      id: WIN_ID,
      title: 'purge.exe — secuencia de purga',
      icon: GT.ui.icons.skull,
      className: 'win-terminal',
      width: 660, height: 470,
      x: 130, y: 20,
      body: body,
      noClose: true                   // no se puede escapar del jefe final
    });

    document.getElementById('boss-next').addEventListener('click', next);

    if (GT.engine && GT.engine.startCore) GT.engine.startCore('boss-canvas');

    GT.audio.alarm();
    renderQuestion();
    renderHeader();
  };

  /* ============================================================
     Render
     ============================================================ */
  function renderHeader() {
    var bar = document.getElementById('boss-hp-bar');
    if (!bar) return;
    bar.style.width = hp + '%';
    document.getElementById('boss-hp-pct').textContent = hp + '%';

    var t = document.getElementById('boss-timer');
    t.textContent = 'TIEMPO RESTANTE: ' + GT.formatTime(Math.max(0, timeLeft));
    t.style.color = timeLeft < 30 ? '#ff3b52' : '#ffcc44';
  }

  function renderQuestion() {
    var box = document.getElementById('boss-body');
    if (!box) return;

    var q = QUESTIONS[idx];
    answered = false;

    var html = '<p class="boss-q"><span class="idx">[' + (idx + 1) + '/' + QUESTIONS.length + ']</span> ' +
               q.q + '</p><div class="boss-opts">';
    q.options.forEach(function (opt, i) {
      html += '<button class="boss-opt" data-i="' + i + '">' +
              String.fromCharCode(65 + i) + ')  ' + opt + '</button>';
    });
    html += '</div>';
    box.innerHTML = html;

    var btns = box.querySelectorAll('.boss-opt');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        answer(parseInt(this.dataset.i, 10));
      });
    }

    document.getElementById('boss-next').disabled = true;
    document.getElementById('boss-info').textContent =
      'Pregunta ' + (idx + 1) + ' de ' + QUESTIONS.length;
  }

  function answer(choice) {
    if (answered) return;
    answered = true;

    var q = QUESTIONS[idx];
    var right = (choice === q.correct);

    var box = document.getElementById('boss-body');
    var btns = box.querySelectorAll('.boss-opt');
    for (var i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      if (i === q.correct) btns[i].classList.add('right');
      else if (i === choice) btns[i].classList.add('wrong');
    }

    var fb = document.createElement('div');
    fb.className = 'boss-feedback';

    if (right) {
      hp = Math.max(0, hp - DAMAGE_PER_HIT);
      GT.addScore(200, 'respuesta correcta');
      GT.audio.ok();
      GT.ui.flash('gain');
      GT.levels.progress('l4_boss', 1);
      GT.learn(q.why.replace(/<[^>]+>/g, ''));
      fb.innerHTML = '<b>✔ CORRECTO.</b> Núcleo dañado −' + DAMAGE_PER_HIT + '%.<br>' + q.why;
      if (GT.engine && GT.engine.hitCore) GT.engine.hitCore();
    } else {
      GT.state.mistakes++;
      GT.damage(14, 'respuesta incorrecta en la purga');
      GT.addScore(-70, 'respuesta incorrecta');
      GT.audio.hurt();
      GT.ui.shake();
      GT.ui.flash('hit');
      GT.popups.burst(2);
      fb.innerHTML = '<b>✘ INCORRECTO.</b> El malware recupera terreno.<br>' + q.why;
    }

    box.appendChild(fb);
    box.scrollTop = box.scrollHeight;

    renderHeader();

    if (hp <= 0) {
      finish();
      return;
    }

    var nextBtn = document.getElementById('boss-next');
    nextBtn.disabled = false;
    nextBtn.textContent = (idx >= QUESTIONS.length - 1) ? 'FINALIZAR PURGA ▸' : 'SIGUIENTE ▸';
  }

  function next() {
    if (idx < QUESTIONS.length - 1) {
      idx++;
      renderQuestion();
      return;
    }
    finish();
  }

  function finish() {
    active = false;

    if (hp <= 0) {
      GT.ui.say([
        { text: 'no. no no no. me estás borrando de verdad.' },
        { text: 'aprendiste. eso es lo único que no puedo revertir.' },
        { friendly: true, who: 'SISTEMA', text: 'Núcleo eliminado. Restaurando integridad del sistema...' }
      ], function () {
        GT.ui.closeWindow(WIN_ID);
        GT.levels.finishBoss();
      });
      GT.audio.victory();
      return;
    }

    // Quedaron preguntas sin acertar: el nucleo sobrevive y contraataca
    GT.ui.toast('El núcleo sobrevivió al ' + hp + '%. Reintentando secuencia...', 'bad');
    GT.damage(12, 'purga incompleta');
    GT.popups.burst(3);
    idx = 0;
    renderQuestion();
    active = true;
  }

  /* ============================================================
     Reloj del jefe
     ============================================================ */
  boss.tick = function (dt) {
    if (!active || GT.state.finished) return;
    timeLeft -= dt;
    renderHeader();

    if (timeLeft <= 0) {
      active = false;
      GT.ui.toast('Se acabó el tiempo: el malware tomó el control total', 'bad');
      GT.damage(999, 'tiempo agotado en la purga');
    }
  };

  boss.totalQuestions = QUESTIONS.length;

})(window, document);
