# Aperture Field Manual — Build Handoff

**Purpose:** everything a fresh session needs to continue this zine without re-deriving
context. Read this first. It is the door-open artifact. Last updated after building the
foundation + 5 chambers + 4 interactives + an honest-audit correction pass.

---

## 1. What this is

A Portal/Aperture-Science-flavoured interactive web zine — an in-universe "field manual"
documenting Klaas's project landscape, AI-orchestration system, and the neurodivergent
operating system around it. Narrated by **GLaDOS** (the governor/roaster) and **Cave
Johnson** (the motivator). Second in a series; the first is the **burn-lights** zine
(`https://monchyk.github.io/burn-lights/`), whose CSS/JS this project forked.

**Audience:** tech-savvy friends (a dev brother, dev circles) who appreciate .NET/C#
architecture, EF Core, DB design, and the meta-layer. Navigable so people skip to interests.

**Original plan:** `C:\Users\klaas\.claude\plans\i-want-to-share-rustling-moonbeam.md`
(12-page spec + per-page MVP/stretch table + curated GLaDOS/Cave lines). Still the design
bible for unbuilt chambers — but **its source-file paths are partly stale** (see §7).

**Repo:** `C:\Users\klaas\Documents\Coding\Personal Projects\Repositories\aperture-field-manual\`
Not on GitHub yet. `gh` is sandboxed here — Klaas creates the repo manually, then push +
enable Pages (root). Deploys to `https://<user>.github.io/aperture-field-manual/`.

---

## 2. Current state

**Built & live (6 of 12 chambers):**

| # | File | Chamber | Interactive |
|---|------|---------|-------------|
| 00 | `index.html` | Facility Directory (card grid) | — |
| 01 | `pages/governor.html` | The Governor | ✅ battery pre-flight form |
| 02 | `pages/gears.html` | The Gear System | ✅ gear-verbosity switcher |
| 03 | `pages/workshop.html` | The Workshop | (accordions) |
| 04 | `pages/emotionhue.html` | EmotionHue | ✅ light-room console |
| 05 | `pages/letssavefood.html` | Let's Save Food | ✅ audit-trail generator (`#lsf-audit-demo`) |
| 11 | `pages/philosophy.html` | The Prime Directive | ✅ radial convergence map |
| — | `style.css`, `script.js` | shared infra | — |
| — | `README.md`, `HANDOFF.md` | docs | — |

**Sealed (locked cards on index, not built):** 06 Schrute Library · 07 Graveyard ·
08 Living Vault · 09 Hardware · 10 Misc Wing · 12 Collaboration.

**Linear read order:** index(00) → governor(01) → gears(02) → workshop(03) →
emotionhue(04) → letssavefood(05) → **[06 Schrute next — sealed]** → … → philosophy(11) →
collab(12). LSF's nav-next jumps to philosophy(11) since 06 is sealed. Philosophy is the
convergence endpoint every page links back toward.

---

## 3. Architecture & conventions (how to build a page that matches)

### Page skeleton (every page in `pages/`)
```html
<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NAME — Aperture Field Manual</title>
  <link rel="stylesheet" href="../style.css">
</head><body>
<nav class="nav-bar">
  <a href="../index.html" class="nav-home">◄ FACILITY DIRECTORY</a>
  <span class="nav-title">CHAMBER NN — NAME</span>
  <a href="NEXT.html" class="nav-next">NEXT ►</a>
</nav>
<div class="page" data-page-num="AFM-0NN"> … </div>
<nav class="page-footer-nav">
  <a href="PREV.html">◄ PREV</a>
  <a href="../index.html" class="dir">FACILITY DIRECTORY</a>
  <a href="NEXT.html">NEXT ►</a>
</nav>
<script src="../script.js"></script>
</body></html>
```
**Paths are the #1 footgun:** `index.html` (root) uses `./style.css` / `./script.js`;
files in `pages/` use `../`. Get it wrong → Pages 404s silently.

### Shared CSS component library (`style.css`) — reuse these, don't reinvent
- **Layout:** `.page[data-page-num]`, `.nav-bar`, `.page-footer-nav`
- **Panels:** `.panel`, `.panel-dark`, `.panel-title`, `.warning-box`(`.danger`/`.info`), `.caution-stripe`
- **Content blocks:** `.classification`(`.ok`/`.info`), `.doc-id`, `.stat-row`/`.stat-box`/`.stat-value`/`.stat-label`, `.parts-list`(`.qty`/`.note`), `.steps`/`.step`/`.step-num`, `.compare`(`.bad`/`.good`/`.compare-vs`/`.compare-title`), `.grid-2`/`.grid-3`, `.badge`, `.topology`(`.node`/`.brain`/`.output`), `.socket-row`/`.socket`(`.active`/`.planned`), `.fake-form`, `.annotation`/`.margin-note`/`.revision-stamp`/`.redacted`, `.pictogram`
- **Zine-specific (added here):** `.card-grid`/`.section-card`(`.locked`) + card-head/num/status(`.operational`/`.construction`/`.sealed`)/title/desc/cat, `.cat-legend`/`.cat-chip`, `.accordion`/`.accordion-trigger`/`.accordion-title`/`.accordion-icon`/`.accordion-content[hidden]`, `.glados-quote`, `.cave-quote`, `.quote-attribution`, `.cascade`/`.cascade-stage`(`.intervention`)/stage-num/name/desc/tag + `.cascade-arrow`, `.battery-row`/`.battery`/`.cell`(`.filled`/`.low`), `.sealed-ref`, `.prime-rule`/rule-text/rule-sub
- **Interactive CSS:** `.bp-*` (battery), `.gear-demo`/`.gear-btn`/`.gear-level`, `.radial-node`/`.rn-line`/`.rn-dot`/`.rn-text`(+`.sealed`), `#hue-canvas`/`.hue-btn`/`.hue-group`/`#hue-energy`

### `script.js` = one file, page-detect pattern
Structure: Perlin/fBm (shared) → `initNoiseCanvas` (dead code now — gates `#noise-canvas`,
which no page has) → **global** `initAccordions`/`initRedacted`/`initLocked` (run everywhere)
→ **page-specific** init functions, each early-returns if its gate element is absent →
`boot()` calls the globals + `initPages()`, and `initPages()` calls every page-specific fn.

**To add an interactive to a new page:**
1. Put a gate element with a unique `id` in the HTML (e.g. `id="lsf-entity-explorer"`).
2. Write `initLsfExplorer()` that does `const el = document.getElementById('lsf-entity-explorer'); if (!el) return;` then wires up.
3. Add `initLsfExplorer();` to `initPages()`.
4. Add its CSS to the "INTERACTIVE COMPONENTS" block in `style.css`.

Existing gates: `#governor-battery-form`, `#gear-switcher`, `#philosophy-radial`, `#hue-canvas`.

### Accordion markup (the primary "deeper detail" pattern)
```html
<div class="accordion">
  <button class="accordion-trigger" aria-expanded="false">
    <span class="accordion-title">TITLE</span><span class="accordion-icon">▸</span>
  </button>
  <div class="accordion-content" hidden> … </div>
</div>
```
JS is global — just use this structure and it works.

---

## 4. Cross-link recipe — DO THIS every time you unseal a chamber

Forgetting a step here is the easiest way to break the zine. When building chamber NN:
1. Create `pages/<name>.html` (skeleton above).
2. `index.html`: flip its card from `<div class="section-card locked">…construction…</div>`
   to `<a class="section-card" href="pages/<name>.html">…operational…</a>`.
3. `index.html`: bump the facility-log counts ("N operational / M sealed").
4. `philosophy.html`: in the radial SVG, find the node `<g class="radial-node sealed">` for
   NN, remove `sealed`, add `data-href="<name>.html"` (keeps it clickable + keyboard-nav).
   Also add/light its socket in the "Trace the convergence" `.socket-row`.
5. **Previous chamber's `nav-next` + footer-next**: point them at the new page (the linear
   chain must not skip). E.g. when LSF(05) lands, update `emotionhue.html` next → LSF.
6. New page's own nav: next → the next built page (or philosophy if the following is sealed).
7. `README.md` + this `HANDOFF.md` §2 table.
8. Run the verification suite (§9).

---

## 5. Voices & privacy (non-negotiable)

- **GLaDOS** (`.glados-quote`): clinical, cold, roasts unfinished/overengineered work and
  the human. **Use sparingly now** — see audit §6. Retire "I want you to sit with that" (overused).
- **Cave Johnson** (`.cave-quote`): all-caps grit, shipping, motivation.
- **Dwight Schrute**: NOT a narrator — a *showcase item* (the Hue project's real teaching
  persona). Quote it verbatim from `Hue program/CLAUDE.md` only.
- **Privacy:** no other people's PII; the "Secrets" project is off-limits as *content*
  (its patterns/techniques are showable, anonymized). The neurodivergence framing is written
  third-person, factual, anonymized ("the subject"). Never name housemates/meetings/chats.

---

## 6. THE VERIFICATION MANDATE (learned the hard way)

**Do not copy facts from the burn-lights zine or the plan into a page. Verify every claim
against the actual source repo first.** The EmotionHue page was ~40% fiction on first build:
it inherited "8 person profiles / 5-axis VAD+Plutchik / room blending / QR identity / Safe
Harbor named blends" and "14 weather presets / Sunny Breaks" from burn-lights — **none of
which exist in the Hue repo.** The real system is a 2-axis valence/arousal `CheckIn.Suggest`
+ `MoodCatalog` + `AutoMoodScheduler`, with real scenes (Moving Clouds, Rainy Day, Sunset
Drift, Calm Tide, Fireplace, Glow). It was corrected only after reading `Hue program/ARCHITECTURE.md`.

Rule: **read the repo's `CLAUDE.md` + `ARCHITECTURE.md` + entity files, count things, then
write.** A tech brother will diff your claims against the code.

---

## 7. Open honest audit (carry-forward critique — don't repeat these)

- **HIGH — portfolio is inverted for the audience.** 4 of 5 live chambers are the
  self-management *apparatus*; only EmotionHue is real software. Building LSF next is the
  correction — it's the actual engineering showcase this audience wants.
- **HIGH — tone is very confessional.** Anonymized, but relentless self-deprecation across
  pages. A conscious choice, currently set to "maximally confessional." LSF is naturally
  less confessional (it's a food-bank product) — good rebalance.
- **MEDIUM — GLaDOS fatigue.** ~11 GLaDOS + ~6 Cave quotes, same rhythm every page. The plan
  said humor should "emerge from diagrams, not punchlines." Cut ~30%. **Keep LSF quote-light,
  engineering-heavy.**
- **MEDIUM — convergence-footer liturgy.** "The governor enforces / gears route / …" repeats
  ~4× nearly verbatim. Vary or cut.
- **MEDIUM — under-delivered on diagram density.** burn-lights had bespoke SVGs per page; this
  leans on prose/accordions/tables. **LSF is the page to fix this** — it should be the most
  diagram-dense chamber (ER diagram + audit-flow diagram, hand-drawn-style SVG).
- **LOW —** gear-switcher "cumulative reveal" reads as 4 stacked takes, not one answer
  deepening; "35 layers" is really ~32 counted; `initNoiseCanvas` is dead code (~70 lines);
  mobile unverified on a real narrow viewport; battery cells lack grouped a11y labels.

---

## 8. NEXT TASK — Chamber 05: Let's Save Food

The engineering showcase. Belgian food-bank inventory, real FAVV regulatory compliance.
**This is the audience's page — make it product-heavy and diagram-dense, quote-light.**

### VERIFIED source paths (plan's vault paths were WRONG — use these)
- `C:\Users\klaas\Documents\Coding\Personal Projects\Repositories\LetsSaveFood\CLAUDE.md`
- `…\LetsSaveFood\Docs\lsf-database-design.md`  ← likely the Mermaid class diagrams
- `…\LetsSaveFood\Docs\01-entity-design.md`
- `…\LetsSaveFood\Docs\02-dbcontext-config.md`
- `…\LetsSaveFood\Docs\03-services-layer.md`
- `…\LetsSaveFood\Docs\05-favv-compliance.md` (and other `Docs\0*-*.md`)
- Entity source: `…\LetsSaveFood\LetsSaveFood\` (Razor Pages project; read the actual `.cs` entities + `DbContext`)
- ⚠️ The plan's `claude-vault/projects/LetsSaveFood/OVERVIEW.md` and `/docs/` **do not exist.**

### Confirmed from build output (net10.0 bin): .NET 10, Npgsql + EF Core (PostgreSQL). Good.

### Claims to VERIFY against the repo before writing them (don't trust the plan's numbers):
- Entity chain "Product ← InventoryItem → Volunteer → AuditLog" (check real names/relations)
- `SaveChanges` override auto-stamps CreatedAt/UpdatedAt + auto-emits `AuditLog` rows
- Soft-delete-only + immutable audit trail (FAVV) — confirm in `05-favv-compliance.md` + code
- **"154,200 Open Food Facts products imported"** — verify the real number
- Result / `Result<T>` pattern, immutable command records, cookie-auth volunteer picker,
  barcode scanner (html5-qrcode), Dagoverzicht daily report
- Exact stack strings (C# 13 / .NET 10 / ASP.NET Core Razor Pages / EF Core 10 / PostgreSQL)

### Build spec (from plan Page 5)
- **MVP:** entity-relationship diagram (bespoke SVG), audit-trail flow diagram, stat callouts.
- **Stretch interactive:** clickable entity explorer (expand an entity → fields/relations/
  constraints) and/or an audit-trail demo ("receive item" → show the auto-generated AuditLog
  row). Gate id e.g. `#lsf-entity-explorer`; follow §3 interactive recipe.
- **Voice:** one Cave line max ("We're not building a startup. We're feeding people."). Let
  the architecture carry it. This is where you prove you ship real regulated software.
- **Cross-link:** follow §4. Update `emotionhue.html` next → LSF; LSF next → philosophy
  (06 Schrute is sealed).

---

## 9. Verification suite (run before calling any page done)
From the repo root:
```bash
node --check script.js                      # JS syntax
```
```bash
# tag balance + broken internal links + interactive gate/control cross-check + stale-term scan
C:/Python312/python.exe -c "import re,glob,os; files=glob.glob('*.html')+glob.glob('pages/*.html'); [print('TAG',f,t,o,c) for f in files for t in ['div','nav','blockquote','button','svg','a','ul','table','tr','g'] for o,c in [(len(re.findall('<'+t+r'[\s>]',open(f,encoding='utf-8').read())),len(re.findall('</'+t+'>',open(f,encoding='utf-8').read())))] if o!=c]"
```
The working checks used this session (tag balance = 0, broken links = 0, JS OK, HTML control
values ⊆ JS keys, stale-term scan clean) are the bar. Also **open the page in a browser** —
headless checks can't confirm accordions expand, canvases animate, or mobile layout.

---

## 10. Quick status line for the next session
> 6/12 chambers live, all cross-linked, all interactives verified (JS OK · 0 tag mismatches ·
> 0 broken links · `data-op` ⊆ JS actions · LSF CSS present). **Chamber 05 Let's Save Food is
> DONE** — bespoke ER + audit-flow SVGs, FAVV compliance table, OFF streaming-import diagram,
> and a live audit-trail generator (`#lsf-audit-demo`) that mirrors `InventoryService` +
> the `SaveChanges` audit override. Every claim verified against the LSF repo (entities,
> `LsfDbContext`, configs, `Program.cs`, the FAVV + OFF docs) — corrected the plan's fictional
> "154,200" to the real ~4.55M-streamed → ~50–200K-kept, and the auth story to a real
> cookie/volunteer-picker. **Next candidate:** Chamber 06 Schrute Library, 07 Graveyard, or
> 08 Living Vault — all sealed, all have source material in the vault. Repo still needs manual
> GitHub creation before deploy.

### LSF build note (for future reference)
Verified source of truth used: `LetsSaveFood/LetsSaveFood/Models/{Product,InventoryItem,Volunteer,AuditLog,Enums}.cs`,
`Data/LsfDbContext.cs` (the `SaveChanges` → `SetTimestamps` + `WriteAuditLogs` override, `SuppressAuditLog`),
`Data/Configurations/*.cs` (named `"SoftDelete"` query filter, unique Barcode index, `ComplexProperty().ToJson()`,
`UseIdentityAlwaysColumn()`), `Services/InventoryService.cs` (`Result<T>`, soft-delete-on-empty),
`Program.cs` (cookie auth + `AuthorizeFolder("/")` + `--import-off`), `Pages/Account/Login.cshtml.cs`
(passwordless volunteer picker), and `Docs/{05-favv-compliance,07-off-bulk-import,lsf-database-design}.md`
(the CRUD-vs-event-sourced decision). Key correction: `AuditLog` is polymorphic `(TableName, RecordId)` —
NOT FK'd to InventoryItem — and its Id is `long`/bigserial, not Guid.
