#!/bin/zsh
# Deploy the cart-drawer interior redesign (commit 95a81cb) to the DRAFT theme
# "GPOD GOLF -July 2026-Repo" (154401538216). Does NOT touch live.
# Files come from the pinned GitHub commit, so what deploys = what was reviewed.
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=95a81cb2f9d8b1c5b98df35c75eb546c34ddd21e
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"

shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
  -q 'mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/154401538216", files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }' \
  -v "{\"files\": [
    {\"filename\": \"assets/gpod-cart.css\",          \"body\": {\"type\": \"URL\", \"value\": \"$RAW/assets/gpod-cart.css\"}},
    {\"filename\": \"assets/gpod.js\",                \"body\": {\"type\": \"URL\", \"value\": \"$RAW/assets/gpod.js\"}},
    {\"filename\": \"snippets/cart-upsells.liquid\",  \"body\": {\"type\": \"URL\", \"value\": \"$RAW/snippets/cart-upsells.liquid\"}},
    {\"filename\": \"snippets/site-cart.liquid\",     \"body\": {\"type\": \"URL\", \"value\": \"$RAW/snippets/site-cart.liquid\"}},
    {\"filename\": \"layout/theme.liquid\",           \"body\": {\"type\": \"URL\", \"value\": \"$RAW/layout/theme.liquid\"}},
    {\"filename\": \"config/settings_schema.json\",   \"body\": {\"type\": \"URL\", \"value\": \"$RAW/config/settings_schema.json\"}},
    {\"filename\": \"config/settings_data.json\",     \"body\": {\"type\": \"URL\", \"value\": \"$RAW/config/settings_data.json\"}}
  ]}"
