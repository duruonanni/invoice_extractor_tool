import {
  getSettings,
  getUser,
  handleAuthCallback,
  login,
  logout,
  onAuthChange,
  signup,
} from '@netlify/identity';

import coreSource from '../../src/core/core.js?raw';
import parsersSource from '../../src/parsers/parsers.js?raw';
import uiSource from '../../src/ui/ui.js?raw';

new Function(`${coreSource}\n${parsersSource}\n${uiSource}`)();

const hostedTag = document.getElementById('hostedEnvTag');
if (hostedTag) hostedTag.style.display = 'inline-block';

/** Set in `web/.env.local`; only honored when running Vite dev (`npm run web:dev`). Never true in production bundle. */
const skipIdentity =
  import.meta.env.DEV === true && import.meta.env.VITE_DEV_SKIP_IDENTITY === '1';

const loginScreen = document.getElementById('hostedLoginScreen');
const appShell = document.getElementById('hostedAppShell');
const authSignedOut = document.getElementById('authSignedOut');
const authSignedIn = document.getElementById('authSignedIn');
const authUserEmail = document.getElementById('authUserEmail');
const authForm = document.getElementById('hostedAuthForm');
const authEmail = document.getElementById('hostedAuthEmail');
const authPassword = document.getElementById('hostedAuthPassword');
const authSubmit = document.getElementById('hostedAuthSubmit');
const authSignup = document.getElementById('hostedAuthSignup');
const authStatus = document.getElementById('hostedAuthStatus');

let currentAuthAction = 'login';
let currentUser = null;

function setAuthStatus(message, tone = 'info') {
  if (!authStatus) return;
  authStatus.hidden = false;
  authStatus.className = `hosted-auth-status ${tone}`;
  authStatus.textContent = message;
}

function clearAuthStatus() {
  if (!authStatus) return;
  authStatus.hidden = true;
  authStatus.textContent = '';
}

function normalizeError(err) {
  if (!err) return 'Authentication failed. Please try again.';
  const message = typeof err === 'string' ? err : err.message;
  if (message === 'Not Found' && import.meta.env.DEV === true) {
    return 'Identity endpoint was not found on this local Vite server. Use netlify dev for login testing, or enable VITE_DEV_SKIP_IDENTITY=1 for UI/parser work.';
  }
  if (message) return message;
  return 'Authentication failed. Please try again.';
}

function setAuthBusy(isBusy, action = currentAuthAction) {
  if (authSubmit) {
    authSubmit.disabled = isBusy;
    authSubmit.textContent = isBusy && action === 'login' ? 'Signing in...' : 'Sign in';
  }
  if (authSignup) {
    authSignup.disabled = isBusy;
    authSignup.textContent = isBusy && action === 'signup' ? 'Creating...' : 'Create account';
  }
}

function readCredentials() {
  const email = authEmail ? authEmail.value.trim().toLowerCase() : '';
  const password = authPassword ? authPassword.value : '';
  if (!email || !password) {
    throw new Error('Enter an email and password.');
  }
  return { email, password };
}

async function checkIdentitySettings() {
  try {
    const settings = await getSettings();
    if (settings.disableSignup && authSignup) authSignup.disabled = true;
  } catch (err) {
    setAuthStatus(
      'Sign in is unavailable from this local address. Use netlify dev for Identity testing, or enable VITE_DEV_SKIP_IDENTITY=1 for UI/parser work.',
      'error',
    );
    console.error('[netlify-identity] settings check failed', err);
  }
}

async function submitAuth(action) {
  currentAuthAction = action;
  clearAuthStatus();
  setAuthBusy(true, action);
  try {
    const { email, password } = readCredentials();
    if (action === 'signup') {
      await signup(email, password, { source: 'hosted-validator' });
      const signedInUser = await getUser();
      if (signedInUser) {
        setHostedAccess(signedInUser);
        setAuthStatus('Account created and signed in.', 'success');
      } else {
        setHostedAccess(null);
        setAuthStatus('Account created. Try signing in with this password.', 'success');
      }
    } else {
      const user = await login(email, password);
      setHostedAccess(user);
      setAuthStatus('Signed in.', 'success');
    }
  } catch (err) {
    setHostedAccess(null);
    setAuthStatus(normalizeError(err), 'error');
    console.error(`[netlify-identity] ${action} failed`, err);
  } finally {
    setAuthBusy(false, action);
  }
}

function bindAuthControls() {
  document.getElementById('netlifyAuthBtn')?.addEventListener('click', e => {
    e.preventDefault();
    if (loginScreen) loginScreen.hidden = false;
    authEmail?.focus();
  });
  authForm?.addEventListener('submit', e => {
    e.preventDefault();
    submitAuth('login');
  });
  authSignup?.addEventListener('click', e => {
    e.preventDefault();
    submitAuth('signup');
  });
  document.getElementById('netlifyLogoutBtn')?.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      console.error('[netlify-identity] logout failed', err);
    } finally {
      setHostedAccess(null);
    }
  });
}

function setHostedAccess(user) {
  const ok = Boolean(user);
  currentUser = user || null;
  if (loginScreen) loginScreen.hidden = ok;
  if (appShell) appShell.hidden = !ok;
  if (authSignedOut) authSignedOut.hidden = ok;
  if (authSignedIn) authSignedIn.hidden = !ok;
  if (authUserEmail) {
    const email = user && user.email ? String(user.email) : '';
    authUserEmail.textContent = email;
    authUserEmail.title = email;
  }
  if (typeof window.refreshUiLanguageLabels === 'function') window.refreshUiLanguageLabels();
}

async function sendUsageEvent(detail) {
  if (!currentUser || !detail) return;
  try {
    const jwt = getIdentityJwt();
    const response = await fetch('/.netlify/functions/usage-ingest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      credentials: 'include',
      body: JSON.stringify(detail),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `usage-ingest failed (${response.status})`);
    }
  } catch (err) {
    console.error('[usage-ingest] failed', err);
  }
}

function getIdentityJwt() {
  if (typeof document === 'undefined') return '';
  const cookie = document.cookie
    .split('; ')
    .find(entry => entry.startsWith('nf_jwt='));
  if (!cookie) return '';
  const [, value = ''] = cookie.split('=');
  try {
    return decodeURIComponent(value);
  } catch (_) {
    return value;
  }
}

async function initializeAuth() {
  bindAuthControls();
  window.addEventListener('liv:verification-complete', event => {
    sendUsageEvent(event.detail);
  });
  setHostedAccess(null);
  setAuthStatus('Checking sign-in service...', 'info');

  onAuthChange((_event, user) => {
    if (user) clearAuthStatus();
    setHostedAccess(user);
  });

  try {
    const callback = await handleAuthCallback();
    if (callback?.user) {
      clearAuthStatus();
      setHostedAccess(callback.user);
      return;
    }
  } catch (err) {
    setAuthStatus(normalizeError(err), 'error');
    console.error('[netlify-identity] auth callback failed', err);
  }

  await checkIdentitySettings();
  const user = await getUser();
  if (user) {
    clearAuthStatus();
    setHostedAccess(user);
  } else if (authStatus && authStatus.hidden) {
    clearAuthStatus();
  } else if (authStatus && authStatus.textContent === 'Checking sign-in service...') {
    clearAuthStatus();
  }
}

if (skipIdentity) {
  const hdrAuth = document.querySelector('.hdr-auth');
  if (hdrAuth) hdrAuth.style.display = 'none';
  if (loginScreen) {
    loginScreen.hidden = true;
    loginScreen.style.display = 'none';
  }
  if (appShell) appShell.hidden = false;

  const banner = document.createElement('div');
  banner.setAttribute('role', 'note');
  banner.style.cssText =
    'margin:0 0 12px;padding:12px 14px;border-radius:12px;background:var(--yellow-soft);color:var(--yellow);border:1px solid rgba(154,107,0,.25);font-size:13px';
  banner.textContent =
    'Local preview: login is bypassed (VITE_DEV_SKIP_IDENTITY in web/.env.local). Deployed apps need Netlify Identity enabled.';
  if (appShell && appShell.firstChild) appShell.insertBefore(banner, appShell.firstChild);
  else if (appShell) appShell.appendChild(banner);

  setHostedAccess({ devBypass: true });
} else {
  initializeAuth();
}
