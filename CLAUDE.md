# CLAUDE.md — GPOD Golf Website Redesign (July 2026)

## What this project is

Ground-up redesign of **gpodgolf.com** (Shopify store "GPOD GOLF"). GPOD sells magnetic phone monopods/tripods and accessories for filming golf swings. Everything is on the table: home page, collection pages, PDPs, navigation, support content, information architecture.

This repo contains a **Shopify Online Store 2.0 theme** at the root (standard Shopify CLI layout: `assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/`).

## Current state

- The initial commit imports the **live theme as of 2026-07-06** (theme export "Copy of Modular- Paul Dev") as the working baseline. Base theme: **Modular v4.1.3 by Presidio Creative**.
- Nothing in the baseline is sacred — it exists so we can run/preview immediately and replace it piece by piece.
- Development branch: `claude/gpod-golf-redesign-dmyfe9`. Never push directly elsewhere.

### Decision log (append, never delete)

| Date | Decision |
|---|---|
| 2026-07-06 | Repo initialized from live theme export; redesign requirements derived from customer inquiries (see `docs/customer-insights.md`). |
| 2026-07-06 | New IA adopted (see `docs/information-architecture.md`): 4-item header nav (Shop meganav by product type / Find Your GPOD use-case dropdown / Support / About) + 3-column footer. Created in Shopify (additive, live site untouched): collections `monopods`, `tripods-bases`, `on-the-course`, `indoor-simulator`, `coaching-studio`, `travel-ready` (all manual); menus `main-menu-v2`, `footer-{shop,support,company}-v2`. Theme wired to them via `header-group.json`/`footer-group.json`. Old INDOOR/OUTDOOR collections deprecated for nav. |
| 2026-07-07 | Theme build complete: 8 new native sections (compare-table, pdp-specs, pdp-compatibility, pdp-how-to, support-hub, product-finder, collection-toolbar, home-use-cases); 3 template rewrites (index, product, collection) + 3 new pages (compare, support, product-finder-quiz); 11 metafield definitions + product data; 6 collections + 4 menus created in Shopify; PageFly/seasonal/IE11 cleaned out; assets (gpod.css 15KB + gpod.js 6.4KB) added. All JSON schema valid, Liquid syntax correct. No critical regressions. |
| 2026-07-07 | Home page brand layer added (user feedback: "seems kind of naked... very little substance outside the purchase paths"). New native `home-brand-statement.liquid` + reuse of Modular sections for: founder story (Paul Park, from live About Us page), tour credibility band (real roster from /pages/on-tour: Niemann, Recari, Kim, Tan, Gankas, Leishman), Sportsbox partnership block, community newsletter. All copy sourced from existing store content — nothing invented. Preview theme "GPOD GOLF -July 2026-Repo" (id 154401538216) created on store for testing. |
| 2026-07-07 | Paul Park feedback round implemented: native `home-hero.liquid` (video/image toggle, mobile media slots, star trust row "75,000+ golfers", dual CTAs Shop All + Quiz); founder letter V1 (signed) via letter layout on brand-statement; GPODDER identity grid (home-use-cases extended to 8 blocks + compact style); collection header bug fixed (hardcoded ALL GPOD PRODUCTS overlay removed, dynamic collection.image banner enabled) + 4 use-case collection template suffixes with lifestyle band + empty testimonial scaffolds (real quotes to come from Fera — never invented); Apple-style interactive compare picker (12-SKU JSON payload, per-column selects, ?models= deep links) + "Compare models" link on PDP specs; new `pdp-benefits.liquid` (outcome-led) + `pdp-pairs-with.liquid` (Complete your setup, self-hiding when block = current product); FAQ page rebuilt (12 accurate pre-purchase Q&As). `docs/assets-needed.md` = Paul's shot list. Fera reviews app blocks confirmed live on PDPs. |
| 2026-07-09 | Round 3: new `pdp-ways-to-use.liquid` (Huckberry "Ways to Wear It" adapted — scroll-snap 4:5 lifestyle cards, self-hiding until photos added; wired into product.json with 4 pre-labelled slots). Peak Design build-a-bundle flow researched and documented (`docs/research-peak-design-bundle-flow.md`): buy-box radio toggle, tag-driven accessory eligibility, native line items + automatic discount — recommended pattern for a future GPOD "Build your setup". Image uniformity audit via headless Chromium (375px + 1280px, 5 pages): no overflow/distortion found; added `gpod.css` guards (max-width on all gpod-section imgs, contain rule for wide logo lockups in split-content). Note: Modular's AOS scroll animations make below-fold sections screenshot as blank — scroll-through required for full-page captures. Chromium-through-proxy requires `--ssl-version-max=tls1.2` + CA in NSS store. |
| 2026-07-07 | Perf/a11y/SEO audit completed: heading hierarchy OK, form accessibility (fieldsets + labels), ARIA labels where needed, skip link present, color contrast OK, lazy loading on images, responsive srcsets, JSON-LD present (Modular's header.liquid), no render-blocking CSS, JS deferred. Theme is production-ready from accessibility & SEO perspective. Awaiting deployment via Shopify CLI or admin; Lighthouse audit deferred to post-deployment. |

## The "why" behind the redesign — read this first

`docs/customer-insights.md` analyzes ~30 real customer inquiries. The dominant findings, which every page we build must answer to:

1. **Customers can't tell products apart** (GPOD vs GPOD X vs Pauly P; Travel vs Studio; bundle differences). We need comparison tables, full specs (weight, lengths, shaft diameter, stability, bag-fit), and a product finder — surfaced prominently, not buried.
2. **PDPs don't answer pre-purchase blockers**: phone compatibility (MagSafe vs Android plates, thick cases, iPad, GoPro), what's in the box, how the twist-lock extension works, what the remote does.
3. **No support/guides hub**: setup videos, remote pairing, troubleshooting (stuck lower extension is the #1 complaint), Sportsbox subscription redemption, replacement parts.
4. **Navigation should also be use-case driven**: on-course / indoor & sim / coaching & studio / travel — customers describe situations, not product types.

When designing any page, ask: *does this help a confused customer choose the right product and use it successfully?*

## Store facts

- Domain: gpodgolf.com · Currency: USD · Platform: Shopify (Shopify plan)
- ~17 active products: 3 monopods (GPOD $109.99, GPOD X $129.99, Pauly P $159.99), 2 tripods (Travel $74.99, Studio 2.0 $199.99), Base 2.0, accessories (GPUCK, Connect 2.0, Caddy, G Plate, Mini), 3 G-Bundles, a Sportsbox bundle, "Pocket G" coming soon.
- Full catalog table with handles/prices: `docs/customer-insights.md` (bottom).
- The Shopify MCP tools in Claude sessions can query the live store (products, orders, collections) — prefer live data over assumptions when specifics matter.

## Repo structure

```
CLAUDE.md              ← you are here; keep it current
docs/                  ← project docs, research, decisions
  customer-insights.md ← FAQ analysis + catalog snapshot + redesign priorities
  information-architecture.md ← nav trees, collection matrix, menu/collection handles
assets/ config/ layout/ locales/ sections/ snippets/ templates/   ← the theme
```

## Baseline theme notes (technical debt inherited from live)

- **PageFly pollution**: `sections/pf-*.liquid`, `templates/page.pf-*.json`, `layout/theme.pagefly.liquid`, `assets/pagefly-*.css` are app-generated PageFly pages (incl. the product-finder quiz). **Do not build new work with PageFly** — rebuild those experiences as native sections, then delete the pf-* files.
- One-off/seasonal templates exist (`page.fathers-day.json`, `page.fourth-july.json`, `cart.discountyard.liquid`, giveaway/landing pages) — candidates for removal during redesign.
- `assets/theme.css` (~426KB) and `theme.js`/`theme.dev.js` are the Modular theme's compiled bundle — there is no source/build pipeline in this repo. Small tweaks: prefer new, separate CSS/JS assets or section-scoped `{% style %}`/`{% javascript %}` over editing the compiled bundle.
- Sections named `section-*.liquid` are Modular's reusable homepage-style sections; `ss-*.liquid` are third-party ("Section Store") add-ons.

## Conventions

- **Online Store 2.0 patterns**: JSON templates + sections with `{% schema %}`; merchant-editable settings over hardcoded content wherever a non-developer might reasonably want to change copy/images.
- New sections: `kebab-case.liquid`, prefixed by area when specific (e.g. `pdp-compatibility.liquid`, `home-hero.liquid`); shared partials go in `snippets/`.
- Keep Liquid logic light; no external CDNs for critical assets; images via Shopify CDN with responsive `image_url` sizes.
- Copywriting: plain answers to real customer questions (see insights doc); always use canonical product names (it's "Pauly P", never "Pauly D"/"Paulie").
- Accessibility and mobile-first are non-negotiable — most golf-course traffic is on phones.

## Workflow

- Branch: work on `claude/gpod-golf-redesign-dmyfe9`; commit in small, described steps; push with `git push -u origin <branch>`.
- Local preview (when Shopify CLI + store auth are available): `shopify theme dev`. Lint with `shopify theme check` if installed.
- Big design directions (IA changes, template rewrites, visual language): document the decision in the log above **before** the implementing commit.

## Maintaining this file (required)

CLAUDE.md is the project's source of truth for context and conventions. Whenever you (human or Claude):
- make an architectural/design decision → append to the decision log;
- add/remove/restructure major files → update *Repo structure*;
- change a convention → update *Conventions*;
- learn something new about customers or the catalog → update `docs/customer-insights.md` and, if it changes priorities, the summary here.

Keep this file under ~150 lines: link out to `docs/` for depth instead of growing it.
