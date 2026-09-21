#!/bin/zsh
# Deploy the live-hotfix backports + PDP vendor-line fix (commit d5de40a)
# to the DRAFT theme "GPOD GOLF -July 2026-Repo" (154401538216).
# Does NOT touch live. Files come from the pinned GitHub commit.
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=d5de40a553a5bdf79ddd43c835a5c67ba746bb3e
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"

shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
  -q 'mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/154401538216", files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }' \
  -v "{\"files\": [
    {\"filename\": \"assets/gpod-cart-icon-fix.css\",   \"body\": {\"type\": \"URL\", \"value\": \"$RAW/assets/gpod-cart-icon-fix.css\"}},
    {\"filename\": \"assets/gpod-pdp-sticky-fix.css\",  \"body\": {\"type\": \"URL\", \"value\": \"$RAW/assets/gpod-pdp-sticky-fix.css\"}},
    {\"filename\": \"layout/theme.liquid\",             \"body\": {\"type\": \"URL\", \"value\": \"$RAW/layout/theme.liquid\"}},
    {\"filename\": \"sections/header.liquid\",          \"body\": {\"type\": \"URL\", \"value\": \"$RAW/sections/header.liquid\"}},
    {\"filename\": \"config/settings_data.json\",       \"body\": {\"type\": \"URL\", \"value\": \"$RAW/config/settings_data.json\"}},
    {\"filename\": \"templates/product.json\",          \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.json\"}},
    {\"filename\": \"templates/product.pocket-g.json\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.pocket-g.json\"}},
    {\"filename\": \"templates/product.product-update-page.json\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.product-update-page.json\"}}
  ]}"
