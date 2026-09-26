-- TeamSync Collegiate Matching Platform — Relational Database Schema
-- Production-ready PostgreSQL / SQLite compatible schema

CREATE TABLE IF NOT EXISTS universities (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(128) NOT NULL UNIQUE,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(64) DEFAULT 'USA',
  ranking INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(64) PRIMARY KEY,
  university_id VARCHAR(64) REFERENCES universities(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt/argon2 hash
  department VARCHAR(255) NOT NULL,
  academic_year VARCHAR(64) NOT NULL, -- 1st Year, 2nd Year, 3rd Year, 4th Year, Masters, PhD
  degree VARCHAR(128) DEFAULT 'B.S.',
  bio TEXT,
  gpa NUMERIC(3,2),
  experience_level VARCHAR(32) NOT NULL, -- Beginner, Intermediate, Advanced, Expert
  hours_per_week INTEGER DEFAULT 15,
  availability_prefs TEXT, -- JSON array of preferences e.g. ["Weekdays", "Evenings"]
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  verified_student BOOLEAN DEFAULT TRUE,
  avatar_seed VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_skills (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name VARCHAR(128) NOT NULL,
  proficiency_score INTEGER NOT NULL CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
  category VARCHAR(64) NOT NULL, -- Frontend, Backend, AI/ML, Design/UIUX, Cloud/DevOps, Mobile, Data, Other
  years_experience NUMERIC(3,1) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_roles (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role_name VARCHAR(128) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_interests (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  interest_tag VARCHAR(128) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  category VARCHAR(64) NOT NULL, -- Hackathon, Academic, Research, Startup, Competition
  description TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'recruiting', -- recruiting, in-progress, completed
  team_size_max INTEGER DEFAULT 4,
  deadline VARCHAR(64),
  university_id VARCHAR(64) REFERENCES universities(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_required_roles (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role_name VARCHAR(128) NOT NULL,
  quantity INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS project_required_skills (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_name VARCHAR(128) NOT NULL,
  min_proficiency INTEGER DEFAULT 60
);

CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(64) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assigned_role VARCHAR(128) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, student_id)
);

CREATE TABLE IF NOT EXISTS team_requests (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  receiver_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(32) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  receiver_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance matching queries
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_student_skills_name ON student_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_student_skills_cat ON student_skills(category);
CREATE INDEX IF NOT EXISTS idx_student_roles_name ON student_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_projects_cat ON projects(category);
CREATE INDEX IF NOT EXISTS idx_team_members_proj ON team_members(project_id);
CREATE INDEX IF NOT EXISTS idx_requests_receiver ON team_requests(receiver_id);
