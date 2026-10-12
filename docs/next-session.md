# Next session — Tenscope rollout handoff (written 2026-10-01)

> **2026-10-01, later:** the order of work is now `docs/sprint-7-plan.md`. The
> task specs below still apply where that plan points at them. The "replicate as
> designed" direction below is replaced: our theme may change anything, and the
> Figma board is reference only.

Read this, then `docs/tenscope-design-review.md` (the Figma spec + every
comment) and `docs/tenscope/` (layer-level specs + renders of the mobile home
and the product page; no Figma access needed), then the 2026-09-30 / 2026-10-01 rows of the CLAUDE.md log.

## Standing direction from Kelton

- **Replicate Tenscope's design and content as designed.** Do not second-guess
  their copy, reviews, player roster or comparison rows. Change something only
  when a GPOD comment on the Figma board asks for it.
- The tour players are approved GPOD users; Tenscope's images are cleared for use.
- **Mobile first.** Tenscope only drew a mobile *home* page. Every other page's
  phone layout is ours to design from their system.
- **Never touch the live site.** All theme work goes to the preview theme below.

## Where things stand

| Thing | State |
|---|---|
| Branch | `claude/dreamy-archimedes-936sh3` (no PR opened) |
| Preview theme | **188690301096** "Tenscope Home (preview) — Theme Test variant" = a duplicate of live `156088172712` + only our files. Preview: `https://gpodgolf.com/?preview_theme_id=188690301096` |
| Home page | Done: 9 `home-*` sections + `assets/gpod-ts.css` / `gpod-ts.js`, live on the preview |
| Design images | 31 images imported to Shopify Files as `ts-*.jpg/png` (source copies in `media/tenscope/`). Home uses them; the `ts-pdp-*` set is uploaded but not used yet |
| Header island markup | Committed in `sections/header.liquid` but **inert**: the desktop link row and the "Menu" label render only once `ts_links_menu` is set. No CSS yet |
| Last deploy | Commit `7de69c0`, checksum-verified on 188690301096 (all files byte-identical). Rendered at 390px: 8/8 tour cards with photos, founder/feature/review/spotlight on the design images, 0 broken images, no overflow, no JS errors |

## Remaining tasks, in order

### 1. ~~Finish the image deploy~~ — done 2026-10-01 (see table above)

### 2. Header: hero bleeds under the island (Kelton's screenshot)
Problem: `.main-content { padding-top: var(--header-initial-height) }`
(theme.css:2558) reserves a 72/104px strip that shows the grey page colour
between the announcement bar and the hero.
- New global stylesheet `assets/gpod-ts-chrome.css`, linked in `layout/theme.liquid`
  after `gpod-cart-icon-fix.css`. Move the two `@font-face` rules there and
  declare the `--ts-*` tokens on `:root` so header/drawer/cart can use them.
- Bleed: `.main-content:has(> .shopify-section:first-child .ts-hero) { padding-top: 0 }`.
  The hero already reserves its own top space (`--ts-hero-top`, 112/152px).
- Island, per Figma: white card, 1px `#e8eced`, radius 12. Mobile: 8px from
  the edges, 62px tall, logo left, dark "Menu" pill right (gradient
  `#333→#1a1a1a`, radius 8, list icon + "Menu", Inter 500 14px). Keep the
  cart icon + count beside it. Desktop: about 800–960px wide and centred, 60px tall,
  logo left, links centre (Inter 500 14px `#231f20`, 24px gap), green "Shop
  Now" (`.header__scroll-cta`, always visible at ≥1024 instead of
  only-on-scroll; drop its `tabindex="-1"`), then account/search/cart.
- Layout: Modular floats/absolutely centres the logo
  (`.header--logo-center-links-left .logo`, theme.css ~6323). Override
  `.site-header .row` to flex and reset the logo's absolute positioning.
  The hamburger glyph is CSS bars (`#hamburger-menu`); hide them and draw a
  list icon.
- Create the desktop menu (additive; live keeps `main-menu-v2`). The mutation
  was validated but **not run**:
  `menuCreate(title: "Tenscope header", handle: "tenscope-header", items: [...])`,
  all type `HTTP`: Shop → `/collections/frontpage`, Product Finder →
  `/pages/product-finder-quiz`, On Tour → `/pages/on-tour`, FAQ → `/pages/faq`.
  Then set `"ts_links_menu": "tenscope-header"` on the header in
  `sections/header-group.json`.
- Band heights live in gpod.css ~2596 (`.site-header { height: 104px / 72px }`).
  Re-derive them for the 62/60px card.

### 3. Mobile-first PDP — `templates/product.tenscope.json`
Build parallel: `product.json` stays the control. On the preview theme, upload
the tenscope template's content **as `templates/product.json`** so every PDP
shows it there (record that mapping in the deploy script).

Source frame: Round 2 → Product page option (node 28:111), edited through
Sep 30. Page background `#f6f6f6`. Sections, top to bottom:

1. **Trust bar** (dark forest strip): 14-Day Returns · 1-Year Warranty ·
   600+ Customer Reviews · Used by Players and Coaches on Tour · Works with
   MagSafe. Scrollable row on phones.
2. **Main** (`pdp-ts-main`): breadcrumb; gallery (thumbs + main image, NEW
   PRODUCT badge, arrows; swipe on phones); stars + "+561 Reviews"; title
   (Mona Sans 48 desktop); price + "In stock" dot; **Choose your GPOD**
   dropdown (thumb + "Name – short line", links to sibling PDPs; reuse the
   handles from `product.json` → `model_picker`: gpodmagsafe, gpodx,
   gpod-pauly-p2, gpod-travel-1, gpod-studio); qty stepper + green **Add to
   Cart**; payment icons; **Bundle & Save** cards (image + dark ADD pill,
   name, price), sourced from
   `product.metafields['shopify--discovery--product_recommendation'].complementary_products`
   (set on the three monopods → Base 2.0) with a product_list fallback; mini
   trust row (14-Day Returns / Fast Shipping / Lifetime Warranty / 600+
   Reviews) + "READ RETURN POLICY".
   - Cart contract (theme.js, document-delegated): `{% form 'product' %}`
     with `data-product-form`, hidden `name="id"`, `name="quantity"
     data-quantity-field`, button `data-add-to-cart` with
     `<span data-add-to-cart-text>`. Bundle ADD buttons reuse the
     `[data-upsell-add]` detached-form pattern at the bottom of `gpod.js`.
   - Accept `@app` blocks and carry these over from `product.json` → `main`:
     Fera reviews summary, Zipify one-click upsell, Hype tiered progress bar.
   - Sticky CTA (Tenscope annotation: show it once the main CTA scrolls
     away). The existing `snippets/shop-bar.liquid` is rendered from
     `snippets/product.liquid:791`, so render it here too or rebuild it
     with an IntersectionObserver.
3. **Details tabs**: Product Details / Key Features / Product Specifications /
   Use Cases / What's in the box. "Overview" + accordion. Split the
   description on `<h3>` for the accordion; specs from the `gpod.*`
   metafields; box from `gpod.box_contents`.
4. **In Action**: kicker + product title + 16:9 video (`video` setting; the
   live hero's `GPOD OG Range Use` video exists; Paul supplied a Pocket G
   video in Drive). Poster: `ts-pdp-in-action-poster.jpg`.
5. **Ways to use it**: kicker "One tripod. Endless ways to use it.", H2
   "Your pocket's new favorite thing.", collage of 6 (Golf / Travel / Sports /
   Work / Fitness / Content creation) with the uploaded `ts-pdp-ways-*.jpg`.
   The existing `pdp-ways-to-use` section can be restyled or replaced.
6. **Comparison**: see task 4. First column = current product.
7. **The GPOD ecosystem**: "Small on its own. / More powerful together." +
   "Pair your Pocket G with another GPOD to find new angles, build your setup,
   and capture more." Carousel of slides = lifestyle image
   (`ts-pdp-combo-pocket-g-gpod.jpg`) + product card (GPOD X + Base Bundle,
   `ts-pdp-combo-gpodx-base.png`, Shop now).
8. **Customer reviews**: kicker "Feedback" + "Customer reviews" + Fera's app
   block (copy `apps` section `1742914022b79f91bc` from `product.json`).
9. **FAQ**: split layout, "You've got questions, We've got answers" +
   accordion. Questions from `product.json` → `section_faq_h3p3ep`.
10. **Related products**: reuse `home-product-rail` with "Related products" +
    "View All Products"; add an `exclude current product` option.
11. Closing CTA: reuse `home-closing`.

Design notes: the PDP frame mixes Fjalla One / 42dot Sans; use the home system
(Mona Sans + Inter) so the site reads as one. The model-picker dropdown is
`#fafafa`, 1px `#ced5dc`, radius 8, 56px tall.

### 4. Comparison table — one section for home and PDP (`ts-compare`)
Figma "Pocket G VS. Other Products": label column (BEST FOR, EXTENDED HEIGHT,
COLLAPSED LENGTH, WEIGHT; phone attachment optional) + 3 white cards (radius
12, 1px `#e8eced`; first card `#578e34`), each with its own model `<select>`
(thumb + name + caret), 64px rows, green full-width "SHOP NOW". "Compare
Models" pill → `/pages/compare-gpod-models` (`?models=` deep link supported).
- Data from `gpod.best_for / extended_length / collapsed_length / weight /
  phone_attachment / materials`, price, url, image. Embed every candidate as
  JSON and swap a column on select change.
- Phones: cards become a snap row (about 1.6 visible) with the label inside each cell.
- Add it to `templates/index.json` after "Most Popular Products". Kelton:
  "the tables and comparison things … are validated, implement on home + PDP".
  Keep the existing GPOD-vs-Others table.

### 5. Carry the system to the menu drawer and cart drawer
- Drawer = `snippets/navigation.liquid` drill-down (`.nav-hamburger`) styled
  in gpod.css §"Navigation — floating island…" (~2781). Restyle in
  `gpod-ts-chrome.css`: Mona Sans 600 items, forest/charcoal panel or white
  card per the island, green kicker pills, 44px+ targets.
- Cart drawer = `assets/gpod-cart.css` + `snippets/site-cart.liquid` +
  `snippets/cart-upsells.liquid`. Restyle with the same tokens: Mona Sans
  headings, green-gradient checkout button, radius 8/12.
  Keep `show_free_shipping_message: false` (Paul, 2026-09-21).

### 6. Checkout — must happen at publish, not now
The store is on the Shopify plan (not Plus) with one checkout profile, and that
profile is published. A checkout-editor change goes straight to the live checkout,
and there is no draft profile to stage it on. At publish time, set in Settings →
Checkout → Customize:
- Logo: `GPOD_logo.png`
- Typography: Inter, from Shopify's font library (Mona Sans needs Plus)
- Primary button `#70ad49` with white text
- Accent `#143627`
- Corner radius ≈ 8px
- Page background `#ffffff`, order-summary background `#fafafa`

### 7. Then
- Glass-panel footer (Figma closing band + glass footer), optional.
- Verify at 390 + 1440 in a single navigation per page (Cloudflare throttle).
  Checksum every deployed file. Log the round in CLAUDE.md.

## Gotchas learned this round
- `themeFilesUpsert` is **async and fails silently**. A range default that is
  off its step broke a section; a template naming a missing section type then
  failed too. Always re-read `theme.files` checksums.
- The Shopify MCP connection drops mid-session. Re-load it with ToolSearch and
  re-verify the last write.
- **No edit access to Tenscope's Figma** (Kelton, 2026-10-01). The connector can't
  screenshot or export from it, and you don't need it to: specs, renders and
  images for every remaining task are captured in `docs/tenscope/` (see its
  README) and Shopify Files. If the board changes, ask Tenscope for exports
  or a duplicate in GPOD's own drafts.
- To get images into Shopify Files: compress into `media/tenscope/`, push, then
  run `fileCreate` with `originalSource` = the raw.githubusercontent URL at that commit.
