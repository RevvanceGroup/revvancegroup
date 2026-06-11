# R&G Remodeling and Roofing — Client Site

Static site for Bobby's crew (Castle Shannon, PA), built to the Revvance SEO build spec.
7 pages: home, roofing, remodeling, exteriors (siding/gutters/decks), service-area, about, contact.
Positioning: roofing in season, kitchens and baths all winter. All reviews quoted verbatim
from the 168-review Google profile. The 4.5 / 168 numbers shown are the real public rating.

## Review URL (current state)

Live at revvancegroup.com/rg-remodeling/ for client review.
Noindexed two ways while on the temp URL:
1. `<meta name="robots" content="noindex, nofollow">` on every page
2. `/rg-remodeling/*` X-Robots-Tag rule in the repo root `_headers`

## Connect GoHighLevel

**Lead forms** (home hero + contact) POST JSON to a GHL Inbound Webhook:
1. GHL: Automation > Workflows > Inbound Webhook trigger, copy the URL.
2. Add before `assets/js/main.js` on index.html and contact.html:
   `<script>window.GHL_WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/XXXX";</script>`
3. Payload: type, name, phone, city, service, message, source, page, submitted_at.
   Demo mode (no URL set): logs to console, success state still shows.

**Google reviews widget**: GHL Reputation > Widgets > create from the connected GBP,
copy the embed. Paste it at the marked slot in index.html:
`<!-- GHL REVIEWS WIDGET SLOT -->` (inside the Reviews section). It can replace or sit
above the three static quotes.

## After the GBP merge lands

- Update "168 Google reviews" everywhere to the merged count (~187). Files: all 7 pages
  (topbar), index.html (hero, trust strip, ratingbar), service-area.html (ratingbar),
  contact.html (reviews item). Find/replace "168" carefully.

## Go-live checklist

1. This build already uses the real domain (www.rgremodelpgh.com) in canonicals, OG,
   schema and sitemap. No domain find/replace needed.
2. DELETE the `<meta name="robots" content="noindex, nofollow">` line from all 7 pages.
3. Host as its own Cloudflare Pages project (drag folder, no build step), point
   www.rgremodelpgh.com at it (currently Wix), then remove this folder's rule from the
   repo root `_headers`. Keep the old Wix site up until DNS cuts over.
4. Confirm /robots.txt and /sitemap.xml resolve, submit sitemap in Search Console.
5. Re-run PageSpeed + validator.schema.org on the live URL.

## Confirm with the client

- Address: old Wix site says 3161 Library Rd, the duplicate GBP said 1340 Grove Rd
  (both 15234). Site currently shows "Castle Shannon, PA" with no street on purpose.
  Add a street only if Bobby wants one shown.
- "Licensed and insured" appears on their old site; this build omits license claims
  until Bobby provides the PA HIC number (then add to footer + schema).
- Do they take commercial work? Old site description claimed it; this build is
  residential-voiced.
- Hours: Mon-Sat 8-6, Wed until 8 (from GBP). Confirm Saturday.
- The $500-off roof replacement offer from their FB ads is NOT on the site (offers
  expire); add a promo band later if Bobby wants it.

## Notes

- Phone everywhere: (412) 758-4218 (tel:+14127584218). No public email exists; forms
  and phone only.
- No em-dashes, no fake stats. The one-day roof, magnet sweep, and "honest and fair"
  lines all come from real Google reviews, quoted on the pages where used.
- No aggregateRating schema markup on purpose (Google ignores self-serving review
  markup); the real numbers are displayed in the UI instead.
- Fonts self-hosted (Oswald + Public Sans variable). Raw source photos in
  .claude-tmp/rg-raw (gitignored).
