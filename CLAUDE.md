# CLAUDE.md — GPOD Golf website (gpodgolf.com)

GPOD sells magnetic phone monopods, tripods and accessories for filming golf swings. This repo is
the **Shopify Online Store 2.0 theme** for gpodgolf.com (Modular v4.1.3 base, heavily customised):
`assets/ config/ layout/ locales/ sections/ snippets/ templates/` at the root.

## Start here — every session, in this order

1. **Start from main.** Main is `claude/gpod-golf-redesign-dmyfe9` (GitHub's default branch). Run
   `git fetch --all` and make sure your session branch is cut from the current main. No other
   branches should exist; if one does, ask before building on it.
2. **Check the live theme before touching anything.** Ask the Shopify MCP which theme is `MAIN`
   and when its files last changed. If it isn't the theme named under *Where things stand*, or it
   changed after the date given there, mirror live into git first (method: decision log,
   2026-10-12 "Live theme work brought into the repo"). Paul and other sessions edit Shopify directly.
3. **One task per session, merged back the same day.** Finish by opening a PR into main and
   merging it, so the next session starts clean. A session can only push its own branch (other
   refs return 403), so merging goes through a PR via the GitHub MCP.
4. **Never write to the live theme from a session.** Build on an unpublished copy and verify with
   `theme.files` checksums. Kelton or Paul previews and publishes from Shopify admin.
5. **Record decisions** in [`docs/decision-log.md`](docs/decision-log.md) (append only), and update
   *Where things stand* below when it changes.

## Where things stand (updated 2026-10-12)

- **Live theme:** "Paul Dev (5-star cart rating)" `188905586856`, published by Paul on Oct 8 and
  built directly in Shopify. Mirrored into git at `fc39e17`; unchanged since.
- **Main = live, plus these unpublished extras** (nothing else differs from live):
  - **Parked Tenscope home**, unused: `sections/home-{hero-proof,spotlight,product-rail,feature-cards,founder,tour,review-wall,versus,closing}.liquid`,
    `assets/gpod-ts.{css,js}`, two woff2 fonts, `snippets/ts-*`, the header "island" markup in
    `sections/header.liquid`, inert until `ts_links_menu` is set. The Tenscope `templates/index.json`
    is recoverable at `7de69c0`.
  - **Small finished fixes, never published:**
    - footer stops loading 237 flag images (`snippets/cross-border.liquid`)
    - hero video poster sizing (`sections/home-hero.liquid`)
    - buy-box quantity stepper removed (`product*.json`, `page.paid-landing.json`)
    - dark cart-badge numerals (`assets/gpod-cart-icon-fix.css`)
    - dormant "Complete your setup" cart module (`snippets/cart-upsells.liquid`, its `gpod.js`
      handler and Theme settings → Cart)
- **Homepage:** the live one ("FILM YOUR SWING IN SECONDS" hero, reviews, tour + partner logos,
  explore cards, compare table, quiz CTA). `templates/index.json` in main is identical to the live mirror `fc39e17` (verified by content).
- **Merchandising (Kelton, 2026-10-12):** **GPOD and GPOD X are the hero SKUs.** Base 2.0 is sold
  out (confirmed with Paul), so Base 2.0 and the three Base bundles (GPOD + Base, GPOD X + Base,
  Pauly P + Base) are on **pre-order**.
  - **How pre-order works:** the product tag `preorder-oct` drives the button label and ship notes
    via the live-theme snippet `gpod-preorder-ship.liquid`, plus a
    `<p class="preorder-note">Pre-order now. Ships before Oct 30.</p>` first line in each
    description.
  - **"Ships before Oct 30" is hardcoded** in that snippet and in the four descriptions.
- **Tenscope (the agency): on hold.** Their Figma "GPOD - Review" moved on after Oct 1; Paul saw the
  latest round on the Oct 12 call. The Figma connector needs reconnecting before anyone can read it.
  Preview theme `188690301096` still holds the Oct 1 build and is stale against live.
  `docs/sprint-7-plan.md` (Intelligems Theme Test) is paused until the direction is settled.

## Open to-do (top = most urgent)

1. **Base 2.0 restock and ShipBob backlog (Paul).** No order containing a Base has shipped since
   Oct 6. When stock lands, remove `preorder-oct` and the description line from the four products.
   This is exactly reversible: see the 2026-10-12 log rows.
2. **The ship date will go stale.** If Base won't ship by Oct 30, update the snippet text and the
   four description lines together.
3. **Point the homepage hero CTA at GPOD / GPOD X.** It goes to `/collections/frontpage?sort_by=best-selling`,
   where pre-order bundles can rank high. Change it in the theme editor; sessions can't write live.
4. **Tenscope direction:** reconnect Figma, read the Oct 12 round, then decide what (if anything) to
   rebuild, starting from the *current* live theme rather than the stale preview.
5. **Delete the old GitHub branches** if they are still listed. Everything on them is already in
   main's history.

## Why the redesign exists — read before designing anything

`docs/customer-insights.md` (≈30 real inquiries + catalog table) found:
1. **Customers can't tell products apart** (GPOD vs GPOD X vs Pauly P; Travel vs Studio; bundles).
   Comparison, full specs and a product finder must be prominent.
2. **PDPs don't answer pre-purchase blockers:** phone compatibility (MagSafe vs plates, thick cases),
   what's in the box, the twist-lock extension, the remote.
3. **Support content is missing:** setup, remote pairing, troubleshooting (a stuck lower extension
   is the #1 complaint), Sportsbox redemption, parts.
4. **People shop by situation:** on-course, indoor/sim, coaching, travel.

Ask of every page: *does this help a confused customer choose the right product and use it?*
Measured context lives in `docs/funnel-baseline.md`. Mobile is ~85% of traffic, and most paid
social lands on `/`.

## Store facts

- gpodgolf.com · USD · Shopify plan (not Plus: checkout edits go straight to live).
- **Monopods:** GPOD $109.99, GPOD X $129.99, Pauly P $159.99.
- **Tripods:** Travel $74.99, Studio 2.0 $199.99, Pocket G (live).
- **Base:** Base 2.0.
- **Accessories:** GPUCK, Connect 2.0, Caddy, G Plate.
- **Bundles:** GPOD + Base, GPOD X + Base, Pauly P + Base, Travel + Sportsbox.
- **Discontinued:** GPOD Mini.
- Handles and notes are in `docs/customer-insights.md`.
- Prefer live data from the Shopify MCP (products, orders, inventory, analytics) over anything
  written here.

## Repo structure

```
CLAUDE.md                ← start here (keep it short; depth goes in docs/)
docs/decision-log.md     ← every decision since 2026-07-06, append-only
docs/customer-insights.md← customer FAQ analysis + catalog table
docs/funnel-baseline.md  ← measured conversion baseline
docs/sprint-plan.md      ← Aug mobile-conversion plan + Day One switch-flips
docs/sprint-7-plan.md    ← Tenscope phone-first plan + Intelligems test (paused)
docs/tenscope-design-review.md, docs/next-session.md, docs/tenscope/ ← agency board capture (Oct 1)
docs/template-architecture.md ← build-parallel rules for A/B tests
docs/design-tokens.md    ← token set new sections build from
docs/audit-response-aug-2026.md ← Aug 21 web audit + Brand Playbook mapping
docs/information-architecture.md ← nav trees, collections, menu handles
media/tenscope/          ← approved agency images (Shopify Files source; not deployed)
assets/ config/ layout/ locales/ sections/ snippets/ templates/ ← the theme
```

## Conventions

- OS 2.0: JSON templates + sections with `{% schema %}`. Use merchant-editable settings for anything
  a non-developer might change. New sections are `kebab-case.liquid`, prefixed by area
  (`pdp-`, `home-`); shared partials go in `snippets/`.
- `assets/theme.css`/`theme.js` are Modular's compiled bundle with no build pipeline. Put changes in
  separate assets or section-scoped `{% style %}`/`{% javascript %}`.
- Never build with PageFly. Its `pf-*` files are app-managed and stay out of git.
- Copy answers real customer questions. Use canonical names: "Pauly P", never "Pauly D"/"Paulie".
  Never invent reviews, quotes or claims.
- Mobile-first and accessible: 44px tap targets, visible focus, `prefers-reduced-motion`.

## Tools and gotchas

- **Shopify MCP:** products, inventory, orders, analytics, `theme.files`. Theme writes go to
  unpublished themes only. Publishing is a human step.
- **JSON templates:** the API returns them pretty-printed with an auto-generated header, so compare
  by parsed content, not raw checksums.
- **Storefront checks:** pace requests; it answers 429 "Verifying your connection" after bursts.
  Do every assertion in one page load.
- **Theme previews stick.** After opening a preview, Shopify keeps showing it, even on gpodgolf.com,
  until you close the bar at the bottom of the page. Confirm what customers see in a private window.
- **Git:** sessions can push only their own branch (403 otherwise). Merge to main via PR.
