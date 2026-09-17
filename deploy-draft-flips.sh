#!/bin/zsh
# Deploy the Day One switch-flips (commits e1c45fe, cfdd93c, 2eaa345) to the
# DRAFT theme "GPOD GOLF -July 2026-Repo" (154401538216). Does NOT touch live.
# Files come from the pinned GitHub commit, so what deploys = what was reviewed.
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=2eaa34544a0aa3cf498bf80961bb64cfe8b3b994
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"

shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
  -q 'mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/154401538216", files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }' \
  -v "{\"files\": [
    {\"filename\": \"config/settings_data.json\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/config/settings_data.json\"}},
    {\"filename\": \"templates/product.json\",    \"body\": {\"type\": \"URL\", \"value\": \"$RAW/templates/product.json\"}},
    {\"filename\": \"sections/header.liquid\",    \"body\": {\"type\": \"URL\", \"value\": \"$RAW/sections/header.liquid\"}}
  ]}"
