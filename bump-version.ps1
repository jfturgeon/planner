# Bump version script
param(
    [string]$type = "patch"
)

$versionFile = "version.json"
$content = Get-Content $versionFile -Raw | ConvertFrom-Json

$parts = $content.version -split '\.'
[int]$major = $parts[0]
[int]$minor = $parts[1]
[int]$patch = $parts[2]

if ($type -eq "major") {
    $major++
    $minor = 0
    $patch = 0
} elseif ($type -eq "minor") {
    $minor++
    $patch = 0
} else {
    $patch++
}

$newVersion = "$major.$minor.$patch"
$content.version = $newVersion
$content.buildNumber += 1
$content.lastUpdate = (Get-Date -Format "yyyy-MM-dd")

$changelogEntry = "$newVersion (Build $($content.buildNumber)): Updated"
$content.changelog = @($changelogEntry) + $content.changelog

$content | ConvertTo-Json -Depth 10 | Set-Content $versionFile

Write-Host "Version updated: $newVersion (Build $($content.buildNumber))"
