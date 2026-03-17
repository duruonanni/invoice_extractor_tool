@echo off
setlocal

REM Validate inline JS syntax inside the HTML before commit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0..\scripts\validate_html.ps1"
if errorlevel 1 (
  echo.
  echo Pre-commit check failed. Fix HTML/JS errors before committing.
  exit /b 1
)

exit /b 0
