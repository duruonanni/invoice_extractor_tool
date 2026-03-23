@echo off
setlocal

REM Validate active source files before commit
node "%~dp0..\scripts\check.mjs"
if errorlevel 1 (
  echo.
  echo Pre-commit check failed. Fix syntax errors before committing.
  exit /b 1
)

exit /b 0
