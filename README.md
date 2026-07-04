# Aperture Field Manual

An in-universe Aperture Science field manual documenting one test subject's project
landscape, AI-orchestration infrastructure, and the neurodivergent operating system
built around it. A Portal-flavoured interactive web zine — narrated by GLaDOS (the
governor), motivated by Cave Johnson (the grit).

Second in a series. The first — the **[Aperture Forest Operations Manual](https://monchyk.github.io/burn-lights/)**
(burn-lights) — proved the format. This one is broader, deeper, and indexed for navigation.

**Live:** `https://<user>.github.io/aperture-field-manual/` _(pending repo creation + GitHub Pages)_

---

## Status — Phases 1–3 (partial)

Built (7 chambers live):

- `index.html` — Facility Directory (navigation hub, card grid)
- `pages/governor.html` — **The Governor**: speed limiter + **interactive battery pre-flight**
- `pages/gears.html` — **The Gear System**: 4-gear engine, stress test + **live gear switcher**
- `pages/workshop.html` — **The Workshop**: the human operating model
- `pages/emotionhue.html` — **EmotionHue**: light engine + **interactive customisation console**
- `pages/letssavefood.html` — **Let's Save Food**: .NET/EF Core food-bank engine + **interactive audit-trail generator**
- `pages/livingvault.html` — **The Living Vault**: zero-quota self-monitoring pipeline, Mermaid flow diagrams + **two interactive graphs** (a curated "process spine" and a colour-by-community "constellation", both from real graph.json) + verbatim `graphify explain`/`path` output
- `pages/philosophy.html` — **The Prime Directive**: the one rule + **interactive radial map**
- `style.css`, `script.js` — shared component library + behaviour

**Interactive elements (all plain JS, no libraries):** battery pre-flight (GLaDOS gates the
session), gear switcher (page rewrites its own verbosity), radial convergence map
(hover-to-light, click-to-travel), EmotionHue console (drive a virtual light room by
weather + emotional profile + master knob), Let's Save Food audit generator (run real
inventory operations, watch each one append the exact `AuditLog` row EF Core would write),
Living Vault context web (hover the real 420-node graph to trace genuine EXTRACTED/INFERRED
connections). One scoped exception to the no-library rule: `livingvault.html` loads
**Mermaid.js** from a CDN (only that page) to render its flow diagrams — mirroring the vault's
own `concept.py`, which emits Mermaid natively.

Chambers still sealed (future phases): Schrute Library · Graveyard ·
Hardware · Misc Wing · Collaboration.

---

## Structure

```
aperture-field-manual/
  index.html          # Page 0: Facility Directory
  style.css           # Shared industrial CSS (forked from burn-lights)
  script.js           # Shared JS: Perlin noise, accordions, page-detect
  pages/
    governor.html     # Page 1
    philosophy.html   # Page 11
    ...               # (added per phase)
  README.md
```

## Tech

Plain HTML/CSS/JS. No framework, no build step, no bundler. One `style.css`, one
`script.js` shared across every page; page-specific behaviour is gated by element IDs
so nothing runs where it doesn't belong.

Fonts load from Google Fonts (`Share Tech Mono`, `Barlow`, `Barlow Condensed`) — the
only external dependency. Works on GitHub Pages; degrades to system monospace/sans
offline.

**Paths:** `index.html` at root uses `./style.css`; files in `pages/` use `../style.css`.
Get this wrong and GitHub Pages 404s the stylesheet silently.

## Run locally

Open `index.html` in a browser. That's it. For clean relative paths you can also serve
the folder:

```
python -m http.server 8000
# then open http://localhost:8000
```

## Deploy (GitHub Pages)

1. Create the `aperture-field-manual` repo on GitHub.
2. Push these files to `main`.
3. Settings → Pages → Source: `main` / root.
4. Site publishes at `https://<user>.github.io/aperture-field-manual/`.

---

*"We do what we must, because we can." — with apologies to Aperture Science.*
