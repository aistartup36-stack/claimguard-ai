/* ── ClaimLens AI — Auth ──────────────────────────────────────────────────── */

window.Auth = (() => {
  const loginScreen = document.getElementById('login-screen');
  const appLayout   = document.getElementById('app-layout');
  const loginForm   = document.getElementById('login-form');
  const loginError  = document.getElementById('login-error');
  const loginBtn    = document.getElementById('login-btn');
  const loginInput  = document.getElementById('login-password');

  // Promise that resolves to true/false once initial auth check completes
  let _resolveReady;
  const ready = new Promise(r => { _resolveReady = r; });

  function showApp() {
    loginScreen.style.display = 'none';
    appLayout.style.display = '';
  }

  function showLogin() {
    loginScreen.style.display = '';
    appLayout.style.display = 'none';
  }

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.success && data.data.authenticated) {
        showApp();
        _resolveReady(true);
      } else {
        showLogin();
        _resolveReady(false);
      }
    } catch {
      showLogin();
      _resolveReady(false);
    }
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in…';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginInput.value })
      });
      const data = await res.json();

      if (data.success) {
        loginScreen.style.opacity = '0';
        loginScreen.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          showApp();
          loginScreen.style.opacity = '';
          loginScreen.style.transition = '';
          loginInput.value = '';
          // Load dashboard fresh now that the session cookie is set
          if (window.App) App.navigate('dashboard');
        }, 300);
      } else {
        loginError.textContent = 'Incorrect password. Please try again.';
        loginInput.value = '';
        loginInput.focus();
        // Shake animation
        loginForm.classList.add('login-shake');
        setTimeout(() => loginForm.classList.remove('login-shake'), 500);
      }
    } catch {
      loginError.textContent = 'Unable to reach server. Please try again.';
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  });

  // Run auth check on page load
  checkAuth();

  return { ready, checkAuth, showLogin };
})();
