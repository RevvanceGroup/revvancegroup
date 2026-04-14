# Revvance Group — Demo Portfolio

Live demo portfolio for Revvance Group. Static HTML/CSS/JS — no build step required.

## Structure

```
index.html              # Portfolio showcase homepage
serve.json              # Local dev server config (cleanUrls: false)
demos/
  hvac/                 # Meridian Heating & Air — 22 pages (flagship)
  plumbing/             # Elite Plumbing & HVAC — 5 pages
  roofing/              # Summit Roofing Co. — 7 pages
  landscaping/          # GreenScape Landscaping — 5 pages
  electrician/          # Voltage Electric Co. — 5 pages
```

## Local Development

```bash
npx serve -l 3000
```

Then open `http://localhost:3000`.

## Deployment (Cloudflare Pages)

1. Push to GitHub (`main` branch)
2. In Cloudflare Dashboard → Pages → Create a project → Connect to Git
3. Select the `revvancegroup` repository
4. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave blank)*
   - **Build output directory:** `/` (root)
5. Deploy — Cloudflare serves static files directly from the repo root

No build command or output directory configuration needed. All files are pre-built static HTML.

## Notes

- `serve.json` sets `cleanUrls: false` — required so relative links between pages resolve correctly
- All demo sites use relative paths (`href="services.html"`) — do not change to absolute paths
