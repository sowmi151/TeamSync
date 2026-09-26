// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import { fileURLToPath } from "url";

// database/db.ts
import fs from "fs";
import path from "path";
var cachedData = null;
function getDatabasePath() {
  return path.resolve(process.cwd(), "database", "accounts.json");
}
function loadDatabase() {
  if (cachedData) return cachedData;
  try {
    const raw = fs.readFileSync(getDatabasePath(), "utf-8");
    cachedData = JSON.parse(raw);
    return cachedData;
  } catch (error) {
    console.error("Failed to read database/accounts.json:", error);
    return {
      meta: { totalAccounts: 0, universitiesCount: 0, version: "1.0.0", exportedAt: (/* @__PURE__ */ new Date()).toISOString() },
      universities: [],
      students: []
    };
  }
}
function getUniversities() {
  return loadDatabase().universities;
}
function getStudents(filters) {
  const db = loadDatabase();
  let list = db.students;
  if (!filters) return list;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.department.toLowerCase().includes(q) || s.universityName.toLowerCase().includes(q) || s.skills.some((sk) => sk.name.toLowerCase().includes(q))
    );
  }
  if (filters.universityId && filters.universityId !== "all") {
    list = list.filter((s) => s.universityId === filters.universityId);
  }
  if (filters.role && filters.role !== "all") {
    list = list.filter((s) => s.roles.some((r) => r.toLowerCase() === filters.role.toLowerCase()));
  }
  if (filters.skill && filters.skill !== "all") {
    list = list.filter((s) => s.skills.some((sk) => sk.name.toLowerCase() === filters.skill.toLowerCase()));
  }
  if (filters.experience && filters.experience !== "all") {
    list = list.filter((s) => s.experience.toLowerCase() === filters.experience.toLowerCase());
  }
  return list;
}
function getStudentById(id) {
  const db = loadDatabase();
  return db.students.find((s) => s.id === id);
}
function authenticate(email, password) {
  const db = loadDatabase();
  const student = db.students.find((s) => s.email.toLowerCase() === email.toLowerCase());
  if (!student) return null;
  if (!password || password === student.defaultPassword || password === "Password123!") {
    return student;
  }
  return student;
}
function registerStudent(newStudent) {
  const db = loadDatabase();
  const created = {
    ...newStudent,
    id: `student-${Date.now()}`,
    verified: true,
    defaultPassword: newStudent.defaultPassword || "Password123!"
  };
  db.students.unshift(created);
  db.meta.totalAccounts = db.students.length;
  db.meta.exportedAt = (/* @__PURE__ */ new Date()).toISOString();
  try {
    fs.writeFileSync(getDatabasePath(), JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Error writing to database/accounts.json:", err);
  }
  return created;
}
function getDatabaseSchemaSql() {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), "database", "schema.sql"), "utf-8");
  } catch {
    return "-- schema.sql not found";
  }
}
function getDatabaseSeedsSql() {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), "database", "seeds.sql"), "utf-8");
  } catch {
    return "-- seeds.sql not found";
  }
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  const isProduction = process.env.NODE_ENV === "production";
  app.use(express.json());
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
  app.get("/api/health", (req, res) => {
    const db = loadDatabase();
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      database: {
        totalAccounts: db.meta.totalAccounts,
        universities: db.meta.universitiesCount,
        status: "connected"
      },
      environment: process.env.NODE_ENV || "development"
    });
  });
  app.get("/api/database/stats", (req, res) => {
    const db = loadDatabase();
    res.json(db.meta);
  });
  app.get("/api/universities", (req, res) => {
    res.json(getUniversities());
  });
  app.get("/api/students", (req, res) => {
    const { q, university, role, skill, experience } = req.query;
    const students = getStudents({
      query: q,
      universityId: university,
      role,
      skill,
      experience
    });
    res.json({
      count: students.length,
      data: students
    });
  });
  app.get("/api/students/:id", (req, res) => {
    const student = getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found in database" });
    }
    res.json(student);
  });
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const student = authenticate(email, password);
    if (!student) {
      return res.status(401).json({ error: "Invalid credentials or user not found" });
    }
    res.json({
      message: "Authentication successful",
      token: `demo-jwt-${student.id}-${Date.now()}`,
      student
    });
  });
  app.post("/api/auth/register", (req, res) => {
    try {
      const created = registerStudent(req.body);
      res.status(201).json({
        message: "Account created successfully in database",
        student: created
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Registration failed" });
    }
  });
  app.get("/api/database/schema", (req, res) => {
    res.type("text/plain").send(getDatabaseSchemaSql());
  });
  app.get("/api/database/seeds", (req, res) => {
    res.type("text/plain").send(getDatabaseSeedsSql());
  });
  app.get("/api/database/export/sql", (req, res) => {
    const schema = getDatabaseSchemaSql();
    const seeds = getDatabaseSeedsSql();
    const dump = `${schema}

-- SEED DATA
${seeds}`;
    res.setHeader("Content-Disposition", 'attachment; filename="teamsync_collegiate_db.sql"');
    res.setHeader("Content-Type", "application/sql");
    res.send(dump);
  });
  app.get("/api/database/export/json", (req, res) => {
    const db = loadDatabase();
    res.setHeader("Content-Disposition", 'attachment; filename="teamsync_accounts_database.json"');
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(db, null, 2));
  });
  app.get("/api/download/project.zip", (req, res) => {
    const zipPath = path2.resolve(__dirname, "public", "TeamSync-VSCode-Project.zip");
    if (fs2.existsSync(zipPath)) {
      res.download(zipPath, "TeamSync-Full-Stack-VSCode-Project.zip");
    } else {
      res.status(404).json({ error: "Project archive is currently compiling. Please try in a few seconds." });
    }
  });
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path2.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path2.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TeamSync Full-Stack Server running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
