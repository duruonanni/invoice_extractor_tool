const dzEl = document.getElementById('dz');
const fInEl = document.getElementById('fIn');
const fileListEl = document.getElementById('fList');
const actionBarEl = document.getElementById('aBar');
const runBtnEl = document.getElementById('runBtn');
const exportBtnEl = document.getElementById('exBtn');
const progressWrapEl = document.getElementById('pw');
const progressBarEl = document.getElementById('pbar');
const progressLabelEl = document.getElementById('plab');
const summaryWrapEl = document.getElementById('gSum');
const cardsEl = document.getElementById('gCards');
const resultsEl = document.getElementById('results');

dzEl.addEventListener('click', () => fInEl.click());
dzEl.addEventListener('dragover', e => {
  e.preventDefault();
  dzEl.classList.add('dg');
});
dzEl.addEventListener('dragleave', () => dzEl.classList.remove('dg'));
dzEl.addEventListener('drop', e => {
  e.preventDefault();
  dzEl.classList.remove('dg');
  addFiles(e.dataTransfer.files);
});
fInEl.addEventListener('change', e => {
  addFiles(e.target.files);
  e.target.value = '';
});

function setProg(percent, label) {
  progressWrapEl.style.display = 'block';
  progressBarEl.style.width = `${percent}%`;
  progressLabelEl.textContent = label;
}

async function addFiles(fileList) {
  for (const file of fileList) {
    if (!file.name.toLowerCase().endsWith('.pdf')) continue;
    const id = ++eid;
    const entry = {
      id,
      file,
      name: file.name,
      size: file.size,
      country: null,
      status: 'detecting',
      lines: null,
      error: '',
    };
    fileEntries.push(entry);
    renderFileList();
    try {
      const lines = await pdfToLines(file);
      entry.lines = lines;
      entry.country = detectCountry(
        lines.slice(0, 40).map(line => line.text).join('\n'),
        file.name
      );
      entry.name = inferDisplayName(file.name, entry.country, lines);
      entry.status = 'ready';
    } catch (err) {
      entry.status = 'error';
      entry.error = err && err.message ? err.message : String(err);
      console.error(file.name, err);
    }
    renderFileList();
    updateRunButton();
  }
}

function removeFile(id) {
  fileEntries = fileEntries.filter(entry => entry.id !== id);
  renderFileList();
  updateRunButton();
}

function clearAll() {
  fileEntries = [];
  analysisResults = null;
  fileListEl.innerHTML = '';
  resultsEl.innerHTML = '';
  cardsEl.innerHTML = '';
  summaryWrapEl.style.display = 'none';
  actionBarEl.style.display = 'none';
  exportBtnEl.style.display = 'none';
  updateRunButton();
}

function renderFileList() {
  fileListEl.innerHTML = fileEntries.map(entry => {
    const meta = entry.country ? (CM[entry.country] || CM.OTHER) : null;
    const badge = entry.status === 'detecting'
      ? `<span class="lb det">${t('detecting')}</span>`
      : entry.status === 'error'
        ? `<span class="lb err">${t('error')}</span>`
        : `<span class="lb ok">${esc(meta.flag)} ${esc(entry.country)}</span>`;
    return `
      <div class="fi">
        <span class="fi-type">PDF</span>
        <span class="fn" title="${esc(entry.name)}">${esc(entry.name)}</span>
        <span class="fs">${fmtSz(entry.size)}</span>
        ${badge}
        <button class="rb" onclick="removeFile(${entry.id})" title="Remove">x</button>
      </div>
    `;
  }).join('');
  actionBarEl.style.display = fileEntries.length ? 'flex' : 'none';
}

function updateRunButton() {
  const readyCount = fileEntries.filter(entry => entry.status === 'ready').length;
  runBtnEl.disabled = readyCount === 0;
  runBtnEl.textContent = readyCount
    ? `${t('run_btn')} (${readyCount})`
    : t('run_btn');
}

async function runAll() {
  const ready = fileEntries.filter(entry => entry.status === 'ready');
  if (!ready.length) return;

  runBtnEl.disabled = true;
  exportBtnEl.style.display = 'none';
  resultsEl.innerHTML = '';
  cardsEl.innerHTML = '';
  summaryWrapEl.style.display = 'none';
  analysisResults = {};

  setProg(2, t('starting'));

  for (let index = 0; index < ready.length; index++) {
    const entry = ready[index];
    setProg(
      Math.round((index / ready.length) * 80) + 10,
      `${t('parsing')} ${entry.name}`
    );
    try {
      const lines = entry.lines || await pdfToLines(entry.file);
      const statement = parseStatement(lines, entry.name);
      const key = statement.country;
      if (!analysisResults[key]) {
        analysisResults[key] = {
          country: key,
          meta: CM[key] || CM.OTHER,
          stmts: [],
        };
      }
      analysisResults[key].stmts.push(statement);
    } catch (err) {
      console.error(entry.name, err);
    }
  }

  setProg(94, t('rendering'));
  renderResults();
  setProg(100, t('done'));
  runBtnEl.disabled = false;
  exportBtnEl.style.display = 'inline-flex';
  setTimeout(() => {
    progressWrapEl.style.display = 'none';
  }, 1200);
}

function renderResults() {
  if (!analysisResults) return;
  const countries = Object.keys(analysisResults).sort();
  if (!countries.length) {
    resultsEl.innerHTML = '<div class="ib w">No parsed statements.</div>';
    return;
  }

  cardsEl.innerHTML = countries.map((code, index) => {
    const group = analysisResults[code];
    const invCount = group.stmts.reduce((sum, stmt) => sum + stmt.bs.length, 0);
    const itemCount = group.stmts.reduce((sum, stmt) => sum + stmt.li.length, 0);
    const issueCount = group.stmts.reduce(
      (sum, stmt) => sum + stmt.vr.filter(check => check.sv === 'f').length,
      0
    );
    const unmappedCount = group.stmts.reduce(
      (sum, stmt) => sum + stmt.unmS.length + stmt.unmD.length,
      0
    );
    return `
      <div class="gc ${index === 0 ? 'a' : ''}" id="gc-${esc(code)}" onclick="swC('${esc(code)}')">
        <div class="gc-f">${esc(group.meta.flag)}</div>
        <div class="gc-n">${esc(group.meta.label)} (${esc(code)})</div>
        <div class="gc-r"><span>${t('stmts')}</span><span class="gc-v">${group.stmts.length}</span></div>
        <div class="gc-r"><span>${t('invoices')}</span><span class="gc-v">${invCount}</span></div>
        <div class="gc-r"><span>${t('items')}</span><span class="gc-v">${itemCount}</span></div>
        <div class="gc-r"><span>${t('unmapped')}</span><span class="gc-v ${unmappedCount ? 'er' : 'ok'}">${unmappedCount}</span></div>
        <div class="gc-r"><span>${t('issues')}</span><span class="gc-v ${issueCount ? 'er' : 'ok'}">${issueCount}</span></div>
      </div>
    `;
  }).join('');

  summaryWrapEl.style.display = 'block';
  let html = `<div class="tabs"><button class="tab a" id="tab-hier" onclick="swTab('hier')">${t('hierarchy')}</button>`;
  for (const code of countries) {
    html += `<button class="tab" id="tab-${esc(code)}" onclick="swTab('${esc(code)}');swC('${esc(code)}')">${esc(analysisResults[code].meta.flag)} ${esc(code)}</button>`;
  }
  html += `</div>`;
  html += `<div class="tp a" id="tp-hier">${renderHierarchy()}</div>`;
  for (const code of countries) {
    html += `<div class="tp" id="tp-${esc(code)}">${renderCountrySection(code)}</div>`;
  }
  resultsEl.innerHTML = html;
}

function renderCountrySection(code) {
  const group = analysisResults[code];
  const byCustomer = {};
  for (const stmt of group.stmts) {
    const key = stmt.hd.custName || stmt.hd.custNum || 'Unknown';
    if (!byCustomer[key]) byCustomer[key] = [];
    byCustomer[key].push(stmt);
  }
  const customers = Object.keys(byCustomer);
  const subId = `sc-${code}`;
  return `
    <section class="country-section">
      <div class="tb">
        <div>
          <strong>${esc(group.meta.flag)} ${esc(group.meta.label)} (${esc(code)})</strong>
        </div>
        <div>${group.stmts.length} ${t('stmts')}</div>
      </div>
      <div class="stabs">
        ${customers.map((customer, index) => {
          const short = customer.length > 28 ? `${customer.slice(0, 26)}...` : customer;
          return `<button class="st ${index === 0 ? 'a' : ''}" id="${subId}-${index}" onclick="swSub('${esc(code)}',${index},${customers.length})" title="${esc(customer)}">${esc(short)} (${byCustomer[customer].length})</button>`;
        }).join('')}
      </div>
      ${customers.map((customer, index) => {
        return `<div class="sp ${index === 0 ? 'a' : ''}" id="${subId}-p-${index}">${byCustomer[customer].map(stmt => renderStatement(stmt)).join('')}</div>`;
      }).join('')}
    </section>
  `;
}

function renderStatement(stmt) {
  const issueCount = stmt.vr.filter(check => check.sv === 'f').length;
  const customer = stmt.hd.custName || stmt.hd.custNum || 'Unknown';
  const period = stmt.hd.period || 'Unknown';
  const unmappedCount = stmt.unmS.length + stmt.unmD.length;
  const safeId = (`d_${stmt.hd.stmtNum || stmt.fileName}`).replace(/\W/g, '');
  return `
    <article class="statement-card">
      <div class="tb">
        <div>
          <strong>${esc(stmt.hd.stmtNum || stmt.fileName)}</strong>
          <span class="tb-meta">${esc(customer)}</span>
          <span class="tb-meta">${esc(period)}</span>
          <span class="tb-meta">${esc(stmt.hd.date || '')}</span>
          <span class="tb-meta">${stmt.bs.length} ${t('invoices')}</span>
          <span class="tb-meta">${stmt.li.length} ${t('items')}</span>
        </div>
        <div class="${issueCount ? 'tre' : 'tg'}">${issueCount} ${t('issues')}</div>
      </div>
      ${unmappedCount ? `<div class="ib w" style="margin:10px 0">${unmappedCount} ${t('unmapped')}</div>` : ''}
      ${renderComparisonTable(stmt)}
      ${renderSummaryTable(stmt)}
      ${renderTrancheSummaryTable(stmt)}
      ${renderDetailTable(stmt, safeId)}
      ${renderValidationList(stmt)}
    </article>
  `;
}

function renderComparisonTable(stmt) {
  const rows = stmt.comp.map(row => `
    <tr class="${row.st !== 'matched' ? 'ro' : ''}">
      <td class="mono">${esc(row.inv)}</td>
      <td>${esc(row.st)}</td>
      <td class="tr mono">${row.sC ? fc(row.sC, stmt.cur) : ''}</td>
      <td class="tr mono">${row.dC ? fc(row.dC, stmt.cur) : ''}</td>
      <td class="tr mono">${fc(row.dC_ || 0, stmt.cur)}</td>
      <td class="tr mono">${row.sT ? fc(row.sT, stmt.cur) : ''}</td>
      <td class="tr mono">${row.dT ? fc(row.dT, stmt.cur) : ''}</td>
      <td class="tr mono">${fc(row.dT_ || 0, stmt.cur)}</td>
      <td class="tr mono">${row.sTot ? fc(row.sTot, stmt.cur) : ''}</td>
      <td class="tr mono">${row.dTot ? fc(row.dTot, stmt.cur) : ''}</td>
      <td class="tr mono">${fc(row.dTot_ || 0, stmt.cur)}</td>
      <td class="tr mono">${row.n || 0}</td>
      <td>${row.m ? 'OK' : 'Mismatch'}</td>
    </tr>
  `).join('');

  return `
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th>${t('invoice')}</th>
            <th>${t('status')}</th>
            <th class="tr">Sum ${t('charges')}</th>
            <th class="tr">Det ${t('charges')}</th>
            <th class="tr">${t('diff')}</th>
            <th class="tr">Sum ${t('tax')}</th>
            <th class="tr">Det ${t('tax')}</th>
            <th class="tr">${t('diff')}</th>
            <th class="tr">Sum ${t('total')}</th>
            <th class="tr">Det ${t('total')}</th>
            <th class="tr">${t('diff')}</th>
            <th class="tr">#</th>
            <th>${t('match')}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderSummaryTable(stmt) {
  const hasFee = stmt.bs.some(row => row.crf || row.rdf);
  const rows = stmt.bs.map(row => `
    <tr>
      <td class="mono">${esc(row.inv)}</td>
      <td class="tr mono">${fc(row.charges || 0, stmt.cur)}</td>
      <td class="tr mono">${fc(row.tax || 0, stmt.cur)}</td>
      ${hasFee ? `<td class="tr mono">${fc(row.crf || 0, stmt.cur)}</td><td class="tr mono">${fc(row.rdf || 0, stmt.cur)}</td>` : ''}
      <td class="tr mono">${fc(row.total || 0, stmt.cur)}</td>
    </tr>
  `).join('');

  return `
    <details>
      <summary>${t('billing_sum')} (${stmt.bs.length})</summary>
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>${t('invoice')}</th>
              <th class="tr">${t('charges')}</th>
              <th class="tr">${t('tax')}</th>
              ${hasFee ? '<th class="tr">CRF</th><th class="tr">RDF</th>' : ''}
              <th class="tr">${t('total')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderTrancheSummaryTable(stmt) {
  const rows = stmt.trancheSummary.map(row => `
    <tr>
      <td class="mono">${esc(row.tranche || '')}</td>
      <td class="tr mono">${row.qty ?? ''}</td>
      <td class="tr mono">${fc(row.charges || 0, stmt.cur)}</td>
      <td class="tr mono">${row.invoiceCount}</td>
      <td class="wrap">${esc(row.invoiceNos.join(', '))}</td>
    </tr>
  `).join('');

  return `
    <details>
      <summary>${t('tranche_summary')} (${stmt.trancheSummary.length})</summary>
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>${t('tranche')}</th>
              <th class="tr">${t('qty')}</th>
              <th class="tr">${t('charges')}</th>
              <th class="tr">${t('invoice_count')}</th>
              <th>${t('invoice_nos')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderDetailTable(stmt, safeId) {
  const invoices = [...new Set(stmt.li.map(item => item.inv))].sort();
  const hasCrf = stmt.li.some(item => item.crfRdf);
  const rows = stmt.li.map(item => `
    <tr data-inv="${esc(item.inv)}" class="${item.priceGapAnomaly ? 'ra' : ''}">
      <td class="mono">${esc(item.inv)}</td>
      <td class="mono">${esc(item.tranche || '')}</td>
      <td class="mono">${esc(item.pid || '')}</td>
      <td class="wrap">${esc(item.pname || '')}</td>
      <td class="tr mono">${item.qty ?? ''}</td>
      <td class="tr mono">${fc(item.up || 0, stmt.cur)}</td>
      <td class="tr mono">${fc(item.expectedCharges || 0, stmt.cur)}</td>
      <td class="tr mono">${fc(item.charges || 0, stmt.cur)}</td>
      <td class="tr mono ${item.priceGapAnomaly ? 'tre' : 'tg'}">${fc(item.priceGap || 0, stmt.cur)}</td>
      <td>${esc(item.priceGapStatus || 'OK')}</td>
      <td class="tr mono">${fc(item.tax || 0, stmt.cur)}</td>
      ${hasCrf ? `<td class="tr mono">${fc(item.crfRdf || 0, stmt.cur)}</td>` : ''}
      <td class="tr mono">${fc(item.total || 0, stmt.cur)}</td>
      <td>${esc(item.srcFile || '')}</td>
      <td class="tr mono">${item.srcPage || ''}</td>
    </tr>
  `).join('');

  return `
    <details>
      <summary>${t('detail_items')} (${stmt.li.length})</summary>
      <div class="filter-row">
        ${invoices.map((inv, index) => `<button class="btn btn-s ${index === 0 ? 'a' : ''}" onclick="fD('${safeId}','${esc(inv)}',this)">${esc(inv)}</button>`).join('')}
        <button class="btn btn-s" onclick="fD('${safeId}','ALL',this)">All</button>
      </div>
      <div class="tw">
        <table id="${safeId}">
          <thead>
            <tr>
              <th>${t('invoice')}</th>
              <th>${t('tranche')}</th>
              <th>${t('product')}</th>
              <th>${t('name')}</th>
              <th class="tr">${t('qty')}</th>
              <th class="tr">${t('unit_price')}</th>
              <th class="tr">${t('expected_charges')}</th>
              <th class="tr">${t('charges')}</th>
              <th class="tr">${t('price_gap')}</th>
              <th>${t('gap_status')}</th>
              <th class="tr">${t('tax')}</th>
              ${hasCrf ? '<th class="tr">CRF/RDF</th>' : ''}
              <th class="tr">${t('total')}</th>
              <th>${t('file')}</th>
              <th class="tr">${t('page')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderValidationList(stmt) {
  const issueCount = stmt.vr.filter(check => check.sv === 'f').length;
  const checks = stmt.vr.map(check => `
    <div class="vi">
      <span class="vc ${check.sv === 'p' ? 'p' : check.sv === 'f' ? 'f' : 'w'}">
        ${check.sv === 'p' ? 'OK' : check.sv === 'f' ? 'ERR' : 'WARN'}
      </span>
      <div>
        <div><strong>${esc(check.nm)}</strong></div>
        <div class="td">${esc(check.dt)}</div>
      </div>
    </div>
  `).join('');

  return `
    <details ${issueCount ? 'open' : ''}>
      <summary>${t('validation')} (${stmt.vr.length} ${t('checks')}, ${issueCount} ${t('issues')})</summary>
      <div class="validation-list">${checks}</div>
    </details>
  `;
}

function renderHierarchy() {
  const rows = [];
  for (const code of Object.keys(analysisResults).sort()) {
    const group = analysisResults[code];
    const invCount = group.stmts.reduce((sum, stmt) => sum + stmt.bs.length, 0);
    const itemCount = group.stmts.reduce((sum, stmt) => sum + stmt.li.length, 0);
    const chargeTotal = group.stmts.reduce((sum, stmt) => sum + stmt.dGT.charges, 0);
    const taxTotal = group.stmts.reduce((sum, stmt) => sum + stmt.dGT.tax, 0);
    const grandTotal = group.stmts.reduce((sum, stmt) => sum + stmt.dGT.total, 0);
    const issueCount = group.stmts.reduce((sum, stmt) => sum + stmt.vr.filter(check => check.sv === 'f').length, 0);
    rows.push(`
      <tr>
        <td>${esc(group.meta.flag)} ${esc(group.meta.label)} (${esc(code)})</td>
        <td class="tr mono">${invCount}</td>
        <td class="tr mono">${itemCount}</td>
        <td class="tr mono">${fc(chargeTotal, group.meta.cur)}</td>
        <td class="tr mono">${fc(taxTotal, group.meta.cur)}</td>
        <td class="tr mono">${fc(grandTotal, group.meta.cur)}</td>
        <td class="tr mono ${issueCount ? 'tre' : 'tg'}">${issueCount}</td>
      </tr>
    `);
  }
  return `
    <div class="tb">
      <div><strong>${t('hierarchy')}</strong></div>
      <div class="td">Country -> Statements</div>
    </div>
    <div class="tw">
      <table>
        <thead>
          <tr>
            <th>${t('hierarchy')}</th>
            <th class="tr">${t('invoices')}</th>
            <th class="tr">${t('items')}</th>
            <th class="tr">${t('charges')}</th>
            <th class="tr">${t('tax')}</th>
            <th class="tr">${t('total')}</th>
            <th class="tr">${t('issues')}</th>
          </tr>
        </thead>
        <tbody>${rows.join('')}</tbody>
      </table>
    </div>
  `;
}

function swC(code) {
  document.querySelectorAll('.gc').forEach(card => card.classList.remove('a'));
  document.getElementById(`gc-${code}`)?.classList.add('a');
}

function swTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('a'));
  document.getElementById(`tab-${id}`)?.classList.add('a');
  document.querySelectorAll('.tp').forEach(panel => panel.classList.remove('a'));
  document.getElementById(`tp-${id}`)?.classList.add('a');
}

function swSub(code, index, total) {
  for (let i = 0; i < total; i++) {
    document.getElementById(`sc-${code}-${i}`)?.classList.toggle('a', i === index);
    document.getElementById(`sc-${code}-p-${i}`)?.classList.toggle('a', i === index);
  }
}

function fD(safeId, invoice, btn) {
  const table = document.getElementById(safeId);
  if (!table) return;
  btn.parentElement.querySelectorAll('.btn').forEach(button => button.classList.remove('a'));
  btn.classList.add('a');
  table.querySelectorAll('tbody tr').forEach(row => {
    row.style.display = invoice === 'ALL' || row.dataset.inv === invoice ? '' : 'none';
  });
}

window.swC = swC;
window.swTab = swTab;
window.swSub = swSub;
window.fD = fD;

function doExport() {
  if (!analysisResults) return;
  const wb = XLSX.utils.book_new();
  const statements = Object.values(analysisResults).flatMap(group => group.stmts);
  const summaryRows = [[
    'File',
    'Country',
    'Statement',
    'Customer',
    'Invoices',
    'Line Items',
    'Tranches',
    'Price Gap Issues',
    'Issues'
  ]];
  const trancheRows = [[
    'File',
    'Country',
    'Statement',
    'Tranche',
    'Qty Total',
    'Charges Total',
    'Invoice Count',
    'Invoice Nos'
  ]];
  const detailRows = [[
    'File',
    'Country',
    'Statement',
    'Invoice',
    'Tranche',
    'PID',
    'Name',
    'Qty',
    'Unit Price',
    'Expected Charges',
    'Charges',
    'Price Gap',
    'Gap Status',
    'Tax',
    'Total',
    'Page'
  ]];

  for (const stmt of statements) {
    summaryRows.push([
      stmt.fileName,
      stmt.country,
      stmt.hd.stmtNum,
      stmt.hd.custName || stmt.hd.custNum || '',
      stmt.bs.length,
      stmt.li.length,
      stmt.trancheSummary.length,
      stmt.priceGapIssues.length,
      stmt.vr.filter(check => check.sv === 'f').length,
    ]);
    for (const tranche of stmt.trancheSummary) {
      trancheRows.push([
        stmt.fileName,
        stmt.country,
        stmt.hd.stmtNum,
        tranche.tranche || '',
        tranche.qty ?? '',
        tranche.charges ?? '',
        tranche.invoiceCount ?? '',
        tranche.invoiceNos.join(', '),
      ]);
    }
    for (const item of stmt.li) {
      detailRows.push([
        stmt.fileName,
        stmt.country,
        stmt.hd.stmtNum,
        item.inv,
        item.tranche || '',
        item.pid || '',
        item.pname || '',
        item.qty ?? '',
        item.up ?? '',
        item.expectedCharges ?? '',
        item.charges ?? '',
        item.priceGap ?? '',
        item.priceGapStatus || '',
        item.tax ?? '',
        item.total ?? '',
        item.srcPage ?? '',
      ]);
    }
  }

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(trancheRows), 'Tranche Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailRows), 'Detail');
  XLSX.writeFile(wb, computeExportFilename(statements));
}

window.addFiles = addFiles;
window.clearAll = clearAll;
window.doExport = doExport;
window.removeFile = removeFile;
window.runAll = runAll;
