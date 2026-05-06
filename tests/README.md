# Test Notes

## Files

- `regression.mjs`: local regression runner
- `fixtures.json`: list of approved sample PDFs and minimum expectations

## Sample PDFs

This repository does not currently store the full approved invoice PDF set.

The regression runner looks for sample PDFs in this order:

1. `INVOICE_SAMPLE_DIR`
2. `<Studio>/03_WORK/Attachments/invoice-regression/Approved_Preview` (resolved relative to this project)
3. Legacy Mac `.../WorkStation/Attachments/invoice-regression/Approved_Preview` if present
4. The legacy relative path from `fixtures.json`

Recommended local location:

```text
<Studio workspace root>/03_WORK/Attachments/invoice-regression/Approved_Preview
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
