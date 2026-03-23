import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const corePath = path.join(root, 'src', 'core', 'core.js');

function parseVersion(text) {
  const match = text.match(/const VERSION='([0-9]+)\.([0-9]+)\.([0-9]+)';/);
  if (!match) {
    throw new Error(`VERSION constant not found in ${corePath}`);
  }
  return {
    full: match[0],
    value: `${match[1]}.${match[2]}.${match[3]}`,
    parts: match.slice(1).map(Number),
  };
}

function resolveNextVersion(current, requested) {
  if (requested) {
    if (!/^\d+\.\d+\.\d+$/.test(requested)) {
      throw new Error(`Invalid version: ${requested}`);
    }
    return requested;
  }

  const [major, minor, patch] = current.parts;
  return `${major}.${minor}.${patch + 1}`;
}

const requestedVersion = process.argv[2];
const source = fs.readFileSync(corePath, 'utf8');
const current = parseVersion(source);
const nextVersion = resolveNextVersion(current, requestedVersion);

if (nextVersion === current.value) {
  console.log(`Release version unchanged: v${current.value}`);
  process.exit(0);
}

const updated = source.replace(current.full, `const VERSION='${nextVersion}';`);
fs.writeFileSync(corePath, updated, 'utf8');

console.log(`Release version bumped: v${current.value} -> v${nextVersion}`);
