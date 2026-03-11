
// ==========================================
// UI Management Functions
// ==========================================

function showLoginView() {
  const loginView = document.getElementById('loginView');
  const appView = document.getElementById('appView');
  
  if (loginView) loginView.style.display = 'flex';
  if (appView) appView.style.display = 'none';
}

function showPlannerView() {
  const loginView = document.getElementById('loginView');
  const appView = document.getElementById('appView');
  
  if (loginView) loginView.style.display = 'none';
  if (appView) appView.style.display = 'flex';
}

// ==========================================
// Login Form Setup
// ==========================================

function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const toggleForm = document.getElementById('toggleForm');
  const toggleText = document.getElementById('toggleText');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  console.log('✅ setupLoginForm() called');
  console.log('loginForm:', loginForm);
  console.log('signupForm:', signupForm);
  console.log('toggleForm:', toggleForm);

  if (!loginForm || !signupForm || !toggleForm) {
    console.error('❌ Required form elements not found!');
    return;
  }

  let isSignup = false;

  // Toggle between login and signup
  if (toggleForm) {
    toggleForm.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Toggle clicked, isSignup:', !isSignup);
      isSignup = !isSignup;
      
      if (isSignup) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        toggleText.textContent = 'Déjà inscrit?';
        toggleForm.textContent = 'Se connecter';
        console.log('✅ Switched to signup form');
      } else {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        toggleText.textContent = 'Pas encore inscrit?';
        toggleForm.textContent = 'Créer un compte';
        console.log('✅ Switched to login form');
      }
    });
  }

  // Handle login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      loginError.textContent = 'Email et mot de passe requis';
      return;
    }

    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Connexion...';

    const result = await signIn(email, password);
    
    if (!result.success) {
      loginError.textContent = result.error || 'Erreur de connexion';
      btn.disabled = false;
      btn.textContent = 'Se connecter';
    } else {
      // Clear form on success
      loginForm.reset();
      document.getElementById('loginEmail').value = '';
      document.getElementById('loginPassword').value = '';
      btn.textContent = 'Se connecter';
    }
    // Success: showPlannerView will be called by auth state change
  });

  // Handle signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.textContent = '';
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const password2 = document.getElementById('signupPassword2').value;

    if (!email || !password || !password2) {
      signupError.textContent = 'Tous les champs sont requis';
      return;
    }

    if (password !== password2) {
      signupError.textContent = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (password.length < 6) {
      signupError.textContent = 'Le mot de passe doit faire au moins 6 caractères';
      return;
    }

    const btn = signupForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Inscription...';

    const result = await signUp(email, password);
    
    if (!result.success) {
      signupError.textContent = result.error || 'Erreur lors de l\'inscription';
      btn.disabled = false;
      btn.textContent = 'S\'inscrire';
    } else {
      signupError.textContent = 'Inscrit! Connexion en cours...';
      signupError.style.color = '#10b981';
      // Try to sign in automatically
      setTimeout(async () => {
        const loginResult = await signIn(email, password);
        if (!loginResult.success) {
          signupError.style.color = '#c0392b';
          signupError.textContent = 'Veuillez vous connecter avec vos identifiants';
          btn.disabled = false;
          btn.textContent = 'S\'inscrire';
        }
      }, 1000);
    }
  });
}

/**
 * Setup user menu dropdown
 */
function setupUserMenu() {
  const userMenuBtn = document.getElementById('btnUserMenu');
  const userDropdown = document.getElementById('userDropdown');
  const menuLogout = document.getElementById('menuLogout');

  if (!userMenuBtn || !userDropdown) {
    console.warn('⚠️ User menu elements not found');
    return;
  }

  console.log('✅ Setting up user menu...');

  // Toggle dropdown
  userMenuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    console.log('User menu button clicked');
    userDropdown.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const isClickInside = userMenuBtn.contains(e.target) || userDropdown.contains(e.target);
    if (!isClickInside && userDropdown.classList.contains('open')) {
      console.log('Clicking outside, closing dropdown');
      userDropdown.classList.remove('open');
    }
  });

  // Logout button
  if (menuLogout) {
    menuLogout.addEventListener('click', async () => {
      userDropdown.classList.remove('open');
      const result = await signOut();
      if (result.success) {
        console.log('✅ Logged out successfully');
        showLoginView();
      } else {
        console.error('❌ Logout failed:', result.error);
      }
    });
  }

  // Profile menu item
  const menuProfile = document.getElementById('menuProfile');
  if (menuProfile) {
    menuProfile.addEventListener('click', () => {
      userDropdown.classList.remove('open');
      console.log('Profile menu clicked');
    });
  }

  // Preferences menu item
  const menuPreferences = document.getElementById('menuPreferences');
  if (menuPreferences) {
    menuPreferences.addEventListener('click', () => {
      userDropdown.classList.remove('open');
      console.log('Preferences menu clicked');
    });
  }

  // Export data
  const menuExport = document.getElementById('menuExport');
  if (menuExport) {
    menuExport.addEventListener('click', () => {
      userDropdown.classList.remove('open');
      console.log('Export menu clicked');
    });
  }

  // Import data
  const menuImport = document.getElementById('menuImport');
  if (menuImport) {
    menuImport.addEventListener('click', () => {
      userDropdown.classList.remove('open');
      const importInput = document.getElementById('importFileInput');
      if (importInput) {
        importInput.click();
      }
    });
  }

  const importFileInput = document.getElementById('importFileInput');
  if (importFileInput) {
    importFileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        console.log('File selected for import');
      }
      e.target.value = '';
    });
  }
}

