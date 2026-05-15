# Revvance Group - Project State (Session Handoff)

**Last updated:** 2026-05-14
**Owner:** Cody Culbreth (cody@revvancegroup.com)
**Live URL:** https://revvancegroup.com (Cloudflare Pages, auto-deploy from `main` branch)

---

## Business Identity

- **Legal name:** Revvance Group, LLC
- **Email:** cody@revvancegroup.com (Google Workspace)
- **Website:** https://revvancegroup.com (canonical, no www)
- **DNS:** Cloudflare (host: Cloudflare Pages)
- **Personal cell (NEVER display publicly):** 757-646-9957
- **EIN, phone, and street address are NOT shown publicly anywhere on the landing pages anymore.** Removed from schema and footer per Cody's request.

---

## Stack & Infrastructure

- **Static HTML site** built with Claude (no React/Next.js) — Cody prefers this stack
- **Hosting:** Cloudflare Pages, auto-deploy on `git push` to main
- **Repo:** github.com/RevvanceGroup/revvancegroup
- **CRM/Marketing platform:** GoHighLevel (GHL) Agency Pro $297/mo
  - Sub-account: "Revvance Group"
- **Email sending:** GHL LC Email via `mail.revvancegroup.com`
- **A2P 10DLC SMS:** Still pending verification. Lead with email until cleared.
- **Calendly:** free tier, single event at `/cody-revvancegroup/30min`. **Set duration to 15 minutes** (URL slug still says "30min" but the event duration was changed in Calendly).
- **Behavior analytics:** Microsoft Clarity, project ID `wpok5go826`. Installed in head on both landing pages.

---

## Two Active Landing Pages

### `get-started.html` ($297 funnel — home service contractors)
- Target: HVAC, plumbing, electrical, roofing, etc.
- Offer: Custom website + AI lead capture + automated follow-up + Google reviews + calendar booking. $297/mo flat, no setup fee, cancel anytime, 14-day money-back.

### `website.html` ($97 funnel — broader small business)
- Target: Any small business owner needing a website
- Offer: Custom-coded website + hosting + SSL + updates only. $97/mo flat. No AI/automation included. Cancel anytime.

Both pages share the same structure (~7 sections each):
1. Hero (AI-search angle: "Found in Google AND in ChatGPT, Perplexity, AI Overviews")
2. Meet The Founder (Cody's photo + bio, at `/assets/founder.jpg`)
3. The Offer (deal card: free 15-min call, no setup, cancel anytime, 14-day money-back)
4. What We Build (browser mockup + 3 value props: Built To Convert / Found in Google + AI Search / AI + Automation [$297] or We Host And Run It All [$97])
5. Pricing card (6 simple Stone-Systems-style bullets)
6. FAQ
7. Final CTA

**Cut from earlier versions:** Stat strip, 6-feature "What You Get" grid, Pain section, How It Works section. Both pages went from 11 sections to 7 to reduce scroll-cliff drop-off Clarity showed.

---

## Lead Funnel Architecture (CURRENT)

```
Meta Ad → Landing Page → Click ANY CTA → Form Modal Opens On Page
       → User fills form (name, email, phone optional, business type)
       → Submit → POST to GHL webhook → Lead captured in GHL
       → Success screen: "Got it. Now pick a time."
       → "Pick A Time" button → Calendly opens (popup OR top-level nav for in-app browsers)
       → Calendly pre-fills name + email from form data via URL params
       → User picks slot → booking complete
```

**Key behaviors built in:**
- Every CTA on the page triggers the form modal (not direct Calendly)
- All UTMs from landing page URL pass through to Calendly booking
- Instagram/Facebook in-app browsers detected via user-agent; Calendly opens as top-level navigation instead of broken popup
- Test mode: `?test=1` query param disables Meta Pixel for internal QA
- `_redirects` file fixes Cloudflare Pages auto-stripping `.html` extension for the Meta verification file

---

## GHL Webhook + Workflow

- **Webhook URL (NEW one tied to current workflow):** `https://services.leadconnectorhq.com/hooks/nD0A4F3TJ6eW9QDB9W1k/webhook-trigger/71e2e248-2f83-4c3f-9c7c-3eb5ea4ac8c2`
- **Old webhook URL** (still hardcoded in `contact.html`): `.../abb7708b-35af-45d6-be34-0ed39a8a0fff` — not currently in use for ad funnel.
- **Workflow built so far:**
  1. Trigger: Inbound Webhook (the new URL above)
  2. Action: Create or Update Contact (mapped fields: name → first_name, email, phone)
  3. Action: Add Tag `lead-pre-call`
  4. Action: Send Internal Notification → Email to cody@revvancegroup.com
  5. Action: Send Email → Auto-reply to lead with Calendly link
- **Custom field mapping in GHL:** mostly skipped. Cody mapped name/email/phone only. Business type, source_page, UTMs land in webhook payload but aren't mapped to GHL contact custom fields yet.

---

## Meta Pixel Setup

- **Pixel ID:** 2723796834666606 (named "Revvance Group Pixel")
- **Domain verified:** revvancegroup.com (verified via HTML file at root, served correctly via `_redirects` rule)
- **AEM:** Cody skipped manual configuration. Meta auto-prioritizes events for low-volume new pixels.
- **Event firing map (current, post-cleanup):**
  - `PageView`: fires on every page load
  - `Lead`: fires ONLY when the lead form is submitted (the actual conversion). Was previously firing on clicks too; that legacy handler was removed.
  - `Schedule`: fires when Calendly booking is completed (via postMessage event)
- **CAPI (Conversions API):** NOT set up. Optional later.

---

## Microsoft Clarity Setup

- Project ID: `wpok5go826`
- Custom events fired:
  - `lead_form_opened` (when modal opens)
  - `lead_form_submitted` (on form submit)
  - `calendly_popup_opened` (when user hits the booking step)
  - `calendly_inapp_redirect` (for FB/IG in-app browsers — full-page Calendly navigation)
  - `calendly.event_type_viewed`, `calendly.date_and_time_selected`, `calendly.event_scheduled` (Calendly milestones via postMessage)
- Use these to filter recordings by funnel stage and see exactly where leads bail.

---

## Current Meta Ads Status (as of 2026-05-14)

- **Campaign:** "RG - Cold Test - Leads - May 2026" (Leads objective)
- **Ad sets running:**
  - AS1, AS2, AS3, AS4 — exact current state unclear, Cody has been iterating heavily over the past 24 hours
  - One ad set is for $297 contractor funnel (static creative, Stone-Systems-style copy)
  - One ad set for $97 SMB funnel (static creative)
- **Performance Goal currently:** Maximize Landing Page Views (was set this way because pixel was new with no Lead data)
- **Last data Cody reported:** 4 days, ~750 visits, **0 form submissions, 0 Calendly bookings, 0 closed deals**
- **Pixel signal:** approximately 7 historical "Lead" events from BEFORE we cleaned up event firing — those were button clicks, not real form submits. New Lead event data is essentially zero so far.

---

## Standing Issue + Open Strategic Question (THIS IS WHERE THE LAST SESSION ENDED)

Cody is hitting a wall: 4 days of ad spend, ~750 site visits, ZERO form submissions or bookings. Industry baseline for cold B2B lead-gen is 1-5% conversion. Zero is broken-funnel or audience-offer-mismatch territory.

His instincts at end of last session:
- Wants to switch from "Maximize Landing Page Views" to "Maximize Lead" optimization
- Worried his audience is "fried" by 4 days of click-optimized learning
- Knows his creatives aren't great
- Open to fundamentally rethinking the approach

**Recommended next moves for the new chat to pick up on:**

1. **Switch Performance Goal to Lead** on all ad sets. Page-view optimization is biasing Meta toward cheap-click audiences. Lead optimization will start retraining on form-fill-prone audiences.
2. **Watch 10+ Clarity session recordings** from the last 4 days. See exactly where the 750 visitors bail. That's the diagnostic.
3. **Test Meta Instant Forms (Lead Ads)** as a parallel ad set. Bypasses the landing page entirely. If Instant Forms get 0 conversions either, the issue is OFFER-MARKET FIT, not page. If they convert, the page is the bottleneck.
4. **Reconsider audience or offer.** After ~$150-250 spent with zero conversions, the question "do contractors actually want this at $297?" deserves real consideration. May need to lead with $97-only for first paying customers to prove the model works.
5. **Consider a fresh ad creative.** Cody himself said his creatives are weak.

---

## Standing Rules (CRITICAL — DO NOT VIOLATE)

1. **No em-dashes** anywhere in output. Use commas, periods, parentheses, "and/or" instead. Em-dashes are Cody's AI-writing tell.
2. **No emojis in long-form content or page body copy.** EXCEPTION: emojis are allowed in Meta ad headlines/primary text because they're a standard direct-response convention and Cody has explicitly opted in for that context. Do not use emojis elsewhere.
3. **No fake stats, fake reviews, fake testimonials, or inflated ROI claims.** EXCEPTION: Cody made a judgment call to use "(47)" with ⭐⭐⭐⭐⭐ in ad headlines/descriptions as visual social-proof shorthand. This is borderline (he has zero actual customers). Don't push it further.
4. **He builds websites with Claude.** Don't suggest replacing this stack with React/Next.js.
5. **Be direct, honest, useful.** Don't apologize excessively or be preachy.

---

## How to Pick Up in a New Session

Tell the new Claude:
> "Read PROJECT_STATE.md in the project root. That's the handoff. Then ask me what we're working on next."

Then jump in. The most likely starting point is the open strategic question above: 4 days, 750 visits, 0 conversions. What now?
