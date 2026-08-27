/* ============================================================
   Glitch.TEC — Motor p5.js (Processing)
   Capa de renderizado generativo. El HTML/CSS maneja la UI
   interactiva; p5.js dibuja los efectos visuales procedurales:
     1. Fondo CRT del escritorio (scanlines + ruido + glitches)
     2. Gráficos en vivo de CPU/RAM en el Administrador de tareas
     3. Núcleo del malware en la purga final
   ============================================================ */
(function (window) {
  'use strict';

  var GT = window.GlitchTec || (window.GlitchTec = {});
  var engine = GT.engine = {};

  /* ============================================================
     1. FONDO CRT DEL ESCRITORIO
     Un p5 instance mode montado detrás de la capa de iconos.
     ============================================================ */
  var crtSketch = null;

  engine.startCrt = function () {
    if (typeof window.p5 === 'undefined') {
      console.warn('[Glitch.TEC] p5.js no cargó; el motor visual queda desactivado.');
      return;
    }
    if (crtSketch) return;

    var host = document.getElementById('desktop');
    if (!host) return;

    // Contenedor dedicado detrás de iconos/ventanas
    var wrap = document.createElement('div');
    wrap.id = 'p5-crt';
    wrap.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.55;';
    host.insertBefore(wrap, host.firstChild);

    crtSketch = new window.p5(function (p) {
      var particles = [];
      var tearY = -40;
      var noiseSeed = 0;

      p.setup = function () {
        var c = p.createCanvas(host.clientWidth, host.clientHeight);
        c.parent(wrap);
        p.pixelDensity(1);
        p.noStroke();
        for (var i = 0; i < 28; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            s: p.random(1, 3),
            v: p.random(0.2, 1.4),
            a: p.random(40, 120)
          });
        }
      };

      p.windowResized = function () {
        p.resizeCanvas(host.clientWidth, host.clientHeight);
      };

      p.draw = function () {
        var infection = (GT.state && typeof GT.getInfection === 'function')
          ? GT.getInfection() / 100 : 0.08;
        var running = GT.state && GT.state.running && !GT.state.finished;

        // Fondo degradado que se corrompe con la infección
        var r = p.lerp(18, 55, infection);
        var g = p.lerp(42, 12, infection);
        var b = p.lerp(68, 28, infection);
        p.background(r, g, b, 28);

        // Partículas de "estática"
        for (var i = 0; i < particles.length; i++) {
          var pt = particles[i];
          p.fill(180 + infection * 70, 220 - infection * 100, 200, pt.a * (0.4 + infection));
          p.rect(pt.x, pt.y, pt.s, pt.s);
          pt.y += pt.v + infection * 2;
          if (pt.y > p.height) { pt.y = -4; pt.x = p.random(p.width); }
        }

        // Scanlines
        p.stroke(0, 0, 0, 35 + infection * 40);
        p.strokeWeight(1);
        for (var y = 0; y < p.height; y += 3) {
          p.line(0, y, p.width, y);
        }
        p.noStroke();

        // Barra de tearing (más frecuente con más infección)
        if (running) {
          tearY += 2.2 + infection * 6;
          if (tearY > p.height + 40) tearY = -40;
          p.fill(255, 255, 255, 18 + infection * 40);
          p.rect(0, tearY, p.width, 8 + infection * 14);

          // Glitch horizontal ocasional
          if (p.random() < infection * 0.04) {
            var gy = p.random(p.height);
            var gh = p.random(4, 28);
            p.copy(0, gy, p.width, gh, p.random(-20, 20), gy, p.width, gh);
          }
        }

        // Viñeta
        p.drawingContext.save();
        var grd = p.drawingContext.createRadialGradient(
          p.width / 2, p.height / 2, p.width * 0.25,
          p.width / 2, p.height / 2, p.width * 0.75
        );
        grd.addColorStop(0, 'rgba(0,0,0,0)');
        grd.addColorStop(1, 'rgba(0,0,0,' + (0.35 + infection * 0.35) + ')');
        p.drawingContext.fillStyle = grd;
        p.drawingContext.fillRect(0, 0, p.width, p.height);
        p.drawingContext.restore();

        noiseSeed += 0.01;
      };
    }, wrap);
  };

  /* ============================================================
     2. GRÁFICOS CPU / RAM (Administrador de tareas)
     ============================================================ */
  var meterSketch = null;
  var cpuHistory = [];
  var ramHistory = [];
  var HISTORY = 60;

  engine.startMeters = function (containerId) {
    if (typeof window.p5 === 'undefined') return;
    if (meterSketch) {
      try { meterSketch.remove(); } catch (e) { /* ignore */ }
      meterSketch = null;
    }

    var host = document.getElementById(containerId);
    if (!host) return;

    cpuHistory = [];
    ramHistory = [];

    meterSketch = new window.p5(function (p) {
      p.setup = function () {
        var c = p.createCanvas(host.clientWidth || 300, 70);
        c.parent(host);
        p.pixelDensity(1);
        p.noFill();
      };

      p.draw = function () {
        p.background(11, 22, 16);

        var cpu = (GT.procs && GT.procs.getCpu) ? GT.procs.getCpu() : 0;
        var ramPct = 0;
        if (GT.procs && GT.procs.list) {
          var list = GT.procs.list();
          var r = 0;
          for (var i = 0; i < list.length; i++) r += list[i].ram;
          ramPct = Math.min(100, Math.round(r / 2048 * 100));
        }

        cpuHistory.push(cpu);
        ramHistory.push(ramPct);
        if (cpuHistory.length > HISTORY) cpuHistory.shift();
        if (ramHistory.length > HISTORY) ramHistory.shift();

        drawSeries(p, cpuHistory, 0, 0, p.width, p.height / 2 - 2, [46, 227, 107], 'CPU');
        drawSeries(p, ramHistory, 0, p.height / 2 + 2, p.width, p.height / 2 - 2, [86, 216, 255], 'RAM');
      };
    }, host);
  };

  function drawSeries(p, data, x, y, w, h, rgb, label) {
    p.push();
    p.translate(x, y);
    p.noStroke();
    p.fill(15, 28, 22);
    p.rect(0, 0, w, h);

    // Grilla
    p.stroke(30, 50, 40, 120);
    p.strokeWeight(1);
    for (var gx = 0; gx < w; gx += 20) p.line(gx, 0, gx, h);
    for (var gy = 0; gy < h; gy += 14) p.line(0, gy, w, gy);

    if (data.length > 1) {
      p.noFill();
      p.stroke(rgb[0], rgb[1], rgb[2], 220);
      p.strokeWeight(1.5);
      p.beginShape();
      for (var i = 0; i < data.length; i++) {
        var px = (i / (HISTORY - 1)) * w;
        var py = h - (data[i] / 100) * h;
        p.vertex(px, py);
      }
      p.endShape();

      // Relleno bajo la curva
      p.fill(rgb[0], rgb[1], rgb[2], 40);
      p.noStroke();
      p.beginShape();
      p.vertex(0, h);
      for (var j = 0; j < data.length; j++) {
        p.vertex((j / (HISTORY - 1)) * w, h - (data[j] / 100) * h);
      }
      p.vertex(w, h);
      p.endShape(p.CLOSE);
    }

    p.fill(rgb[0], rgb[1], rgb[2]);
    p.noStroke();
    p.textSize(10);
    p.textFont('Consolas');
    var last = data.length ? data[data.length - 1] : 0;
    p.text(label + ' ' + last + '%', 6, 12);
    p.pop();
  }

  engine.stopMeters = function () {
    if (meterSketch) {
      try { meterSketch.remove(); } catch (e) { /* ignore */ }
      meterSketch = null;
    }
  };

  /* ============================================================
     3. NÚCLEO DEL MALWARE (purga final)
     ============================================================ */
  var coreSketch = null;
  var coreShake = 0;
  var coreHits = 0;

  engine.startCore = function (containerId) {
    if (typeof window.p5 === 'undefined') return;
    if (coreSketch) {
      try { coreSketch.remove(); } catch (e) { /* ignore */ }
      coreSketch = null;
    }

    var host = document.getElementById(containerId);
    if (!host) return;
    coreShake = 0;
    coreHits = 0;

    coreSketch = new window.p5(function (p) {
      var rings = [];
      for (var i = 0; i < 5; i++) {
        rings.push({ r: 10 + i * 8, speed: 0.02 + i * 0.008, phase: p.random(p.TWO_PI) });
      }

      p.setup = function () {
        var c = p.createCanvas(host.clientWidth || 620, 74);
        c.parent(host);
        p.pixelDensity(1);
      };

      p.draw = function () {
        p.background(5, 9, 12);
        var cx = p.width / 2 + (coreShake ? p.random(-coreShake, coreShake) : 0);
        var cy = p.height / 2 + (coreShake ? p.random(-coreShake, coreShake) : 0);
        if (coreShake > 0) coreShake *= 0.9;

        var hp = (GT.boss && GT.boss.getHp) ? GT.boss.getHp() : 100;
        var pulse = 1 + p.sin(p.frameCount * 0.08) * 0.08 * (hp / 100);

        // Anillos orbitando
        for (var i = 0; i < rings.length; i++) {
          var rg = rings[i];
          rg.phase += rg.speed;
          p.noFill();
          p.stroke(255, 59, 82, 60 + (hp / 100) * 80);
          p.strokeWeight(1);
          p.ellipse(cx, cy, rg.r * 2 * pulse, rg.r * 1.2 * pulse);

          var px = cx + p.cos(rg.phase) * rg.r * pulse;
          var py = cy + p.sin(rg.phase) * rg.r * 0.55 * pulse;
          p.noStroke();
          p.fill(255, 100, 120);
          p.circle(px, py, 3);
        }

        // Núcleo
        var size = 18 * pulse * (0.5 + hp / 200);
        p.noStroke();
        for (var k = 4; k >= 1; k--) {
          p.fill(255, 40, 70, 20 * k);
          p.circle(cx, cy, size + k * 6);
        }
        p.fill(255, 80 + (100 - hp), 100);
        p.circle(cx, cy, size);

        // Texto glitch
        p.fill(255, 107, 138);
        p.textFont('Consolas');
        p.textSize(11);
        p.textAlign(p.LEFT, p.CENTER);
        var label = hp > 0 ? 'GLITCH.CORE  ACTIVE' : 'GLITCH.CORE  PURGED';
        if (p.random() < 0.04 && hp > 0) {
          label = label.split('').map(function (ch) {
            return p.random() < 0.3 ? String.fromCharCode(p.random(33, 126)) : ch;
          }).join('');
        }
        p.text(label, 14, cy);

        p.textAlign(p.RIGHT, p.CENTER);
        p.fill(180, 200, 190);
        p.text('hits ' + coreHits + '/5', p.width - 14, cy);
      };
    }, host);
  };

  engine.hitCore = function () {
    coreShake = 10;
    coreHits++;
    if (GT.audio && GT.audio.glitch) GT.audio.glitch();
  };

  engine.stopCore = function () {
    if (coreSketch) {
      try { coreSketch.remove(); } catch (e) { /* ignore */ }
      coreSketch = null;
    }
  };

})(window);
