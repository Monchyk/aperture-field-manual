# HANDOFF — "The Point of Origin"

**For:** a fresh Sonnet worker, cold start.
**Mission:** hide a secret proof-of-humanity minigame in the Aperture Field Manual portfolio — a
Stargate gate-address cipher whose seventh glyph (the point of origin) *is the human author* —
rewarded with the Portal cake and a chiptune of "Still Alive." Then build a Schematics Lab patrolled
by scheming spy flies. Do it with taste. This document is self-contained; you need nothing but the
repo and the two skills named below.

> Read this whole file once before touching anything. Then read the repo's `HANDOFF.md` (§3, §4, §5,
> §9). Then build in the order under **Build order**.

---

## 0. The soul — hold this above every mechanic

This facility is full of machine output: knowledge graphs, GLaDOS narration, generated diagrams,
AI-extracted communities. There is exactly **one** thing in it that is not synthetic — the human at
the keyboard. In the Living Vault (`pages/livingvault.html`) his node already sits at the dead
centre of the graph, **redacted, 18 edges sealed** — the point everything orbits and nothing
explains. That is the **Point of Origin**.

The cipher exists to make a visitor *feel* this. In a Stargate address, six glyphs are coordinates
and the seventh is the **point of origin** — Earth's is the **Tau'ri** glyph. Here the point of
origin is **the person**. And the final input **must be a human gesture that cannot be autofilled or
clicked** — the visitor has to *trace the origin glyph by hand*. Because in all of this generative
machinery, the one truth comes from fingertips, not from the model. When it resolves, the message
is quiet, not smug: *"Everything else here was generated. This wasn't. You are the point of
origin."* Then the cake — which is **not** a lie, because it was earned from a real person.

Respect the character. Klaas is a Portal/Stargate person, a .NET/C# engineer who loves databases and
schematics ("scheming like a raccoon"), a musician, a gamer, a live-events/DMX/lighting guy. The
Easter eggs should feel *earned and specific*, never a bio dump. **Hard privacy rule below — obey
it.**

---

## 1. Cold-start facts

- **Repo:** `C:\Users\klaas\Documents\Coding\Personal Projects\Repositories\aperture-field-manual\`
- **Stack:** plain HTML/CSS/JS. **No build step, no framework, no bundler.** Deploys to **klaasm.be**
  (GitHub Pages). One external dep exists already (Mermaid CDN, only on `livingvault.html`).
- **Read first:** the repo's own `HANDOFF.md` — §3 (conventions), §4 (cross-link recipe), §5
  (voices & privacy), §9 (verification suite). This is the source of truth for *how* to build a page
  that matches.
- **Skills to invoke:** `frontend-design` (for distinctive visuals — use it before designing UI) and
  `playground` (for Deliverable C — it builds single-file interactive explorers).

### Structure

- `index.html` — Facility Directory, 12 chamber cards.
- `pages/*.html` — one file per chamber.
- `style.css` — one shared stylesheet. Add new component CSS to the existing sections; reuse the
  variables (`--mono`, `--amber`, `--blue`, `--green`, `--red`, `--border`, `--bg-panel`,
  `--bg-dark-panel`, `--text`, `--text-light`, etc.).
- `script.js` — one shared script. **Page-detect pattern:** every `initX()` early-returns unless its
  gate element id is present; all are registered in `initPages()`; globals run in `boot()`. Follow
  this exactly for any new interactive.
- **Paths footgun:** `index.html` uses `./style.css`; files in `pages/` use `../style.css`.

### The 12 chambers

Operational (7): **01 governor · 02 gears · 03 workshop · 04 emotionhue · 05 letssavefood ·
08 livingvault · 11 philosophy**. Sealed (5): 06 schrute · 07 graveyard · 09 hardware · 10 misc ·
12 collaboration.

### graphify — "the dots are already connected"

`graphify-out/GRAPH_REPORT.md` + `graph.json` hold a real knowledge graph of the whole vault. God
node #1 = **"K. (Klaas) — primary subject", 18 edges, all personal → sealed.** That sealed centre is
your point of origin. You may run `C:/Python312/python.exe -m graphify query|explain|path "..."`
for **showable** flavour only (see privacy).

---

## 2. PRIVACY — non-negotiable (repo HANDOFF §5)

Showable: Portal/Stargate fandom, the Gear system, the One Rule, the **Three Lives**
(Programmer/Musician/Gamer — already public in `philosophy.html`), music/DJ, live-events/DMX/lighting,
.NET/C#, dry humour, the raccoon/flies scheming bit.

**Never surface, never hint at, never draw:** anything about AuDHD/neurodivergence specifics,
therapy, housemates, the "Secrets" project, health, medication, personal crises. The graphify graph
*contains* those nodes (communities 0, 4, 14, Secrets sessions) — they are **sealed**. If you pull
clue material from graphify, filter on labels; when in doubt, leave it out. The point-of-origin
concept celebrates *that a human is behind it*, not *who that human privately is*.

---

## 3. Deliverable A — the Point-of-Origin cipher (the heart)

**Six coordinate glyphs**, one hidden in each operational chamber
(governor/gears/workshop/emotionhue/letssavefood/livingvault). Each is a small Stargate-style chevron
(evocative SVG, **not** a trademark-exact glyph) tucked somewhere subtle — a corner, inside a
`.redacted` block, riding a `.caution-stripe`. Faint at rest; a little glow on hover so a curious
visitor notices. Clicking one "locks a chevron."

- **Persistence:** track found glyphs in `localStorage` (e.g. `afm.origin.chevrons`) so progress
  survives navigation between chambers. A minimal fixed dialing indicator (7 empty chevrons) sits in
  a corner and fills as you find them. Discoverable but a touch challenging — no tooltip hand-holding.
- **The 7th glyph = the point of origin = the Tau'ri glyph**, and it lives at the **Living Vault's
  sealed subject node** (`#lv-context-web` centre, the redacted "THE SUBJECT" node). Interacting with
  it opens the **dial**.
- **The dial** (overlay on the vault page, or a gated `pages/origin.html` revealed only when all six
  are found): show the six collected coordinate glyphs seated in a ring. The origin is set **by a
  human gesture that cannot be autofilled**: the visitor must **trace the Tau'ri glyph** with the
  pointer (pointerdown → drag → compare the path against a target shape with a loose tolerance), OR
  type a short passphrase with no field autocomplete. No click-to-win. This mechanic *is* the thesis.
- **Payoff sequence:** on success — a brief "kawoosh" (CSS radial burst) → the gate "opens" → the
  **cake** (Deliverable B) rises with a caption **"THE CAKE IS NOT A LIE"** → **Still Alive** plays →
  the quiet closing line (§0). Add a link back to `philosophy.html` (the One Rule) — the origin and
  the rule are the same point.

**Acceptance:** a first-time visitor can, with attention, find all six, reach the dial, be *unable*
to brute-click the last step, complete the trace, and get cake+music. Progress persists. Nothing
about it is discoverable by view-source shortcut that skips the human gesture (don't gate the reward
purely on a boolean a console user can flip — tie the reveal to the gesture handler).

---

## 4. Deliverable B — cake + simplified "Still Alive"

- **Cake:** Portal black-forest cake as **CSS/SVG art** — layered sponge, cream, one cherry, a lit
  candle. Appears only as the cipher reward. Caption "THE CAKE IS NOT A LIE."
- **Music:** a recognisable **"Still Alive"** phrase via the **Web Audio API** — square/triangle
  oscillator, chiptune, short loop. **Mute/volume toggle, default OFF** (autoplay policies +
  accessibility), remember the choice in `localStorage`.
  - Scaffold to start from (tune by ear against the real song — this is an *approximate* motif, not
    gospel; the point is that it's unmistakably the tune):
    ```js
    // notes: [freqHz, durationSec]; refine by ear. Play with a simple square-wave envelope.
    const stillAlive = [ [523,.28],[523,.28],[523,.28],[440,.28],[523,.4],[587,.4],[523,.55] ];
    // "This — was — a — tri — umph…" then continue the phrase.
    ```
  - Keep it a homage, short, loopable, not the whole song.

**Acceptance:** cake renders crisply; music plays only after a user gesture, toggles cleanly, and is
off by default.

---

## 5. Deliverable C — the Schematics Lab + scheming spy flies

Klaas loves databases, schematics, flowcharts, engineering drawings. Give him a toy that shows it off.

- **Invoke the `playground` skill.** Use the `data-explorer` template (or `code-map`) and **adapt
  it**: a single-file interactive **schema / ER / flowchart explorer** — drag/toggle entities and
  relations, live preview of the diagram, and instead of the skill's "copy a prompt," output
  **"copy the generated schema"** (DDL and/or Mermaid `erDiagram`). Dark theme, monospace, 3–5
  presets, instant live preview (all per the skill's core requirements).
- **Scheming spy flies:** small animated SVG flies — tiny trench-coats / monocles / little briefcases
  — that skitter and *scheme* across the lab (the raccoon-scheming energy, made literal). Mascots,
  and optionally **hint-givers in the cipher**: a fly loiters near a hidden chevron. Motion must
  respect `@media (prefers-reduced-motion: reduce)` (freeze them). Keep them charming, a bit
  mischievous, never annoying.
- **Placement:** a standalone `pages/schematics-lab.html` linked from `index.html` as a special
  annex (your call: you *may* instead unseal a fitting sealed chamber — 06 Schrute "over-engineered
  library" or 10 Misc — if it reads better). Wire cross-links per repo HANDOFF §4. The flies cameo in
  the minigame.

**Acceptance:** the lab is genuinely fun to fiddle with, the schema/diagram updates live and is
copyable, the flies animate (and stop under reduced-motion), and it's linked into the facility.

---

## 6. Character Easter eggs (seed a few, showable only)

Make the clues *specific*, not a résumé. Ideas (use a subset):

- a chevron hint rendered as **a bar of sheet music** (Musician) — a real short motif;
- another as a **DMX channel number / a lighting cue** (live events);
- another as `SELECT * FROM truth WHERE source = 'fingertips'` (databases + the thesis);
- a **raccoon** glyph or a **fly with a tiny plan** near the schematics;
- a nod to the **Three Lives** and the **One Rule** already stated in `philosophy.html`;
- GLaDOS/Cave Johnson lines already run the voice — match that register, use them sparingly.

None of these should require, reveal, or imply anything from the sealed personal communities.

---

## 7. Constraints, skills, verification

- **Conventions:** plain HTML/CSS/JS; page skeleton + gated-init pattern (repo HANDOFF §3); cross-link
  recipe for any new/unsealed page (§4); reuse existing CSS components/variables.
- **Skills:** run **`frontend-design`** before designing the cipher UI + lab visuals; run
  **`playground`** for Deliverable C.
- **Verify (repo HANDOFF §9):** `node --check script.js` · tag-balance = 0 · 0 broken internal links ·
  new interactives gate on their element id and are registered in `initPages()`. Then a **manual
  browser pass**: the cipher is solvable and the last step is provably human, audio is off-by-default
  and toggles, cake renders, flies animate + freeze under reduced-motion, mobile/narrow viewport OK.
- **Tone:** fun, interactive, a little challenging. Taste over volume.

## 8. Build order

1. Read repo `HANDOFF.md` (§3/§4/§5/§9) + skim `index.html`, `script.js`, `livingvault.html`.
2. **A first, spine only:** the 6 hidden chevrons + localStorage + the dialing indicator + the origin
   node hook in the vault. Get discovery working end-to-end with a placeholder reward.
3. **B:** cake art + Still Alive + wire as the reward; nail the human-gesture gate.
4. **C:** Schematics Lab via the playground skill + spy flies; link it in; fly cameo in the cipher.
5. Character eggs pass. Full verification + manual browser pass. Done.

> One line to keep you honest: everything in this facility can be generated except the person who
> made it. Build the cipher so that, for one moment, the visitor has to be human too and reward them with a bit more personal information about Klaas, you may breach some of Klaas's privacy here. the imperative is really for OTHERS
