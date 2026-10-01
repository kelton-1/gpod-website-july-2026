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
