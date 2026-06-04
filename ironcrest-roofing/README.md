# Ironcrest Roofing Co. — Demo Site

A fast, static, lead-gen roofing website built to the Revvance SEO build spec.
Designed as a VSL demo: instant above-the-fold lead form, custom logo, real
photography, service-area + blog pages, and a GoHighLevel-ready AI chat widget.

Stockton, CA is fictional demo data. Swap the variables below per client.

## Run it locally

It is plain HTML/CSS/JS, no build step. Any static server works:

```powershell
# from this folder
npx serve .          # then open the printed http://localhost:3000
# or
python -m http.server 8000   # then open http://localhost:8000
```

Open `index.html` directly via file:// also works, but a server is closer to production.

## Deploy

Drag the folder into Cloudflare Pages or Netlify (no build command, output = root).
The included `_headers` file sets caching + security headers automatically.

## Connect GoHighLevel (chat + forms)

Everything is wired to one place. Pick one:

**Option A — use the real GHL chat widget (recommended)**
1. In GHL: Sites > Chat Widgets, build the widget, copy the embed snippet.
2. In each HTML page, delete the `<div class="chat" id="chat">...</div>` block.
3. Paste the GHL snippet just before `</body>`.

**Option B — keep this custom widget + push leads to GHL**
1. In GHL: create an Inbound Webhook (Automation > Workflows > Inbound Webhook).
2. Add this one line before `assets/js/main.js` loads on each page:
   ```html
   <script>window.GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/XXXXXXXX";</script>
   ```
3. Both the hero estimate form and the chat now POST captured leads to GHL.
   Until you set it, leads log to the browser console (demo mode).

The hero/contact forms use `id="leadForm"`. The chat lives in `assets/js/main.js`
under "AI CHAT WIDGET" — that is where the scripted flow and `sendToGHL()` live.

## Swap for a new client (the only things to change)

- Business name: find/replace `Ironcrest Roofing Co.` and `Ironcrest`
- Phone: `(209) 555-0186` and the `tel:+12095550186` links
- Email: `info@ironcrestroofing.com`
- Address / city / area: `2447 E Fremont St`, `Stockton`, `San Joaquin County`, city list
- Domain: `https://ironcrestroofing.com` (canonical, OG, sitemap, robots)
- License #: `1098432`
- Reviews/stats: `4.9`, `287`, `1,200+`, `17 yrs`
- JSON-LD in `index.html` `<head>` (NAP, geo lat/long, hours, areaServed)
- Photos in `assets/img/` and the favicon/logo in `assets/`

## Pre-launch checklist (run before handoff)

- [ ] PageSpeed Insights (pagespeed.web.dev) mobile + desktop, target 90+ all four
- [ ] Schema validator (validator.schema.org) on the homepage (LocalBusiness + FAQ)
- [ ] Open on a real phone, tap the CTA, submit the form, open the chat
- [ ] Load /robots.txt and /sitemap.xml, confirm not blocked
- [ ] Every page returns 200, no broken links

## Production upgrades (optional, for max scores)

- Self-host the two Google Fonts (Archivo, Inter) as woff2 to drop the external request
- Minify `assets/css/styles.css` and `assets/js/main.js`
- Generate a 1200x630 branded OG image instead of reusing a photo

## Files

```
index.html            Home (instant lead form, services, reviews, FAQ)
services.html         Six services with detail sections
service-area.html     San Joaquin County cities
about.html            Story, values, stats
contact.html          Lead form + NAP + map
blog/                 Blog index + 3 articles
assets/css/styles.css Design system + all components
assets/js/main.js     Nav, reveal, lead form, AI chat (GHL hook)
assets/img/           Roofing photography (self-hosted)
assets/logo-mark.svg  Custom logo mark
favicon.svg  site.webmanifest  robots.txt  sitemap.xml  _headers
```
