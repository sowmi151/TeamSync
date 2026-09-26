import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  loadDatabase,
  getUniversities,
  getStudents,
  getStudentById,
  authenticate,
  registerStudent,
  getDatabaseSchemaSql,
  getDatabaseSeedsSql
} from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // CORS headers for local dev & iframe preview
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // REST API Routes
  app.get('/api/health', (req, res) => {
    const db = loadDatabase();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        totalAccounts: db.meta.totalAccounts,
        universities: db.meta.universitiesCount,
        status: 'connected'
      },
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Database Statistics & Meta
  app.get('/api/database/stats', (req, res) => {
    const db = loadDatabase();
    res.json(db.meta);
  });

  // Universities list
  app.get('/api/universities', (req, res) => {
    res.json(getUniversities());
  });

  // Real Collegiate Student Accounts (with search and filters)
  app.get('/api/students', (req, res) => {
    const { q, university, role, skill, experience } = req.query;
    const students = getStudents({
      query: q as string,
      universityId: university as string,
      role: role as string,
      skill: skill as string,
      experience: experience as string
    });
    res.json({
      count: students.length,
      data: students
    });
  });

  // Single Student Account
  app.get('/api/students/:id', (req, res) => {
    const student = getStudentById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found in database' });
    }
    res.json(student);
  });

  // Authentication: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const student = authenticate(email, password);
    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials or user not found' });
    }
    res.json({
      message: 'Authentication successful',
      token: `demo-jwt-${student.id}-${Date.now()}`,
      student
    });
  });

  // Registration: Create new real account
  app.post('/api/auth/register', (req, res) => {
    try {
      const created = registerStudent(req.body);
      res.status(201).json({
        message: 'Account created successfully in database',
        student: created
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  // SQL Schema View & Download
  app.get('/api/database/schema', (req, res) => {
    res.type('text/plain').send(getDatabaseSchemaSql());
  });

  app.get('/api/database/seeds', (req, res) => {
    res.type('text/plain').send(getDatabaseSeedsSql());
  });

  app.get('/api/database/export/sql', (req, res) => {
    const schema = getDatabaseSchemaSql();
    const seeds = getDatabaseSeedsSql();
    const dump = `${schema}\n\n-- SEED DATA\n${seeds}`;
    res.setHeader('Content-Disposition', 'attachment; filename="teamsync_collegiate_db.sql"');
    res.setHeader('Content-Type', 'application/sql');
    res.send(dump);
  });

  app.get('/api/database/export/json', (req, res) => {
    const db = loadDatabase();
    res.setHeader('Content-Disposition', 'attachment; filename="teamsync_accounts_database.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(db, null, 2));
  });

  // Direct Project ZIP Download endpoint
  app.get('/api/download/project.zip', (req, res) => {
    const zipPath = path.resolve(__dirname, 'public', 'TeamSync-VSCode-Project.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'TeamSync-Full-Stack-VSCode-Project.zip');
    } else {
      res.status(404).json({ error: 'Project archive is currently compiling. Please try in a few seconds.' });
    }
  });

  // Frontend Serving: Vite middleware in dev, static files in production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TeamSync Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
