import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures.json'), 'utf8'));
const workerHref = pathToFileURL(path.join(root, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')).href;
const sampleDirCandidates = [
  process.env.INVOICE_SAMPLE_DIR,
  '/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview',
  path.join(root, fixtures.base_dir),
].filter(Boolean);

const sampleRoot = sampleDirCandidates.find(dir => fs.existsSync(dir));

class MinimalDOMMatrix {
  constructor(values = [1, 0, 0, 1, 0, 0]) {
    [this.a, this.b, this.c, this.d, this.e, this.f] = values;
  }
  multiplySelf() { return this; }
  preMultiplySelf() { return this; }
  translateSelf(tx = 0, ty = 0) { this.e += tx; this.f += ty; return this; }
  scaleSelf() { return this; }
  rotateSelf() { return this; }
  inverse() { return this; }
  transformPoint(point) { return point; }
}

globalThis.DOMMatrix = globalThis.DOMMatrix || MinimalDOMMatrix;
globalThis.ImageData = globalThis.ImageData || class ImageData {};
globalThis.Path2D = globalThis.Path2D || class Path2D {};

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
pdfjs.GlobalWorkerOptions.workerSrc = workerHref;

const core = fs.readFileSync(path.join(root, 'src', 'core', 'core.js'), 'utf8');
const parsers = fs.readFileSync(path.join(root, 'src', 'parsers', 'parsers.js'), 'utf8');

const context = {
  console,
  pdfjsLib: pdfjs,
  document: {
    getElementById: () => ({ textContent: '', style: {}, addEventListener: () => {}, querySelector: () => null }),
    querySelectorAll: () => [],
    documentElement: { setAttribute: () => {} },
  },
  window: {
    matchMedia: () => ({
      matches: false,
      addEventListener: () => {},
      addListener: () => {},
    }),
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  },
};
vm.createContext(context);
vm.runInContext(core, context, { filename: 'core.js' });
context.pdfjsLib.GlobalWorkerOptions.workerSrc = workerHref;
vm.runInContext(parsers, context, { filename: 'parsers.js' });

const {
  pdfToLines,
  parseStatement,
  computeExportFilename,
  computeLinePriceAudit,
  buildTrancheSummary,
} = context;
if (!pdfToLines || !parseStatement || !computeExportFilename || !computeLinePriceAudit || !buildTrancheSummary) {
  throw new Error('Core functions missing');
}

function evaluateAssertions(statement, assertions = {}) {
  const failures = [];

  if (assertions.non_empty_tranche) {
    const missing = statement.li.filter(item => !String(item.tranche || '').trim());
    if (missing.length) {
      failures.push(`missing tranche on ${missing.length} line item(s)`);
    }
  }

  if (Array.isArray(assertions.pname_contains)) {
    for (const rule of assertions.pname_contains) {
      const item = statement.li.find(entry => entry.pid === rule.pid);
      if (!item) {
        failures.push(`missing item for pid ${rule.pid}`);
        continue;
      }
      if (!String(item.pname || '').includes(rule.contains)) {
        failures.push(`pid ${rule.pid} missing text "${rule.contains}" in pname`);
      }
    }
  }

  if (Array.isArray(assertions.pname_not_contains)) {
    for (const rule of assertions.pname_not_contains) {
      const item = statement.li.find(entry => entry.pid === rule.pid);
      if (!item) {
        failures.push(`missing item for pid ${rule.pid}`);
        continue;
      }
      if (String(item.pname || '').includes(rule.contains)) {
        failures.push(`pid ${rule.pid} unexpectedly contains text "${rule.contains}" in pname`);
      }
    }
  }

  if (assertions.customer_name) {
    if (String(statement.hd.custName || '').trim() !== assertions.customer_name) {
      failures.push(`customer_name expected "${assertions.customer_name}" got "${statement.hd.custName || ''}"`);
    }
  }

  if (Array.isArray(assertions.invoice_payment_terms)) {
    for (const rule of assertions.invoice_payment_terms) {
      const row = statement.bs.find(entry => entry.inv === rule.inv);
      if (!row) {
        failures.push(`missing billing row for invoice ${rule.inv}`);
        continue;
      }
      if (!String(row.paymentTerm || '').includes(rule.contains)) {
        failures.push(`invoice ${rule.inv} missing payment term text "${rule.contains}"`);
      }
    }
  }

  if (Array.isArray(assertions.tranche_summary_contains)) {
    for (const rule of assertions.tranche_summary_contains) {
      const row = statement.trancheSummary.find(entry => entry.tranche === rule.tranche);
      if (!row) {
        failures.push(`missing tranche summary for ${rule.tranche}`);
        continue;
      }
      if (rule.qty != null && row.qty !== rule.qty) {
        failures.push(`tranche ${rule.tranche} qty expected ${rule.qty} got ${row.qty}`);
      }
      if (rule.charges != null && Math.abs(row.charges - rule.charges) >= 1) {
        failures.push(`tranche ${rule.tranche} charges expected ${rule.charges} got ${row.charges}`);
      }
      if (rule.invoice_count != null && row.invoiceCount !== rule.invoice_count) {
        failures.push(`tranche ${rule.tranche} invoiceCount expected ${rule.invoice_count} got ${row.invoiceCount}`);
      }
      if (rule.invoice_contains && !row.invoiceNos.includes(rule.invoice_contains)) {
        failures.push(`tranche ${rule.tranche} missing invoice ${rule.invoice_contains}`);
      }
    }
  }

  if (assertions.price_gap_issues != null && statement.priceGapIssues.length !== assertions.price_gap_issues) {
    failures.push(`priceGapIssues expected ${assertions.price_gap_issues} got ${statement.priceGapIssues.length}`);
  }

  return failures;
}

function evaluateDerivedFunctionChecks() {
  const failures = [];

  const singleName = computeExportFilename(
    [{ hd: { stmtNum: 'EPREJPP0000568' }, country: 'JP', fileName: 'jp.pdf' }],
    new Date('2026-03-24T10:00:00'),
  );
  if (singleName !== 'EPREJPP0000568_JP_Invoice_Validator_Export_20260324.xlsx') {
    failures.push(`single export filename mismatch: ${singleName}`);
  }

  const multiName = computeExportFilename(
    [
      { hd: { stmtNum: 'EPREJPP0000568' }, country: 'JP', fileName: 'jp.pdf' },
      { hd: { stmtNum: 'EPREUSP0000749' }, country: 'US', fileName: 'us.pdf' },
    ],
    new Date('2026-03-24T10:00:00'),
  );
  if (multiName !== 'MULTI_2Statements_2Countries_Invoice_Validator_Export_20260324.xlsx') {
    failures.push(`multi export filename mismatch: ${multiName}`);
  }

  const jpyOk = computeLinePriceAudit({ qty: 3, up: 100, charges: 300.4 }, 'JPY');
  if (jpyOk.priceGapAnomaly) {
    failures.push('JPY sub-1 gap should not be anomalous');
  }

  const jpyBad = computeLinePriceAudit({ qty: 3, up: 100, charges: 301 }, 'JPY');
  if (!jpyBad.priceGapAnomaly) {
    failures.push('JPY gap of 1 should be anomalous');
  }

  const usdOk = computeLinePriceAudit({ qty: 10, up: 1.23, charges: 12.305 }, 'USD');
  if (usdOk.priceGapAnomaly) {
    failures.push('USD sub-0.01 gap should not be anomalous');
  }

  const usdBad = computeLinePriceAudit({ qty: 10, up: 1.23, charges: 12.31 }, 'USD');
  if (!usdBad.priceGapAnomaly) {
    failures.push('USD gap of 0.01 should be anomalous');
  }

  const trancheSummary = buildTrancheSummary([
    { tranche: 'T1', qty: 2, charges: 10, inv: 'INV2' },
    { tranche: 'T1', qty: 3, charges: 20, inv: 'INV1' },
    { tranche: 'T2', qty: 1, charges: 5, inv: 'INV1' },
  ]);
  const t1 = trancheSummary.find(row => row.tranche === 'T1');
  if (!t1 || t1.qty !== 5 || t1.charges !== 30 || t1.invoiceCount !== 2 || t1.invoiceNos.join(',') !== 'INV1,INV2') {
    failures.push(`tranche summary aggregation mismatch: ${JSON.stringify(t1)}`);
  }

  return failures;
}

let failed = false;
if (!sampleRoot) {
  console.error('Sample PDF directory not found. Checked:');
  for (const dir of sampleDirCandidates) {
    console.error(`- ${dir}`);
  }
  process.exit(1);
}

console.log(`Using sample PDF directory: ${sampleRoot}`);

for (const c of fixtures.cases) {
  const filePath = path.join(sampleRoot, c.file);
  if (!fs.existsSync(filePath)) {
    console.error(`MISSING: ${c.file}`);
    failed = true;
    continue;
  }
  const buf = fs.readFileSync(filePath);
  const fileObj = {
    name: c.file,
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  };
  const lines = await pdfToLines(fileObj);
  const st = parseStatement(lines, c.file);
  const invs = st.bs.length;
  const items = st.li.length;
  const failedChecks = st.vr.filter(check => check.sv === 'f').length;
  const mismatches = st.comp.filter(row => !row.m).length;
  const assertionFailures = evaluateAssertions(st, c.assertions);
  const ok =
    invs >= c.min_invoices &&
    items >= c.min_items &&
    (c.max_failed_checks == null || failedChecks <= c.max_failed_checks) &&
    (c.max_mismatches == null || mismatches <= c.max_mismatches) &&
    assertionFailures.length === 0;
  console.log(`${c.country} ${c.file}: invoices=${invs}, items=${items}, failedChecks=${failedChecks}, mismatches=${mismatches} => ${ok ? 'PASS' : 'FAIL'}`);
  if (assertionFailures.length) {
    console.error(`  assertionFailures: ${assertionFailures.join(' | ')}`);
  }
  if (!ok) failed = true;
}

const derivedFailures = evaluateDerivedFunctionChecks();
if (derivedFailures.length) {
  failed = true;
  console.error(`Derived function checks failed: ${derivedFailures.join(' | ')}`);
}

if (failed) process.exit(1);
console.log('Regression PASS');
