import fs from 'fs';
import os from 'node:os';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

/** OneDrive "Releases" folder segments after ~/Library/CloudStorage (macOS). */
const RELEASES_TAIL = [
  'Library',
  'CloudStorage',
  'OneDrive-Lenovo',
  'All Spark Program - EaaS Value Realization',
  'Onboarding',
  'LOT',
  'DT_Data_Migration',
  'All_In_AI_Projects',
  'Claude_invoice_extractor_tool',
  'Releases',
];

function darwinDefaultReleasesDir() {
  return path.join(os.homedir(), ...RELEASES_TAIL);
}

/**
 * Workstation-specific default (OD-mounted OneDrive layout). Prefer env overrides on shared CI or other PCs.
 */
function win32DefaultReleasesDir() {
  return path.join(
    'C:',
    'OD',
    'OneDrive - Lenovo',
    'All Spark Program - EaaS Value Realization',
    'Onboarding',
    'LOT',
    'DT_Data_Migration',
    'All_In_AI_Projects',
    'Claude_invoice_extractor_tool',
    'Releases',
  );
}

/**
 * Resolved latest HTML sink. Prefer INVOICE_RELEASE_LATEST (full file path), then
 * INVOICE_RELEASE_ONEDRIVE_RELEASES_DIR + lenovo_invoice_validator_latest.html,
 * then platform defaults (win32 OD path below, darwin ~/Library/...).
 */
function resolveLatestTarget() {
  if (process.env.INVOICE_RELEASE_LATEST) {
    return process.env.INVOICE_RELEASE_LATEST;
  }
  if (process.env.INVOICE_RELEASE_ONEDRIVE_RELEASES_DIR) {
    return path.join(
      process.env.INVOICE_RELEASE_ONEDRIVE_RELEASES_DIR,
      'lenovo_invoice_validator_latest.html',
    );
  }
  if (process.platform === 'win32') {
    return path.join(win32DefaultReleasesDir(), 'lenovo_invoice_validator_latest.html');
  }
  if (process.platform === 'darwin') {
    return path.join(darwinDefaultReleasesDir(), 'lenovo_invoice_validator_latest.html');
  }
  throw new Error(
    'release_sync: Set INVOICE_RELEASE_LATEST (full path to lenovo_invoice_validator_latest.html) ' +
      'or INVOICE_RELEASE_ONEDRIVE_RELEASES_DIR (the Releases folder). See WINDOWS_MIGRATION.md §4.1.',
  );
}

const latestTarget = resolveLatestTarget();
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

function assertVersionReadyForRelease() {
  const newVersion = readVersion(sourceHtml);
  if (!newVersion) {
    throw new Error(`Release VERSION constant not found in ${sourceHtml}`);
  }

  if (!fs.existsSync(latestTarget)) {
    return;
  }

  const latestVersion = readVersion(latestTarget);
  if (sameFileContent(sourceHtml, latestTarget)) {
    return;
  }

  if (newVersion === latestVersion) {
    throw new Error(
      `Release content changed but VERSION is still v${newVersion}. Bump src/core/core.js before running release:sync.`,
    );
  }
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

assertVersionReadyForRelease();
archiveLatestIfNeeded();
fs.copyFileSync(sourceHtml, latestTarget);

console.log('Release synced:');
console.log(`  Source : ${sourceHtml}`);
console.log(`  Latest : ${latestTarget}`);
console.log(`  History: ${historyDir}`);
