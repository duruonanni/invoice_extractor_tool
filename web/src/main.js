import netlifyIdentity from 'netlify-identity-widget';

import '../../src/core/core.js';
import '../../src/parsers/parsers.js';
import '../../src/ui/ui.js';

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
const dz = document.getElementById('dz');

/** False until first `init` event (widget may ignore `open()` before settings load). */
let identityWidgetReady = false;

function openIdentityModal() {
  const run = () => {
    try {
      netlifyIdentity.open('login');
    } catch (err) {
      console.error('[netlify-identity] open() failed', err);
    }
  };
  if (identityWidgetReady) run();
  else {
    const once = () => {
      netlifyIdentity.off('init', once);
      run();
    };
    netlifyIdentity.on('init', once);
  }
}

function bindAuthControls() {
  document.getElementById('netlifyAuthBtn')?.addEventListener('click', e => {
    e.preventDefault();
    openIdentityModal();
  });
  document.getElementById('hostedLoginBtn')?.addEventListener('click', e => {
    e.preventDefault();
    openIdentityModal();
  });
  document.getElementById('netlifyLogoutBtn')?.addEventListener('click', e => {
    e.preventDefault();
    netlifyIdentity.logout();
  });
}

function setHostedAccess(user) {
  const ok = Boolean(user);
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
    'Local preview: login is bypassed (VITE_DEV_SKIP_IDENTITY in web/.env.local). Deployed apps need Netlify Identity enabled (Site configuration → Identity).';
  if (appShell && appShell.firstChild) appShell.insertBefore(banner, appShell.firstChild);
  else if (appShell) appShell.appendChild(banner);

  setHostedAccess({ devBypass: true });
} else {
  bindAuthControls();
  const initOpts = {};
  /** Point widget at your site's GoTrue API when the app runs on another origin (e.g. localhost:5173). */
  const identityApi =
    typeof import.meta.env.VITE_NETLIFY_IDENTITY_URL === 'string' &&
    import.meta.env.VITE_NETLIFY_IDENTITY_URL.trim();
  if (identityApi) initOpts.APIUrl = identityApi;
  else if (import.meta.env.DEV === true) {
    console.warn(
      '[netlify-identity] No VITE_NETLIFY_IDENTITY_URL — first Sign in should show the widget’s “Development Settings” prompt. If open does nothing, set e.g. VITE_NETLIFY_IDENTITY_URL=https://<site>.netlify.app/.netlify/identity in web/.env.local and restart Vite.',
    );
  }
  netlifyIdentity.on('error', err => console.error('[netlify-identity]', err));
  netlifyIdentity.on('init', user => {
    identityWidgetReady = true;
    setHostedAccess(user);
  });
  netlifyIdentity.on('login', user => setHostedAccess(user));
  netlifyIdentity.on('logout', () => setHostedAccess(null));
  netlifyIdentity.init(initOpts);
}
