// ==========================================
// Version Management
// ==========================================

let appVersion = null;

async function loadVersion() {
  try {
    const response = await fetch('version.json');
    if (!response.ok) throw new Error('Failed to load version');
    appVersion = await response.json();
    console.log(`📦 App version: ${appVersion.version} (Build ${appVersion.buildNumber})`);
    displayVersion();
    return appVersion;
  } catch (error) {
    console.error('❌ Error loading version:', error);
    // Fallback version
    appVersion = { version: '0.0.0', buildNumber: 0 };
    return appVersion;
  }
}

function displayVersion() {
  if (!appVersion) return;
  
  // Display in console
  console.log(`%c🚀 Planificateur v${appVersion.version}`, 'color: #10b981; font-weight: bold; font-size: 12px;');
  
  // Add version to footer (if element exists)
  const footerVersion = document.getElementById('footerVersion');
  if (footerVersion) {
    footerVersion.textContent = `v${appVersion.version} (Build ${appVersion.buildNumber})`;
    footerVersion.title = `Updated: ${appVersion.lastUpdate}`;
  }
  
  // Also check for versionBadge (backward compatibility)
  const versionBadge = document.getElementById('versionBadge');
  if (versionBadge) {
    versionBadge.textContent = `v${appVersion.version}`;
    versionBadge.title = `Build ${appVersion.buildNumber} - Updated: ${appVersion.lastUpdate}`;
  }
}

function getVersion() {
  return appVersion ? appVersion.version : 'unknown';
}

function getBuildNumber() {
  return appVersion ? appVersion.buildNumber : 0;
}
