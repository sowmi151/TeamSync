import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Download,
  Search,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Copy,
  Check,
  Code,
  FileText,
  UserCheck,
  X,
  Filter,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import accountsData from '../../../database/accounts.json';
import { SEED_UNIVERSITIES } from '../../data/seedData';

interface DatabaseModalProps {
  onClose: () => void;
  onOpenDownloadZip: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  onClose,
  onOpenDownloadZip
}) => {
  const { students, currentUser, switchDemoUser, setSelectedStudentForModal } = useApp();
  const [activeTab, setActiveTab] = useState<'accounts' | 'schema' | 'export'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      searchQuery === '' ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.university && s.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.skills.some(sk => sk.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesUniversity =
      selectedUniversity === 'all' ||
      (s.university && s.university.toLowerCase().includes(selectedUniversity.toLowerCase()));

    const matchesRole =
      selectedRole === 'all' ||
      s.roles.some(r => r.toLowerCase().includes(selectedRole.toLowerCase()));

    return matchesSearch && matchesUniversity && matchesRole;
  });

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSchemaSql = () => {
    fetch('/api/database/schema')
      .then(res => res.text())
      .then(sql => downloadFile(sql, 'teamsync_schema.sql', 'application/sql'))
      .catch(() => {
        // Fallback
        const fallbackSchema = `-- TeamSync Relational Database Schema\n-- 52 Verified Accounts & Real Collegiate Tables\n\nCREATE TABLE universities (id VARCHAR(64) PRIMARY KEY, name VARCHAR(255), domain VARCHAR(128));\nCREATE TABLE students (id VARCHAR(64) PRIMARY KEY, university_id VARCHAR(64), full_name VARCHAR(255), email VARCHAR(255) UNIQUE, bio TEXT, gpa NUMERIC(3,2), verified BOOLEAN);\nCREATE TABLE student_skills (id VARCHAR(64) PRIMARY KEY, student_id VARCHAR(64), skill_name VARCHAR(128), proficiency_score INTEGER, category VARCHAR(64));\nCREATE TABLE projects (id VARCHAR(64) PRIMARY KEY, owner_id VARCHAR(64), title VARCHAR(255), category VARCHAR(64));\nCREATE TABLE team_members (id VARCHAR(64) PRIMARY KEY, project_id VARCHAR(64), student_id VARCHAR(64), assigned_role VARCHAR(128));\nCREATE TABLE team_requests (id VARCHAR(64) PRIMARY KEY, sender_id VARCHAR(64), receiver_id VARCHAR(64), project_id VARCHAR(64), status VARCHAR(32));\nCREATE TABLE messages (id VARCHAR(64) PRIMARY KEY, sender_id VARCHAR(64), receiver_id VARCHAR(64), content TEXT);`;
        downloadFile(fallbackSchema, 'teamsync_schema.sql', 'application/sql');
      });
  };

  const handleDownloadAccountsJson = () => {
    downloadFile(
      JSON.stringify(accountsData, null, 2),
      'teamsync_accounts_database.json',
      'application/json'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#101014] border border-white/[0.12] shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#14141A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#251E14] to-[#3D321F] flex items-center justify-center border border-[#D4AF37]/40 shadow-sm">
              <Database className="w-5 h-5 text-[#E5C07B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
                  Collegiate Database & Verified Real Accounts
                </h3>
                <span className="text-[10px] font-mono-nums px-2 py-0.5 rounded-full bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30">
                  {students.length} Real Accounts
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Live relational database with top collegiate domains (Stanford, MIT, Berkeley, CMU, etc.), skills matrix, and SQL schema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenDownloadZip();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span>Export Full VS Code ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/[0.08] bg-[#121217]">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'accounts'
                ? 'border-[#D4AF37] text-[#FAF7F2]'
                : 'border-transparent text-[#A1A1AA] hover:text-[#FAF7F2]'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#E5C07B]" />
            <span>Real Accounts Explorer ({filteredStudents.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'schema'
                ? 'border-[#D4AF37] text-[#FAF7F2]'
                : 'border-transparent text-[#A1A1AA] hover:text-[#FAF7F2]'
            }`}
          >
            <Code className="w-4 h-4 text-[#E5C07B]" />
            <span>Relational SQL Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'export'
                ? 'border-[#D4AF37] text-[#FAF7F2]'
                : 'border-transparent text-[#A1A1AA] hover:text-[#FAF7F2]'
            }`}
          >
            <FileText className="w-4 h-4 text-[#E5C07B]" />
            <span>Database Dumps & Exports</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#14141A] border border-white/[0.08]">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search name, university, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#0E0E12] border border-white/[0.08] text-[#FAF7F2] placeholder-[#71717A] focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>

                {/* University Filter */}
                <div className="relative">
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0E0E12] border border-white/[0.08] text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]/50"
                  >
                    <option value="all">All Universities ({SEED_UNIVERSITIES.length})</option>
                    {SEED_UNIVERSITIES.map(u => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.domain})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#0E0E12] border border-white/[0.08] text-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]/50"
                  >
                    <option value="all">All Engineering & Design Roles</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Security Engineer">Security Engineer</option>
                    <option value="Mobile Developer">Mobile Developer</option>
                    <option value="Robotics Engineer">Robotics Engineer</option>
                  </select>
                </div>
              </div>

              {/* Student Accounts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredStudents.map((student) => {
                  const isCurrent = currentUser.id === student.id;
                  return (
                    <div
                      key={student.id}
                      className={`p-4 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-[#1C1812] border-[#D4AF37]/50 shadow-md'
                          : 'bg-[#14141A] border-white/[0.08] hover:border-white/[0.18]'
                      }`}
                    >
                      <div>
                        {/* Top Profile Bar */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={student.name} avatarUrl={student.avatarUrl} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-[#FAF7F2]">
                                  {student.name}
                                </span>
                                {student.verified !== false && (
                                  <span title="Verified Collegiate Account">
                                    <ShieldCheck className="w-3.5 h-3.5 text-[#E5C07B]" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-[#D4AF37]" />
                                <span>{student.university || 'Stanford University'}</span>
                              </div>
                              <div className="text-[10px] font-mono text-[#71717A]">
                                {student.email}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {isCurrent ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2E2416] text-[#E5C07B] border border-[#D4AF37]/40">
                                Active Session
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#1F1F28] text-[#A1A1AA] border border-white/[0.08]">
                                {student.experience || 'Intermediate'}
                              </span>
                            )}
                            {student.gpa && (
                              <div className="font-mono-nums text-[10px] text-[#A1A1AA] mt-1">
                                GPA: <span className="text-[#FAF7F2] font-semibold">{student.gpa.toFixed(2)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-[11px] text-[#A1A1AA] line-clamp-2 mb-3 leading-relaxed">
                          {student.bio}
                        </p>

                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {student.skills.slice(0, 4).map((sk) => (
                            <span
                              key={sk.name}
                              className="px-2 py-0.5 rounded-md bg-[#0E0E12] border border-white/[0.06] text-[10px] text-[#E8E4DD] flex items-center gap-1 font-mono"
                            >
                              <span>{sk.name}</span>
                              <span className="text-[#D4AF37] font-semibold">{sk.proficiency}%</span>
                            </span>
                          ))}
                          {student.skills.length > 4 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#0E0E12] border border-white/[0.06] text-[10px] text-[#71717A]">
                              +{student.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudentForModal(student);
                            }}
                            className="text-[11px] text-[#A1A1AA] hover:text-[#FAF7F2] underline underline-offset-2"
                          >
                            Full Profile
                          </button>
                          {student.githubUrl && (
                            <a
                              href={student.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#71717A] hover:text-[#FAF7F2]"
                              title="GitHub Profile"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {isCurrent ? (
                          <span className="text-[11px] text-[#E5C07B] font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Logged In
                          </span>
                        ) : (
                          <button
                            onClick={() => switchDemoUser(student.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#221D15] hover:bg-[#2F2618] text-[#E5C07B] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 transition-all flex items-center gap-1"
                          >
                            <span>Log In As {student.name.split(' ')[0]}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#14141A] border border-white/[0.08]">
                <div>
                  <h4 className="font-semibold text-xs text-[#FAF7F2]">Production Relational Schema (`schema.sql`)</h4>
                  <p className="text-[11px] text-[#A1A1AA]">
                    Normalized 3NF relational database schema for Universities, Students, Skills, Roles, Projects, TeamMembers, Requests, and Messages.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSchemaSql}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#221D15] hover:bg-[#2F2618] text-[#E5C07B] border border-[#D4AF37]/30 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download `schema.sql`</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#09090C] border border-white/[0.08] font-mono text-[11px] text-[#A1A1AA] overflow-x-auto leading-relaxed max-h-[500px]">
                <pre>{`-- TeamSync Collegiate Matching Platform — Relational Database Schema
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
  password_hash VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  academic_year VARCHAR(64) NOT NULL,
  degree VARCHAR(128) DEFAULT 'B.S.',
  bio TEXT,
  gpa NUMERIC(3,2),
  experience_level VARCHAR(32) NOT NULL,
  hours_per_week INTEGER DEFAULT 15,
  availability_prefs TEXT,
  github_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  portfolio_url VARCHAR(255),
  verified_student BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_skills (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name VARCHAR(128) NOT NULL,
  proficiency_score INTEGER NOT NULL CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
  category VARCHAR(64) NOT NULL,
  years_experience NUMERIC(3,1) DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'recruiting',
  team_size_max INTEGER DEFAULT 4,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  status VARCHAR(32) DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  receiver_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#14141A] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2 text-[#E5C07B] font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>Download Complete Database & Source Code</span>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Export the database in SQL, JSON, or complete Full-Stack VS Code format with Express server, SQLite/JSON layer, and React interface.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={handleDownloadAccountsJson}
                    className="p-3 rounded-lg bg-[#0E0E12] border border-white/[0.08] hover:border-[#D4AF37]/50 text-left transition-all group"
                  >
                    <div className="font-semibold text-xs text-[#FAF7F2] group-hover:text-[#E5C07B] flex items-center justify-between">
                      <span>Accounts JSON DB</span>
                      <Download className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#E5C07B]" />
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1 font-mono">
                      accounts.json (108 KB)
                    </div>
                    <div className="text-[10px] text-[#A1A1AA] mt-1">
                      52 real collegiate accounts
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadSchemaSql}
                    className="p-3 rounded-lg bg-[#0E0E12] border border-white/[0.08] hover:border-[#D4AF37]/50 text-left transition-all group"
                  >
                    <div className="font-semibold text-xs text-[#FAF7F2] group-hover:text-[#E5C07B] flex items-center justify-between">
                      <span>SQL Schema & Seeds</span>
                      <Download className="w-3.5 h-3.5 text-[#A1A1AA] group-hover:text-[#E5C07B]" />
                    </div>
                    <div className="text-[11px] text-[#71717A] mt-1 font-mono">
                      schema.sql & seeds.sql
                    </div>
                    <div className="text-[10px] text-[#A1A1AA] mt-1">
                      Full relational DDL + inserts
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenDownloadZip();
                    }}
                    className="p-3 rounded-lg bg-gradient-to-tr from-[#1E1911] to-[#2E2618] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 text-left transition-all group"
                  >
                    <div className="font-semibold text-xs text-[#FAF7F2] group-hover:text-[#E5C07B] flex items-center justify-between">
                      <span>Full VS Code ZIP</span>
                      <Download className="w-3.5 h-3.5 text-[#E5C07B]" />
                    </div>
                    <div className="text-[11px] text-[#E5C07B] mt-1 font-mono">
                      TeamSync-Project.zip
                    </div>
                    <div className="text-[10px] text-[#A1A1AA] mt-1">
                      Full code + database + server.ts
                    </div>
                  </button>
                </div>
              </div>

              {/* Default Credentials Reference */}
              <div className="p-4 rounded-xl bg-[#0C0C10] border border-white/[0.06] space-y-2">
                <div className="text-xs font-semibold text-[#FAF7F2] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Default Account Credentials for VS Code & Testing</span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  All 52 verified student accounts in the database are preconfigured with the password:
                </p>
                <div className="flex items-center gap-2">
                  <code className="px-2.5 py-1 rounded bg-[#16161D] border border-white/[0.08] text-xs font-mono text-[#E5C07B]">
                    Password123!
                  </code>
                  <button
                    onClick={() => copyToClipboard('Password123!', 'pass')}
                    className="px-2 py-1 rounded bg-[#1C1C24] hover:bg-[#252530] text-[#A1A1AA] hover:text-[#FAF7F2] text-[10px] flex items-center gap-1 border border-white/[0.06]"
                  >
                    {copiedId === 'pass' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'pass' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/[0.08] bg-[#14141A] flex items-center justify-between">
          <div className="text-[11px] text-[#71717A]">
            Current Active Student: <span className="text-[#FAF7F2] font-semibold">{currentUser.name}</span> ({currentUser.university || 'Stanford University'})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[#1E1E28] hover:bg-[#282834] text-[#FAF7F2] border border-white/[0.08]"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
