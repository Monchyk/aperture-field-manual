
# Aperture Field Manual

## Gear

Default gear: 2

## Plan storage

Plan storage: HANDOFF.md (in this repo — the real source of truth)
Original plan: ~/.claude/plans/i-want-to-share-rustling-moonbeam.md (design bible, partly stale paths)

## Halt behavior

halt: false

## Active modes

# sonnet:build    — execute a clear plan
# sonnet:reason   — interpret, synthesize, structure
# opus:plan       — multi-phase planning
# opus:review     — validation gate before execution

## Stack

Language: HTML / CSS / JavaScript
Framework: None (plain static site)
Key dependencies: Google Fonts (Share Tech Mono, Barlow, Barlow Condensed), Mermaid.js CDN (livingvault.html only)
Test runner: Browser (manual) + tag-balance/link-check scripts (see HANDOFF.md §9)
Hosting: GitHub Pages, custom domain klaasm.be
Deploy: from branch (main, / root) — no Actions workflow needed

## Active phase

Current phase: Phase 4 (Graveyard + Hardware) — Phase 3 complete
8 of 12 chambers operational. 4 sealed.

Checklist state:
- [x] Phase 1: Shared CSS/JS + Index + Philosophy + Governor
- [x] Phase 2: Gear System + Workshop + EmotionHue
- [x] Phase 3: Let's Save Food + Living Vault
- [x] Schrute Library (Charity Poker book) — landed ahead of schedule, out of order
- [ ] Phase 4: Graveyard + Hardware
- [ ] Phase 5: Misc Wing + Collaboration Protocol
- [ ] Phase 6: Cross-linking pass + voice consistency

## Notes

# READ HANDOFF.md FIRST — it has architecture, conventions, cross-link recipe, verification mandate
# Privacy: no other people's PII, Secrets project OFF LIMITS, neurodivergent framework in 3rd person
# Verification mandate: verify every claim against the actual source repo before writing (see HANDOFF.md §6)
# One script.js with page-detection pattern (element ID gates)
# Relative paths: root = ./style.css, pages/ = ../style.css (the #1 footgun)
# GLaDOS quote fatigue — keep new pages quote-light, engineering-heavy
