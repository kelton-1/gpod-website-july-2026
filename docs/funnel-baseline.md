# Funnel Baseline — GPOD Golf (pulled 2026-08-11)

Source: Shopify Analytics (`FROM sessions` / `FROM sales`), trailing 90 days
(2026-05-13 → 2026-08-11) unless noted. This is the measurement baseline the
sprint plan is built against. **Re-pull these exact queries at the end of every
sprint** and log the delta.

## 1. The headline

| Metric | Value |
|---|---|
| Sessions (90d) | 80,560 |
| Orders (90d) | 1,736 |
| Net sales (90d) | $187,617 |
| AOV | $109.24 |
| Site conversion rate | 1.66% blended |

## 2. Device split — where the money leaks

| Device | Sessions | % of traffic | Cart adds | **ATC rate** | Reached checkout | Completed | **CVR** |
|---|---|---|---|---|---|---|---|
| **Mobile** | 68,674 | **85.2%** | 2,197 | **3.20%** | 2,099 | 1,042 | **1.52%** |
| Desktop | 11,058 | 13.7% | 927 | **8.38%** | 1,311 | 382 | **3.45%** |
| Tablet | 744 | 0.9% | 47 | 6.32% | 40 | 28 | 3.76% |

### The diagnosis

Mobile converts at **44% of desktop's rate**. But look at where the gap is:

| Stage transition | Mobile | Desktop | Verdict |
|---|---|---|---|
| Session → cart add | **3.20%** | **8.38%** | **Mobile is 2.6× worse — THE LEAK** |
| Cart add → order | 47.4% | 41.2% | Mobile is *better* |
| Checkout → order | 49.6% | 29.1% | Mobile is *better* |

**Mobile shoppers who reach the cart convert fine — better than desktop.
The entire mobile deficit happens upstream of the Add to Cart button.**

This is the single most important fact in this document. It means the sprint
plan should spend its effort on everything a phone user sees *before* they tap
ATC — first screen, comprehension, product differentiation, proof, the buy box
itself — and almost none on cart or checkout mechanics.

## 3. Traffic sources — 55% of sessions convert at 0.61%

| Source | Sessions | % of traffic | CVR | Est. orders |
|---|---|---|---|---|
| **social** (paid Meta) | 44,092 | **54.7%** | **0.61%** | ~268 |
| direct | 24,012 | 29.8% | 2.71% | ~650 |
| search | 11,109 | 13.8% | **4.68%** | ~520 |
| unknown | 1,290 | 1.6% | 0.93% | ~12 |
| **email** | **57** | **0.07%** | 3.51% | ~2 |

Two structural problems:

1. **Paid social is the majority of traffic and converts 7.7× worse than
   organic search.** It is also almost entirely mobile. The mobile funnel
   problem and the paid-social problem are the same problem.
2. **Email is functionally non-existent** — 57 sessions in 90 days. Klaviyo is
   installed (`config/settings_data.json:161` app embed) but there is no
   working capture-to-flow loop. The business is 100% dependent on rented
   traffic that converts at 0.61%.

## 4. Landing pages — the redesign isn't where the traffic is

| Landing path | Sessions |
|---|---|
| `/` | **41,751 (51.8%)** |
| `/collections/frontpage/products/g-bundle-two-gpod-x-with-gpod-base` | 6,430 |
| `/products/gpodmagsafe` | 4,286 |
| `/collections/frontpage/products/gpodx` | 3,933 |
| `/collections/frontpage` | 3,004 |
| `/pages/fourth-of-july` | **2,876** |
| `/products/gpod-travel-1` | 1,642 |
| `/collections/frontpage/products/gpod-pauly-p2` | 1,526 |
| `/collections/outdoor` | 501 |

Three findings:

- **The home page IS the paid-social landing page** (51.8% of all sessions).
  It is not a brand page — it is a cold-traffic mobile LP and must be judged
  as one.
- **Ads point at legacy URLs**: `/collections/frontpage/products/*` and
  `/collections/outdoor` — the deprecated IA. The new use-case collections
  (`on-the-course`, `indoor-simulator`, `coaching-studio`, `travel-ready`)
  receive effectively zero landing traffic. The redesign's IA is invisible to
  the traffic that pays the bills.
- **A stale seasonal page took 2,876 sessions** (`/pages/fourth-of-july`) in a
  window ending Aug 11. CLAUDE.md already flags seasonal templates for removal;
  they are still absorbing live ad traffic.

## 5. Product mix — bundles are the proven AOV lever

| Product | Orders (lifetime) | Gross | AOV |
|---|---|---|---|
| GPOD | 5,717 | $586,700 | $87.91 |
| GPOD Travel | 3,764 | $269,416 | $64.70 |
| GPOD X | 2,110 | $270,374 | $112.48 |
| GPOD Base 2.0 | 1,503 | $70,900 | $42.75 |
| **G Bundle 2 (X + Base)** | **1,147** | $175,624 | **$141.34** |
| GPUCK w/MagSafe | 1,051 | $27,440 | $20.13 |
| GPOD Mini | 873 | $63,623 | $39.90 |
| GPOD Studio 2.0 | 453 | $86,476 | $164.47 |
| GPOD Caddy | 438 | $15,603 | $32.48 |
| G Bundle 1 (GPOD + Base) | 328 | $42,876 | $119.84 |
| G Bundle 3 (Pauly P + Base) | 196 | $41,468 | $184.73 |
| GPOD Pauly P | 84 | $13,422 | $124.57 |

- **Bundles carry a 60–110% AOV premium** ($141–$185 vs $88 solo GPOD) and
  already account for ~1,681 orders. The build-a-bundle flow researched in
  `docs/research-peak-design-bundle-flow.md` was never built.
- **Base 2.0 is the natural attach** — 1,503 solo orders plus ~1,671 inside
  bundles. It is the single highest-leverage cross-sell in the catalog.
- **Pauly P (84 orders) badly underperforms** for a hero SKU at $159.99 — it's
  in the compare table but has no demand-generation story.
- A blank product title with 1,190 orders / $68,995 indicates deleted products
  still carrying order history — clean up before attribution work.

## 6. Trend — conversion fell as paid social scaled

| Month | Sessions | CVR |
|---|---|---|
| 2026-02 | 6,005 | 1.53% |
| 2026-03 | 16,532 | 1.60% |
| 2026-04 | 39,587 | **1.09%** |
| 2026-05 | 32,713 | 1.31% |
| 2026-06 | 26,475 | 1.89% |
| 2026-07 | 29,182 | 1.76% |
| 2026-08 (partial) | 10,717 | 1.48% |

Traffic scaled 6.6× from February to April and conversion rate collapsed to
1.09% — classic symptom of paid scale outrunning landing-page quality. It has
partially recovered but the site has never converted well *at volume*.

## 7. Opportunity sizing

All figures are incremental to the 90-day baseline, at $109.24 AOV, holding the
mobile cart→order rate constant at 47.4%.

### A. Closing the mobile ATC gap (the primary prize)

| Scenario | Mobile ATC rate | Cart adds | Orders | Δ orders/90d | Δ revenue/90d | Δ revenue/yr |
|---|---|---|---|---|---|---|
| Today | 3.20% | 2,197 | 1,042 | — | — | — |
| +20% relative | 3.84% | 2,636 | 1,250 | +208 | +$22,700 | **+$92,000** |
| Close 25% of desktop gap | 4.49% | 3,083 | 1,461 | +419 | +$45,800 | **+$186,000** |
| Close 50% of desktop gap | 5.79% | 3,976 | 1,885 | +843 | +$92,100 | **+$373,000** |

### B. Other levers

| Lever | Mechanism | Δ revenue/yr (est.) |
|---|---|---|
| Paid-social CVR 0.61% → 1.00% | Purpose-built mobile landing experience | +$76,000 |
| AOV +$10 | Cart drawer upsell, free-ship threshold, bundle builder | +$69,000 |
| Email 0% → 10% of revenue | Capture + flows on an already-installed Klaviyo | +$75,000 |

These overlap and should not be summed naively, but the mobile ATC gap alone is
a **$92K–$373K/year** line item. That is the sprint plan's north star.

## 8. Instrumentation gap (blocks all of the above)

`assets/gpod.js` contains **zero** analytics event calls — verified:
`grep -cE "gtag|dataLayer|fbq|track" assets/gpod.js` → `0`.

Every feature built in the redesign — the product finder quiz, the compare
picker, spec accordions, ways-to-use, pairs-with — is **unmeasurable**. We
cannot tell whether any of it helps, and therefore cannot iterate. Instrumentation
is a Sprint 1 prerequisite, not a nice-to-have.

Also: `search_type = product` means storefront search returns products only.
None of the support/FAQ content is reachable via search, for a customer base
whose top questions are compatibility and troubleshooting.

## 9. Live home page — measured, not assumed

Fetched `https://gpodgolf.com/` with an iPhone user-agent on 2026-08-11. This is
the page 41,751 sessions (51.8%) land on, and where paid social converts at 0.61%.

| Measurement | Value | Comment |
|---|---|---|
| Total HTML | **798,097 bytes** | 5–10× a healthy page |
| Inline `<script>` content | **387,482 bytes** | Half the document is inline JS |
| Inline `<style>` content | 59,103 bytes | |
| Inline SVG markup | 55,122 bytes | |
| `<img>` tags on page | **288** | 285 lazy, 3 eager |
| Content sections | **19** | Very long mobile scroll |
| Render-blocking CSS in `<head>` | `theme.css` (~426KB), portable-wallets, Fera | No `media` swap, no critical-CSS split |
| Above-fold media | **1 autoplay `<video>`** + 3 eager images | Video is the LCP element on mobile |
| Viewport meta | present, zoom not disabled | OK for accessibility |
| External CDN | `cdn.jsdelivr.net` ×2 | Violates the no-external-CDN convention in CLAUDE.md |

Live home page section order (what a cold social visitor scrolls through):
announcement → **video hero** → list-collections → text block → product features
→ comparison table → 2 custom → text block → logo list → 2 galleries → text
block → custom → text block → 2 custom → collection → rich text → footer → popup.

Four of these are third-party Section Store blocks (`ss_text_block_pro` ×4,
`ss_gallery_4` ×2, `ss_comparison_table_6`), which is where the jsdelivr
dependency and much of the inline JS comes from.

The live H1 — **"WE MAKE FILMING YOUR SWING EASY."** — is genuinely good and
should survive the redesign. The problem is not the promise; it is that a
390px-wide phone on a course connection must download ~800KB of HTML and a
render-blocking 426KB stylesheet, then start an autoplay video, before that
promise is legible.

## 10. Deployment status

| Theme | ID | Role |
|---|---|---|
| **Copy of Modular (PaulDev)** | 153797918888 | **MAIN (live)** |
| GPOD GOLF -July 2026-Repo | 154401538216 | Unpublished preview |

**The entire redesign is unpublished and generating $0.** Every hour spent
building without shipping compounds this. Sprint 1 exists to change that.
