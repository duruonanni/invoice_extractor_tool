import fs from 'fs';
import path from 'path';
const root='C:/Users/kate_/Documents/Codex_WorkStation/codex_invoice_extractor_tool';
const htmlPath=path.join(root,'release','lenovo_invoice_validator.html');
const scriptRawPath=path.join(root,'src_script_raw.js');
const raw=fs.readFileSync(scriptRawPath,'utf8');
const idxBilling=raw.indexOf('function parseBillingSummary');
const idxFileMgmt=raw.indexOf('// FILE MANAGEMENT');
if(idxBilling<0||idxFileMgmt<0) throw new Error('markers not found');
const core=raw.slice(0,idxBilling).trim();
const parsers=raw.slice(idxBilling,idxFileMgmt).trim();
const ui=raw.slice(idxFileMgmt).trim();
fs.writeFileSync(path.join(root,'src','core','core.js'),core+'\n','utf8');
fs.writeFileSync(path.join(root,'src','parsers','parsers.js'),parsers+'\n','utf8');
fs.writeFileSync(path.join(root,'src','ui','ui.js'),ui+'\n','utf8');
// template
const html=fs.readFileSync(htmlPath,'utf8');
const tpl=html.replace(/<script>[\s\S]*?<\/script>/,'<script>/*__SCRIPT__*/</script>');
fs.writeFileSync(path.join(root,'src','index.template.html'),tpl,'utf8');
