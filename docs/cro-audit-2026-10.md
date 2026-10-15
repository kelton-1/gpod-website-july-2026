# CRO sweep — Oct 13–15, 2026

Live sweep of gpodgolf.com on mobile (390px) and desktop (1440px): home, the three monopod PDPs, a
pre-order bundle PDP, `/collections/frontpage`, Core Products, Bundles, compare, quiz, support, FAQ
and the cart drawer, plus 30-day ShopifyQL analytics (Sep 13–Oct 12 vs Aug 14–Sep 12). All 80
internal links checked returned 200. The `/collections` fix is separate (decision log, 2026-10-14).

## Round 1 — built, waiting to publish

Theme **"Live + collections fix + CRO round 1 (Oct 14)" `189086204072`** = live + the `/collections`
fix + the items below. Each was checked on that preview.

| Fix | Where |
|---|---|
| "Pre-order" badge on product cards for the live `preorder-oct` tag. Base 2.0 and the three Base bundles looked in stock on grids; on `/collections/frontpage` they rank as high as #4 (best-selling sort) under "Ships within 1 business day". | `snippets/product-grid-item.liquid` |
| Quiz result cards say "Pre-order · Ships before Oct 30" (date from `gpod-preorder-ship`). Every "Both" answer recommends a Base bundle. Back button no longer shows on step 1. | `sections/product-finder.liquid` |
| PDP: the empty line under Add to Cart now reads "Ships within 1 business day · 14-day returns · 1-year warranty" (the cart's own wording); hidden in pre-order buy boxes. | `templates/product.json`, `snippets/gpod-preorder-ship.liquid` |
| Support hub: "Remote pairing & use" and "Activate Sportsbox 3D" cards open the support page filtered to their answers (they pointed at pages without them). | `templates/page.support.json` |
| FAQ: "about 8 ounces — a sleeve of 6 golf balls" → "under 5 ounces, about the same as a sleeve of golf balls". Heading "FAQ'S" → "FAQs". | `templates/page.faq.json` |
| "Recently viewed products" heading no longer shows over nothing for first-time visitors. | `sections/section-recently-viewed-products.liquid` |
| Published two finished perf fixes from main: footer country list drops 237 flag images; hero poster 1600w → 1200w. | `snippets/cross-border.liquid`, `sections/home-hero.liquid` |

## Needs a person (not theme code), by impact

1. **Meta campaign `120215602735900314` sends traffic that never shops.** Sep 13–Oct 12: 9,463 human
   sessions (41% of human sessions), **0 add-to-carts, 0 checkouts, 98% bounce, 0.06 s average
   session**, all to `/`, since at least Jun 29. Likely link prefetch or accidental taps. Check its
   spend and placements in Ads Manager. It also distorts every site metric: with it excluded, mobile
   add-to-cart is 4.90% vs desktop 6.91% and conversion 2.50% vs 3.27% — a 1.3–1.4× gap, not the
   2.6× in `docs/funnel-baseline.md`.
2. **Checkout completion fell from 63.8% to 52.7%** (reached checkout → order), on mobile and desktop
   alike, from the week of Sep 14 — before pre-order started. US 73% → 64%. Non-US shoppers are 28%
   of checkouts but complete 23%. Look at what changed around Sep 14: shipping rates, checkout apps,
   payment methods, duties.
3. **Zipify "Bundle & Save" add-on overcharges and hides pre-order** (GPOD, GPOD X, Pauly P PDPs).
   Ticking Base adds it at full $59.99 with no discount — GPOD X + Base = $189.98 vs the $154.99
   bundle — and silently turns the order into a pre-order. On the X + Base bundle page it offers a
   Connect 2.0 the bundle already includes. Fix in Zipify: drop Base while it's on pre-order (or
   point to the bundle), and don't call it "Bundle & Save" without a discount.
4. **Paid Meta campaign `120241379219320060` lands on the pre-order GPOD X + Base page**
   (`/collections/frontpage/products/g-bundle-two…`): 2,169 landing sessions, 87% bounce, 1.11%
   conversion. Point it at GPOD X while Base is on pre-order.
5. **Klaviyo 15%-off popup** opens ~8 s into every desktop page, including over the open cart drawer,
   covering Checkout. Suppress it once the cart has items. On mobile the Oct 13 sweep saw no popup
   in three sessions; the Oct 15 preview run did — check its device targeting.
6. **Bundles collection** contains Base 2.0, Connect 2.0 and G Plate (3 of 7 aren't bundles), and its
   heading still says "ALL G-BUNDLES". Fix membership and title in admin.
7. **GPOD weight disagrees with itself:** 4.8 oz in the `gpod.weight` metafield (PDP, compare), 4.4 oz
   in the SEO description and the Sep 2 log decision (Brand Playbook). Pick one; the FAQ now says
   "under 5 ounces", which is true of both.
8. **Three review counts:** home band 445 (computed live from Fera metafields), cart drawer 440
   (hardcoded Oct 9 in `snippets/site-cart.liquid`), Fera "Customer Reviews" widget on the home page
   629 (includes store reviews).
9. **Hero CTA (to-do #3):** `/collections/frontpage` is the best-converting high-traffic landing page
   (4.23%). With pre-order badges now on the grid, consider testing before moving the CTA.

## Theme ideas for a next round (not built)

- Cart: when GPOD X and Base are both in the cart, offer the bundle (saves $34.99). Orders average
  1.10 items and at most 8% include an accessory — the dormant "Complete your setup" module fits.
- `/collections/frontpage` on mobile: the hero collage pushes the first product ~1,200 px down.
- PDP on mobile: add the existing `gpod.best_for` line under the title; lead with an in-use photo.
- Tap targets under 44 px: mobile header search (19×25), account and cart (32×32); cart drawer
  remove/±/close (30–36 px); the drawer's close X overlaps the trust icon when scrolled.
- PDP FAQ asks "GPOD X vs GPOD Magsafe" and "GPOD vs GPOD X"; links use legacy
  `/collections/frontpage/products/…` URLs; nothing on Pauly P.
- Page weight 4.5–8 MB: Google tags loaded 4–5× (~830 KB), Zipify script on pages without its
  widget, PDP Instagram feed ~750 KB, 2000 px add-on thumbnails shown at 132 px.
- Intermittent layout shift from the PDP thumbnail strip (CLS 0.12–0.21 in some runs).
- Compare and FAQ pages have no H1.
