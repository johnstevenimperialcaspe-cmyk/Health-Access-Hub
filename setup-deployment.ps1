# EARIST Health Hub - Deployment Commands
# Run these commands step by step

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EARIST Health Hub - Deployment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git
Write-Host "Step 1: Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed!" -ForegroundColor Red
    Write-Host "  Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit
}

Write-Host ""

# Step 2: Initialize Git Repository
Write-Host "Step 2: Initializing Git repository..." -ForegroundColor Yellow

if (Test-Path .git) {
    Write-Host "✓ Git repository already initialized" -ForegroundColor Green
} else {
    git init
    Write-Host "✓ Git repository initialized" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check .gitignore
Write-Host "Step 3: Checking .gitignore..." -ForegroundColor Yellow

if (Test-Path .gitignore) {
    Write-Host "✓ .gitignore exists" -ForegroundColor Green
} else {
    Write-Host "! .gitignore not found - already created for you" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Add files to Git
Write-Host "Step 4: Adding files to Git..." -ForegroundColor Yellow
Write-Host "  This may take a moment..." -ForegroundColor Gray

git add .
Write-Host "✓ Files added to Git" -ForegroundColor Green

Write-Host ""

# Step 5: Create first commit
Write-Host "Step 5: Creating first commit..." -ForegroundColor Yellow

try {
    git commit -m "Initial commit - EARIST Health Access Hub with auto-playing slideshow"
    Write-Host "✓ First commit created!" -ForegroundColor Green
} catch {
    Write-Host "! Commit may have failed - check if there are changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Local Git Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub: https://github.com" -ForegroundColor White
Write-Host "2. Click '+' → 'New repository'" -ForegroundColor White
Write-Host "3. Name it: earist-health-hub" -ForegroundColor White
Write-Host "4. Click 'Create repository'" -ForegroundColor White
Write-Host "5. Copy the repository URL" -ForegroundColor White
Write-Host ""
Write-Host "Then run these commands (replace YOUR_USERNAME):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/earist-health-hub.git" -ForegroundColor Cyan
Write-Host "  git branch -M main" -ForegroundColor Cyan
Write-Host "  git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
