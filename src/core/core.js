pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const VERSION='3.12.4';
document.getElementById('verTag').textContent='v'+VERSION;

const I={
  en:{
    title:'Lenovo DaaS Invoice Validator',
    drop_title:'Drop Lenovo DaaS invoice PDFs here, or click to select',
    drop_sub:'Supports 31 Sales Orgs (AT/AU/BE/CA/CH/DE/ES/FR/GB/GR/HK/IE/IN/IT/JP/KR/MY/NL/NZ/PH/PT/SE/SG/TH/US) - Multiple files allowed',
    run_btn:'Run Verification',
    export_btn:'Export Excel',
    clear_btn:'Clear All',
    results_by:'Results by Country / Region',
    stmts:'Statements',
    invoices:'Invoices',
    items:'Line Items',
    unmapped:'Unmapped',
    issues:'Issues',
    matched:'Matched',
    sum_only:'Detail Pages Missing',
    det_only:'Detail Only',
    comparison:'Summary vs Detail Comparison',
    hierarchy:'Hierarchy',
    all_errors:'All Errors',
    billing_sum:'Billing Summary',
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
    product:'Product',
    name:'Name',
    tranche:'Tranche',
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

// 閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅?// COUNTRY DETECTION
// 閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅查埡鎰ㄦ櫜閳烘劏鏅?
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
      }
    }
    if(!h.period){const m=ln.match(/(?:Billing\s*Period|Recurring\s*Charge\s*Period)[:\s]*(.+)/i);if(m)h.period=m[1].trim()}
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
  for(let i=0;i<Math.min(lines.length,30);i++){
    if(/Sold[\s-]*To/i.test(lines[i].text)){
      for(let j=i+1;j<Math.min(i+6,lines.length);j++){
        const cl=lines[j].text.trim();
        if(cl&&!/^\d+$/.test(cl)&&!/^[A-Z]{2}$/.test(cl)&&cl.length>3&&!/^\d{5,}/.test(cl)&&!/Street|Dr |Ave |Road|Rd /i.test(cl)){h.custName=cl;break}
      }
      break;
    }
  }
  if(!h.custName)for(const{text:ln}of lines){const m=ln.match(/Customer\s*Name[:\s]*(.+)/i);if(m){h.custName=m[1].trim();break}}
  return h;
}

