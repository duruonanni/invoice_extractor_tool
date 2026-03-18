import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { pathToFileURL } from 'url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const root = path.resolve('C:/Users/kate_/Documents/Codex_WorkStation/codex_invoice_extractor_tool');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures.json'), 'utf8'));
const workerHref = pathToFileURL(path.join(root, 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs')).href;
pdfjs.GlobalWorkerOptions.workerSrc = workerHref;

const core = fs.readFileSync(path.join(root, 'src', 'core', 'core.js'), 'utf8');
const parsers = fs.readFileSync(path.join(root, 'src', 'parsers', 'parsers.js'), 'utf8');

const context = {
  console,
  pdfjsLib: pdfjs,
  document: { getElementById: () => ({ textContent: '' }) },
  window: {},
};
vm.createContext(context);
vm.runInContext(core, context, { filename: 'core.js' });
context.pdfjsLib.GlobalWorkerOptions.workerSrc = workerHref;
vm.runInContext(parsers, context, { filename: 'parsers.js' });

const { pdfToLines, parseStatement } = context;
if (!pdfToLines || !parseStatement) throw new Error('Core functions missing');

let failed = false;
for (const c of fixtures.cases) {
  const filePath = path.join(root, fixtures.base_dir, c.file);
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
  const ok =
    invs >= c.min_invoices &&
    items >= c.min_items &&
    (c.max_failed_checks == null || failedChecks <= c.max_failed_checks) &&
    (c.max_mismatches == null || mismatches <= c.max_mismatches);
  console.log(`${c.country} ${c.file}: invoices=${invs}, items=${items}, failedChecks=${failedChecks}, mismatches=${mismatches} => ${ok ? 'PASS' : 'FAIL'}`);
  if (!ok) failed = true;
}

if (failed) process.exit(1);
console.log('Regression PASS');