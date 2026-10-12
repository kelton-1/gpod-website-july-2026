# Tenscope design review — "GPOD - Review" Figma board

**Read 2026-09-30.** Tenscope (credited "Design by Tenscope" in their footer) is the
creative agency redesigning gpodgolf.com. Board:
`figma.com/design/0ACOl1BWpqZ4SppRvtCVeb/GPOD---Review` (link-shared, view only).

The Figma connector was not authorized in the session that wrote this, so the
board was read through the public viewer: the document itself (layers, text,
fonts, colours, spacing, Dev Mode annotations) and every comment thread.
Values below are copied from the file, not estimated from screenshots.

---

## Which frames are current

Edit timestamps in the file settle this. Canvas order is misleading:
"Round 3" sits *left* of "Round 2".

| Frame | Created | Last edited | Status |
|---|---|---|---|
| Option 1 / 2 / 3, Product page options 1–3 | Sep 17 | — | first explorations |
| **Round 2** → HomePage (28:1593) | Sep 22 | **Sep 29** | **current desktop home** — every comment thread is here |
| **Round 2** → Product page option (28:111) | Sep 22 | **Sep 30** | **current desktop PDP** (Pocket G) |
| Round 2 → Homepage v1 (28:974) | Sep 22 | Sep 23 | the dark "FILM YOUR GOLF SWING" alternative; Paul preferred v2 |
| Round 3 (all three frames) | Sep 25 | Sep 25 | a frozen snapshot of Round 2, never edited |
| **mobile** (100:215, 390 px) | Sep 28 | Sep 29 | **home only** — no mobile PDP exists yet |

## The system (what `assets/gpod-ts.css` encodes)

| Token | Value |
|---|---|
| Display type | **Mona Sans** SemiBold 600 (Medium 500 for card titles) |
| Text type | **Inter** 400/500 |
| H1 | 40/40 mobile → 60/60 desktop, −1% tracking |
| H2 | 32 mobile → 48 desktop, −1% |
| Card title | 24/32 |
| Body | 16/24, −1% |
| Kicker | 16 Inter + a 20×8 green-gradient pill |
| Forest | `#143627` (trust cards, tour cards, review band, GPOD column) |
| Charcoal | `#1d1e24` band, `#26272d` card |
| Ink | `#0c0e0a`; muted = ink @ 80% / 60% |
| Surface | `#fafafa` |
| Green CTA | gradient `#8ac664 → #70ad49`, white label, 8 px radius, 20/24 padding, 20 px Inter Medium |
| Radii | 8 (buttons, images) · 12 (cards) · 24 (big bands) |
| Mobile rhythm | 20 px gutter, 40 px section padding, 12 px card gap |
| Desktop rhythm | 80 px gutter (1280 content), 96 px section padding |

## Home page section order (Round 2 / mobile)

1. Floating header card (logo + dark "Menu" pill on mobile)
2. Hero: "Trusted by 75,000+ golfers" pill, H1, copy, full-width Shop Now; trust-card rail
3. Product spotlight card on charcoal
4. Most Popular Products rail
5. Why Golfers Switch → The Breakdown (3 image cards)
6. Built by a golfer for golfers (founder, 5-photo collage)
7. On Tour → In the Bags of the Best + 75,000+ stat card + tour logos
8. What Golfers are Saying (forest review masonry, Load More)
9. The Real Comparison (GPOD vs Others checklist)
10. Closing CTA over photo, fading into a glass-panel footer

## Comment threads (all 20, as of Sep 30)

"GPOD" = the client-side reviewer (purple **P** avatar, presumably Paul); "TS" = Tenscope.
Drive links in the threads are omitted here because this repo is public.

**Home (Round 2 HomePage / mobile)**

| # | By | Comment | State | In the theme? |
|---|---|---|---|---|
| 7 | GPOD | Prefers v2: stronger CTA, trust signals, faster path to purchase. Pocket G may be the wrong product to feature. GPOD / GPOD X, or GPOD X + Base Bundle? | open | spotlight = GPOD X |
| 8 | GPOD → TS → GPOD | "I do not like this header. A cold visitor must know what GPOD is and what problem it solves." TS: copy + background video. GPOD: "copy is way too long; I thought you recommended a still image" | open | still image, shortened copy |
| 9 | GPOD | Hero image must show the monopod in action | open | hero = golfer being filmed by a GPOD |
| 10 | GPOD | "5.0 rating + x number of reviewers" | open | trust card "5.0 rating • +561 Reviews" (design copy) |
| 11 | GPOD | Trust cards need optimising for mobile | open | horizontal snap rail on phones |
| 12 | GPOD | Short "best for" descriptions on product cards; "Best Seller" badge on GPOD X + Base Bundle | open | `gpod.best_for` + per-card badge |
| 13 | GPOD | Outdoor/indoor split (v1) is too fuzzy; most products work in both | open | split not used |
| 14 | TS | Hero narrowed to fit above the fold | — | ✓ |
| 15 | TS | "added" (best-for lines) | — | ✓ |
| 17 | GPOD | Closing photo: "can we have an actual gpod behind the golfer?" | open | closing = Paul Park photo with a GPOD in frame |
| 19 | GPOD (2nd reviewer) | Spotlight copy + price should be **GPOD X – $129.99** | open | ✓ price read live from the product |
| 20 | GPOD (2nd reviewer) | Same on mobile (the button still reads "Buy Pocket G for $129.99") | open | ✓ |

**Pocket G PDP (Round 2 Product page option)**

| # | Comment | State |
|---|---|---|
| 1 | "In action" hero image is not a GPOD product; use Pocket G. Portrait video supplied Sep 28; TS will use it as-is | open |
| 2 | Lifestyle images must show the product properly and match each use-case's copy; overhead putting = Pocket G on a GPOD filming straight down | open (photos supplied) |
| 3 | Show the Pocket G hook (airplane photos supplied) | open |
| 4 | "this looks great" | resolved |
| 5 | Header wording → "Your pocket's new favorite thing. / One tripod. Endless ways to use it." | resolved |
| 6 | Add a section showing Pocket G combined with other GPODs for better angles | open (TS added; photos supplied) |
| 16 | Image missing one arm/piece of the neck | resolved |
| 18 | TS needs a better image for a use case; GPOD supplied options | open |

## Dev Mode annotations (Round 2 PDP, 15)

- Trust bar "moved up for immediate impact for customers trust"
- Gallery: "each image is in this case visible and same size"
- Buy box: **"CTA has to be above the fold. After CTA is no longer visible a sticky CTA is shown at the bottom"** (our `snippets/shop-bar.liquid` already does this)
- "15% banner was removed as asked"; "Product upsell/cross sell dropdown option"; "More shopping options"
- Content: "all about product details" (tabs → accordion), "Added products video section" / "this video could also be shown in carousel up front", "Products in use section", "Quick compare products" + "Option for a comparison page where you can compare more products", FAQs, Related products
- Home: "More like a standard landing page with focus on prominent green CTAs"; founder: "Would need better images for this section"

## What shipped in the theme (2026-09-30)

Nine native sections, one shared stylesheet, one script. See the CLAUDE.md decision
log for the architecture call. Built mobile-first from the 390 px frame; the only
layout departure is the comparison table, re-gridded because the mobile frame runs
it 170 px past the screen edge.

## Still needed from Tenscope / GPOD

- **Tour player photos.** Seven of the eight players in the design (Schauffele, Lydia Ko,
  Cameron Young, Horschel, Amy Yang, Bhatia, Saso) have no photo in Shopify Files.
  The photos are in the Figma file. Upload them, then pick each one in Theme editor →
  Tour players. Until then only Bryson DeChambeau's card renders; imageless cards show
  only in the editor.
- **Founder collage photos** (TS annotation: "would need better images").
- **Glass-panel footer.** Not built; the live footer still follows the closing CTA.
- **Mobile PDP.** Tenscope has not delivered one. The desktop PDP (28:111) should be
  built from the same system once a phone layout is agreed.
- **Header.** The design has Shop / Product Finder / On Tour / FAQ + Shop Now on desktop;
  the theme keeps its drawer-at-all-widths header (2026-09-17 decision).
