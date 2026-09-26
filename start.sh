#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  TeamSync - Collegiate Team Matching Platform"
echo "========================================================"

if ! command -v node &> /dev/null; then
  echo "[ERROR] Node.js is not installed. Please install Node.js (v18+) from https://nodejs.org/"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "[1/2] Installing dependencies with npm install..."
  npm install
else
  echo "[1/2] Dependencies already installed in node_modules."
fi

echo ""
echo "[2/2] Launching TeamSync development server..."
echo "--------------------------------------------------------"
echo "Application URL: http://localhost:3000"
echo "--------------------------------------------------------"
echo ""

npm run dev
