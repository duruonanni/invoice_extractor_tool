pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const VERSION='3.12.35';
document.getElementById('verTag').textContent='v'+VERSION;

const I={
  en:{
    title:'Lenovo EaaS Invoice Validator',
    drop_title:'Drop Lenovo EaaS invoice PDFs here, or click to select',
    drop_sub:'Supports 31 Sales Orgs across 25 countries (AT/AU/BE/CA/CH/DE/ES/FR/GB/GR/HK/IE/IN/IT/JP/KR/MY/NL/NZ/PH/PT/SE/SG/TH/US) - Multiple files allowed',
    run_btn:'Run Verification',
    export_btn:'Export Excel',
    clear_btn:'Clear All',
    results_by:'Results by Country / Region',
    batch_ready:'Ready for export',
    batch_review:'Review validation details below',
    batch_pass_title:'All Checks Passed',
    batch_pass_desc:'No validation issues were detected across this batch.',
    batch_warn_title:'Validation Completed With Warnings',
    batch_warn_desc:'The batch completed with warnings that should be reviewed.',
    batch_fail_title:'Validation Issues Detected',
    batch_fail_desc:'One or more statements require attention before export.',
    stmts:'Statements',
    invoices:'Invoices',
    items:'Line Items',
    unmapped:'Unmapped',
    issues:'Issues',
    errors:'Errors',
    warnings:'Warnings',
    matched:'Matched',
    sum_only:'Detail Pages Missing',
    det_only:'Detail Only',
    comparison:'Summary vs Detail Comparison',
    hierarchy:'Hierarchy',
    all_errors:'All Errors',
    billing_sum:'Billing Summary',
    tranche_summary:'Tranche Summary',
    detail_items:'Detail Line Items',
    validation:'Validation',
    checks:'checks',
    grand_total:'GRAND TOTAL',
    invoice:'Invoice',
    status:'Status',
    charges:'Charges',
    tax:'Tax',
    total:'Total',
    diff:'Diff',
    match:'Match',
    qty:'Qty',
    unit_price:'Unit Price',
    expected_charges:'Expected Charges',
    price_gap:'Price Gap',
    gap_status:'Gap Status',
    arithmetic:'Arithmetic',
    arithmetic_diff:'Arithmetic Diff',
    product:'Product',
    name:'Name',
    tranche:'Tranche',
    payment_term:'Payment Term',
    invoice_nos:'Invoice Number',
    invoice_count:'Invoice Count',
    file:'File',
    page:'Page',
    no_items:'No line items found',
    detecting:'Detecting',
    parsing:'Parsing',
    starting:'Starting',
    rendering:'Rendering',
    done:'Done',
    ok:'OK',
    error:'ERROR',
    pass:'PASS',
    fail:'FAIL'
  },
  zh:{},
  es:{}
};
let curLang='en';
function t(k){return I[curLang][k]||I.en[k]||k}
function setLang(l){curLang=l;document.querySelectorAll('[data-t]').forEach(el=>{const k=el.dataset.t;if(I[l][k])el.textContent=I[l][k]});if(analysisResults)renderResults()}

const CM={AT:{flag:'AT',label:'Austria',cur:'EUR'},AU:{flag:'AU',label:'Australia',cur:'AUD'},BE:{flag:'BE',label:'Belgium',cur:'EUR'},CA:{flag:'CA',label:'Canada',cur:'CAD'},CH:{flag:'CH',label:'Switzerland',cur:'CHF'},DE:{flag:'DE',label:'Germany',cur:'EUR'},ES:{flag:'ES',label:'Spain',cur:'EUR'},FR:{flag:'FR',label:'France',cur:'EUR'},GB:{flag:'GB',label:'United Kingdom',cur:'GBP'},GR:{flag:'GR',label:'Greece',cur:'EUR'},HK:{flag:'HK',label:'Hong Kong',cur:'HKD'},IE:{flag:'IE',label:'Ireland',cur:'EUR'},IN:{flag:'IN',label:'India',cur:'INR'},IT:{flag:'IT',label:'Italy',cur:'EUR'},JP:{flag:'JP',label:'Japan',cur:'JPY'},KR:{flag:'KR',label:'South Korea',cur:'KRW'},MY:{flag:'MY',label:'Malaysia',cur:'MYR'},NL:{flag:'NL',label:'Netherlands',cur:'EUR'},NZ:{flag:'NZ',label:'New Zealand',cur:'NZD'},PH:{flag:'PH',label:'Philippines',cur:'PHP'},PT:{flag:'PT',label:'Portugal',cur:'EUR'},SE:{flag:'SE',label:'Sweden',cur:'SEK'},SG:{flag:'SG',label:'Singapore',cur:'SGD'},TH:{flag:'TH',label:'Thailand',cur:'THB'},US:{flag:'US',label:'United States',cur:'USD'},OTHER:{flag:'OT',label:'Other',cur:'USD'}};
let fileEntries=[],eid=0,analysisResults=null;
const pN=s=>s?parseFloat(String(s).replace(/,/g,''))||0:0;
function fc(n,c){
  const sym={JPY:'JPY ',EUR:'EUR ',GBP:'GBP ',CHF:'CHF ',SEK:'SEK ',KRW:'KRW ',INR:'INR ',MYR:'RM ',PHP:'PHP ',AUD:'$',NZD:'NZ$',CAD:'CA$',SGD:'S$',THB:'THB ',HKD:'HK$',USD:'$'};
  const s=sym[c]||'';const noD=c==='JPY'||c==='KRW';
  return s+(noD?Math.round(n).toLocaleString():n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}));
}
function fmtSz(b){if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(0)+'KB';return(b/1048576).toFixed(1)+'MB'}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function normText(t){
  return t
    .replace(/\u00e2\u201a\u00ac|\u20ac/g,'EUR')
    .replace(/\u00c2\u00a3|\u00a3/g,'GBP')
    .replace(/\u00c2\u00a5|\u00a5|\uffe5/g,'JPY')
    .replace(/\u20a9/g,'KRW');
}

function inferDisplayName(rawName, country, lines){
  const name=String(rawName||'');
  if(!/~\d+\.pdf$/i.test(name))return name;
  const hd=parseHeader(lines||[]);
  const stmt=hd.stmtNum||'';
  const langMap={JP:'JA',KR:'KO'};
  const lang = langMap[country]||'EN';
  if(stmt&&country&&country!=='OTHER'){
    return `${country}_STMT_BRIM_STATEMENT_${stmt}_${lang}.PDF`;
  }
  return stmt||name;
}

function isZeroDecimalCurrency(cur){
  return cur==='JPY'||cur==='KRW';
}

function priceGapTolerance(cur){
  return isZeroDecimalCurrency(cur)?1:0.01;
}

function normalizeExportAmount(value, cur){
  const num=Number(value);
  if(!Number.isFinite(num))return value;
  if(Math.abs(num)<1e-9)return 0;
  const digits=isZeroDecimalCurrency(cur)?0:2;
  return Number(num.toFixed(digits));
}

function computeLinePriceAudit(item,cur){
  const qty=Number(item?.qty)||0;
  const up=Number(item?.up)||0;
  const charges=Number(item?.charges)||0;
  const expectedCharges=qty*up;
  const gap=Math.abs(expectedCharges-charges);
  const tolerance=priceGapTolerance(cur);
  const epsilon=1e-9;
  const anomaly=gap+epsilon>=tolerance;
  return{
    expectedCharges,
    priceGap:gap,
    priceGapTolerance:tolerance,
    priceGapAnomaly:anomaly,
    priceGapStatus:anomaly?'Anomaly':'OK',
  };
}

function buildTrancheSummary(items){
  const grouped=new Map();
  for(const item of items||[]){
    const tranche=String(item?.tranche||'').trim();
    if(!grouped.has(tranche)){
      grouped.set(tranche,{tranche,qty:0,charges:0,invoices:new Set(),lineItems:0});
    }
    const row=grouped.get(tranche);
    row.qty+=(Number(item?.qty)||0);
    row.charges+=(Number(item?.charges)||0);
    if(item?.inv)row.invoices.add(String(item.inv));
    row.lineItems+=1;
  }
  return [...grouped.values()]
    .map(row=>({
      tranche:row.tranche,
      qty:row.qty,
      charges:row.charges,
      invoiceCount:row.invoices.size,
      invoiceNos:[...row.invoices].sort(),
      lineItems:row.lineItems,
    }))
    .sort((a,b)=>{
      if(!a.tranche&&b.tranche)return 1;
      if(a.tranche&&!b.tranche)return-1;
      return a.tranche.localeCompare(b.tranche);
    });
}

function formatYYYYMMDD(date=new Date()){
  const y=String(date.getFullYear());
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return `${y}${m}${d}`;
}

function sanitizeExportToken(value){
  return String(value||'')
    .replace(/\.pdf$/i,'')
    .trim()
    .replace(/[^\w.-]+/g,'_')
    .replace(/^_+|_+$/g,'')||'UNKNOWN';
}

function computeExportFilename(statements,date=new Date()){
  if(!statements?.length)return `Invoice_Validator_Export_${formatYYYYMMDD(date)}.xlsx`;
  if(statements.length>1){
    const countrySet=new Set(statements.map(stmt=>sanitizeExportToken(stmt?.country||'Country')));
    const stmtCount=statements.length;
    const countryCount=countrySet.size;
    const scope=countryCount===1
      ? `${[...countrySet][0]}_${stmtCount}Statements`
      : `MULTI_${stmtCount}Statements_${countryCount}Countries`;
    return `${scope}_Invoice_Validator_Export_${formatYYYYMMDD(date)}.xlsx`;
  }
  const first=statements[0];
  const stmtToken=sanitizeExportToken(first?.hd?.stmtNum||first?.fileName||'Statement');
  const countryToken=sanitizeExportToken(first?.country||'Country');
  return `${stmtToken}_${countryToken}_Invoice_Validator_Export_${formatYYYYMMDD(date)}.xlsx`;
}

function extractInvoiceMetadata(lines,country){
  const supported=new Set(['CH','AT','NL','AU','TH','US','HK','SG','CA','NZ','PT','PH','GR','ES','IT']);
  if(!supported.has(country))return new Map();
  const meta=new Map();
  let curInv='';
  let statementPaymentTerm='';
  function ensure(inv){
    if(!meta.has(inv))meta.set(inv,{paymentTerm:statementPaymentTerm});
    return meta.get(inv);
  }
  function captureInvoiceAt(idx){
    for(let j=idx+1;j<Math.min(idx+4,lines.length);j++){
      const m=String(lines[j].text||'').trim().match(/^(\d{7,12})\b/);
      if(m)return m[1];
    }
    return '';
  }
  function normalizePaymentTerm(raw){
    return String(raw||'')
      .replace(/\s+/g,' ')
      .replace(/\s*(Tax:|Total Amount Due:|Due Date:|Payment Instruction:).*$/i,'')
      .trim();
  }
  for(let i=0;i<lines.length;i++){
    const ln=String(lines[i].text||'').trim();
    if(!ln)continue;
    const inlineInv=
      ln.match(/Invoice\s*Number[:\s]*(\d{7,12})/i)||
      ln.match(/Lenovo\s*Ref\.?\s*No\.?[:\s]*(\d{7,12})/i)||
      ln.match(/For\s*Internal\s*Lenovo\s*Use[:\s]*(\d{7,12})/i)||
      ln.match(/송장\s*번호[:\s]*(\d{7,12})/i);
    if(inlineInv){
      curInv=inlineInv[1];
      ensure(curInv);
    }else if(/^Invoice\s*Number\s+Invoice\s*Date\s+Customer\s*Number/i.test(ln)||/^N[uú]mero\s+de\s+factura\s+Fecha\s+de\s+Factura\s+N[uú]mero\s+de\s+Cliente/i.test(ln)){
      const nextInv=captureInvoiceAt(i);
      if(nextInv){
        curInv=nextInv;
        ensure(curInv);
      }
    }
    if(!curInv)continue;
    const pm=ln.match(/Payment\s*Terms?\s*:\s*(.+)$/i)||ln.match(/Condiciones\s+de\s+Pagos\s*:\s*(.+)$/i);
    if(pm){
      const term=normalizePaymentTerm(pm[1]);
      if(!term)continue;
      if(curInv)ensure(curInv).paymentTerm=term;
      else statementPaymentTerm=term;
    }
  }
  if(statementPaymentTerm){
    for(const value of meta.values()){
      if(!value.paymentTerm)value.paymentTerm=statementPaymentTerm;
    }
  }
  return meta;
}

async function pdfToLines(file){
  const buf=await file.arrayBuffer(),pdf=await pdfjsLib.getDocument({data:buf}).promise,out=[];
  for(let p=1;p<=pdf.numPages;p++){
    const pg=await pdf.getPage(p),c=await pg.getTextContent(),items=c.items.filter(x=>x.str.trim());
    if(!items.length)continue;
    const byY={};
    for(const it of items){const y=Math.round(it.transform[5]);if(!byY[y])byY[y]=[];byY[y].push({x:it.transform[4],str:it.str,w:it.width||0})}
    for(const y of Object.keys(byY).map(Number).sort((a,b)=>b-a)){
      const sorted=byY[y].sort((a,b)=>a.x-b.x);
      let text=sorted[0].str;
      for(let i=1;i<sorted.length;i++){
        const prev=sorted[i-1],curr=sorted[i];
        const gap=curr.x-(prev.x+Math.abs(prev.w));
        text+=(gap>1?' ':'')+curr.str;
      }
      text=normText(text);
      out.push({text,page:p});
    }
  }
  return out;
}

// Country detection
function detectCountry(text,fn){
  // Primary: filename pattern EPRE{XX}P (e.g. EPREATP, EPREUSP) or {XX}nn_ prefix
  const fm=fn.match(/EPRE([A-Z]{2})P/i)||fn.match(/^([A-Z]{2})\d+_/i);
  if(fm){const cc=fm[1].toUpperCase();if(CM[cc])return cc;}
  // Special: CLP prefix => HK
  if(fn.includes('CLP'))return'HK';
  // Fallback: content-based detection
  if(/\bJPY\b/.test(text))return'JP';
  if(/\bCHF\b/.test(text))return'CH';
  if(/\bHKD\b/.test(text))return'HK';
  if(/\bAUD\b/.test(text))return'AU';
  if(/\bTHB\b/.test(text))return'TH';
  if(/\bKRW\b/.test(text))return'KR';
  if(/\bINR\b/.test(text))return'IN';
  if(/\bRM\b/.test(text))return'MY';
  if(/\bSEK\b/.test(text))return'SE';
  if(/\bGBP\b/.test(text))return'GB';
  if(/\bEUR\b/.test(text))return'AT';
  if(/\bUSD\b/.test(text))return'US';
  return'OTHER';
}

function parseHeader(lines){
  const h={stmtNum:'',date:'',custName:'',custNum:'',period:''};
  function normalizeCustomerName(value){
    let v=String(value||'').replace(/\s+/g,' ').trim();
    if(!v)return '';
    const parts=v.split(/\s{2,}|(?<=\.)\s+(?=[A-Z])/).map(x=>x.trim()).filter(Boolean);
    if(parts.length>1&&parts.every(p=>p.toUpperCase()===parts[0].toUpperCase()))v=parts[0];
    const dup=v.match(/^(.+?)\s+\1(?:\s+\1)+$/i);
    if(dup)v=dup[1].trim();
    return v;
  }
  function customerNameScore(value){
    const v=normalizeCustomerName(value);
    if(!isLikelyCustomerName(v))return -999;
    let score=v.length;
    if(/\b(Ltd|Limited|Inc|Corp|Council|GmbH|B\.?V\.?|Pty|Solutions|Technology|Foods|Consulting|S\.?A\.?|Company)\b/i.test(v))score+=25;
    if(/\d/.test(v))score-=20;
    if(/\b[A-Z]{2,4}\s+\d{4}\s+[A-Z]{2}\b/.test(v))score-=40;
    return score;
  }
  function isLikelyCustomerName(value){
    const v=String(value||'').trim();
    if(!v)return false;
    if(/^(Lenovo\s+\(India\)|Lenovo\s+Global\s+Technology\s+India)/i.test(v))return false;
    if(/^(Bill|Sold|Ship|Customer)\s*[- ]?To:?$/i.test(v))return false;
    if(/^(Bill|Sold)\s*[- ]?To:\s*(Bill|Sold)\s*[- ]?To:?/i.test(v))return false;
    if(/Account Number:/i.test(v))return false;
    if(/:$/.test(v))return false;
    if(/^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}$/.test(v))return false;
    if(/^\d+$/.test(v))return false;
    if(/^[A-Z]{2}$/.test(v))return false;
    if(/^\d{5,}/.test(v))return false;
    if(/\b[A-Z]{2,4}\s+\d{4}\s+[A-Z]{2}\b/.test(v))return false;
    if(/\b(?:Street|Dr|Ave|Road|Rd)\b|NSW\s+\d{4}|VIC\s+\d{4}|QLD\s+\d{4}|WA\s+\d{4}|SA\s+\d{4}|TAS\s+\d{4}|ACT\s+\d{4}|NT\s+\d{4}/i.test(v))return false;
    return true;
  }
  for(let i=0;i<lines.length;i++){
    const ln=lines[i].text;
    if(!h.stmtNum){
      const m=ln.match(/Statement\s*Number[:\s]*([A-Z]{2,}\w{5,}|\d{6,})/i);
      if(m){
        if(!/^(Statement|Date|Customer)$/i.test(m[1]))h.stmtNum=m[1];
      }else if(/Statement\s*Number/i.test(ln)){
        for(let j=i+1;j<Math.min(i+4,lines.length);j++){
          const look=lines[j].text.trim();
          const lm=look.match(/\b([A-Z]{2,}\w{5,}|\d{6,})\b/);
          if(lm){h.stmtNum=lm[1];break}
        }
      }else{
        const sm=ln.match(/Statement\s*No\.?\s*:\s*([A-Z]{2,}\w{5,}|\d{6,})/i);
        if(sm&&!/^(Statement|Date|Customer)$/i.test(sm[1]))h.stmtNum=sm[1];
        const jm=ln.match(/明細書番号\s*([A-Z]{2,}\w{5,}|\d{6,})/);
        if(jm)h.stmtNum=jm[1];
        const em=ln.match(/^([A-Z]{2,}\w{5,})\s+(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\s+(\d{6,})$/);
        if(em&&/Fecha\s+estado\s+de\s+cuenta/i.test(lines[i-2]?.text||'')){
          h.stmtNum=em[1];
          if(!h.date)h.date=em[2];
          if(!h.custNum)h.custNum=em[3];
        }
      }
    }
    if(!h.date){
      const m=ln.match(/(?:Statement\s*Date|Date)[:\s]*([\d\/\.\-]+)/i);
      if(m){
        h.date=m[1];
      }else if(/Statement\s*Date/i.test(ln)){
        for(let j=i+1;j<Math.min(i+3,lines.length);j++){
          const look=lines[j].text.trim();
          const lm=look.match(/\b(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\b/);
          if(lm){h.date=lm[1];break}
        }
      }else{
        const dm=ln.match(/Date\s+of\s+Statement:\s*([\d\/\.\-]+)/i);
        if(dm)h.date=dm[1];
        const jm=ln.match(/明細書日付\s*([\d\/\.\-]+)/);
        if(jm)h.date=jm[1];
      }
    }
    if(!h.custNum){
      const m=ln.match(/(?:Customer\s*Number|Sold[\s-]*To)[:\s]*([\d]+)/i);
      if(m){
        if(!/D\.V\.R\./i.test(ln))h.custNum=m[1];
      }else if(/Customer\s*Number/i.test(ln)){
        for(let j=i+1;j<Math.min(i+3,lines.length);j++){
          const look=lines[j].text.trim();
          const lm=look.match(/\b(\d{6,})\b/);
          if(lm){h.custNum=lm[1];break}
        }
      }else{
        const jm=ln.match(/お客様番号\s*(\d{6,})/);
        if(jm)h.custNum=jm[1];
      }
    }
    if(!h.period){const m=ln.match(/(?:Billing\s*Period|Recurring\s*Charge\s*Period)[:\s]*(.+)/i);if(m)h.period=m[1].trim()}
    if(!h.period){
      const pm=ln.match(/請求対象期間\s*(.+)/);
      if(pm)h.period=pm[1].trim();
      const esp=ln.match(/^(\d{1,2}\/\d{1,2}\/\d{4}\s+to\s+\d{1,2}\/\d{1,2}\/\d{4})$/i);
      if(esp&&/Periodo\s+de\s+validez/i.test(lines[i-1]?.text||''))h.period=esp[1].trim();
    }
    if(!h.custName){
      const soldToInline=ln.match(/Sold[\s-]*To:\s*(.+)$/i);
      if(soldToInline&&isLikelyCustomerName(soldToInline[1])){
        h.custName=normalizeCustomerName(soldToInline[1]);
      }else{
        const billToInline=ln.match(/Bill[\s-]*To:\s*(.+)$/i);
        if(billToInline&&isLikelyCustomerName(billToInline[1]))h.custName=normalizeCustomerName(billToInline[1]);
        const buyerEs=(lines[i].text||'').match(/^Nombre y dirección del comprador$/i);
        if(buyerEs){
          const next=(lines[i+1]?.text||'').trim().split(/\s+Lenovo\b/)[0].trim();
          if(isLikelyCustomerName(next))h.custName=normalizeCustomerName(next);
        }
      }
    }
    if(!h.custName){
      const nm=ln.match(/^Name:\s*(.+?)(?:\s+Natural\s+of\s+Statement:|\s+Date\s+of\s+Statement:|$)/i);
      if(nm){
        let name=nm[1].trim();
        const next=(lines[i+1]?.text||'').trim();
        const nextName=next.match(/^([A-Z0-9&().,'\/ -]{2,}?)\s+(?:Natural\s+of\s+Statement:|Date\s+of\s+Statement:|PO\s+No:|Address:|State:|GSTIN|Bill\s+To\s+Country:|Remark:|$)/i);
        if(nextName&&nextName[1]&&!/^(Address|State|Remark|PO)$/i.test(nextName[1])){
          name=`${name} ${nextName[1].trim()}`.replace(/\s+/g,' ');
        }
        if(isLikelyCustomerName(name))h.custName=normalizeCustomerName(name);
      }else{
        const cm=ln.match(/^Customer\s*Name:\s*(.+)$/i);
        if(cm&&isLikelyCustomerName(cm[1]))h.custName=normalizeCustomerName(cm[1].trim());
        else if(/^Customer\s*Name:\s*$/i.test(ln)){
          const prev=(lines[i-1]?.text||'').trim();
          if(isLikelyCustomerName(prev))h.custName=normalizeCustomerName(prev);
        }
        const jm=ln.match(/お客様名\s*(.+)/);
        if(jm)h.custName=normalizeCustomerName(jm[1]);
      }
    }
  }
  for(let i=0;i<Math.min(lines.length,15);i++){
    const ln=lines[i].text.trim();
    if(/Statement\s*Number\s+Statement\s*Date\s+Customer\s*Number/i.test(ln)&&i+2<lines.length){
      const vals=lines[i+2].text.trim().match(/\b([A-Z]{2,}\w{5,})\b.*?\b(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})\b.*?\b(\d{6,})\b/);
      if(vals){
        h.stmtNum=vals[1];
        if(!h.date)h.date=vals[2];
        h.custNum=vals[3];
      }
      break;
    }
  }
  if(!h.custName)for(let i=0;i<Math.min(lines.length,30);i++){
    if(/(?:Sold|Bill)[\s-]*To/i.test(lines[i].text)){
      for(let j=i+1;j<Math.min(i+6,lines.length);j++){
        const cl=lines[j].text.trim();
        if(isLikelyCustomerName(cl)){h.custName=normalizeCustomerName(cl);break}
      }
      break;
    }
  }
  if(!h.custName){
    for(let i=0;i<lines.length;i++){
      const ln=lines[i].text.trim();
      const inline=ln.match(/^(?:Sold|Bill)[\s-]*To:\s*(.+)$/i);
      if(inline&&isLikelyCustomerName(inline[1])){
        h.custName=normalizeCustomerName(inline[1]);
        break;
      }
      if(/^Customer\s*Name:\s*$/i.test(ln)){
        const prev=(lines[i-1]?.text||'').trim();
        if(isLikelyCustomerName(prev)){
          h.custName=normalizeCustomerName(prev);
          break;
        }
      }
    }
  }
  for(const{text:ln}of lines){
    const m=ln.match(/(?:SAP\s+)?Customer\s*Name[:\s]*(.+)/i);
    if(!m||!isLikelyCustomerName(m[1]))continue;
    const candidate=normalizeCustomerName(m[1]);
    if(!h.custName||customerNameScore(candidate)>customerNameScore(h.custName))h.custName=candidate;
  }
  if(!h.custName){
    for(let i=0;i<lines.length;i++){
      const ln=lines[i].text.trim();
      if(/^Nombre y dirección del comprador$/i.test(ln)||/^Nombre y dirección de facturación/i.test(ln)){
        const next=(lines[i+1]?.text||'').trim().split(/\s+Lenovo\b/)[0].trim();
        if(isLikelyCustomerName(next)){h.custName=normalizeCustomerName(next);break;}
      }
    }
  }
  return h;
}
