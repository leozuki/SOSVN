#!/usr/bin/env pwsh
<#
.SYNOPSIS
  sync-pull.ps1 — Pull tất cả E:\AI projects từ GitHub về MÁY 2
  
.DESCRIPTION
  Clone hoặc pull toàn bộ leozuki repos + 3rd-party repos về E:\AI trên máy thứ 2.
  Chạy script này trên MÁY ĐÍCH sau khi sync-push.ps1 đã chạy xong ở máy nguồn.

.USAGE
  # Pull tất cả:
  .\sync-pull.ps1

  # Chỉ pull repos của leozuki (bỏ qua 3rd-party):
  .\sync-pull.ps1 -OwnedOnly

  # Force reset (bỏ qua local changes):
  .\sync-pull.ps1 -Force

.EXAMPLE
  # Lần đầu setup trên máy mới:
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
  New-Item -ItemType Directory -Force "E:\AI" | Out-Null
  cd E:\AI
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/leozuki/SOSVN/main/sync-pull.ps1" -OutFile sync-pull.ps1
  .\sync-pull.ps1
#>

param(
  [switch]$OwnedOnly = $false,
  [switch]$Force     = $false,
  [switch]$DryRun    = $false,
  [string]$Token     = ""
)

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ── Config ───────────────────────────────────────────────────────────────────
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

# Repos của leozuki (private OK với token)
$OWNED_REPOS = @(
  "api-portal", "appf", "arcso", "Attivogymequipmentwebsite",
  "autopost", "bigdata-platform", "chat-extension", "client-atv",
  "client-skelcore", "client-uls-gym", "CRM", "crm-platform", "crm-root",
  "digital-office", "dms-system", "facebook-ads-manager",
  "hubspot-integration", "mira", "reposter-extension", "SOSVN",
  "taomeettrap", "videokl", "vortex-ai-website", "web-fleet", "website-build"
)

# Repos 3rd-party (public, không cần token)
$THIRD_PARTY_REPOS = @(
  @{ name = "addyosmani-agent-skills";  url = "https://github.com/addyosmani/agent-skills.git" },
  @{ name = "antigravity-awesome-skills"; url = "https://github.com/sickn33/antigravity-awesome-skills.git" },
  @{ name = "antigravity-kit";          url = "https://github.com/duongductrong/antigravity-kit.git" },
  @{ name = "antigravity-testing-kit";  url = "https://github.com/anhtester/antigravity-testing-kit.git" },
  @{ name = "graphify";                 url = "https://github.com/safishamsi/graphify.git" },
  @{ name = "hyperframes";              url = "https://github.com/heygen-com/hyperframes.git" },
  @{ name = "open-design";              url = "https://github.com/nexu-io/open-design.git" },
  @{ name = "ui-ux-pro-max-skill";      url = "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git" },
  @{ name = "vudovn-AntiGravity-Kit";   url = "https://github.com/VisualxIntelligence/vudovn-AntiGravity-Kit.git" }
)

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-OK   { Write-Host "  [OK] $args" -ForegroundColor Green }
function Write-WARN { Write-Host "  [!!] $args" -ForegroundColor Yellow }
function Write-ERR  { Write-Host "  [XX] $args" -ForegroundColor Red }
function Write-Step { Write-Host "  --> $args" -ForegroundColor Gray }

function Sync-Repo {
  param([string]$name, [string]$url)
  $path = Join-Path $AI_DIR $name
  
  if (Test-Path "$path\.git") {
    Write-Step "Pulling $name..."
    if (-not $DryRun) {
      if ($Force) {
        git -C $path fetch origin 2>&1 | Out-Null
        git -C $path reset --hard origin/HEAD 2>&1 | Out-Null
      } else {
        git -C $path pull --rebase origin HEAD 2>&1 | Out-Null
      }
    }
    Write-OK "$name updated"
    return $true
  } else {
    Write-Step "Cloning $name..."
    if (-not $DryRun) {
      New-Item -ItemType Directory -Force $path | Out-Null
      $result = git clone $url $path 2>&1
      if ($LASTEXITCODE -ne 0) {
        Write-ERR "$name clone failed: $result"
        return $false
      }
    }
    Write-OK "$name cloned"
    return $true
  }
}

# ── Main ──────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   E:\AI SYNC — PULL FROM GITHUB             ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host "  Machine : $env:COMPUTERNAME"
Write-Host "  DryRun  : $DryRun"
Write-Host "  Force   : $Force"
Write-Host ""

New-Item -ItemType Directory -Force $AI_DIR | Out-Null

$success = 0; $failed = 0

# Pull leozuki repos
Write-Host "── Syncing leozuki repos ($($OWNED_REPOS.Count)) ──" -ForegroundColor Cyan
foreach ($repo in $OWNED_REPOS) {
  $url = "https://$GH_TOKEN@github.com/$GH_USER/$repo.git"
  Write-Host "  $repo" -NoNewline
  if (Sync-Repo -name $repo -url $url) { $success++ } else { $failed++ }
}

# Pull 3rd-party repos
if (-not $OwnedOnly) {
  Write-Host ""
  Write-Host "── Syncing 3rd-party repos ($($THIRD_PARTY_REPOS.Count)) ──" -ForegroundColor Cyan
  foreach ($r in $THIRD_PARTY_REPOS) {
    Write-Host "  $($r.name)" -NoNewline
    if (Sync-Repo -name $r.name -url $r.url) { $success++ } else { $failed++ }
  }
}

# Sync hub-launcher (from leozuki if exists, else manual note)
Write-Host ""
Write-Host "── Syncing hub-launcher ──" -ForegroundColor Cyan
$hubUrl = "https://$GH_TOKEN@github.com/$GH_USER/hub-launcher.git"
$hubPath = "E:\AI\hub-launcher"
if (Test-Path "$hubPath\.git") {
  git -C $hubPath pull --rebase 2>&1 | Out-Null
  Write-OK "hub-launcher pulled"
  $success++
} else {
  # Try clone first
  $result = git clone $hubUrl $hubPath 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-OK "hub-launcher cloned"
    $success++
  } else {
    Write-WARN "hub-launcher not on GitHub — copy manually or use robocopy"
  }
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   PULL COMPLETE                              ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host "  Success : $success"
Write-Host "  Failed  : $failed"
Write-Host ""

if ($failed -eq 0) {
  Write-Host "  ✅ All repos synced! E:\AI is up-to-date." -ForegroundColor Green
  Write-Host ""
  Write-Host "  Next steps:" -ForegroundColor White
  Write-Host "  1. cd E:\AI\hub-launcher && npm install && npm run dev" -ForegroundColor White
  Write-Host "  2. Check each project's .env files (not synced via git)" -ForegroundColor Yellow
  Write-Host "  3. Run: npx jest --config E:\AI\jest.config.js --no-coverage" -ForegroundColor White
} else {
  Write-Host "  ⚠ $failed repos failed. Check output above." -ForegroundColor Yellow
}
Write-Host ""
