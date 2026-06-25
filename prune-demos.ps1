<#
.SYNOPSIS
  Take down expired prospect demos under /demo/ to keep revvancegroup.com tidy.

.DESCRIPTION
  Every demo built under demo/<slug>/ is registered in demo/_registry.json with an
  "expires" date (the last day it should be live). This script removes the folders
  whose expiry has passed, drops them from the registry, and (optionally) commits +
  pushes so Cloudflare Pages takes them off the live site.

  Note: each demo ALSO has a client-side auto-expiry baked into its index.html, so a
  prospect who opens the link after the expiry date sees an "expired" card even before
  this script runs. This script is the cleanup that physically removes the files.

.PARAMETER WhatIf
  Show what would be removed without deleting anything.

.PARAMETER Push
  After pruning, git add/commit/push so the takedown goes live.

.EXAMPLE
  .\prune-demos.ps1                # remove expired demos locally
  .\prune-demos.ps1 -WhatIf        # preview only
  .\prune-demos.ps1 -Push          # remove expired demos and push live
#>
[CmdletBinding()]
param(
  [switch]$WhatIf,
  [switch]$Push
)

$ErrorActionPreference = "Stop"
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) { $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path }
$DemoDir  = Join-Path $ScriptRoot "demo"
$RegPath  = Join-Path $DemoDir "_registry.json"

if (-not (Test-Path $RegPath)) {
  Write-Host "No registry at $RegPath. Nothing to prune." -ForegroundColor Yellow
  exit 0
}

$reg = Get-Content $RegPath -Raw | ConvertFrom-Json
$today = (Get-Date).Date
$kept = @()
$removed = @()

foreach ($d in $reg.demos) {
  $exp = [datetime]::ParseExact($d.expires, 'yyyy-MM-dd', $null).Date
  $folder = Join-Path $DemoDir $d.slug
  if ($today -gt $exp) {
    if (Test-Path $folder) {
      if ($WhatIf) {
        Write-Host "WOULD REMOVE  $($d.business)  ($($d.slug))  expired $($d.expires)" -ForegroundColor Yellow
      } else {
        Remove-Item $folder -Recurse -Force
        Write-Host "REMOVED       $($d.business)  ($($d.slug))  expired $($d.expires)" -ForegroundColor Green
      }
    } else {
      Write-Host "ALREADY GONE  $($d.business)  ($($d.slug))" -ForegroundColor DarkGray
    }
    $removed += $d
  } else {
    $daysLeft = ($exp - $today).Days
    Write-Host "KEEP          $($d.business)  ($($d.slug))  $daysLeft day(s) left (expires $($d.expires))" -ForegroundColor Cyan
    $kept += $d
  }
}

if ($removed.Count -eq 0) {
  Write-Host ""
  Write-Host "No expired demos. Nothing to take down." -ForegroundColor Green
  exit 0
}

if ($WhatIf) {
  Write-Host ""
  Write-Host "WhatIf: $($removed.Count) demo(s) would be removed. No changes made." -ForegroundColor Yellow
  exit 0
}

# Rewrite the registry without the removed demos.
$reg.demos = $kept
$reg | ConvertTo-Json -Depth 6 | Set-Content $RegPath -Encoding UTF8
Write-Host ""
Write-Host "Registry updated. $($removed.Count) demo(s) taken down, $($kept.Count) still live." -ForegroundColor Green

if ($Push) {
  Push-Location $ScriptRoot
  $ErrorActionPreference = 'Continue'
  try {
    & git add demo/ 2>$null
    & git commit -m "demo: prune expired prospect demos" 2>$null | Out-Null
    & git push origin main 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Pushed. Takedown will be live in ~60-90 seconds." -ForegroundColor Green
    } else {
      Write-Host "Pruned locally, but git push failed. Run 'git push' manually." -ForegroundColor Red
    }
  } finally {
    Pop-Location
  }
}
