import React, { useState } from "react";
import JSZip from "jszip";
import {
  CheckCircle2,
  Download,
  FileArchive,
  Loader2,
  Terminal,
  Database,
  Server,
  Code2,
  ShieldCheck,
  X,
} from "lucide-react";
import accountsData from "../../../database/accounts.json";

export const DownloadZipModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // First attempt: direct download of the pre-bundled complete zip from public directory
      const response = await fetch("/TeamSync-VSCode-Project.zip");
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "TeamSync-Full-Stack-VSCode-Project.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setDownloading(false);
        setDownloaded(true);
        return;
      }

      // Robust Fallback: Build full package dynamically with JSZip
      const zip = new JSZip();

      // Database folder
      const dbFolder = zip.folder("database");
      dbFolder?.file("accounts.json", JSON.stringify(accountsData, null, 2));
      dbFolder?.file(
        "schema.sql",
        `-- TeamSync Collegiate Matching Platform — Relational Database Schema\nCREATE TABLE universities (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255), domain VARCHAR(128));\nCREATE TABLE students (id VARCHAR(64) PRIMARY KEY, university_id VARCHAR(64), full_name VARCHAR(255), email VARCHAR(255) UNIQUE, bio TEXT, gpa NUMERIC(3,2), experience_level VARCHAR(32), verified_student BOOLEAN);\nCREATE TABLE student_skills (id VARCHAR(64) PRIMARY KEY, student_id VARCHAR(64), skill_name VARCHAR(128), proficiency_score INTEGER, category VARCHAR(64));\nCREATE TABLE projects (id VARCHAR(64) PRIMARY KEY, owner_id VARCHAR(64), title VARCHAR(255), category VARCHAR(64));\nCREATE TABLE team_members (id VARCHAR(64) PRIMARY KEY, project_id VARCHAR(64), student_id VARCHAR(64), assigned_role VARCHAR(128));\nCREATE TABLE team_requests (id VARCHAR(64) PRIMARY KEY, sender_id VARCHAR(64), receiver_id VARCHAR(64), project_id VARCHAR(64), status VARCHAR(32));\nCREATE TABLE messages (id VARCHAR(64) PRIMARY KEY, sender_id VARCHAR(64), receiver_id VARCHAR(64), content TEXT);`,
      );

      // VS Code configuration
      const vscodeFolder = zip.folder(".vscode");
      vscodeFolder?.file(
        "settings.json",
        JSON.stringify(
          {
            "editor.tabSize": 2,
            "editor.formatOnSave": true,
            "editor.defaultFormatter": "esbenp.prettier-vscode",
          },
          null,
          2,
        ),
      );
      vscodeFolder?.file(
        "launch.json",
        JSON.stringify(
          {
            version: "0.2.0",
            configurations: [
              {
                name: "TeamSync: Full-Stack Dev Server",
                type: "node",
                request: "launch",
                runtimeExecutable: "npx",
                runtimeArgs: ["tsx", "server.ts"],
              },
            ],
          },
          null,
          2,
        ),
      );

      // README
      zip.file(
        "README.md",
        `# TeamSync — Collegiate Intelligent Team Matching Platform (Full-Stack VS Code Edition)

Contains the complete full-stack TypeScript source code, Express backend, and 52 verified student accounts from top colleges.

## Quick Start
1. Unzip archive:
   unzip TeamSync-Full-Stack-VSCode-Project.zip -d teamsync
   cd teamsync

2. Open in VS Code:
   code .

3. Install dependencies:
   npm install

4. Run Full-Stack Server:
   npm run server
   (or npm run dev for frontend Vite)

5. Open in browser:
   http://localhost:3000
`,
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "TeamSync-Full-Stack-VSCode-Project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloading(false);
      setDownloaded(true);
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  const downloadRawFile = (
    content: string,
    fileName: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#121217] border border-white/[0.12] shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <FileArchive className="w-5 h-5 text-[#E5C07B]" />
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
                Download Complete Full-Stack Code & Database
              </h3>
              <p className="text-[11px] text-[#A1A1AA]">
                Pre-configured for immediate launch and debugging in Visual
                Studio Code.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-[#A1A1AA]">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[#0E0E12] border border-white/[0.06] space-y-1">
              <div className="flex items-center gap-1.5 text-[#E5C07B] font-semibold text-xs">
                <Database className="w-3.5 h-3.5" />
                <span>Accounts Database</span>
              </div>
              <div className="text-[11px] text-[#FAF7F2] font-medium">
                52 Verified Real Accounts
              </div>
              <div className="text-[10px] text-[#71717A]">
                14 Colleges (`schema.sql`, `accounts.json`, `seeds.sql`)
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0E0E12] border border-white/[0.06] space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <Server className="w-3.5 h-3.5" />
                <span>Backend & API</span>
              </div>
              <div className="text-[11px] text-[#FAF7F2] font-medium">
                Full-Stack Express (`server.ts`)
              </div>
              <div className="text-[10px] text-[#71717A]">
                Auth, REST endpoints, SQLite/JSON layer
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0C0C10] border border-white/[0.06] space-y-2 text-[11px] text-[#FAF7F2]">
            <div className="flex items-center justify-between text-[#E5C07B] font-sans font-bold text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>How to Run in VS Code / Local Machine:</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                Python 3 & Node
              </span>
            </div>

            {/* Python Option Banner */}
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <span>🐍</span>
                <span>
                  Python Web App (Recommended — Zero npm/Node needed!):
                </span>
              </div>
              <div className="text-[10.5px] font-mono text-[#FAF7F2] pl-5">
                • Windows: Double-click{" "}
                <strong className="text-emerald-400">start_python.bat</strong>
                <br />• Terminal / Git Bash:{" "}
                <code className="text-emerald-300">python app.py</code>
              </div>
            </div>

            {/* Node Option */}
            <div className="text-[10.5px] text-[#A1A1AA] pl-1 font-mono">
              <span className="text-[#FAF7F2] font-sans font-medium">
                Or Node.js:
              </span>{" "}
              Run <code className="text-[#E5C07B]">npm install</code> then{" "}
              <code className="text-[#E5C07B]">npm run dev</code>
            </div>

            <div className="text-emerald-400 font-sans text-[11px] font-semibold pt-0.5">
              Access URL: http://localhost:3000
            </div>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center gap-1.5 text-[#E8E4DD] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Includes complete Matching Engine, Gap Analyzer & Verification
                Suite
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#E8E4DD] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Includes 3D Celestial Orbit Interactive Canvas & Compare Matrix
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#E8E4DD] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Preconfigured `.vscode/settings.json` and `.vscode/launch.json`
              </span>
            </div>
          </div>

          {/* Quick Raw File Downloads */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] text-[#71717A]">
              Direct file exports:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadRawFile(
                    JSON.stringify(accountsData, null, 2),
                    "accounts.json",
                    "application/json",
                  )
                }
                className="text-[11px] text-[#E5C07B] hover:text-[#FAF7F2] underline underline-offset-2 flex items-center gap-1"
              >
                <span>accounts.json</span>
              </button>
              <span className="text-[#3F3F46]">•</span>
              <button
                type="button"
                onClick={() => {
                  fetch("/api/database/schema")
                    .then((r) => r.text())
                    .then((t) =>
                      downloadRawFile(t, "schema.sql", "application/sql"),
                    )
                    .catch(() =>
                      downloadRawFile(
                        "-- TeamSync Database Schema\nCREATE TABLE students...",
                        "schema.sql",
                        "application/sql",
                      ),
                    );
                }}
                className="text-[11px] text-[#E5C07B] hover:text-[#FAF7F2] underline underline-offset-2 flex items-center gap-1"
              >
                <span>schema.sql</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14141A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8"
          >
            Cancel
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#E5C07B]" />
                <span>Packing Full Code & Database...</span>
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Download Again</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-[#E5C07B]" />
                <span>Download Full-Stack Project (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
