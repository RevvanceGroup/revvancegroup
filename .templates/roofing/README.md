# Roofing demo template

A customizable, multi-page roofing-company website you can swap into
`revvancegroup.com/demo/` in 60 to 90 seconds during a sales call. The
template lives here, the generator script lives at the repo root in
`quick-demo.ps1`, and the rendered output ends up in `/demo/`.

## Usage

From the repo root, in PowerShell:

```powershell
.\quick-demo.ps1 -BusinessName "Smith Roofing" -City "Tampa" -State "FL" -Phone "8135550100"
```

That writes the customized site to `./demo/`, commits, and pushes to `main`.
Cloudflare Pages auto-deploys, so the prospect can pull up
`https://revvancegroup.com/demo/` while you are still on the call.

Add `-NoPush` to skip the git push and just generate files locally for review:

```powershell
.\quick-demo.ps1 -BusinessName "Smith Roofing" -City "Tampa" -State "FL" -Phone "8135550100" -NoPush
```

Full example with every option:

```powershell
.\quick-demo.ps1 `
  -BusinessName "Apex Roofing Co" `
  -City "Dallas" `
  -State "TX" `
  -Phone "2145550199" `
  -Email "hello@apexroofing.com" `
  -Address "1500 Main St, Dallas, TX 75201" `
  -YearFounded 2008 `
  -ServiceAreas "Plano,Frisco,Allen,McKinney,Richardson,Carrollton,Addison,Irving"
```

## Tokens

Every placeholder uses double curly braces. The script does a literal
string replacement on every file under `.templates/roofing/`.

| Token | What it accepts | Auto-derived? | Notes |
|---|---|---|---|
| `{{BUSINESS_NAME}}` | Any string | No | Company name, displayed everywhere |
| `{{CITY}}` | Any string | No | Primary city the business serves |
| `{{STATE}}` | 2-letter US state code | No | Uppercased automatically |
| `{{STATE_FULL}}` | Full state name | Yes (from `{{STATE}}`) | Lookup table for all 50 states + DC |
| `{{PHONE}}` | Display phone | Yes (from raw `Phone`) | Formatted as `(XXX) XXX-XXXX` |
| `{{PHONE_RAW}}` | 10 digits, no formatting | Yes (from raw `Phone`) | Used in `tel:+1XXXXXXXXXX` links |
| `{{EMAIL}}` | Email address | Yes if not given | Defaults to `info@<slug>.com` |
| `{{ADDRESS}}` | Street address string | Yes if not given | Defaults to `City, ST` |
| `{{YEAR_FOUNDED}}` | 4-digit year | Yes if not given | Defaults to current year minus 12 |
| `{{YEARS_IN_BUSINESS}}` | Integer | Yes | `currentYear - YearFounded` |
| `{{CURRENT_YEAR}}` | 4-digit year | Yes | Used in the footer copyright |
| `{{SERVICE_AREAS_PILLS}}` | HTML fragment | Yes | One `<div class="area-pill">` per area |
| `{{SERVICE_AREAS_LINKS}}` | HTML fragment | Yes | One `<li>` per area, capped at 8 in the footer |

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero with inline lead form, services overview, stats band, why us, reviews, service areas preview, insurance CTA, process, FAQ, final CTA |
| `services.html` | All six services in detail plus a materials section |
| `service-areas.html` | Full list of service areas, why-local section |
| `about.html` | Founder story, values, stats, process, final CTA |
| `contact.html` | Two-column contact: info + lead form |
| `assets/style.css` | Shared stylesheet for all pages |
| `assets/script.js` | Mobile menu, scroll header, fade-in, FAQ toggle, form handler |

All pages include `<meta name="robots" content="noindex,nofollow">` so the
demos do not show up in Google. The generator also writes a `_headers` file
in `demo/` that sets `X-Robots-Tag: noindex, nofollow` as a backup.

## Adding a new token

1. Add the placeholder somewhere in a template file, e.g. `{{LICENSE_NUMBER}}`.
2. In `quick-demo.ps1`:
   - Add a `param()` entry, e.g. `[string]$LicenseNumber = ""`.
   - Add it to the `$Tokens` hashtable: `"{{LICENSE_NUMBER}}" = $LicenseNumber`.
   - Add validation or a default if needed.
3. That is it. Rerun with the new flag.

## Adding a new industry template

Create `.templates/<industry>/` with the same file structure (the script does
not yet take an industry parameter, but the directory layout is the same).
When you are ready to wire it up:

1. Add an `-Industry` param to `quick-demo.ps1`.
2. Change `$TemplateDir = Join-Path $ScriptRoot ".templates\roofing"` to
   `Join-Path $ScriptRoot ".templates\$Industry"`.
3. Define industry-specific defaults (years in business, service areas, etc.).

The token system, output handling, and git push logic are all
industry-agnostic, so the same script can drive every template.

## Replacing the placeholder reviews

The reviews section on `index.html` contains three placeholder testimonials
that say "Placeholder. Replace with a real Google review." Once a prospect
has actual Google reviews, paste them in by editing the rendered `demo/index.html`
or, better, by updating the template so future demos for the same prospect
do not need it.

The templates intentionally do not ship with fake reviews, fake stats, or
fake awards. Everything that is generic (like the stats band's "5-star top
rating") reads as aspirational without making a specific false claim.
