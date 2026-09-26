#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  TeamSync - Collegiate Intelligent Team Matching"
echo "  Python Web Application"
echo "========================================================"

if command -v python3 &> /dev/null; then
  PY_CMD=python3
elif command -v python &> /dev/null; then
  PY_CMD=python
else
  echo "[ERROR] Python 3 is not installed. Please install Python from https://www.python.org/"
  exit 1
fi

echo "[OK] Found $($PY_CMD --version)"
echo "Starting Python Web Server on http://localhost:3000..."
echo ""

$PY_CMD app.py
