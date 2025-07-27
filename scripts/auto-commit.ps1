# Auto-Commit Script for ProjectPlanner
# This script automates the commit and changelog update process

param(
    [string]$Message = "",
    [switch]$NoPush = $false
)

Write-Host "🚀 ProjectPlanner Auto-Commit Script" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Check if Git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Git repository not initialized. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Get current timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$date = Get-Date -Format "yyyy-MM-dd"
$time = Get-Date -Format "HH:mm:ss"

Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Cyan

# Check Git status
Write-Host "`n📊 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if (-not $gitStatus) {
    Write-Host "📝 No changes detected. Nothing to commit." -ForegroundColor Yellow
    exit 0
}

# Count changed files
$changedFiles = $gitStatus -split "`n" | Where-Object { $_ -ne "" }
$fileCount = $changedFiles.Count

Write-Host "📦 Found $fileCount changed files:" -ForegroundColor Green
$changedFiles | ForEach-Object {
    $status = $_.Substring(0, 2).Trim()
    $file = $_.Substring(3)
    Write-Host "  $status $file" -ForegroundColor Gray
}

# Generate commit message
if ($Message -eq "") {
    $Message = "Development session $date $time - $fileCount files updated"
}

$commitMessage = "feat: $Message"

Write-Host "`n💾 Commit message: $commitMessage" -ForegroundColor Cyan

# Add all changes
Write-Host "`n📦 Adding files to staging..." -ForegroundColor Yellow
try {
    git add .
    Write-Host "✅ Files staged successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error staging files: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Commit changes
Write-Host "`n💾 Committing changes..." -ForegroundColor Yellow
try {
    git commit -m $commitMessage
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Error committing changes: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Get commit hash
$commitHash = git rev-parse --short HEAD

# Update changelog
Write-Host "`n📝 Updating changelog..." -ForegroundColor Yellow
try {
    $changelogPath = "CHANGELOG.md"

    if (Test-Path $changelogPath) {
        $changelog = Get-Content $changelogPath -Raw

        # Create new entry
        $newEntry = @"

### $date - $time
- **$commitHash** - $Message
  - Files changed: $fileCount
  - Changed files: $($changedFiles -join ', ')
  - Status: $($changedFiles -join ', ')

"@

        # Insert new entry after the "## Commit Log" section
        $commitLogIndex = $changelog.IndexOf("## Commit Log")
        if ($commitLogIndex -ne -1) {
            $beforeCommitLog = $changelog.Substring(0, $commitLogIndex)
            $afterCommitLog = $changelog.Substring($commitLogIndex)
            $changelog = $beforeCommitLog + $newEntry + $afterCommitLog
        } else {
            # If no commit log section, add it
            $changelog += "`n## Commit Log`n`n$newEntry"
        }

        Set-Content -Path $changelogPath -Value $changelog
        Write-Host "✅ Changelog updated successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Changelog.md not found. Skipping changelog update." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error updating changelog: $($_.Exception.Message)" -ForegroundColor Red
}

# Push to remote (unless NoPush is specified)
if (-not $NoPush) {
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
    try {
        git push origin master
        Write-Host "✅ Changes pushed to GitHub successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error pushing to GitHub: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 You can push manually later with: git push origin master" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⏸️  Skipping push to GitHub (NoPush flag specified)" -ForegroundColor Yellow
}

Write-Host "`n✅ Auto-commit completed successfully!" -ForegroundColor Green
Write-Host "📋 Commit: $commitMessage" -ForegroundColor Cyan
Write-Host "🔗 Repository: https://github.com/ConstructBMS/ProjectPlanner" -ForegroundColor Blue
Write-Host "📝 Hash: $commitHash" -ForegroundColor Gray

# Show summary
Write-Host "`n📊 Summary:" -ForegroundColor Green
Write-Host "  • Files changed: $fileCount" -ForegroundColor Gray
Write-Host "  • Commit hash: $commitHash" -ForegroundColor Gray
Write-Host "  • Timestamp: $timestamp" -ForegroundColor Gray
if (-not $NoPush) {
    Write-Host "  • Pushed to GitHub: Yes" -ForegroundColor Gray
} else {
    Write-Host "  • Pushed to GitHub: No (skipped)" -ForegroundColor Gray
}
