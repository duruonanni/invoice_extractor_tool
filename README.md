# Codex Invoice Extractor Tool

Single-file HTML tool for validating Lenovo invoice PDFs locally in the browser.

## Project Layout

- `src/`: source of truth for the shipped tool
- `src/core/`: PDF loading, header parsing, country detection, shared utilities
- `src/parsers/`: invoice parsing logic by region/layout
- `src/ui/`: file input, rendering, export, interactions
- `scripts/`: active day-to-day project scripts
- `tests/`: regression runner, fixture definitions, test notes
- `release/`: generated deliverable
- `docs/`: user manual and manual assets
- `archive/`: legacy or one-off scripts kept for reference, not part of the main workflow

## Daily Commands

```bash
npm run build
npm run regression
node --check src/core/core.js
node --check src/parsers/parsers.js
node --check src/ui/ui.js
```

## Build Output

`npm run build` generates:

- `release/lenovo_invoice_validator.html`: primary release artifact
- `lenovo_invoice_validator.html`: compatibility copy kept for existing local/manual workflows

## Testing

Regression fixtures are defined in `tests/fixtures.json`.

The repository does not currently include the approved PDF samples, so `npm run regression` requires the fixture PDFs to exist locally at the path expected by `tests/fixtures.json`.

See `tests/README.md` for the sample-data convention.

## Notes

- Keep parser changes small and regression-driven.
- Treat files under `archive/` as historical utilities unless they are deliberately promoted back into the active workflow.
