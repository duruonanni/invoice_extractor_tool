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
let countryFilterShowAllOverride = null;

function refreshUiLanguageLabels() {
  dzEl.setAttribute('aria-label', t('drop_zone_aria'));
}
window.refreshUiLanguageLabels = refreshUiLanguageLabels;
dzEl.setAttribute('role', 'button');
dzEl.setAttribute('tabindex', '0');
refreshUiLanguageLabels();

dzEl.addEventListener('click', () => fInEl.click());
dzEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  fInEl.click();
});
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
  rebuildAnalysisResults();
  renderFileList();
  updateRunButton();
}

function clearAll() {
  fileEntries = [];
  analysisResults = null;
  countryFilterShowAllOverride = null;
  fileListEl.innerHTML = '';
  resultsEl.innerHTML = '';
  cardsEl.innerHTML = '';
  summaryWrapEl.style.display = 'none';
  actionBarEl.style.display = 'none';
  exportBtnEl.style.display = 'none';
  updateRunButton();
}

function rebuildAnalysisResults() {
  const ready = fileEntries.filter(entry => entry.status === 'ready');
  if (!ready.length) {
    analysisResults = null;
    countryFilterShowAllOverride = null;
    resultsEl.innerHTML = '';
    cardsEl.innerHTML = '';
    summaryWrapEl.style.display = 'none';
    exportBtnEl.style.display = 'none';
    return;
  }
  analysisResults = {};
  countryFilterShowAllOverride = null;
  for (const entry of ready) {
    try {
      const statement = parseStatement(entry.lines || [], entry.name);
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
  if (Object.keys(analysisResults).length) {
    renderResults();
    exportBtnEl.style.display = 'inline-flex';
  } else {
    analysisResults = null;
    resultsEl.innerHTML = '';
    cardsEl.innerHTML = '';
    summaryWrapEl.style.display = 'none';
    exportBtnEl.style.display = 'none';
  }
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
  countryFilterShowAllOverride = null;

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
  const countrySummary = buildCountrySummary(countries);
  const issueCountries = countries.filter(code => countrySummary[code].hasIssues);
  const canFilterCountries = countries.length > 1 && issueCountries.length > 0 && issueCountries.length < countries.length;
  const showAllCountries = canFilterCountries
    ? (countryFilterShowAllOverride === null ? false : countryFilterShowAllOverride)
    : true;
  const visibleCountries = showAllCountries ? countries : issueCountries;
  const hiddenCountryCount = countries.length - visibleCountries.length;
  const statements = Object.values(analysisResults).flatMap(group => group.stmts);
  const batchIssueCount = statements.reduce((sum, stmt) => sum + stmt.vr.filter(check => check.sv === 'f').length, 0);
  const batchWarningCount = statements.reduce((sum, stmt) => sum + stmt.vr.filter(check => check.sv === 'w').length, 0);
  const batchUnmappedCount = statements.reduce((sum, stmt) => sum + stmt.unmS.length + stmt.unmD.length, 0);
  const batchPriceGapCount = statements.reduce((sum, stmt) => sum + stmt.priceGapIssues.length, 0);

  cardsEl.innerHTML = visibleCountries.map((code, index) => {
    const group = analysisResults[code];
    const invCount = countrySummary[code].invoices;
    const itemCount = countrySummary[code].items;
    const issueCount = countrySummary[code].issues;
    const unmappedCount = countrySummary[code].unmapped;
    const issueCountryClass = issueCount > 0 ? 'issue-country' : '';
    return `
      <button type="button" class="gc ${issueCountryClass} ${index === 0 ? 'a' : ''}" id="gc-${esc(code)}" onclick="focusCountry('${esc(code)}')" aria-label="${esc(`${group.meta.label} ${code}, ${issueCount} ${t('issues')}`)}">
        <div class="gc-f">${esc(group.meta.flag)}</div>
        <div class="gc-n">${esc(group.meta.label)} (${esc(code)})</div>
        <div class="gc-r"><span>${t('stmts')}</span><span class="gc-v">${group.stmts.length}</span></div>
        <div class="gc-r"><span>${t('invoices')}</span><span class="gc-v">${invCount}</span></div>
        <div class="gc-r"><span>${t('items')}</span><span class="gc-v">${itemCount}</span></div>
        <div class="gc-r"><span>${t('unmapped')}</span><span class="gc-v ${unmappedCount ? 'er' : 'ok'}">${unmappedCount}</span></div>
        <div class="gc-r"><span>${t('issues')}</span><span class="gc-v ${issueCount ? 'er' : 'ok'}">${issueCount}</span></div>
      </button>
    `;
  }).join('');

  summaryWrapEl.style.display = 'block';
  let html = renderBatchStatus({
    statements: statements.length,
    issues: batchIssueCount,
    warnings: batchWarningCount,
    unmapped: batchUnmappedCount,
    priceGapIssues: batchPriceGapCount,
  });
  html += `
    <div class="country-filter-strip">
      <div class="country-filter-label">
        ${showAllCountries
          ? `${t('country_filter_all')} (${visibleCountries.length}/${countries.length})`
          : `${t('country_filter_issue_only')} (${visibleCountries.length}/${countries.length})`}
        ${hiddenCountryCount > 0 ? ` · ${hiddenCountryCount} ${t('country_filter_hidden')}` : ''}
      </div>
      ${canFilterCountries
        ? `<button type="button" class="btn btn-s country-filter-btn" onclick="toggleCountryFilterMode()" aria-pressed="${showAllCountries ? 'true' : 'false'}">${showAllCountries ? t('country_filter_show_issue_only') : t('country_filter_show_all')}</button>`
        : ''}
    </div>
  `;
  html += `<div class="tabs"><button class="tab a" id="tab-hier" onclick="swTab('hier')">${t('hierarchy')}</button>`;
  for (const code of visibleCountries) {
    const issueTabClass = countrySummary[code].issues > 0 ? 'issue-country' : '';
    html += `<button class="tab ${issueTabClass}" id="tab-${esc(code)}" onclick="swTab('${esc(code)}');swC('${esc(code)}')">${esc(analysisResults[code].meta.flag)} ${esc(code)}</button>`;
  }
  html += `</div>`;
  html += `<div class="tp a" id="tp-hier">${renderHierarchy(visibleCountries)}</div>`;
  for (const code of visibleCountries) {
    html += `<div class="tp" id="tp-${esc(code)}">${renderCountrySection(code)}</div>`;
  }
  resultsEl.innerHTML = html;
}

function buildCountrySummary(countries) {
  const summary = {};
  for (const code of countries) {
    const group = analysisResults[code];
    const statements = group.stmts;
    const issues = statements.reduce((sum, stmt) => sum + stmt.vr.filter(check => check.sv === 'f').length, 0);
    const warnings = statements.reduce((sum, stmt) => sum + stmt.vr.filter(check => check.sv === 'w').length, 0);
    const unmapped = statements.reduce((sum, stmt) => sum + stmt.unmS.length + stmt.unmD.length, 0);
    const priceGapIssues = statements.reduce((sum, stmt) => sum + stmt.priceGapIssues.length, 0);
    summary[code] = {
      issues,
      warnings,
      unmapped,
      priceGapIssues,
      hasIssues: issues > 0,
      invoices: statements.reduce((sum, stmt) => sum + stmt.bs.length, 0),
      items: statements.reduce((sum, stmt) => sum + stmt.li.length, 0),
    };
  }
  return summary;
}

function renderBatchStatus(summary) {
  let kind = 'success';
  let title = t('batch_pass_title');
  let desc = t('batch_pass_desc');
  let side = t('batch_ready');

  if (summary.issues > 0 || summary.unmapped > 0 || summary.priceGapIssues > 0) {
    kind = 'error';
    title = t('batch_fail_title');
    desc = t('batch_fail_desc');
    side = t('batch_review');
  } else if (summary.warnings > 0) {
    kind = 'warning';
    title = t('batch_warn_title');
    desc = t('batch_warn_desc');
    side = t('batch_review');
  }

  return `
    <section class="bs ${kind}">
      <div>
        <div class="bs-title">${esc(title)}</div>
        <div class="bs-desc">${esc(desc)}</div>
        <div class="bs-meta">${summary.statements} ${t('stmts').toLowerCase()} · ${summary.issues} ${t('errors').toLowerCase()} · ${summary.warnings} ${t('warnings').toLowerCase()} · ${summary.unmapped} ${t('unmapped').toLowerCase()} · ${summary.priceGapIssues} ${t('price_gap_anomalies')}</div>
      </div>
      <div class="bs-side">${esc(side)}</div>
    </section>
  `;
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
  const warningCount = stmt.vr.filter(check => check.sv === 'w').length;
  const customer = stmt.hd.custName || stmt.hd.custNum || 'Unknown';
  const period = stmt.hd.period || 'Unknown';
  const unmappedCount = stmt.unmS.length + stmt.unmD.length;
  const safeId = (`d_${stmt.hd.stmtNum || stmt.fileName}`).replace(/\W/g, '');
  const errorFocus = getStatementErrorFocus(stmt);
  const statusClass = issueCount ? 'err' : warningCount ? 'warn' : 'ok';
  const errorBadge = issueCount
    ? `<button type="button" class="issue-badge err issue-link" onclick="jumpToPrimaryIssue('${safeId}', event)">${issueCount} ${t('errors')}</button>`
    : `<div class="issue-badge neutral">0 ${t('errors')}</div>`;
  return `
    <article class="statement-card ${statusClass} ${errorFocus.hasRowIssues ? 'focus-mode' : ''}" id="${safeId}-card">
      <div class="tb">
        <div class="statement-main">
          <div class="statement-num">${esc(stmt.hd.stmtNum || stmt.fileName)}</div>
          <span class="statement-pill">${esc(stmt.country)} ${esc((CM[stmt.country] || CM.OTHER).label)}</span>
          <div class="statement-meta">
            <span class="tb-meta">${esc(customer)}</span>
            <span class="tb-meta">${esc(period)}</span>
            <span class="tb-meta">${esc(stmt.hd.date || '')}</span>
            <span class="tb-meta">${stmt.bs.length} ${t('invoices')}</span>
            <span class="tb-meta">${stmt.li.length} ${t('items')}</span>
          </div>
        </div>
        <div class="issue-stack">
          ${errorBadge}
          <div class="issue-badge ${warningCount ? 'warn' : 'neutral'}">${warningCount} ${t('warnings')}</div>
          <button type="button" class="statement-toggle" id="${safeId}-toggle" aria-expanded="true" onclick="toggleStatement('${safeId}', event)">Collapse</button>
        </div>
      </div>
      ${renderErrorInvoiceStrip(stmt, safeId, errorFocus)}
      <div class="statement-body" id="${safeId}-body">
        ${unmappedCount ? `<div class="ib w" style="margin:10px 0">${unmappedCount} ${t('unmapped')}</div>` : ''}
        ${renderComparisonTable(stmt, safeId, errorFocus)}
        ${renderSummaryTable(stmt, safeId, errorFocus)}
        ${renderTrancheSummaryTable(stmt, safeId, errorFocus)}
        ${renderDetailTable(stmt, safeId, errorFocus)}
        ${renderValidationList(stmt, safeId, errorFocus)}
      </div>
    </article>
  `;
}

function getStatementErrorFocus(stmt) {
  const issueRows = [];
  const invoiceCounts = new Map();
  let firstRowIndex = -1;

  stmt.li.forEach((item, index) => {
    if (!item.priceGapAnomaly) return;
    issueRows.push({ item, index });
    if (firstRowIndex < 0) firstRowIndex = index;
    const inv = String(item.inv || '').trim();
    if (!inv) return;
    if (!invoiceCounts.has(inv)) invoiceCounts.set(inv, 0);
    invoiceCounts.set(inv, invoiceCounts.get(inv) + 1);
  });

  const invoices = [...invoiceCounts.keys()];
  return {
    hasRowIssues: issueRows.length > 0,
    rowCount: issueRows.length,
    invoiceCount: invoices.length,
    invoices,
    invoiceCounts,
    firstRowIndex,
  };
}

function renderErrorInvoiceStrip(stmt, safeId, errorFocus) {
  if (!errorFocus.hasRowIssues) return '';
  return `
    <div class="statement-focus-strip">
      <div class="statement-focus-copy">
        <strong>Error invoices</strong>
        <span>${errorFocus.invoiceCount} invoice${errorFocus.invoiceCount > 1 ? 's' : ''} · ${errorFocus.rowCount} detail line issue${errorFocus.rowCount > 1 ? 's' : ''}</span>
      </div>
      <div class="statement-focus-actions">
        ${errorFocus.invoices.map(inv => `
          <button
            type="button"
            class="focus-chip"
            title="${esc(inv)} · ${errorFocus.invoiceCounts.get(inv)} issue row(s)"
            onclick="focusStatementErrors('${safeId}','${esc(inv)}', event)"
          >${esc(inv)}</button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderComparisonTable(stmt, safeId, errorFocus) {
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

  const tableHtml = `
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

  if (!errorFocus.hasRowIssues) {
    return tableHtml;
  }

  return `
    <details id="${safeId}-comparison">
      <summary>${t('comparison')} (${stmt.comp.length})</summary>
      ${tableHtml}
    </details>
  `;
}

function renderSummaryTable(stmt, safeId, errorFocus) {
  const hasFee = stmt.bs.some(row => row.crf || row.rdf);
  const hasPaymentTerm = stmt.bs.some(row => String(row.paymentTerm || '').trim());
  const hasArithmetic = stmt.bs.some(row => row.arithmeticStatus || row.arithmeticDiff !== undefined);
  const rows = stmt.bs.map(row => `
    <tr>
      <td class="mono">${esc(row.inv)}</td>
      ${hasPaymentTerm ? `<td class="payment-term-cell">${esc(row.paymentTerm || '')}</td>` : ''}
      <td class="tr mono">${fc(row.charges || 0, stmt.cur)}</td>
      <td class="tr mono">${fc(row.tax || 0, stmt.cur)}</td>
      ${hasFee ? `<td class="tr mono">${fc(row.crf || 0, stmt.cur)}</td><td class="tr mono">${fc(row.rdf || 0, stmt.cur)}</td>` : ''}
      <td class="tr mono">${fc(row.total || 0, stmt.cur)}</td>
      ${hasArithmetic ? `<td class="tc ${row.arithmeticPass ? 'cell-pass' : 'cell-fail'}">${esc(row.arithmeticStatus || '')}</td><td class="tr mono ${row.arithmeticPass ? 'cell-pass' : 'cell-fail'}">${fc(row.arithmeticDiff || 0, stmt.cur)}</td>` : ''}
    </tr>
  `).join('');

  return `
    <details id="${safeId}-summary">
      <summary>${t('billing_sum')} (${stmt.bs.length})</summary>
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>${t('invoice')}</th>
              ${hasPaymentTerm ? `<th class="payment-term-head">${t('payment_term')}</th>` : ''}
              <th class="tr">${t('charges')}</th>
              <th class="tr">${t('tax')}</th>
              ${hasFee ? '<th class="tr">CRF</th><th class="tr">RDF</th>' : ''}
              <th class="tr">${t('total')}</th>
              ${hasArithmetic ? `<th class="tc">${t('arithmetic')}</th><th class="tr">${t('arithmetic_diff')}</th>` : ''}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderTrancheSummaryTable(stmt, safeId, errorFocus) {
  const rows = stmt.trancheSummary.map(row => `
    <tr>
      <td class="mono">${esc(row.tranche || '')}</td>
      <td class="tr mono">${row.qty ?? ''}</td>
      <td class="tr mono">${fc(row.charges || 0, stmt.cur)}</td>
      <td class="tr mono">${row.invoiceCount}</td>
      <td class="wrap tc mono">${esc(row.invoiceNos.join(', '))}</td>
    </tr>
  `).join('');

  return `
    <details id="${safeId}-tranche">
      <summary>${t('tranche_summary')} (${stmt.trancheSummary.length})</summary>
      <div class="tw">
        <table>
          <thead>
            <tr>
              <th>${t('tranche')}</th>
              <th class="tr">${t('qty')}</th>
              <th class="tr">${t('charges')}</th>
              <th class="tr">${t('invoice_count')}</th>
              <th class="tc">${t('invoice_nos')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderDetailTable(stmt, safeId, errorFocus) {
  const invoices = [...new Set(stmt.li.map(item => item.inv))].sort();
  const hasCrf = stmt.li.some(item => item.crfRdf);
  const rows = stmt.li.map((item, index) => {
    const rowId = `${safeId}-row-${index}`;
    const isErrorRow = !!item.priceGapAnomaly;
    const rowClass = [
      isErrorRow ? 'ra error-row' : '',
      errorFocus.hasRowIssues && !isErrorRow ? 'row-muted' : '',
      errorFocus.firstRowIndex === index ? 'row-focus' : '',
    ].filter(Boolean).join(' ');
    const hidden = errorFocus.hasRowIssues && !isErrorRow ? ' style="display:none"' : '';
    return `
    <tr
      id="${rowId}"
      data-inv="${esc(item.inv)}"
      data-error-row="${isErrorRow ? '1' : '0'}"
      class="${rowClass}"${hidden}
    >
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
      <td class="tr mono">${item.srcPage || ''}</td>
    </tr>
  `;
  }).join('');

  return `
    <details id="${safeId}-detail" ${errorFocus.hasRowIssues ? 'open' : ''}>
      <summary>${t('detail_items')} (${stmt.li.length})</summary>
      <div class="filter-row">
        ${errorFocus.hasRowIssues
          ? `<button class="btn btn-s btn-show-all" data-filter-role="show-all" onclick="showAllStatementDetails('${safeId}', event)">Show all</button>`
          : `<button class="btn btn-s a" data-filter-role="invoice" data-invoice="ALL" onclick="fD('${safeId}','ALL',this)">All</button>`
        }
        ${errorFocus.hasRowIssues ? `<button class="btn btn-s btn-focus a" data-filter-role="errors" onclick="focusStatementErrors('${safeId}','ALL', event)">Errors only (${errorFocus.rowCount})</button>` : ''}
        ${invoices.map(inv => `
          <button
            class="btn btn-s ${errorFocus.invoiceCounts.has(inv) ? 'btn-err-invoice' : ''}"
            data-filter-role="invoice"
            data-invoice="${esc(inv)}"
            data-has-error="${errorFocus.invoiceCounts.has(inv) ? '1' : '0'}"
            ${errorFocus.hasRowIssues && !errorFocus.invoiceCounts.has(inv) ? 'style="display:none"' : ''}
            onclick="fD('${safeId}','${esc(inv)}',this)"
          >${esc(inv)}</button>
        `).join('')}
      </div>
      <div class="tw">
        <table id="${safeId}" data-current-invoice="ALL" data-errors-only="${errorFocus.hasRowIssues ? '1' : '0'}">
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
              <th class="tr">${t('page')}</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderValidationList(stmt, safeId, errorFocus) {
  const issueCount = stmt.vr.filter(check => check.sv === 'f').length;
  const rank = { f: 0, w: 1, p: 2 };
  const sortedChecks = stmt.vr
    .map((check, index) => ({ check, index }))
    .sort((a, b) => (rank[a.check.sv] ?? 9) - (rank[b.check.sv] ?? 9) || a.index - b.index)
    .map(({ check }) => check);
  const checks = sortedChecks.map(check => `
    <div class="vi ${check.sv === 'f' ? 'vi-f' : check.sv === 'w' ? 'vi-w' : 'vi-p'}">
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
    <details ${issueCount && !errorFocus.hasRowIssues ? 'open' : ''} id="${safeId}-validation">
      <summary>${t('validation')} (${stmt.vr.length} ${t('checks')}, ${issueCount} ${t('issues')})</summary>
      <div class="validation-list">${checks}</div>
    </details>
  `;
}

function renderHierarchy(codes) {
  const rows = [];
  for (const code of codes) {
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

function toggleCountryFilterMode() {
  if (!analysisResults) return;
  const countries = Object.keys(analysisResults).sort();
  const countrySummary = buildCountrySummary(countries);
  const issueCountries = countries.filter(code => countrySummary[code].hasIssues);
  const canFilterCountries = countries.length > 1 && issueCountries.length > 0 && issueCountries.length < countries.length;
  if (!canFilterCountries) return;
  const currentlyShowAll = countryFilterShowAllOverride === null ? false : countryFilterShowAllOverride;
  countryFilterShowAllOverride = !currentlyShowAll;
  renderResults();
}

function swC(code) {
  document.querySelectorAll('.gc').forEach(card => card.classList.remove('a'));
  document.getElementById(`gc-${code}`)?.classList.add('a');
}

function focusCountry(code) {
  swC(code);
  swTab(code);
  const target = document.getElementById(`tp-${code}`) || document.getElementById(`tab-${code}`) || resultsEl;
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  applyDetailFilter(safeId, invoice, false);
  updateDetailFilterControls(safeId, invoice, false);
  document.getElementById(`${safeId}-card`)?.classList.remove('focus-mode');
}

function applyDetailFilter(safeId, invoice, errorsOnly) {
  const table = document.getElementById(safeId);
  if (!table) return;
  table.dataset.currentInvoice = invoice;
  table.dataset.errorsOnly = errorsOnly ? '1' : '0';
  table.querySelectorAll('tbody tr').forEach(row => {
    const invoiceOk = invoice === 'ALL' || row.dataset.inv === invoice;
    const errorOk = !errorsOnly || row.dataset.errorRow === '1';
    row.style.display = invoiceOk && errorOk ? '' : 'none';
  });
}

function updateDetailFilterControls(safeId, invoice, errorsOnly) {
  const filterRow = document.querySelector(`#${safeId}-detail .filter-row`);
  if (!filterRow) return;
  filterRow.querySelectorAll('[data-filter-role="invoice"]').forEach(button => {
    const hasError = button.dataset.hasError === '1';
    button.classList.toggle('a', button.dataset.invoice === invoice);
    button.style.display = !errorsOnly || hasError ? '' : 'none';
  });
  filterRow.querySelectorAll('[data-filter-role="errors"]').forEach(button => {
    button.classList.toggle('a', errorsOnly);
  });
  filterRow.querySelectorAll('[data-filter-role="show-all"]').forEach(button => {
    button.classList.toggle('a', !errorsOnly && invoice === 'ALL');
  });
}

function toggleStatement(safeId, event) {
  event?.stopPropagation();
  const body = document.getElementById(`${safeId}-body`);
  const toggle = document.getElementById(`${safeId}-toggle`);
  if (!body || !toggle) return;
  const collapsed = body.classList.toggle('collapsed');
  toggle.textContent = collapsed ? 'Expand' : 'Collapse';
  toggle.setAttribute('aria-expanded', String(!collapsed));
}

function clearFocusedRow(safeId) {
  document.querySelectorAll(`#${safeId} tbody tr.row-focus`).forEach(row => row.classList.remove('row-focus'));
}

function focusTableRow(row) {
  if (!row) return;
  row.classList.add('row-focus');
  row.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setSectionOpen(id, open) {
  const section = document.getElementById(id);
  if (section) section.open = open;
}

function enterStatementFocusMode(safeId) {
  document.getElementById(`${safeId}-card`)?.classList.add('focus-mode');
  setSectionOpen(`${safeId}-detail`, true);
  setSectionOpen(`${safeId}-comparison`, false);
  setSectionOpen(`${safeId}-summary`, false);
  setSectionOpen(`${safeId}-tranche`, false);
}

function focusStatementErrors(safeId, invoice, event) {
  event?.stopPropagation();
  const body = document.getElementById(`${safeId}-body`);
  const toggle = document.getElementById(`${safeId}-toggle`);
  if (body?.classList.contains('collapsed')) {
    body.classList.remove('collapsed');
    if (toggle) {
      toggle.textContent = 'Collapse';
      toggle.setAttribute('aria-expanded', 'true');
    }
  }
  enterStatementFocusMode(safeId);
  clearFocusedRow(safeId);
  applyDetailFilter(safeId, invoice, true);
  updateDetailFilterControls(safeId, invoice, true);
  const target = invoice === 'ALL'
    ? document.querySelector(`#${safeId} tbody tr[data-error-row="1"]`)
    : document.querySelector(`#${safeId} tbody tr[data-inv="${invoice}"][data-error-row="1"]`) || document.querySelector(`#${safeId} tbody tr[data-inv="${invoice}"]`);
  focusTableRow(target);
}

function showAllStatementDetails(safeId, event) {
  event?.stopPropagation();
  clearFocusedRow(safeId);
  applyDetailFilter(safeId, 'ALL', false);
  updateDetailFilterControls(safeId, 'ALL', false);
  document.getElementById(`${safeId}-card`)?.classList.remove('focus-mode');
}

function jumpToValidation(safeId, event) {
  event?.stopPropagation();
  const body = document.getElementById(`${safeId}-body`);
  const toggle = document.getElementById(`${safeId}-toggle`);
  const validation = document.getElementById(`${safeId}-validation`);
  if (body?.classList.contains('collapsed')) {
    body.classList.remove('collapsed');
    if (toggle) {
      toggle.textContent = 'Collapse';
      toggle.setAttribute('aria-expanded', 'true');
    }
  }
  if (validation) validation.open = true;
  const firstError = validation?.querySelector('.vi-f') || validation;
  firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function jumpToPrimaryIssue(safeId, event) {
  const table = document.getElementById(safeId);
  const hasErrorRows = table?.querySelector('tbody tr[data-error-row="1"]');
  if (hasErrorRows) {
    focusStatementErrors(safeId, 'ALL', event);
    return;
  }
  jumpToValidation(safeId, event);
}

window.swC = swC;
window.focusCountry = focusCountry;
window.swTab = swTab;
window.swSub = swSub;
window.fD = fD;
window.toggleStatement = toggleStatement;
window.focusStatementErrors = focusStatementErrors;
window.showAllStatementDetails = showAllStatementDetails;
window.jumpToValidation = jumpToValidation;
window.jumpToPrimaryIssue = jumpToPrimaryIssue;

const EXCEL_CELL_CHAR_LIMIT = 32767;
const EXCEL_TRUNCATION_SUFFIX = ' ...[truncated]';

function normalizeExportCellValue(value) {
  if (value == null) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  const text = String(value);
  if (text.length <= EXCEL_CELL_CHAR_LIMIT) return text;
  const keep = Math.max(0, EXCEL_CELL_CHAR_LIMIT - EXCEL_TRUNCATION_SUFFIX.length);
  return `${text.slice(0, keep)}${EXCEL_TRUNCATION_SUFFIX}`;
}

function normalizeExportRows(rows) {
  return rows.map(row => row.map(normalizeExportCellValue));
}

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
  const billingRows = [[
    'File',
    'Country',
    'Statement',
    'Invoice',
    'Payment Term',
    'Charges',
    'Tax',
    'Total',
    'Arithmetic',
    'Arithmetic Diff',
    'CRF',
    'RDF'
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
    for (const row of stmt.bs) {
      billingRows.push([
        stmt.fileName,
        stmt.country,
        stmt.hd.stmtNum,
        row.inv || '',
        row.paymentTerm || '',
        normalizeExportAmount(row.charges ?? '', stmt.cur),
        normalizeExportAmount(row.tax ?? '', stmt.cur),
        normalizeExportAmount(row.total ?? '', stmt.cur),
        row.arithmeticStatus || '',
        normalizeExportAmount(row.arithmeticDiff ?? '', stmt.cur),
        normalizeExportAmount(row.crf ?? '', stmt.cur),
        normalizeExportAmount(row.rdf ?? '', stmt.cur),
      ]);
    }
    for (const tranche of stmt.trancheSummary) {
      trancheRows.push([
        stmt.fileName,
        stmt.country,
        stmt.hd.stmtNum,
        tranche.tranche || '',
        tranche.qty ?? '',
        normalizeExportAmount(tranche.charges ?? '', stmt.cur),
        tranche.invoiceCount ?? '',
        tranche.invoiceNos.join(', '),
      ]);
    }
    for (const item of stmt.li) {
      detailRows.push([
        stmt.country,
        stmt.hd.stmtNum,
        item.inv,
        item.tranche || '',
        item.pid || '',
        item.pname || '',
        item.qty ?? '',
        normalizeExportAmount(item.up ?? '', stmt.cur),
        normalizeExportAmount(item.expectedCharges ?? '', stmt.cur),
        normalizeExportAmount(item.charges ?? '', stmt.cur),
        normalizeExportAmount(item.priceGap ?? '', stmt.cur),
        item.priceGapStatus || '',
        normalizeExportAmount(item.tax ?? '', stmt.cur),
        normalizeExportAmount(item.total ?? '', stmt.cur),
        item.srcPage ?? '',
      ]);
    }
  }

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(normalizeExportRows(summaryRows)), 'Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(normalizeExportRows(billingRows)), 'Billing Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(normalizeExportRows(trancheRows)), 'Tranche Summary');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(normalizeExportRows(detailRows)), 'Detail Line Items');
  XLSX.writeFile(wb, computeExportFilename(statements));
}

window.addFiles = addFiles;
window.clearAll = clearAll;
window.doExport = doExport;
window.removeFile = removeFile;
window.runAll = runAll;
