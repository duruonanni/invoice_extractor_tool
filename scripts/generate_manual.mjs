import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';

const root = process.cwd();
const toolHtml = path.resolve(root, 'lenovo_invoice_validator.html');
const manualHtml = path.resolve(root, 'docs', 'Lenovo_Invoice_Validator_User_Manual.html');
const assetsDir = path.resolve(root, 'docs', 'manual_assets');
const manualPdf = path.resolve(root, 'docs', 'Lenovo_Invoice_Validator_User_Manual.pdf');

const samplePdf = 'C:\\Users\\kate_\\Documents\\Claude_WrokStation\\invoice_extractor_tool\\Input\\Approved_Preview_Invoice\\DE05_STMT_BRIM_STATEMENT_EPREDEP0001389_EN.PDF';

if (!fs.existsSync(samplePdf)) {
  console.error('Sample PDF not found:', samplePdf);
  process.exit(1);
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const toolUrl = pathToFileURL(toolHtml).toString();
const manualUrl = pathToFileURL(manualHtml).toString();

const shots = {
  open: path.resolve(assetsDir, 'step01_open.png'),
  select: path.resolve(assetsDir, 'step02_select.png'),
  results: path.resolve(assetsDir, 'step03_results.png'),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message));
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.warn('BROWSER', type.toUpperCase() + ':', msg.text());
    }
  });

  // 1) Landing page
  await page.goto(toolUrl, { waitUntil: 'load' });
  await page.waitForSelector('#dz', { state: 'visible' });
  await page.screenshot({ path: shots.open, fullPage: true });

  // 2) After selecting a PDF
  const fileInput = await page.$('#fIn');
  if (!fileInput) throw new Error('File input #fIn not found');
  await fileInput.setInputFiles(samplePdf);
  await page.evaluate(() => {
    const el = document.getElementById('fIn');
    if (el) el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  try {
    await page.waitForFunction(() => document.querySelectorAll('.fi').length > 0, null, { timeout: 120000 });
  } catch (e) {
    const count = await page.evaluate(() => (document.getElementById('fIn')?.files?.length || 0));
    console.warn('File list not visible after upload. Input file count:', count);
  }
  await sleep(1200);
  await page.screenshot({ path: shots.select, fullPage: true });

  // 3) Results after run
  await page.click('#runBtn');
  await page.waitForSelector('#gSum', { state: 'visible', timeout: 120000 });
  await sleep(1000);
  await page.screenshot({ path: shots.results, fullPage: true });

  // 4) Manual PDF
  const mpage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await mpage.goto(manualUrl, { waitUntil: 'load' });
  await mpage.pdf({ path: manualPdf, format: 'A4', printBackground: true });

  await browser.close();
  console.log('Manual screenshots + PDF generated');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
