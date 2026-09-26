@echo off
title TeamSync Python Web Application
echo ========================================================
echo   TeamSync - Collegiate Intelligent Team Matching
echo   Python Web Application (No npm or Node.js required!)
echo ========================================================
echo.

REM Try 'python', 'py', or 'python3'
python --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  set PY_CMD=python
  goto :RUN_PY
)

py --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  set PY_CMD=py
  goto :RUN_PY
)

python3 --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  set PY_CMD=python3
  goto :RUN_PY
)

echo [ERROR] Python is not installed or not in your system PATH!
echo Please download and install Python 3.10+ from https://www.python.org/
echo (Check the box "Add Python to PATH" during installation)
echo.
pause
exit /b 1

:RUN_PY
echo [OK] Found Python:
%PY_CMD% --version
echo.
echo Launching TeamSync Python Web Server on port 3000...
echo --------------------------------------------------------
echo Local Web App: http://localhost:3000
echo SQLite DB:     teamsync.db (52 Collegiate Accounts)
echo --------------------------------------------------------
echo Press Ctrl+C anytime to stop the server.
echo.

%PY_CMD% app.py
pause
