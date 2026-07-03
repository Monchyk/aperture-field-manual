
# Aperture Field Manual

## Gear

Default gear: 2

## Plan storage

Plan storage: ~/.claude/plans/i-want-to-share-rustling-moonbeam.md

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
Key dependencies: Google Fonts (Share Tech Mono, Barlow, Barlow Condensed) — only external dep
Test runner: Browser (manual, open index.html)
Hosting: GitHub Pages (deploy from branch, main / root)

## Active phase

Current phase: Phase 3 (EmotionHue, Let's Save Food, Schrute Library)
Phases 1-2 complete. 5 of 13 chambers operational.

Checklist state:
- [x] Phase 1: Shared CSS/JS + Index + Philosophy + Governor
- [x] Phase 2: Gear System + Workshop + EmotionHue
- [ ] Phase 3: Let's Save Food + Schrute Library
- [ ] Phase 4: Graveyard + Living Vault + Hardware
- [ ] Phase 5: Misc Wing + Collaboration Protocol
- [ ] Phase 6: Cross-linking pass + voice consistency

## Notes

# Portal / Aperture Science aesthetic — GLaDOS narrates, Cave Johnson motivates
# No build step, no framework, no bundler — plain HTML/CSS/JS
# One style.css, one script.js shared across all pages
# Page-specific JS is gated by element IDs (page-detection pattern)
# Relative paths: root uses ./style.css, pages/ uses ../style.css
# Privacy: no other people's identifiable info, Secrets project OFF LIMITS as content
# Neurodivergent framework written in third person ("a person"), anonymized
# Companion zine: burn-lights (https://monchyk.github.io/burn-lights/)
# CSS forked from burn-lights, evolved with new components (accordion, nav, card-grid, quotes)
# Interactive elements: battery preflight, gear switcher, radial map, Hue console — all vanilla JS

## Architecture

# 13 pages total (index + 12 chambers)
# Structure: index.html at root, all others in pages/
# Shared HTML skeleton per page: nav-bar top, page content, page-footer-nav bottom
# Components: .panel, .warning-box, .stat-row, .accordion, .glados-quote, .cave-quote, .card-grid
# Perlin noise (fBm) engine in script.js — used by EmotionHue canvas
# Accordion: aria-expanded toggle + hidden attribute, CSS rotation on icon
# No sidebar — focused read-through pages, not a docs site
# Wikipedia-philosophy convergence: every page links to philosophy.html within 2-3 clicks

## Content sources

# Governor: ~/.claude/skills/governor/SKILL.md
# Orchestration: ~/.claude/skills/orchestration/SKILL.md
# Gear table: ~/.claude/CLAUDE.md
# Journey to Gears: docs/journey-to-gears.md (in Obsidian Claude Organisation repo)
# Stress test: docs/stress-test-results.md
# Manifesto: MANIFESTO.md
# Prime Directive: claude-vault/PRIME-DIRECTIVE.md
# AI lineage: claude-vault/AI-ASSISTANT-CLUSTER.md
# LSF: claude-vault/projects/LetsSaveFood/OVERVIEW.md
# Living Vault: docs/living-vault.md
# Graph Report: graphify-out/GRAPH_REPORT.md

## GitHub Pages

# Source: Deploy from branch (main, / root)
# No workflow file needed — static site, no build step
# URL: https://monchyk.github.io/aperture-field-manual/
