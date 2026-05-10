# Revvance Group - Project State (Session Handoff)

**Last updated:** 2026-05-10
**Owner:** Cody Culbreth (cody@revvancegroup.com)
**Live URL:** https://revvancegroup.com (Cloudflare Pages, auto-deploy from `main` branch)

---

## Business Identity (USE THESE EXACT VALUES EVERYWHERE)

- **Legal name:** Revvance Group, LLC
- **Address:** 8141 Marley Dr, Mechanicsville, VA 23116
  - Format: "Dr" not "Drive", "VA" not "Virginia", with comma between street/city
- **EIN:** 99-1418961
- **Email:** cody@revvancegroup.com (Google Workspace)
- **Phone:** (833) 859-1898 (toll-free, GHL-managed, forwards to personal cell 757-646-9957)
- **Website:** https://revvancegroup.com (canonical, no www)
- **DNS:** Cloudflare (host: Cloudflare Pages)
- **Personal cell (NEVER display publicly):** 757-646-9957

---

## Stack & Infrastructure

- **Static HTML site** built with Claude (no React/Next.js) — Cody prefers this stack
- **Hosting:** Cloudflare Pages, auto-deploy on `git push` to main
- **Repo:** github.com/RevvanceGroup/revvancegroup
- **CRM/Marketing platform:** GoHighLevel (GHL) Agency Pro $297/mo
  - Sub-account: "Revvance Group" (his ops account, separate from future client sub-accounts)
- **Email sending:** GHL LC Email via dedicated domain `mail.revvancegroup.com`
  - DKIM/SPF/DMARC verified in Cloudflare DNS
  - Sends from cody@revvancegroup.com
  - 1,000 email/day limit
- **SMS:** GHL LC Phone toll-free 833-859-1898
  - **A2P 10DLC verification IN PROGRESS** (rejected once, resubmitted with fixes)
  - Until verified: SMS sends are blocked (error 30032)
  - Email-first follow-up is the workaround
- **Booking:** Calendly free tier — `https://calendly.com/cody-revvancegroup/30min` (30-min slots)
- **Chat widget:** GHL widget id `69fff319ba1fce6a283d69c1` installed on all main pages EXCEPT contact.html and get-started.html (avoid conflict with form/sticky CTA)

---

## Site Structure

### Main pages (root)
- `index.html` — Homepage
- `about.html`, `process.html`, `contact.html`, `pricing.html`, `privacy.html`, `terms.html`, `thank-you.html`
- `get-started.html` — **NEW**: Meta ads landing page, single-conversion, mobile-first, noindex
- `services/*.html` — 8 service pages
- `blog/*.html` — 6 blog posts
- `case-studies/index.html`

### Demos (may be sunsetted soon — DON'T STRESS)
- `demos/hvac/` — Meridian Heating & Air (28 pages, top-tier)
- `demos/electrician/` — Voltage Electric Co. (32 pages, top-tier)
- `demos/roofing/` — Summit Roofing Co. (27 pages, top-tier)

### Assets
- `assets/css/site.css` — Shared CSS (dark theme, blue accent #4f6ef7)
- `assets/js/site.js` — Shared JS (nav hamburger, FAQ accordion, fade-up animations, year)

---

## Current Pivot (What We're Selling)

**OLD positioning:** "We build contractor websites"
**NEW positioning:** Stone Systems-style done-for-you customer acquisition system

What's bundled at $297/mo flat:
1. Custom website (built with Claude, but client doesn't need to know)
2. AI lead capture (GHL chat widget trained on their business)
3. Automated 14-day email + SMS follow-up sequence
4. Google reviews automation
5. Smart calendar booking
6. Lead dashboard

**Offer:** Free demo built before they pay anything. 14-day money-back after launch. Cancel any month.

---

## Funnel Architecture

```
Meta Ad → /get-started.html → VSL + Calendly button → 30-min call → Close → Onboard → Build in 5-7 days
```

The call is where the demo is delivered, not before. This is intentional — boosts show-up rate.

Secondary: Contact form on /contact.html → GHL webhook → workflow auto-follow-up → eventually book a call

---

## GHL Workflow

**Workflow name:** Lead Follow-Up — Revvance
**Trigger:** Inbound Webhook
**Webhook URL:** `https://services.leadconnectorhq.com/hooks/nD0A4F3TJ6eW9QDB9W1k/webhook-trigger/abb7708b-35af-45d6-be34-0ed39a8a0fff`
**Form on contact.html POSTs to this URL** via fetch with mode:'no-cors'

**Workflow actions** (10 steps):
1. Create or Update Contact
2. Create Opportunity in "Revvance Sales Pipeline" → "New Lead" stage
3. Send Immediate Demo Email (within 60 sec)
4. Wait 1 hour
5. Send Demo SMS
6. Wait 24 hours
7. Send Follow-Up Email
8. Wait 2 days
9. Send Second Final Check-in SMS
10. Wait 4 days
11. Send Last Demo Email

**Exit conditions:** contact replies (email or SMS) OR contact gets `calendly-booked` tag

**Pipeline stages:** New Lead → Contacted → Booked Call → Demo Sent → Closed Won → Closed Lost

---

## A2P 10DLC SMS Compliance Status

**Status:** Re-submitted after fixing 3 rejection items (2026-05-10)
**Use case:** Low Volume Mixed
**Brand registration submission included:**
- Address `8141 Marley Dr` (no period), `Mechanicsville`, `VA` (abbreviation)
- Use case description mentioning website form opt-in + chat widget
- Sample messages reflecting actual lead-gen flow (mention demo, Calendly)
- Opt-in URL: `https://revvancegroup.com/contact.html`

**Compliance fixes shipped to website (commit 5a3db0a):**
- SMS checkbox now optional (not required for form submit)
- Consent text discloses "transactional and promotional" message types
- Terms of Service has 18+ age restriction in Section 15
- Privacy Policy has matching SMS section with 18+ language

**If rejection comes again:** rejection email will specify the failed field. Fix on the spot.

---

## What's Pending Next

### Immediate (next session can pick up)
1. **VSL recording** — Cody to record Loom (~5 min, structure: hook, problem, solution, proof, offer, CTA)
2. **VSL embed** — Once Loom URL is provided, replace the placeholder div in get-started.html with iframe (search for "REPLACE BLOCK BELOW WITH LOOM EMBED" in get-started.html)
3. **Meta ads campaign setup** — Pixel install (commented placeholder in get-started.html head), campaign launch
4. **A2P approval check** — should clear in 24-72 hours after re-submission

### Future
- Update main homepage to match new "system not just a website" positioning (currently still mostly website-focused)
- Rewrite workflow emails in GHL to remove "we'll send your demo" language (demo is delivered ON the call, not before) — copy provided in last session
- Set up Calendly + GHL integration (Zapier free tier) once volume picks up
- 10DLC local number verification (separate from toll-free, 2-3 weeks)
- Consider sunsetting demo sites once first paying client is locked in

---

## User's Standing Rules (CRITICAL — DO NOT VIOLATE)

1. **No emojis** in any output
2. **No em-dashes** (use commas, periods, parentheses, "and/or" instead) — em-dashes are his AI-writing tell
3. **No fake stats or inflated ROI claims** in client-facing copy — be honest about uncertainty
4. **He builds websites with Claude** — he likes this workflow, don't suggest replacing it with React/Next.js
5. **Don't be preachy or apologize excessively** — direct, honest, useful

---

## Key Decisions Made

- **Calendly stays** (free tier sufficient for MVP) — not switching to GHL native calendar
- **Custom static HTML form** stays on contact.html, wired to GHL via webhook (NOT GHL iframe form)
- **Toll-free for SMS, not local 10DLC** — faster verification (also did 10DLC in parallel for long-term)
- **Cody@ email everywhere** — matches GHL Brand registration
- **8141 Marley Dr address everywhere** — matches A2P registration
- **Personal cell hidden** — toll-free forwards to it
- **Landing page has no chat widget** — single conversion path, sticky CTA only

---

## Recent Major Commits (last 10)

```
5a3db0a A2P 10DLC compliance fixes from rejection review
52b08f3 A2P 10DLC compliance: update business address + add SMS terms
b344880 Add Meta ads landing page at /get-started.html
2ca7a78 Update contact form webhook URL to new GHL trigger endpoint
57917ea Wire contact form to GHL inbound webhook + add thank-you page
6efb838 Wire 'Book a Call' buttons to real Calendly URL
b66bc28 Switch contact email site-wide to cody@revvancegroup.com
202f7fd Add toll-free phone (833) 859-1898 to footer site-wide
a871b0a Carrier compliance fixes: remove widget from contact page, add address
7ec4d0a Install GHL chat widget across all main-site pages
```

---

## How to Pick Up in a New Session

Tell the new Claude:
> "Read PROJECT_STATE.md in the project root. That's the handoff. Then ask me what we're working on next."

That should get the new session up to speed in ~30 seconds without burning tokens on rediscovery.
