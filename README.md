# Glitch.TEC — PC Corrompida

Prototipo funcional de un **videojuego educativo** sobre ciberseguridad.
Simula un escritorio WinTEC XP infectado por un malware consciente: el jugador usa una terminal real, un administrador de tareas y un cliente de correo para contenerlo y purgarlo.

**Materia:** PISWD · **Profesor:** Callamullo Diego

| Rol | Integrante |
|---|---|
| Back-End | Alvarez Santiago |
| Front-End | Cora Alex |
| Liderazgo | Gomez Nayla |
| Diseño Gráfico | Ortiz Morena |

---

## Stack

| Capa | Tecnología |
|---|---|
| Motor del videojuego | **Processing (p5.js)** |
| Interfaz web | **HTML, CSS, JavaScript** |
| Lógica del servidor | **PHP** |
| Base de datos | **MySQL / MariaDB** |
| Control de versiones | **Git + GitHub** |

---

## Qué demuestra este prototipo

1. **Inicio del juego** — menú + secuencia de boot del sistema.
2. **Instrucciones** — manual de supervivencia in-game.
3. **Mecánica principal** — Terminal CLI (`dir`, `cd`, `type`, `scan`, `unlock`, `kill`, `purge`).
4. **Interacción del usuario** — ventanas arrastrables, iconos, pop-ups, clics y teclado.
5. **Sistema de respuestas / decisiones** — clasificar correos, matar procesos, acertijos y quiz final.
6. **Puntuación / vidas / tiempo / niveles** — integridad, infección, puntaje, reloj y 4 niveles.
7. **Victoria / derrota** — pantalla de sistema restaurado o BSOD.

---

## Cómo jugar (rápido)

1. Abrí `index.html` en el navegador **o** serví el proyecto con XAMPP (recomendado).
2. **INICIAR PARTIDA**.
3. En la Terminal: `help` → leé `C:\Documentos\leeme.txt` → `scan` el archivo con doble extensión.
4. Desbloqueá la cuarentena (binario `101101` → decimal `45`).
5. Matá los procesos **sin firma digital**.
6. Clasificá los correos de TEC-Mail.
7. Escribí `purge` y respondé las 5 preguntas finales.

---

## Instalación con XAMPP (stack completo)

### 1. Clonar

```bash
git clone https://github.com/<tu-org>/glitch-tec.git
cd glitch-tec
```

### 2. Copiar a htdocs

Copiá la carpeta del proyecto a:

```
C:\xampp\htdocs\glitch-tec\
```

### 3. Crear la base de datos

1. Abrí **phpMyAdmin** → `http://localhost/phpmyadmin`
2. Importá `sql/schema.sql`  
   (crea la BD `glitchtec`, tablas `partidas` / `eventos` y datos de ejemplo).

### 4. Configurar conexión

Editá `api/config.php` si tu MySQL no usa usuario `root` sin clave:

```php
const DB_USER = 'root';
const DB_PASS = '';
```

### 5. Abrir el juego

```
http://localhost/glitch-tec/
```

Comprobá el backend:

```
http://localhost/glitch-tec/api/ping.php
```

Debería responder `{ "ok": true, "db": true, ... }`.

> Si abrís `index.html` directo (file://), el juego funciona igual en **modo offline** y guarda el ranking en `localStorage`.

---

## Estructura del proyecto

```
glitch-tec/
├── index.html              # Shell de la interfaz
├── css/                    # Estilos (escritorio, ventanas, CRT)
├── js/
│   ├── vendor/p5.min.js    # Motor Processing (p5.js)
│   ├── engine.js           # Sketches p5: CRT, CPU/RAM, núcleo
│   ├── state.js            # Estado global + bus de eventos
│   ├── game.js             # Orquestador / loop
│   ├── terminal.js         # CLI (mecánica principal)
│   ├── processes.js        # Administrador de tareas
│   ├── mail.js             # TEC-Mail (phishing)
│   ├── boss.js             # Nivel final (purge)
│   ├── api.js              # Cliente PHP / fallback local
│   └── ...
├── api/                    # Endpoints PHP
│   ├── config.php
│   ├── ping.php
│   ├── partida_start.php
│   ├── partida_end.php
│   ├── evento.php
│   └── ranking.php
├── sql/
│   └── schema.sql          # Esquema MySQL + seed
└── README.md
```

---

## API PHP

| Endpoint | Método | Descripción |
|---|---|---|
| `api/ping.php` | GET | Healthcheck + estado de la BD |
| `api/partida_start.php` | POST | Abre una partida |
| `api/partida_end.php` | POST | Cierra con puntaje y stats |
| `api/evento.php` | POST | Log de eventos de gameplay |
| `api/ranking.php?limit=10` | GET | Top puntajes |

---

## Motor p5.js

`js/engine.js` monta tres sketches en **instance mode**:

- **CRT del escritorio** — estática, scanlines y tearing ligados a la infección.
- **Medidores CPU/RAM** — series en vivo dentro del Administrador de tareas.
- **Núcleo GLITCH.CORE** — visual del jefe final que reacciona a cada acierto.

---

## GitHub

```bash
git init
git add .
git commit -m "Prototipo funcional Glitch.TEC (alfa)"
git branch -M main
git remote add origin https://github.com/<tu-org>/glitch-tec.git
git push -u origin main
```

---

## Estado del prototipo (alfa)

Implementado: escritorio WinTEC XP, Terminal, Explorador, pop-ups del malware, Administrador de tareas, TEC-Mail, purga final, puntuación/integridad/tiempo, p5.js, API PHP y esquema MySQL.

Pendiente (post-alfa): módulos avanzados de ransomware/spyware, más narrativa, balance fino de CPU y audio dinámico por nivel de infección.
