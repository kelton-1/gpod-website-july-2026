#!/bin/zsh
# Deploy the buy-box + hero-poster polish (commit eaee787) to the DRAFT
# theme "GPOD GOLF -July 2026-Repo" (154401538216). Does NOT touch live.
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=eaee78725663782402d743b8674787b3f86abadc
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"

shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
  -q 'mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/154401538216", files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }' \
  -v "{\"files\": [
    {\"filename\": \"templates/product.json\",                     \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.json\"}},
    {\"filename\": \"templates/product.pocket-g.json\",            \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.pocket-g.json\"}},
    {\"filename\": \"templates/product.product-update-page.json\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.product-update-page.json\"}},
    {\"filename\": \"templates/page.paid-landing.json\",           \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/page.paid-landing.json\"}},
    {\"filename\": \"sections/home-hero.liquid\",                  \"body\": {\"type\": \"URL\", \"value\": \"$RAW/sections/home-hero.liquid\"}}
  ]}"
