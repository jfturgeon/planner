# ==========================================
# Version Increment Script
# ==========================================
# Usage: .\update-version.ps1 -type "patch" (or "minor", "major")
# Or: .\update-version.ps1 -message "My update message"

param(
    [string]$type = "patch",  # patch, minor, major
    [string]$message = ""
)

$versionFile = "version.json"

# Read current version
$content = Get-Content $versionFile -Raw | ConvertFrom-Json

$version = $content.version -split '\.'
[int]$major = $version[0]
[int]$minor = $version[1]
[int]$patch = $version[2]

# Increment based on type
switch ($type.ToLower()) {
    "major" {
        $major++
        $minor = 0
        $patch = 0
        Write-Host "📈 Major version bump" -ForegroundColor Green
    }
    "minor" {
        $minor++
        $patch = 0
        Write-Host "📊 Minor version bump" -ForegroundColor Green
    }
    "patch" {
        $patch++
        Write-Host "🔧 Patch version bump" -ForegroundColor Green
    }
}

# Create new version string
$newVersion = "$major.$minor.$patch"
$content.version = $newVersion
$content.buildNumber += 1
$content.lastUpdate = (Get-Date -Format "yyyy-MM-dd")

# Add changelog entry
$changelogEntry = "$newVersion (Build $($content.buildNumber)): $message"
if ($message) {
    $content.changelog = @($changelogEntry) + $content.changelog
} else {
    $content.changelog = @("$newVersion (Build $($content.buildNumber)): Updated") + $content.changelog
}

# Write back to file
$content | ConvertTo-Json -Depth 10 | Set-Content $versionFile

Write-Host "✅ Version updated: $newVersion (Build $($content.buildNumber))" -ForegroundColor Green
Write-Host "📝 Update date: $($content.lastUpdate)" -ForegroundColor Cyan
Write-Host "💾 File: $versionFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  git add version.json" -ForegroundColor Gray
Write-Host "  git commit -m 'Release v$newVersion'" -ForegroundColor Gray
Write-Host "  git push origin main" -ForegroundColor Gray
