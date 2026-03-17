import fs from 'fs';

const src = 'C:/Users/kate_/Documents/Claude_WrokStation/invoice_extractor_tool/tool_v3/lenovo_invoice_validator.html';
const dst = 'C:/Users/kate_/Documents/Codex_WorkStation/codex_invoice_extractor_tool/lenovo_invoice_validator.html';

let html = fs.readFileSync(src, 'utf8');

// VERSION
html = html.replace(/const VERSION='[^']+';/, "const VERSION='3.12.4';");

// i18n (English) sum_only label
html = html.replace("sum_only:'Summary Only'", "sum_only:'Detail Pages Missing'");

// Add .ib.f style if missing
if (!html.includes('.ib.f{')) {
  html = html.replace('.ib.g{background:var(--green-light);color:var(--green)}', '.ib.g{background:var(--green-light);color:var(--green)}.ib.f{background:var(--red-light);color:var(--red)}');
}

// Summary-only validation message text
html = html.replace('`${unmS.length} inv in Summary only`', "`Detail pages missing (${unmS.length} invoice${unmS.length>1?'s':''})`");

// Summary-only info box styling
html = html.replace('<div class="ib w">? <div><strong>${s.unmS.length} ${t(\'sum_only\')}:', '<div class="ib f">ERROR <div><strong>${s.unmS.length} ${t(\'sum_only\')}:');

// Replace summary-only synthetic item label if present
html = html.replace(/pname:'Summary-only'/g, "pname:'Detail pages missing'");

// parseItemsIN replacement
const parseItemsIN = `function parseItemsIN(lines,fileName){
  const items=[];let curInv='',curTr='';
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\\b/;
  const sectRe=/Tranche\\s*ID|Invoice\\s*Number|Sub[\\s-]*Total|Grand[\\s-]*Total|Product\\s*ID|HSN|SAC/i;
  const curRe=/INR\\s*[\\d,]+/;
  const subTotRe=/Sub-Total\\s+([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)/i;
  const seenTotals=new Set();
  // Full: pname qty INR up INR charges rate% INR tax INR total
  const reFull=/(.+?)\\s+([\\d,]+\\.?\\d*)\\s+INR\\s*([\\d,]+\\.?\\d*)\\s+INR\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+INR\\s*([\\d,]+\\.?\\d*)\\s+INR\\s*([\\d,]+\\.?\\d*)/;
  const reNums=/^\\s*([\\d,]+\\.?\\d*)\\s+INR\\s*([\\d,]+\\.?\\d*)\\s+INR\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+INR\\s*([\\d,]+\\.?\\d*)\\s+INR\\s*([\\d,]+\\.?\\d*)/;
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    const iim=ln.match(/Internal\\s*Ref\\.?\\s*No\\.?\\s*:\\s*(\\d{7,12})/i);if(iim){curInv=iim[1];continue}
    const im=ln.match(/Invoice\\s*Number[:\\s]*(\\d{7,12})/i);if(im){curInv=im[1];continue}
    if(/Invoice\\s*Number/i.test(ln)&&!/\\d{7,12}/.test(ln)){
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^(\\d{7,12})/);if(pm)curInv=pm[1];}
      continue;
    }
    const tm=ln.match(/Tranche\\s*ID\\s+(\\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\\s-]*total|grand[\\s-]*total/i.test(ln)){
      let charges=0,total=0;
      const m=subTotRe.exec(ln);
      if(m){
        charges=pN(m[1]);
        total=pN(m[5]);
      }else{
        const nums=(ln.match(/[\\d,]+\\.?\\d*/g)||[]).map(pN).filter(n=>n>0);
        if(nums.length>=2){charges=nums[0];total=nums[nums.length-1];}
      }
      const key=curInv+'|'+charges+'|'+total;
      if(charges>0&&total>0&&!seenTotals.has(key)){
        seenTotals.add(key);
        items.push({inv:curInv,tranche:curTr,pid:'SUBTOTAL',pname:'Sub-Total',qty:1,up:charges,charges:charges,tax:0,total:total,taxRate:0,crfRdf:0,srcFile:fileName,srcPage:page});
      }
      continue;
    }
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
        if(!/^\\s*[\\d,INR%\\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}`;
html = html.replace(/function parseItemsIN[\s\S]*?return items;\n}\n/, parseItemsIN + '\n');

// Generic parser: add qty-first no-tax handling
if (!html.includes('rePhNoTaxNN')) {
  html = html.replace(/const rePhNoTax=.*?;\n/, match => match + "  // PH/TH qty-first no-tax: qty up charges total (no name)\n  const rePhNoTaxNN=/^\\s*([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)\\s+([\\d,]+\\.?\\d*)\\s*$/;\n");
  html = html.replace(/m=rePhNoTax\.exec\(after\);[\s\S]*?continue;\n/, block => block +
"    // PH/TH qty-first no-tax (no name)\n    m=rePhNoTaxNN.exec(after);\n    if(m&&pN(m[4])>0){\n      let pname='';\n      for(let j=i-1;j>=Math.max(0,i-2);j--){\n        const prev=lines[j].text.trim();if(!prev)continue;\n        if(sectRe.test(prev)||pidRe.test(prev))break;\n        if(!/^\\s*[\\d,.$%\\s]+$/.test(prev)){pname=prev;break;}\n      }\n      items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty:pN(m[1]),up:pN(m[2]),charges:pN(m[3]),tax:0,total:pN(m[4]),taxRate:0,crfRdf:0,srcFile:fileName,srcPage:page});continue;\n    }\n");
}

// parseStatement fallbacks + unreadable warning
if (!html.includes('PDF content not readable')) {
  html = html.replace(/const hd=parseHeader\(lines\);\n\s*const bs=parseBillingSummary\(fullText\);\n\s*const knownInvs=new Set\(bs\.map\(r=>r\.inv\)\.filter\(Boolean\)\);\n\s*const li=parseItems\(country,lines,fileName,knownInvs\);/, 
`const hd=parseHeader(lines);
  let bs=parseBillingSummary(fullText);
  const knownInvs=new Set(bs.map(r=>r.inv).filter(Boolean));
  let li=parseItems(country,lines,fileName,knownInvs);
  // If no detail items but billing summary exists, synthesize one item per invoice
  if(!li.length&&bs.length){
    li=bs.map(r=>({inv:r.inv,tranche:'',pid:'SUMMARY',pname:'Detail pages missing',qty:1,up:r.charges,charges:r.charges,tax:r.tax,total:r.total,taxRate:0,crfRdf:(r.crf||0)+(r.rdf||0),srcFile:fileName,srcPage:0}));
  }`);

  html = html.replace(/const dGT=\{charges:Object\.values\(dt\)[\s\S]*?\};/, match => {
    return `  // If billing summary missing, derive from detail totals\n  if(!bs.length&&Object.keys(dt).length){\n    bs=Object.entries(dt).map(([inv,v])=>({inv,charges:v.charges,tax:v.tax,total:v.total,crf:0,rdf:0}));\n  }\n  const sT={charges:bs.reduce((s,r)=>s+r.charges,0),tax:bs.reduce((s,r)=>s+r.tax,0),total:bs.reduce((s,r)=>s+r.total,0)};\n  const dGT={charges:Object.values(dt).reduce((s,v)=>s+v.charges,0),tax:Object.values(dt).reduce((s,v)=>s+v.tax,0),total:Object.values(dt).reduce((s,v)=>s+v.total,0),crfRdf:Object.values(dt).reduce((s,v)=>s+(v.crfRdf||0),0)};`;
  });

  html = html.replace(/\/\/ Validation\n  const vr=\[\];const noD=li\.length===0;/, `// Validation\n  const vr=[];const noD=li.length===0;\n  if(!bs.length&&!li.length){\n    vr.push({nm:'PDF content not readable / unsupported',p:false,sv:'f',dt:'No Billing Summary and no Detail Line Items detected. PDF may be scanned, missing text layer, or uses unsupported layout.'});\n  }`);
}

// EMEA: add $ currency support and ODN / multi-line invoice numbers
html = html.replace(/const curRe=\/\(\?:?\|GBP\|SEK\)\\s\*\[\\d,\]\+\//, "const curRe=/(?:\\u20AC|GBP|SEK|\\$)\\s*[\\d,]+/");
html = html.replace(/\(\?:?\|GBP\|SEK\)/g, '(?:\\u20AC|GBP|SEK|\\$)');
html = html.replace(/const im=ln\.match\([^\)]*Invoice\s\*Number[^\)]*\);/, "const im=ln.match(/(?:Invoice\\s*Number|Rechnungsnummer|Numero\\s*de\\s*facture|Numero\\s*fattura|Factuurnummer|Numero\\s*de\\s*factura|ODN)[:\\s]*([A-Z]{2,}\\d{6,}|\\d{7,12})/i);");
html = html.replace(/if\(\/Invoice[^\n]*\)\s*&&[^\n]*\)\{\n\s*if\(i\+1<lines\.length\)\{const pk=lines\[i\+1\]\.text\.trim\(\);const pm=pk\.match\(/,
  "if(/Invoice\\s*Number|Rechnungsnummer|Numero\\s*de\\s*facture|Numero\\s*fattura|Factuurnummer|Numero\\s*de\\s*factura|ODN/i.test(ln)&&!/(?:\\d{7,12}|[A-Z]{2,}\\d{6,})/.test(ln)) {\n      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([A-Z]{2,}\\d{6,}|\\d{7,12})/");

// Two-line ODN in other parsers (generic / CH) adjustments
html = html.replace(/pm=pk\.match\(\/\^\(\\d\{7,12\}\)\//g, "pm=pk.match(/^([A-Z]{2,}\\d{6,}|\\d{7,12})/");

fs.writeFileSync(dst, html, 'utf8');
console.log('Rebuilt from tool_v3 with optimizations ->', dst);
