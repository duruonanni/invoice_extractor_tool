# Night Regression - 2026-03-18

## Scope
- Restored result-page interaction structure in `src/ui/ui.js`
- Reintroduced hierarchy/country/customer tabs
- Reintroduced detail filtering by invoice id
- Cleaned visible validation text corruption in AT01 path
- Fixed EMEA duplicate detail ingestion that caused AT01 mismatches
- Added AT01 targeted regression gate

## Release Output
- `release/lenovo_invoice_validator.html`
- `lenovo_invoice_validator.html`

## Targeted AT01 Result
- File: `AT01_STMT_BRIM_STATEMENT_EPREATP0000192_EN.PDF`
- Statement: `EPREATP0000192`
- Customer Number: `1217516969`
- Invoices: `31`
- Line Items: `100`
- Failed Checks: `0`
- Mismatches: `0`
- First Tranche: `1217516969_AT_202412_M_48_006`
- First Product Name: `ThinkPad P16s Gen2 16 i7/32GB-US`

## Broader Smoke Regression
- AT: PASS
- JP: PASS
- US: PASS
- CH: PASS
- KR: PASS

## Known Remaining Work
- UI is substantially restored, but still needs visual comparison against the older full version
- Some source comments/legacy strings still contain mojibake in non-user-facing areas
- Need a browser-level confirmation pass after local browser automation is available
- Next priority after AT01: NL11
