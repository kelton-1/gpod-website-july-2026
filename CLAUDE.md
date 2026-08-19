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
| 2026-08-13 | PDP gallery scroll bug fixed (Paul: "when I scroll on any of the PDPs the image carousel does this"). Cause: the sticky-media pass stuck `.product__images__container` (slider only) while its sibling thumbnail rail stayed in flow, so the pinned image slid down over the thumbnails — measured 129px of travel on Pauly P at 1440x900. Fix in `assets/gpod.css`: the sticky unit is now `.product__images` (slider **and** rail together, `align-self: start`), and the media frame is capped to `100vh − header − rail` so the rail can never be stranded below the fold; frames switched from padding-top ratio boxes to the `aspect-ratio` property so they are clampable, with `--aspect-ratio` now also emitted on video/model wrappers (`snippets/media.liquid`). Sticky + cap only apply at ≥1024px wide and ≥700px tall; below that the media stays in flow. **Repo drift discovered:** the preview theme was edited directly after 2026-07-09, so files there (gpod.css 25KB→126KB, plus `snippets/product.liquid`, `snippets/media-thumb.liquid`, `sections/product.liquid`, `templates/product.json`, `assets/gpod.js`, `layout/theme.liquid`) are ahead of git. `gpod.css` was resynced in its own commit; the rest still needs a sync. Theme writes without Shopify CLI: `stagedUploadsCreate` → POST the file to GCS → `themeFilesUpsert` with `body: {type: URL}`. Note `*.shopifypreview.com` links expire (410) — use `https://gpodgolf.com/…?preview_theme_id=154401538216`, and pace requests or Cloudflare answers 429. |
| 2026-08-13 | Repo resynced with the preview theme (248 files pulled from theme 154401538216 via `themeFiles`): 55 modified, 26 new, 0 deleted (nothing had been removed from the theme; the July PageFly/seasonal cleanup is confirmed done on both sides — no `pf-*` or seasonal files on the theme or in git). Git is now the mirror of what the preview serves. New from the un-committed theme work: sections `collection-hero-split`, `gpod-explore`, `gpod-proof-band`, `gpod-reviews`, `gpod-stat-band`, `page-landing-hero`, `section-partner-marquee`; snippets `gpod-cutout-url`, `gpod-proof-icon`, `gpod-trust-icon`; `templates/page.paid-landing.json`; 15 `assets/gpod-cutout-*.png` cutouts. Heavily reworked: `templates/index.json`, `templates/product.json`, PDP buy box (key specs, model picker, collapsible description), `snippets/navigation.liquid` (drilldown), `snippets/shop-bar.liquid`, `sections/header.liquid` (floating card), collection templates, `assets/gpod.js`. JSON templates now carry Shopify's generated `/* */` header, so `json.load` needs that stripped. Going forward: commit before editing the theme, or resync first — the theme is writable by anyone with admin access. |
| 2026-08-19 | Round 4 (frontend interaction layer): **collection compare tray** — a Compare checkbox on every card in the grid (injected from the DOM in `gpod.js`, so the vendor grid snippet stays untouched and ajax filter/sort/pagination re-decorate), picks held in `sessionStorage` under `gpod:compare` so they survive navigation between collections, capped at 3 (merchant-settable 2-4), tray deep-links to `/pages/compare-gpod-models?models=`; **focused compare view** — `?models=` now hides the columns the shopper did not pick (it used to fill the first columns and leave the rest of the lineup beside them) with a "Show all models" restore, and spec rows count only visible columns before hiding themselves; **support hub instant search** — filters guide cards and troubleshooting entries on question *and* answer text, live count, no-results state linking to `/pages/contact-us`, `?q=` deep link (so we can link straight to the stuck-extension fix, our top support driver). Both new features hang off existing sections (`collection-toolbar`, `compare-table`, `support-hub`) — no new section files. **Branch hygiene:** this branch was first cut from `a17fd95` (pre-resync) and had to be restarted from `claude/pdp-carousel-scroll-fix-aewlag`; a drafted `pdp-sticky-bar.liquid` was dropped on discovering `snippets/shop-bar.liquid` already does that job better. Check for newer branches before starting a round — `git fetch --all` first. **Theme write shortcut:** the GitHub repo is public, so `themeFilesUpsert` with `body: {type: URL, value: raw.githubusercontent.com/<owner>/<repo>/<sha>/<path>}` deploys straight from a pushed commit — no `stagedUploadsCreate` round-trip. Verify with `checksumMd5` from `theme.files`, and compare it against the branch *before* writing, to catch theme-side edits. **Storefront throttle:** after the first page load from this IP the storefront answers 429 "Verifying your connection" for several minutes — fresh contexts, realistic UA and `--disable-blink-features=AutomationControlled` do not help. Browser checks must therefore do every assertion in ONE navigation per page, taking both viewport screenshots by resizing rather than reloading. |
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
