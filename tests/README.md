# Test Notes

## Files

- `regression.mjs`: local regression runner
- `fixtures.json`: list of approved sample PDFs and minimum expectations

## Sample PDFs

This repository does not currently store the full approved invoice PDF set.

To run regression locally, place the sample PDFs under the directory referenced by `fixtures.json`:

```text
Input/Approved_Preview_Invoice/
```

The runner resolves that path relative to the repository root.

## Usage

```bash
npm run regression
```

If the PDFs are missing, the runner will report `MISSING` entries and exit non-zero.
