# Test Notes

## Files

- `regression.mjs`: local regression runner
- `fixtures.json`: list of approved sample PDFs and minimum expectations

## Sample PDFs

This repository does not currently store the full approved invoice PDF set.

The regression runner looks for sample PDFs in this order:

1. `INVOICE_SAMPLE_DIR`
2. `/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview`
3. The legacy relative path from `fixtures.json`

Recommended local location:

```text
/Users/duruo/WorkStation/Attachments/invoice-regression/Approved_Preview
```

## Usage

```bash
npm run regression
```

Or override the sample directory explicitly:

```bash
INVOICE_SAMPLE_DIR="/absolute/path/to/Approved_Preview" npm run regression
```

If the PDFs are missing, the runner will report `MISSING` entries and exit non-zero.
