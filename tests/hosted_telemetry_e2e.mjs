import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures.json'), 'utf8'));
const workspaceAttachmentsPreview = path.join(root, '..', '..', '03_WORK', 'Attachments', 'invoice-regression', 'Approved_Preview');
const sampleDirCandidates = [
  process.env.INVOICE_SAMPLE_DIR,
  workspaceAttachmentsPreview,
  '/Users/duruo/Studio/03_WORK/Attachments/invoice-regression/Approved_Preview',
  '/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview',
  path.join(root, fixtures.base_dir),
].filter(Boolean);
const sampleRoot = sampleDirCandidates.find(dir => fs.existsSync(dir));
const sampleFile = sampleRoot
  ? path.join(sampleRoot, 'CA01_STMT_BRIM_STATEMENT_EPRECAP0000073.PDF')
  : null;

if (!sampleFile || !fs.existsSync(sampleFile)) {
  throw new Error(`Hosted telemetry E2E requires sample PDF CA01_STMT_BRIM_STATEMENT_EPRECAP0000073.PDF. Checked root: ${sampleRoot || '(none)'}`);
}

await run();

async function run() {
  const externalBaseUrl = process.env.HOSTED_E2E_BASE_URL || '';
  const externalDbUrl = process.env.HOSTED_E2E_DB_URL || '';
  const netlify = externalBaseUrl
    ? { proc: null, url: externalBaseUrl.replace(/\/$/, '') }
    : await startNetlifyDev();
  const dbUrl = externalDbUrl || getLocalDatabaseUrl();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const client = new pg.Client({ connectionString: dbUrl });
  const email = `codex.e2e.${Date.now()}@example.com`;
  const password = 'Codex!23456';

  try {
    await client.connect();
    await page.goto(netlify.url, { waitUntil: 'load' });
    await page.fill('#hostedAuthEmail', email);
    await page.fill('#hostedAuthPassword', password);
    await page.click('#hostedAuthSignup');

    const appVisible = page.locator('#hostedAppShell');
    const loginVisible = page.locator('#hostedLoginScreen');
    try {
      await appVisible.waitFor({ state: 'visible', timeout: 10000 });
    } catch (_) {
      await expectVisible(loginVisible);
      await page.click('#hostedAuthSubmit');
      await appVisible.waitFor({ state: 'visible', timeout: 10000 });
    }

    await page.setInputFiles('#fIn', sampleFile);
    await page.waitForFunction(() => {
      const btn = document.getElementById('runBtn');
      return btn && btn.disabled === false;
    }, { timeout: 45000 });
    await page.click('#runBtn');

    await page.waitForFunction(() => {
      const monitor = window.__LIV_USAGE_MONITOR;
      return Boolean(monitor && monitor.lastSuccess && monitor.lastSuccess.payload && monitor.lastSuccess.payload.clientEventId);
    }, { timeout: 120000 });

    const monitor = await page.evaluate(() => window.__LIV_USAGE_MONITOR);
    assert.equal(monitor.failed, 0, 'usage monitor should not record failed telemetry attempts');
    assert.ok(monitor.succeeded >= 1, 'usage monitor should record a successful telemetry send');
    assert.equal(monitor.lastSuccess.payload.pdfCount, 1);

    const eventId = monitor.lastSuccess.payload.clientEventId;
    const usageRow = await client.query(
      `SELECT user_sub, client_event_id, pdf_count, total_pages, failed_checks, warning_checks, outcome
       FROM usage_events WHERE client_event_id = $1`,
      [eventId],
    );
    assert.equal(usageRow.rowCount, 1, 'usage event should be written exactly once');
    assert.equal(usageRow.rows[0].pdf_count, 1);
    assert.equal(usageRow.rows[0].outcome, 'success');

    const profileRow = await client.query(
      'SELECT user_sub, email_hash FROM user_profiles WHERE user_sub = $1',
      [usageRow.rows[0].user_sub],
    );
    assert.equal(profileRow.rowCount, 1, 'user profile should exist for telemetry user');
    assert.ok(profileRow.rows[0].email_hash, 'user profile should include hashed email');

    const limitRows = await client.query(
      'SELECT scope, request_count FROM ingest_rate_limits WHERE request_count >= 1 ORDER BY scope',
    );
    assert.ok(limitRows.rows.some(row => row.scope === 'user'));
    assert.ok(limitRows.rows.some(row => row.scope === 'ip'));

    console.log(`Hosted telemetry E2E PASS: ${eventId}`);
  } finally {
    await page.close().catch(() => {});
    await browser.close().catch(() => {});
    await client.end().catch(() => {});
    await stopNetlifyDev(netlify.proc);
  }
}

function getLocalDatabaseUrl() {
  const output = runNetlifySync(['database', 'status']);
  const match = output.match(/postgres:\/\/localhost:\d+\/postgres/);
  if (!match) {
    throw new Error(`Could not determine local database URL from netlify database status:\n${output}`);
  }
  return match[0];
}

async function startNetlifyDev() {
  const proc = runNetlify(['dev']);
  let combined = '';
  let resolvedUrl = '';

  const capture = chunk => {
    combined += chunk.toString();
    const match = combined.match(/Local dev server ready:\s*(http:\/\/localhost:\d+)/i);
    if (match) resolvedUrl = match[1];
  };
  proc.stdout.on('data', capture);
  proc.stderr.on('data', capture);

  const startedAt = Date.now();
  while (!resolvedUrl) {
    if (proc.exitCode != null) {
      throw new Error(`netlify dev exited early with code ${proc.exitCode}\n${combined}`);
    }
    if (Date.now() - startedAt > 120000) {
      throw new Error(`Timed out waiting for netlify dev\n${combined}`);
    }
    await delay(500);
  }

  await waitForIdentitySettings(resolvedUrl, combined);
  return { proc, url: resolvedUrl };
}

function runNetlify(args) {
  if (process.platform === 'win32') {
    return spawn('cmd.exe', ['/c', 'netlify', ...args], {
      cwd: root,
      env: { ...process.env, BROWSER: 'none' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  }
  return spawn('netlify', args, {
    cwd: root,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runNetlifySync(args) {
  if (process.platform === 'win32') {
    return execFileSync('cmd.exe', ['/c', 'netlify', ...args], {
      cwd: root,
      encoding: 'utf8',
      timeout: 60000,
    });
  }
  return execFileSync('netlify', args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 60000,
  });
}

async function waitForIdentitySettings(baseUrl, logText) {
  const settingsUrl = new URL('/.netlify/identity/settings', baseUrl).href;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 30000) {
    try {
      const res = await fetch(settingsUrl);
      if (res.ok) return;
    } catch (_) {
      // Keep polling until the local server fully boots.
    }
    await delay(500);
  }
  throw new Error(`Identity settings never became ready at ${settingsUrl}\n${logText}`);
}

async function stopNetlifyDev(proc) {
  if (!proc || proc.exitCode != null) return;
  proc.kill('SIGTERM');
  const startedAt = Date.now();
  while (proc.exitCode == null && Date.now() - startedAt < 10000) {
    await delay(200);
  }
  if (proc.exitCode == null) {
    proc.kill('SIGKILL');
  }
}

async function expectVisible(locator) {
  await locator.waitFor({ state: 'visible', timeout: 10000 });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
