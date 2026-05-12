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

const hdrInject = `
  <div class="hdr-auth" style="margin-left:auto;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <span id="hostedEnvTag" style="font-size:11px;opacity:.85;display:none;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.12)">Hosted</span>
    <a href="#" data-netlify-identity-button style="font-size:12px;padding:6px 12px;text-decoration:none;color:#fff;border:1px solid rgba(255,255,255,.35);border-radius:8px;white-space:nowrap">Log in / Sign up</a>
  </div>`;

const withHdr = template.replace(
  /<div class="ver" id="verTag"><\/div>\s*<\/div>/,
  `<div class="ver" id="verTag"></div>${hdrInject}\n</div>`,
);

if (withHdr === template) {
  throw new Error('gen_web_index: failed to inject hdr-auth (pattern no match)');
}

const out = withHdr.replace(
  '<script>/*__SCRIPT__*/</script>',
  '<script type="module" src="/src/main.js"></script>',
);

if (out === withHdr) {
  throw new Error('gen_web_index: failed to swap script placeholder');
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, 'utf8');
console.log('Generated', outPath);
