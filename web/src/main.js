import netlifyIdentity from 'netlify-identity-widget';

import '../../src/core/core.js';
import '../../src/parsers/parsers.js';
import '../../src/ui/ui.js';

const hostedTag = document.getElementById('hostedEnvTag');
if (hostedTag) hostedTag.style.display = 'inline-block';

/** Set in `web/.env.local`; only honored when running Vite dev (`npm run web:dev`). Never true in production bundle. */
const skipIdentity =
  import.meta.env.DEV === true && import.meta.env.VITE_DEV_SKIP_IDENTITY === '1';

const dz = document.getElementById('dz');
const hostedGateOverlay = document.createElement('div');
hostedGateOverlay.id = 'hostedGate';
hostedGateOverlay.setAttribute('role', 'note');
hostedGateOverlay.style.cssText =
  'margin:12px 0;padding:12px 14px;border-radius:12px;background:var(--info-soft);color:var(--info);border:1px solid rgba(15,94,168,.2);font-size:13px';

const container = document.querySelector('.container');
if (container && dz) {
  container.insertBefore(hostedGateOverlay, dz);
}

function setHostedAccess(user) {
  const ok = Boolean(user);
  if (dz) {
    dz.style.pointerEvents = ok ? '' : 'none';
    dz.style.opacity = ok ? '' : '0.45';
  }
  hostedGateOverlay.style.display = ok ? 'none' : 'block';
  if (typeof window.refreshUiLanguageLabels === 'function') window.refreshUiLanguageLabels();
}

if (skipIdentity) {
  const hdrAuth = document.querySelector('.hdr-auth');
  if (hdrAuth) hdrAuth.style.display = 'none';
  hostedGateOverlay.style.background = 'var(--yellow-soft)';
  hostedGateOverlay.style.color = 'var(--yellow)';
  hostedGateOverlay.textContent =
    'Local preview: login is bypassed (VITE_DEV_SKIP_IDENTITY in web/.env.local). Deployed apps need Netlify Identity enabled (Site configuration → Identity).';
  setHostedAccess({ devBypass: true });
} else {
  hostedGateOverlay.textContent =
    'Sign in to use the hosted validator. PDF parsing and Excel export run in your browser; invoice content is not uploaded to Netlify.';
  netlifyIdentity.init();
  netlifyIdentity.on('init', user => setHostedAccess(user));
  netlifyIdentity.on('login', user => setHostedAccess(user));
  netlifyIdentity.on('logout', () => setHostedAccess(null));
}
