# Regression Report - 2026-03-18 (v3.12.4)

Test: `COMPREHENSIVE TEST v3.12.1` on `Input/Approved_Preview_Invoice` (41 PDFs)

Summary
- PASS: 39
- FAIL: 2
- Total: 41

Failures
1. NL11_STMT_BRIM_STATEMENT_EPRENLP0000515_EN.PDF [NL]
   - NO_BS
   - NO_LI

2. PT01_STMT_BRIM_STATEMENT_EPREPTP0000122_EN.PDF [PT]
   - NO_BS
   - NO_LI

Notes
- IN03 PDFs now pass after subtotal dedupe logic.
- pdf.js emitted repeated warnings about `standardFontDataUrl` not being provided during extraction.

