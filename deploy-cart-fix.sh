#!/bin/zsh
# Deploy the desktop cart-drawer fix (commit 41f46d6) to the DRAFT theme
# "GPOD GOLF -July 2026-Repo" (154401538216). Does NOT touch live.
# Backport of the hotfix running on live theme "Cart drawer fix v2 (preview)"
# (156086730920) so the repo theme is publish-safe again.
# Files come from the pinned GitHub commit, so what deploys = what was reviewed.
export PATH="/Users/kelton1/.local/bin:$PATH"
SHA=41f46d6a9cbcae3a69a39e7f76736ba44a203275
RAW="https://raw.githubusercontent.com/kelton-1/gpod-website-july-2026/$SHA"

shopify store execute -s gpodgolf.myshopify.com -j --allow-mutations \
  -q 'mutation($files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: "gid://shopify/OnlineStoreTheme/154401538216", files: $files) {
          upsertedThemeFiles { filename }
          userErrors { field message }
        }
      }' \
  -v "{\"files\": [
    {\"filename\": \"assets/gpod-cart-drawer-fix.css\", \"body\": {\"type\": \"URL\", \"value\": \"$RAW/assets/gpod-cart-drawer-fix.css\"}},
    {\"filename\": \"layout/theme.liquid\",             \"body\": {\"type\": \"URL\", \"value\": \"$RAW/layout/theme.liquid\"}}
  ]}"
