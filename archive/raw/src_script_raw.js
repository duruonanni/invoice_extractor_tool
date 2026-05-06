
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const VERSION='3.12.4';
document.getElementById('verTag').textContent='v'+VERSION;

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// i18n
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
const I={
en:{title:'Lenovo DaaS Invoice Validator',drop_title:'Drop Lenovo DaaS invoice PDFs here, or click to select',drop_sub:'Supports 31 Sales Orgs (AT路AU路BE路CA路CH路DE路ES路FR路GB路GR路HK路IE路IN路IT路JP路KR路MY路NL路NZ路PH路PT路SE路SG路TH路US) 鈥?Multiple files allowed',run_btn:'鈻?Run Verification',export_btn:'馃摜 Export Excel',clear_btn:'馃棏 Clear All',results_by:'Results by Country / Region',stmts:'Statements',invoices:'Invoices',items:'Line Items',unmapped:'Unmapped',issues:'Issues',matched:'Matched',sum_only:'Detail Pages Missing',det_only:'Detail Only',comparison:'Summary 鈫?Detail Comparison',hierarchy:'Hierarchy',all_errors:'All Errors',billing_sum:'Billing Summary',detail_items:'Detail Line Items',validation:'Validation',checks:'checks',grand_total:'GRAND TOTAL',invoice:'Invoice',status:'Status',charges:'Charges',tax:'Tax',total:'Total',diff:'Diff',match:'Match',qty:'Qty',unit_price:'Unit Price',product:'Product',name:'Name',tranche:'Tranche',file:'File',page:'Page',no_items:'No line items found',detecting:'Detecting鈥?,parsing:'parsing鈥?,starting:'Starting鈥?,rendering:'Rendering鈥?,done:'Done',ok:'OK',error:'ERROR',pass:'PASS',fail:'FAIL'},
zh:{title:'鑱旀兂 DaaS 鍙戠エ楠岃瘉宸ュ叿',drop_title:'灏?Lenovo DaaS 鍙戠エ PDF 鎷栨斁鍒版澶勶紝鎴栫偣鍑婚€夋嫨',drop_sub:'鏀寔31涓攢鍞粍缁?(AT路AU路BE路CA路CH路DE路ES路FR路GB路GR路HK路IE路IN路IT路JP路KR路MY路NL路NZ路PH路PT路SE路SG路TH路US) 鈥?鍙悓鏃朵笂浼犲涓枃浠?,run_btn:'鈻?寮€濮嬮獙璇?,export_btn:'馃摜 瀵煎嚭 Excel',clear_btn:'馃棏 娓呯┖鍏ㄩ儴',results_by:'鎸夊浗瀹?鍦板尯鍒嗙粍',stmts:'璐﹀崟',invoices:'鍙戠エ',items:'琛岄」鐩?,unmapped:'鏈尮閰?,issues:'闂',matched:'宸插尮閰?,sum_only:'浠呭湪姹囨€?,det_only:'浠呭湪鏄庣粏',comparison:'姹囨€?鈫?鏄庣粏 瀵规瘮',hierarchy:'灞傜骇瑙嗗浘',all_errors:'鍏ㄩ儴閿欒',billing_sum:'璐﹀崟姹囨€?,detail_items:'鏄庣粏琛岄」鐩?,validation:'楠岃瘉妫€鏌?,checks:'椤规鏌?,grand_total:'鍚堣',invoice:'鍙戠エ鍙?,status:'鐘舵€?,charges:'璐圭敤',tax:'绋庨',total:'鎬婚',diff:'宸紓',match:'鍖归厤',qty:'鏁伴噺',unit_price:'鍗曚环',product:'浜у搧缂栫爜',name:'浜у搧鍚嶇О',tranche:'Tranche',file:'鏂囦欢',page:'椤电爜',no_items:'鏈壘鍒拌椤圭洰',detecting:'妫€娴嬩腑鈥?,parsing:'瑙ｆ瀽涓€?,starting:'鍚姩涓€?,rendering:'娓叉煋涓€?,done:'瀹屾垚',ok:'姝ｅ父',error:'閿欒',pass:'閫氳繃',fail:'涓嶉€氳繃'},
es:{title:'Validador de Facturas Lenovo DaaS',drop_title:'Arrastre archivos PDF de facturas Lenovo DaaS aqu铆, o haga clic para seleccionar',drop_sub:'Soporta 31 Orgs de Ventas (AT路AU路BE路CA路CH路DE路ES路FR路GB路GR路HK路IE路IN路IT路JP路KR路MY路NL路NZ路PH路PT路SE路SG路TH路US) 鈥?Se permiten m煤ltiples archivos',run_btn:'鈻?Ejecutar Verificaci贸n',export_btn:'馃摜 Exportar Excel',clear_btn:'馃棏 Limpiar Todo',results_by:'Resultados por Pa铆s / Regi贸n',stmts:'Declaraciones',invoices:'Facturas',items:'L铆neas',unmapped:'Sin coincidencia',issues:'Problemas',matched:'Coincidente',sum_only:'Solo en Resumen',det_only:'Solo en Detalle',comparison:'Resumen 鈫?Detalle Comparaci贸n',hierarchy:'Jerarqu铆a',all_errors:'Todos los Errores',billing_sum:'Resumen de Facturaci贸n',detail_items:'L铆neas de Detalle',validation:'Validaci贸n',checks:'verificaciones',grand_total:'TOTAL GENERAL',invoice:'Factura',status:'Estado',charges:'Cargos',tax:'Impuesto',total:'Total',diff:'Dif.',match:'Coincide',qty:'Cant.',unit_price:'Precio Unit.',product:'Producto',name:'Nombre',tranche:'Tranche',file:'Archivo',page:'P谩gina',no_items:'No se encontraron l铆neas de detalle',detecting:'Detectando鈥?,parsing:'analizando鈥?,starting:'Iniciando鈥?,rendering:'Renderizando鈥?,done:'Listo',ok:'OK',error:'ERROR',pass:'APROBADO',fail:'FALLIDO'}
};
let curLang='en';
function t(k){return I[curLang][k]||I.en[k]||k}
function setLang(l){curLang=l;document.querySelectorAll('[data-t]').forEach(el=>{const k=el.dataset.t;if(I[l][k])el.textContent=I[l][k]});if(analysisResults)renderResults()}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// CONSTANTS & STATE
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
const CM={AT:{flag:'馃嚘馃嚬',label:'Austria',cur:'EUR'},AU:{flag:'馃嚘馃嚭',label:'Australia',cur:'AUD'},BE:{flag:'馃嚙馃嚜',label:'Belgium',cur:'EUR'},CA:{flag:'馃嚚馃嚘',label:'Canada',cur:'CAD'},CH:{flag:'馃嚚馃嚟',label:'Switzerland',cur:'CHF'},DE:{flag:'馃嚛馃嚜',label:'Germany',cur:'EUR'},ES:{flag:'馃嚜馃嚫',label:'Spain',cur:'EUR'},FR:{flag:'馃嚝馃嚪',label:'France',cur:'EUR'},GB:{flag:'馃嚞馃嚙',label:'United Kingdom',cur:'GBP'},GR:{flag:'馃嚞馃嚪',label:'Greece',cur:'EUR'},HK:{flag:'馃嚟馃嚢',label:'Hong Kong',cur:'HKD'},IE:{flag:'馃嚠馃嚜',label:'Ireland',cur:'EUR'},IN:{flag:'馃嚠馃嚦',label:'India',cur:'INR'},IT:{flag:'馃嚠馃嚬',label:'Italy',cur:'EUR'},JP:{flag:'馃嚡馃嚨',label:'Japan',cur:'JPY'},KR:{flag:'馃嚢馃嚪',label:'South Korea',cur:'KRW'},MY:{flag:'馃嚥馃嚲',label:'Malaysia',cur:'MYR'},NL:{flag:'馃嚦馃嚤',label:'Netherlands',cur:'EUR'},NZ:{flag:'馃嚦馃嚳',label:'New Zealand',cur:'NZD'},PH:{flag:'馃嚨馃嚟',label:'Philippines',cur:'PHP'},PT:{flag:'馃嚨馃嚬',label:'Portugal',cur:'EUR'},SE:{flag:'馃嚫馃嚜',label:'Sweden',cur:'SEK'},SG:{flag:'馃嚫馃嚞',label:'Singapore',cur:'SGD'},TH:{flag:'馃嚬馃嚟',label:'Thailand',cur:'THB'},US:{flag:'馃嚭馃嚫',label:'United States',cur:'USD'},OTHER:{flag:'馃寪',label:'Other',cur:'USD'}};
let fileEntries=[],eid=0,analysisResults=null;
const pN=s=>s?parseFloat(String(s).replace(/,/g,''))||0:0;
function fc(n,c){
  const sym={JPY:'楼',EUR:'鈧?,GBP:'GBP ',CHF:'CHF ',SEK:'SEK ',KRW:'鈧?,INR:'INR ',MYR:'RM ',PHP:'PHP ',AUD:'$',NZD:'NZ$',CAD:'CA$',SGD:'S$',THB:'喔?,HKD:'HK$',USD:'$'};
  const s=sym[c]||'';const noD=c==='JPY'||c==='KRW';
  return s+(noD?Math.round(n).toLocaleString():n.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}));
}
function fmtSz(b){if(b<1024)return b+'B';if(b<1048576)return(b/1024).toFixed(0)+'KB';return(b/1048576).toFixed(1)+'MB'}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;')}
function normText(t){
  return t
    .replace(/\u00e2\u201a\u00ac|\u20ac/g,'EUR')
    .replace(/\u00c2\u00a3|\u00a3/g,'GBP')
    .replace(/\u00c2\u00a5|\u00a5|\uffe5/g,'JPY')
    .replace(/\u20a9/g,'KRW');
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// PDF 鈫?lines WITH PAGE TRACKING
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
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

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// COUNTRY DETECTION
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
function detectCountry(text,fn){
  // Primary: filename pattern EPRE{XX}P (e.g. EPREATP, EPREUSP) or {XX}nn_ prefix
  const fm=fn.match(/EPRE([A-Z]{2})P/i)||fn.match(/^([A-Z]{2})\d+_/i);
  if(fm){const cc=fm[1].toUpperCase();if(CM[cc])return cc;}
  // Special: CLP prefix 鈫?HK (CLP HK invoices)
  if(fn.includes('CLP'))return'HK';
  // Fallback: content-based detection
  if(text.includes('銉儙銉?)||text.includes('JPY'))return'JP';
  if(text.includes('Schweiz')||text.includes('CHF'))return'CH';
  if(text.includes('Hong Kong')||text.includes('HKD'))return'HK';
  if(text.includes('GST')&&text.includes('AUD'))return'AU';
  if(text.includes('Thailand')||text.includes('THB'))return'TH';
  if(/鈧﹟KRW/.test(text))return'KR';
  if(/\bINR\b/.test(text))return'IN';
  if(/\bRM\s/.test(text))return'MY';
  if(/\bSEK\b/.test(text))return'SE';
  if(/\bGBP\b/.test(text))return'GB';
  if(/鈧?.test(text))return'AT'; // generic EUR fallback
  if(text.includes('USD'))return'US';
  return'OTHER';
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// INDEPENDENT PARSERS PER COUNTRY
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲

// 鈹€鈹€ Shared: Billing Summary 鈹€鈹€
function parseBillingSummary(text){
  const hasSummaryLabel = /(Billing\s*Summary|Summary\s*of\s*Charges|Statement\s*Summary|Summary\s*Charges|Summary\s*By)/i.test(text);
  const res=[];let m;
  // US 5-col: inv $ charges $ tax $ CRF $ RDF $ total
  const usP=/(\d{7,12})\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)/g;
  while((m=usP.exec(text))!==null){
    const num=m[1],ch=pN(m[2]),tx=pN(m[3]),crf=pN(m[4]),rdf=pN(m[5]),tot=pN(m[6]);
    if(!res.find(r=>r.inv===num)&&Math.abs(tot-(ch+tx+crf+rdf))<tot*.02+10)
      res.push({inv:num,charges:ch,tax:tx,total:tot,crf,rdf});
  }
  if(res.length)return res;
  // CA 5-col with EHF: inv $ charges $ tax $ EHF $ total (or $ charges $ tax $ crf $ rdf $ total)
  const caP=/(\d{7,12})\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)/g;
  while((m=caP.exec(text))!==null){
    const num=m[1],ch=pN(m[2]),tx=pN(m[3]),ehf=pN(m[4]),tot=pN(m[5]);
    if(!res.find(r=>r.inv===num)&&Math.abs(tot-(ch+tx+ehf))<tot*.02+10)
      res.push({inv:num,charges:ch,tax:tx,total:tot,crf:ehf,rdf:0});
  }
  if(res.length)return res;
  // Currency symbol patterns: $ 楼 鈧?CHF GBP SEK 鈧?INR RM
  const curSym='(?:\\$|[脗楼茂驴楼]|\\u20ac|\\u00a3|\\u00e2\\u201a\\u00ac|\\u0432\\u201a\\u00ac|EUR|CHF|GBP|SEK|KRW|INR|RM|NZD|MYR|PHP|SGD|THB|AUD|CAD)';
  // 3-col with currency: inv CUR charges CUR tax CUR total
  const p3c=new RegExp('(\\d{7,12})\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)','g');
  while(hasSummaryLabel && (m=p3c.exec(text))!==null){
    const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
    if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
      res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
  }
  if(res.length)return res;
  // 3-col with suffix currency: inv charges CUR tax CUR total CUR
  const curSymS='(?:\\u20ac|\\u00a3|\\u00e2\\u201a\\u00ac|\\u0432\\u201a\\u00ac|SEK|GBP|EUR|CHF)';
  const p3cS=new RegExp('(\\d{7,12})\\s+([\\d,]+\\.?\\d*)\\s*'+curSymS+'\\s+([\\d,]+\\.?\\d*)\\s*'+curSymS+'\\s+([\\d,]+\\.?\\d*)\\s*'+curSymS,'g');
  while(hasSummaryLabel && (m=p3cS.exec(text))!==null){
    const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
    if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
      res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
  }
  if(res.length)return res;
  // Plain 3-col (no symbol): inv charges tax total (PH, TH, etc.)
  const p3n=/(\d{7,12})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/g;
  while(hasSummaryLabel && (m=p3n.exec(text))!==null){
    const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
    if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
      res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
  }
  if(res.length)return res;
  // JP yen (integer): inv 楼 charges 楼 tax 楼 total
  const pJP=/(\d{7,12})\s+[楼锟\s*([\d,]+)\s+[楼锟\s*([\d,]+)\s+[楼锟\s*([\d,]+)/g;
  while(hasSummaryLabel && (m=pJP.exec(text))!==null){
    const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
    if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
      res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
  }
  if(res.length)return res;
  // KRW integer (no decimals): inv 鈧?charges 鈧?tax 鈧?total
  const pKR=/(\d{7,12})\s+鈧‐s*([\d,]+)\s+鈧‐s*([\d,]+)\s+鈧‐s*([\d,]+)/g;
  while(hasSummaryLabel && (m=pKR.exec(text))!==null){
    const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
    if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
      res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
  }
  // AU tranche-based: trancheID $charges $ tax $ total  (tranche IDs like 1216232138_AU_202512_M_48_006)
  if(!res.length){
    const auP=/(\d{7,12})\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)/g;
    while(hasSummaryLabel && (m=auP.exec(text))!==null){
      const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
      if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
        res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
    }
  }
  return res;
}

// 鈹€鈹€ Shared: header extraction 鈹€鈹€
function parseHeader(lines){
  const h={stmtNum:'',date:'',custName:'',custNum:'',period:''};
  for(const {text:ln} of lines){
    if(!h.stmtNum){const m=ln.match(/(?:Statement\s*Number|鏄庣窗鏇哥暘鍙?[:\s]*([A-Z0-9]+)/i);if(m)h.stmtNum=m[1]}
    if(!h.date){const m=ln.match(/(?:Date|鏄庣窗鏇告棩浠?[:\s]*([\d\/\-.]+)/i);if(m)h.date=m[1]}
    if(!h.custNum){const m=ln.match(/(?:Sold[\s-]*To|Customer\s*Number|銇婂妲樼暘鍙?[:\s]*([\d]+)/i);if(m)h.custNum=m[1]}
    if(!h.period){const m=ln.match(/(?:Billing\s*Period|Recurring\s*Charge\s*Period|璜嬫眰瀵捐薄鏈熼枔)[:\s]*(.+)/i);if(m)h.period=m[1].trim()}
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
  if(!h.custName)for(const{text:ln}of lines){const m=ln.match(/(?:Customer\s*Name|銇婂妲樺悕)[:\s]*(.+)/i);if(m){h.custName=m[1].trim();break}}
  return h;
}

// 鈹€鈹€ JP Parser 鈹€鈹€
function parseItemsJP(lines,fileName){
  const items=[];let curInv='',curTr='';
  const reFull=/(.+?)\s+([\d,]+)\s+[楼锟\s*([\d,]+)\s+[楼锟\s*([\d,]+)\s+(\d+)\s*%\s+[楼锟\s*([\d,]+)\s+[楼锟\s*([\d,]+)/;
  const reNums=/^\s*([\d,]+)\s+[楼锟\s*([\d,]+)\s+[楼锟\s*([\d,]+)\s+(\d+)\s*%\s+[楼锟\s*([\d,]+)\s+[楼锟\s*([\d,]+)/;
  const sectRe=/鐧鸿ID|璜嬫眰鏇哥暘鍙穦瑁藉搧ID|瑁藉搧鍚嶇О|灏忚▓|鍚堣▓/i;
  const curRe=/[楼锟\s*[\d,]+/;
  // General product ID pattern: WBD... or alphanumeric+underscore (e.g. 21RLS50S00_AAS, 78809709_AAS)
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  // Look-forward: collect continuation lines after product row (suffix of product name)
  function jpFwd(i,max){let s='';for(let j=i+1;j<=Math.min(i+max,lines.length-1);j++){const t=lines[j].text.trim();if(!t||pidRe.test(t)||sectRe.test(t)||curRe.test(t))break;s+=(s?' ':'')+t;}return s;}
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    const im=ln.match(/璜嬫眰鏇哥暘鍙穂:\s]*([\d]+)/);if(im){curInv=im[1];continue}
    const tm=ln.match(/鐧鸿ID\s+(\S+)/);if(tm){curTr=tm[1];continue}
    if(/灏忚▓|鍚堣▓/i.test(ln))continue;
    // Match product ID (WBD or general alphanumeric) + must have 楼 amounts on same line
    const wm=ln.match(pidRe);if(!wm||!/[楼锟\s*[\d,]+/.test(ln))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    // Try full match (product name on same line as WBD code)
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){
        // look-back 1 line for prefix (e.g. "Japan With Autopilot VAIO Pro")
        let prefix='';
        if(i>0){const prev=lines[i-1].text.trim();if(prev&&!pidRe.test(prev)&&!sectRe.test(prev)&&!curRe.test(prev))prefix=prev;}
        // look-forward 1 line for suffix (e.g. "/1TB/11P - Hitachi_Japanese")
        const suffix=jpFwd(i,1);
        const pname=[prefix,m[1].trim(),suffix].filter(Boolean).join(' ');
        items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
        continue;
      }
    }
    // Fallback: numbers-only 鈫?look back up to 2 lines + look-forward up to 2 lines
    m=reNums.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-2);j--){
        const prev=lines[j].text.trim();
        if(!prev)continue;
        if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev))break;
        if(!/^\s*[\d,\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      const suffix=jpFwd(i,2);
      if(suffix)pname=(pname?pname+' ':'')+suffix;
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

// 鈹€鈹€ US/CA Parser (5-col $: charges, tax, CRF, RDF, total 鈥?supports non-WBD product IDs) 鈹€鈹€
function parseItemsUS(lines,fileName){
  const items=[];let curInv='',curTr='';
  // General product ID: WBD... or alphanumeric+underscore
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i;
  // Full pattern: product name (must start with letter) + qty + $up + $ch + $tax + $crf + $tot
  const reFull=/([A-Za-z].+?)\s+([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)/;
  // Numbers-only pattern: when product name is on a different line
  const reNums=/^\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)/;
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    const im=ln.match(/Invoice\s*Number[:\s]*([\d]+)/i);if(im){curInv=im[1];continue}
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    // Match product ID (WBD or general alphanumeric) + must have $ amounts
    const wm=ln.match(pidRe);if(!wm||!/\$\s*[\d,]/.test(ln))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    // Try full match first (product name on same line)
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),tax=pN(m[5]),crf=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty,up,charges:ch,tax,total:tot,crfRdf:crf,srcFile:fileName,srcPage:page});continue;}
    }
    // Fallback: numbers-only 鈫?look back up to 3 lines + look-forward 1 line for suffix
    m=reNums.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();
        if(!prev)continue;
        if(sectRe.test(prev)||pidRe.test(prev))break;
        if(!/^\s*[\d,.$%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      if(i+1<lines.length){const nxt=lines[i+1].text.trim();if(nxt&&!pidRe.test(nxt)&&!sectRe.test(nxt)&&!/\$\s*[\d,]/.test(nxt))pname=(pname?pname+' ':'')+nxt;}
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),tax=pN(m[4]),crf=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,crfRdf:crf,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

// 鈹€鈹€ CH Parser (Switzerland 鈥?CHF, decimal qty, 8.10% VAT) 鈹€鈹€
function parseItemsCH(lines,fileName){
  const items=[];let curInv='',curTr='';
  // Full pattern: product name + qty + CHF up + CHF charges + rate% + CHF tax + CHF total
  const reFull=/(.+?)\s+([\d,]+\.?\d*)\s+CHF\s*([\d,]+\.?\d*)\s+CHF\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+CHF\s*([\d,]+\.?\d*)\s+CHF\s*([\d,]+\.?\d*)/;
  // Numbers-only: WBD line has no product name
  const reNums=/^\s*([\d,]+\.?\d*)\s+CHF\s*([\d,]+\.?\d*)\s+CHF\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+CHF\s*([\d,]+\.?\d*)\s+CHF\s*([\d,]+\.?\d*)/;
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    // Invoice Number: same line ("Invoice Number: 100426279") or next line (CH PDF style)
    const im=ln.match(/Invoice\s*Number[:\s]*(\d{7,12})/i);
    if(im){curInv=im[1];continue}
    if(/Invoice\s*Number/i.test(ln)&&!/\d{7,12}/.test(ln)){
      // CH: "Invoice Number  Invoice Date  Customer Number" 鈫?number on next line
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);if(pm)curInv=pm[1];}
      continue;
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(!/WBD[A-Z0-9]/i.test(ln)||/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    const wm=ln.match(/(WBD[A-Z0-9]+)/i);if(!wm)continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNums.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();
        if(!prev)continue;
        if(/Tranche\s*ID|Invoice\s*Number|Sub-Total|Grand[\s-]*Total|Product\s*ID/i.test(prev))break;
        if(/WBD[A-Z0-9]/i.test(prev))break;
        if(!/^\s*[\d,.CHF%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      // look-forward 1 line for suffix (e.g. "1151/Swiss")
      if(i+1<lines.length){const nxt=lines[i+1].text.trim();if(nxt&&!/WBD[A-Z0-9]/i.test(nxt)&&!/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i.test(nxt)&&!/CHF\s*[\d,]/.test(nxt))pname=(pname?pname+' ':'')+nxt;}
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

// 鈹€鈹€ EMEA Parser (AT/BE/DE/ES/FR/GB/GR/IE/IT/NL/PT/SE 鈥?EUR/GBP/SEK with non-WBD support) 鈹€鈹€
function parseItemsEMEA(lines,fileName){
  const items=[];let curInv='',curTr='';
  // General product ID: WBD... or alphanumeric+underscore (e.g. 21FBSDGX0L_AAS, 78722528_AAS)
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i;
  // Currency: EUR/GBP/SEK (prefix/suffix, handle mojibake euro)
  const curSymS='(?:\\u20ac|\\u00a3|\\u00e2\\u201a\\u00ac|\\u0432\\u201a\\u00ac|SEK|GBP|EUR|CHF)';
  const curRe=new RegExp('(?:'+curSymS+')\\s*[\\d,]+');
  // Full: pname qty CUR up CUR charges rate% CUR tax CUR total
  const reFull=new RegExp('(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)');
  // Numbers-only: qty CUR up CUR charges rate% CUR tax CUR total
  const curReS=new RegExp('[\\d,]+\\.?\\d*\\s*'+curSymS);
  const amtS='(?:'+curSymS+'\\s*)?([\\d,]+\\.?\\d*)\\s*(?:'+curSymS+')?';
  const reFullS=new RegExp('(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+amtS+'\\s+'+amtS+'\\s+([\\d.]+)\\s*%\\s+'+amtS+'\\s+'+amtS);
  const reNumsS=new RegExp('^\\s*([\\d,]+\\.?\\d*)\\s+'+amtS+'\\s+'+amtS+'\\s+([\\d.]+)\\s*%\\s+'+amtS+'\\s+'+amtS);
  const reNums=new RegExp('^\\s*([\\d,]+\\.?\\d*)\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSymS+'\\s*([\\d,]+\\.?\\d*)');
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    // Invoice Number (or "Rechnungsnummer" for DE)
    const im=ln.match(/(?:Invoice\s*Number|Rechnungsnummer|Num茅ro\s*de\s*facture|Numero\s*fattura|Factuurnummer|N煤mero\s*de\s*factura|螒蟻喂胃渭蠈蟼\s*蟿喂渭慰位慰纬委慰蠀)[:\s]*(\d{7,12})/i);
    if(im){curInv=im[1];continue}
    // Two-line invoice number
    if(/Invoice\s*Number|Rechnungsnummer/i.test(ln)&&!/\d{7,12}/.test(ln)){
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);if(pm)curInv=pm[1];}
      continue;
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    // Match product ID (WBD or general alphanumeric) + must have currency on same line
    const wm=ln.match(pidRe);if(!wm||!(curRe.test(ln)||curReS.test(ln)))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reFullS.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNums.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();
        if(!prev)continue;
        if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev))break;
        if(!/^\s*[\d,.鈧珿BPSEKk%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      if(i+1<lines.length){const nxt=lines[i+1].text.trim();if(nxt&&!pidRe.test(nxt)&&!sectRe.test(nxt)&&!curRe.test(nxt))pname=(pname?pname+' ':'')+nxt;}
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
    m=reNumsS.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();
        if(!prev)continue;
        if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev)||curReS.test(prev))break;
        if(!/^\s*[\d,.%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      if(i+1<lines.length){const nxt=lines[i+1].text.trim();if(nxt&&!pidRe.test(nxt)&&!sectRe.test(nxt)&&!curRe.test(nxt)&&!curReS.test(nxt))pname=(pname?pname+' ':'')+nxt;}
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

// 鈹€鈹€ KR Parser (South Korea 鈥?鈧?/ $ with Korean labels) 鈹€鈹€
function parseItemsKR(lines,fileName){
  const items=[];let curInv='',curTr='';
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const sectRe=/Tranche\s*ID|靻§灔\s*氩堩樃|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID|靻岅硠|頃╆硠/i;
  // KR can use 鈧?or $ as currency
  const curRe=/(?:鈧﹟\$)\s*[\d,]+/;
  // Full: pname qty CUR up CUR charges rate% CUR tax CUR total
  const reFull=/(.+?)\s+([\d,]+\.?\d*)\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)/;
  const reNums=/^\s*([\d,]+\.?\d*)\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)\s+(?:鈧﹟\$)\s*([\d,]+\.?\d*)/;
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    // Korean: 靻§灔 氩堩樃: 100462509 or Invoice Number: ...
    const im=ln.match(/(?:靻§灔\s*氩堩樃|Invoice\s*Number)[:\s]*(\d{7,12})/i);if(im){curInv=im[1];continue}
    if(/(?:靻§灔\s*氩堩樃|Invoice\s*Number)/i.test(ln)&&!/\d{7,12}/.test(ln)){
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);if(pm)curInv=pm[1];}
      continue;
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/靻岅硠|頃╆硠|sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    const wm=ln.match(pidRe);if(!wm||!curRe.test(ln))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNums.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();if(!prev)continue;
        if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev))break;
        if(!/^\s*[\d,鈧?%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

// 鈹€鈹€ IN Parser (India 鈥?INR with IGST/CGST/SGST, HSN/SAC codes) 鈹€鈹€
function parseItemsIN(lines,fileName){
  const items=[];let curInv='',curTr='';
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID|HSN|SAC/i;
  const curRe=/INR\s*[\d,]+/;
  // Full: pname qty INR up INR charges rate% INR tax INR total
  const reFull=/(.+?)\s+([\d,]+\.?\d*)\s+INR\s*([\d,]+\.?\d*)\s+INR\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+INR\s*([\d,]+\.?\d*)\s+INR\s*([\d,]+\.?\d*)/;
  const reNums=/^\s*([\d,]+\.?\d*)\s+INR\s*([\d,]+\.?\d*)\s+INR\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+INR\s*([\d,]+\.?\d*)\s+INR\s*([\d,]+\.?\d*)/;
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    const im=ln.match(/Invoice\s*Number[:\s]*(\d{7,12})/i);if(im){curInv=im[1];continue}
    if(/Invoice\s*Number/i.test(ln)&&!/\d{7,12}/.test(ln)){
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);if(pm)curInv=pm[1];}
      continue;
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    const wm=ln.match(pidRe);if(!wm||!curRe.test(ln))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNums.exec(after);
    if(m){
      let pname='';
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();if(!prev)continue;
        if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev))break;
        if(!/^\s*[\d,INR%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

// 鈹€鈹€ Generic Parser (AU/HK/TH/NZ/MY/PH/CA/SG + fallback) 鈹€鈹€
function parseItemsGen(lines,fileName,knownInvs,country){
  const items=[];let curInv='',curTr='';
  // TH PDFs contain 3 identical copies (ORIGINAL/CUSTOMER/BILLING COPY) 鈥?only parse ORIGINAL COPY pages
  const skipPages=new Set();
  if(country==='TH')for(const{text:ln,page}of lines){if(/CUSTOMER\s+COPY|BILLING\s+COPY/i.test(ln))skipPages.add(page);}
  // General product ID: WBD... or alphanumeric+underscore
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i;
  // Currency patterns 鈥?support $, RM, or no symbol
  const curSym='(?:\\$|RM)';
  // With $ or RM: pname qty CUR up CUR charges rate% CUR tax CUR total
  const reA=new RegExp('(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)');
  // No-name with $: qty $up $charges rate% $tax $total
  const reNN=new RegExp('^\\s*([\\d,]+\\.\\d{2})\\s*'+curSym+'\\s*([\\d,]+\\.\\d{2})\\s*'+curSym+'\\s*([\\d,]+\\.\\d{2})\\s*([\\d.]+)\\s*%\\s*'+curSym+'\\s*([\\d,]+\\.\\d{2})\\s*'+curSym+'\\s*([\\d,]+\\.\\d{2})');
  // No currency symbol (PH/TH): pname qty up charges rate% tax total OR pname qty up charges total (no tax)
  const reNoSym=/(.+?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/;
  // MY/PH no-tax: pname qty RM up RM charges RM total (3 amounts no tax)
  const reNoTax=new RegExp('(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)');
  // PH plain no-tax: pname qty up charges total (4 numbers, no symbol, no tax column)
  const rePhNoTax=/(.+?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s*$/;
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    if(skipPages.has(page))continue;
    // Invoice number detection
    const im=ln.match(/(?:Tax\s+)?Invoice\s*(?:Number|No\.?|鐣彿)\s*:?\s*([\d]{7,12})\b/i);
    if(im){curInv=im[1];continue}
    if(/Invoice\s*(?:Number|No\.?)/i.test(ln)&&!/[\d]{7,12}/.test(ln)){
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([\d]{7,12})\b/);if(pm)curInv=pm[1];}
      continue;
    }
    // Fallback for CID fonts
    if(knownInvs&&knownInvs.size){
      const collapsed=ln.replace(/\s/g,'');
      for(const[,run]of collapsed.matchAll(/(\d{7,12})/g)){
        if(knownInvs.has(run)){curInv=run;break;}
      }
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    // Match product ID (WBD or general alphanumeric)
    const wm=ln.match(pidRe);if(!wm)continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    // Need at least some digits after PID
    if(!/\d/.test(after))continue;
    // Try $ / RM currency pattern
    let m=reA.exec(after);
    if(m&&pN(m[7])>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:pN(m[6]),total:pN(m[7]),taxRate:pN(m[5]),crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    // No-name with $ (AU/HK pattern)
    m=reNN.exec(after);
    if(m&&pN(m[6])>0){items.push({inv:curInv,tranche:curTr,pid,pname:'',qty:pN(m[1]),up:pN(m[2]),charges:pN(m[3]),tax:pN(m[5]),total:pN(m[6]),taxRate:pN(m[4]),crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    // No-tax with RM/$ (MY pattern): qty CUR up CUR charges CUR total
    m=reNoTax.exec(after);
    if(m&&pN(m[5])>0&&!/%/.test(after)){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:0,total:pN(m[5]),taxRate:0,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    // No-symbol with rate% (TH pattern)
    m=reNoSym.exec(after);
    if(m&&pN(m[7])>0){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:pN(m[6]),total:pN(m[7]),taxRate:pN(m[5]),crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    // PH plain no-tax (4 numbers only): qty up charges total
    m=rePhNoTax.exec(after);
    if(m&&pN(m[5])>0&&Math.abs(pN(m[4])-pN(m[5]))<1){items.push({inv:curInv,tranche:curTr,pid,pname:m[1].trim(),qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:0,total:pN(m[5]),taxRate:0,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
  }
  return items;
}

// 鈹€鈹€ Router 鈹€鈹€
function parseItems(country,lines,fileName,knownInvs){
  if(country==='JP')return parseItemsJP(lines,fileName);
  if(country==='US')return parseItemsUS(lines,fileName);
  if(country==='CA')return parseItemsUS(lines,fileName); // CA uses same 5-col $ format as US
  if(country==='CH')return parseItemsCH(lines,fileName);
  if(country==='KR')return parseItemsKR(lines,fileName);
  if(country==='IN')return parseItemsIN(lines,fileName);
  // EMEA: EUR/GBP/SEK countries
  const emeaCC=new Set(['AT','BE','DE','ES','FR','GB','GR','IE','IT','NL','PT','SE']);
  if(emeaCC.has(country))return parseItemsEMEA(lines,fileName);
  return parseItemsGen(lines,fileName,knownInvs,country);
}

// 鈹€鈹€ Full statement parse 鈹€鈹€
function parseStatement(lines,fileName){
  const fullText=lines.map(l=>l.text).join('\n');
  const country=detectCountry(fullText,fileName);
  const cur=(CM[country]||CM.OTHER).cur;
  const hd=parseHeader(lines);
  let bs=parseBillingSummary(fullText);
  let bsDerived=false;
  const knownInvs=new Set(bs.map(r=>r.inv).filter(Boolean));
  const li=parseItems(country,lines,fileName,knownInvs);  // Detail totals per invoice
  const dt={};
  for(const r of li){const k=r.inv||'?';if(!dt[k])dt[k]={charges:0,tax:0,total:0,crfRdf:0,count:0,nonWbd:0};dt[k].charges+=r.charges;dt[k].tax+=r.tax;dt[k].total+=r.total;dt[k].crfRdf+=(r.crfRdf||0);dt[k].count++;if(!/^WBD/i.test(r.pid))dt[k].nonWbd++}
    // If billing summary missing, derive from detail totals
  if(!bs.length&&Object.keys(dt).length){
    bsDerived=true;
    bs=Object.entries(dt).map(([inv,v])=>({inv,charges:v.charges,tax:v.tax,total:v.total,crf:0,rdf:0}));
  }
  const dGT={charges:Object.values(dt).reduce((s,v)=>s+v.charges,0),tax:Object.values(dt).reduce((s,v)=>s+v.tax,0),total:Object.values(dt).reduce((s,v)=>s+v.total,0),crfRdf:Object.values(dt).reduce((s,v)=>s+(v.crfRdf||0),0)};
  const sT=bs.reduce((a,r)=>{a.charges+=r.charges||0;a.tax+=r.tax||0;a.total+=r.total||0;a.crfRdf+=(r.crf||0)+(r.rdf||0);return a;},{charges:0,tax:0,total:0,crfRdf:0});
  // Comparison + unmapped
  const comp=[],unmS=[],unmD=[];
  const sSet=new Set(bs.map(r=>r.inv)),dSet=new Set(Object.keys(dt));
  for(const sr of bs){
    const d=dt[sr.inv];
    if(d){const cd=Math.abs(sr.charges-d.charges),txd=Math.abs(sr.tax-d.tax);
      // SUM reference total = billing summary charges+tax + CRF/RDF from DET items
      // (billing summary Total column may exclude CRF/RDF that appears on individual invoice pages)
      const srTotAdj=sr.charges+sr.tax+(d.crfRdf||0);
      const td=Math.abs(srTotAdj-d.total);
      comp.push({inv:sr.inv,sC:sr.charges,sT:sr.tax,sTot:srTotAdj,dC:d.charges,dT:d.tax,dTot:d.total,dC_:cd,dT_:txd,dTot_:td,mC:cd<1,mT:txd<1,mTot:td<1,m:cd<1&&txd<1&&td<1,n:d.count,nw:d.nonWbd||0,st:'matched'});
    }else{unmS.push(sr.inv);comp.push({inv:sr.inv,sC:sr.charges,sT:sr.tax,sTot:sr.total,dC:0,dT:0,dTot:0,dC_:sr.charges,dT_:sr.tax,dTot_:sr.total,mC:false,mT:false,mTot:false,m:false,n:0,nw:0,st:'summary_only'})}
  }
  for(const inv of dSet){if(!sSet.has(inv)){const d=dt[inv];unmD.push(inv);comp.push({inv,sC:0,sT:0,sTot:0,dC:d.charges,dT:d.tax,dTot:d.total,dC_:d.charges,dT_:d.tax,dTot_:d.total,mC:false,mT:false,mTot:false,m:false,n:d.count,nw:d.nonWbd||0,st:'detail_only'})}}
  // Validation
  const vr=[];const noD=li.length===0;
  if(bsDerived){
    const invs=Object.keys(dt);
    vr.push({nm:`Billing Summary missing (${invs.length} invoice${invs.length>1?'s':''})`,p:false,sv:'f',dt:invs.join(', ')});
  }
  const cd=Math.abs(sT.charges-dGT.charges),txd=Math.abs(sT.tax-dGT.tax);
  // Grand Total reference = sum of (charges+tax) from billing summary + all CRF/RDF from DET items
  const sTotAdj=sT.charges+sT.tax+dGT.crfRdf;
  const td=Math.abs(sTotAdj-dGT.total);
  vr.push({nm:'Grand Total 鈥?Charges',p:cd<1,sv:cd<1?'p':(noD?'w':'f'),dt:`Sum: ${fc(sT.charges,cur)} | Det: ${fc(dGT.charges,cur)} | 螖 ${fc(cd,cur)}`});
  vr.push({nm:'Grand Total 鈥?Tax',p:txd<1,sv:txd<1?'p':(noD?'w':'f'),dt:`Sum: ${fc(sT.tax,cur)} | Det: ${fc(dGT.tax,cur)} | 螖 ${fc(txd,cur)}`});
  vr.push({nm:'Grand Total 鈥?Total',p:td<1,sv:td<1?'p':(noD?'w':'f'),dt:`Sum: ${fc(sTotAdj,cur)} | Det: ${fc(dGT.total,cur)} | 螖 ${fc(td,cur)}`});
  if(unmS.length)vr.push({nm:`Detail pages missing (${unmS.length} invoice${unmS.length>1?'s':''})`,p:false,sv:'f',dt:unmS.join(', ')});
  if(unmD.length)vr.push({nm:`${unmD.length} inv in Detail only`,p:false,sv:'f',dt:unmD.join(', ')});
  for(const r of bs){const c=r.charges+r.tax+(r.crf||0)+(r.rdf||0),d=Math.abs(c-r.total);
    vr.push({nm:`Inv ${r.inv}: arithmetic`,p:d<1,sv:d<1?'p':'f',dt:`${fc(r.charges,cur)}+${fc(r.tax,cur)}=${fc(c,cur)} vs ${fc(r.total,cur)} 螖${fc(d,cur)}`})}
  for(const c of comp.filter(x=>x.st==='matched'&&!x.m))
    vr.push({nm:`Inv ${c.inv}: mismatch`,p:false,sv:'f',dt:`螖Chg=${fc(c.dC_,cur)} 螖Tax=${fc(c.dT_,cur)} 螖Tot=${fc(c.dTot_,cur)}`});
  vr.push({nm:'Line Items',p:li.length>0,sv:li.length>0?'p':'w',dt:li.length?`${li.length} WBD, ${new Set(li.map(l=>l.tranche)).size} tranches`:t('no_items')});
  const nwAll=li.filter(l=>!/^WBD/i.test(l.pid));
  if(nwAll.length){const byInv={};for(const l of nwAll){if(!byInv[l.inv])byInv[l.inv]=[];byInv[l.inv].push(l.pid)}
    const det=Object.entries(byInv).map(([inv,pids])=>`${inv}: ${pids.join(', ')}`).join(' | ');
    vr.push({nm:`${nwAll.length} non-WBD product(s)`,p:false,sv:'w',dt:det})}

  return{fileName,country,cur,hd,bs,li,sT,dt,dGT,comp,unmS,unmD,vr};
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// FILE MANAGEMENT
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
const dzEl=document.getElementById('dz'),fInEl=document.getElementById('fIn');
dzEl.addEventListener('click',()=>fInEl.click());
dzEl.addEventListener('dragover',e=>{e.preventDefault();dzEl.classList.add('dg')});
dzEl.addEventListener('dragleave',()=>dzEl.classList.remove('dg'));
dzEl.addEventListener('drop',e=>{e.preventDefault();dzEl.classList.remove('dg');addFiles(e.dataTransfer.files)});
fInEl.addEventListener('change',e=>{addFiles(e.target.files);e.target.value=''});

async function addFiles(fl){
  for(const file of fl){
    if(!file.name.toLowerCase().endsWith('.pdf'))continue;
    const id=++eid,entry={id,file,name:file.name,size:file.size,country:null,status:'detecting',lines:null};
    fileEntries.push(entry);renderFL();
    try{const lines=await pdfToLines(file);entry.lines=lines;entry.country=detectCountry(lines.slice(0,30).map(l=>l.text).join('\n'),file.name);entry.status='ready'}
    catch(e){entry.status='error';console.error(file.name,e)}
    renderFL();updRun();
  }
}
function remFile(id){fileEntries=fileEntries.filter(e=>e.id!==id);renderFL();updRun()}
function renderFL(){
  const el=document.getElementById('fList');
  el.innerHTML=fileEntries.map(e=>{
    const cm=e.country?CM[e.country]||CM.OTHER:null;
    let b=e.status==='detecting'?`<span class="lb det">${t('detecting')}</span>`:
      e.status==='error'?'<span class="lb err">Error</span>':
      `<span class="lb ok">${cm.flag} ${e.country} 鉁?/span>`;
    return`<div class="fi"><span>馃搫</span><span class="fn" title="${esc(e.name)}">${esc(e.name)}</span><span class="fs">${fmtSz(e.size)}</span>${b}<button class="rb" onclick="remFile(${e.id})">脳</button></div>`;
  }).join('');
  document.getElementById('aBar').style.display=fileEntries.length?'flex':'none';
}
function updRun(){const r=fileEntries.filter(e=>e.status==='ready').length;const b=document.getElementById('runBtn');b.disabled=r===0;b.textContent=r?`鈻?${t('run_btn').replace('鈻?','')} (${r})`:'鈻?'+t('run_btn').replace('鈻?','')}
function clearAll(){fileEntries=[];analysisResults=null;renderFL();updRun();document.getElementById('gSum').style.display='none';document.getElementById('results').innerHTML='';document.getElementById('exBtn').style.display='none'}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// RUN
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
function setProg(p,m){document.getElementById('pw').style.display='block';document.getElementById('pbar').style.width=p+'%';document.getElementById('plab').textContent=m}

async function runAll(){
  document.getElementById('runBtn').disabled=true;document.getElementById('results').innerHTML='';
  document.getElementById('gSum').style.display='none';document.getElementById('exBtn').style.display='none';
  analysisResults={};
  const ready=fileEntries.filter(e=>e.status==='ready'),tot=ready.length;let done=0;
  setProg(2,t('starting'));
  for(const entry of ready){
    setProg(Math.round(done/tot*90)+5,`${t('parsing')} ${entry.name}`);
    try{const lines=entry.lines||await pdfToLines(entry.file);const st=parseStatement(lines,entry.name);
      const k=st.country;if(!analysisResults[k])analysisResults[k]={country:k,meta:CM[k]||CM.OTHER,stmts:[]};
      analysisResults[k].stmts.push(st)}
    catch(e){console.error(entry.name,e)}
    done++;
  }
  setProg(95,t('rendering'));renderResults();
  setProg(100,`${t('done')} 鈥?${tot} file(s)`);
  document.getElementById('runBtn').disabled=false;document.getElementById('exBtn').style.display='inline-flex';
  setTimeout(()=>{document.getElementById('pw').style.display='none'},2000);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// HIERARCHY TREE
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
function buildTree(){
  const tree={};
  for(const[code,g]of Object.entries(analysisResults)){
    if(!tree[code])tree[code]={meta:g.meta,st:{items:0,ch:0,tx:0,tot:0,err:0},ch:{}};
    for(const s of g.stmts)for(const li of s.li){
      const cust=s.hd.custName||s.hd.custNum||'鈥?;
      const per=s.hd.period||'鈥?;
      const tr=li.tranche||'鈥?;
      const cn=tree[code];
      if(!cn.ch[cust])cn.ch[cust]={st:{items:0,ch:0,tx:0,tot:0,err:0},ch:{}};
      const sn=cn.ch[cust];
      if(!sn.ch[per])sn.ch[per]={st:{items:0,ch:0,tx:0,tot:0,err:0},ch:{}};
      const pn=sn.ch[per];
      if(!pn.ch[tr])pn.ch[tr]={st:{items:0,ch:0,tx:0,tot:0,err:0},items:[]};
      const tn=pn.ch[tr];
      tn.items.push(li);
      [tn.st,pn.st,sn.st,cn.st].forEach(x=>{x.items++;x.ch+=li.charges;x.tx+=li.tax;x.tot+=li.total});
    }
  }
  return tree;
}

function renderHierarchy(){
  const tree=buildTree();let uid=0;const rows=[];
  const hf=(v,c)=>c==='JPY'?'楼'+Math.round(v).toLocaleString():'$'+v.toFixed(2);
  for(const[code,cn]of Object.entries(tree)){
    const c=(CM[code]||CM.OTHER).cur,cid='h'+(++uid);
    rows.push(hRow(cid,'',0,`${cn.meta.flag} ${cn.meta.label} (${code})`,cn.st,c,true));
    for(const[cust,sn]of Object.entries(cn.ch)){
      const sid='h'+(++uid);rows.push(hRow(sid,cid,1,cust,sn.st,c,true));
      for(const[per,pn]of Object.entries(sn.ch)){
        const pid='h'+(++uid);rows.push(hRow(pid,sid,2,per,pn.st,c,false));
        for(const[tr,tn]of Object.entries(pn.ch)){
          const tid='h'+(++uid);rows.push(hRow(tid,pid,3,tr,tn.st,c,false));
          for(const li of tn.items){
            const src=li.srcFile?`<span class="src" title="${esc(li.srcFile)}">${esc(li.srcFile)} p.${li.srcPage}</span>`:'';
            rows.push(`<tr class="hl4" data-p="${tid}" style="display:none"><td>${esc(li.pid)} ${esc(li.pname)}${src}</td><td class="tr">${li.qty}</td><td class="tr">${hf(li.charges,c)}</td><td class="tr">${hf(li.tax,c)}</td><td class="tr">${hf(li.total,c)}</td><td></td></tr>`);
          }
        }
      }
    }
  }
  return`<div class="tb"><div>${t('hierarchy')}: Country 鈫?Customer 鈫?Period 鈫?Tranche</div><button class="btn btn-s" onclick="doExport()">${t('export_btn')}</button></div>
    <div class="hw"><table class="ht"><thead><tr><th>${t('hierarchy')}</th><th class="tr">${t('items')}</th><th class="tr">${t('charges')}</th><th class="tr">${t('tax')}</th><th class="tr">${t('total')}</th><th class="tr">${t('issues')}</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function hRow(id,pid,lv,label,st,c,open){
  const hf=(v)=>c==='JPY'?'楼'+Math.round(v).toLocaleString():'$'+v.toFixed(2);
  const tog=lv<3?`<button class="htg" onclick="togH('${id}')">${open?'鈻?:'鈻?}</button>`:'<span style="display:inline-block;width:20px"></span>';
  const labels=['','Customer: ','Period: ','Tranche: '];
  const ds=(pid&&!open)?' style="display:none"':'';
  return`<tr class="hl${lv}" data-hid="${id}" data-p="${pid}" data-e="${open?1:0}"${ds}>
    <td>${tog}<span style="font-size:10px;color:var(--text-muted)">${labels[lv]}</span><strong>${esc(label)}</strong></td>
    <td class="tr">${st.items}</td><td class="tr">${hf(st.ch)}</td><td class="tr">${hf(st.tx)}</td><td class="tr">${hf(st.tot)}</td><td></td></tr>`;
}

function togH(id){
  const row=document.querySelector(`tr[data-hid="${id}"]`);if(!row)return;
  const open=row.dataset.e==='1';row.dataset.e=open?'0':'1';
  const btn=row.querySelector('.htg');if(btn)btn.textContent=open?'鈻?:'鈻?;
  if(open)hideDesc(id);else document.querySelectorAll(`tr[data-p="${id}"]`).forEach(c=>{c.style.display=''});
}
function hideDesc(id){document.querySelectorAll(`tr[data-p="${id}"]`).forEach(c=>{c.style.display='none';if(c.dataset.hid)hideDesc(c.dataset.hid)})}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// RENDER
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
function renderResults(){
  if(!analysisResults)return;
  const codes=Object.keys(analysisResults).sort();
  // Group cards
  document.getElementById('gCards').innerHTML=codes.map((code,i)=>{
    const g=analysisResults[code],m=g.meta;
    const invs=g.stmts.reduce((s,st)=>s+st.bs.length,0);
    const items=g.stmts.reduce((s,st)=>s+st.li.length,0);
    const fails=g.stmts.reduce((s,st)=>s+st.vr.filter(v=>v.sv==='f').length,0);
    const unm=g.stmts.reduce((s,st)=>s+st.unmS.length+st.unmD.length,0);
    return`<div class="gc${i===0?' a':''}" id="gc-${code}" onclick="swC('${code}')">
      <div class="gc-f">${m.flag}</div><div class="gc-n">${m.label} (${code})</div>
      <div class="gc-r"><span>${t('stmts')}</span><span class="gc-v">${g.stmts.length}</span></div>
      <div class="gc-r"><span>${t('invoices')}</span><span class="gc-v">${invs}</span></div>
      <div class="gc-r"><span>${t('items')}</span><span class="gc-v">${items}</span></div>
      <div class="gc-r"><span>${t('unmapped')}</span><span class="gc-v ${unm?'er':'ok'}">${unm}</span></div>
      <div class="gc-r"><span>${t('issues')}</span><span class="gc-v ${fails?'er':'ok'}">${fails}</span></div></div>`;
  }).join('');
  document.getElementById('gSum').style.display='block';

  // Tabs: Hierarchy + per-country
  let h='<div class="tabs"><button class="tab a" id="tab-hier" onclick="swTab(\'hier\')">'+'馃尦 '+t('hierarchy')+'</button>';
  codes.forEach(code=>{h+=`<button class="tab" id="tab-${code}" onclick="swTab('${code}');swC('${code}')">${analysisResults[code].meta.flag} ${code}</button>`});
  h+='</div>';
  h+=`<div class="tp a" id="tp-hier">${renderHierarchy()}</div>`;
  codes.forEach(code=>{h+=`<div class="tp" id="tp-${code}">${renderCountry(code)}</div>`});
  document.getElementById('results').innerHTML=h;
}

function swC(code){document.querySelectorAll('.gc').forEach(c=>c.classList.remove('a'));document.getElementById('gc-'+code)?.classList.add('a')}
function swTab(id){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('a'));document.getElementById('tab-'+id)?.classList.add('a');
  document.querySelectorAll('.tp').forEach(p=>p.classList.remove('a'));document.getElementById('tp-'+id)?.classList.add('a')}

function renderCountry(code){
  const stmts=analysisResults[code].stmts;
  const byCust={};for(const s of stmts){const k=s.hd.custName||s.hd.custNum||'Unknown';if(!byCust[k])byCust[k]=[];byCust[k].push(s)}
  const custs=Object.keys(byCust),sid=`sc-${code}`;
  let h=`<div class="stabs">${custs.map((c,i)=>{const sh=c.length>28?c.substring(0,26)+'鈥?:c;
    return`<button class="st${i===0?' a':''}" id="${sid}-${i}" onclick="swSub('${code}',${i},${custs.length})" title="${esc(c)}">${esc(sh)} (${byCust[c].length})</button>`}).join('')}</div>`;
  custs.forEach((c,i)=>{h+=`<div class="sp${i===0?' a':''}" id="${sid}-p-${i}">${renderCustStmts(byCust[c],code)}</div>`});
  return h;
}

function swSub(code,i,n){for(let j=0;j<n;j++){document.getElementById(`sc-${code}-${j}`)?.classList.toggle('a',j===i);document.getElementById(`sc-${code}-p-${j}`)?.classList.toggle('a',j===i)}}

function renderCustStmts(stmts){
  let h='';
  for(const s of stmts){
    const C=s.cur,fails=s.vr.filter(v=>v.sv==='f').length,hasUnm=s.unmS.length+s.unmD.length;
    const sid=('d_'+s.hd.stmtNum).replace(/\W/g,'');

    h+=`<div class="tb"><div>
      <strong>${esc(s.hd.stmtNum)}</strong> 路 ${esc(s.hd.custName)} 路 ${s.hd.date} 路 ${esc(s.hd.period)} 路
      ${s.bs.length} ${t('invoices')} 路 ${s.li.length} ${t('items')} 路
      ${fails?`<span class="tre">${fails} ${t('issues')}</span>`:`<span class="tg">${t('ok')}</span>`}
      ${hasUnm?` 路 <span class="to">${hasUnm} ${t('unmapped')}</span>`:''}
    </div></div>`;

    // Comparison table
    h+=`<div class="tw"><table><thead><tr>
      <th>${t('invoice')}</th><th>${t('status')}</th>
      <th class="tr">Sum ${t('charges')}</th><th class="tr">Det ${t('charges')}</th><th class="tr">螖</th>
      <th class="tr">Sum ${t('tax')}</th><th class="tr">Det ${t('tax')}</th><th class="tr">螖</th>
      <th class="tr">Sum ${t('total')}</th><th class="tr">Det ${t('total')}</th><th class="tr">螖</th>
      <th class="tr">#</th><th>${t('match')}</th></tr></thead><tbody>`;
    for(const c of s.comp){
      const cls=c.st!=='matched'?'ro':(!c.m?'re':'');
      const lbl=c.st==='matched'?`<span class="tg">${t('matched')}</span>`:c.st==='summary_only'?`<span class="to">${t('sum_only')}</span>`:`<span class="to">${t('det_only')}</span>`;
      const fD=(v,ok)=>c.st!=='matched'?`<span class="to">${fc(v,C)}</span>`:`<span class="${ok?'tg':'tre'}">${fc(v,C)}</span>`;
      h+=`<tr class="${cls}"><td class="mono">${c.inv}</td><td>${lbl}</td>`;
      h+=`<td class="mono tr">${c.sC?fc(c.sC,C):'鈥?}</td><td class="mono tr">${c.dC||c.n?fc(c.dC,C):'鈥?}</td><td class="mono tr">${fD(c.dC_,c.mC)}</td>`;
      h+=`<td class="mono tr">${c.sT||c.st==='matched'?fc(c.sT,C):'鈥?}</td><td class="mono tr">${c.dT||c.n?fc(c.dT,C):'鈥?}</td><td class="mono tr">${fD(c.dT_,c.mT)}</td>`;
      h+=`<td class="mono tr">${c.sTot?fc(c.sTot,C):'鈥?}</td><td class="mono tr">${c.dTot||c.n?fc(c.dTot,C):'鈥?}</td><td class="mono tr">${fD(c.dTot_,c.mTot)}</td>`;
      h+=`<td class="mono tr">${c.n}${c.nw?` <span class="to" title="${c.nw} non-WBD">(${c.nw}鈿?</span>`:''}</td><td>${c.m?'<span class="tg">鉁?/span>':'<span class="tre">鉁?/span>'}</td></tr>`;
    }
    // Grand total
    const gc=Math.abs(s.sT.charges-s.dGT.charges),gt=Math.abs(s.sT.tax-s.dGT.tax);
    const sTotAdj=s.sT.charges+s.sT.tax+(s.dGT.crfRdf||0);
    const gtt=Math.abs(sTotAdj-s.dGT.total);
    h+=`<tr class="rs"><td>${t('grand_total')}</td><td></td>`;
    h+=`<td class="mono tr">${fc(s.sT.charges,C)}</td><td class="mono tr">${fc(s.dGT.charges,C)}</td><td class="mono tr ${gc>.99?'tre':'tg'}">${fc(gc,C)}</td>`;
    h+=`<td class="mono tr">${fc(s.sT.tax,C)}</td><td class="mono tr">${fc(s.dGT.tax,C)}</td><td class="mono tr ${gt>.99?'tre':'tg'}">${fc(gt,C)}</td>`;
    h+=`<td class="mono tr">${fc(sTotAdj,C)}</td><td class="mono tr">${fc(s.dGT.total,C)}</td><td class="mono tr ${gtt>.99?'tre':'tg'}">${fc(gtt,C)}</td>`;
    h+=`<td class="mono tr">${s.li.length}</td><td></td></tr></tbody></table></div>`;

    // Unmapped alerts
    if(s.unmS.length)h+=`<div class="ib w">鈿?<div><strong>${s.unmS.length} ${t('sum_only')}:</strong> <span class="mono">${s.unmS.join(', ')}</span></div></div>`;
    if(s.unmD.length)h+=`<div class="ib w">鈿?<div><strong>${s.unmD.length} ${t('det_only')}:</strong> <span class="mono">${s.unmD.join(', ')}</span></div></div>`;

    // Collapsible: Billing Summary
    const hasFee=s.bs.some(r=>r.crf||r.rdf);
    h+=`<details style="margin:0 12px"><summary style="cursor:pointer;font-size:12px;font-weight:600;padding:10px 0;color:var(--text-dim)">馃搵 ${t('billing_sum')} (${s.bs.length})</summary>
      <div style="border:1px solid var(--border);border-radius:8px;margin-bottom:10px;overflow:auto;max-height:380px"><table>
      <thead><tr><th>${t('invoice')}</th><th class="tr">${t('charges')}</th><th class="tr">${t('tax')}</th>${hasFee?'<th class="tr">CRF</th><th class="tr">RDF</th>':''}<th class="tr">${t('total')}</th><th>鉁?/th></tr></thead><tbody>`;
    for(const r of s.bs){const calc=r.charges+r.tax+(r.crf||0)+(r.rdf||0),d=Math.abs(calc-r.total),ok=d<1;
      h+=`<tr class="${ok?'':'re'}"><td class="mono">${r.inv}</td><td class="mono tr">${fc(r.charges,C)}</td><td class="mono tr">${fc(r.tax,C)}</td>`;
      if(hasFee)h+=`<td class="mono tr">${fc(r.crf||0,C)}</td><td class="mono tr">${fc(r.rdf||0,C)}</td>`;
      h+=`<td class="mono tr">${fc(r.total,C)}</td><td>${ok?'<span class="tg">鉁?/span>':'<span class="tre">鉁?/span>'}</td></tr>`}
    h+=`</tbody></table></div></details>`;

    // Collapsible: Detail
    h+=`<details style="margin:0 12px"><summary style="cursor:pointer;font-size:12px;font-weight:600;padding:10px 0;color:var(--text-dim)">馃摝 ${t('detail_items')} (${s.li.length})</summary>`;
    const invNums=[...new Set(s.li.map(l=>l.inv))];
    h+=`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${invNums.map((n,i)=>`<button class="btn btn-s${i===0?' a':''}" onclick="fD('${sid}','${n}',this)">${n}</button>`).join('')}<button class="btn btn-s" onclick="fD('${sid}','ALL',this)">All</button></div>`;
    const hasCrf=s.li.some(l=>l.crfRdf);
    h+=`<div style="max-height:360px;border:1px solid var(--border);border-radius:8px;margin-bottom:10px;overflow:auto" id="${sid}"><table>
      <thead><tr><th>${t('invoice')}</th><th>${t('tranche')}</th><th>${t('product')}</th><th>${t('name')}</th><th class="tr">${t('qty')}</th><th class="tr">${t('unit_price')}</th><th class="tr">${t('charges')}</th><th class="tr">${t('tax')}</th>${hasCrf?'<th class="tr">CRF/RDF</th>':''}<th class="tr">${t('total')}</th><th>${t('file')}</th><th>${t('page')}</th></tr></thead><tbody>`;
    for(const li of s.li){
      const isNonWbd=!/^WBD/i.test(li.pid);
      h+=`<tr data-inv="${li.inv}"${isNonWbd?' class="re" title="Non-WBD product ID"':''}><td class="mono">${li.inv}</td><td class="mono" style="font-size:10px;max-width:180px;overflow:hidden;text-overflow:ellipsis" title="${esc(li.tranche)}">${li.tranche}</td><td class="mono"${isNonWbd?' style="color:var(--accent);font-weight:700"':''}>${li.pid}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${esc(li.pname)}">${esc(li.pname)}</td><td class="mono tr">${li.qty}</td><td class="mono tr">${fc(li.up,C)}</td><td class="mono tr">${fc(li.charges,C)}</td><td class="mono tr">${fc(li.tax,C)}</td>${hasCrf?'<td class="mono tr">'+fc(li.crfRdf||0,C)+'</td>':''}<td class="mono tr">${fc(li.total,C)}</td><td class="td" style="font-size:10px;max-width:120px;overflow:hidden;text-overflow:ellipsis" title="${esc(li.srcFile)}">${esc(li.srcFile)}</td><td class="mono td">${li.srcPage}</td></tr>`;
    }
    h+='</tbody></table></div></details>';

    // Collapsible: Validation
    h+=`<details style="margin:0 12px"${fails?' open':''}><summary style="cursor:pointer;font-size:12px;font-weight:600;padding:10px 0;color:var(--text-dim)">鉁?${t('validation')} (${s.vr.length} ${t('checks')}, ${fails} ${t('issues')})</summary><div style="padding-bottom:14px">`;
    for(const v of s.vr){
      const icon=v.sv==='p'?'鉁?:v.sv==='f'?'鉁?:'鈿?;
      const cc=v.sv==='p'?'p':v.sv==='f'?'f':'w';
      h+=`<div class="vi"><span class="vc ${cc}">${icon}</span><div><div style="font-size:12px;font-weight:600">${esc(v.nm)}</div><div style="font-size:10px;color:var(--text-dim)">${esc(v.dt)}</div></div></div>`;
    }
    h+='</div></details><div style="height:20px"></div>';
  }
  return h;
}

function fD(sid,inv,btn){const w=document.getElementById(sid);if(!w)return;btn.parentElement.querySelectorAll('.btn').forEach(b=>b.classList.remove('a'));btn.classList.add('a');
  w.querySelectorAll('tbody tr').forEach(r=>r.style.display=(inv==='ALL'||r.dataset.inv===inv)?'':'none')}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
// EXCEL EXPORT
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
function doExport(){
  if(!analysisResults)return;
  const wb=XLSX.utils.book_new(),all=Object.values(analysisResults).flatMap(g=>g.stmts);
  const s1=[[t('file'),'Country','Currency','Statement','Customer','Date',t('invoice'),t('status'),'Sum '+t('charges'),'Det '+t('charges'),'螖 '+t('charges'),t('charges')+' '+t('match'),'Sum '+t('tax'),'Det '+t('tax'),'螖 '+t('tax'),t('tax')+' '+t('match'),'Sum '+t('total'),'Det '+t('total'),'螖 '+t('total'),t('total')+' '+t('match'),'All '+t('match'),'#']];
  for(const s of all)for(const c of s.comp)s1.push([s.fileName,s.country,s.cur,s.hd.stmtNum,s.hd.custName,s.hd.date,c.inv,c.st,c.sC,c.dC,c.dC_,c.mC?'YES':'NO',c.sT,c.dT,c.dT_,c.mT?'YES':'NO',c.sTot,c.dTot,c.dTot_,c.mTot?'YES':'NO',c.m?'YES':'NO',c.n]);
  addSh(wb,s1,'Comparison');
  const s2=[[t('file'),'Country','Statement','Customer',t('invoice'),'Direction',t('charges'),t('tax'),t('total')]];
  for(const s of all){for(const inv of s.unmS){const r=s.bs.find(x=>x.inv===inv);s2.push([s.fileName,s.country,s.hd.stmtNum,s.hd.custName,inv,'Summary Only',r?.charges||0,r?.tax||0,r?.total||0])}
    for(const inv of s.unmD){const d=s.dt[inv];s2.push([s.fileName,s.country,s.hd.stmtNum,s.hd.custName,inv,'Detail Only',d?.charges||0,d?.tax||0,d?.total||0])}}
  addSh(wb,s2,'Unmapped');
  const s3=[[t('file'),'Country','Currency','Statement','Customer',t('invoice'),t('tranche'),t('product'),t('name'),t('qty'),t('unit_price'),t('charges'),t('tax'),'CRF/RDF',t('total'),'Src File','Src Page']];
  for(const s of all)for(const li of s.li)s3.push([s.fileName,s.country,s.cur,s.hd.stmtNum,s.hd.custName,li.inv,li.tranche,li.pid,li.pname,li.qty,li.up,li.charges,li.tax,li.crfRdf||0,li.total,li.srcFile,li.srcPage]);
  addSh(wb,s3,'Detail');
  const s4=[[t('file'),'Country','Statement','Customer','Check',t('pass'),'Severity','Details']];
  for(const s of all)for(const v of s.vr)s4.push([s.fileName,s.country,s.hd.stmtNum,s.hd.custName,v.nm,v.p?'PASS':'FAIL',v.sv==='p'?'PASS':v.sv==='f'?'FAIL':'WARN',v.dt]);
  addSh(wb,s4,'Validation');
  // Build filename: {stmtNum}_{lang}_Invoice_Validator_Export_{YYYYMMDD}.xlsx
  const _date=new Date().toISOString().slice(0,10).replace(/-/g,'');
  const _stmt=all.length>0?(all[0].hd.stmtNum||''):'';
  let _lang='';
  if(all.length>0){const _fn=all[0].fileName||'';const _lm=_fn.match(/_([A-Z]{2})(?:\.[^.]+)?$/i);if(_lm)_lang=_lm[1].toUpperCase();}
  const _parts=[_stmt,_lang,'Invoice_Validator_Export',_date].filter(Boolean);
  XLSX.writeFile(wb,_parts.join('_')+'.xlsx');
}
function addSh(wb,data,name){const ws=XLSX.utils.aoa_to_sheet(data),cols=[];
  for(let c=0;c<data[0].length;c++){let mx=10;for(let r=0;r<Math.min(data.length,80);r++){const v=data[r][c];const l=v!=null?String(v).length:0;if(l>mx)mx=l}cols.push({wch:Math.min(mx+2,42)})}
  ws['!cols']=cols;if(data.length>1)ws['!autofilter']={ref:XLSX.utils.encode_range({s:{r:0,c:0},e:{r:data.length-1,c:data[0].length-1}})};
  XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31))}

