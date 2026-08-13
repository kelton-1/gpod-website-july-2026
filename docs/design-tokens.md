# Design Tokens & Component Rules

**Extracted 2026-08-11 from a full audit of all 13 custom sections,
`assets/gpod.css` (1,286 lines), `assets/gpod.js`, and the relevant slices of
Modular's `assets/theme.css` (17,861 lines).**

This is the foundation every new section and every template variant is built
from. Under the architecture in `docs/template-architecture.md`, variants
assembled from inconsistent spacing, type and buttons don't test layout — they
test which arm looks less broken. One token set is what makes results readable.

---

## What's already right — don't break it

Three findings that came back clean, and are load-bearing:

1. **Container alignment is correct across all 13 sections.** Every one uses
   `container-wrap section-padding` + an inner `.container`, the same classes the
   header uses. Left edges align with the logo and nav at every breakpoint:
   80px inset ≥1024px, 40px at 480–1023px, 20px ≤479px. No section reinvents the
   container. **New sections must use the same pattern.**
2. **Zero `font-family` declarations in `gpod.css`.** Typefaces inherit cleanly
   from Modular's `--HEADING-FONT-FAMILY` / `--BODY-FONT-FAMILY`. **Never declare
   a font-family in a custom section.**
3. **Zero dead CSS.** All 92 `.gpod-*` selectors are reachable. (Four looked
   orphaned to a literal grep but are applied dynamically — `.gpod-compare__picker`
   via `gpod.js:264`, and `.gpod-statement--{light,dark,accent}` via Liquid
   interpolation.) That's unusual for CSS built this fast. Keep it.

The fragmentation is entirely in **sizing and spacing**, not structure.

---

## The token set

Chosen from what is already dominant in the codebase, wired to Modular's real
CSS variables wherever one exists, and gap-filled only where nothing did.

```css
:root {
  /* ===== COLOR ===== */
  --gpod-accent:      var(--COLOR-TAG-SAVING, #8cc662);
  --gpod-accent-soft: color-mix(in srgb, var(--gpod-accent) 12%, transparent);
  --gpod-ink:         var(--COLOR-HEADING, #000);
  --gpod-text:        var(--COLOR-TEXT, #000);
  --gpod-border:      var(--COLOR-BORDER-ALPHA-8, rgba(0,0,0,.08));
  --gpod-soft:        var(--COLOR-BACKGROUND-ACCENT, #f5f6f4);
  --gpod-surface-dark:#101410;   /* the real dark brand tone, chosen independently 3× */
  --gpod-scrim:       #0b0e0a;   /* hero/video overlay only — deliberately distinct */
  --gpod-on-accent:   #14210d;   /* text sitting on --gpod-accent */
  --gpod-muted-text:      color-mix(in srgb, var(--gpod-text) 75%, transparent);
  --gpod-placeholder-text:color-mix(in srgb, var(--gpod-text) 55%, transparent);

  /* ===== SPACING (section PT/PB in px, before .section-padding's 80%/60% scaling) ===== */
  --space-xs: 20px;   /* thin bands, e.g. collection-toolbar */
  --space-sm: 40px;
  --space-md: 60px;   /* the de facto mode */
  --space-lg: 80px;   /* statement / rich-CTA bands */

  /* ===== TYPE ===== */
  --gpod-heading-size:    clamp(1.75rem, 1.55rem + 1vw, 2.25rem);  /* ~28–36px */
  --gpod-heading-lg-size: clamp(2rem, 1.5rem + 2.5vw, 3rem);       /* ~32–48px, hero only */
  --gpod-card-title-size: 1rem;
  --gpod-eyebrow-size:    0.75rem;
  --gpod-eyebrow-tracking:0.1em;
  --gpod-body-size:       1rem;
  --gpod-small-size:      0.875rem;  /* 14px floor — nothing goes below this on mobile */

  /* ===== RADII ===== */
  --gpod-radius-sm:   var(--RADIUS, 3px);  /* buttons/inputs — Modular's real token */
  --gpod-radius-md:   10px;                /* cards */
  --gpod-radius-pill: 999px;               /* pills + badges */

  /* ===== BREAKPOINTS — Modular's real cutovers; drop the novel 600/640/900 ===== */
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1320px;

  /* ===== CONTAINER (already correct — codify, don't change) ===== */
  --container-pad-desktop: 40px;  /* + 40px auto-margin = 80px effective inset */
  --container-pad-tablet:  40px;
  --container-pad-mobile:  20px;

  /* ===== INTERACTION ===== */
  --tap-target-min: 44px;
}
```

### What each token replaces

| Token | Replaces | Evidence |
|---|---|---|
| `--gpod-heading-size` | **6 different section-heading treatments** | Bare `.gpod-heading` (inherits Modular h2) · the same class on an `<h1>` in product-finder · and four bespoke `clamp()` calls with unrelated vw coefficients (4.2 / 4.5 / 3.6 / 6.5) |
| `--gpod-card-title-size` | **7 fixed card-title sizes** | 0.95, 1, 1.05, 1.1, 1.25rem + one falling through to Modular's 1.375rem |
| `--gpod-body-size` / `--gpod-small-size` | **9 secondary-text sizes** | 0.7 → 1rem, all serving the same meta/caption role |
| `--gpod-eyebrow-*` | **3 eyebrow implementations** | letter-spacing 0.14em / 0.08em / 0.1em, weight 600 / 700, plus a context override that doubles the size to 1rem |
| `--gpod-muted-text` | **4 opacity values** | 0.7 / 0.75 / 0.9 plus a hardcoded `rgba(0,0,0,.35)` |
| `--gpod-placeholder-text` | An accessibility failure | `rgba(0,0,0,.35)` computes to **≈2.4:1 on white — fails WCAG AA**, on every compare table's "Select a product" and "—" cells |
| `--space-*` | **8 deployed padding values** | {0, 10, 20, 30, 40, 50, 60, 84} with no shared scale |
| `--bp-*` | **3 novel breakpoints** | 600px (×5), 640px (×2), 900px (×1) with no Modular counterpart. A page mixing 600- and 640-switching grids has a 40px band where siblings disagree about column count. |
| `--gpod-radius-*` | **5 radius values** | 10px, 3px, 999px, 20px, 6px |
| `--gpod-border` / `--gpod-accent` | Orphaned literals | Both have real Modular tokens that already exist and go unused. `--gpod-ink`/`--gpod-text` fall back to `#111`/`#333` when the theme's actual configured values are `#000`/`#000` — no visual bug today, but a theme-settings change silently won't propagate. |

---

## The trap for template variants

**Deployed section padding does not match schema defaults.** Three PDP sections
ship 20px tighter than their own schema says:

| Section | Schema default | Actually deployed |
|---|---|---|
| `pdp-specs` | 50 / 50 | 50 / **30** |
| `pdp-compatibility` | 50 / 50 | **30 / 30** |
| `pdp-how-to` | 50 / 50 | **30 / 30** |
| `pdp-benefits` | 50 / 30 | 50 / **20** |
| `pdp-pairs-with` | 50 / 50 | **40** / 50 |

A new PDP variant built by adding sections from defaults will render **looser and
more disjointed than the current production page** — and we'd read that as
"the new layout lost" when what actually lost was the spacing.

**Rule: reconcile schema defaults to the `--space-*` scale before building the
first variant.** Then ship new section schemas with a `select` of the four scale
values instead of a freeform 0–100px range slider, so a variant can't drift.

---

## Component rules for new work

| Component | Current state | Rule going forward |
|---|---|---|
| **Buttons** | **Best-behaved area of the codebase** — 7 clean compositions of Modular's `.btn` classes, no new skin invented | Keep composing Modular's `.btn`. Two existing overrides break it and should go: hero's `max-width:340px` vs `.btn--large`'s real 260px cap, and the compare CTA's literal `padding:8px 18px` bypassing size tokens |
| **Text links** | 4 near-identical variants (underline-offset 3px vs 4px, weight 600 vs 700, one missing the accent underline) | Consolidate to one `.gpod-link` |
| **Card-as-link** | 4 variants, 3 different hover treatments | One `.gpod-card` with a single hover behaviour |
| **Eyebrow** | 3 implementations + 1 context override | One parametrized `.gpod-eyebrow` |
| **Accordion** | 1 implementation, native `<details>/<summary>` — correct, ARIA-free by construction | Formalize as a shared snippet before a second one gets built |
| **Grids** | 5 of 6 converge on 600/1024; support-hub is the outlier at 640 | Move all to `--bp-*` |

---

## Defects to fix in the control

These are bugs, not hypotheses (`docs/template-architecture.md` §"defects vs choices").

| # | Severity | Where | Symptom |
|---|---|---|---|
| 1 | **High** | `sections/home-hero.liquid:27` | **Home-hero is the only section of 13 missing the `gpod-section` class.** Since `assets/theme.css:83` globally applies `body:not(.is-focused) *:focus { outline: none }`, the scoped rule at `gpod.css:45-52` is the reliable keyboard-focus indicator — and it doesn't reach the hero. **"Shop All GPODs" and "Take the Quiz", the two highest-value CTAs on the site, have no dependable focus ring.** One-word fix. |
| 2 | **High** | `gpod.css:157-159` | `.gpod-compare__cta` overrides `.btn--small` with literal padding → ≈**32px** tall. The primary conversion button on every compare table (home, PDP, compare page). |
| 3 | **High** | `gpod.css:1022-1033` | Compare-picker `<select>` renders ≈**30px** tall — the core interaction of the model swap. |
| 4 | Medium | `gpod.css:718-729` | Collection-toolbar filter pills ≈**32px**, inside a horizontally scrolling row. Mis-tap risk while swiping, on every collection page. |
| 5 | Medium | `sections/product-finder.liquid:28` | The only section using `<h1 class="gpod-heading">` instead of `<h2>` — renders ~38px instead of ~29px, and risks a duplicate `<h1>` once it appears on a page with its own heading. That risk becomes real as soon as variants exist. |
| 6 | Medium | `templates/index.json` | The two `home-use-cases` instances on the home page ship different bottom padding (40 vs 60) — inconsistent gap under two visually identical bands. |
| 7 | Low-Med | `gpod.js:216-260` | Compare-picker's dynamic re-render has no `aria-live`, though the near-identical product-finder result swap correctly uses `aria-live="polite"`. Screen-reader users get no announcement when a column changes. |
| 8 | Low-Med | `gpod.css:161-163` | `.gpod-compare__empty` fails WCAG AA at ≈2.4:1. |
| 9 | Low | `gpod.css:686-696, 810-812` | Three duplicate/redundant declarations — no visual bug, but debt to clear before forking variants off this file. |

Items 1–4 are all **mobile tap-target or keyboard-access failures on primary
conversion elements**, on a site that is 85% mobile. They are the highest
value-per-minute fixes in this document.

**Site-wide gap:** `prefers-reduced-motion` appears **zero times** in either
`gpod.css` or `theme.css`, while Modular runs AOS scroll animations throughout
and the home hero autoplays video. Any new hero variant needs a reduced-motion
still fallback.

---

## Sequencing

1. Fix defects 1–4 (under an hour, all mechanical).
2. Reconcile schema defaults to the `--space-*` scale — **before** the first variant template exists.
3. Land the `:root` block and migrate `gpod.css` to it.
4. Build the shared components (`.gpod-link`, `.gpod-card`, `.gpod-eyebrow`) and the spacing `select` schema setting.
5. Only then build variant templates.

Steps 1–2 are the blocking ones. Steps 3–4 can run alongside Sprint 2 provided
every new section is authored against the tokens from the start.
