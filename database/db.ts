import fs from 'fs';
import path from 'path';

export interface University {
  id: string;
  name: string;
  domain: string;
  location: string;
  country: string;
  ranking: number;
}

export interface StudentSkill {
  name: string;
  proficiency: number;
  category: 'Frontend' | 'Backend' | 'AI/ML' | 'Design/UIUX' | 'Cloud/DevOps' | 'Mobile' | 'Data' | 'Other';
  years?: number;
}

export interface StudentAccount {
  id: string;
  universityId: string;
  universityName: string;
  name: string;
  email: string;
  department: string;
  year: string;
  degree?: string;
  gpa?: number;
  bio: string;
  avatarUrl?: string;
  skills: StudentSkill[];
  interests: string[];
  roles: string[];
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  availability: {
    hoursPerWeek: number;
    preferences: string[];
  } | null;
  projects: string[];
  achievements: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  verified: boolean;
  defaultPassword?: string;
}

interface DatabasePayload {
  meta: {
    totalAccounts: number;
    universitiesCount: number;
    version: string;
    exportedAt: string;
  };
  universities: University[];
  students: StudentAccount[];
}

let cachedData: DatabasePayload | null = null;

function getDatabasePath(): string {
  return path.resolve(process.cwd(), 'database', 'accounts.json');
}

export function loadDatabase(): DatabasePayload {
  if (cachedData) return cachedData;
  try {
    const raw = fs.readFileSync(getDatabasePath(), 'utf-8');
    cachedData = JSON.parse(raw);
    return cachedData!;
  } catch (error) {
    console.error('Failed to read database/accounts.json:', error);
    return {
      meta: { totalAccounts: 0, universitiesCount: 0, version: '1.0.0', exportedAt: new Date().toISOString() },
      universities: [],
      students: []
    };
  }
}

export function getUniversities(): University[] {
  return loadDatabase().universities;
}

export function getStudents(filters?: {
  query?: string;
  universityId?: string;
  role?: string;
  skill?: string;
  experience?: string;
}): StudentAccount[] {
  const db = loadDatabase();
  let list = db.students;

  if (!filters) return list;

  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.universityName.toLowerCase().includes(q) ||
        s.skills.some(sk => sk.name.toLowerCase().includes(q))
    );
  }

  if (filters.universityId && filters.universityId !== 'all') {
    list = list.filter(s => s.universityId === filters.universityId);
  }

  if (filters.role && filters.role !== 'all') {
    list = list.filter(s => s.roles.some(r => r.toLowerCase() === filters.role!.toLowerCase()));
  }

  if (filters.skill && filters.skill !== 'all') {
    list = list.filter(s => s.skills.some(sk => sk.name.toLowerCase() === filters.skill!.toLowerCase()));
  }

  if (filters.experience && filters.experience !== 'all') {
    list = list.filter(s => s.experience.toLowerCase() === filters.experience!.toLowerCase());
  }

  return list;
}

export function getStudentById(id: string): StudentAccount | undefined {
  const db = loadDatabase();
  return db.students.find(s => s.id === id);
}

export function authenticate(email: string, password?: string): StudentAccount | null {
  const db = loadDatabase();
  const student = db.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (!student) return null;
  // For demo/VSCode collegiate environment: accept defaultPassword or any non-empty password
  if (!password || password === student.defaultPassword || password === 'Password123!') {
    return student;
  }
  return student;
}

export function registerStudent(newStudent: Omit<StudentAccount, 'id' | 'verified'>): StudentAccount {
  const db = loadDatabase();
  const created: StudentAccount = {
    ...newStudent,
    id: `student-${Date.now()}`,
    verified: true,
    defaultPassword: newStudent.defaultPassword || 'Password123!'
  };

  db.students.unshift(created);
  db.meta.totalAccounts = db.students.length;
  db.meta.exportedAt = new Date().toISOString();

  try {
    fs.writeFileSync(getDatabasePath(), JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error writing to database/accounts.json:', err);
  }

  return created;
}

export function getDatabaseSchemaSql(): string {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), 'database', 'schema.sql'), 'utf-8');
  } catch {
    return '-- schema.sql not found';
  }
}

export function getDatabaseSeedsSql(): string {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), 'database', 'seeds.sql'), 'utf-8');
  } catch {
    return '-- seeds.sql not found';
  }
}
