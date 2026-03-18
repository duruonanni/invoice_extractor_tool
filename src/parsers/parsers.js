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
  // Currency symbol patterns: $ JPY/EUR/GBP/CHF/SEK/KRW/INR/RM
  const curSym='(?:\\$|JPY|EUR|GBP|CHF|SEK|KRW|INR|RM|NZD|MYR|PHP|SGD|THB|AUD|CAD)';
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
  // JP yen (integer): inv JPY charges JPY tax JPY total
  const pJP=/(\d{7,12})\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)/g;
  while(hasSummaryLabel && (m=pJP.exec(text))!==null){
    const[,num,c,tx,tot]=m;const ch=pN(c),t=pN(tx),tl=pN(tot);
    if(!res.find(r=>r.inv===num)&&Math.abs(tl-(ch+t))<tl*.02+10)
      res.push({inv:num,charges:ch,tax:t,total:tl,crf:0,rdf:0});
  }
  if(res.length)return res;
  // KRW integer (no decimals): inv KRW charges KRW tax KRW total
  const pKR=/(\d{7,12})\s+KRW\s*([\d,]+)\s+KRW\s*([\d,]+)\s+KRW\s*([\d,]+)/g;
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

// JP Parser
function parseItemsJP(lines,fileName){
  const items=[];let curInv='',curTr='';
  const reFull=/(.+?)\s+([\d,]+)\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)\s+(\d+)\s*%\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)/;
  const reNums=/^\s*([\d,]+)\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)\s+(\d+)\s*%\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i;
  const curRe=/JPY\s*[\d,]+/;
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  function jpFwd(i,max){let s='';for(let j=i+1;j<=Math.min(i+max,lines.length-1);j++){const t=lines[j].text.trim();if(!t||pidRe.test(t)||sectRe.test(t)||curRe.test(t))break;s+=(s?' ':'')+t;}return s;}
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    const im=ln.match(/Invoice\s*Number[:\s]*([\d]+)/i);if(im){curInv=im[1];continue}
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    const wm=ln.match(pidRe);if(!wm||!curRe.test(ln))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){
        let prefix='';
        if(i>0){const prev=lines[i-1].text.trim();if(prev&&!pidRe.test(prev)&&!sectRe.test(prev)&&!curRe.test(prev))prefix=prev;}
        const suffix=jpFwd(i,1);
        const pname=[prefix,m[1].trim(),suffix].filter(Boolean).join(' ');
        items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
        continue;
      }
    }
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
      const pname=m[1].trim()||inferPname(i)||pid;
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
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
  function inferPname(idx){
    let pname='';
    for(let j=idx-1;j>=Math.max(0,idx-3);j--){
      const prev=lines[j].text.trim();
      if(!prev)continue;
      if(sectRe.test(prev)||curRe.test(prev)||curReS.test(prev))break;
      if(!/^\s*[\d,.%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
    }
    if(idx+1<lines.length){
      const nxt=lines[idx+1].text.trim();
      if(nxt&&!pidRe.test(nxt)&&!sectRe.test(nxt)&&!curRe.test(nxt)&&!curReS.test(nxt)&&!/^[A-Za-z]+$/.test(nxt))pname=(pname?pname+' ':'')+nxt;
    }
    return pname.trim();
  }
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    // Invoice Number (or "Rechnungsnummer" for DE)
    const im=ln.match(/(?:Invoice\s*Number|Rechnungsnummer|Num茅ro\s*de\s*facture|Numero\s*fattura|Factuurnummer|N煤mero\s*de\s*factura|螒蟻喂胃渭蠈蟼\s*蟿喂渭慰位慰纬委慰蠀)[:\s]*(\d{7,12})/i);
    if(im){curInv=im[1];continue}
    // Two-line invoice number
    if(/Invoice\s*Number|Rechnungsnummer/i.test(ln)&&!/\d{7,12}/.test(ln)){
      for(let j=i+1;j<Math.min(i+4,lines.length);j++){
        const pk=lines[j].text.trim();
        const pm=pk.match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);
        if(pm){curInv=pm[1];break}
      }
      continue;
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/^Tranche\s*ID$/i.test(ln)){
      for(let j=i-1;j>=Math.max(0,i-3);j--){
        const prev=lines[j].text.trim();
        if(!prev)continue;
        if(/^[A-Z0-9_][A-Z0-9_\-]{8,}$/i.test(prev)){curTr=prev;break}
        if(/\d/.test(prev)&&!/\s/.test(prev)){curTr=prev;break}
        if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev)||curReS.test(prev))break;
      }
      continue;
    }
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    // Match product ID (WBD or general alphanumeric) + must have currency on same line
    const wm=ln.match(pidRe);if(!wm||!(curRe.test(ln)||curReS.test(ln)))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const pname=m[1].trim()||inferPname(i)||pid;
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reFullS.exec(after);
    if(m){
      const pname=m[1].trim()||inferPname(i)||pid;
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNums.exec(after);
    if(m){
      const pname=inferPname(i);
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNumsS.exec(after);
    if(m){
      const pname=inferPname(i);
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
  }
  return items;
}

// 鈹€鈹€ KR Parser (South Korea 鈥?鈧?/ $ with Korean labels) 鈹€鈹€
function parseItemsKR(lines,fileName){
  const items=[];let curInv='',curTr='';
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i;
  const curRe=/KRW\s*[\d,]+/;
  const reFull=/(.+?)\s+([\d,]+\.?\d*)\s+KRW\s*([\d,]+\.?\d*)\s+KRW\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+KRW\s*([\d,]+\.?\d*)\s+KRW\s*([\d,]+\.?\d*)/;
  const reNums=/^\s*([\d,]+\.?\d*)\s+KRW\s*([\d,]+\.?\d*)\s+KRW\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+KRW\s*([\d,]+\.?\d*)\s+KRW\s*([\d,]+\.?\d*)/;
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
        if(!/^\s*[\d,KRW%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
      }
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
    }
  }
  return items;
}

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
  vr.push({nm:'Grand Total - Charges',p:cd<1,sv:cd<1?'p':(noD?'w':'f'),dt:`Sum: ${fc(sT.charges,cur)} | Det: ${fc(dGT.charges,cur)} | Diff: ${fc(cd,cur)}`});
  vr.push({nm:'Grand Total - Tax',p:txd<1,sv:txd<1?'p':(noD?'w':'f'),dt:`Sum: ${fc(sT.tax,cur)} | Det: ${fc(dGT.tax,cur)} | Diff: ${fc(txd,cur)}`});
  vr.push({nm:'Grand Total - Total',p:td<1,sv:td<1?'p':(noD?'w':'f'),dt:`Sum: ${fc(sTotAdj,cur)} | Det: ${fc(dGT.total,cur)} | Diff: ${fc(td,cur)}`});
  if(unmS.length)vr.push({nm:`Detail pages missing (${unmS.length} invoice${unmS.length>1?'s':''})`,p:false,sv:'f',dt:unmS.join(', ')});
  if(unmD.length)vr.push({nm:`${unmD.length} inv in Detail only`,p:false,sv:'f',dt:unmD.join(', ')});
  for(const r of bs){const c=r.charges+r.tax+(r.crf||0)+(r.rdf||0),d=Math.abs(c-r.total);
    vr.push({nm:`Inv ${r.inv}: arithmetic`,p:d<1,sv:d<1?'p':'f',dt:`${fc(r.charges,cur)} + ${fc(r.tax,cur)} = ${fc(c,cur)} vs ${fc(r.total,cur)} | Diff: ${fc(d,cur)}`})}
  for(const c of comp.filter(x=>x.st==='matched'&&!x.m))
    vr.push({nm:`Inv ${c.inv}: mismatch`,p:false,sv:'f',dt:`Diff charges=${fc(c.dC_,cur)} | tax=${fc(c.dT_,cur)} | total=${fc(c.dTot_,cur)}`});
  vr.push({nm:'Line Items',p:li.length>0,sv:li.length>0?'p':'w',dt:li.length?`${li.length} WBD, ${new Set(li.map(l=>l.tranche)).size} tranches`:t('no_items')});
  const nwAll=li.filter(l=>!/^WBD/i.test(l.pid));
  if(nwAll.length){const byInv={};for(const l of nwAll){if(!byInv[l.inv])byInv[l.inv]=[];byInv[l.inv].push(l.pid)}
    const det=Object.entries(byInv).map(([inv,pids])=>`${inv}: ${pids.join(', ')}`).join(' | ');
    vr.push({nm:`${nwAll.length} non-WBD product(s)`,p:false,sv:'w',dt:det})}

  return{fileName,country,cur,hd,bs,li,sT,dt,dGT,comp,unmS,unmD,vr};
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲
