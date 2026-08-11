# GPOD Golf — Mobile Conversion Sprint Plan
**Drafted 2026-08-11 · Baseline: `docs/funnel-baseline.md` · Branch: `claude/dtc-website-sprint-plan-guzmiy`**

---

## 1. The thesis

Everything in this plan follows from five measured facts:

1. **85.2% of traffic is mobile** (68,674 of 80,560 sessions / 90d).
2. **Mobile adds to cart 2.6× less often than desktop** — 3.20% vs 8.38%.
3. **But mobile converts *better* than desktop once it reaches the cart** — 47.4% cart→order vs 41.2%.
4. **54.7% of all traffic is paid social, converting at 0.61%**, and 51.8% of all sessions land on the home page.
5. **The redesign is unpublished and nothing we built emits a single analytics event.**

> **The entire mobile deficit happens upstream of the Add to Cart button.**
> Checkout is not broken. Cart is not broken. What is broken is everything a
> phone user sees between landing and tapping ATC: comprehension, product
> differentiation, proof, page weight, and the buy box itself.

That is a narrow, attackable target — and it is worth **$186K–$373K/year**.

### North star metric

**Mobile add-to-cart rate: 3.20% → 4.49%** (closing 25% of the desktop gap)
= +419 orders / 90 days = **+$186K/year** at $109.24 AOV.
Stretch: 5.79% (half the gap) = **+$373K/year**.

Every sprint below is scored against that one number, except Sprint 5 (AOV) and
Sprint 6 (retention), which have their own.

---

## 2. Operating principles

1. **Ship every week.** The redesign has earned $0 for five weeks. Velocity to
   production beats completeness.
2. **390px is the design surface.** Design at 390px, review at 390px, sign off at
   390px. Desktop is the 14% case.
3. **Subtract before adding.** There are 13 custom sections and 17 on the PDP.
   The default move is reorder/merge/cut, not build.
4. **No sprint ships without measurement.** One primary metric per sprint,
   declared before work starts.
5. **Re-pull the baseline every Friday** — the four queries in
   `docs/funnel-baseline.md` §2–5 — and log the delta in the decision table.

---

## 3. Sprint map

| # | Sprint | Primary metric | Target |
|---|---|---|---|
| 1 | Ship & Instrument | Mobile ATC rate (no regression) | ≥ 3.20% held |
| 2 | The Mobile Buy Box | Mobile ATC rate | 3.20% → 4.00% |
| 3 | Social Landing & Speed | Social CVR | 0.61% → 0.90% |
| 4 | Content Placement & Alignment | Scroll depth / section engagement | +20% mid-page |
| 5 | AOV — Bundles & Attach | AOV | $109.24 → $119 |
| 6 | Capture & Retention | Email-attributed revenue | <1% → 5% |

Six one-week sprints. A single part-time developer should read these as
two-week sprints and halve the scope per sprint, keeping the order.

The **design-system thread** (tokens, button hierarchy, tap targets, spacing
scale) runs continuously through Sprints 2–4 rather than getting its own sprint —
it is a tax paid on each UI change, not a project.

---

## 4. Sprint 1 — Ship & Instrument

> *"We cannot improve what we cannot see, and we cannot earn from what we
> haven't shipped."*

**Goal:** get the redesign into production safely, and make every funnel step
measurable.
**Primary metric:** mobile ATC rate holds at ≥3.20% through the launch window.

### Why first
The live theme is `Copy of Modular (PaulDev)` (id 153797918888). The redesign
sits on preview theme 154401538216, unpublished. Simultaneously, `assets/gpod.js`
contains **zero** analytics calls (`grep -cE "gtag|dataLayer|fbq|track"` → `0`),
so the quiz, compare picker, spec accordions and pairs-with are all
unmeasurable. Shipping blind would leave us unable to attribute any change in
Sprints 2–6.

### Backlog

**A. Staged publish (do not big-bang a store doing $187K/90d)**
- Duplicate the current live theme as `ROLLBACK 2026-08-11` — untouched, one click to restore.
- Publish **PDP template first**. Highest purchase intent, smallest blast radius, clearest read on ATC rate. Hold 72h.
- Then home page. Then collections. Then support/compare/quiz.
- Define the rollback trigger *before* publishing: mobile ATC rate down >10% over 48h at n>500 sessions → revert.

**B. Instrumentation layer (blocks every later sprint)**
- Add a small event helper to `assets/gpod.js` pushing to `dataLayer` + `fbq('trackCustom', …)`.
- Instrument: quiz start/complete/result-click, compare open + model change, spec accordion open, compatibility lookup, pairs-with add, sticky-ATC tap, variant change, gallery swipe depth.
- Register a Shopify **Web Pixel / Customer Events** subscriber so `view_item`, `add_to_cart`, `begin_checkout` are consistent across GA4 and Meta.
- Verify Meta CAPI is deduplicating against browser pixel events — with 55% of traffic from paid social, signal quality directly drives ad efficiency.

**C. Fix where the ads actually land**
- Ads point at legacy IA: `/collections/frontpage/products/gpodx`, `/collections/frontpage/products/g-bundle-two-…`, `/collections/outdoor`. Add 301s to canonical `/products/*` and the new use-case collections.
- **`/pages/fourth-of-july` absorbed 2,876 sessions** in a window ending 11 August. Redirect to home or a live offer today.
- Confirm canonical tags so `/collections/*/products/*` duplicates consolidate.

**D. Cleanup (already flagged in CLAUDE.md, now overdue)**
- Delete PageFly leftovers: `sections/pf-*.liquid`, `templates/page.pf-*.json`, `layout/theme.pagefly.liquid`, `assets/pagefly-*.css`.
- Delete seasonal one-offs: `page.fathers-day.json`, `page.fourth-july.json`, `cart.discountyard.liquid`.
- Resolve the blank-titled product carrying 1,190 orders / $68,995 before it corrupts attribution.

### Definition of done
Redesign live on all core templates; rollback theme exists; every custom
interaction fires a named event visible in GA4 DebugView and Meta Events
Manager; no legacy ad URL 404s or double-hops.

---

## 5. Sprint 2 — The Mobile Buy Box

> *The direct hit on the 2.6× ATC gap.*

**Goal:** make "add to cart" reachable, obvious, and confident on a 390px screen.
**Primary metric:** mobile ATC rate 3.20% → 4.00% (+25% relative, ≈ +208 orders/90d, ≈ +$92K/yr).

### Backlog

**A. Sticky add-to-cart bar (mobile only)** — the single highest-leverage item
in this plan. Price + selected variant + button, revealed once the hero scrolls
out. On a 17-section PDP the ATC button is otherwise a memory by the time a
customer is convinced.

**B. Above-the-fold budget.** Define and enforce a px budget at 390×844: media,
title, star rating + count, price, one differentiator line, variant selector,
ATC. Anything else moves down. Target: ATC visible within one short scroll.

**C. Surface the proof we already own.** Fera is live on PDPs (115 markup hits)
and `AggregateRating` is already in JSON-LD — but the rating is not in the
above-fold block. Star row + review count directly under the product title.

**D. Payment confidence.** `enable_payment_button = true` and Shop Pay
installments are present. Add explicit installment messaging near price
("or 4 interest-free payments of $27.50") — meaningful at a $109 AOV.

**E. Fill the trust vacuum.** The live PDP has **zero free-shipping messaging**
(verified: 0 hits). Add a compact row under ATC: shipping promise, returns
window, warranty, "works with your phone" link.

**F. Component hygiene.** Variant tap targets ≥44×44px with an unambiguous
selected state; gallery swipeable with locked aspect ratio (no CLS); sold-out
states handled.

**G. Cut the PDP from 17 sections to ~10 on mobile.** Merge the two
`section-faq` instances, audit the three `apps` blocks, and drop or defer
anything that repeats a message already made.

---

## 6. Sprint 3 — Social Landing & Speed

> *55% of traffic, 0.61% conversion, landing on an 800KB page.*

**Goal:** treat the home page as what it actually is — a cold-traffic mobile
landing page for paid social — and make it fast enough to be read.
**Primary metric:** social CVR 0.61% → 0.90% (≈ +128 orders/90d, ≈ +$56K/yr).

### The measured problem
The live home page ships **798KB of HTML** (387KB of it inline JS), **288 image
tags**, and **19 content sections**, behind a **render-blocking 426KB
`theme.css`**, with an **autoplay `<video>` as the LCP element**. On a course-side
4G connection, the promise never gets a chance to land.

### Backlog

**A. Performance (this is conversion work, not hygiene)**
- Split critical CSS; defer the rest of `theme.css`.
- Replace the autoplay video hero with a poster-first image and play-on-interaction, or a genuinely small muted loop with a real poster frame.
- Cut home-page image count hard — 288 `<img>` tags is a catalog dump, not a landing page.
- Remove the `cdn.jsdelivr.net` dependency and the third-party Section Store blocks (`ss_text_block_pro` ×4, `ss_gallery_4` ×2, `ss_comparison_table_6`) that drag it in. This also violates the no-external-CDN convention in CLAUDE.md.

**B. First screen comprehension.** Keep the H1 — **"WE MAKE FILMING YOUR SWING
EASY."** is genuinely good and should survive the redesign. Add beneath it, in
this order: what it physically is (a magnetic phone mount for filming your golf
swing), the proof already in the announcement bar (75,000+ golfers, star row),
and **one** primary CTA.

**C. Route the confused customer immediately.** The #1 documented customer
problem is "I can't tell the products apart." A cold visitor should hit the
product-finder or compare entry point within the first screen or two, not at
position 12 (`quiz_cta`, currently last in `templates/index.json`).

**D. Nav simplification is already built — ship it.** The live site has **nine**
top-level nav items (Shop / Product Finder Quiz / Register / About Us / FAQ's /
Corporate Sales / On Tour / Swing Tips / Australia). The redesign's 4-item IA is
a real improvement sitting unpublished.

**E. Make support content findable.** `search_type = product` — storefront search
returns products only. For a customer base whose top questions are compatibility
and troubleshooting, FAQ and support pages are invisible to search. Enable
page/article search and populate the empty `search_suggested_*` settings.

**F. Evaluate a dedicated paid-social landing template** rather than pointing
every ad at `/`. Offer consistency between ad creative and first screen is the
cheapest CVR lever in paid social.

---

## 7. Sprint 4 — Content Placement & Alignment

> *Does the content in each placement actually match what the page is showing?*

**Goal:** every section says something true, necessary, and appropriate to where
it sits; nothing renders empty.
**Primary metric:** mid-page scroll depth and per-section engagement (measurable
only after Sprint 1).

### Backlog

**A. Eliminate every empty scaffold.** The decision log admits "empty testimonial
scaffolds" were shipped pending real Fera quotes. Any section that can render
blank must either be filled or self-hide. A blank band on a landing page reads
as a broken site.

**B. Resolve duplication.**
- `templates/index.json` runs `home-use-cases` **twice** (`usecases` + `gpodder`) — merge or sharply differentiate.
- `templates/product.json` runs `section-faq` **twice** and carries **three** `apps` blocks.

**C. Fix narrative order.** Home currently runs hero → brand statement →
use-cases → founder → compare → tour → GPODDER → overlay → Sportsbox → icons →
community → quiz CTA. A first-time visitor who doesn't know what a GPOD is meets
the founder's story before they've been told what the product does, and the quiz
— the answer to their actual question — is last.

**D. Copy discipline.** Canonical naming ("Pauly P", never "Pauly D"/"Paulie");
consistent GPOD capitalization; substantiate "75,000+ golfers" with a source
note so it can be defended.

**E. Use-case collections must stay in their use case.** The four use-case
collections exist to carry a situational frame ("indoor & sim", "on the course").
If they collapse into a generic product grid on arrival, they add a click without
adding an answer.

**F. Pauly P has a demand problem, not a placement problem.** 84 orders against
GPOD's 5,717, at $159.99. It appears in the compare table but has no story
anywhere. Either give it a reason to exist on the site or stop giving it
premium real estate.

---

## 8. Sprint 5 — AOV: Bundles & Attach

> *Bundles already carry a 60–110% AOV premium. We just don't sell them well.*

**Goal:** raise AOV without touching traffic.
**Primary metric:** AOV $109.24 → $119 (+$9.76 × 1,736 orders ≈ **+$17K/90d ≈ +$69K/yr**).

### The evidence
| | Orders | AOV |
|---|---|---|
| GPOD solo | 5,717 | $87.91 |
| **G Bundle 2 (X + Base)** | 1,147 | **$141.34** |
| **G Bundle 3 (Pauly P + Base)** | 196 | **$184.73** |
| GPOD Base 2.0 (solo attach) | 1,503 | $42.75 |
| GPUCK w/MagSafe | 1,051 | $20.13 |

Base 2.0 is the proven attach — 1,503 solo orders plus ~1,671 more inside
bundles. GPUCK and Caddy are natural low-friction adds.

### Backlog
- **Build-a-bundle flow.** The Peak Design pattern is already researched in `docs/research-peak-design-bundle-flow.md` and never built: buy-box radio toggle, tag-driven accessory eligibility, native line items + automatic discount.
- **Cart drawer upsell.** `enable_ajax_cart = true`, so the drawer exists. Add Base 2.0 / GPUCK / Caddy as one-tap adds.
- **Free-shipping progress bar** — requires a threshold decision first. Note that current rates are paid at every tier; a $99 or $125 threshold would need modelling against margin.
- **Price anchoring on bundle PDPs** — show the saving versus buying separately. At a $141 vs $130 comparison the maths must be visible to be persuasive.
- **Make `pdp-pairs-with` transactional** — inline add-to-cart, not a link to another PDP that restarts the decision.

---

## 9. Sprint 6 — Capture & Retention

> *57 email sessions in 90 days. Klaviyo is installed and idle.*

**Goal:** stop renting 100% of demand at 0.61% conversion.
**Primary metric:** email-attributed revenue from <1% to 5% (≈ **+$37K/yr** at current volume, compounding).

### Backlog
- **Quiz → email handoff.** The product finder is the single best capture moment on the site: the visitor has just told us their use case. Soft-gate the result, or offer to email it.
- **Back-in-stock for "Pocket G"** (coming soon) — free list growth from existing demand.
- **Post-purchase onboarding flow**: setup video, remote pairing, Sportsbox redemption, and the fix for the stuck lower extension (the #1 support complaint per `docs/customer-insights.md`). This simultaneously cuts support load, protects reviews, and seeds accessory repurchase.
- **Abandoned cart + abandoned browse flows** — currently absent from a store with 2,197 monthly-equivalent cart adds.
- **Test capture placement carefully.** An aggressive mobile popup can suppress ATC. Any interstitial ships as an A/B test against the north-star metric, not as a default-on.

---

## 10. Measurement plan

Re-run these four queries at the end of every sprint and log deltas in the
CLAUDE.md decision table:

```
FROM sessions SHOW sessions, sessions_with_cart_additions,
  sessions_that_reached_checkout, sessions_that_completed_checkout,
  conversion_rate GROUP BY session_device_type SINCE -30d UNTIL today

FROM sessions SHOW sessions, conversion_rate
  GROUP BY referrer_source SINCE -30d UNTIL today

FROM sessions SHOW sessions GROUP BY landing_page_path
  ORDER BY sessions DESC LIMIT 15 SINCE -30d UNTIL today

FROM sales SHOW orders, net_sales, average_order_value SINCE -30d UNTIL today
```

Guard rails: watch **mobile ATC rate** as the primary, but hold **cart→order
(47.4%)** and **checkout→order (49.6%)** flat. Those are currently healthy;
a change that lifts ATC while damaging them is not a win.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Publishing the redesign regresses a $187K/90d store | Rollback theme, staged template-by-template publish, pre-declared revert trigger |
| Perf work breaks the live home page | Section Store blocks removed one at a time, each verified at 390px before the next |
| Email capture popups suppress ATC | Ship as A/B test measured against the north-star metric |
| Attribution noise from paid-social scale | Fix CAPI dedup in Sprint 1, before any CVR claims are made |
| Sprints 2–6 read as "done" without measurement | No sprint closes until its primary metric has 7 days of post-ship data |

---

## 12. What this plan deliberately does not do

- **No new sections.** Thirteen custom sections already exist and the PDP has 17. The bias throughout is reorder, merge, cut, and sharpen.
- **No checkout or cart-mechanics work.** The data says both are healthy on mobile; effort there would be misdirected.
- **No desktop-first design work.** Desktop is 13.7% of sessions and already converts at 3.45%.
- **No new apps** until Sprint 5, and only if the bundle flow can't be built natively.
