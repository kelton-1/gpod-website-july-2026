#!/bin/zsh
# Deploy the Tenscope home page to the preview theme
# "Tenscope Home (preview) — Theme Test variant" (188690301096), a duplicate
# of live "Cart icon fix (preview)" (156088172712) taken 2026-09-30, so the
# only difference from live is the home page — a clean Theme Test variant.
# Does NOT touch live. Files come from the pinned GitHub commit.
# Usage: ./deploy-tenscope-home.sh <full-commit-sha>
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=${1:?pass the full commit sha to deploy}
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"
THEME="gid://shopify/OnlineStoreTheme/188690301096"

FILES=(
  assets/gpod-ts.css assets/gpod-ts.js assets/gpod-mona-sans.woff2 assets/gpod-inter.woff2
  snippets/ts-icon.liquid snippets/ts-product-card.liquid
  sections/home-hero-proof.liquid sections/home-spotlight.liquid sections/home-product-rail.liquid
  sections/home-feature-cards.liquid sections/home-founder.liquid sections/home-tour.liquid
  sections/home-review-wall.liquid sections/home-versus.liquid sections/home-closing.liquid
)

json_files() {
  local out="" f
  for f in "$@"; do
    out+="{\"filename\": \"$f\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/$f\"}},"
  done
  echo "[${out%,}]"
}

upsert() {
  shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
    -q 'mutation($theme: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
          themeFilesUpsert(themeId: $theme, files: $files) {
            job { id } userErrors { filename code message }
          }
        }' \
    -v "{\"theme\": \"$THEME\", \"files\": $(json_files "$@")}"
}

# Sections first: Shopify rejects a template that names a section type the
# theme does not have yet, and the job fails silently.
upsert "${FILES[@]}"
sleep 20
upsert templates/index.json
