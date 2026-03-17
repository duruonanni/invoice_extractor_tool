import { chromium } from 'playwright';
import path from 'path';
import { pathToFileURL } from 'url';

const root = process.cwd();
const manualHtml = path.resolve(root, 'docs', 'Lenovo_Invoice_Validator_User_Manual.html');
const manualPdf = path.resolve(root, 'docs', 'Lenovo_Invoice_Validator_User_Manual.pdf');

const manualUrl = pathToFileURL(manualHtml).toString();

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(manualUrl, { waitUntil: 'load' });
  await page.pdf({ path: manualPdf, format: 'A4', printBackground: true });
  await browser.close();
  console.log('Manual PDF generated:', manualPdf);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
