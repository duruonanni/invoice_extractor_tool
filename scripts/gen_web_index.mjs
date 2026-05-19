import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'src', 'index.template.html');
const outPath = path.join(root, 'web', 'index.html');

const template = fs.readFileSync(templatePath, 'utf8');
if (!template.includes('/*__SCRIPT__*/')) {
  throw new Error('index.template.html missing /*__SCRIPT__*/ placeholder');
}

/** No `data-netlify-identity-button` — that attribute duplicates controls with the widget. Use explicit `netlifyIdentity.open()` in web/src/main.js */
const hdrInject = `
  <div class="hdr-auth" style="margin-left:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <span id="hostedEnvTag" style="font-size:11px;opacity:.85;display:none;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.12)">Hosted</span>
    <span id="authSignedOut" class="auth-segment">
      <button type="button" id="netlifyAuthBtn" class="hdr-btn" data-t="hdr_signin">Sign in</button>
    </span>
    <span id="authSignedIn" class="auth-segment" hidden>
      <span id="authUserEmail" style="font-size:12px;opacity:.9;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title=""></span>
      <button type="button" id="netlifyLogoutBtn" class="hdr-btn hdr-btn--outline" data-t="hdr_logout">Log out</button>
    </span>
  </div>`;

const withHdr = template.replace(
  /<div class="ver" id="verTag"><\/div>\s*<\/div>/,
  `<div class="ver" id="verTag"></div>${hdrInject}\n</div>`,
);

if (withHdr === template) {
  throw new Error('gen_web_index: failed to inject hdr-auth (pattern no match)');
}

const hostedLoginPanel = `  <div id="hostedLoginScreen" class="hosted-login-screen">
    <h2 data-t="hosted_login_title">Sign in</h2>
    <p data-t="hosted_login_blurb">PDF parsing and Excel export run in your browser. Invoice content is not uploaded to the server. Sign in to use the hosted validator.</p>
    <form id="hostedAuthForm" class="hosted-auth-form">
      <label class="hosted-auth-field">
        <span>Email</span>
        <input type="email" id="hostedAuthEmail" autocomplete="email" required>
      </label>
      <label class="hosted-auth-field">
        <span>Password</span>
        <input type="password" id="hostedAuthPassword" autocomplete="current-password" required>
      </label>
      <div class="hosted-auth-actions">
        <button type="submit" id="hostedAuthSubmit" class="btn btn-p" data-t="hosted_login_btn">Sign in</button>
        <button type="button" id="hostedAuthSignup" class="btn">Create account</button>
      </div>
      <p id="hostedAuthStatus" class="hosted-auth-status" hidden></p>
    </form>
  </div>
  <div id="hostedAppShell" hidden>
`;

const withLoginGate = withHdr.replace(
  /<div class="container">\n  <div class="drop-zone" id="dz">/,
  `<div class="container">\n${hostedLoginPanel}  <div class="drop-zone" id="dz">`,
);

if (withLoginGate === withHdr) {
  throw new Error('gen_web_index: failed to inject hosted login gate (pattern no match)');
}

const withCloseShell = withLoginGate.replace(
  /  <div id="results"><\/div>\n<\/div>\n<script>\/\*__SCRIPT__\*\//,
  `  <div id="results"></div>
  </div>
</div>
<script>/*__SCRIPT__*/`,
);

if (withCloseShell === withLoginGate) {
  throw new Error('gen_web_index: failed to close hostedAppShell (pattern no match)');
}

const out = withCloseShell.replace(
  '<script>/*__SCRIPT__*/</script>',
  '<script type="module" src="/src/main.js"></script>',
);

if (out === withCloseShell) {
  throw new Error('gen_web_index: failed to swap script placeholder');
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, 'utf8');
console.log('Generated', outPath);
