function parseBillingSummaryGeneric(text){
  const hasSummaryLabel = /(Billing\s*Summary|Summary\s*of\s*Charges|Statement\s*Summary|Summary\s*Charges|Summary\s*By|請求概要)/i.test(text);
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

function parseBillingSummaryJP(lines){
  const res=[];
  let inSummary=false;
  for(let i=0;i<lines.length;i++){
    const ln=(lines[i].text||'').trim();
    if(/請求概要/.test(ln)){inSummary=true;continue;}
    if(!inSummary)continue;
    if(/請求書番号\s*小計\s*消費税\s*合計/.test(ln))continue;
    const m=ln.match(/^(\d{7,12})\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)/);
    if(m){
      res.push({inv:m[1],charges:pN(m[2]),tax:pN(m[3]),total:pN(m[4]),crf:0,rdf:0});
      continue;
    }
    if(res.length&&/^JPY\s*[\d,]+\s+JPY\s*[\d,]+\s+JPY\s*[\d,]+/.test(ln))break;
    if(res.length&&/^(備考[:：]|シティバンク|1ページ\/\d+ページ|Tax Invoice|請求書)/.test(ln))break;
  }
  return res;
}

function parseBillingSummaryNL(lines){
  const res=[];
  const curSym='(?:\\u20ac|EUR)';
  const rowRe=new RegExp('^(\\d{7,12})\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$');
  let inSummary=false;
  for(let i=0;i<lines.length;i++){
    const ln=(lines[i].text||'').trim();
    if(/Billing\s*Summary/i.test(ln)){inSummary=true;continue;}
    if(!inSummary)continue;
    if(/Tax\s*Invoice\s*No\.\s*Charges\s*VAT\s*Total/i.test(ln))continue;
    if(/^Invoice\s*Number\b/i.test(ln)||/^Product\s*ID\b/i.test(ln)||/^Tranche\s*ID\b/i.test(ln))break;
    const m=ln.match(rowRe);
    if(m){
      res.push({inv:m[1],charges:pN(m[2]),tax:pN(m[3]),total:pN(m[4]),crf:0,rdf:0});
      continue;
    }
    if(res.length&&(/^Grand\s*Total/i.test(ln)||/^Payable on:/i.test(ln)||/^Please reference Lenovo invoice number/i.test(ln)))break;
  }
  return res;
}

function parseBillingSummary(text,lines,fileName,country){
  if(country==='JP'&&/請求概要/.test(text))return parseBillingSummaryJP(lines);
  if(country==='NL'&&/Billing\s*Summary/i.test(text))return parseBillingSummaryNL(lines);
  return parseBillingSummaryGeneric(text);
}

// JP Parser
function parseItemsJP(lines,fileName){
  const items=[];let curInv='',curTr='';
  const reFull=/(.+?)\s+([\d,]+)\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)\s+(\d+)\s*%\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)/;
  const reNums=/^\s*([\d,]+)\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)\s+(\d+)\s*%\s+JPY\s*([\d,]+)\s+JPY\s*([\d,]+)/;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID|発行ID|請求書番号|製品ID|製品名称|数量|単価|小計|消費税率|消費税|合計/i;
  const curRe=/JPY\s*[\d,]+/;
  const pidRe=/^([A-Z0-9][A-Z0-9_]{4,})\b/;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim().replace(/_\s+/g,'_').replace(/\s+_/g,'_');}
  function mergeParts(parts){
    const out=[];
    for(const raw of parts){
      const part=clean(raw);
      if(!part)continue;
      if(out.length&&out[out.length-1]===part)continue;
      out.push(part);
    }
    return out.join(' ').trim();
  }
  function isJPContextLine(text){
    const t=clean(text);
    if(!t)return false;
    if(pidRe.test(t)||sectRe.test(t)||curRe.test(t))return false;
    if(/^\d[\d,\s.%-]*$/.test(t))return false;
    if(/^\d+\s*ページ\s*\/\s*\d+\s*ページ$/i.test(t))return false;
    if(/^\d+\s*\/\s*\d+$/.test(t))return false;
    if(/^(請求書|ご契約先|請求先|送付先|お客様番号|お客様名|請求対象期間|サービス内容|備考|支払期限|支払期日|お問い合わせ先|電話番号|メールアドレス|発行日|発行ID|ページ)/.test(t))return false;
    return true;
  }
  function isJPHeadingLine(text){
    const t=clean(text);
    if(!isJPContextLine(t))return false;
    if(/_/.test(t))return false;
    if(/[-/]$/.test(t))return false;
    return /[A-Za-z]/.test(t);
  }
  function isJPSuffixLine(text){
    const t=clean(text);
    if(!isJPContextLine(t))return false;
    return !isJPHeadingLine(t);
  }
  function jpPrefix(i){
    const prefixParts=[];
    for(let j=i-1;j>=Math.max(0,i-3);j--){
      const prev=clean(lines[j].text);
      if(!prev)continue;
      if(sectRe.test(prev)||pidRe.test(prev)||curRe.test(prev))break;
      if(isJPHeadingLine(prev))prefixParts.unshift(prev);
    }
    return prefixParts;
  }
  function jpSuffix(i,max){
    const out=[];
    for(let j=i+1;j<=Math.min(i+max,lines.length-1);j++){
      const t=clean(lines[j].text);
      if(!t||pidRe.test(t)||sectRe.test(t)||curRe.test(t))break;
      if(!isJPSuffixLine(t))break;
      out.push(t);
    }
    return out.join(' ');
  }
  for(let i=0;i<lines.length;i++){
    const{text:ln,page}=lines[i];
    const im=ln.match(/Invoice\s*Number[:\s]*([\d]+)/i)||ln.match(/請求書番号\s*([\d]{7,12})/);
    if(im){curInv=im[1];continue}
    const tm=ln.match(/(?:Tranche\s*ID|発行ID)\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/sub[\s-]*total|grand[\s-]*total/i.test(ln))continue;
    const wm=ln.match(pidRe);if(!wm||!curRe.test(ln))continue;
    const pid=wm[1],after=ln.substring(ln.indexOf(pid)+pid.length);
    let m=reFull.exec(after);
    if(m){
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){
        const prefixParts=jpPrefix(i);
        const suffix=jpSuffix(i,1);
        const pname=mergeParts([...prefixParts,m[1].trim(),suffix]);
        items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
        continue;
      }
    }
    m=reNums.exec(after);
    if(m){
      const prefixParts=jpPrefix(i);
      const suffix=jpSuffix(i,2);
      const pname=mergeParts([...prefixParts,suffix]);
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
  const strictPidRe=/^(?:WBD[A-Z0-9]+|[A-Z0-9]{5,}_[A-Z0-9_]+)\b/i;
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

// CH parser: Switzerland (CHF, decimal qty, 8.10% VAT)
function parseItemsCH(lines,fileName){
  const items=[];let curInv='',curTr='';
  const trancheValueRe=/^\d{7,}_[A-Z]{2}_[A-Z0-9_]+$/i;
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
      // CH layout sometimes places the invoice number on the next line.
      if(i+1<lines.length){const pk=lines[i+1].text.trim();const pm=pk.match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);if(pm)curInv=pm[1];}
      continue;
    }
    const tm=ln.match(/Tranche\s*ID\s+(\S+)/i);if(tm){curTr=tm[1];continue}
    if(/^Tranche\s*ID$/i.test(ln)){
      const prev=lines[i-1]?.text.trim()||'';
      if(trancheValueRe.test(prev))curTr=prev;
      continue;
    }
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

// EMEA parser: EUR/GBP/SEK layouts with non-WBD support
function parseItemsEMEA(lines,fileName){
  const items=[];let curInv='',curTr='';
  // General product ID: WBD... or alphanumeric+underscore (e.g. 21FBSDGX0L_AAS, 78722528_AAS)
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const strictPidRe=/^(?:WBD[A-Z0-9]+|[A-Z0-9]{5,}_[A-Z0-9_]+)$/i;
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
  function shouldAppendContinuation(base,next){
    if(!next)return false;
    if(sectRe.test(next)||strictPidRe.test(next)||curRe.test(next)||curReS.test(next))return false;
    if(/^sub[\s-]*total|grand[\s-]*total|page \d+ of \d+/i.test(next))return false;
    if(/^(Lenovo|This is a computer generated|Payable on:|Please raise your claims|Transactions relating|Place of performance|Payment Terms:|A late payment charge|Payment by Bank Transfer:|Please ask your bank|Citibank|SWIFT code:)/i.test(next))return false;
    if(/^[A-Za-z]+$/.test(next)){
      return /[-/(]$/.test(base)||/\b(English|German|French|Spanish|Italian|Japanese|USEnglish|US English|Monthly)$/i.test(base);
    }
    return true;
  }
  function mergePnameParts(lead,tail){
    const a=(lead||'').trim();
    const b=(tail||'').trim();
    if(!a)return b;
    if(!b)return a;
    if(a===b)return a;
    if(a.includes(b))return a;
    if(b.includes(a))return b;
    return `${a} ${b}`.trim();
  }
  function appendContinuation(base,idx){
    let pname=base||'';
    for(let j=idx+1;j<Math.min(idx+4,lines.length);j++){
      const nxt=lines[j].text.trim();
      if(!shouldAppendContinuation(pname,nxt))break;
      pname+=(pname?' ':'')+nxt;
    }
    return pname.trim();
  }
  function inferPname(idx){
    let pname='';
    for(let j=idx-1;j>=Math.max(0,idx-3);j--){
      const prev=lines[j].text.trim();
      if(!prev)continue;
      if(sectRe.test(prev)||curRe.test(prev)||curReS.test(prev))break;
      if(/^(German|English|USEnglish|US English|Monthly)$/i.test(prev))continue;
      if(!/^\s*[\d,.%\s]+$/.test(prev))pname=prev+(pname?' '+pname:'');
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
      curTr='';
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
      const pname=appendContinuation(mergePnameParts(inferPname(i),m[1].trim()||pid),i);
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reFullS.exec(after);
    if(m){
      const pname=appendContinuation(mergePnameParts(inferPname(i),m[1].trim()||pid),i);
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNums.exec(after);
    if(m){
      const pname=appendContinuation(inferPname(i),i);
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
    m=reNumsS.exec(after);
    if(m){
      const pname=appendContinuation(inferPname(i),i);
      const qty=pN(m[1]),up=pN(m[2]),ch=pN(m[3]),rate=pN(m[4]),tax=pN(m[5]),tot=pN(m[6]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid,pname:pname||pid,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});continue;}
    }
  }
  return items;
}

// KR parser: South Korea layouts with Korean labels
function parseItemsKR(lines,fileName){
  const items=[];let curInv='',curTr='';
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const curSym='(?:KRW|\\$)';
  const sectRe=/(?:Tranche\s*ID|Invoice\s*Number|발행\s*ID|송장\s*번호|Sub[\s-]*Total|Grand[\s-]*Total|제품ID|제품명|세율|청구사항|반복되는\s*청구기간|서비스내역|세금계산서번호|청구처|청구사항)/i;
  const stopRe=/^(소계|총 합계|Grand Total|Sub-Total|제품과 서비스 합계|부가가치세 합계|부가가치세 포함 총합계|본 청구서는|Payment Terms:|Payable on:|송금계좌|세금용도로만|Invoice Messaging:|page \d+ of \d+)/i;
  const fullRe=new RegExp(`^([A-Za-z0-9][A-Za-z0-9_]{4,})\\s+(.+?)\\s+([\\d,]+\\.?\\d*)\\s+${curSym}\\s*([\\d,]+\\.?\\d*)\\s+${curSym}\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+${curSym}\\s*([\\d,]+\\.?\\d*)\\s+${curSym}\\s*([\\d,]+\\.?\\d*)$`,'i');
  const numsRe=new RegExp(`^([A-Za-z0-9][A-Za-z0-9_]{4,})\\s+([\\d,]+\\.?\\d*)\\s+${curSym}\\s*([\\d,]+\\.?\\d*)\\s+${curSym}\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+${curSym}\\s*([\\d,]+\\.?\\d*)\\s+${curSym}\\s*([\\d,]+\\.?\\d*)$`,'i');
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function isContextLine(text){
    const t=clean(text);
    if(!t)return false;
    if(sectRe.test(t)||stopRe.test(t)||pidRe.test(t))return false;
    if(new RegExp(`${curSym}\\s*[\\d,]+`,'i').test(t))return false;
    if(/^[\d,.\s%]+$/.test(t))return false;
    return true;
  }
  function collectPrefix(idx){
    const parts=[];
    for(let j=idx-1;j>=Math.max(0,idx-3);j--){
      const prev=clean(lines[j].text);
      if(!prev)continue;
      if(sectRe.test(prev)||stopRe.test(prev)||pidRe.test(prev)||new RegExp(`${curSym}\\s*[\\d,]+`,'i').test(prev))break;
      if(isContextLine(prev))parts.unshift(prev);
    }
    return parts;
  }
  function collectSuffix(idx){
    const parts=[]; let endIdx=idx;
    for(let j=idx+1;j<Math.min(idx+4,lines.length);j++){
      const next=clean(lines[j].text);
      if(!next)continue;
      if(sectRe.test(next)||stopRe.test(next)||pidRe.test(next)||/^\d{7,12}\b/.test(next)||new RegExp(`${curSym}\\s*[\\d,]+`,'i').test(next))break;
      if(isContextLine(next)){parts.push(next); endIdx=j; continue;}
      break;
    }
    return {suffix:merge(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    const im=ln.match(/(?:Invoice\s*Number|송장\s*번호)[:\s]*(\d{7,12})/i);
    if(im){curInv=im[1];continue;}
    if(/(?:Invoice\s*Number|송장\s*번호)/i.test(ln)&&!/\d{7,12}/.test(ln)){
      if(i+1<lines.length){
        const pm=clean(lines[i+1].text).match(/^([A-Z]{2,}\d{6,}|\d{7,12})/);
        if(pm)curInv=pm[1];
      }
      continue;
    }
    const tm=ln.match(/(?:Tranche\s*ID|발행\s*ID)\s+(\S+)/i);
    if(tm){curTr=tm[1];continue;}
    if(stopRe.test(ln))continue;
    let m=ln.match(fullRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([...collectPrefix(i),m[2],suffixInfo.suffix])||m[1];
      const qty=pN(m[3]),up=pN(m[4]),ch=pN(m[5]),rate=pN(m[6]),tax=pN(m[7]),tot=pN(m[8]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});i=suffixInfo.endIdx;continue;}
    }
    m=ln.match(numsRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([...collectPrefix(i),suffixInfo.suffix])||m[1];
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0){items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});i=suffixInfo.endIdx;continue;}
    }
  }
  return items;
}

function parseItemsTH(lines,fileName){
  const items=[];let curInv='',curTr='';let pending=[];
  const pidRe=/^(WBD[A-Z0-9]+)\b/i;
  const trancheRe=/^\d{7,}_[A-Z]{2}_[A-Z0-9_]+$/i;
  const nextHeaderRe=/^(Notebook\b|NB\b|ThinkVision\b|ThinkPad\b|ThinkCentre\b|ThinkCenter\b|Desktop\b|Workstation\b)/i;
  const stopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Summary:|Total of Products and All Services|Total VAT|Total Including VAT|Invoice Number:|Sold To:|Invoice Date:|Payment by Wire:|Payment by Check\/Post To:|Reference Invoice Number:|Recurring Charge Period:|Subscription Service Detail|Product ID Product Name|This invoice is issued|E\. & O\.E\.|page \d+ of \d+|TAX INVOICE)/i;
  const fullRe=/^(WBD[A-Z0-9]+)\s+(.+?)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/i;
  const numsRe=/^(WBD[A-Z0-9]+)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/i;
  const skipPages=new Set();
  for(const {text,page} of lines){
    if(/CUSTOMER COPY|BILLING COPY/i.test(text))skipPages.add(page);
  }
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function collectSuffix(startIdx){
    const parts=[];let endIdx=startIdx;
    for(let j=startIdx+1;j<Math.min(startIdx+3,lines.length);j++){
      if(skipPages.has(lines[j].page))break;
      const nxt=clean(lines[j].text);
      if(!nxt||stopRe.test(nxt)||pidRe.test(nxt)||trancheRe.test(nxt)||/^\d{7,12}\b/.test(nxt)||nextHeaderRe.test(nxt))break;
      parts.push(nxt);endIdx=j;
    }
    return {suffix:merge(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    if(skipPages.has(lines[i].page))continue;
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    const invM=ln.match(/Invoice\s*Number:\s*(\d{7,12})/i);
    if(invM){curInv=invM[1];curTr='';pending=[];continue;}
    if(/^Tranche\s*ID$/i.test(ln)){
      const prev=clean(lines[i-1]?.text||'');
      curTr=trancheRe.test(prev)?prev:'';
      pending=[];
      continue;
    }
    if(stopRe.test(ln)){pending=[];continue;}
    let m=ln.match(fullRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),m[2],suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[3]),up:pN(m[4]),charges:pN(m[5]),tax:pN(m[7]),total:pN(m[8]),taxRate:pN(m[6]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    m=ln.match(numsRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:pN(m[6]),total:pN(m[7]),taxRate:pN(m[5]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    if(nextHeaderRe.test(ln)){
      pending=[ln];
    }
  }
  return items;
}

function parseItemsGB11(lines,fileName){
  const items=[];let curInv='',curTr='';let pending=[];
  const pidRe=/^(WBD[A-Z0-9]+)\b/i;
  const fullRe=/^(WBD[A-Z0-9]+)\s+(.+?)\s+([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)\s+([\d.]+)\s*%\s+\$\s*([\d,]+\.?\d*)\s+\$\s*([\d,]+\.?\d*)$/i;
  const trancheInlineRe=/^Tranche\s*ID\s+(\S+)/i;
  const trancheValueRe=/^\d{7,}_[A-Z]{2}_[A-Z0-9_]+$/i;
  const stopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Invoice Messaging:|Export of services\.|Product Description Qty Unit Price Amount|For Tax Purposes Only GBP|Equivalent Exchange Rate|VAT |Total |Invoice Number Invoice Date Customer Number|Invoice to name|Sold to name|References|Payable on:|Please raise your claims|Transactions relating|Lenovo |This is a computer generated|Date =|page \d+ of \d+)/i;
  const nextHeaderRe=/^(United Kingdom\b|NoteBook\b|Notebook\b|ThinkPad\b|ThinkBook\b|ThinkCentre\b)/i;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function collectSuffix(startIdx){
    const parts=[];let endIdx=startIdx;
    for(let j=startIdx+1;j<Math.min(startIdx+3,lines.length);j++){
      const nxt=clean(lines[j].text);
      if(!nxt||stopRe.test(nxt)||pidRe.test(nxt)||trancheInlineRe.test(nxt)||/^\d{7,12}\b/.test(nxt)||nextHeaderRe.test(nxt))break;
      parts.push(nxt);endIdx=j;
    }
    return {suffix:merge(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    if(/^Invoice\s*Number\s+Invoice\s*Date\s+Customer\s*Number/i.test(ln)){
      pending=[];curTr='';
      for(let j=i+1;j<Math.min(i+4,lines.length);j++){
        const m=clean(lines[j].text).match(/^(\d{7,12})\b/);
        if(m){curInv=m[1];break;}
      }
      continue;
    }
    const trM=ln.match(trancheInlineRe);
    if(trM){curTr=trM[1];pending=[];continue;}
    if(/^Tranche\s*ID$/i.test(ln)){
      const prev=clean(lines[i-1]?.text||'');
      if(trancheValueRe.test(prev))curTr=prev;
      pending=[];continue;
    }
    if(stopRe.test(ln)){pending=[];continue;}
    const m=ln.match(fullRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),m[2],suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[3]),up:pN(m[4]),charges:pN(m[5]),tax:pN(m[7]),total:pN(m[8]),taxRate:pN(m[6]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    if(nextHeaderRe.test(ln))pending=[ln];
  }
  return items;
}

function parseItemsMY(lines,fileName){
  const items=[];let curInv='',curTr='';let pending=[];
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/i;
  const strictPidRe=/^(?:WBD[A-Z0-9]+|[A-Z0-9]{5,}_[A-Z0-9_]+)\b/i;
  const trancheInlineRe=/^Tranche\s*ID\s+(\S+)/i;
  const stopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Summary:|Total of Products\/Services|Total Service Tax|Total Including Tax|Invoice Number:|Sold To:|Invoice Date:|Payment by Wire:|Payment by Check\/Post To:|Reference Invoice Number:|Recurring Charge Period:|Remark:|Subject to B2B exemption|This invoice is issued|E\. & O\.E\.|page \d+ of \d+|TAX INVOICE|Registered Address:|Send Payment to:|Due Date:|Payment Term:|Billed on Statement:|Customer SST#:|Purchase Order:)/i;
  const nextHeaderRe=/^(Core Protection Platform|Singularity|Device & App Inventory|Support Plan|Microsoft 365|eTech Services|Lenovo NB|Lenovo ThinkVision|Monitor\b|Lenovo ThinkPad|Lenovo ThinkBook|Preventive Maintenance|Corrective Maintenance|Scalefusion)/i;
  const lineRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\s*(.*?)\s+([\d,]+\.?\d*)\s+RM\s*([\d,]+\.?\d*)\s+RM\s*([\d,]+\.?\d*)\s+RM\s*([\d,]+\.?\d*)$/i;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function collectSuffix(startIdx){
    const parts=[];let endIdx=startIdx;
    for(let j=startIdx+1;j<Math.min(startIdx+3,lines.length);j++){
      const nxt=clean(lines[j].text);
      if(!nxt||stopRe.test(nxt)||strictPidRe.test(nxt)||trancheInlineRe.test(nxt)||/^\d{7,12}\b/.test(nxt)||nextHeaderRe.test(nxt))break;
      parts.push(nxt);endIdx=j;
    }
    return {suffix:merge(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    const invM=ln.match(/Invoice\s*Number:\s*(\d{7,12})/i);
    if(invM){curInv=invM[1];curTr='';pending=[];continue;}
    const trM=ln.match(trancheInlineRe);
    if(trM){curTr=trM[1];pending=[];continue;}
    if(stopRe.test(ln)){pending=[];continue;}
    const m=ln.match(lineRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),m[2],suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[3]),up:pN(m[4]),charges:pN(m[5]),tax:0,total:pN(m[6]),taxRate:0,crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    if(nextHeaderRe.test(ln)) {
      pending.push(ln);
      if(pending.length>2)pending=pending.slice(-2);
    }
  }
  return items;
}

function parseItemsIN(lines,fileName){
  const items=[];let curInv='',curTr='';let pendingDesc=[];let pidParts=[];
  const stopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Billing Summary|Tax Invoice No\.|Total Statement value|Total Invoice value|Payment Term:|For Lenovo|ORIGINAL FOR RECIPIENT|Tax Invoice|PAN:|GSTIN:|Insurance:|Name: Lenovo|Place of Supply|Bill To Country|Billed on Statement:|Send Payment to:|This invoice is issued|Terms&Conditions|page \d+ of \d+|Reference Invoice Number:|Recurring Charge Period:|Sr No Part No HSN\/SAC Qty Unit Total Value|Rate Amt|IGST|CGST|SGST|Refund to be claimed)/i;
  const trancheInlineRe=/^Tranche\s*ID\s+(\S+)/i;
  const qtyRowRe=/^(\d{6})\s+([\d,]+\.?\d*)\s+([A-Z]{2})\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d.]+)%\s+([\d,]+\.?\d*)\s+([\d.]+)%\s+([\d,]+\.?\d*)\s+([\d.]+)%\s+([\d,]+\.?\d*)\s+([\d.]+)%\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)$/i;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function isPidFragment(ln){
    return /^[A-Za-z0-9_]{2,}$/.test(ln)&&/[A-Za-z]/.test(ln)&&!/\s/.test(ln)&&!/^EA$/i.test(ln);
  }
  function flushItemFromQty(ln,page){
    const m=ln.match(qtyRowRe);
    if(!m||!pidParts.length)return false;
    const qty=pN(m[2]),up=pN(m[4]),charges=pN(m[5]),tax=pN(m[7])+pN(m[9])+pN(m[11])-pN(m[13]),total=pN(m[14]);
    const pid=pidParts.join('');
    const pname=merge(pendingDesc)||pid;
    if(total>0)items.push({inv:curInv,tranche:curTr,pid,pname,qty,up,charges,tax,total,taxRate:0,crfRdf:0,srcFile:fileName,srcPage:page});
    pendingDesc=[];pidParts=[];
    return true;
  }
  for(let i=0;i<lines.length;i++){
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    const invM=ln.match(/(?:Invoice\s*No:|Invoice\s*Number:|Internal\s*Ref\.\s*No:)\s*(\d{7,12})/i);
    if(invM){curInv=invM[1];curTr='';pendingDesc=[];pidParts=[];continue;}
    const trM=ln.match(trancheInlineRe);
    if(trM){curTr=trM[1];pendingDesc=[];pidParts=[];continue;}
    if(stopRe.test(ln)){pendingDesc=[];pidParts=[];continue;}
    if(flushItemFromQty(ln,page))continue;
    if(isPidFragment(ln)){
      pidParts.push(ln);
      if(pidParts.length>4)pidParts=pidParts.slice(-4);
      continue;
    }
    if(!/^\d{6,}$/.test(ln)){
      pendingDesc.push(ln);
      if(pendingDesc.length>3)pendingDesc=pendingDesc.slice(-3);
    }
  }
  return items;
}

// AT01 parser
function parseItemsAT01(lines,fileName){
  const items=[];let curInv='',curTr='';let pending=[];
  const curSym='(?:\\u20ac|\\u00a3|\\u00e2\\u201a\\u00ac|\\u0432\\u201a\\u00ac|EUR|CHF|GBP|SEK)';
  const fullRe=new RegExp('^(WBD[A-Z0-9]+)\\s+(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$');
  const numsRe=new RegExp('^(WBD[A-Z0-9]+)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$');
  const invLabelRe=/Invoice\s*Number\s+Invoice\s*Date\s+Customer\s*Number/i;
  const trancheValueRe=/^[A-Z0-9_][A-Z0-9_\-]{8,}$/i;
  const stopTextRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Product ID Product Name|Subscription Service Detail|Tax Invoice|Invoice to name|Sold to name|References|Payable on:|Please raise your claims|Transactions relating|Place of performance|Payment Terms:|A late payment charge|Payment by Bank Transfer:|Please ask your bank|Citibank|SWIFT code:|Lenovo |This is a computer generated|Date =|page \d+ of \d+)/i;
  const languageOnlyRe=/^(German|English|USEnglish|US English|Monthly)$/i;
  function cleanPart(s){return String(s||'').replace(/\s+/g,' ').trim()}
  function mergeParts(parts){
    const out=[];
    for(const raw of parts){
      const part=cleanPart(raw);
      if(!part)continue;
      if(out.length&&out[out.length-1]===part)continue;
      out.push(part);
    }
    return out.join(' ').trim();
  }
  function isTextOnly(line){
    return line&&!stopTextRe.test(line)&&!fullRe.test(line)&&!numsRe.test(line)&&!/\d+\s+(?:EUR|CHF|GBP|SEK)\s*[\d,]/.test(line);
  }
  function collectSuffix(startIdx){
    const parts=[];let endIdx=startIdx;
    for(let j=startIdx+1;j<Math.min(startIdx+3,lines.length);j++){
      const nxt=cleanPart(lines[j].text);
      if(!isTextOnly(nxt))break;
      if(/^[A-Z0-9]{5,}_[A-Z0-9_]+$/i.test(nxt)||languageOnlyRe.test(nxt)||/^\//.test(nxt)||/(Win11|SSD|English|German|Monthly|EMMITSBURG)/i.test(nxt)){
        parts.push(nxt);
        endIdx=j;
        continue;
      }
      break;
    }
    return{suffix:mergeParts(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    const ln=cleanPart(lines[i].text);
    const page=lines[i].page;
    if(!ln)continue;
    if(invLabelRe.test(ln)){
      curTr='';pending=[];
      for(let j=i+1;j<Math.min(i+4,lines.length);j++){
        const pm=cleanPart(lines[j].text).match(/^(\d{7,12})\b/);
        if(pm){curInv=pm[1];break}
      }
      continue;
    }
    if(/^Tranche\s*ID$/i.test(ln)){
      curTr='';pending=[];
      for(let j=i-1;j>=Math.max(0,i-2);j--){
        const prev=cleanPart(lines[j].text);
        if(trancheValueRe.test(prev)){curTr=prev;break}
      }
      continue;
    }
    if(stopTextRe.test(ln)){pending=[];continue}
    let m=ln.match(fullRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=mergeParts([pending.join(' '),m[2],suffixInfo.suffix])||m[1];
      const qty=pN(m[3]),up=pN(m[4]),ch=pN(m[5]),rate=pN(m[6]),tax=pN(m[7]),tot=pN(m[8]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    m=ln.match(numsRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=mergeParts([pending.join(' '),suffixInfo.suffix])||m[1];
      const qty=pN(m[2]),up=pN(m[3]),ch=pN(m[4]),rate=pN(m[5]),tax=pN(m[6]),tot=pN(m[7]);
      if(tot>0)items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty,up,charges:ch,tax,total:tot,taxRate:rate,crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    if(isTextOnly(ln)){
      pending.push(ln);
      if(pending.length>1)pending=pending.slice(-1);
    }
  }
  return items;
}

function parseItemsNL01(lines,fileName){
  const items=[];let curInv='',curTr='';let pending=[];
  const curSym='(?:\\u20ac|EUR)';
  const pidRe=/^(WBD[A-Z0-9]+)\b/i;
  const fullRe=new RegExp('^(WBD[A-Z0-9]+)\\s+(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$','i');
  const numsRe=new RegExp('^(WBD[A-Z0-9]+)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$','i');
  const trancheRe=/^\d{7,}_[A-Z]{2}_[A-Z0-9_]+$/i;
  const stopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Product ID Product Name|Subscription Service Detail|Invoice Number|Invoice to name|Sold to name|References|Payable on:|Please raise your claims|Transactions relating|Lenovo |This is a computer generated|Date =|page \d+ of \d+)/i;
  const suffixRe=/^[-(]|English|Dutch|German|Monthly|Euro|Dock|Monitor|KB/i;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function collectSuffix(startIdx){
    const parts=[];let endIdx=startIdx;
    for(let j=startIdx+1;j<Math.min(startIdx+3,lines.length);j++){
      const nxt=clean(lines[j].text);
      if(!nxt||stopRe.test(nxt)||pidRe.test(nxt)||trancheRe.test(nxt)||/^\d{7,12}\b/.test(nxt))break;
      if(suffixRe.test(nxt)){parts.push(nxt);endIdx=j;continue;}
      break;
    }
    return{suffix:merge(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    if(/^Invoice\s*Number\s+Invoice\s*Date\s+Customer\s*Number/i.test(ln)){
      pending=[];curTr='';
      for(let j=i+1;j<Math.min(i+4,lines.length);j++){
        const m=clean(lines[j].text).match(/^(\d{7,12})\b/);
        if(m){curInv=m[1];break;}
      }
      continue;
    }
    if(/^Tranche\s*ID\s+(\S+)/i.test(ln)){
      const m=ln.match(/^Tranche\s*ID\s+(\S+)/i);
      curTr=m[1];pending=[];continue;
    }
    if(/^Tranche\s*ID$/i.test(ln)){
      curTr='';pending=[];
      const prev=clean(lines[i-1]?.text||'');
      const next=clean(lines[i+1]?.text||'');
      if(trancheRe.test(prev))curTr=prev;
      else if(trancheRe.test(next)){curTr=next;i++;}
      continue;
    }
    if(stopRe.test(ln)){pending=[];continue;}
    let m=ln.match(fullRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),m[2],suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[3]),up:pN(m[4]),charges:pN(m[5]),tax:pN(m[7]),total:pN(m[8]),taxRate:pN(m[6]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    m=ln.match(numsRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:pN(m[6]),total:pN(m[7]),taxRate:pN(m[5]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    if(!trancheRe.test(ln)&&!/\b\d+\s+(?:\u20ac|EUR)\s*[\d,]/.test(ln)) {
      pending=[ln];
    }
  }
  return items;
}

function parseItemsNL11(lines,fileName){
  const items=[];let curInv='',curTr='';let pending=[];
  const curSym='(?:\\u20ac|EUR)';
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/i;
  const strictPidRe=/^(?:WBD[A-Z0-9]+|[A-Z0-9]{5,}_[A-Z0-9_]+)\b/i;
  const fullRe=new RegExp('^([A-Za-z0-9][A-Za-z0-9_]{4,})\\s+(.+?)\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$','i');
  const numsRe=new RegExp('^([A-Za-z0-9][A-Za-z0-9_]{4,})\\s+([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+([\\d.]+)\\s*%\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)\\s+'+curSym+'\\s*([\\d,]+\\.?\\d*)$','i');
  const trancheRe=/^\d{7,}_[A-Z]{2}_[A-Z0-9_]+$/i;
  const stopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Product ID Product Name|Invoice to name|Sold to name|References|Payable on:|Please raise your claims|Transactions relating|Lenovo |This is a computer generated|Date =|page \d+ of \d+)/i;
  const nextHeaderRe=/^(Bundle\b|ThinkPad\b|ThinkCentre\b|ThinkCenter\b|Desktop\b|Workstation\b|NB\b)/i;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function collectSuffix(startIdx){
    const parts=[];let endIdx=startIdx;
    for(let j=startIdx+1;j<Math.min(startIdx+3,lines.length);j++){
      const nxt=clean(lines[j].text);
      if(!nxt||stopRe.test(nxt)||strictPidRe.test(nxt)||trancheRe.test(nxt)||/^\d{7,12}\b/.test(nxt)||nextHeaderRe.test(nxt))break;
      parts.push(nxt);endIdx=j;
    }
    return{suffix:merge(parts),endIdx};
  }
  for(let i=0;i<lines.length;i++){
    const ln=clean(lines[i].text),page=lines[i].page;
    if(!ln)continue;
    if(/^Invoice\s*Number\s+Invoice\s*Date\s+Customer\s*Number/i.test(ln)){
      pending=[];curTr='';
      for(let j=i+1;j<Math.min(i+4,lines.length);j++){
        const m=clean(lines[j].text).match(/^(\d{7,12})\b/);
        if(m){curInv=m[1];break;}
      }
      continue;
    }
    if(/^Tranche\s*ID$/i.test(ln)){
      pending=[];
      const prev=clean(lines[i-1]?.text||'');
      const next=clean(lines[i+1]?.text||'');
      curTr=trancheRe.test(prev)?prev:(trancheRe.test(next)?next:'');
      if(trancheRe.test(next))i++;
      continue;
    }
    if(stopRe.test(ln)){pending=[];continue;}
    let m=ln.match(fullRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),m[2],suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[3]),up:pN(m[4]),charges:pN(m[5]),tax:pN(m[7]),total:pN(m[8]),taxRate:pN(m[6]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    m=ln.match(numsRe);
    if(m){
      const suffixInfo=collectSuffix(i);
      const pname=merge([pending.join(' '),suffixInfo.suffix])||m[1];
      items.push({inv:curInv,tranche:curTr,pid:m[1],pname,qty:pN(m[2]),up:pN(m[3]),charges:pN(m[4]),tax:pN(m[6]),total:pN(m[7]),taxRate:pN(m[5]),crfRdf:0,srcFile:fileName,srcPage:page});
      pending=[];i=suffixInfo.endIdx;continue;
    }
    if(!trancheRe.test(ln)&&!/\b\d+\s+(?:\u20ac|EUR)\s*[\d,]/.test(ln))pending=[ln];
  }
  return items;
}

function parseItemsGen(lines,fileName,knownInvs,country){
  const items=[];let curInv='',curTr='';
  // TH PDFs contain repeated copies; only parse ORIGINAL COPY pages.
  const skipPages=new Set();
  if(country==='TH')for(const{text:ln,page}of lines){if(/CUSTOMER\s+COPY|BILLING\s+COPY/i.test(ln))skipPages.add(page);}
  // General product ID: WBD... or alphanumeric+underscore
  const pidRe=/^([A-Za-z0-9][A-Za-z0-9_]{4,})\b/;
  const strictPidRe=/^(?:WBD[A-Z0-9]+|[A-Z0-9]{5,}_[A-Z0-9_]+)\b/i;
  const sectRe=/Tranche\s*ID|Invoice\s*Number|Sub[\s-]*Total|Grand[\s-]*Total|Product\s*ID/i;
  // Currency patterns support $, RM, or no symbol.
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
  const detailStopRe=/^(Sub[\s-]*Total|Grand[\s-]*Total|Summary:|Product ID Product Name|Subscription Service Detail|Invoice Number:|Invoice Date:|Sold To:|Bill To:|Ship To:|Payment Term:|Due Date:|Billed on Statement:|Reference Invoice Number:|Recurring Charge Period:|For questions about your invoice|Tel:|Email:|page \d+ of \d+|TAX INVOICE)/i;
  function clean(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function merge(parts){
    const out=[];
    for(const raw of parts){
      const p=clean(raw);
      if(!p)continue;
      if(out.length&&out[out.length-1]===p)continue;
      out.push(p);
    }
    return out.join(' ').trim();
  }
  function collectNoNamePrefix(startIdx){
    const parts=[];
    for(let j=startIdx-1;j>=Math.max(0,startIdx-2);j--){
      const prev=clean(lines[j].text);
      if(!prev)continue;
      if(/^\d/.test(prev))continue;
      if(detailStopRe.test(prev)||sectRe.test(prev)||strictPidRe.test(prev)||/\d+\s*%\s*$/.test(prev)||/^\d[\d,.\s$RM%-]*$/.test(prev))break;
      parts.unshift(prev);
    }
    return parts;
  }
  function collectNoNameSuffix(startIdx){
    const parts=[];
    for(let j=startIdx+1;j<=Math.min(lines.length-1,startIdx+2);j++){
      const next=clean(lines[j].text);
      if(!next)continue;
      if(detailStopRe.test(next)||sectRe.test(next)||strictPidRe.test(next)||/^\d{7,12}\b/.test(next)||/^\$/.test(next)||/^[\d,.\s$RM%-]+$/.test(next))break;
      if(!/^\d/.test(next))break;
      parts.push(next);
    }
    return parts;
  }
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
    if(m&&pN(m[6])>0){
      const pname=merge([...collectNoNamePrefix(i),...collectNoNameSuffix(i)]);
      items.push({inv:curInv,tranche:curTr,pid,pname,qty:pN(m[1]),up:pN(m[2]),charges:pN(m[3]),tax:pN(m[5]),total:pN(m[6]),taxRate:pN(m[4]),crfRdf:0,srcFile:fileName,srcPage:page});continue;
    }
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

function backfillLineItemTranches(items){
  const lastByInvoice=new Map();
  for(const item of items){
    const inv=String(item.inv||'').trim();
    const tranche=String(item.tranche||'').trim();
    if(inv&&tranche){
      lastByInvoice.set(inv,tranche);
      continue;
    }
    if(!tranche&&inv&&lastByInvoice.has(inv)){
      item.tranche=lastByInvoice.get(inv);
    }
  }
  return items;
}

// Parser router
function parseItems(country,lines,fileName,knownInvs){
  if(/^AT01_STMT_BRIM_STATEMENT_/i.test(fileName))return parseItemsAT01(lines,fileName);
  if(/^GB11_STMT_BRIM_STATEMENT_/i.test(fileName))return parseItemsGB11(lines,fileName);
  if(/^NL01_STMT_BRIM_STATEMENT_/i.test(fileName))return parseItemsNL01(lines,fileName);
  if(/^NL11_STMT_BRIM_STATEMENT_/i.test(fileName))return parseItemsNL11(lines,fileName);
  if(country==='TH')return parseItemsTH(lines,fileName);
  if(country==='MY')return parseItemsMY(lines,fileName);
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

// Full statement parse
function parseStatement(lines,fileName){
  const fullText=lines.map(l=>l.text).join('\n');
  const country=detectCountry(fullText,fileName);
  const cur=(CM[country]||CM.OTHER).cur;
  const hd=parseHeader(lines);
  let bs=parseBillingSummary(fullText,lines,fileName,country);
  let bsDerived=false;
  const knownInvs=new Set(bs.map(r=>r.inv).filter(Boolean));
  const li=backfillLineItemTranches(parseItems(country,lines,fileName,knownInvs));  // Detail totals per invoice
  for(const item of li)Object.assign(item,computeLinePriceAudit(item,cur));
  const trancheSummary=buildTrancheSummary(li);
  const priceGapIssues=li.filter(item=>item.priceGapAnomaly);
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
  if(priceGapIssues.length){
    const detail=priceGapIssues.slice(0,6).map(item=>`${item.inv}/${item.pid}: ${fc(item.priceGap,cur)}`).join(' | ');
    vr.push({nm:`Detail price gap anomalies (${priceGapIssues.length})`,p:false,sv:'f',dt:detail});
  }
  const nwAll=li.filter(l=>!/^WBD/i.test(l.pid));
  if(nwAll.length){const byInv={};for(const l of nwAll){if(!byInv[l.inv])byInv[l.inv]=[];byInv[l.inv].push(l.pid)}
    const det=Object.entries(byInv).map(([inv,pids])=>`${inv}: ${pids.join(', ')}`).join(' | ');
    vr.push({nm:`${nwAll.length} non-WBD product(s)`,p:false,sv:'w',dt:det})}

  return{fileName,country,cur,hd,bs,li,trancheSummary,priceGapIssues,sT,dt,dGT,comp,unmS,unmD,vr};
}
