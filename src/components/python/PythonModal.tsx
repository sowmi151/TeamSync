import React, { useState } from "react";
import {
  Code,
  Download,
  Terminal,
  Database,
  Check,
  Copy,
  X,
  FileCode,
  Play,
  Layers,
  Sparkles,
  Server,
} from "lucide-react";

interface PythonModalProps {
  onClose: () => void;
  onOpenDownloadZip: () => void;
}

export const PythonModal: React.FC<PythonModalProps> = ({
  onClose,
  onOpenDownloadZip,
}) => {
  const [activeTab, setActiveTab] = useState<
    "app" | "algorithm" | "database" | "flask" | "test"
  >("app");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const APP_PY_SNIPPET = `"""
TeamSync — Collegiate Intelligent Team Matching Platform
Python 3 Full-Stack Web Application Server (Zero External Dependencies)
Runs with standard Python: python app.py
"""
import sys, os, json, mimetypes, urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import database, matching_algorithm

PORT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else int(os.environ.get("PORT", 3000))
BASE_DIR = Path(__file__).parent.resolve()
DIST_DIR = BASE_DIR / "dist"

class TeamSyncHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_json(200, {"status": "healthy", "engine": "Python 3.10+ (Standard Library)", "database": database.get_stats()})
            return
        elif parsed.path == "/api/students":
            students = database.get_students()
            self.send_json(200, {"count": len(students), "data": students})
            return
        elif parsed.path == "/api/universities":
            self.send_json(200, database.get_universities())
            return
        # Serves React SPA & Static Assets
        target_file = DIST_DIR / parsed.path.lstrip("/")
        if target_file.is_file():
            self.send_file_stream(target_file)
            return
        self.send_file_stream(DIST_DIR / "index.html", mime_type="text/html; charset=utf-8")

if __name__ == "__main__":
    database.init_database()
    print("TeamSync Python Server running on http://localhost:" + str(PORT))
    httpd = HTTPServer(("0.0.0.0", PORT), TeamSyncHandler)
    httpd.serve_forever()`;

  const ALGORITHM_PY_SNIPPET = `"""
TeamSync — Multi-Factor Deterministic Team Matching Algorithm
Pure Python 3 Implementation
"""
BASE_WEIGHTS = {
    "skill": 0.40,
    "complementary": 0.20,
    "role": 0.15,
    "interest": 0.10,
    "availability": 0.10,
    "experience": 0.05
}

def calculate_student_match(student_a, student_b):
    # Evaluates technical skills, complementary synergy, roles, interests, schedule
    # Re-normalizes factor weights dynamically when incomplete profile data is encountered
    ...
    return {
        "overallScore": overall_score,
        "confidenceScore": confidence_score,
        "factors": factors,
        "strengths": strengths
    }`;

  const DATABASE_PY_SNIPPET = `"""
TeamSync — Python SQLite Database Layer
Stores and queries all 52 verified student accounts in teamsync.db
"""
import sqlite3, json, hashlib

def init_database():
    conn = sqlite3.connect("teamsync.db")
    # Creates universities, students, projects tables
    # Seeds all 52 accounts with academic profiles, skills, and contact links
    ...

def get_students(query=None, university_id=None, role=None, skill=None):
    # Returns filtered collegiate student accounts
    ...`;

  const FLASK_PY_SNIPPET = `"""
TeamSync — Flask Edition (Alternative to zero-dependency app.py)
pip install flask
"""
from flask import Flask, request, jsonify, send_from_directory
import database, matching_algorithm

app = Flask(__name__, static_folder="dist/assets")
database.init_database()

@app.route("/api/students", methods=["GET"])
def students():
    return jsonify({"data": database.get_students()})

@app.route("/api/match", methods=["POST"])
def match():
    payload = request.get_json()
    return jsonify(matching_algorithm.calculate_student_match(payload["studentA"], payload["studentB"]))

if __name__ == "__main__":
    app.run(port=3000)`;

  const TEST_PY_SNIPPET = `"""
Unit Tests for Python Matching Algorithm and SQLite Database
Run via: python test_algorithm.py
"""
import unittest
import matching_algorithm as ma
import database

class TestTeamSyncMatching(unittest.TestCase):
    def test_database_loaded_52_accounts(self):
        stats = database.get_stats()
        self.assertEqual(stats["totalAccounts"], 52)
        self.assertEqual(stats["universitiesCount"], 14)

    def test_perfect_complementary_matching(self):
        # Frontend + Backend synergy verification
        ...`;

  const getActiveCode = () => {
    switch (activeTab) {
      case "app":
        return APP_PY_SNIPPET;
      case "algorithm":
        return ALGORITHM_PY_SNIPPET;
      case "database":
        return DATABASE_PY_SNIPPET;
      case "flask":
        return FLASK_PY_SNIPPET;
      case "test":
        return TEST_PY_SNIPPET;
    }
  };

  const getFileName = () => {
    switch (activeTab) {
      case "app":
        return "app.py (Zero-dependency Web Server)";
      case "algorithm":
        return "matching_algorithm.py (Core AI Engine)";
      case "database":
        return "database.py (SQLite 3 Layer)";
      case "flask":
        return "flask_app.py (Flask Edition)";
      case "test":
        return "test_algorithm.py (Unit Test Suite)";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#121217] border border-white/[0.14] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/8 bg-[#0E0E13]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D321F] to-[#1E1910] border border-[#E5C07B]/40 flex items-center justify-center shadow-inner">
              <span className="text-xl">🐍</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
                  Python Web Application Build
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  Zero npm Required
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Run the entire web application and SQLite database with standard
                Python.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Quick Launch Card */}
          <div className="p-4 rounded-xl bg-linear-to-r from-[#171720] to-[#121219] border border-[#E5C07B]/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#E5C07B] font-bold text-sm">
                <Play className="w-4 h-4 fill-current text-[#E5C07B]" />
                <span>How to Run using Python:</span>
              </div>
              <span className="text-[11px] text-[#A1A1AA]">
                Windows, Mac, Linux
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0A0A0E] border border-emerald-500/30 space-y-1">
                <div className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Windows (1-Click Launch)</span>
                </div>
                <div className="text-[11px] text-[#FAF7F2] font-mono">
                  Double-click{" "}
                  <strong className="text-emerald-300">start_python.bat</strong>
                </div>
                <div className="text-[10px] text-[#71717A]">
                  Auto-detects Python and starts the server on port 3000.
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0A0E] border border-amber-500/30 space-y-1">
                <div className="text-[#E5C07B] font-semibold text-xs flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Terminal / Git Bash</span>
                </div>
                <div className="text-[11px] text-[#FAF7F2] font-mono">
                  <code className="text-[#FAF7F2]">python app.py</code>
                </div>
                <div className="text-[10px] text-[#71717A]">
                  Runs with standard library. No pip install needed!
                </div>
              </div>
            </div>
          </div>

          {/* Architecture Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0E0E12] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <Server className="w-4 h-4" />
                <span>Web Server (app.py)</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Zero external dependencies. Serves the full web UI and handles
                REST APIs (`/api/students`, `/api/match`).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E0E12] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-[#E5C07B] font-semibold text-xs">
                <Database className="w-4 h-4" />
                <span>SQLite (teamsync.db)</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Pre-loaded with 52 verified student profiles across 14 top
                universities, skills, and project data.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E0E12] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI Matching Engine</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Pure Python multi-factor scoring (0–100) with dynamic
                missing-data weight redistribution.
              </p>
            </div>
          </div>

          {/* Code Viewer Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#FAF7F2]">
                Python Source Code Files:
              </span>
              <span className="text-[11px] text-[#71717A]">
                {getFileName()}
              </span>
            </div>

            {/* File Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-white/8 pb-2">
              <button
                onClick={() => setActiveTab("app")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "app"
                    ? "bg-[#2B2317] text-[#E5C07B] border border-[#E5C07B]/40"
                    : "bg-[#14141B] text-[#A1A1AA] hover:text-[#FAF7F2]"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>app.py</span>
              </button>
              <button
                onClick={() => setActiveTab("algorithm")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "algorithm"
                    ? "bg-[#2B2317] text-[#E5C07B] border border-[#E5C07B]/40"
                    : "bg-[#14141B] text-[#A1A1AA] hover:text-[#FAF7F2]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>matching_algorithm.py</span>
              </button>
              <button
                onClick={() => setActiveTab("database")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "database"
                    ? "bg-[#2B2317] text-[#E5C07B] border border-[#E5C07B]/40"
                    : "bg-[#14141B] text-[#A1A1AA] hover:text-[#FAF7F2]"
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>database.py</span>
              </button>
              <button
                onClick={() => setActiveTab("test")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "test"
                    ? "bg-[#2B2317] text-[#E5C07B] border border-[#E5C07B]/40"
                    : "bg-[#14141B] text-[#A1A1AA] hover:text-[#FAF7F2]"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>test_algorithm.py</span>
              </button>
              <button
                onClick={() => setActiveTab("flask")}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "flask"
                    ? "bg-[#2B2317] text-[#E5C07B] border border-[#E5C07B]/40"
                    : "bg-[#14141B] text-[#A1A1AA] hover:text-[#FAF7F2]"
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>flask_app.py</span>
              </button>
            </div>

            {/* Code Block Container */}
            <div className="relative rounded-xl bg-[#09090C] border border-white/8 p-4 overflow-x-auto max-h-60 font-mono text-[11.5px] leading-relaxed text-[#D4D4D8]">
              <button
                onClick={() => handleCopy(getActiveCode(), activeTab)}
                className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-sans rounded-md bg-[#1C1C24] hover:bg-[#282834] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8 flex items-center gap-1 transition-colors"
              >
                {copied === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
              <pre>
                <code>{getActiveCode()}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/8 bg-[#0E0E13]">
          <div className="text-[11px] text-[#71717A] flex items-center gap-1.5">
            <span>Includes:</span>
            <code className="text-[#FAF7F2]">app.py</code>
            <span>•</span>
            <code className="text-[#FAF7F2]">start_python.bat</code>
            <span>•</span>
            <code className="text-[#FAF7F2]">teamsync.db</code>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14141B] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenDownloadZip();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span>Download Project ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
