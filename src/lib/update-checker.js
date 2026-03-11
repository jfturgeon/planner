// ═══════════════════════════════════════════════════════════════════════════
// UPDATE CHECKER — Detect new versions and prompt user to refresh
// ═══════════════════════════════════════════════════════════════════════════

let currentVersion = null;
let updateCheckInterval = null;

async function loadCurrentVersion() {
  try {
    const response = await fetch('version.json?t=' + Date.now());
    const data = await response.json();
    return data.version;
  } catch (error) {
    console.error('❌ Failed to load version:', error);
    return null;
  }
}

async function checkForUpdates() {
  try {
    const latestVersion = await loadCurrentVersion();
    
    if (!currentVersion) {
      currentVersion = latestVersion;
      return;
    }
    
    if (latestVersion && latestVersion !== currentVersion) {
      console.log(`🎉 New version available: ${latestVersion} (current: ${currentVersion})`);
      showUpdateNotification(latestVersion);
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
}

function showUpdateNotification(newVersion) {
  // Create notification container
  const container = document.getElementById('appUpdateNotification') || (() => {
    const div = document.createElement('div');
    div.id = 'appUpdateNotification';
    document.body.appendChild(div);
    return div;
  })();

  // Create notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--accent2, #2d6bbf) 0%, var(--accent, #3b82f6) 100%);
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    z-index: 9999;
    max-width: 350px;
    font-family: 'DM Sans', sans-serif;
  `;

  notification.innerHTML = `
    <div style="display: flex; gap: 12px; align-items: flex-start;">
      <div style="flex-shrink: 0; font-size: 1.2rem;">✨</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 6px;">Nouvelle version disponible</div>
        <div style="font-size: 0.9rem; opacity: 0.95; margin-bottom: 10px;">
          Version ${newVersion} est maintenant disponible. Rechargez la page pour mettre à jour.
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="updateBtn" style="
            flex: 1;
            padding: 8px 12px;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.85rem;
          ">Rafraîchir maintenant</button>
          <button id="dismissBtn" style="
            padding: 8px 12px;
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            font-size: 0.85rem;
          ">Ignorer</button>
        </div>
      </div>
      <button style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        width: 24px;
        height: 24px;
      " onclick="this.closest('div').remove();">×</button>
    </div>
  `;

  container.appendChild(notification);

  // Button handlers
  notification.querySelector('#updateBtn').addEventListener('click', () => {
    console.log('🔄 Reloading page for update...');
    currentVersion = newVersion;
    window.location.reload();
  });

  notification.querySelector('#dismissBtn').addEventListener('click', () => {
    console.log('👋 Update dismissed');
    currentVersion = newVersion;
    notification.remove();
  });

  // Auto-dismiss after 10 seconds if not interacted
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

// Initialize update checker
function initUpdateChecker() {
  // Load current version on page load
  loadCurrentVersion().then(version => {
    currentVersion = version;
    console.log(`📦 Current version: ${version}`);
  });

  // Check for updates every 5 minutes
  updateCheckInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

  // Also check when window regains focus (user switches back to tab)
  window.addEventListener('focus', () => {
    console.log('👁️ Window focused, checking for updates...');
    checkForUpdates();
  });
}

// Start checking when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUpdateChecker);
} else {
  initUpdateChecker();
}
