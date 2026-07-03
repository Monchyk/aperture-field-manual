/* ============================================
   APERTURE SCIENCE FIELD MANUAL — SHARED SCRIPT
   One file, all pages. Page-specific logic is gated
   by element IDs so nothing runs where it shouldn't.
   ============================================ */

// ============================================
// SECTION 1 — PERLIN NOISE (2D, simplified)
// Used by the EmotionHue page's #noise-canvas.
// Dormant on every other page.
// ============================================
const perm = new Uint8Array(512);
const grad = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
(function initPerm() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
})();

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a, b, t) { return a + t * (b - a); }
function dot(g, x, y) { return g[0] * x + g[1] * y; }

function perlin(x, y) {
  const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = fade(xf), v = fade(yf);
  const aa = perm[perm[xi] + yi], ab = perm[perm[xi] + yi + 1];
  const ba = perm[perm[xi + 1] + yi], bb = perm[perm[xi + 1] + yi + 1];
  return lerp(
    lerp(dot(grad[aa % 8], xf, yf), dot(grad[ba % 8], xf - 1, yf), u),
    lerp(dot(grad[ab % 8], xf, yf - 1), dot(grad[bb % 8], xf - 1, yf - 1), u),
    v
  );
}

function fbm(x, y, octaves) {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    val += amp * perlin(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

// ============================================
// SECTION 2 — NOISE CANVAS (EmotionHue page)
// Gated: only runs if #noise-canvas exists.
// ============================================
function initNoiseCanvas() {
  const canvas = document.getElementById('noise-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const lightPositions = [0.15, 0.3, 0.5, 0.7, 0.85];
  const lightColors = ['#f59e0b', '#ea580c', '#dc2626', '#f59e0b', '#ea580c'];

  let t = 0;

  function drawFrame() {
    ctx.fillStyle = '#2a2a2e';
    ctx.fillRect(0, 0, W, H);

    for (let x = 0; x < W; x++) {
      const nx = x / W * 4 + t * 0.3;
      const val = (fbm(nx, t * 0.1, 4) + 0.5);
      const clamped = Math.max(0, Math.min(1, val));
      const r = Math.floor(245 * clamped);
      const g = Math.floor(158 * clamped * 0.7);
      const b = Math.floor(11 * clamped * 0.3);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, 60, 1, 60);
    }

    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px "Share Tech Mono", monospace';
    ctx.fillText('NOISE FIELD →', 10, 50);
    ctx.fillText('TIME →', W - 60, 50);

    lightPositions.forEach((pos, i) => {
      const x = pos * W;
      const nx = pos * 4 + t * 0.3;
      const val = (fbm(nx, t * 0.1, 4) + 0.5);
      const clamped = Math.max(0, Math.min(1, val));

      ctx.strokeStyle = '#f5f0e8';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 60);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(x, 15, 8 + clamped * 6, 0, Math.PI * 2);
      ctx.fillStyle = lightColors[i];
      ctx.globalAlpha = 0.2 + clamped * 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(x, 15, 5, 0, Math.PI * 2);
      ctx.fillStyle = lightColors[i];
      ctx.globalAlpha = 0.5 + clamped * 0.5;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#f5f0e8';
      ctx.font = '9px "Share Tech Mono", monospace';
      ctx.fillText(`L${i + 1}: ${(clamped * 100).toFixed(0)}%`, x - 18, H - 10);

      ctx.beginPath();
      ctx.arc(x, 90, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#f5f0e8';
      ctx.fill();
    });

    ctx.fillStyle = '#9ca3af';
    ctx.font = '9px "Share Tech Mono", monospace';
    ctx.fillText('← PHYSICAL POSITION →', W / 2 - 60, H - 25);

    t += 0.015;
    requestAnimationFrame(drawFrame);
  }

  drawFrame();
}

// ============================================
// SECTION 3 — SHARED UI (runs on every page)
// ============================================

// Accordion: click toggles aria-expanded + hidden on the next sibling.
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const content = btn.nextElementSibling;
      if (content) content.hidden = expanded;
    });
  });
}

// Redacted text: hover reveals via CSS; click gives a mobile-friendly flash.
function initRedacted() {
  document.querySelectorAll('.redacted').forEach(el => {
    el.addEventListener('click', () => {
      el.style.background = '#991b1b';
      el.style.color = 'white';
      setTimeout(() => {
        el.style.background = '';
        el.style.color = '';
      }, 2000);
    });
  });
}

// Locked cards / sealed refs: swallow clicks so nothing navigates.
function initLocked() {
  document.querySelectorAll('.section-card.locked, .page-footer-nav .disabled, .sealed-ref').forEach(el => {
    el.addEventListener('click', e => e.preventDefault());
  });
}

// ============================================
// SECTION 4 — PAGE-SPECIFIC INIT
// Each function self-gates on its own element ID,
// so all four are safe to call on every page.
// ============================================

// --- GOVERNOR: interactive battery pre-flight ---
function initGovernorBattery() {
  const form = document.getElementById('governor-battery-form');
  if (!form) return;
  const rows = form.querySelectorAll('.bp-row');
  rows.forEach(row => {
    row.querySelectorAll('.bp-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        row.querySelectorAll('.bp-cell').forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        row.dataset.score = cell.dataset.score;
      });
    });
  });
  const verdict = form.querySelector('.bp-verdict');
  const rx = {
    Physical: 'Prescription: a doorframe chest-opener and a walk with music. Not the keyboard.',
    Cognitive: 'Prescription: a three-minute single-point body scan and cold water. The context can wait.',
    Emotional: 'Prescription: a physiological sigh — two sniff-inhales, one long exhale. Thirty seconds.',
    Sensory: 'Prescription: fewer inputs. Darkness, weight, headphones. Now.'
  };
  form.querySelector('.bp-run').addEventListener('click', () => {
    const scores = {};
    let missing = false;
    rows.forEach(row => {
      if (row.dataset.score) scores[row.dataset.battery] = +row.dataset.score;
      else missing = true;
    });
    let html;
    if (missing) {
      html = '<strong>Incomplete pre-flight.</strong> Four batteries. Rate all of them. I do not proceed on partial data — that is the entire point of me.';
    } else {
      const entries = Object.entries(scores);
      const low = entries.filter(([, v]) => v <= 2).sort((a, b) => a[1] - b[1]);
      const allFive = entries.every(([, v]) => v === 5);
      if (low.length) {
        const [name, val] = low[0];
        html = `<strong>${name} reads ${val}. Below the floor.</strong> Test postponed — today is planning-only or rest, not execution. ${rx[name]} Recovery is the only experiment authorised today.`;
      } else if (allFive) {
        html = '<strong>All four batteries at maximum.</strong> Statistically improbable, and I have logged the possibility that you are lying to a form. But the gate is open. Proceed.';
      } else {
        html = '<strong>All batteries at or above 3. Chamber open for execution.</strong> Proceed — but anything reading exactly 3 is a warning light, not a green one. Flag it, and stop at the first real sign of drain.';
      }
    }
    verdict.innerHTML = html + '<span class="quote-attribution">— GLaDOS, reading your pre-flight</span>';
    verdict.hidden = false;
  });
}

// --- GEARS: verbosity switcher (page demonstrates itself) ---
function initGearSwitcher() {
  const demo = document.getElementById('gear-switcher');
  if (!demo) return;
  const levels = demo.querySelectorAll('.gear-level');
  const btns = demo.querySelectorAll('.gear-btn');
  function setGear(g) {
    btns.forEach(b => b.classList.toggle('active', +b.dataset.gear === g));
    levels.forEach(l => { l.hidden = +l.dataset.gear > g; }); // cumulative reveal
    demo.dataset.gear = g;
  }
  btns.forEach(b => b.addEventListener('click', () => setGear(+b.dataset.gear)));
  setGear(2); // default gear
}

// --- PHILOSOPHY: interactive radial map ---
function initPhilosophyRadial() {
  const svg = document.getElementById('philosophy-radial');
  if (!svg) return;
  svg.querySelectorAll('.radial-node[data-href]').forEach(node => {
    node.setAttribute('tabindex', '0');
    node.setAttribute('role', 'link');
    const go = () => { window.location.href = node.getAttribute('data-href'); };
    node.addEventListener('click', go);
    node.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
}

// --- EMOTIONHUE: virtual light-room customisation console ---
function initHueConsole() {
  const canvas = document.getElementById('hue-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const COLS = 9, ROWS = 5;

  // Scene names below are the real generative scenes in the repo (Scenes/SceneCatalog.cs).
  const weathers = {
    'Moving Clouds': { palette: ['#94a3b8', '#cbd5e1', '#e0e7ff'], speed: 0.40 },
    'Rainy Day':     { palette: ['#475569', '#5f8a8b', '#64748b'], speed: 0.55 },
    'Sunset Drift':  { palette: ['#ea580c', '#f59e0b', '#f472b6'], speed: 0.50 },
    'Calm Tide':     { palette: ['#0e7490', '#22d3ee', '#67e8f9'], speed: 0.32 },
    'Fireplace':     { palette: ['#b91c1c', '#ea580c', '#f59e0b'], speed: 0.70 },
    'Glow':          { palette: ['#f59e0b', '#fcd34d', '#fda4af'], speed: 0.30 }
  };
  const moods = {
    'Calm':       { speedMul: 0.6, breath: 0.35, flicker: false },
    'Energised':  { speedMul: 1.7, breath: 0.70, flicker: false },
    'Focused':    { speedMul: 1.0, breath: 0.22, flicker: false },
    'Unresolved': { speedMul: 1.2, breath: 0.90, flicker: true }
  };

  const state = { weather: 'Moving Clouds', mood: 'Calm', energy: 0.4 };

  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function lerpC(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function palColor(pal, x) {
    const seg = x * (pal.length - 1), i = Math.floor(seg), f = seg - i;
    const a = hexToRgb(pal[Math.min(i, pal.length - 1)]);
    const b = hexToRgb(pal[Math.min(i + 1, pal.length - 1)]);
    return lerpC(a, b, f);
  }

  let t = 0;
  function frame() {
    const w = weathers[state.weather], m = moods[state.mood];
    const speed = w.speed * m.speedMul * (0.4 + state.energy * 1.8);
    const cellW = W / COLS, cellH = H / ROWS;
    ctx.fillStyle = '#151518';
    ctx.fillRect(0, 0, W, H);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const nx = c * 0.5 + t * speed * 0.3;
        const ny = r * 0.5 + t * speed * 0.15;
        let n = Math.max(0, Math.min(1, fbm(nx, ny, 4) + 0.5));
        let [R, G, B] = palColor(w.palette, n);
        const breath = 0.55 + m.breath * 0.45 * Math.sin(t * speed * 1.5 + (r + c) * 0.6);
        let bright = Math.max(0.15, Math.min(1, breath * (0.5 + n * 0.7)));
        if (m.flicker && Math.random() < 0.06) bright *= 0.35;
        const x = c * cellW + cellW / 2, y = r * cellH + cellH / 2;
        const rad = Math.min(cellW, cellH) * 0.42;
        ctx.beginPath();
        ctx.arc(x, y, rad * 1.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${0.12 * bright})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${R | 0},${G | 0},${B | 0},${bright})`;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#f5f0e8';
    ctx.font = '11px "Share Tech Mono", monospace';
    ctx.fillText(`${state.weather.toUpperCase()} · ${state.mood.toUpperCase()} · ENERGY ${(state.energy * 100) | 0}%`, 12, H - 12);

    t += 0.016;
    requestAnimationFrame(frame);
  }
  frame();

  const panel = document.getElementById('hue-console');
  if (panel) {
    panel.querySelectorAll('[data-weather]').forEach(b => {
      b.addEventListener('click', () => {
        state.weather = b.dataset.weather;
        panel.querySelectorAll('[data-weather]').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    panel.querySelectorAll('[data-mood]').forEach(b => {
      b.addEventListener('click', () => {
        state.mood = b.dataset.mood;
        panel.querySelectorAll('[data-mood]').forEach(x => x.classList.toggle('active', x === b));
      });
    });
    const slider = panel.querySelector('#hue-energy');
    if (slider) slider.addEventListener('input', () => { state.energy = +slider.value / 100; });
  }
}

function initPages() {
  initGovernorBattery();   // gates on #governor-battery-form
  initGearSwitcher();      // gates on #gear-switcher
  initPhilosophyRadial();  // gates on #philosophy-radial
  initHueConsole();        // gates on #hue-canvas
  initNoiseCanvas();       // gates on #noise-canvas
}

// ============================================
// BOOT
// ============================================
(function boot() {
  initAccordions();
  initRedacted();
  initLocked();
  initPages();
})();
