# Deployment Checklist — GPOD Golf Redesign

## Pre-Deployment Validation

### Code Quality
- [x] All section schemas valid JSON
- [x] All template JSON valid
- [x] Liquid syntax correct (tag counts match)
- [x] No console errors expected
- [x] theme.liquid clean (no dead CSS vars, no unused preloads)

### Accessibility
- [x] Heading hierarchy correct
- [x] Form labels + fieldsets present
- [x] ARIA labels where needed
- [x] Skip link to #MainContent
- [x] Color contrast OK (black on white)
- [x] Keyboard navigation functional
- [x] Images have alt text or alt=""

### Performance
- [x] CSS deferred appropriately (gpod.css loads after theme.css)
- [x] JS deferred (vendor, theme, gpod.js)
- [x] All images lazy-loaded
- [x] Responsive srcsets in place
- [x] No external CDN dependencies
- [x] Code size reasonable (gpod.css 15KB, gpod.js 6.4KB)

### SEO
- [x] Meta titles/descriptions in place
- [x] Canonical links in theme.liquid
- [x] JSON-LD structured data (header.liquid)
- [x] Mobile viewport meta tag
- [x] Social meta tags (social-meta-tags snippet)
- [x] Page titles on all new pages

## Deployment Steps (Choose One)

### Option A: Shopify CLI (Recommended)
1. Install Shopify CLI: `npm install -g @shopify/cli`
2. Authenticate: `shopify theme dev` (will prompt for store)
3. Push to store: `shopify theme push` (on `claude/gpod-golf-redesign-dmyfe9` branch)
4. View live: `shopify theme open`

### Option B: Shopify Admin
1. Navigate to: **Settings → Apps and sales channels → Theme library**
2. Click **Upload theme** button
3. Select compressed theme folder or zip file
4. Click **Upload theme**
5. Activate the new theme

### Option C: Staged Upload (for CI/CD)
1. Multipart POST theme zip to: `https://cdn.shopify.com/s/files/1/...` (via graphql_mutation themeCreate)
   - Note: Shop has 20-theme limit; may need to delete unused themes first
2. Check graphql response for theme ID
3. Activate via: `themePublish` mutation

## Post-Deployment Testing

### Critical User Flows

#### 1. Home Page
- [ ] Hero loads without flicker
- [ ] Use-case tiles render correctly (4 columns on desktop, responsive on mobile)
- [ ] Compare table displays (horizontal scroll on mobile)
- [ ] Quiz CTA visible and clickable

#### 2. Product Pages (Test 3 products: GPOD, GPOD X, Pauly P)
- [ ] Specs section renders metafields correctly
- [ ] Compatibility section shows 4 blocks (iPhone, Android, iPad, GoPro)
- [ ] How-to section displays video + 6 steps
- [ ] "Add to cart" button works
- [ ] Related products load
- [ ] No duplicate sections

#### 3. Collection Pages
- [ ] Toolbar pills display (shows active collection)
- [ ] Pills link to correct collections
- [ ] Compare + Quiz helper links work
- [ ] Product grid displays correctly
- [ ] Filters/sort work (inherited from Modular)

#### 4. Compare Page (`/pages/compare-gpod-models`)
- [ ] Table displays 6 products
- [ ] Horizontal scroll on mobile
- [ ] Sticky row headers work
- [ ] Empty cells show "—" instead of blank
- [ ] CTA to quiz visible

#### 5. Support Page (`/pages/support`)
- [ ] 6 guide cards display
- [ ] 11 accordion items expand/collapse (no JS errors)
- [ ] Links to articles/docs work
- [ ] Mobile layout flows correctly

#### 6. Product Finder Quiz (`/pages/product-finder-quiz`)
- [ ] Step 1: "Where will you film" options display
- [ ] Next button disabled until selection made
- [ ] Back button hidden on step 1
- [ ] Progress bar updates
- [ ] Step 3: "See my GPOD" button changes from "Next"
- [ ] Result card displays (with recommendation + why text)
- [ ] "Start over" button resets form
- [ ] No console errors

### Mobile Testing (375px breakpoint)
- [ ] All sections stack correctly
- [ ] Text readable (no tiny fonts)
- [ ] Touch targets ≥44px
- [ ] No horizontal scroll (except compare table)
- [ ] Images responsive
- [ ] Forms easy to use

### Desktop Testing (1200px+ breakpoint)
- [ ] Multi-column layouts render
- [ ] Compare table scroll works smoothly
- [ ] No layout broken on wide screens

### Browser & Device Coverage
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + mobile)
- [ ] Firefox (desktop)
- [ ] iPhone 12+ (MagSafe device for real use)
- [ ] Android phone (test plate/compatibility block)
- [ ] iPad (if available)

### Performance Metrics
- [ ] Lighthouse score ≥80 (check via DevTools → Lighthouse)
- [ ] Core Web Vitals:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms (or INP < 200ms on newer Lighthouse)
  - [ ] CLS < 0.1
- [ ] No layout thrashing or long tasks (check DevTools → Performance)
- [ ] Images load with correct sizes

### SEO Verification
- [ ] Page title includes shop name
- [ ] Meta description present
- [ ] `<main>` tag has id="MainContent"
- [ ] No duplicate content warnings
- [ ] robots.txt allows crawl (Shopify default)
- [ ] Sitemap generated (Shopify default)

### Analytics & Tracking
- [ ] Google Analytics loaded (if installed)
- [ ] Conversion pixels fire (if installed)
- [ ] No tracking errors in console

## Regression Testing (vs. Live Theme)

### Existing Features
- [ ] Header navigation (logo, menu) works
- [ ] Footer links present
- [ ] Search functionality
- [ ] Quick view (if enabled)
- [ ] Ajax cart (if enabled)
- [ ] Customer accounts (login, addresses, orders)
- [ ] Newsletter signup
- [ ] Blog/articles (if in use)
- [ ] Gift cards (if in use)
- [ ] Discount codes apply correctly

### Modular Theme Features
- [ ] Product badge (sale, new, etc.)
- [ ] Swatches/variant selector
- [ ] Recently viewed products
- [ ] Cross-sells / related products
- [ ] Product recommendations
- [ ] Bundle handling (if in use)

## Rollback Plan

If critical issues found post-deployment:

1. Identify issue (screenshot + steps to reproduce)
2. Check with stakeholders: "Rollback to previous theme?"
3. If yes:
   - Via Shopify Admin: Settings → Apps → Theme library → [Previous] → Set as active
   - Via CLI: `shopify theme publish [previous-theme-id]`
4. Create issue in GitHub with details
5. Fix locally on `claude/gpod-golf-redesign-dmyfe9`
6. Re-test locally (if CLI auth available)
7. Re-deploy

## Sign-Off

- [ ] All critical user flows tested
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Lighthouse score acceptable
- [ ] Stakeholders approve live look
- [ ] Ready for announcement / monitoring

**Post-Launch Monitoring:**
- Monitor Google Search Console for crawl errors
- Check Core Web Vitals dashboard
- Set up alerts for checkout errors
- Review analytics for drop-off rates

---

*Last updated: 2026-07-07*
