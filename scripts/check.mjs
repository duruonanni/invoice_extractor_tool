import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const files = [
  path.join(root, 'src', 'core', 'core.js'),
  path.join(root, 'src', 'parsers', 'parsers.js'),
  path.join(root, 'src', 'ui', 'ui.js'),
  path.join(root, 'tests', 'regression.mjs'),
];

let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log('Syntax check PASS');
