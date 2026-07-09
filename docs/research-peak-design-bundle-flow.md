# Research: Peak Design's "Build a Bundle" Flow

*Researched 2026-07-09 against peakdesign.com (Pro Tripod PDP, live HTML + rendered page). Peak Design runs Shopify **Hydrogen** (headless React/Remix on Shopify Oxygen, shopId 29861172) — their front end is custom, but the underlying mechanics translate directly to a Liquid theme. Claims marked **[inferred]** were deduced from page state rather than observed directly.*

## What they built

### Entry point: inside the buy box, not a separate page
The flow lives directly in the PDP purchase panel as a **radio toggle above the price**:

> ( • ) **Buy the Pro Tripod**
> ( ) **Build a Bundle** — *Buy this with 2 accessories and save* — **10% Off**

- No separate "bundle landing page" drives the flow (their `/collections/bundles` "Complete Kits" page is currently empty). The PDP *is* the funnel — you meet the offer at the exact moment you're deciding on the hero product.
- The 10% badge is rendered in green next to the option — the discount is visible **before** any interaction.

### The picker
Selecting "Build a Bundle" expands an accessory picker in place (client-rendered):
- The customer keeps the hero product and chooses **2 accessories** from an eligible list.
- Eligibility is **tag-driven**: eligible products carry a `photo_gear_bundle` product tag in the store data (91 tagged products in the page state). The picker is populated by that tag, not hand-curated per PDP. **[inferred from state]**
- Products in the state also carry per-product hooks (`bundleUpsell`, `addToCartOverride`, `bundleMessage` metafields — all null on this product) that let them override behavior per product without new code. **[inferred]**

### Pricing & cart mechanics
- Their cart is the standard **Shopify Storefront Cart API** (cart JSON with `lines`, `discountCodes`, `discountAllocations` visible in page state).
- No third-party bundle app markers anywhere (no Rebuy, Fast Bundle, Shopify Bundles transform, etc.).
- Therefore the bundle is almost certainly: **hero + 2 accessories added as 3 normal line items**, with a Shopify **automatic discount** ("buy X + 2 tagged items → 10% off") applying at cart level via `discountAllocations`. **[inferred — most consistent with the observed cart schema and absence of bundle-app code]**
- Consequences of that design worth copying:
  - Line items stay individually editable/removable in cart (no opaque "bundle SKU").
  - Inventory tracks per real product.
  - The discount math lives in Shopify admin (Discounts → automatic), not in theme code — merchandising can retune "2 accessories / 10%" without a deploy.

## What GPOD should copy vs. skip

### Copy
1. **The buy-box radio toggle** — "Buy the GPOD X" vs "Build a G-Bundle · pick 2 add-ons · save 10%". It's the highest-leverage part of their design: the offer meets the buyer at decision time, with the discount visible pre-click.
2. **Tag-driven eligibility** — tag accessories (`bundle-eligible`: GPUCK, Caddy, G Plate, Connect 2.0, Base 2.0, Mini) and drive the picker off the tag. One list to maintain.
3. **Real line items + automatic discount** — no bundle app, no variant explosion. Shopify's native "Amount off products" automatic discount can express "spend includes 1 monopod + 2 accessories → 10% off".
4. **Discount transparency** — show the % and the computed bundle price before add-to-cart.

### Skip / adapt
- **Headless stack** — irrelevant to us; the same UX is buildable as a Liquid section + small JS (we already have the pattern from the compare picker: server-rendered payload of eligible products, client renders the picker).
- **Their current empty "Complete Kits" page** — GPOD's existing fixed G-Bundles serve that job better today (they're merchandised products with their own PDPs). Keep both: fixed G-Bundles for people who want a decision made for them; build-a-bundle for people who want control.
- GPOD's dormant **"Mix and Match"** (`collection-bundle`) and **`fastbundles`** pages are leftovers of a bundle-app trial — retire them when a native flow ships to avoid two competing bundle UIs.

## Recommended GPOD implementation (future round, ~1 dev-day + admin setup)

1. **Admin**: tag accessories `bundle-eligible`; create automatic discount "G-Bundle Builder: 10% off when cart contains ≥1 monopod/tripod + ≥2 tagged accessories" (needs a careful test matrix so the discount doesn't fire on unintended carts; a fallback is a discount code auto-applied by the theme on the bundle path).
2. **Theme**: new `pdp-bundle-builder.liquid` in the buy box (or directly under it): radio toggle → expands 2 accessory slots, each a select/tile-list fed by a server-rendered payload of tagged products (title, price, image, variant id) — same payload pattern as `compare-table.liquid`.
3. **JS** (extend `assets/gpod.js`): track slot selections, show computed bundle price (sum × 0.9), on submit `POST /cart/add.js` with 3 items (`items: [hero, acc1, acc2]`), then open the ajax cart. Line-item property `_gbundle: <id>` on all 3 so cart UI can group them visually. **Verify the automatic discount renders in the ajax cart drawer** (Modular's cart-total-template) — if it only shows at checkout, add a "discount applies at checkout" note.
4. **Measurement**: bundle-path add-to-carts vs. straight add-to-carts; AOV delta.

Open question for Paul/Kelton before building: exact discount rule (flat 10% like PD? tiered — 5% for 1 accessory / 10% for 2? monopods only or tripods too?).
