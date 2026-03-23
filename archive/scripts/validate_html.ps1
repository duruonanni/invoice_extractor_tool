param(
  [string]$HtmlPath = ""
)

$ErrorActionPreference = "Stop"

if (-not $HtmlPath) {
  $repoRoot = Split-Path -Parent $PSScriptRoot
  $HtmlPath = Join-Path $repoRoot "lenovo_invoice_validator.html"
}

if (-not (Test-Path $HtmlPath)) {
  Write-Error "HTML not found: $HtmlPath"
  exit 1
}

$html = Get-Content -Raw -Encoding UTF8 $HtmlPath

# Extract inline <script> blocks (exclude <script src="...">)
$regex = [regex]::new("(?is)<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>")
$matches = $regex.Matches($html)

if ($matches.Count -eq 0) {
  Write-Error "No inline <script> blocks found in HTML."
  exit 1
}

$js = ($matches | ForEach-Object { $_.Groups[1].Value }) -join "`n"
$tmp = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "lenovo_invoice_validator_inline.js")

[System.IO.File]::WriteAllText($tmp, $js, (New-Object System.Text.UTF8Encoding($false)))

try {
  & node --check $tmp | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Error "JavaScript syntax check failed."
    exit 1
  }
} finally {
  Remove-Item -Force $tmp -ErrorAction SilentlyContinue | Out-Null
}

Write-Host "HTML inline script syntax OK."
