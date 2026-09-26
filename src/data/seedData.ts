/**
 * Collegiate Student Accounts, Projects, Requests, and Messages Database
 * Imports 52+ verified real accounts from database/accounts.json
 * plus intentional missing-data test profiles.
 */

import { Student, Project, TeamRequest, Message, NotificationItem } from '../types';
import accountsData from '../../database/accounts.json';

export interface UniversityMeta {
  id: string;
  name: string;
  domain: string;
  location: string;
  country: string;
  ranking: number;
}

export const SEED_UNIVERSITIES: UniversityMeta[] = accountsData.universities;

// Map the 52 real accounts from the relational accounts database
const DATABASE_ACCOUNTS: Student[] = (accountsData.students as any[]).map(acc => ({
  id: acc.id,
  name: acc.name,
  email: acc.email,
  department: acc.department,
  year: acc.year,
  university: acc.universityName,
  avatarUrl: acc.avatarUrl || '',
  bio: acc.bio,
  skills: acc.skills.map((s: any) => ({
    name: s.name,
    proficiency: s.proficiency,
    category: s.category
  })),
  interests: acc.interests,
  roles: acc.roles,
  experience: acc.experience,
  availability: acc.availability,
  projects: acc.projects || [],
  achievements: acc.achievements || [],
  gpa: acc.gpa,
  githubUrl: acc.githubUrl,
  linkedinUrl: acc.linkedinUrl,
  portfolioUrl: acc.portfolioUrl,
  verified: acc.verified ?? true
}));

// Incomplete profiles specifically illustrating Section 64 missing-data handling
const MISSING_DATA_PROFILES: Student[] = [
  {
    id: 'student-kevin',
    name: 'Kevin Zhang',
    email: 'kevin.z@illinois.edu',
    department: 'Electrical & Computer Engineering',
    year: '2nd Year',
    university: 'University of Illinois Urbana-Champaign',
    avatarUrl: '',
    bio: 'Embedded software & IoT tinkerer. Has not filled in availability details yet to prove missing data weight redistribution.',
    skills: [
      { name: 'Python', proficiency: 85, category: 'Backend' },
      { name: 'C++', proficiency: 88, category: 'Backend' },
      { name: 'IoT', proficiency: 82, category: 'Other' }
    ],
    interests: ['Robotics', 'Hardware', 'Smart Devices'],
    roles: ['Embedded Systems Engineer'],
    experience: 'Intermediate',
    availability: null, // Intentionally null for Case 5
    projects: ['Smart Campus Sensor Node'],
    achievements: ['UIUC Robotics Club Hardware Lead'],
    gpa: 3.79,
    verified: true
  },
  {
    id: 'student-sara',
    name: 'Sara Al-Mansoor',
    email: 'sara.a@columbia.edu',
    department: 'Design',
    year: '1st Year',
    university: 'Columbia University',
    avatarUrl: '',
    bio: 'Passionate graphic design student eager to team up on hackathons. Has not filled in project interests yet.',
    skills: [
      { name: 'UI/UX', proficiency: 88, category: 'Design/UIUX' },
      { name: 'Figma', proficiency: 85, category: 'Design/UIUX' }
    ],
    interests: [], // Intentionally empty for Case 6
    roles: ['UI/UX Designer'],
    experience: 'Beginner',
    availability: {
      hoursPerWeek: 10,
      preferences: ['Weekends']
    },
    projects: [],
    achievements: ['Columbia Creative Arts Fellow'],
    gpa: 3.75,
    verified: true
  },
  {
    id: 'student-marcus-brody',
    name: 'Marcus Brody',
    email: 'marcus.b@college.edu',
    department: 'General Engineering',
    year: '1st Year',
    university: 'Stanford University',
    avatarUrl: '',
    bio: 'Freshman student exploring different clubs and tech stacks. Minimal profile data filled.',
    skills: [], // Intentionally no skills for Case 8
    interests: [], // Intentionally no interests
    roles: [], // Intentionally no roles
    experience: null, // Intentionally null
    availability: null, // Intentionally null
    projects: [],
    achievements: [],
    verified: false
  }
];

// Combine into SEED_STUDENTS ensuring uniqueness
const existingIds = new Set(DATABASE_ACCOUNTS.map(s => s.id));
const uniqueMissing = MISSING_DATA_PROFILES.filter(s => !existingIds.has(s.id));

export const SEED_STUDENTS: Student[] = [...DATABASE_ACCOUNTS, ...uniqueMissing];

export const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-smart-campus',
    title: 'Smart Campus Navigation & Accessibility',
    description: 'Indoor & outdoor intelligent pathfinding application for students and visitors with wheelchair accessibility, dynamic crowd-density heatmaps, and AR wayfinding.',
    category: 'Hackathon',
    creatorId: 'student-rahul',
    teamSize: 4,
    requiredSkills: [
      { name: 'Python', minProficiency: 70, isRequired: true },
      { name: 'React', minProficiency: 75, isRequired: true },
      { name: 'UI/UX', minProficiency: 65, isRequired: true },
      { name: 'Cloud', minProficiency: 60, isRequired: false },
      { name: 'Machine Learning', minProficiency: 70, isRequired: true }
    ],
    requiredRoles: ['Backend Developer', 'Frontend Developer', 'UI/UX Designer', 'Machine Learning Engineer'],
    members: [
      { studentId: 'student-rahul', role: 'Backend Developer', joinedAt: '2026-09-10' },
      { studentId: 'student-priya', role: 'UI/UX Designer', joinedAt: '2026-09-12' }
    ],
    status: 'open',
    createdAt: '2026-09-10'
  },
  {
    id: 'proj-drone-vision',
    title: 'Autonomous Drone Vision & Mapping',
    description: 'High-speed object tracking and obstacle avoidance system powered by edge-optimized computer vision models running on onboard micro-controllers.',
    category: 'Research',
    creatorId: 'student-ananya',
    teamSize: 4,
    requiredSkills: [
      { name: 'Machine Learning', minProficiency: 80, isRequired: true },
      { name: 'Python', minProficiency: 85, isRequired: true },
      { name: 'Computer Vision', minProficiency: 75, isRequired: true },
      { name: 'Cloud', minProficiency: 65, isRequired: false }
    ],
    requiredRoles: ['Machine Learning Engineer', 'Researcher', 'Backend Developer', 'Embedded Systems Engineer'],
    members: [
      { studentId: 'student-ananya', role: 'Machine Learning Engineer', joinedAt: '2026-09-15' }
    ],
    status: 'open',
    createdAt: '2026-09-15'
  },
  {
    id: 'proj-ecotrack',
    title: 'EcoTrack Campus Sustainability Dashboard',
    description: 'Gamified campus waste-audit and energy-monitoring dashboard connecting dining halls, dorms, and solar metering sensors.',
    category: 'Startup',
    creatorId: 'student-alex',
    teamSize: 3,
    requiredSkills: [
      { name: 'React', minProficiency: 80, isRequired: true },
      { name: 'UI/UX', minProficiency: 75, isRequired: true },
      { name: 'Python', minProficiency: 70, isRequired: true }
    ],
    requiredRoles: ['Frontend Developer', 'UI/UX Designer', 'Backend Developer'],
    members: [
      { studentId: 'student-alex', role: 'Frontend Developer', joinedAt: '2026-09-18' }
    ],
    status: 'open',
    createdAt: '2026-09-18'
  },
  {
    id: 'proj-defi-lend',
    title: 'Peer-to-Peer Student Micro-Grants Protocol',
    description: 'Decentralized liquidity pool and micro-grant platform designed for collegiate project funding with automated milestones and smart contract escrow.',
    category: 'Startup',
    creatorId: 'student-marcus',
    teamSize: 4,
    requiredSkills: [
      { name: 'Go', minProficiency: 80, isRequired: true },
      { name: 'React', minProficiency: 80, isRequired: true },
      { name: 'PostgreSQL', minProficiency: 75, isRequired: true },
      { name: 'Solidity', minProficiency: 70, isRequired: false }
    ],
    requiredRoles: ['Full Stack Developer', 'Backend Developer', 'UI/UX Designer'],
    members: [
      { studentId: 'student-marcus', role: 'Full Stack Developer', joinedAt: '2026-09-20' }
    ],
    status: 'open',
    createdAt: '2026-09-20'
  },
  {
    id: 'proj-quadruped',
    title: 'Autonomous Terrain Quadruped Robotics',
    description: 'High-agility quadruped robot equipped with stereo cameras and LiDAR for search and rescue operations in hazardous unstructured environments.',
    category: 'Research',
    creatorId: 'student-chloe',
    teamSize: 4,
    requiredSkills: [
      { name: 'ROS2', minProficiency: 85, isRequired: true },
      { name: 'C++', minProficiency: 85, isRequired: true },
      { name: 'Robotics', minProficiency: 80, isRequired: true }
    ],
    requiredRoles: ['Robotics Engineer', 'Embedded Systems Engineer', 'Machine Learning Engineer'],
    members: [
      { studentId: 'student-chloe', role: 'Robotics Engineer', joinedAt: '2026-09-21' }
    ],
    status: 'open',
    createdAt: '2026-09-21'
  }
];

export const SEED_REQUESTS: TeamRequest[] = [
  {
    id: 'req-ananya-smart-campus',
    senderId: 'student-ananya',
    receiverId: 'student-rahul',
    projectId: 'proj-smart-campus',
    message: 'Hey Rahul, I saw your Smart Campus project! I can integrate the ML route-optimization pipeline and indoor density clustering models.',
    status: 'pending',
    createdAt: '2026-09-24T14:30:00Z'
  },
  {
    id: 'req-alex-smart-campus',
    senderId: 'student-alex',
    receiverId: 'student-rahul',
    projectId: 'proj-smart-campus',
    message: 'Hi Rahul, I would love to lead the frontend architecture using React and Tailwind CSS. The wheelchair accessibility map looks super impactful.',
    status: 'pending',
    createdAt: '2026-09-24T16:15:00Z'
  },
  {
    id: 'req-maya-drone',
    senderId: 'student-maya',
    receiverId: 'student-ananya',
    projectId: 'proj-drone-vision',
    message: 'Hi Ananya! I can set up the Dockerized container pipeline and edge telemetry streaming for the drone models.',
    status: 'pending',
    createdAt: '2026-09-25T08:00:00Z'
  }
];

export const SEED_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'student-priya',
    receiverId: 'student-rahul',
    projectId: 'proj-smart-campus',
    content: 'Hey Rahul! I just finalized the initial high-fidelity Figma components for the building search screen. The color contrast passes AAA!',
    timestamp: '2026-09-24T18:20:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    senderId: 'student-rahul',
    receiverId: 'student-priya',
    projectId: 'proj-smart-campus',
    content: 'That looks incredible Priya! The layout makes spatial search effortless. I will wire up the PostgreSQL geospatial endpoint for room routing tonight.',
    timestamp: '2026-09-24T18:25:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    senderId: 'student-ananya',
    receiverId: 'student-rahul',
    projectId: 'proj-smart-campus',
    content: 'Hi Rahul, did you get a chance to review my request to join as the ML Engineer? I have our pathfinding dataset pre-processed.',
    timestamp: '2026-09-25T07:15:00Z',
    isRead: false
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'team_request',
    title: 'New Team Request',
    description: 'Ananya Iyer requested to join Smart Campus Navigation as Machine Learning Engineer.',
    timestamp: '2026-09-24T14:30:00Z',
    isRead: false,
    linkTab: 'requests'
  },
  {
    id: 'notif-2',
    type: 'team_request',
    title: 'New Team Request',
    description: 'Alex Chen requested to join Smart Campus Navigation as Frontend Developer.',
    timestamp: '2026-09-24T16:15:00Z',
    isRead: false,
    linkTab: 'requests'
  },
  {
    id: 'notif-3',
    type: 'skill_gap',
    title: 'Skill Gap Warning',
    description: 'Smart Campus Navigation is currently missing a Cloud / DevOps specialist.',
    timestamp: '2026-09-24T10:00:00Z',
    isRead: true,
    linkTab: 'my-team'
  }
];
