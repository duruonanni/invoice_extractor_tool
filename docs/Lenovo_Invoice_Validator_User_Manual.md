# Lenovo DaaS Invoice Validator
User Manual (Quick Guide)

Version: v3.12.3  
Last updated: 2026-03-18

---

## Purpose
This tool validates Lenovo DaaS invoice PDFs by comparing:
- Billing Summary totals
- Detail line item totals
- Per‑invoice consistency checks (missing items, mismatched totals, invalid formats)

It runs locally in your browser and does not upload files to any server.

---

## Requirements
- A modern browser (Chrome or Edge recommended)
- The file `lenovo_invoice_validator.html`
- One or more Lenovo invoice PDFs

---

## 1) Open the Tool
Double‑click `lenovo_invoice_validator.html` to open it in your browser.

Screenshot 1: Tool landing page  
`[screenshot: step01_open.png]`

---

## 2) Select PDF Files
Click **Choose Files** (or **Browse**) and select one or more invoice PDFs.

You can validate:
- A single invoice PDF
- A batch of PDFs (multi‑select)

Screenshot 2: File selection area  
`[screenshot: step02_select.png]`

---

## 3) Run Validation
After selection, the tool parses the PDFs automatically.

Check the result panels:
- **Billing Summary** (summary totals)
- **Detail Items** (line‑item totals)
- **Validation Messages** (errors/warnings)

Screenshot 3: Results + validation area  
`[screenshot: step03_results.png]`

---

## 4) Interpret Results
Common validation outcomes:
- **OK**: Summary and detail totals match
- **Summary‑only**: Invoice number appears in summary but no detail page found
- **Missing Summary**: Detail lines exist but summary section not found
- **Unreadable/Unsupported**: PDF content could not be extracted

If any invoice is flagged, review the PDF content and verify whether the detail pages exist.

---

## 5) Troubleshooting
If you see **Unreadable/Unsupported**:
- The PDF may be scanned or image‑only
- Try re‑exporting the PDF from the source system

If you see **Summary‑only**:
- The Billing Summary contains invoices with missing detail pages
- Confirm with the issuer whether the PDF is complete

If totals do not match:
- Check for CRF/RDF adjustments or tax exclusions
- Verify currency format and locale

---

## Tips for Large PDFs
- Allow extra time for parsing
- Keep the browser tab active
- If you see incomplete results, re‑run the validation

---

## Support
If you need help, provide:
- The PDF filename(s)
- The exact validation message(s)
- A screenshot of the result panel

