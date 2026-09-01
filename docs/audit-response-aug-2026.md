# Audit Response — Shawn & Paul, August 2026

Source documents:

1. **WEB AUDIT NOTES — August 21, 2026** (Shawn Curtis / Paul Park). Page-by-page bugs and change requests.
2. **GPOD Brand Playbook DRAFT 8/24/26** (authored by Shawn Curtis). Brand system, voice, and a corrected product catalog.

This doc is the mapping from *what they asked for* to *what we change in the theme*. Verified status per item is tracked in the tables below; the implementation lives on branch `claude/gpod-website-analysis-vhnqk8`.

---

## The two documents disagree with the current build in three structural ways

Worth stating up front, because these are not bug fixes — they change decisions already shipped.

**1. Shop taxonomy changes from product *type* to product *tier*.**
The current IA (adopted 2026-07-06, `docs/information-architecture.md`) organizes Shop by type: Monopods / Tripods & Bases / Bundles / Accessories. The audit replaces this with **Core Products / Bundles / Accessories**. This is not cosmetic — it moves Base 2.0 out of "Bases" and into Accessories, and moves Caddy into Core Products. Collections, the meganav, the homepage carousel and the footer all key off the old taxonomy.

**2. The quiz is demoted, and possibly removed.**
The audit is internally split here, deliberately. It lists "Product Finder Quiz" as the first item under Find Your GPOD, *and* says: *"My preference would be to get rid of the quiz and rather focus on the product comparison / selection widget, as it serves as a utility for shoppers, rather than a 'cute game'. Maybe consider an A/B test."* Both readings are honored below: the quiz leaves the hero either way; whether it survives at all is a decision, not a task.

**3. The carbon-fiber story is retired.**
Both documents independently reject it. The audit calls the "Why Carbon Fiber" section misleading and says comparing against aluminum *"speaks negatively about our products that are aluminium."* The Playbook flags the same overclaim under *A Claim to Use Carefully* and supplies approved replacement language. Two sources agreeing, one of them the brand owner — this one is settled, not a judgment call.

---

## Navigation — target tree

From the audit, verbatim structure:

| Group | Items | Change from today |
|---|---|---|
| **Shop** | View All · Core Products · Bundles · Accessories | Replaces type-based meganav |
| **Find Your GPOD** | Product Finder Quiz · Compare All Models · Compatibility Guide · On the Course · Indoor & Simulator · Coaching & Studio · Travel Ready | Adds Compatibility Guide; quiz renamed |
| **Support** | Support · Instructions & Manuals · FAQ · Register Your GPOD · Shipping & Returns · Contact Us | "Support & Guides" → "Support"; adds Instructions & Manuals, Register Your GPOD |
| **About** | About Us · On Tour · Corporate Sales | Swing Tips removed |
| **Blog & News** | Swing Tips | **New top-level nav item** |
| | Log In · Search | |

---

## Homepage — itemized

| # | Request | Type |
|---|---|---|
| 1 | Remove "Just stick it and swing it." from the hero image — too much copy competing for focus | Copy |
| 2 | **Keep** "Trusted by 75K" | No change |
| 3 | Better hero messaging than "We make filming your swing easy." | Copy — needs options |
| 4 | Remove quiz from hero → footer + menu; rename to "Product Selector" / "Product Quiz" | Structural |
| 5 | "Shop All Products" → "Shop Our Best Sellers" | Copy + needs a best-sellers collection |
| 6 | Hero video: portrait vs landscape on mobile; what to shoot, which product | **Open question for Paul** |
| 7 | Review banner: can't scroll or expand, shows 3.5 reviews desktop / 4 mobile, nothing clickable | **Bug** |
| 8 | Tickers: mobile stays black/grey (hover-only color), can't swipe → full color on mobile | **Bug** |
| 9 | Two opposite-direction tickers stacked feels cluttered | Layout |
| 10 | Add lede under "and the brands we build with" | Copy — *appears already present, verifying it renders* |
| 11 | "Explore our products" → "Explore Our Best Sellers", ordered by best sellers | Copy + sort |
| 12 | Simplify categories to Core Products / Accessories / Bundles | Structural |
| 13 | Can't slide product categories on desktop; Monopods cut off | **Bug** |
| 14 | Bases card: copy says "surfaces you can't stake", image shows the G-Peg you stake with | Asset mismatch |
| 15 | Compare tool compares more models than selected | **Bug** |
| 16 | Compare checkbox does nothing | **Bug** |
| 17 | "Why Carbon Fiber" misleading; disparages our own aluminum products; "4.8oz" reads as a rating | Copy — retire |
| 18 | Quiz: prefer removing in favor of the compare widget; maybe A/B test | **Decision** |
| 19 | Founder story on the homepage? | **Open question** |
| 20 | **Sitewide:** product thumbnails need a one-liner or bullets | Structural — highest leverage |

Item 20 is repeated under both Homepage and Shop general notes, and directly answers the project's #1 documented customer problem (*customers can't tell products apart* — `docs/customer-insights.md`). Reference sites named: GoPro, Whoop, Yeti, Peak Design.

---

## Product detail pages

| Request | Nature |
|---|---|
| Remove GPOD branding and product name burned into the images | **Asset work — Paul** |
| Image 1 always the main hero image | Reorder — free, today |
| Image 2 a lifestyle in-use image | Mixed: reorder where one exists, shoot where it doesn't |
| More lifestyle images and video for every product | **Asset work — Paul** |

The reorder half is free and immediate. The photography half goes on Paul's shot list (`docs/assets-needed.md`). `sections/pdp-ways-to-use.liquid` already exists as the destination for lifestyle cards and self-hides while empty.

---

## Support

| Destination | Request |
|---|---|
| Support | Rename from "Support & Guides". Keep to Support & Troubleshooting. Add Contact Us. AI chat bot = **future state, not now** |
| Instructions & Manuals | All manuals, guides, how-to videos in one place. Needs new install guides per product. AI-generated PDF manuals. **Kelton to recommend a video display tool** |
| FAQ | Review and update |
| Register Your GPOD | *"love this idea"* — needs a form or integration. Matters because GPOD is selling beyond DTC and wants every customer captured regardless of where they bought |
| Shipping & Returns | **Blocked** — Shawn gathering 3PL details |
| Contact Us | Present |

---

## Brand Playbook — what binds the theme

**Color.** Exactly two brand colors, and the Playbook is explicit: *"Do not introduce additional brand colors without updating this guide."*

| | HEX | Notes |
|---|---|---|
| GPOD Green | `#8AC663` | The G is always green, in both lockups |
| GPOD Black | `#231F20` | |

**Type.** Eurostile is licensed and not web-safe. Approved web substitutes: **Michroma** (headlines — closest match to Eurostile Extended), **Aldrich** (subheads), **Rajdhani** (stat call-outs, feature labels), **Big Shoulders** (headline hierarchy), **Titillium Web** (body — *"technical enough to feel on-brand, but far more legible in paragraphs"*), Arial/Helvetica fallback.

**Naming — bundles are renamed.** Numbered G-Bundle labels are retired in favor of descriptive names, *"better for ecommerce search-matching and for customers scanning results."*

| Was | Now | MSRP |
|---|---|---|
| G-Bundle 1 | GPOD + Base Bundle | $134.99 |
| G-Bundle 2 | GPOD X + Base Bundle | $154.99 |
| G-Bundle 3 | GPOD Pauly P + Base Bundle | $204.99 |
| GPOD Travel + Sportsbox 3D Player Annual + Swing Analysis | GPOD Travel + Sportsbox Bundle | $169.99 |

**MSRP.** Core: GPOD $109.99 · GPOD X $129.99 · Pauly P $159.99 · Studio 2.0 $199.99 · Travel $74.99 · Pocket G $49.99 · Caddy $39.99. Accessories: G-Puck $19.99 · G-Plate $19.99 · Connect 2.0 $19.99 · Base 2.0 $59.99.

**Discontinued.** GPOD Mini is no longer an active SKU. GPOD Caddy gen-1 ($34.99) is retired and replaced by gen-2 ($39.99) launching September 2026 — a relaunch under the same name. It is **"GPOD Caddy"**, never "GPOD Caddy G".

**Proof points** (usable as-is in copy): 75,000+ users · 100+ players across 10 professional tours · 5.0 average across 586+ verified reviews · US Patent 11,555,577 B2.

**Voice.** Peer-to-peer, not corporate. Structure: frustration → origin → innovation → result. Bold claims stay anchored to a specific annoyance. Reusable lines: *"Designed out of necessity."* · *"Golfers need to focus on their swing, not on their setup."* · *"From weekend warriors to seasoned pros"* · *"Capture more. Carry less."* (Pocket G) · *"Elevate Your Game"* (Sportsbox bundle).

**"The Point"** is a confirmed storytelling pillar: the point on the G is the product — a pointed end staked into the ground. The Playbook supplies draft About-page copy built on it.

**Golf-first, multi-sport later.** Present-day copy stays golf-first. Don't bake golf-only assumptions into naming systems, taglines or visual rules where leaving room costs nothing.

---

## Items that are decisions, not tasks

These need Paul or Shawn, and are called out so Thursday can resolve them rather than discover them:

1. **Does the quiz survive?** Remove entirely, keep behind a rename, or A/B test it against the compare widget. Note the compare widget is currently broken, so "focus on compare instead" is contingent on fixing it first.
2. **Hero headline.** The audit rejects the current line but doesn't supply a replacement.
3. **Hero video** — portrait or landscape on mobile, which product, what shot.
4. **Founder story on the homepage** — asked as an open question.
5. **Instructions & Manuals video tool** — explicitly assigned to Kelton.
6. **Shipping & Returns** — blocked on 3PL detail from Shawn.

---

## Retired copy worth re-homing

Pocket G's `gpod.best_for` was a six-clause paragraph. It was replaced on 2026-09-01 with a
one-liner matching the other 14 SKUs, because `best_for` renders on product cards and the
paragraph read as prose beside one-word siblings.

The original content is good — it just needs a component built for it. `sections/pdp-ways-to-use.liquid`
already exists, takes four labelled slots, and self-hides until images are added. These six are
almost exactly its four-to-six slots, and Pocket G is the SKU the Playbook explicitly markets
beyond golf, so it is the natural first candidate once photography exists.

> **Golf** — Overhead putting practice, full swing recording, golf bag mounting, on-course content.
> **Travel** — Airplane tray table streaming, hands-free FaceTime and movies.
> **Sports** — Fence-mounted recording for tennis, pickleball, and more.
> **Work** — Desk stand for Zoom, calls, and notifications at eye level.
> **Fitness** — Hands-free workout recording.
> **Content Creation** — Grip, selfie stick, and low/high-angle filming in one tool.

Current one-liners, for reference when writing copy for any new SKU — the house pattern is a
7–15 word phrase, no trailing period, gerund-led for accessories:

| Product | `best_for` |
|---|---|
| GPOD | Simple set-height filming on the course and range |
| GPOD X | Full height in a packable, collapsible monopod |
| GPOD Pauly P | Fast height changes with a twist ring — the flagship monopod |
| GPOD Studio 2.0 | Coaches, fitters, and creators filming every day |
| GPOD Travel | Travel, indoor practice, and quick setups on hard ground |
| GPOD : The Pocket G | Five mounts in one, folded down to pocket size |
| GPOD Caddy | Mounting your phone to a golf cart or any metal surface |
| GPOD Base 2.0 | Turning any GPOD into an indoor / simulator tripod |
| GPOD Connect 2.0 | Turning a GPOD + alignment stick into a swing training aid |
| GPUCK w/MagSafe | Adding or replacing a magnetic head on any 1/4 in thread mount |
| GPOD G Plate | Anchoring a GPOD to a hard floor or sim bay — no base needed |

---

## Items that are blocked on assets, not code

Paul's shot list. Tracked in `docs/assets-needed.md`.

- Product images with GPOD branding / product name burned in need reshooting or recropping — sitewide.
- Lifestyle in-use image for position 2 on every PDP.
- Video content per product.
- A hero image for All GPOD Products (*"what type of creative makes sense here?"*).
- A Bases card image without the G-Peg attached, so it stops contradicting its own copy.
