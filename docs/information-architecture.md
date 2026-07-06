# Information Architecture — Navigation & Collections

Decided 2026-07-06. Grounded in `docs/customer-insights.md`: customers need (a) a clear way to compare products of the same type, and (b) paths that match how they describe their situation (on-course, indoor, coaching, travel).

## What was wrong before

- Main menu was **9 flat links**; the only shop entry was "Shop" → `/collections/frontpage` (all 22 products in one grid). No product-type or use-case navigation existed.
- INDOOR and OUTDOOR collections each contained 17 products — effectively "everything", so they differentiated nothing.
- Existing helpful content (Product Finder Quiz, **Compatibility Guide** page, Instructions page) was buried or absent from the nav.

## New navigation (header menu `main-menu-v2`)

The redesigned theme's header points at `main-menu-v2` (`sections/header-group.json` → `menu_list`). The live theme still uses `main-menu`, so the live site is unaffected until the redesign is published.

```
Shop  → /collections/frontpage           (meganav, 5 columns)
├─ Monopods → /collections/monopods
│    GPOD · GPOD X · GPOD Pauly P
├─ Tripods & Bases → /collections/tripods-bases
│    GPOD Travel · GPOD Studio 2.0 · GPOD Base 2.0
├─ Bundles → /collections/bundles
│    G Bundle 1: GPOD + Base · G Bundle 2: GPOD X + Base · G Bundle 3: Pauly P + Base · Travel + Sportsbox 3D
├─ Accessories → /collections/accessories
│    GPUCK w/MagSafe · GPOD Connect 2.0 · GPOD Caddy · GPOD G Plate · GPOD Mini
└─ Shop All → /collections/frontpage

Find Your GPOD  (dropdown)
├─ Product Finder Quiz → /pages/product-finder-quiz
├─ Compatibility Guide → /pages/gpod-compatibility-guide
├─ On the Course → /collections/on-the-course
├─ Indoor & Simulator → /collections/indoor-simulator
├─ Coaching & Studio → /collections/coaching-studio
└─ Travel Ready → /collections/travel-ready

Support  (dropdown)
├─ Instructions & Manuals → /pages/instructions
├─ FAQ → /pages/faq
├─ Register Your GPOD → /pages/register
├─ Shipping & Returns → /pages/refund-policy
└─ Contact Us → /pages/contact-us

About  (dropdown)
├─ About Us · On Tour · Swing Tips (/blogs/news) · Corporate Sales
```

Theme mechanics: Modular's meganav activates when the menu has 3 levels; "Shop" (2 sublevels) renders as a meganav, the other top items (1 sublevel) render as dropdowns. Top items with url `#` are expand-only. On mobile every parent gets a collapsible arrow.

## New footer (3 menu columns)

`sections/footer-group.json` blocks: logo · **Shop** (`footer-shop-v2`) · **Support** (`footer-support-v2`) · **Company** (`footer-company-v2`) · newsletter. Support column adds the Compatibility Guide; Company holds About/On Tour/Swing Tips/Corporate Sales/Affiliate/Privacy/Terms. (Footer section max is 5 blocks — exactly full.)

## Collection structure

Two complementary axes; every product lives in ≥1 of each. All new collections are **manual** (17 products — precision beats automation; product tags/types in the store are too inconsistent for reliable smart rules).

**By product type** (mutually exclusive):

| Collection | Handle | Products |
|---|---|---|
| Monopods | `monopods` | GPOD, GPOD X, Pauly P |
| Tripods & Bases | `tripods-bases` | Travel, Studio 2.0, Base 2.0 |
| Bundles *(pre-existing)* | `bundles` | G Bundles 1–3, Sportsbox bundle, legacy bundles |
| Accessories *(pre-existing, smart: tag `accessories`)* | `accessories` | GPUCK, Connect 2.0, Caddy, G Plate, Mini, … |

**By use case** (overlapping, curated):

| Collection | Handle | Products |
|---|---|---|
| On the Course | `on-the-course` | GPOD X, Pauly P, GPOD, G Bundles 1–3, Mini, Caddy, G Plate |
| Indoor & Simulator | `indoor-simulator` | Base 2.0, Studio 2.0, Travel, Sportsbox bundle, G Bundles 1–3 |
| Coaching & Studio | `coaching-studio` | Studio 2.0, Pauly P, Sportsbox bundle, G Bundle 3 |
| Travel Ready | `travel-ready` | Travel, GPOD X, Mini, Sportsbox bundle |

Kept as-is: `frontpage` ("All GPOD Products") as the shop-all target. Deprecated for navigation (not deleted; live site still references them): `indoor`, `outdoor`, `apple-magsafe-compatible`, seasonal/one-off collections (PGA Show, Five Iron, Father's Day, Memorial Day, Homepage, Mothership).

**Maintenance rule:** when a product launches (e.g. Pocket G), add it manually to its type collection and every applicable use-case collection, and to the meganav if it's a core product.

## Shopify objects created (2026-07-06, additive — nothing live was modified)

- Collections: `monopods`, `tripods-bases`, `on-the-course`, `indoor-simulator`, `coaching-studio`, `travel-ready` (published; visible on `/collections` list page but not linked from the live nav).
- Menus: `main-menu-v2`, `footer-shop-v2`, `footer-support-v2`, `footer-company-v2`.

## Deliberately deferred (needs pages/products that don't exist yet)

- **Compare All Models** page (spec comparison table) — link into "Find Your GPOD" and the Shop meganav once built. High priority per insights doc.
- **Replacement Parts** collection — needs part SKUs (remote, knobs/screws, magnet) created as products first.
- **Sportsbox activation guide** — add under Support once the page exists.
- Retitle/clean `frontpage` collection (handle is legacy; low stakes).
