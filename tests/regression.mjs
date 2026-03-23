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

const { pdfToLines, parseStatement } = context;
if (!pdfToLines || !parseStatement) throw new Error('Core functions missing');

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

if (failed) process.exit(1);
console.log('Regression PASS');
