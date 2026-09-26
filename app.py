"""
TeamSync — Collegiate Intelligent Team Matching Platform
Python 3 Full-Stack Web Application Server (Zero External Dependencies)
Runs with standard Python: `python app.py`
"""

import sys
import os
import json
import mimetypes
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

# Local Python modules
import database
import matching_algorithm

# CLI argument takes precedence over environment variable
if len(sys.argv) > 1 and sys.argv[1].isdigit():
    PORT = int(sys.argv[1])
else:
    PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = Path(__file__).parent.resolve()
DIST_DIR = BASE_DIR / "dist"
PUBLIC_DIR = BASE_DIR / "public"

class TeamSyncHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json(self, status_code: int, data: dict or list):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_text(self, status_code: int, text: str, content_type: str = "text/plain; charset=utf-8"):
        body = text.encode("utf-8")
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file_stream(self, file_path: Path, download_name: str = None, mime_type: str = None):
        if not file_path.exists():
            self.send_error(404, "File Not Found")
            return

        size = file_path.stat().st_size
        mime = mime_type or mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"

        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(size))
        if download_name:
            self.send_header("Content-Disposition", f'attachment; filename="{download_name}"')
        self.end_headers()

        with open(file_path, "rb") as f:
            while chunk := f.read(64 * 1024):
                self.wfile.write(chunk)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query_params = urllib.parse.parse_qs(parsed.query)

        # Helper to get first query param
        def q(key, default=None):
            return query_params.get(key, [default])[0]

        # ----------------- REST API ROUTES -----------------
        if path == "/api/health":
            stats = database.get_stats()
            self.send_json(200, {
                "status": "healthy",
                "engine": "Python 3.10+ (Standard Library HTTPServer)",
                "pythonVersion": sys.version,
                "database": stats,
                "port": PORT
            })
            return

        elif path == "/api/database/stats":
            self.send_json(200, database.get_stats())
            return

        elif path == "/api/universities":
            self.send_json(200, database.get_universities())
            return

        elif path == "/api/students":
            query_val = q("q")
            uni_val = q("university")
            role_val = q("role")
            skill_val = q("skill")
            students = database.get_students(query=query_val, university_id=uni_val, role=role_val, skill=skill_val)
            self.send_json(200, {
                "count": len(students),
                "data": students
            })
            return

        elif path.startswith("/api/students/"):
            student_id = path.split("/api/students/")[1].strip()
            student = database.get_student_by_id(student_id)
            if student:
                self.send_json(200, student)
            else:
                self.send_json(404, {"error": "Student not found in database"})
            return

        elif path == "/api/database/schema":
            schema_file = BASE_DIR / "database" / "schema.sql"
            if schema_file.exists():
                self.send_text(200, schema_file.read_text(encoding="utf-8"), "text/plain; charset=utf-8")
            else:
                self.send_text(404, "Schema file not found")
            return

        elif path == "/api/database/export/sql":
            schema_file = BASE_DIR / "database" / "schema.sql"
            content = schema_file.read_text(encoding="utf-8") if schema_file.exists() else "-- Schema"
            self.send_text(200, content, "application/sql")
            return

        elif path == "/api/database/export/json":
            students = database.get_students()
            unis = database.get_universities()
            export_obj = {
                "meta": database.get_stats(),
                "universities": unis,
                "students": students
            }
            self.send_json(200, export_obj)
            return

        elif path in ("/api/download/project.zip", "/TeamSync-VSCode-Project.zip"):
            zip_path = PUBLIC_DIR / "TeamSync-VSCode-Project.zip"
            if not zip_path.exists():
                zip_path = DIST_DIR / "TeamSync-VSCode-Project.zip"

            if zip_path.exists():
                self.send_file_stream(zip_path, "TeamSync-Full-Stack-VSCode-Project.zip", "application/zip")
            else:
                self.send_json(404, {"error": "Project ZIP archive not yet compiled. Please rebuild."})
            return

        # ----------------- STATIC ASSETS & SPA SERVING -----------------
        # Try serving files from dist/
        target_file = DIST_DIR / path.lstrip("/")

        # Direct file match in dist (e.g. /assets/index-xxx.js)
        if target_file.is_file():
            self.send_file_stream(target_file)
            return

        # Direct file match in public (e.g. /favicon.ico)
        public_file = PUBLIC_DIR / path.lstrip("/")
        if public_file.is_file():
            self.send_file_stream(public_file)
            return

        # SPA Routing: Fall back to dist/index.html
        index_file = DIST_DIR / "index.html"
        if index_file.is_file():
            self.send_file_stream(index_file, mime_type="text/html; charset=utf-8")
            return

        # Fallback if dist has not been compiled yet: helpful status page
        fallback_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>TeamSync Python Web Server</title>
    <style>
        body {{ background: #09090b; color: #FAF7F2; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }}
        .card {{ background: #121217; border: 1px solid rgba(229,192,123,0.3); border-radius: 16px; padding: 32px; max-width: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
        h1 {{ color: #E5C07B; margin-top: 0; font-size: 24px; }}
        code {{ background: #181822; padding: 3px 8px; border-radius: 6px; color: #34d399; font-size: 13px; }}
        .badge {{ display: inline-block; background: #2B2317; border: 1px solid #D4AF37; color: #E5C07B; padding: 4px 10px; border-radius: 20px; font-size: 12px; margin-bottom: 16px; font-weight: bold; }}
        ul {{ line-height: 1.8; color: #A1A1AA; }}
        a {{ color: #E5C07B; text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">Python 3.10+ Web Server Active</div>
        <h1>TeamSync Intelligent Team Matching</h1>
        <p>The Python backend and SQLite database (<strong>teamsync.db</strong>) are active and running on port {PORT}!</p>
        <p>Verified Student Accounts loaded: <strong>52 collegiate accounts</strong> across 14 top universities.</p>
        <p>Explore API Endpoints:</p>
        <ul>
            <li><a href="/api/health">/api/health</a> - Health check and runtime information</li>
            <li><a href="/api/students">/api/students</a> - Verified collegiate student accounts</li>
            <li><a href="/api/universities">/api/universities</a> - Top universities directory</li>
            <li><a href="/api/database/stats">/api/database/stats</a> - Database statistics</li>
        </ul>
        <p>To view the full React web interface, run <code>npm run build</code> to compile <code>dist/</code> assets, then refresh this page!</p>
    </div>
</body>
</html>"""
        self.send_text(200, fallback_html, "text/html; charset=utf-8")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            payload = {}

        if path == "/api/auth/login":
            email = payload.get("email", "")
            password = payload.get("password", "Password123!")
            student = database.authenticate(email, password)
            if student:
                self.send_json(200, {
                    "message": "Authentication successful",
                    "token": f"python-jwt-{student['id']}",
                    "student": student
                })
            else:
                self.send_json(401, {"error": "Invalid credentials or account not found in database"})
            return

        elif path == "/api/auth/register":
            try:
                new_student = database.register_student(payload)
                self.send_json(201, {
                    "message": "Student account registered successfully in SQLite",
                    "student": new_student
                })
            except Exception as e:
                self.send_json(500, {"error": str(e)})
            return

        elif path == "/api/match":
            student_a = payload.get("studentA")
            student_b = payload.get("studentB")

            if not student_a or not student_b:
                self.send_json(400, {"error": "Both studentA and studentB must be provided in request body"})
                return

            result = matching_algorithm.calculate_student_match(student_a, student_b)
            self.send_json(200, result)
            return

        else:
            self.send_json(404, {"error": "API route not found"})

def run_server():
    database.init_database()
    server_address = ("0.0.0.0", PORT)
    HTTPServer.allow_reuse_address = True
    httpd = HTTPServer(server_address, TeamSyncHandler)

    stats = database.get_stats()
    print("=" * 64)
    print("  TeamSync — Collegiate Intelligent Team Matching Platform")
    print("  Python 3 Full-Stack Web Application (Zero npm/Node required!)")
    print("=" * 64)
    print(f"  * Engine: Python SQLite ({stats['totalAccounts']} Verified Accounts)")
    print(f"  * Universities: {stats['universitiesCount']} Leading Global Institutions")
    print(f"  * Local Web App: http://localhost:{PORT}")
    print(f"  * Network Access: http://127.0.0.1:{PORT}")
    print("  * Press Ctrl+C anytime to stop the server.")
    print("=" * 64)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping TeamSync server...")
        httpd.server_close()
        print("Server stopped cleanly.")

if __name__ == "__main__":
    run_server()
