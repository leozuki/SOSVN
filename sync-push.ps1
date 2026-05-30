#!/usr/bin/env pwsh
<#
.SYNOPSIS
  sync-push.ps1 — Push tất cả E:\AI projects lên GitHub
  
.DESCRIPTION
  Script này commit & push toàn bộ E:\AI repos (leozuki/*) lên GitHub.
  Chạy trên MÁY NGUỒN trước khi sync sang máy kia.

.USAGE
  # Push tất cả:
  .\sync-push.ps1

  # Push kèm commit message tùy chỉnh:
  .\sync-push.ps1 -Message "feat: add new feature"

  # Chỉ push repos có thay đổi (dry-run):
  .\sync-push.ps1 -DryRun

.EXAMPLE
  .\sync-push.ps1 -Message "sync: update tests"
#>

param(
  [string]$Message = "sync: auto-commit $(Get-Date -Format 'yyyy-MM-dd HH:mm')",
  [switch]$DryRun  = $false,
  [switch]$SkipClean = $false,
  [string]$Token   = ""
)

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ── Config ──────────────────────────────────────────────────────────────────
# Token priority: -Token param > $env:GH_TOKEN > prompt
if ($Token) {
  $GH_TOKEN = $Token
} elseif ($env:GH_TOKEN) {
  $GH_TOKEN = $env:GH_TOKEN
} else {
  $GH_TOKEN = Read-Host "Enter GitHub Personal Access Token"
}
$GH_USER  = "leozuki"
$AI_DIR   = "E:\AI"

# Repos thuộc leozuki (cần push)
$OWNED_REPOS = @(
  "api-portal", "appf", "arcso", "Attivogymequipmentwebsite",
  "autopost", "bigdata-platform", "chat-extension", "client-atv",
  "client-skelcore", "client-uls-gym", "CRM", "crm-platform", "crm-root",
  "digital-office", "dms-system", "facebook-ads-manager",
  "hubspot-integration", "reposter-extension", "SOSVN", "taomeettrap",
  "videokl", "vortex-ai-website", "web-fleet", "website-build"
)

# Non-git folders — sync via robocopy (không dùng git)
$ROBOCOPY_DIRS = @("hub-launcher", "aura", "nexus", "mira")

# ── Helpers ──────────────────────────────────────────────────────────────────
function Write-Step { param($msg, $color = "Cyan") Write-Host "  $msg" -ForegroundColor $color }
function Write-OK   { Write-Host "  [OK] $args" -ForegroundColor Green }
function Write-WARN { Write-Host "  [!!] $args" -ForegroundColor Yellow }
function Write-ERR  { Write-Host "  [XX] $args" -ForegroundColor Red }

# ── Main ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   E:\AI SYNC — PUSH TO GITHUB               ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host "  Machine : $env:COMPUTERNAME"
Write-Host "  User    : $GH_USER"
Write-Host "  DryRun  : $DryRun"
Write-Host "  Message : $Message"
Write-Host ""

$pushed = 0
$skipped = 0
$errors = 0

foreach ($repo in $OWNED_REPOS) {
  $path = Join-Path $AI_DIR $repo
  if (-not (Test-Path $path)) {
    Write-WARN "$repo — folder not found, skip"
    $skipped++
    continue
  }

  Write-Host "─── $repo" -ForegroundColor Cyan

  # Ensure remote uses token auth
  $remoteUrl = "https://$GH_TOKEN@github.com/$GH_USER/$repo.git"
  git -C $path remote set-url origin $remoteUrl 2>$null

  # Check for changes
  $changes = git -C $path status --short 2>$null
  $ahead   = git -C $path rev-list --count "@{upstream}..HEAD" 2>$null

  if ($changes) {
    Write-Step "  $($changes.Count) file(s) changed — staging all..."
    if (-not $DryRun) {
      git -C $path add -A 2>&1 | Out-Null
      git -C $path commit -m $Message 2>&1 | Out-Null
    } else {
      Write-Step "  [DRY-RUN] would commit: $Message"
    }
  }

  # Push
  $ahead = git -C $path rev-list --count "@{upstream}..HEAD" 2>$null
  if ($ahead -gt 0 -or $changes) {
    Write-Step "  Pushing $ahead commit(s)..."
    if (-not $DryRun) {
      $result = git -C $path push origin HEAD 2>&1
      if ($LASTEXITCODE -eq 0) {
        Write-OK "$repo pushed"
        $pushed++
      } else {
        Write-ERR "$repo push failed: $result"
        $errors++
      }
    } else {
      Write-Step "  [DRY-RUN] would push"
      $pushed++
    }
  } else {
    Write-OK "$repo up-to-date, skip"
    $skipped++
  }
}

# ── Handle mira (no remote yet — init & push) ──────────────────────────────
$miraPath = Join-Path $AI_DIR "mira"
if (Test-Path $miraPath) {
  Write-Host "─── mira (init git if needed)" -ForegroundColor Cyan
  if (-not (Test-Path "$miraPath\.git")) {
    Write-Step "Initializing git repo for mira..."
    if (-not $DryRun) {
      git -C $miraPath init 2>&1 | Out-Null
      git -C $miraPath add -A 2>&1 | Out-Null
      git -C $miraPath commit -m "init: initial commit" 2>&1 | Out-Null
      git -C $miraPath branch -M main 2>&1 | Out-Null
      git -C $miraPath remote add origin "https://$GH_TOKEN@github.com/$GH_USER/mira.git" 2>&1 | Out-Null
      # Create repo on GitHub if it doesn't exist
      $headers = @{ Authorization = "token $GH_TOKEN"; "Content-Type" = "application/json" }
      $body = '{"name":"mira","private":true,"description":"MIRA AI Memory Intelligence"}'
      try { Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Headers $headers -Body $body | Out-Null } catch {}
      git -C $miraPath push -u origin main 2>&1 | Out-Null
      Write-OK "mira initialized and pushed"
      $pushed++
    }
  } else {
    $changes = git -C $miraPath status --short 2>$null
    if ($changes) {
      git -C $miraPath add -A 2>&1 | Out-Null
      git -C $miraPath commit -m $Message 2>&1 | Out-Null
    }
    git -C $miraPath push 2>&1 | Out-Null
    Write-OK "mira pushed"
    $pushed++
  }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   PUSH COMPLETE                              ║" -ForegroundColor Blue
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host "  Pushed  : $pushed"
Write-Host "  Skipped : $skipped"
Write-Host "  Errors  : $errors"
Write-Host ""
if ($errors -gt 0) {
  Write-Host "  ⚠ Some repos failed. Check output above." -ForegroundColor Yellow
} else {
  Write-Host "  ✅ All good! Run sync-pull.ps1 on the other machine." -ForegroundColor Green
}
Write-Host ""
