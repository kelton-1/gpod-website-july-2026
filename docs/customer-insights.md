# Customer Insights — FAQ / Inquiry Analysis

Source: `Customer_Inquiries` CSV (support inbox export, ~30 inquiries), analyzed 2026-07-06.
This document explains **what confuses customers on the current gpodgolf.com** and what the redesign must fix. Treat every theme below as a design requirement, not just a support issue.

---

## Theme 1 — Product differentiation confusion (the #1 problem)

Roughly a third of all inquiries are some version of *"what's the difference between X and Y?"*:

- "Pauly D vs X — how should I choose?" (note: customer misnamed the product; it's **Pauly P**)
- "Bundle 2 or Bundle 3? What are the significant differences between the Paulie and X? Which allows quicker height adjustment? Weight difference?"
- "Which base is most stable — Studio 2.0, Pauly P, or GPOD X base? What materials/sizes are they?"
- "GPOD Travel vs GPOD X — which is better for stability on uneven land / moderate wind?"
- "How heavy is the base for the GPOD X? Deciding between GPOD X + Base and GPOD Travel."
- "X bundle is sold out — what's the difference between the X and the Pauly P?"
- "GPOD Travel for MagSafe vs buying GPOD + Indoor Base separately — what's the difference?"

**What customers actually compare on:** stability (wind, uneven ground), weight, packed/extended height, height-adjustment speed, shaft thickness (does it fit in a golf bag club slot?), materials, indoor vs outdoor suitability, price.

**Redesign requirements:**
- A real **comparison table** (all monopods/tripods side by side) with specs: weight, collapsed/extended length, shaft diameter, base type, stability rating, indoor/outdoor, price.
- Full **spec sections on every PDP** (weight, dimensions, materials, bag-fit).
- A **product finder / quiz flow** ("Where do you practice? What phone? Wind?") — one already exists as a PageFly page but customers clearly aren't finding or trusting it.
- Consistent product naming everywhere (customers write "Pauly D", "Paulie", "Pauly p", "GolfPod Pro" — the lineup naming isn't landing).

## Theme 2 — Extension mechanism problems (stuck lower section)

The single most common *support* complaint (7+ inquiries): the bottom/middle twist-lock extension gets stuck, won't extend to the advertised 51", or locks up after being pushed into the ground. Customers resort to pliers, lubricant, heat.

**Redesign requirements:**
- PDP + support content: a short **"how to extend/collapse correctly"** video and do/don't graphics (e.g. don't slam it into the ground compressed).
- A **troubleshooting page** ("My GPOD won't extend") that support can link and search can find.
- Set expectations on the PDP about the twist-lock mechanism.

## Theme 3 — The remote is a mystery

6+ inquiries: "What does the remote do?", "How do I use it?", Bluetooth pairing trouble, remote won't turn on, lost remote and wants a replacement. One customer explicitly said: *"your website contains no information that would be helpful."*

**Redesign requirements:**
- A **"Guides & Manuals" hub** with per-product setup instructions (remote pairing, taking video with the remote, battery replacement).
- Remote explanation on every PDP that includes one.
- Replacement remote purchasable as a standalone item.

## Theme 4 — Compatibility anxiety (MagSafe / Android / iPad / cases / GoPro)

Recurring pre-purchase blocker: "Will it work with my phone?"

- Android users unsure how the metal plates work (Samsung, Oppo).
- iPad users: is there any iPad-compatible holder? (asked twice)
- Thick cases (OtterBox): is the magnet strong enough?
- Phone sliding off the mag mount (case/plate placement issue).
- GoPro 360 + alignment stick compatibility — what adapters are needed?
- MagSafe phone + MagSafe case: do I still need the GPUCK for the Caddy?

**Redesign requirements:**
- A **compatibility block on every PDP**: iPhone (MagSafe), Android (via included plates), iPad (not supported / supported product), case guidance, GoPro/camera thread info (1/4-20).
- "Works with your phone" content near add-to-cart, not buried.

## Theme 5 — Sportsbox AI bundle redemption

3 inquiries: bought a bundle with Sportsbox 3D subscription and can't figure out how to access/activate it.

**Redesign requirements:**
- A dedicated **redemption instructions page** linked from the order confirmation, PDP, and FAQ.
- Clear explanation of what Sportsbox is and what the bundle includes.

## Theme 6 — Missing instructions / unexplained parts

- Studio 2.0 arrived with **no assembly instructions** and no videos findable on the site.
- "What is the round blue metal ring for?" / square vs round adhesive plates.
- "What is GPOD Connect 2.0 for? What is the G Plate for? What's unique about Studio 2.0?"

**Redesign requirements:**
- Accessory PDPs must answer "what is this, what does it work with, why do I need it" in the first screen.
- A **"what's in the box"** section with every item pictured and named on each PDP.
- Assembly/setup videos hosted on a support hub and linked from PDPs.

## Theme 7 — Replacement parts & small-item friction

- Lost tightening knob/screw ($17 sting), lost remote, wants just the magnet piece.
- Golf cart mount (Caddy) + GPUCK bundling is confusing at checkout.

**Redesign requirements:**
- A **replacement parts / spares** collection.
- Smarter, explained cross-sells (why the Caddy suggests a GPUCK, and when you don't need one).

## Theme 8 — Shop-by-use-case gap

Customers describe their *situation*, not a product: "indoor with occasional outdoor", "windy range", "uneven ground", "filming lessons daily", "travel". The current nav (Indoor / Outdoor collections exist) isn't resolving this.

**Redesign requirements:**
- Navigation and collection pages organized around **use cases** (At the course / Indoor & sim / Coaching & studio / Travel) in addition to product type.
- Each collection page should say who it's for and link to the comparison table / finder.

---

## Product catalog snapshot (live store, 2026-07-06)

| Product | Handle | Type | Price | Notes |
|---|---|---|---|---|
| GPOD (w/ MagSafe) | `gpodmagsafe` | Monopod | $109.99 | The original |
| GPOD X | `gpodx` | Monopod | $129.99 | Collapsible/portable, 51" claim, stuck-extension complaints |
| GPOD Pauly P | `gpod-pauly-p2` | Monopod | $159.99 | Newest flagship monopod/tripod hybrid |
| ~~GPOD Mini~~ (discontinued 2026-09-01, set to DRAFT) | `gpod-mini` | Camera Accessory | $29.99 | Alignment-stick adapter |
| GPOD Travel | `gpod-travel-1` | Tripod | $74.99 | Compact MagSafe tripod, highest inventory |
| GPOD Studio 2.0 | `gpod-studio` | Tripod | $199.99 | Pro/coach tripod |
| GPOD Base 2.0 | `indoor-base-for-gpod-gpod-mini` | Accessory | $59.99 | Indoor base for monopods |
| GPOD Connect 2.0 | `connect` | Accessory | $19.99 | Adapter (purpose unclear to customers) |
| GPUCK w/MagSafe | `replacement-magnet-for-magsafe` | Accessory | $19.99 | Magnetic mount puck |
| GPOD Caddy | `gpod-caddy` | Core | $34.99 | Gen-2 relaunch at $39.99 due Sept 2026 (Playbook). Moves to Core Products under the new taxonomy |
| GPOD G PLATE | `gpod-gplate` | Accessory | $19.99 | Semi-permanent plate (purpose unclear to customers) |
| GPOD + Base Bundle | `g-bundle-one-gpod-with-gpod-base` | Bundle | $134.99 | Renamed 2026-09-01 (was G BUNDLE 1) |
| GPOD X + Base Bundle | `g-bundle-two-gpod-x-with-gpod-base` | Bundle | $154.99 | Renamed 2026-09-01 (was G BUNDLE 2) |
| GPOD Pauly P + Base Bundle | `g-bundle-three-gpod-pauly-p-and-gpod-base` | Bundle | $204.99 | Renamed 2026-09-01 (was G BUNDLE 3) |
| GPOD Travel + Sportsbox Bundle | `gpod-travel-sportsbox-3d-player-annual-swing-analysis` | Tripod bundle | $169.99 | Renamed 2026-09-01. Sportsbox redemption confusion |
| GPOD : The Pocket G | `gpod-pocket-g` | Core | $49.99 | **Live, 1,160 units.** The old `gpod-anywhere-tripod` handle never existed — it was the source of the stale compare-picker entry |
| POS Display — Green Grass | `pos-display-green-grass` | B2B | $899.99 | Retail display, probably hide from consumer nav |

## Priorities for the redesign (derived)

1. **Decide-between-products system**: comparison table + specs + finder quiz, surfaced in nav, home, collections, and PDPs. (Fixes Themes 1, 8 — the biggest pre-purchase blockers.)
2. **PDP overhaul**: specs, compatibility block, what's-in-the-box, setup/remote videos, honest use-case guidance. (Themes 2, 3, 4, 6.)
3. **Support/Guides hub**: manuals, videos, troubleshooting (stuck extension, remote pairing, Sportsbox redemption), replacement parts. (Themes 2, 3, 5, 6, 7.)
4. **Use-case-driven navigation + collection pages.** (Theme 8.)
