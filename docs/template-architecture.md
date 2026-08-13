# Template Architecture — building for A/B testing

**Adopted 2026-08-11.** This supersedes the "edit templates in place" approach
implied by the earlier sprint drafts. Every sprint in `docs/sprint-plan.md`
should be executed under these rules.

---

## The principle

> **Build parallel, never in place.**
> A change we want to learn from ships as a *new* template or a *new* section
> alongside the existing one — never as an edit that overwrites it.

The reason is not tidiness. It is that an overwritten template has no control
arm, so it can never be tested, only believed. Given this store converts mobile
at 1.52% against desktop's 3.45%, we are going to be wrong about some of our
fixes, and we need the ability to find out cheaply.

---

## How Intelligems actually splits traffic

Verified against Intelligems' own documentation, because the constraints shape
the architecture:

| Mechanism | What it splits | Key constraints |
|---|---|---|
| **Template Test** | Two or more template files | **All templates must live in the published theme.** The template *currently in use* must be the control group. A visitor is only enrolled if they land on a page that uses the control template by default. |
| **Theme Test** | Two or more whole themes | Every theme in the test needs the Intelligems JS installed, or redirected visitors see Shopify's preview bar and lose tracking. |
| **Split URL Test** | Two URLs | Redirects one direction only — visitors landing directly on the destination URL are never enrolled. |

Three consequences we have to design around:

1. **Variant templates ship to production dormant.** They sit in the live theme,
   unreferenced by any product, until Intelligems routes traffic to them. This is
   normal and safe — but it means variant templates must be *finished*, not
   scratch work, because they are one config change away from customer traffic.
2. **The home page cannot be template-tested.** Shopify does not allow switching
   the `index` template, and Intelligems' own docs say the winner must be manually
   recreated in the original. **This is the single most important constraint for
   us**, because `/` takes 51.8% of all sessions and is the paid-social landing
   page. Home-page layout tests must be run as **Theme Tests**, not template tests.
3. **Variant files are disposable.** Once a test ends, the losing template is
   deleted; Intelligems redirects stale cookies back to the control rather than
   erroring. So variants are cheap to create and cheap to retire.

### Which route for which page

| Page | Test mechanism | Why |
|---|---|---|
| Product | **Template Test** | `product.json` is control; variants are additional files |
| Collection | **Template Test** | same |
| Content pages (support, compare, quiz) | **Template Test** | same |
| **Home** | **Theme Test** | Shopify blocks index-template switching |
| Cart / checkout | out of scope | not where the leak is |

---

## Naming convention

Shopify's alternate-template syntax is `<type>.<suffix>.json`. We use the suffix
to name the **hypothesis**, not a version number — `product.v2.json` tells a
future reader nothing, and by the fourth test nobody knows what v2 was.

```
templates/product.json                  ← CONTROL. Never edited during a test.
templates/product.specs-first.json      ← variant: compat + specs promoted above benefits
templates/product.compact.json          ← variant: description collapsed, sections cut to 10
templates/collection.json               ← CONTROL
templates/collection.card-proof.json    ← variant: review stars + spec teaser on cards
```

Rules:

- **The default template is always the control.** `product.json` stays as-is for
  the duration of a test. If we want the variant to become the new baseline, we
  copy its contents into `product.json` *after* the test concludes, then delete
  the variant.
- **One hypothesis per variant file.** A variant that changes section order *and*
  typography *and* copy produces an unreadable result. If we want to test three
  things, that is three tests or a factorial design, not one file.
- **Suffixes are lowercase kebab-case**, matching existing repo convention.
- **Retire variants when the test ends.** Dead template files in a live theme are
  how the current `pf-4be18a76` and `pre-order` mess happened.

---

## Section rules

Templates are compositions; sections are the components. To keep variants cheap:

1. **New behaviour goes in a new section file, or behind a section setting.**
   Never change a shipped section's markup in a way that affects both arms — that
   silently mutates the control and invalidates the test in flight.
2. **Every merchant-visible choice is a schema setting.** If a variant differs
   only in heading text, image, or order, it should be composable in the theme
   editor with no code change. That is what makes a second, third and fourth test
   cost hours instead of days.
3. **Sections must self-hide when empty.** `pdp-ways-to-use.liquid` and
   `pdp-pairs-with.liquid` already do this correctly. `section-testimonials.liquid`
   does not — its schema defaults are non-blank, so an "empty" block renders
   *"John Doe"*. Every new section gets an explicit empty guard.
4. **No section may assume it is at a fixed position.** Variants reorder sections
   by definition, so a section that only looks right directly under the hero is a
   section that can't be tested.

---

## Why the design system is now a prerequisite, not a nicety

This is the part that is easy to skip and expensive to skip.

If arm A and arm B differ in **spacing, type scale, button styling and container
width** as well as in the thing we meant to test, then we are not testing layout
— we are testing which arm looks less broken. The result will be real, and it
will be uninterpretable.

Every template variant must therefore be assembled from **one shared token set**:
the same spacing scale, the same type scale, the same button hierarchy, the same
container width and breakpoints. Then the only difference between arms is the
variable under test, and the number that comes back means something.

The design-system audit (running now) exists to extract that token set from what
is already dominant in `assets/gpod.css`, rather than inventing a new one. Its
output — a ready-to-paste `:root` block — is the foundation every new section and
variant is built on.

**Sequencing consequence:** the token extraction lands *before* the first variant
template is built, not after.

---

## Instrumentation must be variant-aware

`assets/gpod.js` currently emits zero analytics events. When we add the event
layer in Sprint 1, every event must carry the **test group** alongside it, or we
will have per-feature engagement data that cannot be attributed to an arm.

Practically: read the Intelligems group assignment (once installed) and include
it as a property on every `dataLayer` push and `fbq('trackCustom', …)` call.
Until Intelligems is installed, send a `control` literal so the property exists
from day one and the schema never changes.

Intelligems' own guidance: install its script directly in `theme.liquid` rather
than as an app embed, to avoid control content flashing before the variant paints.
On an 800KB home page over a course-side connection, that flicker would be very
visible.

---

## What this changes in the sprint plan

| Sprint | Was | Now |
|---|---|---|
| 1 | Publish the redesign over the live theme, staged by template | Publish once as the **new control baseline**, then hold. Install Intelligems' snippet and make events variant-aware from the first commit. |
| 2 | Edit `templates/product.json` in place — reorder sections, collapse description | Ship `product.specs-first.json` and `product.compact.json` as **variants**; `product.json` stays control. Reordering is now a test, not a decision. |
| 3 | Edit the home page | Home cannot be template-tested → build the fast/comprehension home as a **duplicate theme** and run a Theme Test. |
| 4 | Fix content in place | Split into two classes: **defects** (empty compatibility page, "John Doe", 404 CTA, wrong remote copy) are fixed in the control directly — a bug is not a hypothesis; **choices** (section order, merged use-case grid, promo placement) become variants. |
| 5–6 | Build AOV and capture features | Each ships behind a section setting so it can be toggled per-arm. |

The distinction in Sprint 4 is the one to internalise:

> **Defects get fixed in the control. Choices get tested as variants.**

An empty page, a 404, a placeholder testimonial and a factually wrong sentence
are not hypotheses — there is no version of the site where they win. Fix them
everywhere, immediately, and spend the testing budget on the genuinely open
questions: section order, copy angle, how much detail belongs above the fold,
whether the quiz outperforms the compare table as the primary decision aid.

---

## Open item

`revenuehunt-quizzes` is installed **and enabled** on the store, while we have
also built a native product finder (`sections/product-finder.liquid`). Two quiz
systems is one too many. Decide which is canonical before Sprint 6 wires quiz →
email capture, or that work gets done twice and the data lands in two places.
