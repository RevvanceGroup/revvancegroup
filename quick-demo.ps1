<#
.SYNOPSIS
  Generate a customized roofing demo site from .templates/roofing/ and push it
  to revvancegroup.com/demo/ in 60-90 seconds.

.DESCRIPTION
  Reads the multi-page roofing template, swaps in the prospect's business
  details, writes the output to ./demo/, then commits and pushes to main so
  Cloudflare Pages auto-deploys.

.PARAMETER BusinessName
  The prospect's business name. Required. Example: "Smith Roofing"

.PARAMETER City
  Primary city the business serves. Required. Example: "Tampa"

.PARAMETER State
  Two-letter state code. Required. Example: "FL"

.PARAMETER Phone
  10-digit phone, digits only or with formatting. Required. Example: "8135550100"

.PARAMETER Email
  Optional. Defaults to info@<businessname>.com

.PARAMETER Address
  Optional street address. Defaults to a placeholder.

.PARAMETER YearFounded
  Optional 4-digit year. Defaults to current year - 12.

.PARAMETER ServiceAreas
  Optional comma-separated list of cities. If empty, the script generates a
  reasonable set based on the primary city.

.PARAMETER NoPush
  Skip the git commit + push. Useful for local testing.

.EXAMPLE
  .\quick-demo.ps1 -BusinessName "Smith Roofing" -City "Tampa" -State "FL" -Phone "8135550100"

.EXAMPLE
  .\quick-demo.ps1 -BusinessName "Apex Roofing Co" -City "Dallas" -State "TX" `
                   -Phone "2145550199" -YearFounded 2008 `
                   -ServiceAreas "Plano,Frisco,Allen,McKinney,Richardson"
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$BusinessName,
  [Parameter(Mandatory=$true)][string]$City,
  [Parameter(Mandatory=$true)][string]$State,
  [Parameter(Mandatory=$true)][string]$Phone,
  [string]$Email = "",
  [string]$Address = "",
  [int]$YearFounded = 0,
  [string]$ServiceAreas = "",
  [switch]$NoPush
)

$ErrorActionPreference = "Stop"

# Resolve paths relative to the script itself, not the working directory.
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) { $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path }
$TemplateDir = Join-Path $ScriptRoot ".templates\roofing"
$OutDir = Join-Path $ScriptRoot "demo"

if (-not (Test-Path $TemplateDir)) {
  Write-Host "ERROR: Template directory not found at $TemplateDir" -ForegroundColor Red
  exit 1
}

# ============================================================
# State code -> full state name lookup
# ============================================================
$StateMap = @{
  "AL" = "Alabama"; "AK" = "Alaska"; "AZ" = "Arizona"; "AR" = "Arkansas";
  "CA" = "California"; "CO" = "Colorado"; "CT" = "Connecticut"; "DE" = "Delaware";
  "FL" = "Florida"; "GA" = "Georgia"; "HI" = "Hawaii"; "ID" = "Idaho";
  "IL" = "Illinois"; "IN" = "Indiana"; "IA" = "Iowa"; "KS" = "Kansas";
  "KY" = "Kentucky"; "LA" = "Louisiana"; "ME" = "Maine"; "MD" = "Maryland";
  "MA" = "Massachusetts"; "MI" = "Michigan"; "MN" = "Minnesota"; "MS" = "Mississippi";
  "MO" = "Missouri"; "MT" = "Montana"; "NE" = "Nebraska"; "NV" = "Nevada";
  "NH" = "New Hampshire"; "NJ" = "New Jersey"; "NM" = "New Mexico"; "NY" = "New York";
  "NC" = "North Carolina"; "ND" = "North Dakota"; "OH" = "Ohio"; "OK" = "Oklahoma";
  "OR" = "Oregon"; "PA" = "Pennsylvania"; "RI" = "Rhode Island"; "SC" = "South Carolina";
  "SD" = "South Dakota"; "TN" = "Tennessee"; "TX" = "Texas"; "UT" = "Utah";
  "VT" = "Vermont"; "VA" = "Virginia"; "WA" = "Washington"; "WV" = "West Virginia";
  "WI" = "Wisconsin"; "WY" = "Wyoming"; "DC" = "District of Columbia"
}

$StateUpper = $State.ToUpper()
if (-not $StateMap.ContainsKey($StateUpper)) {
  Write-Host "ERROR: '$State' is not a recognized 2-letter US state code." -ForegroundColor Red
  exit 1
}
$StateFull = $StateMap[$StateUpper]

# ============================================================
# Normalize phone
# ============================================================
$PhoneDigits = ($Phone -replace '\D', '')
if ($PhoneDigits.Length -ne 10) {
  Write-Host "ERROR: Phone must be 10 digits. Got: $PhoneDigits ($($PhoneDigits.Length) digits)" -ForegroundColor Red
  exit 1
}
$PhoneRaw = $PhoneDigits
$PhoneFormatted = "({0}) {1}-{2}" -f $PhoneDigits.Substring(0,3), $PhoneDigits.Substring(3,3), $PhoneDigits.Substring(6,4)

# ============================================================
# Defaults
# ============================================================
$CurrentYear = (Get-Date).Year

if ($YearFounded -eq 0) {
  $YearFounded = $CurrentYear - 12
}
if ($YearFounded -gt $CurrentYear -or $YearFounded -lt 1900) {
  Write-Host "ERROR: YearFounded must be between 1900 and $CurrentYear. Got: $YearFounded" -ForegroundColor Red
  exit 1
}
$YearsInBusiness = $CurrentYear - $YearFounded
if ($YearsInBusiness -lt 1) { $YearsInBusiness = 1 }

if ([string]::IsNullOrWhiteSpace($Email)) {
  # Strip non-alphanumeric for a tidy default email domain.
  $emailHandle = ($BusinessName -replace '[^a-zA-Z0-9]', '').ToLower()
  if ([string]::IsNullOrWhiteSpace($emailHandle)) { $emailHandle = "info" }
  $Email = "info@$emailHandle.com"
}

if ([string]::IsNullOrWhiteSpace($Address)) {
  $Address = "$City, $StateUpper"
}

# ============================================================
# Service areas
# ============================================================
$AreasList = @()
if (-not [string]::IsNullOrWhiteSpace($ServiceAreas)) {
  $AreasList = $ServiceAreas.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
}
if ($AreasList.Count -eq 0) {
  # Sensible default: primary city + a "Surrounding Areas" entry. Cody can rerun
  # with -ServiceAreas to override.
  $AreasList = @($City, "Surrounding $StateFull Communities")
}

# Tiny inline HTML escaper. Avoids the System.Web assembly dependency, which
# is not loaded by default in Windows PowerShell 5.1.
function ConvertTo-HtmlSafe([string]$s) {
  if ($null -eq $s) { return "" }
  return $s.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&#39;')
}

# Build the HTML fragments for service-area pills and footer links.
$AreasPillsHtml = ($AreasList | ForEach-Object {
  $area = ConvertTo-HtmlSafe $_
  "<div class=`"area-pill`"><svg viewBox=`"0 0 24 24`"><path d=`"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z`"/></svg>$area</div>"
}) -join "`n      "

# Footer list: cap at 8 entries to avoid stretching the footer column.
$AreasForFooter = if ($AreasList.Count -gt 8) { $AreasList[0..7] } else { $AreasList }
$AreasLinksHtml = ($AreasForFooter | ForEach-Object {
  $area = ConvertTo-HtmlSafe $_
  "<li>$area</li>"
}) -join "`n          "

# ============================================================
# Token table
# ============================================================
$Tokens = @{
  "{{BUSINESS_NAME}}"       = $BusinessName
  "{{CITY}}"                = $City
  "{{STATE}}"               = $StateUpper
  "{{STATE_FULL}}"          = $StateFull
  "{{PHONE}}"               = $PhoneFormatted
  "{{PHONE_RAW}}"           = $PhoneRaw
  "{{EMAIL}}"               = $Email
  "{{ADDRESS}}"             = $Address
  "{{YEAR_FOUNDED}}"        = $YearFounded
  "{{YEARS_IN_BUSINESS}}"   = $YearsInBusiness
  "{{CURRENT_YEAR}}"        = $CurrentYear
  "{{SERVICE_AREAS_PILLS}}" = $AreasPillsHtml
  "{{SERVICE_AREAS_LINKS}}" = $AreasLinksHtml
}

# ============================================================
# Prepare output directory (preserve _headers + .gitignore-like sentinels)
# ============================================================
if (Test-Path $OutDir) {
  Get-ChildItem -Path $OutDir -Force | Where-Object {
    $_.Name -notmatch '^\.git'
  } | Remove-Item -Recurse -Force
} else {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

# ============================================================
# Process template files
# ============================================================
$templateFiles = Get-ChildItem -Path $TemplateDir -Recurse -File | Where-Object {
  # Skip the README and anything inside an assets/ subfolder we want to copy verbatim later.
  $_.Name -ne "README.md"
}

$totalFiles = 0
foreach ($file in $templateFiles) {
  $relativePath = $file.FullName.Substring($TemplateDir.Length).TrimStart('\','/')
  $outPath = Join-Path $OutDir $relativePath

  $outParent = Split-Path -Parent $outPath
  if ($outParent -and -not (Test-Path $outParent)) {
    New-Item -ItemType Directory -Path $outParent -Force | Out-Null
  }

  # Read as raw UTF8 text.
  $content = [System.IO.File]::ReadAllText($file.FullName)

  foreach ($key in $Tokens.Keys) {
    $content = $content.Replace($key, [string]$Tokens[$key])
  }

  # Write UTF8 without BOM so Cloudflare Pages serves clean bytes.
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($outPath, $content, $utf8NoBom)
  $totalFiles++
}

# NOTE: noindex for /demo/* is set in the root _headers file at the repo root.
# Cloudflare Pages only honors _headers at the output root, not in subfolders,
# so we do NOT write one to ./demo/. Every template page also includes a
# <meta name="robots" content="noindex,nofollow"> tag as a belt-and-suspenders.

Write-Host ""
Write-Host "Demo generated." -ForegroundColor Green
Write-Host "  Business:       $BusinessName"
Write-Host "  Location:       $City, $StateUpper ($StateFull)"
Write-Host "  Phone:          $PhoneFormatted"
Write-Host "  Email:          $Email"
Write-Host "  Year founded:   $YearFounded  ($YearsInBusiness+ years)"
Write-Host "  Service areas:  $($AreasList -join ', ')"
Write-Host "  Files written:  $totalFiles"
Write-Host "  Output:         $OutDir"
Write-Host ""

# ============================================================
# Git commit + push
# ============================================================
if ($NoPush) {
  Write-Host "NoPush flag set. Skipping git commit and push." -ForegroundColor Yellow
  Write-Host "Open file://$OutDir/index.html to review locally."
  exit 0
}

Push-Location $ScriptRoot
try {
  $gitStatus = git status --porcelain demo/ 2>&1
  if ([string]::IsNullOrWhiteSpace($gitStatus)) {
    Write-Host "No changes to commit. Demo content already matches what is in main." -ForegroundColor Yellow
    Write-Host "Live at https://revvancegroup.com/demo/"
    exit 0
  }

  git add demo/ 2>&1 | Out-Null
  $commitMsg = "demo: regenerate roofing demo for $BusinessName ($City, $StateUpper)"
  git commit -m $commitMsg 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git commit failed." -ForegroundColor Red
    exit 1
  }

  git push origin main 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: git push failed. Demo files were committed locally but not pushed." -ForegroundColor Red
    exit 1
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Demo pushed. Live in 60-90 seconds at https://revvancegroup.com/demo/" -ForegroundColor Green
