# Sprint 7 — Tenscope, rebuilt for phones

**Drafted 2026-10-01 · Sprint dates Mon Oct 5 → Fri Oct 16 · Test launch target Mon Oct 19**
Follows `docs/sprint-plan.md` (Aug 11). Inputs: the Tenscope home build on preview theme
`188690301096`, Kelton's review of it (2026-10-01), live analytics pulled the same day,
and the Aug 2026 web audit + Brand Playbook (`docs/audit-response-aug-2026.md`).

---

## 1. Decisions this plan is built on (Kelton, 2026-10-01)

1. **Our theme can change anything.** Tenscope's Figma is read-only reference and direction,
   not a spec. That replaces the 2026-09-30 rule "replicate the agency as designed".
2. **Verdict on the current build on phones:** too cluttered and word-heavy; copy and USPs
   are weak; nothing hooks a visitor into scrolling or tapping.
3. **Tenscope designed desktop first.** Its tables and grids look great on desktop and turn
   into horizontal scrollers on phones, which doesn't look good. There is no mobile PDP at all.
4. **Test the home page and the PDP with Intelligems.**
5. **Popups are out of scope** for now (Klaviyo's 15%-off popup stays as is).

Kelton's two screenshots of the live menu drawer (plain text list) and cart drawer
(exposed Order Notes box, "Shopping Cart" heading, stacked buttons) are in scope: every
visitor in the test sees them.

---

## 2. Where we start (measured 2026-10-01)

**Mobile, by landing page, Sep 17–30 (post-launch) vs Aug 20–Sep 16:**

| Landing | Sessions | Add-to-cart rate | Before |
|---|---|---|---|
| Home | 6,071 (62% of mobile) | **1.27%** | 1.62% |
| Product page | 3,215 | 3.55% | 3.73% |
| Collection | 319 | 8.8% | 6.5% |

All mobile: 2.34% ATC (3.06% in the two weeks before launch; the weekly rate has swung between
2.2% and 3.6% since July). Desktop: 7.95% (8.62%). Mobile is 86% of sessions; social is 60% of
September sessions at 0.51% conversion.

**The Tenscope home at 390px** (preview theme, one navigation): 11,307px = **13.4 screens**;
reviews 2,512px, three feature cards 1,646px, spotlight 1,076px with a 10-line paragraph; first
price at ~1,750px; ~40 tap targets under 44px (header icons 32px, search 19×25, footer links
25px); 376 requests and ~1.7MB of JS. No overflow, no broken images, no JS errors.

**The PDP at 390px** is still the Sep 17 design (different type and buttons from the new home):
12,317px = 14.6 screens; Add to Cart at ~1,290px, below the first screen.

**Three themes, none complete.** Live `156088172712` = Sep 17 redesign + hotfixes. July repo
theme `154401538216` = live + the cart-drawer redesign + PDP fixes. Tenscope preview
`188690301096` = live + the new home only. Git `HEAD` holds all of it.

**Not measured at all:** zero analytics events in `gpod.js` / `gpod-ts.js`; Intelligems not installed.

---

## 3. Goal, metric, and the test

**Goal:** one candidate theme where the home page, the PDP and both drawers are built for a
390px screen first, put into an Intelligems Theme Test against live by Mon Oct 19.

**Why one Theme Test rather than separate home and PDP tests.** Shopify can't template-test
`index`, so the home page needs a Theme Test either way. Running a second, PDP-only template
test at the same time would split ~4,900 mobile sessions a week twice and confound the two.
Test the whole mobile experience first; once a winner is the control, PDP variants become
cheap template tests inside the published theme.

| | Metric | Baseline | Detectable in ~4 weeks |
|---|---|---|---|
| **Decision** | Mobile add-to-cart rate per visitor | 2.34% | a ~30% lift (≈3.4 weeks at 50/50) |
| Guardrail | Revenue per visitor, mobile conversion | from Intelligems | no drop |
| Diagnostic | Home → product page click-through; section CTA clicks | new events | explains *why* |

**Calendar constraint:** Black Friday is Nov 27. Launch Oct 19 → read by Nov 16 → decide before
BFCM traffic arrives. Every day of slip comes out of the test's power.

Homepage v1 (the dark Fjalla One option) does **not** get its own arm: three arms at this traffic
would need ~5 weeks for the same read. Its best ideas are folded into the one challenger (§5).

---

## 4. Mobile rules for every page this sprint

1. **One idea per screen.** Each section at 390px: a headline of 8 words or fewer, at most two
   lines of support copy, one visual, one action. Longer copy moves to the PDP or gets cut.
2. **No sideways scrolling for anything people read or compare** — tables, product grids,
   reviews, feature lists. Use 2-column grids, stacked rows, "this vs that" pickers and
   accordions. Swipe stays only where shoppers expect it: the PDP photo gallery.
3. **A product, a price and an add-to-cart by the second screen** of the home page;
   **title, rating, price and Add to Cart on the first screen** of the PDP.
4. 44px minimum targets, 16px minimum body text, one primary button style (the green gradient).
5. **Length budget:** home ≤ 7 screens at 390×844 (now 13.4); PDP ≤ 9 (now 14.6).
6. Desktop keeps Tenscope's layouts where they work; the copy changes apply on both.

---

## 5. The copy problem: claims, hooks and one fact sheet

**What's wrong now.** The build's copy is generic ("We've spent countless hours laboring over
every painstaking detail…"), the spotlight is a pasted product description, and it uses none of
the Brand Playbook's proof points. Several claims contradict each other or the Playbook:

| Claim | Where it appears | Problem |
|---|---|---|
| Warranty | "1-year warranty" (Tenscope home trust cards; `product.product-update-page.json`) vs "Lifetime Warranty" (trust row in `product.json` + `product.pocket-g.json`; Tenscope's PDP) | Contradictory; one is wrong |
| Reviews | 561 / 586+ / 600+ / 622; 4.9 vs 5.0 average | Use Fera's live aggregate everywhere |
| GPOD weight | 4.8 oz (PDP compare, Tenscope) | Playbook says **4.4 oz** (settled 2026-09-02) |
| Carbon fiber | "Premium materials", "Lightweight Carbon Fiber ✓ / Others ✗" | Audit + Playbook retired the carbon-fiber story; Pocket G, Travel, Studio aren't carbon |

**Day 1 deliverable: a one-page fact sheet** (warranty term, review count source, weights,
lengths, materials per model, shipping promise, return window) approved by Paul/Kelton. Every
section is written from it; nothing ships that isn't on it.

**Proof points the Playbook already approved:** 75,000+ users · 100+ players across 10
professional tours · 5.0 average across 586+ verified reviews (Aug) · US Patent 11,555,577 B2 ·
founder Paul Park, a professional golfer. Voice: peer-to-peer; frustration → origin → innovation
→ result. Reusable lines: "Designed out of necessity." · "Golfers need to focus on their swing,
not on their setup." · "Capture more. Carry less." (Pocket G).

**Hooks to build** (each one shows rather than tells):

| Hook | What it is | Source |
|---|---|---|
| Three-verb hero | "Stick it. Swing it. Watch it back." over a shot where the GPOD *is* the subject (planted centre frame, phone on) | Round 3 HomePage + v1 hero composition |
| See it work | Stick → Snap → Swing: three rows, each a 3–5s silent loop or still. Replaces the three stacked feature cards | The product's real differentiator: no clamps, no legs, no setup |
| Which GPOD is yours? | Three chips on the home page (Course / Range & mat / Simulator & indoors / Travel) → one recommended model with price + Add to cart | v1's "There's a GPOD for the way you practice", without the indoor/outdoor split Paul rejected (#13) |
| Proof in one line | ★ rating · review count · "100+ tour players" · patent, then a tour-logo strip | Playbook proof points |
| Tour faces | 4 players in a 2×2 grid + "and 100+ more on 10 tours" | Round 2/3 On Tour |
| Short quotes | 3 one-to-two-line review quotes with name + product, then "Read all reviews" | Fera; replaces the 3-screen review wall |
| Founder in two lines | Paul's photo + "Designed out of necessity…" + link | Playbook voice |

Still needed from Paul: hero photo or loop with the GPOD as subject (Round 3's hero image is a
candidate), and 3 short loops for "See it work".

---

## 6. Scope, in order

### Week 1 (Oct 5–9): one theme, the chrome, the home page

1. **One candidate theme (Mon).** Deploy git `HEAD`'s non-home work onto `188690301096` (the
   cart-drawer redesign that hides the Order Notes box, the PDP fixes) plus the 44px tap-target
   fixes from `4827293` (Aug 20, never merged). Rename the theme "Tenscope — test variant".
   Re-check live for edits since Sep 30 so the variant differs only in what we built.
2. **Fact sheet + section copy (Mon–Tue, approval Wed).** §5.
3. **Header (Tue).** The floating island from the handoff (`docs/next-session.md` task 2):
   logo + Menu pill + cart with count, 44px targets, hero runs up under it.
4. **Menu drawer (Wed).** Replaces the plain list in Kelton's screenshot: Shop shows the 4–6
   core products as thumbnail rows (name, best-for line, price); then Compare models / Find
   your GPOD / Support / About as 56px rows; account + search as icons. Mona Sans, token colours.
5. **Cart drawer (Wed).** Restyle the redesign on Tenscope tokens: Mona Sans heading ("Your
   cart"), composed line rows, notes collapsed, green-gradient checkout, Shop Pay beneath, one
   "Complete your setup" row (2-column, no scroller). Keep `show_free_shipping_message: false`.
6. **Home page at 390px (Wed–Fri).** Section order on phones:
   1. Hero: three-verb headline, one support line, Shop Now, rating line (≈1 screen)
   2. Proof line + tour-logo strip (¼ screen)
   3. See it work: Stick / Snap / Swing (1 screen)
   4. Which GPOD is yours? chips → recommended product card with Add to cart (1 screen)
   5. Best sellers: 2×2 grid, each with best-for line + price; "Compare models" link (1 screen)
   6. Tour: 2×2 faces + "100+ players on 10 tours" (¾ screen)
   7. Reviews: 3 short quotes + rating summary (¾ screen)
   8. GPOD vs. a phone clamp/tripod: 4-row checklist, two columns that fit 390px (½ screen)
   9. Founder: photo + two lines + link (½ screen)
   10. Closing CTA, then the footer with its link groups in accordions
   Target ≤7 screens. Desktop keeps the current Tenscope layout with the new copy.

### Week 2 (Oct 12–16): the PDP, the compare pattern, the test

7. **`templates/product.tenscope.json`, phone first.** First screen: one-line trust strip,
   swipe gallery, title, rating, price, Add to Cart. Then: "Choose your GPOD" as stacked model
   rows (thumb, name, best-for, price) instead of a dropdown; Bundle & Save as a 2-column pick;
   key specs 2×2; "Works with your phone?" right under the buy box (customer-insights theme 4);
   See it work (3 steps); what's in the box; specs + details accordions; compare (item 8);
   reviews (Fera); FAQ accordion; pairs-with 2-column; sticky Add to Cart once the main button
   scrolls away (`snippets/shop-bar.liquid` already does this). Build the first screen first
   and get it approved before the lower sections.
8. **One compare pattern, no sideways scroll.** Phones: "this vs that" — the current product
   against one model the shopper picks, label rows stacked, two value columns at 390px, Shop
   button per column, "Compare all models" link to `/pages/compare-gpod-models`. Desktop keeps
   Tenscope's three cards. Used on the PDP; the home page gets it only if it fits the 7-screen budget.
9. **Intelligems (Kelton installs the app by Wed Oct 14).** Script in `layout/theme.liquid` on
   both themes (per `docs/template-architecture.md`, not as an app embed); Theme Test 50/50,
   all devices, goals = add to cart / conversion / revenue per visitor; QA through Intelligems'
   preview links; launch Mon Oct 19.
10. **Events.** Home section CTA clicks, home → PDP, chooser use, compare picks, sticky-ATC tap,
    each carrying the Intelligems group (or `control` until it exists).
11. **QA + deploy.** 390 + 1440, one navigation per page (Cloudflare throttle), checksum every
    file, log the round in CLAUDE.md.

### Not this sprint
Popups · checkout branding (publish day, `docs/next-session.md` task 6) · the glass footer ·
collection pages (319 mobile landings in two weeks) · a second home arm for Homepage v1.

---

## 7. Risks

- **Copy approval is the critical path.** If the fact sheet isn't approved by Wed Oct 7, the
  home page is built on the draft and copy changes ride a later deploy.
- **Live drifts while the test runs.** Paul's sessions have edited live directly before. Any
  live edit during the test must be mirrored to the variant, or the arms differ in more than
  the build. Checksum both themes at launch and weekly.
- **Intelligems slips past Oct 19.** Every week lost leaves less time before BFCM; past ~Oct 26
  the test can only detect a very large change before Nov 27.
- **Photography.** The hero and the "See it work" loops need GPOD-as-subject footage. Fallback:
  Round 3's hero still and the existing GPOD OG range clip.

---

## 8. Questions for Paul / Kelton

1. Warranty: 1-year or lifetime?
2. Review count: show Fera's live number everywhere (it will differ from 586+/600+)?
3. Spotlight product on the home page: GPOD X + Base Bundle (best seller, Paul's comment #7)?
4. The home-page chooser overlaps the quiz question still open since Aug 11 (RevenueHunt vs
   our native finder vs the compare widget). OK to use a three-chip chooser on the native data
   and leave the quiz where it is?
