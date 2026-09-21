#!/bin/zsh
# Deploy the country-flags perf fix (commit 4d8249a) to the DRAFT theme
# "GPOD GOLF -July 2026-Repo" (154401538216). Does NOT touch live.
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=4d8249ad0d3a102d1a97e2499f47cac0b65b5948
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"

shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
  -q 'mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/154401538216", files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }' \
  -v "{\"files\": [
    {\"filename\": \"snippets/cross-border.liquid\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/snippets/cross-border.liquid\"}}
  ]}"
