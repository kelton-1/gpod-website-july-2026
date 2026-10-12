# Tenscope board, captured for offline use

GPOD has **view-only** access to Tenscope's Figma ("GPOD - Review",
`0ACOl1BWpqZ4SppRvtCVeb`), so the Figma connector cannot export from it
(screenshots and asset downloads need edit access). Everything the remaining
build needs was captured on 2026-09-30 / 10-01 and lives here, so no session
has to read the board again.

| File | What |
|---|---|
| `spec-mobile-home-100-215.txt` | 390px mobile home (the only mobile frame Tenscope drew) |
| `spec-desktop-home-28-1593.txt` | Round 2 desktop home (current) |
| `spec-desktop-pdp-28-111.txt` | Round 2 desktop product page, Pocket G (current, edited through Sep 30) |
| `frames/mobile-home-*.jpg` | Renders of the mobile home, top to bottom |
| `frames/desktop-pdp-*.jpg` | Renders of the Round 2 product page, top to bottom |
| `frames/round3-home-*.jpg` | Round 3 → "HomePage" (61:1646), desktop, top to bottom — the board's light home option (added 2026-10-01) |
| `frames/round3-home-v1-*.jpg` | Round 3 → "Homepage v1" (61:1024), desktop — the dark Fjalla One home option (added 2026-10-01) |
| `capture-figma.js` | How the round3 renders were taken (public viewer in headless Chromium; no Figma login) |

**Node map** (from the viewer's layer panel, 2026-10-01). Kelton's link
`node-id=61-1871` is the On Tour section inside Round 3 → HomePage.

| Section | HomePage | Homepage v1 | Product page option |
|---|---|---|---|
| Round 2 (edited through Sep 30) | 28:1593 | 28:974 | 28:111 |
| Round 3 (Sep 25 copy of Round 2) | 61:1646 | 61:1024 | 61:161 |
| mobile (home only) | 100:215 | — | — |

Round 3 → HomePage still carries the pre-feedback copy ("Stick it. Swing it.
Watch it back." hero, Pocket G spotlight at $49.99). Round 2 → HomePage is the
same layout after Paul's comments ("Film your golf swing in seconds", GPOD X
spotlight). Top-level layer "Homepage" (70:2759) is only a CTA-Nav-Button
component, not a page.

**Spec line format** (one layer per line, indented by depth):
`TYPE 'layer name' @x,y WxH fill=… stroke=… r=radius auto=V|H gap=… pad=top/left/bottom/right fx=effects`
and for text: `font=Family Style size/line-height ls=letter-spacing » the copy`.
Colours are hex (`@0.24` = alpha). Positions are relative to the parent frame.

Design images are already in Shopify Files as `ts-*.jpg/png` (sources in
`media/tenscope/`). The comment threads and annotations are summarised in
`docs/tenscope-design-review.md`. Drive links are omitted because this repo is public.

If Tenscope revises the board, ask them to either export the changed frames
(PNG at 1x + assets) or "Duplicate to drafts" if the file allows it. A
duplicate in GPOD's own Figma account is fully editable, and the connector
works on it.
