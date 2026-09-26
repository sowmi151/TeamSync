@echo off
title TeamSync Collegiate Platform
echo ========================================================
echo   TeamSync - Collegiate Team Matching Platform
echo ========================================================
echo.

node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js is not found on your system!
  echo Please download and install Node.js (v18+) from https://nodejs.org/
  pause
  exit /b 1
)

IF NOT EXIST node_modules (
  echo [1/2] Installing dependencies (first run only)...
  call npm install
  IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install encountered an error.
    pause
    exit /b 1
  )
) ELSE (
  echo [1/2] Dependencies found in node_modules.
)

echo.
echo [2/2] Launching TeamSync development server...
echo --------------------------------------------------------
echo Application URL: http://localhost:3000
echo --------------------------------------------------------
echo.
call npm run dev
pause
