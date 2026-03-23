import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const latestTarget = process.env.INVOICE_RELEASE_LATEST || '/Users/duruo/Library/CloudStorage/OneDrive-Lenovo/All Spark Program - EaaS Value Realization/Onboarding/LOT/DT_Data_Migration/All_In_AI_Projects/Claude_invoice_extractor_tool/Releases/lenovo_invoice_validator_latest.html';
const latestDir = path.dirname(latestTarget);
const historyDir = path.join(path.dirname(latestDir), 'history');
const sourceHtml = path.join(root, 'release', 'lenovo_invoice_validator.html');

function readVersion(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(/const VERSION='([0-9.]+)';/);
  return match ? match[1] : '';
}

function sameFileContent(a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return false;
  return fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8');
}

function buildRelease() {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'build_release.mjs')], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function archiveLatestIfNeeded() {
  if (!fs.existsSync(latestTarget)) return;

  const oldVersion = readVersion(latestTarget) || 'unknown';
  let historyTarget = path.join(historyDir, `lenovo_invoice_validator_v${oldVersion}.html`);

  if (fs.existsSync(historyTarget)) {
    if (sameFileContent(latestTarget, historyTarget)) {
      return;
    }
    let index = 2;
    while (fs.existsSync(historyTarget)) {
      historyTarget = path.join(historyDir, `lenovo_invoice_validator_v${oldVersion}_${index}.html`);
      index += 1;
    }
  }

  fs.copyFileSync(latestTarget, historyTarget);
}

buildRelease();

if (!fs.existsSync(sourceHtml)) {
  throw new Error(`Built release not found: ${sourceHtml}`);
}

fs.mkdirSync(latestDir, { recursive: true });
fs.mkdirSync(historyDir, { recursive: true });

archiveLatestIfNeeded();
fs.copyFileSync(sourceHtml, latestTarget);

console.log('Release synced:');
console.log(`  Source : ${sourceHtml}`);
console.log(`  Latest : ${latestTarget}`);
console.log(`  History: ${historyDir}`);
