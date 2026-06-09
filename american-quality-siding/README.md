# American Quality Siding & Construction — Client Site

Static site for Derek Beck (Boise, ID), built to the Revvance SEO build spec.
7 pages: home, siding, windows-doors, soffit-fascia, service-area, about, contact.
All photos are Derek's real project photos (pulled from his Facebook page and GBP).
All three reviews are verbatim from the "American Quality Siding 2, LLC" Google profile.

## Review URL (current state)

Live at revvancegroup.com/american-quality-siding/ for Derek's review.
Noindexed two ways while it sits on the temp URL:
1. `<meta name="robots" content="noindex, nofollow">` on every page
2. `/american-quality-siding/*` X-Robots-Tag rule in the repo root `_headers`

## Connect GoHighLevel (lead forms)

Both forms (home hero + contact page) POST JSON to a GHL Inbound Webhook.
1. In GHL: Automation > Workflows > new trigger "Inbound Webhook", copy the URL.
2. Add this line before `assets/js/main.js` on index.html and contact.html:
   `<script>window.GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/XXXX";</script>`
3. Payload fields: type, name, phone, city, service, message, source, page, submitted_at.
Until the URL is set, submissions log to the browser console (demo mode) and still
show the success state, so the demo feels real.

To use the GHL chat widget later, paste its embed snippet before `</body>` on each page.

## Go-live checklist (when Derek signs and a domain exists)

1. Find/replace `https://americanqualitysiding.com` with the real domain in every
   .html file + sitemap.xml + robots.txt (canonicals, OG tags, schema).
2. DELETE the `<meta name="robots" content="noindex, nofollow">` line from all 7 pages.
3. Host as its own Cloudflare Pages project (drag the folder; no build step), point
   the domain, then remove this folder's rule from the repo root `_headers`.
4. Confirm /robots.txt and /sitemap.xml resolve at the new root, submit to Search Console.
5. Re-run PageSpeed + validator.schema.org against the live URL.

## Things to confirm with Derek before go-live

- Idaho contractor registration number (add to footer + schema once confirmed; the
  site currently makes NO license/insurance claims on purpose).
- Business hours (site says Mon to Fri 8 to 6, taken from the old GBP listing).
- Whether he wants the old Twin Falls GBP reviews quoted (currently: yes, verbatim,
  attributed as Google reviews).
- New GBP for Boise: create/claim once there is a service-area address. That plus
  the review flow is the Rankli upsell.

## Notes

- Phone everywhere: (208) 595-9565 (tel:+12085959565). Email: americanqualitysiding@gmail.com.
- No em-dashes anywhere in copy. No fake stats, no fake aggregate rating, no
  invented years-in-business. Keep it that way.
- Fonts self-hosted in assets/fonts (Barlow + Barlow Condensed, latin subsets).
- Raw source photos (including business card shots) are NOT in this folder; they
  were moved to .claude-tmp/aqs-raw so they do not deploy.
