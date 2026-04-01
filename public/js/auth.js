/* ── ClaimLens AI — Auth ──────────────────────────────────────────────────── */

window.Auth = (() => {
  const loginScreen = document.getElementById('login-screen');
  const appLayout   = document.getElementById('app-layout');
  const loginForm   = document.getElementById('login-form');
  const loginError  = document.getElementById('login-error');
  const loginBtn    = document.getElementById('login-btn');
  const loginUsername = document.getElementById('login-username');
  const loginPassword = document.getElementById('login-password');

  let _user = null;

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

  function getUser() { return _user; }

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.success && data.data.authenticated) {
        _user = data.data.user;
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

  async function logout() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    _user = null;
    showLogin();
    if (loginUsername) loginUsername.focus();
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
        body: JSON.stringify({ username: loginUsername.value, password: loginPassword.value })
      });
      const data = await res.json();

      if (data.success) {
        _user = data.data;
        loginScreen.style.opacity = '0';
        loginScreen.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          showApp();
          loginScreen.style.opacity = '';
          loginScreen.style.transition = '';
          loginUsername.value = '';
          loginPassword.value = '';
          // Load dashboard fresh now that the session cookie is set
          if (window.App) {
            Auth._populateSidebar();
            App.navigate('dashboard');
          }
        }, 300);
      } else {
        loginError.textContent = data.error || 'Invalid username or password.';
        loginPassword.value = '';
        loginPassword.focus();
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

  function _populateSidebar() {
    const user = _user;
    if (!user) return;
    const el = document.getElementById('sidebar-user');
    if (el) {
      el.innerHTML = `
        <div style="width:28px;height:28px;border-radius:50%;background:#1E6FD9;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:white;flex-shrink:0">${user.displayName[0]}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;color:#E2E8F0;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.displayName}</div>
          <div style="font-size:10px;color:#64748B">${user.role === 'admin' ? 'Administrator' : 'User'}</div>
        </div>
        <button onclick="Auth.logout()" title="Sign out" style="background:none;border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:4px 6px;cursor:pointer;color:#94A3B8;display:flex;align-items:center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>`;
    }
    // Hide settings nav for non-admin users
    const settingsNav = document.querySelector('[data-view="settings"]');
    if (settingsNav) settingsNav.style.display = user.role === 'admin' ? '' : 'none';
  }

  // Run auth check on page load
  checkAuth();

  return { ready, checkAuth, showLogin, logout, getUser, _populateSidebar };
})();
