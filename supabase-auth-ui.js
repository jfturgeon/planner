
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
