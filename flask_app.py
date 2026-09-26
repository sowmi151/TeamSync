"""
TeamSync — Collegiate Intelligent Team Matching Platform
Flask Framework Edition (requires: pip install flask)
Alternative to zero-dependency app.py
"""

import os
import sys
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory, send_file

import database
import matching_algorithm

BASE_DIR = Path(__file__).parent.resolve()
DIST_DIR = BASE_DIR / "dist"
PUBLIC_DIR = BASE_DIR / "public"

app = Flask(__name__, static_folder=str(DIST_DIR / "assets"), static_url_path="/assets")
database.init_database()

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    return response

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "engine": "Python Flask + SQLite",
        "pythonVersion": sys.version,
        "database": database.get_stats()
    })

@app.route("/api/database/stats", methods=["GET"])
def db_stats():
    return jsonify(database.get_stats())

@app.route("/api/universities", methods=["GET"])
def universities():
    return jsonify(database.get_universities())

@app.route("/api/students", methods=["GET"])
def students():
    q = request.args.get("q")
    uni = request.args.get("university")
    role = request.args.get("role")
    skill = request.args.get("skill")
    results = database.get_students(query=q, university_id=uni, role=role, skill=skill)
    return jsonify({"count": len(results), "data": results})

@app.route("/api/students/<student_id>", methods=["GET"])
def student_detail(student_id):
    student = database.get_student_by_id(student_id)
    if student:
        return jsonify(student)
    return jsonify({"error": "Student not found in database"}), 404

@app.route("/api/match", methods=["POST"])
def match():
    payload = request.get_json(silent=True) or {}
    s_a = payload.get("studentA")
    s_b = payload.get("studentB")
    if not s_a or not s_b:
        return jsonify({"error": "studentA and studentB must be provided"}), 400
    res = matching_algorithm.calculate_student_match(s_a, s_b)
    return jsonify(res)

@app.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email", "")
    password = payload.get("password", "Password123!")
    student = database.authenticate(email, password)
    if student:
        return jsonify({
            "message": "Authentication successful",
            "token": f"flask-jwt-{student['id']}",
            "student": student
        })
    return jsonify({"error": "Invalid credentials or user not found"}), 401

@app.route("/api/auth/register", methods=["POST"])
def register():
    payload = request.get_json(silent=True) or {}
    try:
        new_stu = database.register_student(payload)
        return jsonify({"message": "Student account registered", "student": new_stu}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/database/schema", methods=["GET"])
def schema():
    schema_file = BASE_DIR / "database" / "schema.sql"
    if schema_file.exists():
        return schema_file.read_text(encoding="utf-8"), 200, {"Content-Type": "text/plain"}
    return "Schema not found", 404

@app.route("/api/download/project.zip", methods=["GET"])
def download_zip():
    zip_path = PUBLIC_DIR / "TeamSync-VSCode-Project.zip"
    if zip_path.exists():
        return send_file(str(zip_path), as_attachment=True, download_name="TeamSync-Full-Stack-VSCode-Project.zip")
    return jsonify({"error": "Project archive not found"}), 404

# Serve React SPA Frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path and (DIST_DIR / path).exists():
        return send_from_directory(str(DIST_DIR), path)
    if (DIST_DIR / "index.html").exists():
        return send_from_directory(str(DIST_DIR), "index.html")
    return "<h1>TeamSync Python Flask Server Running!</h1><p>Run <code>npm run build</code> to compile web UI.</p>"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"TeamSync Flask Server starting on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
