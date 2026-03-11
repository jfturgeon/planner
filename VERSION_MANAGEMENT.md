# 📦 Version Management Guide

## System Overview

The app now has an automatic version tracking system that displays the version in the header and in the console.

### Files

- **`version.json`** - Stores current version, build number, and changelog
- **`version.js`** - JavaScript module that loads and displays the version
- **`update-version.ps1`** - PowerShell script to increment version before commits

## Usage

### Option 1: Manual Version Increment (Recommended)

Before each `git push`:

```powershell
# Patch version bump (1.0.0 → 1.0.1)
.\update-version.ps1 -type patch -message "Your change description"

# Minor version bump (1.0.0 → 1.1.0)
.\update-version.ps1 -type minor -message "New feature added"

# Major version bump (1.0.0 → 2.0.0)
.\update-version.ps1 -type major -message "Breaking changes"
```

### Option 2: Quick Patch (Default)

```powershell
# Just run without parameters (defaults to patch bump)
.\update-version.ps1
```

## Workflow

1. **Make your changes** in the code
2. **Test everything** works correctly
3. **Update version:**
   ```powershell
   .\update-version.ps1 -type patch -message "Fixed login form"
   ```
4. **Commit changes:**
   ```powershell
   git add -A
   git commit -m "Fix: Login form validation errors"
   ```
5. **Push to GitHub:**
   ```powershell
   git push origin main
   ```

## Version Display

### In Browser

The version badge appears in the top-right corner of the app header:
- **Displays:** `v1.0.0` (or current version)
- **Hover tooltip:** Shows build number and last update date
- **Gray styling:** Subtle but always visible

### In Console

Open Developer Console (F12) to see:
```
📦 App version: 1.0.0 (Build 1)
🚀 Planificateur v1.0.0
```

## Version Format

Uses **Semantic Versioning (SemVer)**:

- **MAJOR** (1.0.0) - Breaking changes
- **MINOR** (1.2.0) - New features, backward compatible
- **PATCH** (1.0.5) - Bug fixes, tiny improvements

## Example Changelog

```json
{
  "version": "1.0.5",
  "buildNumber": 6,
  "lastUpdate": "2026-03-10",
  "changelog": [
    "1.0.5 (Build 6): Fixed form toggle button",
    "1.0.4 (Build 5): Fixed Supabase declaration errors",
    "1.0.3 (Build 4): Added comprehensive logging",
    "1.0.0 (Build 1): Initial release with Supabase authentication"
  ]
}
```

## Notes

- **Build Number:** Auto-increments with each version update (not same as version number)
- **Last Update:** Automatically set to current date when version bumps
- **Changelog:** Kept in reverse chronological order (newest first)
- **Version Badge:** Always visible in the app header for quick reference

---

**Tip:** For CI/CD automation, you could modify `update-version.ps1` to run automatically on pre-push hooks!
