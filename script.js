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

// --- LET'S SAVE FOOD: audit-trail generator ---
// Mirrors InventoryService + the LsfDbContext.SaveChanges() audit override.
// Every persisted mutation appends one AuditLog row; empties become soft-deletes
// (UPDATE, never DELETE); domain failures return Result.Fail with no audit row.
function initLsfAuditDemo() {
  const root = document.getElementById('lsf-audit-demo');
  if (!root) return;

  const ledger = root.querySelector('#lsf-ledger');
  const qtyEl = root.querySelector('#lsf-qty');
  const delEl = root.querySelector('#lsf-deleted');
  const reasonEl = root.querySelector('#lsf-reason');
  const ops = root.querySelectorAll('.lsf-op');

  const VOL = 'Sam · Distributor';           // fictional demo volunteer
  const newGuid = () =>
    (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.floor(Math.random() * 16), v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });

  // state = the tracked InventoryItem row
  let state = null;   // { id, qty, deleted, reason }

  function stamp() {
    // browser clock is fine here (this is page JS, not a workflow script)
    return new Date().toISOString().replace('T', ' ').slice(0, 19) + 'Z';
  }
  function fmtVals(obj) {
    if (obj === null) return '<span class="lsf-null">null</span>';
    return '{ ' + Object.entries(obj)
      .map(([k, v]) => `${k}: ${typeof v === 'string' ? '"' + v + '"' : v}`)
      .join(', ') + ' <span class="lsf-null">…</span> }';
  }
  function paint() {
    if (!state) { qtyEl.textContent = '—'; delEl.textContent = '—'; reasonEl.textContent = 'null'; }
    else {
      qtyEl.textContent = state.qty;
      delEl.textContent = String(state.deleted);
      delEl.style.color = state.deleted ? 'var(--red)' : 'var(--green-dark)';
      reasonEl.textContent = state.reason ? '"' + state.reason + '"' : 'null';
    }
    ops.forEach(b => {
      const op = b.dataset.op;
      if (op === 'reset') return;
      const alive = state && !state.deleted;
      b.disabled = op === 'receive' ? !!alive : !alive;
    });
  }
  function addRow({ action, old, neu, kind }) {
    const row = document.createElement('div');
    row.className = 'lsf-audit-row ' + (kind || action.toLowerCase());
    if (kind === 'fail') {
      row.innerHTML =
        `<span class="lsf-a">Result.Fail</span> — ${old}` +
        `<span class="lsf-meta">no AuditLog row · SaveChanges() never called</span>`;
    } else {
      row.innerHTML =
        `<span class="lsf-a">${action}</span> ` +
        `<span class="lsf-t">InventoryItem</span> · RecordId ${state.id.slice(0, 8)}…` +
        `<div class="lsf-kv">OldValues: ${old === null ? '<span class="lsf-null">null</span>' : fmtVals(old)}</div>` +
        `<div class="lsf-kv">NewValues: ${neu === null ? '<span class="lsf-null">null</span>' : fmtVals(neu)}</div>` +
        `<span class="lsf-meta">ChangedBy ${VOL} · ${stamp()}</span>`;
    }
    ledger.appendChild(row);
    ledger.scrollTop = ledger.scrollHeight;
  }

  const actions = {
    receive() {
      state = { id: newGuid(), qty: 10, deleted: false, reason: null };
      addRow({ action: 'INSERT', old: null,
        neu: { QuantityOnHand: 10, IsDeleted: false, Condition: 'Good', SourceStore: 'Delhaize Gent' } });
    },
    distribute() {
      const req = 5;
      if (state.qty < req) {                       // InventoryService guard
        addRow({ kind: 'fail',
          old: `Not enough stock. Have ${state.qty}, tried to distribute ${req}.` });
        return;
      }
      const before = state.qty;
      state.qty -= req;
      const neu = { QuantityOnHand: state.qty };
      if (state.qty === 0) { state.deleted = true; state.reason = 'DISTRIBUTED';
        neu.IsDeleted = true; neu.DeleteReason = 'DISTRIBUTED'; }
      addRow({ action: 'UPDATE', old: { QuantityOnHand: before, IsDeleted: false }, neu });
    },
    waste() {
      const req = 2;
      const before = state.qty;
      state.qty -= req;                            // WasteItemAsync has no stock guard
      const neu = { QuantityOnHand: Math.max(state.qty, 0) };
      if (state.qty <= 0) { state.qty = 0; state.deleted = true; state.reason = 'DAMAGED';
        neu.QuantityOnHand = 0; neu.IsDeleted = true; neu.DeleteReason = 'DAMAGED'; }
      addRow({ action: 'UPDATE', old: { QuantityOnHand: before, IsDeleted: false }, neu });
    },
    adjust() {
      const before = state.qty;
      state.qty = 0; state.deleted = true; state.reason = 'STOCKTAKE ADJUSTMENT';
      addRow({ action: 'UPDATE',
        old: { QuantityOnHand: before, IsDeleted: false },
        neu: { QuantityOnHand: 0, IsDeleted: true, DeleteReason: 'STOCKTAKE ADJUSTMENT' } });
    },
    reset() { state = null; ledger.innerHTML = ''; }
  };

  ops.forEach(b => b.addEventListener('click', () => {
    const fn = actions[b.dataset.op];
    if (!fn) return;
    if (b.dataset.op !== 'receive' && b.dataset.op !== 'reset' && (!state || state.deleted)) return;
    fn();
    paint();
  }));

  paint();
}

// --- LIVING VAULT: interactive knowledge-graph slice ---
// Hover/focus a node → light its real neighbours + incident edges; click a node
// with data-href → travel to that chamber. Edges/adjacency are read from the DOM,
// so every highlighted link is one of the genuine graph edges drawn in the SVG.
function initLvContextWeb() {
  const root = document.getElementById('lv-context-web');
  if (!root) return;
  const svg = root.querySelector('svg');
  const info = root.querySelector('#lv-web-info');
  const nodes = [...root.querySelectorAll('.lv-node')];
  const edges = [...root.querySelectorAll('.lv-edge')];

  // adjacency: id -> [{other, rel, inferred}]
  const adj = {};
  edges.forEach(e => {
    const a = e.dataset.a, b = e.dataset.b, rel = e.dataset.rel;
    const inf = e.classList.contains('inf');
    (adj[a] = adj[a] || []).push({ other: b, rel, inf });
    (adj[b] = adj[b] || []).push({ other: a, rel, inf });
  });
  const nodeById = {};
  nodes.forEach(n => { nodeById[n.dataset.id] = n; });

  function labelOf(id) {
    const n = nodeById[id];
    return n ? (n.dataset.label || id) : id;
  }

  function highlight(id) {
    const node = nodeById[id];
    if (!node) return;
    svg.classList.add('lv-focused');
    const neighbours = new Set([id]);
    (adj[id] || []).forEach(x => neighbours.add(x.other));
    nodes.forEach(n => n.classList.toggle('lit', neighbours.has(n.dataset.id)));
    edges.forEach(e => e.classList.toggle('lit', e.dataset.a === id || e.dataset.b === id));

    const conns = adj[id] || [];
    let html = `<span class="lv-info-label">${node.dataset.label}</span>` +
               `<span class="lv-info-meta">${node.dataset.meta || ''}</span>`;
    if (id === 'subject') {
      html += `<span class="lv-info-rel">↯ 18 connections — sealed (personal domains)</span>`;
    } else if (conns.length) {
      html += conns.map(c =>
        `<span class="lv-info-rel${c.inf ? ' inf' : ''}">` +
        `${c.inf ? '⇢ (inferred) ' : '→ '}${c.rel} · ${labelOf(c.other)}</span>`
      ).join('');
    } else {
      html += `<span class="lv-info-rel">no edges in this slice</span>`;
    }
    info.innerHTML = html;
  }

  function clear() {
    svg.classList.remove('lv-focused');
    nodes.forEach(n => n.classList.remove('lit'));
    edges.forEach(e => e.classList.remove('lit'));
    info.innerHTML = '<span class="lv-info-default">Hover or tap a node to trace its real connections.</span>';
  }

  nodes.forEach(n => {
    const id = n.dataset.id;
    n.addEventListener('mouseenter', () => highlight(id));
    n.addEventListener('mouseleave', clear);
    n.addEventListener('focus', () => highlight(id));
    n.addEventListener('blur', clear);
    const href = n.dataset.href;
    const go = () => { if (href) window.location.href = href; };
    n.addEventListener('click', go);
    n.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && href) { e.preventDefault(); go(); }
    });
    if (href) n.classList.add('lv-linked');
  });
}

function initPages() {
  initGovernorBattery();   // gates on #governor-battery-form
  initGearSwitcher();      // gates on #gear-switcher
  initPhilosophyRadial();  // gates on #philosophy-radial
  initHueConsole();        // gates on #hue-canvas
  initNoiseCanvas();       // gates on #noise-canvas
  initLsfAuditDemo();      // gates on #lsf-audit-demo
  initLvContextWeb();      // gates on #lv-context-web
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
