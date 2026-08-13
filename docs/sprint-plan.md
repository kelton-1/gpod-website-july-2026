# GPOD Golf — Mobile Conversion Sprint Plan
**Drafted 2026-08-11 · Baseline: `docs/funnel-baseline.md` · Branch: `claude/dtc-website-sprint-plan-guzmiy`**

---

## 1. The thesis

Everything here follows from five measured facts:

1. **85.2% of traffic is mobile** (68,674 of 80,560 sessions / 90d).
2. **Mobile adds to cart 2.6× less often than desktop** — 3.20% vs 8.38%.
3. **But mobile converts *better* than desktop once it reaches the cart** — 47.4% cart→order vs 41.2%.
4. **54.7% of traffic is paid social converting at 0.61%**, and 51.8% of all sessions land on the home page.
5. **The redesign is unpublished, and nothing we built emits a single analytics event.**

> **The entire mobile deficit happens upstream of the Add to Cart button.**
> Checkout is not broken. Cart is not broken. What is broken is everything a
> phone user sees between landing and tapping ATC: comprehension, product
> differentiation, proof, and page weight.

A code audit then found two things that reframe the work:

- **The redesign has five defects that would ship broken to customers** — including a home-page primary CTA that 404s and a mobile menu that cannot reach any product collection.
- **Eleven revenue features are already built and switched off.** A free-shipping bar implemented twice, trust badges, complementary products, recently-viewed, express checkout in cart. The single highest-ROI day of this plan is a settings pass, not a build.

### North star metric

**Mobile add-to-cart rate: 3.20% → 4.49%** (closing 25% of the desktop gap)
= +419 orders / 90 days = **+$186K/year** at $109.24 AOV.
Stretch: 5.79% (half the gap) = **+$373K/year**.

---

## 2. Day One — the switch-flip pass

Before any sprint begins. Every item below is already built or is a one-value
change. Verified individually against the repo and the live store.

| # | Change | Where | Why it matters |
|---|---|---|---|
| 1 | `cta1_link` → `/collections/frontpage` | `templates/index.json` | **The home hero's "Shop All GPODs" button points at `/collections/all-products`, which does not exist** (live query returns `null`). The top CTA on the page taking 51.8% of sessions 404s. The real collection is `frontpage` — "All GPOD Products", 23 products. |
| 2 | `mobile_menu_behaviour` → `link`, or add "Shop all …" leaf links | `config/settings_data.json` (unset → schema default `trigger`) | **On mobile, tapping "Monopods", "Tripods & Bases", "Bundles" or "Accessories" never navigates.** `snippets/navigation.liquid:42-47` forces `dropdown_trigger` for any item with children, and the handler calls `preventDefault()` unconditionally. Those four collection pages have **no mobile nav path at all** — which defeats the redesign's core mechanism for fixing "can't tell products apart". |
| 3 | `show_free_shipping_message` → `true` | `config/settings_data.json:54-55` | A complete free-shipping progress bar is implemented **twice** (`snippets/announcement.liquid:117-214`, `snippets/site-cart.liquid:11-118`) with `free_shipping_limit` already set to `50`. It is switched off. |
| 4 | `enable_additional_buttons` → `true` | `config/settings_schema.json:648` | Cart drawer has no Shop Pay / PayPal / Google Pay, though the PDP does. |
| 5 | Enable `section_icons_row_Yk6GXG` | `templates/product.json:125` (`disabled: true`) | "Lifetime Warranty / Trusted On Tour / Premium Build" is the **only** trust copy on the PDP, and it's off. (Fix the typos first — "GPOD In countless bags", "need It to".) |
| 6 | Enable `complementary-products` | `templates/product.json:59-65` (`disabled: true`) | Shopify-native cross-sell in the buy box, installed and dark. |
| 7 | Enable `recently-viewed` | `templates/product.json:315-323` (`disabled: true`) | Built and disabled. |
| 8 | `cart_icon` → `circle` | `config/settings_data.json:48` | The item-count badge is only emitted in the `circle` branch of `sections/header.liquid:189-196`. Today the cart icon **never shows a count** — the JS updater at `theme.dev.js:2870` is guarded on an element that doesn't exist. |
| 9 | Fix Organization `sameAs` | `sections/header.liquid:258-266` | Reads `settings.instagram_link`, `facebook_link`, … — **none of those setting IDs exist**. The real ones are `instagram_url`, `facebook_url`, etc. Every `sameAs` entry currently resolves to `null`. |
| 10 | Reset 6 stale `templateSuffix` values | Shopify admin | See §4E. Includes the #1 seller. |
| 11 | Add GTIN/barcodes | Shopify admin | **GPOD, GPOD X, Pauly P, Studio 2.0, Base 2.0, G Plate and all 3 bundles have blank barcodes.** Missing GTINs suppress Advantage+ / PMax / Shopping eligibility on exactly the SKUs carrying the ad budget — for a business that is 55% paid social. |

Items 1 and 2 alone justify the day.

---

## 3. Operating principles

1. **Ship every week.** The redesign has earned $0 for five weeks.
2. **390px is the design surface.** Desktop is the 14% case.
3. **Subtract before adding.** 13 custom sections, 17 on the PDP. Default move is reorder/merge/cut.
4. **No sprint ships without measurement.** One primary metric, declared before work starts.
5. **Re-pull the baseline every Friday** (`docs/funnel-baseline.md` §2–5) and log the delta.

### Sprint map

| # | Sprint | Primary metric | Target |
|---|---|---|---|
| 1 | Ship & Instrument | Mobile ATC rate (no regression) | ≥ 3.20% held |
| 2 | The Mobile PDP | Mobile ATC rate | 3.20% → 4.00% |
| 3 | Social Landing & Speed | Social CVR | 0.61% → 0.90% |
| 4 | Content Placement & Alignment | Scroll depth / section engagement | +20% mid-page |
| 5 | AOV — Bundles & Attach | AOV | $109.24 → $119 |
| 6 | Capture & Retention | Email-attributed revenue | <1% → 5% |

Six one-week sprints. A single part-time developer should read these as two-week
sprints, halving scope and keeping the order.

---

## 4. Sprint 1 — Ship & Instrument

**Goal:** get the redesign into production safely and make every funnel step measurable.
**Primary metric:** mobile ATC rate holds at ≥3.20% through the launch window.

### A. Pre-flight gate — blocks the publish

Unedited theme demo copy would reach customers the moment this publishes:

- **Every PDP would ship a placeholder FAQ.** `templates/product.json` → `faq` section, blocks `item-1`/`item-2`, both titled literally **"Question"**, answering *"Use this answer block to discuss some commonly asked questions you've discovered from your customers interactions…"* A genuine FAQ sits directly below — so a hesitant shopper hits the dead copy **first**. Delete the placeholder.
- **All four use-case collection pages would ship "John Doe" testimonials.** The decision log records these as "empty scaffolds… hidden until filled." They are not hidden. Blocks `quote_1/2/3` carry `settings: {}`, so Shopify falls back to schema defaults — `author: "John Doe"`, plus Modular boilerplate — and the guard at `sections/section-testimonials.liquid:44` (`if author != blank or blockquote != blank`) **passes on those defaults and renders them**. Unlike `pdp-ways-to-use.liquid` and `pdp-pairs-with.liquid`, which self-hide correctly, this section has no empty guard. Set the settings to `""` explicitly, supply real Fera quotes, or remove the section.
- **`templates/page.about.json` is unexploded ordnance** — Modular's own documentation copy ("Describe your products or brand in detail here"). The live About page uses the default template today, but this file is named to match and is one admin click from replacing a genuine founder bio with filler.
- Plus **Day One items 1 and 2** — the 404 CTA and the unreachable mobile collections.

**Gate:** a grep for `John Doe`, `Use this answer block`, `Use this testimonial`,
and `Describe your products` across `templates/` must return nothing before any
template publishes.

### B. Staged publish
- Duplicate the live theme as `ROLLBACK 2026-08-11`.
- Publish **PDP first** (highest intent, smallest blast radius, clearest ATC read). Hold 72h.
- Then home, then collections, then support/compare/quiz.
- Rollback trigger declared *before* publishing: mobile ATC down >10% over 48h at n>500 sessions.

### C. Instrumentation (blocks every later sprint)
`assets/gpod.js` contains **zero** analytics calls — verified repo-wide for
`dataLayer` / `gtag(` / `fbq(` / `ttq.` / `analytics.track`. The quiz's `finish()`
and the compare picker's change handler do DOM work only.
- Event helper pushing to `dataLayer` + `fbq('trackCustom', …)`.
- Instrument: quiz start/complete/result-click, compare open + model change, spec accordion open, compatibility lookup, pairs-with click, sticky-ATC tap, gallery swipe depth.
- Register a Shopify Web Pixel so `view_item` / `add_to_cart` / `begin_checkout` agree across GA4 and Meta.
- Verify Meta CAPI deduplication — at 55% paid social, signal quality drives ad efficiency directly.

### D. Fix where the ads actually land
- Ads point at legacy IA: `/collections/frontpage/products/*`, `/collections/outdoor`. Add 301s to canonical `/products/*` and the new collections.
- **`/pages/fourth-of-july` absorbed 2,876 sessions** in a window ending 11 August. Redirect today.

### E. Cleanup
- Delete PageFly leftovers and seasonal one-offs.
- Resolve the blank-titled product carrying 1,190 orders / $68,995.
- **Reset stale product template suffixes** (verified live) — the 2026-07-07 PageFly cleanup deleted the files but never reset the assignments:

| Product | Inventory | `templateSuffix` |
|---|---|---|
| **GPOD** (`gpodmagsafe`) — #1 seller, 5,717 orders | 744 | `pf-4be18a76` |
| GPOD Caddy | 97 | `pf-4be18a76` |
| GPOD Base 2.0 | 11 | `pf-4be18a76` |
| **GPOD X** | **521** | `pre-order` |
| GPOD Pauly P | 1 | `pre-order` |
| G Bundle 3 | **−6 (oversold)** | `pre-order` |

Shopify silently falls back to `product.json`, so this is harmless *today* — but
a staged, template-by-template publish is exactly when silent fallback stops
being safe. Also: GPOD X is not a pre-order (521 units), and G Bundle 3 is
oversold.

---

## 5. Sprint 2 — The Mobile PDP: shorten the decision

**Goal:** get deciding information in front of a phone user before they stop scrolling.
**Primary metric:** mobile ATC 3.20% → 4.00% (≈ +208 orders/90d, ≈ **+$92K/yr**).

### Two assumptions killed before planning

- **A sticky mobile add-to-cart bar already exists and is already live.** `snippets/shop-bar.liquid:54-88` overrides Modular's `≤1023px` hide rule; `show_cart_bar = true`; the markup and media query are both present in live PDP HTML. It shipped in the original baseline (commit `50cedfc`), not the redesign. **Not a gap** — and that matters: with a sticky ATC already in place, mobile ATC is *still* 3.20%, which is strong evidence the constraint is comprehension and scroll length, not button accessibility.
- **Variant-picker work is wasted effort.** All 17 products have `variantsCount = 1`, so ~250 lines in `snippets/product-form.liquid:41-282` never render.

### The measured above-fold budget (390×844)

| Element | Height | Cumulative |
|---|---|---|
| Sticky header | 60 | 60 |
| Breadcrumbs (hidden ≤767px) | 0 | 60 |
| **Featured image — uncapped** | **350–490** | 410–550 |
| Vendor + H1 + price | 95–115 | 505–665 |
| Fera star summary | 26–34 | 531–699 |
| Quantity stepper (+40 margin) | 84 | 615–783 |
| **Add to Cart** | 44 | **659–827** |

Against ~690–740px genuinely visible once browser chrome is subtracted, ATC sits
right on the boundary — and **the uncapped hero image is the largest swing
variable**. A 4:5 portrait shot renders ~488px tall at 390px wide and pushes ATC
under; a square product shot doesn't. The catalog mixes both.

### Backlog, ranked by impact ÷ effort

**A. Cap the hero image height on mobile** — `max-height: ~62vh` + `object-fit: cover`. `snippets/media.liquid:16-26` feeds an unclamped `media.aspect_ratio` into a `padding-top` ratio box. CSS-only, and it decides whether ATC clears the fold. *The July 9 image-uniformity audit checked overflow and distortion, not aspect-ratio-driven scroll length.*

**B. Reorder `templates/product.json`** so `pdp_compat` and `pdp_specs` follow `main` directly. They sit at **positions 6 and 7**, behind ~2,300px of scroll, despite answering the #1 documented complaint. Pure JSON reorder.

**C. Collapse the raw product description.** `snippets/product.liquid:298-305` prints `product.description` untruncated with no read-more anywhere in the theme — ~500–700px whose "What's Included" list duplicates the `box_contents` metafield `pdp-specs` already renders. Reuse `.gpod-accordion` (`assets/gpod.css:441-490`).

**D. Fix the remote-pairing contradiction.** Shared `step_film` copy (`templates/product.json:400-406`) tells every customer to "pair it in your phone's Bluetooth settings" — including on GPOD, whose metafield says `remote_included: No`. Gate on the metafield.

**E. Gate monopod-specific content off accessory PDPs.** There is only one product template, so `pdp_howto`'s *"Extend from the top down… never slam the GPOD into the ground while collapsed"* renders on Connect 2.0, G Plate, GPUCK, Caddy and Base 2.0 — none of which telescope. The 5-column compare table renders there too, comparing five products that exclude the one being viewed.

**F. Fix the app blocks inside the buy box.** `templates/product.json:33-52` puts a One Click Upsell block and the Hype tiered progress bar between ATC and the description — the latter styled `#1eff00` neon and showing 0% before anything is in the cart. Rebrand and move it to the cart drawer, where a subtotal exists.

**G. Resolve `pdp-ways-to-use`, which renders nothing on every PDP.** `sections/pdp-ways-to-use.liquid:17-26` gates on `block.settings.image`; none of the four blocks in `templates/product.json:572-599` define one. Upload the photos in `docs/assets-needed.md` or drop it from the order — it's a reserved-but-empty slot at position 3.

**H. De-duplicate the embedded compare table.** `gpod_compare` and `pdp_specs` pull identical metafields, and the PDP's compare table includes the current product as one of its five columns. Drop that column or replace the embed with the "Compare models →" link at `sections/pdp-specs.liquid:37-39`.

**I. Render payment icons near ATC.** `snippets/payment-icons.liquid` is called only from `sections/footer.liquid:157` — ~7,000px below the buy box.

### Deliberately not here
Cart-drawer merchandising is real and worth ~$69K/yr, but mobile cart→order
already **outperforms** desktop. It's incremental AOV, not leak repair → Sprint 5.

---

## 6. Sprint 3 — Social Landing & Speed

**Goal:** treat the home page as what it is — a cold-traffic mobile LP for paid social.
**Primary metric:** social CVR 0.61% → 0.90% (≈ +128 orders/90d, ≈ **+$56K/yr**).

### The measured problem
The live home page ships **798KB of HTML** (387KB inline JS), **288 `<img>`
tags**, **19 sections**, behind a **render-blocking 426KB `theme.css`**, with an
**autoplay `<video>` as the LCP element**. On a course-side connection the
promise never gets a chance to land.

### Backlog
- **Performance is conversion work.** Split critical CSS and defer the rest. Replace the autoplay video hero with poster-first + play-on-interaction. Cut the image count hard — 288 tags is a catalog dump. Remove the `cdn.jsdelivr.net` dependency and the third-party Section Store blocks that drag it in (`ss_text_block_pro` ×4, `ss_gallery_4` ×2, `ss_comparison_table_6`), which also violates the no-external-CDN convention in CLAUDE.md.
- **Keep the H1.** *"WE MAKE FILMING YOUR SWING EASY."* is genuinely good. Add beneath it: what it physically is, the proof already in the announcement bar (75,000+ golfers), and **one** primary CTA (now that it no longer 404s).
- **Route the confused customer immediately.** The quiz is currently position 12 of 12.
- **Ship the nav simplification.** The live site has **nine** top-level items (Shop / Product Finder Quiz / Register / About Us / FAQ's / Corporate Sales / On Tour / Swing Tips / Australia). The redesign's 4-item IA is a real improvement sitting unpublished.
- **Add "Compare Models" to the header nav.** It was built, works, and is absent from `main-menu-v2` — `docs/information-architecture.md` explicitly instructed adding it "once built". Today it's reachable only from a collection-toolbar pill, a PDP link, and the quiz result.
- **Make support content findable.** `/pages/support-guides` and `/pages/gpod-compatibility-guide` have **empty page bodies**, so Shopify search can't index them. Worse, `/pages/faq`'s indexed body is **stale pre-redesign HTML** — search matches on "TSA" and returns a page whose visible content never mentions it. Mirror the real content into the page bodies for indexing.
- **Evaluate a dedicated paid-social landing template** rather than pointing every ad at `/`.

---

## 7. Sprint 4 — Content Placement & Alignment

**Goal:** every section says something true, necessary, and appropriate to where it sits.
**Primary metric:** mid-page scroll depth and per-section engagement.

**A. Fill the content customers are actively being sent to.**
- **`/pages/gpod-compatibility-guide` is completely empty** (`body: ""`) while promoted in the main nav, the footer, *and* the support hub's own card. Compatibility anxiety is a top pre-purchase blocker and its landing page has nothing on it.
- **`/pages/instructions` has zero remote/Bluetooth content**, yet support card `guide_1` links there promising "Pair the Bluetooth remote in seconds." Nothing on Studio 2.0 assembly either.
- **GPOD G Plate has zero `gpod.*` metafields**, so `pdp-specs` renders blank on a product with 216 units in stock — even though the specs are already written in `docs/product-data.md`.

**B. Resolve duplication.**
- `templates/index.json` runs `home-use-cases` **twice**. They overlap by design — "Golfer"→`on-the-course`, "Coach"→`coaching-studio` are the same collections relabeled by audience. Within one grid, "Hiker" and "Traveler" both point at `travel-ready`, and 5 of 7 tiles go to a collection while 2 go to the quiz in identical styling. Merge.
- Two `section-faq` on the PDP (one deleted in Sprint 1's gate).
- `section-icons-row` identical on home and PDP.
- `section_product_features` re-covers `pdp_benefits` / `pdp_compat` / `pdp_specs`, and reads "UNIVERSAL COMPAT**A**BILITY".
- One `apps` section (`1763423954672c8f0a`) has **no blocks at all**.

**C. Fix narrative order.** Home runs hero → brand statement → use-cases → **founder story again** → compare → tour → use-cases again → discount promo → Sportsbox → icons → community → quiz. A first-timer gets Paul's origin story **twice** before anything helps them choose; the two use-case grids are split by three unrelated sections; a hard "GET A FREE GPOD NOW" promo interrupts the brand arc; and **the quiz is dead last**.

Proposed: hero → merged use-case grid → compare → **quiz CTA** → one founder
section → tour → Sportsbox → trust icons → offer (demoted to a banner) →
newsletter last.

**D. Content that contradicts its placement.**
- **"Pairs well with" never surfaces the GPUCK** — the block is keyed `p_gpuck` but points at `gpod-caddy`. Customer-insights names Caddy↔GPUCK confusion explicitly; the section built to fix it omits the product.
- **Compatibility and FAQ blocks are static, not metafield-driven**, so iPhone/Android/tablet/GoPro blocks and "GPOD vs GPOD X vs GPOD Mini" Q&As render verbatim on the Caddy, Connect 2.0, and the $899.99 B2B POS Display.
- **`templates/page.json` appends a cold Contact form** to every default-template page — Privacy Policy, Refund Policy, Terms, About Us, On Tour.

**E. Collection pages.**
- `bundles` has **no toolbar** — no pills, no compare, no quiz — on the page where "which bundle?" help matters most.
- `all-products` has `main` **disabled** with the grid hardcoded to `frontpage`; editing the collection in admin does nothing.
- `accessories` and `bundles` have `collection.image: null` → no hero at all.

**F. Two SKUs are mis-positioned, and it isn't a design problem.**
- **Pauly P has 1 unit in stock** and is flagged `pre-order`. My first read blamed merchandising for its 84 orders against GPOD's 5,717 — that was wrong. It isn't buried, it's unbuyable. Honest scarcity messaging is available here today (`inventoryPolicy: DENY`).
- **Pocket G is live with 38 units** — not "coming soon" as CLAUDE.md says. But it's missing from `monopods` and `tripods-bases`, from the menu, from the quiz's candidate list, and from the compare picker, whose `sections/compare-table.liquid` still references the dead handle `gpod-anywhere-tripod`. The Liquid includes candidates only `if p != blank`, so it fails silently. A sellable product invisible to every discovery path we built.

**G. Copy discipline.** No "Pauly D"/"Paulie" errors exist in the theme's own copy — that misnaming comes from customers. GPOD capitalization is clean. Remaining: "G-Bundle's" → "G-Bundles", "COMPATABILITY", stray capitals in the PDP icon row. Two unsourced-but-specific claims need substantiation before they're defended publicly: **"75,000+ golfers"** and **"magnets hold devices up to 3.5 lbs"**.

---

## 8. Sprint 5 — AOV: Bundles & Attach

**Goal:** raise AOV without touching traffic.
**Primary metric:** AOV $109.24 → $119 (≈ **+$69K/yr**).

| | Orders | AOV |
|---|---|---|
| GPOD solo | 5,717 | $87.91 |
| **G Bundle 2 (X + Base)** | 1,147 | **$141.34** |
| **G Bundle 3 (Pauly P + Base)** | 196 | **$184.73** |
| Base 2.0 (solo attach) | 1,503 | $42.75 |
| GPUCK w/MagSafe | 1,051 | $20.13 |

- **Tell the bundle savings story.** All three bundles already carry `compare_at_price` exactly equal to the sum of components (Bundle 1: $134.99 vs $169.98; Bundle 2: $154.99 vs $189.98; Bundle 3: $204.99 vs $219.98), so Shopify's strike-through and "Save $X" badge render automatically. What's missing is copy that spells out "buy separately for $X" on the PDP.
- **Make `pdp-pairs-with` transactional.** "Add it to your setup →" is a plain `<a href>` to the accessory's own PDP (`sections/pdp-pairs-with.liquid:39,57`) — it restarts the decision instead of completing it.
- **Cart drawer cross-sell.** `snippets/site-cart.liquid` has no cross-sell slot of its own; it depends entirely on the One Click Upsell app having offers configured. Verify that, then add a native "Complete your setup" card for Base 2.0 / GPUCK / Caddy.
- **Build-a-bundle** (Peak Design pattern, already researched). Note a Fast Bundle app is installed and idle — retire or use it.
- **Reactivate the GWP banner as a measured test.** `templates/index.json:132-182` holds a fully written "GET A FREE GPOD" offer, `disabled: true`, with no confirmed discount rule behind it. Don't flip it blind.
- **Gifting.** `page.fathers-day.json` was deleted as debt with nothing evergreen replacing it — while its sibling seasonal URL still pulls 2,876 paid sessions. A $74.99–$199.99 golf accessory is squarely gift-range.

---

## 9. Sprint 6 — Capture & Retention

**Goal:** stop renting 100% of demand at 0.61% conversion.
**Primary metric:** email-attributed revenue <1% → 5% (≈ **+$37K/yr**, compounding).

- **Quiz → email.** `sections/product-finder.liquid` has **zero** `<input type="email">`; the result step offers only "See the [Product]" / "Compare all models" / "Start over". This is the highest-intent, most self-identified moment on the site, capturing nothing. Every completion is a lead thrown away.
- **Back-in-stock alerts** — two mechanisms are already installed (`snippets/notification-form.liquid` + a dedicated app embed). Point them at the SKUs that actually run dry: Pauly P (1 unit), Base 2.0 (11), G Bundle 3 (oversold).
- **Post-purchase onboarding** — setup video, remote pairing, Sportsbox redemption, and the stuck-extension fix (the #1 support complaint). Cuts support load, protects reviews, seeds accessory repurchase.
- **Abandoned cart + browse flows** — absent today.
- **Test capture placement carefully.** An aggressive mobile popup can suppress ATC. Ship any interstitial as an A/B test against the north-star metric, never default-on.

---

## 10. Measurement

Re-run at the end of every sprint; log deltas in the CLAUDE.md decision table:

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

**Guard rails:** watch mobile ATC rate as primary, but hold cart→order (47.4%)
and checkout→order (49.6%) flat. Those are healthy; a change that lifts ATC while
damaging them is not a win.

---

## 11. Risks

| Risk | Mitigation |
|---|---|
| Publishing regresses a $187K/90d store | Rollback theme, staged publish, pre-declared revert trigger |
| Demo content reaches customers | Sprint 1 pre-flight grep gate |
| Perf work breaks the live home page | Remove Section Store blocks one at a time, verify at 390px between each |
| Email popups suppress ATC | Ship as A/B test against the north-star metric |
| Attribution noise from paid scale | Fix CAPI dedup in Sprint 1, before any CVR claim |
| Sprints read as "done" without proof | No sprint closes until its metric has 7 days of post-ship data |

---

## 12. Scope notes

**What this plan deliberately doesn't do:** no new sections (13 exist, 17 on the
PDP); no cart or checkout mechanics (both healthy on mobile); no desktop-first
work (13.7% of sessions, already at 3.45%); no new apps before Sprint 5.

**Known gap in this audit:** the component / design-system pass — token
consistency, container alignment across custom sections, button-variant count,
tap targets under 44px, breakpoint drift between `gpod.css` and Modular — did
**not** complete. Every other finding here is verified; that one is simply
missing, and should be run before Sprint 2's CSS work begins rather than
assumed clean.
