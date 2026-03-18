import fs from 'fs';
import path from 'path';

const root = path.resolve('C:/Users/kate_/Documents/Codex_WorkStation/codex_invoice_extractor_tool');
const templatePath = path.join(root, 'src', 'index.template.html');
const outPath = path.join(root, 'lenovo_invoice_validator.html');
const releasePath = path.join(root, 'release', 'lenovo_invoice_validator.html');

const parts = [
  path.join(root, 'src', 'core', 'core.js'),
  path.join(root, 'src', 'parsers', 'parsers.js'),
  path.join(root, 'src', 'ui', 'ui.js'),
];

const template = fs.readFileSync(templatePath, 'utf8');
const script = parts.map(p => fs.readFileSync(p, 'utf8').trim()).join('\n\n');

if (!template.includes('/*__SCRIPT__*/')) {
  throw new Error('Template missing script placeholder');
}

const out = template.replace('/*__SCRIPT__*/', () => script);
fs.writeFileSync(outPath, out, 'utf8');
fs.writeFileSync(releasePath, out, 'utf8');
console.log('Built:', outPath, 'and', releasePath);
