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

// ---- Point of Origin: chevron lock state + the fixed dialing widget ----
// Runs on every page (chevrons are absent on most — querySelectorAll no-ops).
const CHEV_PATH_ARMS = 'M1,14 L9,4 L11,6 L5,14 Z M23,14 L15,4 L13,6 L19,14 Z';
const CHEV_PATH_LOCK = 'M12,1 L15.5,6 L8.5,6 Z';

function chevronSVGString(extraClass) {
  return `<svg class="origin-chevron ${extraClass || ''}" viewBox="0 0 24 16" aria-hidden="true">` +
    `<path class="chev-arms" d="${CHEV_PATH_ARMS}"/><path class="chev-lock" d="${CHEV_PATH_LOCK}"/></svg>`;
}

// The six coordinate glyphs (fixed order — index N is always the same shape, wherever it lands)
const CHEVRON_GLYPHS = [
  { arms: 'M4,3 Q4,11 12,11 Q20,11 20,3 M4,4 L2,2 M20,4 L22,2', lock: { cx: 12, cy: 9, r: 1.4 } },   // Crater
  { arms: 'M12,2 L12,14 M12,6 L7,3 M12,6 L17,3', lock: { cx: 12, cy: 2, r: 1.4 } },                  // Virgo
  { arms: 'M12,2 L18,8 L12,14 L6,8 Z', lock: { cx: 12, cy: 8, r: 1.4 } },                            // Bootes
  { arms: 'M4,12 L18,4 M13,3 L18,4 L17,9', lock: { cx: 4, cy: 12, r: 1.4 } },                        // Centaurus
  { arms: 'M4,4 L20,4 M6,4 L6,10 M18,4 L18,10', lock: { cx: 12, cy: 4, r: 1.4 } },                   // Libra
  { arms: 'M4,13 Q8,5 12,9 Q16,13 20,5', lock: { cx: 20, cy: 5, r: 1.4 } }                           // Serpens Caput
];
// Which pages belong to which Facility Directory category, and how many of the 6 glyphs
// land on each page — smaller categories stack more than one glyph on the same page so the
// total is always exactly 6, regardless of which category a visitor commits to first.
const CATEGORY_PAGES = {
  'AI Systems': [{ page: 'governor', slots: 3 }, { page: 'gears', slots: 3 }],
  'Software Projects': [{ page: 'emotionhue', slots: 2 }, { page: 'letssavefood', slots: 2 },
    { page: 'schrutelibrary', slots: 1 }, { page: 'miscwing', slots: 1 }],
  'The Operating System': [{ page: 'workshop', slots: 3 }, { page: 'philosophy', slots: 3 }],
  'Meta Infrastructure': [{ page: 'livingvault', slots: 6 }]
};
const PAGE_TO_CATEGORY = {};
Object.keys(CATEGORY_PAGES).forEach(cat => CATEGORY_PAGES[cat].forEach(p => { PAGE_TO_CATEGORY[p.page] = cat; }));
const CHAMBER_NAMES = {
  governor: 'The Governor', gears: 'The Gear System', workshop: 'The Workshop',
  philosophy: 'The Prime Directive', emotionhue: 'EmotionHue', letssavefood: "Let's Save Food",
  schrutelibrary: 'Schrute Library', miscwing: 'The Misc Wing', livingvault: 'The Living Vault'
};

function currentPageId() {
  const file = location.pathname.split('/').pop().replace('.html', '');
  return file || 'index';
}

// The first chamber page a visitor ever loads locks in its category, permanently — every
// subsequent chevron placement (this visit or any later one) stays confined to that category.
function initOriginCategoryLock() {
  let cat = originGetPref('origin.category', '');
  if (!cat) {
    const derived = PAGE_TO_CATEGORY[currentPageId()];
    if (derived) {
      originSetPref('origin.category', derived);
      originSaveFound([]);              // clean slate — no bleed-over from a prior localStorage shape
      originSetPref('origin.confirmed', '0');
      cat = derived;
    }
  }
  return cat;
}

function getActiveOriginSlugs() {
  const cat = originGetPref('origin.category', '');
  if (!cat || !CATEGORY_PAGES[cat]) return [];
  const slugs = [];
  CATEGORY_PAGES[cat].forEach(p => { for (let i = 1; i <= p.slots; i++) slugs.push(p.page + '-' + i); });
  return slugs;
}

function chevronGlyphSVGString(glyphIdx, slug, onDark) {
  const g = CHEVRON_GLYPHS[glyphIdx];
  return '<svg class="origin-chevron' + (onDark ? ' on-dark' : '') + '" data-chevron="' + slug +
    '" viewBox="0 0 24 16" aria-hidden="true"><path class="chev-arms" d="' + g.arms +
    '"/><circle class="chev-lock" cx="' + g.lock.cx + '" cy="' + g.lock.cy + '" r="' + g.lock.r + '"/></svg>';
}

// Locks the category (if this is the visitor's first chamber page ever), then — if this page
// belongs to the locked category — replaces its inert .chev-slot placeholders with real,
// clickable chevrons. Pages outside the locked category simply keep empty slots.
function initOriginChevronPlacement() {
  const cat = initOriginCategoryLock();
  if (!cat) return;
  const pages = CATEGORY_PAGES[cat];
  const pageId = currentPageId();
  const pageEntry = pages.find(p => p.page === pageId);
  if (!pageEntry) return;

  let glyphIdx = 0;
  for (const p of pages) { if (p.page === pageId) break; glyphIdx += p.slots; }
  for (let i = 1; i <= pageEntry.slots; i++) {
    const slug = pageId + '-' + i;
    const slot = document.querySelector('.chev-slot[data-slot="' + slug + '"]');
    if (!slot) continue;
    slot.outerHTML = chevronGlyphSVGString(glyphIdx, slug, slot.dataset.style === 'on-dark');
    glyphIdx++;
  }
}
function originGetFound() {
  try { return JSON.parse(localStorage.getItem('origin.chevrons') || '[]'); } catch (e) { return []; }
}
function originSaveFound(arr) {
  try { localStorage.setItem('origin.chevrons', JSON.stringify(arr)); } catch (e) {}
}
function originGetPref(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
}
function originSetPref(key, val) {
  try { localStorage.setItem(key, val); } catch (e) {}
}
function originVaultHref() {
  return location.pathname.indexOf('/pages/') !== -1 ? 'livingvault.html' : 'pages/livingvault.html';
}
function originPageHref(name) {
  return location.pathname.indexOf('/pages/') !== -1 ? name : ('pages/' + name);
}

let originWidgetEl = null;

function updateOriginWidget() {
  if (!originWidgetEl) return;
  const found = originGetFound();
  const confirmed = originGetPref('origin.confirmed', '0') === '1';
  const slots = originWidgetEl.querySelectorAll('.odw-slot .origin-chevron');
  getActiveOriginSlugs().forEach((slug, i) => { if (slots[i]) slots[i].classList.toggle('found', found.indexOf(slug) !== -1); });
  const originDot = originWidgetEl.querySelector('.odw-origin');
  const countEl = originWidgetEl.querySelector('.odw-count');
  originWidgetEl.classList.toggle('ready', found.length >= 6 && !confirmed);
  if (confirmed) {
    originWidgetEl.classList.add('minimized');
    countEl.textContent = '7/7';
    originDot.title = 'ORIGIN CONFIRMED';
  } else {
    countEl.textContent = found.length + '/7';
    originDot.title = found.length >= 6 ? 'AWAITING POINT OF ORIGIN' : ('COORDINATE LOCK ' + found.length + ' OF 7');
  }
  originWidgetEl.classList.add('visible'); // always present — an obnoxious little guide, minimizable
  originDot.onclick = () => { if (found.length >= 6 && !confirmed) window.location.href = originVaultHref(); };

  // Guidance: name exactly which chambers still hold glyphs (no more pixel-hunting).
  const hintEl = originWidgetEl.querySelector('.odw-hint');
  if (hintEl) {
    if (confirmed) {
      hintEl.innerHTML = '';
    } else if (found.length >= 6) {
      hintEl.innerHTML = 'all six locked → <a href="' + originVaultHref() + '">set the Point of Origin</a>';
    } else {
      const cat = originGetPref('origin.category', '');
      if (!cat || !CATEGORY_PAGES[cat]) {
        hintEl.textContent = '◈ enter any chamber to start collecting glyphs';
      } else {
        const remaining = CATEGORY_PAGES[cat].filter(p => {
          for (let i = 1; i <= p.slots; i++) if (found.indexOf(p.page + '-' + i) === -1) return true;
          return false;
        });
        hintEl.innerHTML = remaining.length
          ? 'glyphs glow in: ' + remaining.map(p =>
              '<a href="' + originPageHref(p.page + '.html') + '">' + (CHAMBER_NAMES[p.page] || p.page) + '</a>'
            ).join(' · ')
          : '';
      }
    }
  }
}

function initOriginDialWidget() {
  const div = document.createElement('div');
  div.id = 'origin-dial-widget';
  let slotsHtml = '';
  for (let i = 0; i < 6; i++) slotsHtml += `<span class="odw-slot">${chevronSVGString('')}</span>`;
  div.innerHTML =
    `<div class="odw-panel">` +
      `<span class="odw-label">Dialing Sequence</span>${slotsHtml}` +
      `<span class="odw-div"></span>` +
      `<span class="odw-origin" title="COORDINATE LOCK 0 OF 7">` +
        `<svg viewBox="0 0 24 26" aria-hidden="true">` +
          `<path class="odw-origin-pyramid" d="M4,22 L12,10 L20,22 Z"/>` +
          `<circle class="odw-origin-sun" cx="12" cy="5" r="2.5"/>` +
        `</svg>` +
      `</span>` +
      `<span class="odw-count"></span>` +
      `<span class="odw-hint"></span>` +
    `</div>`;
  document.body.appendChild(div);
  originWidgetEl = div;
  if (originGetPref('origin.widget', 'open') === 'min') div.classList.add('minimized');
  div.querySelector('.odw-panel').addEventListener('click', e => {
    if (e.target.closest('.odw-origin') || e.target.closest('.odw-hint')) return;
    const nowMin = !div.classList.contains('minimized');
    div.classList.toggle('minimized', nowMin);
    originSetPref('origin.widget', nowMin ? 'min' : 'open');
  });
  updateOriginWidget();
}

let originVisitCardEl = null;

function updateOriginVisitCard() {
  if (!originVisitCardEl) return;
  const confirmed = originGetPref('origin.confirmed', '0') === '1';
  originVisitCardEl.classList.toggle('visible', confirmed);
  originVisitCardEl.classList.toggle('open', originGetPref('origin.card', 'min') === 'open');
}

// The revisitable follow-up to the one-time dial sequence: once the origin is confirmed,
// a small persistent card is reachable from every page (site-wide, like the dial widget).
// The elaborate trace→kawoosh→cake cutscene on the vault page still only plays once; this
// is just "you earned this, here it is again" — not a replay of the ceremony.
function initOriginVisitCard() {
  const div = document.createElement('div');
  div.id = 'origin-visit-card';
  div.innerHTML =
    '<button type="button" class="ovc-icon" title="you found something" aria-label="Open visit card">🍰</button>' +
    '<div class="ovc-panel">' +
      '<button type="button" class="ovc-close" aria-label="Minimize">✕</button>' +
      '<div class="ovc-cake" id="ovc-cake"></div>' +
      '<p class="ovc-caption">THE CAKE IS NOT A LIE</p>' +
      '<div class="ovc-contact">[YOUR CONTACT INFO — paste the real text here]</div>' +
      '<a class="ovc-link" href="' + originPageHref('philosophy.html') + '">→ THE ONE RULE — PHILOSOPHY</a>' +
    '</div>';
  document.body.appendChild(div);
  originVisitCardEl = div;
  div.querySelector('#ovc-cake').innerHTML = CAKE_SVG;

  function toggle(open) {
    originSetPref('origin.card', open ? 'open' : 'min');
    updateOriginVisitCard();
  }
  div.querySelector('.ovc-icon').addEventListener('click', () => toggle(true));
  div.querySelector('.ovc-close').addEventListener('click', () => toggle(false));

  window.addEventListener('origin:progress', updateOriginVisitCard);
  updateOriginVisitCard();
}

function initOriginChevrons() {
  const els = document.querySelectorAll('.origin-chevron[data-chevron]');
  if (!els.length) return;
  const found = new Set(originGetFound());
  els.forEach(el => {
    const slug = el.dataset.chevron;
    if (found.has(slug)) el.classList.add('found');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', found.has(slug) ? 'chevron — locked' : 'chevron');
    const lock = () => {
      if (found.has(slug)) return;
      found.add(slug);
      originSaveFound([...found]);
      el.classList.add('found');
      el.setAttribute('aria-label', 'chevron — locked');
      updateOriginWidget();
      window.dispatchEvent(new Event('origin:progress'));
    };
    el.addEventListener('click', lock);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lock(); } });
  });
}

// ---- Point of Origin: hint fly — loiters near an unfound chevron on this page ----
const SPYFLY_SVG =
  '<svg viewBox="0 0 28 20" aria-hidden="true">' +
  '<path class="sf-wing" d="M13,9 C9,7 4,4 2,1 C6,1.5 12,3.5 14,7 Z" fill="rgba(60,120,120,.55)" stroke="rgba(40,90,90,.6)" stroke-width="0.3"/>' +
  '<path class="sf-wing" d="M15,9 C19,7 24,4 26,1 C22,1.5 16,3.5 14,7 Z" fill="rgba(60,120,120,.55)" stroke="rgba(40,90,90,.6)" stroke-width="0.3"/>' +
  '<ellipse cx="14" cy="12.5" rx="8.2" ry="6.6" fill="rgba(153,221,221,.55)" stroke="rgba(90,180,180,.65)" stroke-width="0.5"/>' +
  '<circle cx="11" cy="11.5" r="2.1" fill="rgba(30,140,150,.85)" stroke="rgba(20,90,100,.7)" stroke-width="0.3"/>' +
  '<circle class="sf-monocle" cx="17" cy="11.5" r="2.1" fill="rgba(30,140,150,.85)" stroke="rgba(20,90,100,.7)" stroke-width="0.3"/>' +
  '<line class="sf-monocle-glint" x1="15.7" y1="10.3" x2="18.2" y2="10.3" stroke="#fff" stroke-width="0.5" opacity="0"/>' +
  '<path d="M14,15 C13.4,17 12.6,18.2 11.2,19" stroke="rgba(140,210,160,.8)" stroke-width="1" fill="none" stroke-linecap="round"/>' +
  '<path d="M9,17.5 L7.5,19.3" stroke="rgba(90,170,170,.6)" stroke-width="0.6" fill="none" stroke-linecap="round"/>' +
  '<path d="M19,17.5 L20.5,19.3" stroke="rgba(90,170,170,.6)" stroke-width="0.6" fill="none" stroke-linecap="round"/>' +
  '</svg>';

function initOriginHintFly() {
  const chevron = document.querySelector('.origin-chevron[data-chevron]');
  const subjectNode = document.querySelector('.lv-node.subject');
  if (!chevron && !subjectNode) return; // nothing on this page for a fly to give away

  const otherVaultNodes = subjectNode
    ? [...document.querySelectorAll('.lv-node')].filter(n => !n.classList.contains('subject'))
    : [];
  let cycleIdx = 0;

  // Priority: (1) this page's own unfound chevron, (2) once all 6 chevrons are found but
  // the origin isn't confirmed, THE SUBJECT node itself, (3) in between — while chevrons
  // are still being hunted elsewhere — loiter over other vault entries as a "there's still
  // something in here" tell. Returns null once nothing is left to give away on this page.
  function pickTarget() {
    if (chevron && originGetFound().indexOf(chevron.dataset.chevron) === -1) return chevron;
    const confirmed = originGetPref('origin.confirmed', '0') === '1';
    if (subjectNode && !confirmed) {
      if (originGetFound().length >= 6) return subjectNode;
      if (otherVaultNodes.length) { cycleIdx = (cycleIdx + 1) % otherVaultNodes.length; return otherVaultNodes[cycleIdx]; }
    }
    return null;
  }

  const fly = document.createElement('div');
  fly.className = 'origin-hint-fly spyfly';
  fly.innerHTML = SPYFLY_SVG;
  fly.style.left = '-40px';
  fly.style.top = '40px';
  document.body.appendChild(fly);

  function settle() {
    const target = pickTarget();
    if (!target) { fly.remove(); return false; }
    const r = target.getBoundingClientRect();
    const jx = (Math.random() - 0.5) * 16, jy = (Math.random() - 0.5) * 16;
    fly.style.left = (r.left + window.scrollX - 16 + jx) + 'px';
    fly.style.top = (r.top + window.scrollY - 10 + jy) + 'px';
    fly.classList.add('settled', 'sf-scheme');
    return true;
  }

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { settle(); return; }

  window.addEventListener('origin:progress', settle);

  setTimeout(function loop() {
    if (!settle()) return;
    setTimeout(loop, 1100 + Math.random() * 900); // frequent re-settling = actively leading, not just loitering
  }, 300);
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

// --- LIVING VAULT: the colour-by-community "constellation" (graphify's real slice) ---
// Obsidian/vis-network-style force graph rendered as static SVG. Hover/focus a node →
// it + its neighbours glow, the rest fade. Nodes/edges come straight from graph.json.
function initLvConstellation() {
  const root = document.getElementById('lv-constellation');
  if (!root) return;
  const svg = root.querySelector('svg');
  const info = root.querySelector('#lv-const-info');
  const nodes = [...root.querySelectorAll('.cn-node')];
  const edges = [...root.querySelectorAll('.cn-edge')];

  const adj = {};
  edges.forEach(e => {
    const a = e.dataset.a, b = e.dataset.b;
    (adj[a] = adj[a] || []).push(b);
    (adj[b] = adj[b] || []).push(a);
  });
  const byId = {};
  nodes.forEach(n => { byId[n.dataset.id] = n; });
  const labelOf = id => (byId[id] ? byId[id].dataset.label : id);

  function focus(id) {
    const node = byId[id];
    if (!node) return;
    svg.classList.add('cn-focused');
    const nb = new Set([id]);
    (adj[id] || []).forEach(o => nb.add(o));
    nodes.forEach(n => n.classList.toggle('lit', nb.has(n.dataset.id)));
    edges.forEach(e => e.classList.toggle('lit', e.dataset.a === id || e.dataset.b === id));
    const conns = adj[id] || [];
    let html = `<span class="lv-info-label">${node.dataset.label}</span>` +
               `<span class="lv-info-meta">${node.dataset.meta || ''}</span>`;
    html += conns.length
      ? conns.map(o => `<span class="lv-info-rel">→ ${labelOf(o)}</span>`).join('')
      : '<span class="lv-info-rel">no edges in this slice</span>';
    info.innerHTML = html;
  }
  function clear() {
    svg.classList.remove('cn-focused');
    nodes.forEach(n => n.classList.remove('lit'));
    edges.forEach(e => e.classList.remove('lit'));
    info.innerHTML = '<span class="lv-info-default">Hover or tap a node to trace its threads.</span>';
  }
  nodes.forEach(n => {
    const id = n.dataset.id;
    n.addEventListener('mouseenter', () => focus(id));
    n.addEventListener('mouseleave', clear);
    n.addEventListener('focus', () => focus(id));
    n.addEventListener('blur', clear);
  });
}

const CAKE_SVG = `<svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="100" cy="200" rx="78" ry="12" fill="var(--border-light)"/>
  <ellipse cx="100" cy="200" rx="70" ry="9" fill="none" stroke="rgba(26,26,30,.4)"/>
  <rect x="38" y="120" width="124" height="72" fill="#3b2a20" stroke="rgba(26,26,30,.4)"/>
  <ellipse cx="100" cy="192" rx="62" ry="10" fill="#3b2a20" stroke="rgba(26,26,30,.4)"/>
  <ellipse cx="100" cy="120" rx="62" ry="10" fill="#4a3527" stroke="rgba(26,26,30,.4)"/>
  <rect x="38" y="138" width="124" height="6" rx="3" fill="var(--bg-page)" opacity="0.95"/>
  <rect x="38" y="162" width="124" height="6" rx="3" fill="var(--bg-page)" opacity="0.95"/>
  <circle cx="50" cy="118" r="7" fill="var(--bg-page)"/><circle cx="66" cy="114" r="7" fill="var(--bg-page)"/>
  <circle cx="82" cy="112" r="7" fill="var(--bg-page)"/><circle cx="100" cy="111" r="7" fill="var(--bg-page)"/>
  <circle cx="118" cy="112" r="7" fill="var(--bg-page)"/><circle cx="134" cy="114" r="7" fill="var(--bg-page)"/>
  <circle cx="150" cy="118" r="7" fill="var(--bg-page)"/><circle cx="100" cy="122" r="7" fill="var(--bg-page)"/>
  <circle cx="76" cy="112" r="8" fill="var(--red)"/><circle cx="73" cy="109" r="2" fill="var(--bg-page)"/>
  <path d="M76,104 Q80,94 86,92" stroke="var(--green-dark)" stroke-width="2" fill="none"/>
  <rect x="97" y="70" width="6" height="44" fill="var(--bg-page)"/>
  <rect x="97" y="76" width="6" height="3" fill="var(--amber-dark)"/>
  <rect x="97" y="86" width="6" height="3" fill="var(--amber-dark)"/>
  <rect x="97" y="96" width="6" height="3" fill="var(--amber-dark)"/>
  <path d="M100,70 v-6" stroke="var(--border)" stroke-width="1.5"/>
  <circle class="oo-flame-glow" cx="100" cy="58" r="14" fill="var(--amber)" opacity="0.15"/>
  <g class="oo-flame">
    <path d="M100,48 C94,56 94,62 100,64 C106,62 106,56 100,48 Z" fill="var(--amber)"/>
    <path d="M100,52 C97,57 97,61 100,63 C103,61 103,57 100,52 Z" fill="var(--bg-page)"/>
  </g>
</svg>`;

const STILL_ALIVE_NOTES = [
  [523, 0.28], [523, 0.28], [523, 0.28], [440, 0.28], [523, 0.40], [587, 0.40], [523, 0.55],
  [0, 0.30],
  [392, 0.22], [440, 0.22], [523, 0.28], [523, 0.28], [587, 0.28], [659, 0.42],
  [0, 0.25],
  [698, 0.50], [659, 0.30], [587, 0.75]
];

// --- LIVING VAULT: the dial — the 7th glyph, traced by hand ---
// Gated on the sealed subject node + the overlay shell (both only exist on this page).
function initOriginDial() {
  const subject = document.querySelector('.lv-node.subject');
  const overlay = document.getElementById('origin-overlay');
  if (!subject || !overlay) return;

  const alreadyConfirmed = originGetPref('origin.confirmed', '0') === '1';
  if (alreadyConfirmed) {
    subject.classList.add('unsealed');
    const label = subject.querySelector('.lv-label');
    const sub = subject.querySelector('.lv-sub');
    if (label) label.textContent = 'POINT OF ORIGIN 🎂';
    if (sub) sub.textContent = '18 edges · one unsealed';
    return; // the sequence never replays
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function normalizePts(points) {
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
    const minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
    const w = (maxX - minX) || 1, h = (maxY - minY) || 1;
    const scale = Math.max(w, h) || 1;
    const offX = (scale - w) / 2, offY = (scale - h) / 2;
    return points.map(p => ({ x: (p.x - minX + offX) / scale, y: (p.y - minY + offY) / scale }));
  }
  function resample(points, n) {
    const cum = [0];
    for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + dist(points[i - 1], points[i]));
    const total = cum[cum.length - 1] || 1;
    const out = [];
    for (let i = 0; i < n; i++) {
      const target = total * i / (n - 1);
      let j = 1;
      while (j < cum.length - 1 && cum[j] < target) j++;
      const segStart = cum[j - 1], segEnd = cum[j], segLen = (segEnd - segStart) || 1;
      const t = (target - segStart) / segLen;
      const a = points[j - 1], b = points[j];
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
    return out;
  }

  const TAURI_WAYPOINTS = [
    [0.10, 0.90], [0.30, 0.62], [0.44, 0.42], [0.38, 0.28], [0.50, 0.18],
    [0.62, 0.28], [0.56, 0.42], [0.70, 0.62], [0.90, 0.90], [0.50, 0.90], [0.10, 0.90]
  ].map(p => ({ x: p[0], y: p[1] }));
  const TAURI_TARGET = resample(normalizePts(TAURI_WAYPOINTS), 32);

  const ring = overlay.querySelector('#oo-ring');
  const traceHost = overlay.querySelector('#oo-trace');
  const caption = overlay.querySelector('#oo-caption');
  const stageDial = overlay.querySelector('#oo-stage-dial');
  const stageKawoosh = overlay.querySelector('#oo-stage-kawoosh');
  const stageCake = overlay.querySelector('#oo-stage-cake');
  const stageClosing = overlay.querySelector('#oo-stage-closing');
  const closeBtn = overlay.querySelector('.oo-close');
  const audioToggle = overlay.querySelector('#oo-audio-toggle');
  const cakeHost = overlay.querySelector('#oo-cake');

  let audioCtx = null;
  let audioEnabled = originGetPref('origin.audio', 'off') === 'on';
  let audioLoopActive = false;

  function playNote(ctx, t, freq, dur) {
    if (!freq) return;
    const gate = dur * 0.92;
    [{ type: 'square', gain: 0.12, mul: 1 }, { type: 'triangle', gain: 0.06, mul: 0.5 }].forEach(v => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = v.type;
      osc.frequency.value = freq * v.mul;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v.gain, t + 0.008);
      g.gain.setValueAtTime(v.gain, t + gate - 0.06);
      g.gain.linearRampToValueAtTime(0, t + gate);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + gate + 0.02);
    });
  }
  function scheduleStillAlive(ctx, startT) {
    let t = startT;
    STILL_ALIVE_NOTES.forEach(n => { playNote(ctx, t, n[0], n[1]); t += n[1]; });
    return t;
  }
  function startAudioLoop() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    if (audioLoopActive) return;
    audioLoopActive = true;
    let loops = 0;
    (function loop() {
      if (!audioEnabled || !audioLoopActive || loops >= 3) { audioLoopActive = false; return; }
      loops++;
      const end = scheduleStillAlive(audioCtx, audioCtx.currentTime + 0.05);
      const totalMs = (end - audioCtx.currentTime) * 1000 + 4000;
      setTimeout(loop, totalMs);
    })();
  }
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    originSetPref('origin.audio', audioEnabled ? 'on' : 'off');
    audioToggle.textContent = audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF';
    if (audioEnabled) startAudioLoop(); else audioLoopActive = false;
  });

  function buildTraceSurface() {
    const pathD = TAURI_WAYPOINTS.map((p, i) => (i === 0 ? 'M' : 'L') + (p.x * 100).toFixed(1) + ',' + (p.y * 100).toFixed(1)).join(' ');
    const start = TAURI_WAYPOINTS[0];
    // decorative sun-with-rays over the loop the trace already draws — not part of the
    // verified path, just a visual cue that this glyph is "pyramid + circle + radiating lines"
    const sunCX = 50, sunCY = 21, sunR = 5;
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = i * 45 * Math.PI / 180;
      const x1 = sunCX + Math.cos(a) * (sunR + 1.5), y1 = sunCY + Math.sin(a) * (sunR + 1.5);
      const x2 = sunCX + Math.cos(a) * (sunR + 4), y2 = sunCY + Math.sin(a) * (sunR + 4);
      rays += '<line class="oo-trace-sun" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }
    traceHost.innerHTML =
      '<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">' +
      '<circle class="oo-trace-sun" cx="' + sunCX + '" cy="' + sunCY + '" r="' + sunR + '" fill="none"/>' +
      rays +
      '<path class="oo-trace-ghost" d="' + pathD + '"/>' +
      '<circle class="oo-trace-start" cx="' + (start.x * 100).toFixed(1) + '" cy="' + (start.y * 100).toFixed(1) + '" r="2.2"/>' +
      '<polyline class="oo-trace-live" id="oo-live" points=""/>' +
      '<rect x="0" y="0" width="100" height="100" fill="transparent"/>' +
      '</svg>';
    const svg = traceHost.querySelector('svg');
    const live = traceHost.querySelector('#oo-live');
    let samples = null;
    let failCount = 0;

    function svgPoint(evt) {
      const r = svg.getBoundingClientRect();
      return {
        x: (evt.clientX - r.left) / r.width * 100,
        y: (evt.clientY - r.top) / r.height * 100,
        t: (window.performance && performance.now) ? performance.now() : Date.now()
      };
    }
    function verify(raw) {
      if (raw.length < 20) return { ok: false, reason: 'TOO SHORT. TRACE THE WHOLE SHAPE.' };
      const duration = raw[raw.length - 1].t - raw[0].t;
      if (duration < 400) return { ok: false, reason: 'TOO FAST. THIS IS NOT A CLICK.' };
      if (duration > 15000) return { ok: false, reason: 'TOO SLOW. START OVER.' };
      let pathLen = 0;
      for (let i = 1; i < raw.length; i++) pathLen += dist(raw[i - 1], raw[i]);
      const xs = raw.map(p => p.x), ys = raw.map(p => p.y);
      const diag = Math.hypot(Math.max.apply(null, xs) - Math.min.apply(null, xs), Math.max.apply(null, ys) - Math.min.apply(null, ys)) || 1;
      if (pathLen / diag < 1.8) return { ok: false, reason: 'THAT WAS A LINE, NOT A GLYPH.' };
      const drawn = resample(normalizePts(raw), 32);
      let sum = 0, within = 0;
      for (let i = 0; i < 32; i++) {
        const d = dist(drawn[i], TAURI_TARGET[i]);
        sum += d;
        if (d <= 0.22) within++;
      }
      if (sum / 32 > 0.18 || within / 32 < 0.6) return { ok: false, reason: 'GESTURE NOT RECOGNIZED. TRY AGAIN. SLOWLY.' };
      return { ok: true };
    }
    function onTraceFail(reason) {
      failCount++;
      caption.textContent = reason;
      traceHost.classList.add('fail');
      setTimeout(() => traceHost.classList.remove('fail'), 800);
      if (failCount === 3) {
        traceHost.classList.add('demo');
        const ghost = traceHost.querySelector('.oo-trace-ghost');
        const demoDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        demoDot.setAttribute('r', '2');
        demoDot.setAttribute('fill', 'var(--amber)');
        const motion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        motion.setAttribute('dur', '6s');
        motion.setAttribute('repeatCount', '1');
        motion.setAttribute('path', ghost.getAttribute('d'));
        demoDot.appendChild(motion);
        svg.appendChild(demoDot);
        if (motion.beginElement) motion.beginElement();
      }
    }
    function onTraceSuccess() {
      originSetPref('origin.confirmed', '1');
      stageDial.hidden = true;
      stageKawoosh.hidden = false;
      subject.classList.add('unsealed');
      const label = subject.querySelector('.lv-label');
      const subMeta = subject.querySelector('.lv-sub');
      if (label) label.textContent = 'POINT OF ORIGIN 🎂';
      if (subMeta) subMeta.textContent = '18 edges · one unsealed';
      updateOriginWidget();
      window.dispatchEvent(new Event('origin:progress'));
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx && !audioCtx) audioCtx = new Ctx(); // created inside this gesture, per autoplay policy
      } catch (e) {}
      setTimeout(() => {
        stageKawoosh.hidden = true;
        stageCake.hidden = false;
        cakeHost.innerHTML = CAKE_SVG;
        audioToggle.textContent = audioEnabled ? 'AUDIO: ON' : 'AUDIO: OFF';
        if (audioEnabled) startAudioLoop();
        setTimeout(() => { stageClosing.hidden = false; }, 1400);
      }, 1800);
    }
    function onDown(evt) {
      if (svg.setPointerCapture) { try { svg.setPointerCapture(evt.pointerId); } catch (e) {} }
      samples = [svgPoint(evt)];
      live.setAttribute('points', samples[0].x + ',' + samples[0].y);
      traceHost.classList.remove('demo');
    }
    function onMove(evt) {
      if (!samples) return;
      samples.push(svgPoint(evt));
      live.setAttribute('points', samples.map(s => s.x + ',' + s.y).join(' '));
    }
    function onUp() {
      if (!samples) return;
      const result = verify(samples);
      samples = null;
      live.setAttribute('points', '');
      if (result.ok) onTraceSuccess(); else onTraceFail(result.reason);
    }
    svg.addEventListener('pointerdown', onDown);
    svg.addEventListener('pointermove', onMove);
    svg.addEventListener('pointerup', onUp);
    svg.addEventListener('pointercancel', onUp);
  }

  function openDial() {
    ring.innerHTML = '';
    for (let i = 0; i < 6; i++) ring.insertAdjacentHTML('beforeend', chevronSVGString('found on-dark'));
    stageDial.hidden = false;
    stageKawoosh.hidden = true;
    stageCake.hidden = true;
    stageClosing.hidden = true;
    caption.textContent = 'TRACE THE GLYPH TO CONFIRM ORIGIN. MACHINES CANNOT DO THIS. (STATISTICALLY.)';
    buildTraceSurface();
    overlay.classList.add('open');
  }
  function closeDial() { overlay.classList.remove('open'); }

  subject.addEventListener('click', () => { if (originGetFound().length >= 6) openDial(); });
  subject.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && originGetFound().length >= 6) { e.preventDefault(); openDial(); }
  });
  closeBtn.addEventListener('click', closeDial);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDial(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeDial(); });
}

// --- SCHEMATICS LAB: scheming spy flies ---
// Quick suspicious left-right head-turn. The rig has no separate eye bones (checked the
// glTF node graph — eyes are baked into the static mesh), so a whole-model yaw wiggle via
// model-viewer's own orientation property is the cheap stand-in for "shifty eyes."
function glance(fly) {
  const seq = [-20, 0, 18, 0];
  let i = 0;
  (function step() {
    if (i >= seq.length) return;
    fly.orientation = '0deg ' + seq[i] + 'deg 0deg';
    i++;
    setTimeout(step, 450);
  })();
}

// --- FACILITY DIRECTORY: flies teasing which cards hide something ---
// Muted, unhurried — a card gets visited, a fly arrives from an edge and vanishes at its
// center. Before a category locks, any operational card is fair game; after, only that
// category's cards keep getting visited, nudging the visitor back to the path they started.
function initOriginDirectoryFlies() {
  const grid = document.querySelector('.card-grid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('a.section-card')];
  if (!cards.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function targetCards() {
    const cat = originGetPref('origin.category', '');
    if (cat && CATEGORY_PAGES[cat]) {
      const pages = new Set(CATEGORY_PAGES[cat].map(p => p.page));
      const filtered = cards.filter(c => pages.has(c.getAttribute('href').replace('pages/', '').replace('.html', '')));
      if (filtered.length) return filtered;
    }
    return cards;
  }

  function spawnFly() {
    const pool = targetCards();
    const card = pool[Math.floor(Math.random() * pool.length)];
    const r = card.getBoundingClientRect();
    const targetX = r.left + r.width / 2 + window.scrollX, targetY = r.top + r.height / 2 + window.scrollY;
    const edge = Math.floor(Math.random() * 4);
    const vw = window.innerWidth, vh = window.innerHeight;
    let startX, startY;
    if (edge === 0) { startX = Math.random() * vw; startY = -20; }
    else if (edge === 1) { startX = vw + 20; startY = Math.random() * vh; }
    else if (edge === 2) { startX = Math.random() * vw; startY = vh + 20; }
    else { startX = -20; startY = Math.random() * vh; }
    startX += window.scrollX; startY += window.scrollY;

    const fly = document.createElement('div');
    fly.className = 'origin-directory-fly';
    fly.innerHTML = SPYFLY_SVG;
    fly.style.left = startX + 'px';
    fly.style.top = startY + 'px';
    document.body.appendChild(fly);
    requestAnimationFrame(() => {
      const dur = 2.2 + Math.random() * 1.2;
      fly.style.transition = 'left ' + dur + 's ease-in-out, top ' + dur + 's ease-in-out, opacity 0.6s ease ' + (dur - 0.6) + 's';
      fly.style.left = targetX + 'px';
      fly.style.top = targetY + 'px';
      setTimeout(() => { fly.style.opacity = '0'; }, (dur - 0.6) * 1000);
      setTimeout(() => fly.remove(), dur * 1000 + 700);
    });
  }

  setTimeout(function loop() {
    spawnFly();
    setTimeout(loop, 4000 + Math.random() * 3000);
  }, 6000 + Math.random() * 2000);
}

function initSpyflies() {
  const field = document.querySelector('.spyfly-field');
  if (!field) return;
  const flies = [...field.querySelectorAll('.spyfly')];
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    flies.forEach((fly, i) => {
      fly.style.transform = 'translate(' + (20 + i * 46) + 'px, ' + (16 + (i % 2) * 34) + 'px) rotate(-8deg)';
      fly.classList.add('sf-scheme');
    });
    return;
  }

  flies.forEach(fly => {
    let pos = { x: Math.random() * 60, y: Math.random() * 60 };
    fly.style.transform = 'translate(' + pos.x + 'px,' + pos.y + 'px)';

    function idle() {
      fly.classList.add('sf-idle');
      fly.classList.remove('sf-scheme');
      setTimeout(skitter, 2000 + Math.random() * 4000);
    }
    function skitter() {
      fly.classList.remove('sf-idle');
      const r = field.getBoundingClientRect();
      const x = 10 + Math.random() * Math.max(10, r.width - 40);
      const y = 10 + Math.random() * Math.max(10, r.height - 30);
      const distPx = Math.hypot(x - pos.x, y - pos.y);
      const speed = 60 + Math.random() * 30;
      const dur = Math.max(0.4, distPx / speed);
      const deg = Math.atan2(y - pos.y, x - pos.x) * 180 / Math.PI;
      fly.style.transitionDuration = dur + 's';
      fly.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + deg + 'deg)';
      pos = { x, y };
      setTimeout(scheme, dur * 1000);
    }
    function scheme() {
      fly.classList.add('sf-scheme');
      glance(fly); // no eye bones on this rig, so the whole head turns — reads as "sus" anyway
      setTimeout(idle, 3000);
    }
    setTimeout(skitter, 500 + Math.random() * 1500);
  });
}

// --- SCHRUTE LIBRARY: Charity Poker book ---
// The library's over-engineered hierarchy (LibraryItem > Shelf > Book > Chapter >
// Page > Note) is the literal data model here: opening the book starts a Book for
// the visitor's chosen cause, each of the 6 poker rounds is a Chapter, each
// Chapter's table snapshot is a Page, and each feed line is a Note on that Page.
// Charity data mirrors charity-poker-web/charities.js — real effective-giving
// categories only, no fabricated orgs.
function initCharityPokerBook() {
  const root = document.getElementById('poker-book');
  if (!root) return;

  const BOOK_CHARITIES = [
    {
      id: 'poverty', name: 'Armoede & Gezondheid', emoji: '🔥', color: '#D4463A',
      fund: 'Fonds Armoede & Gezondheid',
      orgs: ['Against Malaria Foundation', 'Helen Keller International', 'New Incentives', 'StrongMinds'],
    },
    {
      id: 'climate', name: 'Klimaat', emoji: '🌍', color: '#2D8A4E',
      fund: 'Klimaatfonds',
      orgs: ['Clean Air Task Force', 'Opportunity Green', 'Future Cleantech Architects'],
    },
    {
      id: 'animals', name: 'Dierenwelzijn & Eiwittransitie', emoji: '🐾', color: '#C57B2B',
      fund: 'Fonds Dierenwelzijn & Eiwittransitie',
      orgs: ['The Humane League', 'The Good Food Institute'],
    },
  ];
  const FAKE_NAMES = [
    'Vera Bluff', 'Sil de Kaart', 'Marnix Pot', 'Juno Fold', 'Bram Allin',
    'Lotte River', 'Kees Tilt', 'Nina Chip', 'Ravi Draw', 'Fae Nuts',
  ];
  const BUY_IN = 25, CHAPTERS = 6, SPLIT = [0.60, 0.25, 0.15];
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const euro = n => '€' + Math.round(n).toLocaleString('nl-NL');
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const els = {
    pick: root.querySelector('#pb-stage-pick'),
    table: root.querySelector('#pb-stage-table'),
    reveal: root.querySelector('#pb-stage-reveal'),
    cards: root.querySelector('#pb-cards'),
    badge: root.querySelector('#pb-round-badge'),
    standings: root.querySelector('#pb-standings'),
    note: root.querySelector('#pb-note'),
    podium: root.querySelector('#pb-podium'),
    pools: root.querySelector('#pb-pools'),
    verdict: root.querySelector('#pb-verdict'),
    again: root.querySelector('#pb-again'),
  };

  let book = null; // the visitor's Book: { players, myCharityId }

  function showStage(stage) {
    [els.pick, els.table, els.reveal].forEach(s => s.classList.remove('active'));
    stage.classList.add('active');
  }

  function renderCards() {
    els.cards.innerHTML = '';
    BOOK_CHARITIES.forEach(c => {
      const a = document.createElement('a');
      a.className = 'section-card';
      a.href = '#';
      a.style.borderColor = c.color;
      a.innerHTML = `
        <div class="card-head">
          <span class="card-num">${c.emoji} FUND</span>
          <span class="card-status operational">Back this cause</span>
        </div>
        <div class="card-title">${c.name}</div>
        <div class="card-desc">${c.orgs.join(' · ')}</div>
        <div class="card-cat">${c.fund}</div>`;
      a.addEventListener('click', e => { e.preventDefault(); openBook(c.id); });
      els.cards.appendChild(a);
    });
  }

  function newPlayer(name, cause, you) {
    return { name, cause, you, stack: BUY_IN, delta: 0, skill: rand(0.7, 1.3) };
  }

  // openBook() = start a new Book for the visitor's chosen cause
  function openBook(charityId) {
    const causeFor = () => pick(BOOK_CHARITIES);
    const players = [newPlayer('You', BOOK_CHARITIES.find(c => c.id === charityId), true)];
    const names = [...FAKE_NAMES].sort(() => Math.random() - 0.5);
    for (let i = 1; i < 8; i++) players.push(newPlayer(names[i - 1], causeFor(), false));
    book = { players, myCharityId: charityId };

    showStage(els.table);
    renderPage(true);
    writeChapters();
  }

  // renderPage() = render the current table snapshot (a Page in the current Chapter)
  function renderPage(initial) {
    const sorted = [...book.players].sort((a, b) => b.stack - a.stack);
    els.standings.innerHTML = '';
    sorted.forEach((p, i) => {
      const row = document.createElement('li');
      row.className = 'pb-row' + (p.you ? ' you' : '');
      const d = p.delta;
      const deltaHtml = (!initial && d) ? `<span class="pb-delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'}${euro(Math.abs(d))}</span>` : '';
      row.innerHTML = `
        <span class="pb-rank">${i + 1}</span>
        <span class="pb-who">${p.cause.emoji} ${p.name}<span class="pb-cause">${p.cause.name}</span></span>
        <span class="pb-stack">${euro(p.stack)}${deltaHtml}</span>`;
      els.standings.appendChild(row);
    });
  }

  // note() = write a Note on the current Page
  function note(msg) { els.note.innerHTML = `<span>${msg}</span>`; }

  // zero-sum Chapter: redistribute chips among players still holding a stack
  function playChapter() {
    const prev = book.players.map(p => p.stack);
    const active = book.players.filter(p => p.stack > 0);
    let pot = 0;
    const bets = new Map();
    active.forEach(p => {
      const bet = Math.min(p.stack, rand(3, 12) * p.skill);
      bets.set(p, bet); pot += bet; p.stack -= bet;
    });
    const weights = active.map(p => bets.get(p) * p.skill * rand(0.4, 1.6));
    const total = weights.reduce((a, b) => a + b, 0);
    active.forEach((p, i) => { p.stack += pot * (weights[i] / total); });
    book.players.forEach((p, i) => { p.delta = p.stack - prev[i]; });
  }

  function chapterNote(r) {
    const sorted = [...book.players].sort((a, b) => b.stack - a.stack);
    const leader = sorted[0], you = book.players[0];
    const yrank = sorted.indexOf(you) + 1;
    return pick([
      `${leader.cause.emoji} ${leader.name} is chip leader — playing for ${leader.cause.name}.`,
      you.delta > 0 ? `Nice pot! You climb to #${yrank}.` : `You slip to #${yrank}. Hold the line.`,
      `${leader.name} extends the lead…`,
      `Tight table — three players within one big blind.`,
    ]);
  }

  async function writeChapters() {
    await wait(600);
    for (let r = 1; r <= CHAPTERS; r++) {
      els.badge.textContent = `Chapter ${r} / ${CHAPTERS}`;
      playChapter();
      renderPage(false);
      note(chapterNote(r));
      await wait(1050);
    }
    els.badge.textContent = 'Final Chapter — Showdown';
    await wait(650);
    revealColophon();
  }

  // revealColophon() = the Book's closing page: where the pot actually went
  function revealColophon() {
    const totalPot = book.players.length * BUY_IN;
    const ranked = [...book.players].sort((a, b) => b.stack - a.stack);
    const top3 = ranked.slice(0, 3);

    const pools = {};
    BOOK_CHARITIES.forEach(c => pools[c.id] = 0);
    top3.forEach((p, i) => { pools[p.cause.id] += totalPot * SPLIT[i]; });

    const medals = ['🥇', '🥈', '🥉'];
    els.podium.innerHTML = '';
    top3.forEach((p, i) => {
      const div = document.createElement('div');
      div.className = 'panel';
      div.style.textAlign = 'center';
      div.style.borderColor = p.cause.color;
      div.innerHTML = `
        <div style="font-size:1.6rem;">${medals[i]}</div>
        <h3 style="font-size:0.95rem;">${p.name}${p.you ? ' (you)' : ''}</h3>
        <p style="font-family: var(--mono); font-size:0.72rem;">${p.cause.emoji} ${p.cause.name}</p>
        <p style="font-family: var(--mono); font-weight:700;">${euro(totalPot * SPLIT[i])}</p>`;
      els.podium.appendChild(div);
    });

    const max = Math.max(...Object.values(pools), 1);
    els.pools.innerHTML = '';
    BOOK_CHARITIES.forEach(c => {
      const amt = pools[c.id];
      const row = document.createElement('div');
      row.className = 'pool-bar-row';
      row.innerHTML = `
        <div class="pool-bar-label"><span>${c.emoji} ${c.fund}</span><span>${euro(amt)}</span></div>
        <div class="pool-bar-track"><div class="pool-bar-fill" style="background:${c.color};"></div></div>`;
      els.pools.appendChild(row);
      requestAnimationFrame(() =>
        setTimeout(() => { row.querySelector('.pool-bar-fill').style.width = (amt / max * 100) + '%'; }, 100));
    });

    const mine = BOOK_CHARITIES.find(c => c.id === book.myCharityId);
    const myShare = pools[book.myCharityId];
    const youPodium = top3.find(p => p.you);
    let msg;
    if (youPodium) {
      msg = `<span class="win">You finished top 3!</span> Your run sent ${euro(totalPot * SPLIT[top3.indexOf(youPodium)])} to <b>${mine.name}</b>.`;
    } else if (myShare > 0) {
      msg = `You busted out — but another player backing <b>${mine.name}</b> reached the podium. <span class="win">${mine.name} still collects ${euro(myShare)}.</span>`;
    } else {
      msg = `<span class="lose">Your cause missed the podium this time.</span> The pot of ${euro(totalPot)} still went entirely to charity — just not yours.`;
    }
    els.verdict.innerHTML = msg;

    showStage(els.reveal);
  }

  els.again.addEventListener('click', () => showStage(els.pick));
  renderCards();
}

// --- SCHEMATICS LAB: draggable ER explorer, DDL/Mermaid output ---
const SCHEM_PRESETS = {
  FACILITY: {
    entities: [
      { id: 'chamber', name: 'Chamber', x: 30, y: 20, visible: true, fields: [['id', 'int'], ['number', 'int'], ['name', 'text'], ['status', 'enum']] },
      { id: 'personnel', name: 'Personnel', x: 290, y: 20, visible: true, fields: [['id', 'guid'], ['chamber_id', 'int'], ['role', 'text'], ['clearance', 'text']] },
      { id: 'chevron', name: 'Chevron', x: 30, y: 210, visible: true, fields: [['id', 'int'], ['chamber_id', 'int'], ['slug', 'text'], ['found_at', 'timestamp']] }
    ],
    relations: [{ from: 'chamber', to: 'personnel', card: '1—N' }, { from: 'chamber', to: 'chevron', card: '1—1' }]
  },
  VAULT: {
    entities: [
      { id: 'node', name: 'Node', x: 30, y: 20, visible: true, fields: [['id', 'text'], ['label', 'text'], ['community', 'int']] },
      { id: 'edge', name: 'Edge', x: 290, y: 20, visible: true, fields: [['id', 'int'], ['a_id', 'text'], ['b_id', 'text'], ['rel', 'text']] },
      { id: 'community', name: 'Community', x: 160, y: 210, visible: true, fields: [['id', 'int'], ['name', 'text']] }
    ],
    relations: [{ from: 'node', to: 'edge', card: '1—N' }, { from: 'node', to: 'community', card: 'N—N' }]
  },
  CANTEEN: {
    entities: [
      { id: 'cake', name: 'Cake', x: 30, y: 20, visible: true, fields: [['id', 'int'], ['name', 'text'], ['is_lie', 'bool']] },
      { id: 'recipe', name: 'Recipe', x: 290, y: 20, visible: true, fields: [['id', 'int'], ['cake_id', 'int'], ['step', 'int'], ['instruction', 'text']] },
      { id: 'ingredient', name: 'Ingredient', x: 160, y: 210, visible: true, fields: [['id', 'int'], ['recipe_id', 'int'], ['name', 'text'], ['qty', 'text']] }
    ],
    relations: [{ from: 'cake', to: 'recipe', card: '1—N' }, { from: 'recipe', to: 'ingredient', card: '1—N' }]
  }
};

function initSchematicsLab() {
  const app = document.getElementById('schem-app');
  if (!app) return;

  const entityList = document.getElementById('schem-entity-list');
  const relList = document.getElementById('schem-rel-list');
  const presetsEl = document.getElementById('schem-presets');
  const windowEl = document.getElementById('schem-window');
  const outputEl = document.getElementById('schem-output');
  const addBtn = document.getElementById('schem-add-entity');
  const transcribeBtn = document.getElementById('schem-transcribe');
  const tabs = document.querySelectorAll('.schem-tab');

  let state = null;
  let activePreset = 'FACILITY';
  let activeTab = 'ddl';
  const CARD_CYCLE = ['1—1', '1—N', 'N—N'];

  function clonePreset(name) { return JSON.parse(JSON.stringify(SCHEM_PRESETS[name])); }
  function entityById(id) { return state.entities.find(e => e.id === id); }

  function toDDL() {
    return state.entities.filter(e => e.visible).map(e =>
      'CREATE TABLE ' + e.name.toLowerCase() + ' (\n' +
      e.fields.map(f => '  ' + f[0] + ' ' + f[1]).join(',\n') +
      '\n);'
    ).join('\n\n') || '-- no entities visible --';
  }
  function cardToMermaid(card) {
    return { '1—1': '||--||', '1—N': '||--o{', 'N—N': '}o--o{' }[card] || '||--o{';
  }
  function toMermaid() {
    const visible = new Set(state.entities.filter(e => e.visible).map(e => e.id));
    const lines = ['erDiagram'];
    state.relations.filter(r => visible.has(r.from) && visible.has(r.to)).forEach(r => {
      lines.push('  ' + entityById(r.from).name.toUpperCase() + ' ' + cardToMermaid(r.card) + ' ' +
        entityById(r.to).name.toUpperCase() + ' : "' + r.card + '"');
    });
    state.entities.filter(e => e.visible).forEach(e => {
      lines.push('  ' + e.name.toUpperCase() + ' {');
      e.fields.forEach(f => lines.push('    ' + f[1] + ' ' + f[0]));
      lines.push('  }');
    });
    return lines.join('\n');
  }

  function renderOutput() {
    outputEl.textContent = activeTab === 'ddl' ? toDDL() : toMermaid();
  }

  function renderControls() {
    entityList.innerHTML = state.entities.map(e =>
      '<div class="schem-entity-ctrl" data-eid="' + e.id + '">' +
        '<div class="sec-head"><span class="sec-name">' + e.name + '</span>' +
        '<button type="button" class="schem-chk' + (e.visible ? ' on' : '') + '" data-toggle-entity="' + e.id + '">' +
        (e.visible ? '[■]' : '[ ]') + '</button></div>' +
        e.fields.map(f => '<div class="schem-field-row">' + f[0] + ' : ' + f[1] + '</div>').join('') +
      '</div>'
    ).join('');
    relList.innerHTML = state.relations.map((r, i) =>
      '<div class="schem-rel-row"><span>' + entityById(r.from).name + ' → ' + entityById(r.to).name + '</span>' +
      '<span class="schem-card-pill" data-rel-idx="' + i + '">' + r.card + '</span></div>'
    ).join('');

    entityList.querySelectorAll('[data-toggle-entity]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ent = entityById(btn.dataset.toggleEntity);
        ent.visible = !ent.visible;
        renderControls(); renderDiagram(); renderOutput();
      });
    });
    relList.querySelectorAll('[data-rel-idx]').forEach(pill => {
      pill.addEventListener('click', () => {
        const rel = state.relations[+pill.dataset.relIdx];
        rel.card = CARD_CYCLE[(CARD_CYCLE.indexOf(rel.card) + 1) % CARD_CYCLE.length];
        renderControls(); renderOutput();
      });
    });
  }

  function entityBox(e) {
    const h = 22 + e.fields.length * 11;
    return { w: 150, h: h };
  }
  function entityAnchor(e) {
    const box = entityBox(e);
    return { x: e.x + box.w / 2, y: e.y + box.h / 2 };
  }

  function renderDiagram() {
    const visible = state.entities.filter(e => e.visible);
    let grid = '';
    for (let gx = 0; gx <= 480; gx += 24) grid += '<line class="schem-bp-line" x1="' + gx + '" y1="0" x2="' + gx + '" y2="320"/>';
    for (let gy = 0; gy <= 320; gy += 24) grid += '<line class="schem-bp-line" x1="0" y1="' + gy + '" x2="480" y2="' + gy + '"/>';

    let relSvg = '';
    state.relations.forEach((r, i) => {
      const a = entityById(r.from), b = entityById(r.to);
      if (!a || !b || !a.visible || !b.visible) return;
      const pa = entityAnchor(a), pb = entityAnchor(b);
      const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
      relSvg += '<g class="schem-rel-group" data-rel="' + i + '" data-from="' + r.from + '" data-to="' + r.to + '">' +
        '<line class="schem-rel-line" x1="' + pa.x + '" y1="' + pa.y + '" x2="' + pb.x + '" y2="' + pb.y + '"/>' +
        '<circle class="schem-rel-dot" data-end="a" cx="' + pa.x + '" cy="' + pa.y + '" r="2"/>' +
        '<circle class="schem-rel-dot" data-end="b" cx="' + pb.x + '" cy="' + pb.y + '" r="2"/>' +
        '<text class="schem-rel-label" x="' + mx + '" y="' + (my - 3) + '" text-anchor="middle">' + r.card + '</text>' +
        '</g>';
    });

    let entSvg = '';
    visible.forEach(e => {
      const box = entityBox(e);
      entSvg += '<g class="schem-ent-group" data-eid="' + e.id + '" transform="translate(' + e.x + ',' + e.y + ')">' +
        '<rect class="schem-ent-box" width="' + box.w + '" height="' + box.h + '"/>' +
        '<rect class="schem-ent-head" width="' + box.w + '" height="16"/>' +
        '<text class="schem-ent-label" x="' + (box.w / 2) + '" y="11" text-anchor="middle">' + e.name.toUpperCase() + '</text>' +
        e.fields.map((f, i) => '<text class="schem-ent-field" x="8" y="' + (30 + i * 11) + '">' + f[0] + ' : ' + f[1] + '</text>').join('') +
        '</g>';
    });

    windowEl.innerHTML = '<svg viewBox="0 0 480 320" aria-label="Draggable entity-relationship diagram">' +
      grid + relSvg + entSvg + '</svg>';

    // Drag wiring lives on this same SVG instance for its whole lifetime — repositioning
    // during a drag must NOT touch innerHTML, or the element under pointer capture is
    // destroyed mid-gesture (the bug: entities only "wiggled" once, then stopped moving).
    const svg = windowEl.querySelector('svg');
    function svgPoint(evt) {
      const r = svg.getBoundingClientRect();
      return { x: (evt.clientX - r.left) / r.width * 480, y: (evt.clientY - r.top) / r.height * 320 };
    }
    function repositionEntity(id) {
      const ent = entityById(id);
      const g = svg.querySelector('.schem-ent-group[data-eid="' + id + '"]');
      if (g) g.setAttribute('transform', 'translate(' + ent.x + ',' + ent.y + ')');
      svg.querySelectorAll('.schem-rel-group').forEach(rg => {
        if (rg.dataset.from !== id && rg.dataset.to !== id) return;
        const a = entityById(rg.dataset.from), b = entityById(rg.dataset.to);
        if (!a || !b) return;
        const pa = entityAnchor(a), pb = entityAnchor(b);
        const mx = (pa.x + pb.x) / 2, my = (pa.y + pb.y) / 2;
        const line = rg.querySelector('.schem-rel-line');
        line.setAttribute('x1', pa.x); line.setAttribute('y1', pa.y);
        line.setAttribute('x2', pb.x); line.setAttribute('y2', pb.y);
        const dotA = rg.querySelector('.schem-rel-dot[data-end="a"]');
        const dotB = rg.querySelector('.schem-rel-dot[data-end="b"]');
        dotA.setAttribute('cx', pa.x); dotA.setAttribute('cy', pa.y);
        dotB.setAttribute('cx', pb.x); dotB.setAttribute('cy', pb.y);
        const label = rg.querySelector('.schem-rel-label');
        label.setAttribute('x', mx); label.setAttribute('y', my - 3);
      });
    }

    let dragId = null, offset = { x: 0, y: 0 };
    svg.querySelectorAll('.schem-ent-group').forEach(g => {
      g.addEventListener('pointerdown', evt => {
        dragId = g.dataset.eid;
        const p = svgPoint(evt);
        const ent = entityById(dragId);
        offset = { x: p.x - ent.x, y: p.y - ent.y };
        if (svg.setPointerCapture) { try { svg.setPointerCapture(evt.pointerId); } catch (e) {} }
      });
    });
    svg.addEventListener('pointermove', evt => {
      if (!dragId) return;
      const ent = entityById(dragId);
      const box = entityBox(ent);
      const p = svgPoint(evt);
      ent.x = Math.max(0, Math.min(480 - box.w, p.x - offset.x));
      ent.y = Math.max(0, Math.min(320 - box.h, p.y - offset.y));
      repositionEntity(dragId);
    });
    function endDrag() { dragId = null; }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
  }

  function loadPreset(name) {
    activePreset = name;
    state = clonePreset(name);
    presetsEl.querySelectorAll('.schem-preset-btn').forEach(b => b.classList.toggle('active', b.dataset.preset === name));
    renderControls(); renderDiagram(); renderOutput();
  }

  presetsEl.innerHTML = Object.keys(SCHEM_PRESETS).map(name =>
    '<button type="button" class="schem-preset-btn" data-preset="' + name + '">' + name + '</button>'
  ).join('');
  presetsEl.querySelectorAll('.schem-preset-btn').forEach(b => b.addEventListener('click', () => loadPreset(b.dataset.preset)));

  addBtn.addEventListener('click', () => {
    const n = state.entities.length + 1;
    state.entities.push({ id: 'entity' + n + '_' + Math.random().toString(36).slice(2, 6), name: 'NEW_ENTITY_' + n, x: 20 + (n % 3) * 40, y: 20 + (n % 4) * 30, visible: true, fields: [['id', 'guid']] });
    renderControls(); renderDiagram(); renderOutput();
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      renderOutput();
    });
  });

  transcribeBtn.addEventListener('click', () => {
    const text = outputEl.textContent;
    const done = () => {
      transcribeBtn.textContent = 'TRANSCRIBED.';
      transcribeBtn.classList.add('done');
      setTimeout(() => { transcribeBtn.textContent = 'TRANSCRIBE'; transcribeBtn.classList.remove('done'); }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });

  loadPreset(activePreset);
}

// --- GRAVEYARD: three-generation timeline (scope shrinks, shipped grows) ---
function initGraveyardTimeline() {
  const root = document.getElementById('graveyard-timeline');
  if (!root) return;
  const amb = root.querySelector('#gy-ambition'), shp = root.querySelector('#gy-shipped');
  const ambV = root.querySelector('#gy-ambition-val'), shpV = root.querySelector('#gy-shipped-val');
  const detail = root.querySelector('#gy-detail');
  const G = {
    '1': { ambition: 100, shipped: 25, label: 'Gen 1 · LocalAI / Main-Ai-Tool',
      body: 'Maximal vision: orchestrator + GPU model-swap scheduler + Blazor UI + <strong>14 pipelines</strong>. Real code, proven to have run once (outputs 2026-04-16) — but the Blazor UI was never built, so it crashes on startup now; music pipelines stubbed. Verdict: merge into Vox.' },
    '2': { ambition: 65, shipped: 30, label: 'Gen 2 · AudioPipeline / day-data-analyser',
      body: 'A daemon: folder-watch + Whisper + MIDI + classifier microservices. It compiles — but the <strong>3 Docker sidecar images don\'t exist</strong> (referenced by name only), and the classifier is dead code. Verdict: archive; its clean .NET core cherry-picked into Vox.' },
    '3': { ambition: 30, shipped: 95, label: 'Gen 3 · Vox ⭐ (the survivor)',
      body: 'The simplest: voice memo → transcribe → summarise → markdown in the vault. <strong>5 clean services, zero stubs</strong>, compiles, first end-to-end run 2026-06-05. Uses Ollama instead of the never-loaded llama-stack. Verdict: ship-closest. The one that already shed the ambition.' },
  };
  const btns = root.querySelectorAll('.lsf-op[data-gen]');
  function show(g) {
    const d = G[g];
    amb.style.width = d.ambition + '%'; shp.style.width = d.shipped + '%';
    ambV.textContent = d.ambition + '%'; shpV.textContent = d.shipped + '%';
    detail.innerHTML = `<span class="lv-info-label">${d.label}</span>` +
      `<span class="lv-info-meta">ambition ${d.ambition}% · shipped ${d.shipped}%</span>` +
      `<span class="lv-info-rel" style="display:block;margin-top:0.3rem;">${d.body}</span>`;
  }
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.toggle('active', x === b));
    show(b.dataset.gen);
  }));
}

// --- HARDWARE: 8GB VRAM allocator (concurrent OOMs, sequential fits) ---
function initHardwareVram() {
  const root = document.getElementById('hardware-vram');
  if (!root) return;
  const CEIL = 8.0, SIZE = { whisper: 3.0, llm: 5.6 };
  const NAME = { whisper: 'faster-whisper-medium', llm: 'qwen2.5:7b' };
  const fillW = root.querySelector('#hw-fill-whisper'), fillL = root.querySelector('#hw-fill-llm');
  const readout = root.querySelector('#hw-readout'), verdict = root.querySelector('#hw-verdict');
  let mode = 'concurrent';
  const loaded = { whisper: false, llm: false };
  function render() {
    const usedW = loaded.whisper ? SIZE.whisper : 0, usedL = loaded.llm ? SIZE.llm : 0;
    const total = usedW + usedL;
    fillW.style.width = (usedW / CEIL * 100) + '%';
    fillL.style.width = (usedL / CEIL * 100) + '%';
    const over = total > CEIL + 0.001;
    fillW.classList.toggle('oom', over); fillL.classList.toggle('oom', over);
    readout.textContent = `${total.toFixed(1)} / ${CEIL.toFixed(1)} GB used`;
    readout.classList.toggle('oom', over);
    let html;
    if (over) {
      html = `<span class="lv-info-label" style="color:var(--red)">CUDA out of memory</span>` +
        `<span class="lv-info-meta">${total.toFixed(1)} GB requested on an 8 GB card</span>` +
        `<span class="lv-info-rel">This is exactly the "wall." Switch to <strong>Sequential</strong> — the same two models fit when only one is resident at a time.</span>`;
    } else if (!loaded.whisper && !loaded.llm) {
      html = `<span class="lv-info-default">Load a model. Then try loading the other.</span>`;
    } else {
      const names = Object.keys(loaded).filter(k => loaded[k]).map(k => NAME[k]).join(' + ');
      html = `<span class="lv-info-label" style="color:var(--green-dark)">Resident: ${names}</span>` +
        `<span class="lv-info-meta">${total.toFixed(1)} GB of 8.0 GB — fits</span>` +
        (mode === 'sequential'
          ? `<span class="lv-info-rel">Sequential mode: loading one model releases the other (a VramCooldownSeconds handoff sits between the phases).</span>`
          : `<span class="lv-info-rel">Fits for now — but load the other model too and watch the card overflow.</span>`);
    }
    verdict.innerHTML = html;
  }
  root.querySelectorAll('.hw-modebtn').forEach(b => b.addEventListener('click', () => {
    root.querySelectorAll('.hw-modebtn').forEach(x => x.classList.toggle('active', x === b));
    mode = b.dataset.mode;
    if (mode === 'sequential' && loaded.whisper && loaded.llm) loaded.llm = false;
    render();
  }));
  root.querySelectorAll('.lsf-op[data-load]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.load;
    if (k === 'reset') { loaded.whisper = false; loaded.llm = false; render(); return; }
    if (mode === 'sequential') { loaded.whisper = false; loaded.llm = false; loaded[k] = true; }
    else { loaded[k] = !loaded[k]; }
    render();
  }));
  render();
}

// --- COLLAB: joint-operations authorization form ---
function initCollabAuth() {
  const root = document.getElementById('collab-auth');
  if (!root) return;
  const name = root.querySelector('#ca-name'), intent = root.querySelector('#ca-intent');
  const result = root.querySelector('#ca-result');
  root.querySelector('#ca-submit').addEventListener('click', () => {
    const who = ((name.value || '').trim() || 'Unnamed Test Subject').replace(/[<>&]/g, '');
    const said = (intent.value || '').trim();
    if (!said) {
      result.hidden = false;
      result.innerHTML = `<div class="ca-deny">CLEARANCE PENDING — state an objective. The facility needs to know what you're building.</div>`;
      return;
    }
    result.hidden = false;
    result.innerHTML =
      `<div class="ca-grant">✔ CLEARANCE GRANTED — <strong>${who}</strong></div>` +
      `<p class="ca-note">Objective logged. Channels released — reach out through any of these:</p>` +
      `<div class="socket-row">` +
        `<a class="socket active" href="https://github.com/monchyk"><span class="status-dot on"></span> GitHub · monchyk</a>` +
        `<a class="socket active" href="https://klaasm.be"><span class="status-dot on"></span> klaasm.be</a>` +
        `<a class="socket active" href="https://monchyk.github.io/burn-lights/"><span class="status-dot on"></span> burn-lights zine</a>` +
        `<a class="socket active" href="mailto:klaas.monchy@outlook.com"><span class="status-dot on"></span> e-mail</a>` +
      `</div>` +
      `<p class="ca-note" style="color:var(--border-light)">"Welcome to joint operations. Now go make something." — the management</p>`;
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
  initLvConstellation();   // gates on #lv-constellation
  initOriginDial();        // gates on .lv-node.subject + #origin-overlay
  initSchematicsLab();     // gates on #schem-app
  initSpyflies();          // gates on .spyfly-field
  initCharityPokerBook();  // gates on #poker-book
  initOriginDirectoryFlies(); // gates on .card-grid
  initGraveyardTimeline(); // gates on #graveyard-timeline
  initHardwareVram();      // gates on #hardware-vram
  initCollabAuth();        // gates on #collab-auth
}

// ============================================
// BOOT
// ============================================
(function boot() {
  initAccordions();
  initRedacted();
  initLocked();
  initOriginChevronPlacement(); // locks category (if unset) + injects real chevrons into slots
  initOriginDialWidget();
  initOriginVisitCard();
  initOriginChevrons();
  initOriginHintFly();
  initPages();
})();
