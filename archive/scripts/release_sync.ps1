param(
  [string]$ReleaseDir = "C:\OD\OneDrive - Lenovo\All Spark Program - EaaS Value Realization\Onboarding\LOT\DT_Data_Migration\All_In_AI_Projects\Claude_invoice_extractor_tool\Releases"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-VersionFromFile([string]$path) {
  if (-not (Test-Path $path)) { return "" }
  $txt = Get-Content -Raw -Encoding UTF8 $path
  $m = [regex]::Match($txt, "const VERSION='([0-9.]+)';")
  if ($m.Success) { return $m.Groups[1].Value }
  return ""
}

$src = Join-Path $PSScriptRoot "..\lenovo_invoice_validator.html" | Resolve-Path
$historyDir = Join-Path $ReleaseDir "History"
$latest = Join-Path $ReleaseDir "lenovo_invoice_validator_latest.html"

if (-not (Test-Path $ReleaseDir)) { throw "ReleaseDir not found: $ReleaseDir" }
if (-not (Test-Path $historyDir)) { New-Item -ItemType Directory -Path $historyDir | Out-Null }

$today = Get-Date -Format "yyyyMMdd"

if (Test-Path $latest) {
  $oldVer = Get-VersionFromFile $latest
  if (-not $oldVer) { $oldVer = $today }
  $base = "lenovo_invoice_validator_{0}_{1}.html" -f $oldVer, $today
  $dest = Join-Path $historyDir $base
  $n = 1
  while (Test-Path $dest) {
    $dest = Join-Path $historyDir ("lenovo_invoice_validator_{0}_{1}_{2}.html" -f $oldVer, $today, $n)
    $n++
  }
  Move-Item -Path $latest -Destination $dest
}

Copy-Item -Path $src -Destination $latest -Force

Write-Host "Release synced:"
Write-Host "  Source : $src"
Write-Host "  Latest : $latest"
Write-Host "  History: $historyDir"
