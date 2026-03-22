# ============================================
# LogFi — Auto Deploy to GitHub
# ============================================
# Usage: .\deploy.ps1 "commit message here"
# If no message provided, uses timestamp-based default
# ============================================

param(
    [string]$Message
)

$ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navigate to project
Set-Location $ProjectDir

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║       LogFi — Auto Deploy 🚀        ║" -ForegroundColor Magenta
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "  [ERROR] Git not initialized. Run 'git init' first." -ForegroundColor Red
    exit 1
}

# Check for changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "  [INFO] No changes detected. Nothing to deploy." -ForegroundColor Yellow
    exit 0
}

# Generate commit message
if (-not $Message) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Message = "deploy: auto-deploy at $timestamp"
}

Write-Host "  [1/4] Staging all changes..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) { Write-Host "  [ERROR] git add failed." -ForegroundColor Red; exit 1 }

Write-Host "  [2/4] Committing: '$Message'" -ForegroundColor Cyan
git commit -m "$Message"
if ($LASTEXITCODE -ne 0) { Write-Host "  [ERROR] git commit failed." -ForegroundColor Red; exit 1 }

Write-Host "  [3/4] Pushing to origin/main..." -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] Push failed. Trying with --force-with-lease..." -ForegroundColor Yellow
    git push origin main --force-with-lease
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Push failed even with force-with-lease." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "  [4/4] ✓ Deploy complete!" -ForegroundColor Green
Write-Host ""

# Show summary
$commitHash = git rev-parse --short HEAD
$branch = git branch --show-current
$remote = git remote get-url origin

Write-Host "  ┌─────────────────────────────────────┐" -ForegroundColor DarkGray
Write-Host "  │ Branch  : $branch" -ForegroundColor DarkGray
Write-Host "  │ Commit  : $commitHash" -ForegroundColor DarkGray
Write-Host "  │ Remote  : $remote" -ForegroundColor DarkGray
Write-Host "  │ Message : $Message" -ForegroundColor DarkGray
Write-Host "  └─────────────────────────────────────┘" -ForegroundColor DarkGray
Write-Host ""
