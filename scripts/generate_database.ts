import fs from 'fs';
import path from 'path';

interface University {
  id: string;
  name: string;
  domain: string;
  location: string;
  country: string;
  ranking: number;
}

interface StudentAccount {
  id: string;
  universityId: string;
  universityName: string;
  name: string;
  email: string;
  department: string;
  year: string;
  degree: string;
  gpa: number;
  bio: string;
  avatarUrl: string;
  skills: { name: string; proficiency: number; category: string; years: number }[];
  interests: string[];
  roles: string[];
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  availability: {
    hoursPerWeek: number;
    preferences: string[];
  } | null;
  projects: string[];
  achievements: string[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  verified: boolean;
  defaultPassword?: string;
}

const UNIVERSITIES: University[] = [
  { id: 'univ-mit', name: 'Massachusetts Institute of Technology', domain: 'mit.edu', location: 'Cambridge, MA', country: 'USA', ranking: 1 },
  { id: 'univ-stanford', name: 'Stanford University', domain: 'stanford.edu', location: 'Stanford, CA', country: 'USA', ranking: 2 },
  { id: 'univ-berkeley', name: 'University of California, Berkeley', domain: 'berkeley.edu', location: 'Berkeley, CA', country: 'USA', ranking: 3 },
  { id: 'univ-cmu', name: 'Carnegie Mellon University', domain: 'cmu.edu', location: 'Pittsburgh, PA', country: 'USA', ranking: 4 },
  { id: 'univ-gatech', name: 'Georgia Institute of Technology', domain: 'gatech.edu', location: 'Atlanta, GA', country: 'USA', ranking: 5 },
  { id: 'univ-waterloo', name: 'University of Waterloo', domain: 'uwaterloo.ca', location: 'Waterloo, ON', country: 'Canada', ranking: 6 },
  { id: 'univ-uiuc', name: 'University of Illinois Urbana-Champaign', domain: 'illinois.edu', location: 'Urbana, IL', country: 'USA', ranking: 7 },
  { id: 'univ-utaustin', name: 'University of Texas at Austin', domain: 'utexas.edu', location: 'Austin, TX', country: 'USA', ranking: 8 },
  { id: 'univ-columbia', name: 'Columbia University', domain: 'columbia.edu', location: 'New York, NY', country: 'USA', ranking: 9 },
  { id: 'univ-harvard', name: 'Harvard University', domain: 'harvard.edu', location: 'Cambridge, MA', country: 'USA', ranking: 10 },
  { id: 'univ-umich', name: 'University of Michigan', domain: 'umich.edu', location: 'Ann Arbor, MI', country: 'USA', ranking: 11 },
  { id: 'univ-iitd', name: 'Indian Institute of Technology Delhi', domain: 'iitd.ac.in', location: 'New Delhi, India', country: 'India', ranking: 12 },
  { id: 'univ-oxford', name: 'University of Oxford', domain: 'ox.ac.uk', location: 'Oxford, UK', country: 'UK', ranking: 13 },
  { id: 'univ-nus', name: 'National University of Singapore', domain: 'nus.edu.sg', location: 'Singapore', country: 'Singapore', ranking: 14 }
];

const RAW_STUDENTS: Array<Omit<StudentAccount, 'universityName'>> = [
  // 1. Rahul Sharma (Stanford)
  {
    id: 'student-rahul',
    universityId: 'univ-stanford',
    name: 'Rahul Sharma',
    email: 'rahul.s@stanford.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    degree: 'B.S.',
    gpa: 3.92,
    bio: 'Passionate backend engineer building resilient distributed systems and RESTful microservices. Enthusiastic about hackathons and competitive engineering.',
    avatarUrl: '',
    skills: [
      { name: 'Python', proficiency: 90, category: 'Backend', years: 3.5 },
      { name: 'Node.js', proficiency: 85, category: 'Backend', years: 3.0 },
      { name: 'PostgreSQL', proficiency: 88, category: 'Backend', years: 2.5 },
      { name: 'Docker', proficiency: 75, category: 'Cloud/DevOps', years: 2.0 },
      { name: 'FastAPI', proficiency: 82, category: 'Backend', years: 2.0 }
    ],
    interests: ['Distributed Systems', 'Artificial Intelligence', 'Hackathons', 'Cloud Architecture'],
    roles: ['Backend Developer', 'System Architect'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 16, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Campus Transit API', 'Microservice Auth Engine', 'High-throughput Kafka Ingest'],
    achievements: ['1st Place Stanford TreeHacks 2025', 'ACM Student Chapter Lead'],
    githubUrl: 'https://github.com/rahul-sharma-cs',
    linkedinUrl: 'https://linkedin.com/in/rahulsharma-tech',
    portfolioUrl: 'https://rahulsharma.dev',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 2. Priya Patel (Berkeley)
  {
    id: 'student-priya',
    universityId: 'univ-berkeley',
    name: 'Priya Patel',
    email: 'priya.p@berkeley.edu',
    department: 'Design & Human-Computer Interaction',
    year: '3rd Year',
    degree: 'B.A.',
    gpa: 3.88,
    bio: 'Product designer focusing on accessible design systems, user journey psychology, and sleek high-fidelity Figma prototypes with front-of-the-pack polish.',
    avatarUrl: '',
    skills: [
      { name: 'UI/UX', proficiency: 95, category: 'Design/UIUX', years: 3.0 },
      { name: 'Figma', proficiency: 94, category: 'Design/UIUX', years: 3.0 },
      { name: 'Design Systems', proficiency: 90, category: 'Design/UIUX', years: 2.5 },
      { name: 'React', proficiency: 60, category: 'Frontend', years: 1.5 },
      { name: 'User Research', proficiency: 88, category: 'Design/UIUX', years: 2.5 }
    ],
    interests: ['Product Design', 'Human-Computer Interaction', 'Design Systems', 'EdTech'],
    roles: ['UI/UX Designer', 'Product Designer'],
    experience: 'Intermediate',
    availability: { hoursPerWeek: 14, preferences: ['Evenings', 'Weekends'] },
    projects: ['Student Mental Wellness App UI', 'Redesign of CalCentral Student Portal'],
    achievements: ['Best Design Award - CalHacks', 'Adobe Creative Scholar 2025'],
    githubUrl: 'https://github.com/priyapatel-design',
    linkedinUrl: 'https://linkedin.com/in/priyapatel-uiux',
    portfolioUrl: 'https://priyapatel.design',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 3. Ananya Iyer (MIT)
  {
    id: 'student-ananya',
    universityId: 'univ-mit',
    name: 'Ananya Iyer',
    email: 'ananya.i@mit.edu',
    department: 'Artificial Intelligence & Data Science',
    year: '4th Year',
    degree: 'M.Eng',
    gpa: 3.98,
    bio: 'Deep learning researcher specializing in computer vision, spatial clustering, and autonomous route prediction pipelines at MIT CSAIL.',
    avatarUrl: '',
    skills: [
      { name: 'Machine Learning', proficiency: 96, category: 'AI/ML', years: 4.0 },
      { name: 'Python', proficiency: 92, category: 'Backend', years: 4.0 },
      { name: 'PyTorch', proficiency: 90, category: 'AI/ML', years: 3.5 },
      { name: 'Computer Vision', proficiency: 88, category: 'AI/ML', years: 3.0 },
      { name: 'Data Science', proficiency: 85, category: 'Data', years: 3.0 }
    ],
    interests: ['Deep Learning', 'Autonomous Systems', 'Research', 'Robotics'],
    roles: ['Machine Learning Engineer', 'Researcher'],
    experience: 'Expert',
    availability: { hoursPerWeek: 18, preferences: ['Weekdays', 'Weekends'] },
    projects: ['Drone Path Predictor', 'Multimodal Medical Diagnosis Model', 'Autonomous Rover Perception'],
    achievements: ['Co-author on CVPR Workshop Paper', 'Kaggle Master', 'MIT Presidential Fellow'],
    githubUrl: 'https://github.com/ananya-mit-ai',
    linkedinUrl: 'https://linkedin.com/in/ananyaiyer-ml',
    portfolioUrl: 'https://ananyaiyer.ai',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 4. Alex Chen (CMU)
  {
    id: 'student-alex',
    universityId: 'univ-cmu',
    name: 'Alex Chen',
    email: 'alex.c@cmu.edu',
    department: 'Software Engineering',
    year: '2nd Year',
    degree: 'B.S.',
    gpa: 3.85,
    bio: 'Frontend enthusiast crafting fluid, responsive interfaces with modern React, TypeScript, and micro-animations. Obsessed with 60fps web performance.',
    avatarUrl: '',
    skills: [
      { name: 'React', proficiency: 92, category: 'Frontend', years: 2.5 },
      { name: 'TypeScript', proficiency: 88, category: 'Frontend', years: 2.5 },
      { name: 'Tailwind CSS', proficiency: 90, category: 'Frontend', years: 2.0 },
      { name: 'Next.js', proficiency: 82, category: 'Frontend', years: 2.0 },
      { name: 'UI/UX', proficiency: 70, category: 'Design/UIUX', years: 1.5 }
    ],
    interests: ['Web Performance', 'Design Systems', 'Interactive Graphics', 'Open Source'],
    roles: ['Frontend Developer'],
    experience: 'Intermediate',
    availability: { hoursPerWeek: 15, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Collaborative Whiteboard Canvas', 'College Course Planner SPA', 'Shader Toy Experiments'],
    achievements: ['Major Open Source Contributor to Lucide', 'TartnHacks Finalist'],
    githubUrl: 'https://github.com/alexc-dev',
    linkedinUrl: 'https://linkedin.com/in/alexchen-fe',
    portfolioUrl: 'https://alexchen.dev',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 5. Siddharth Roy (Waterloo)
  {
    id: 'student-siddharth',
    universityId: 'univ-waterloo',
    name: 'Siddharth Roy',
    email: 'siddharth.r@uwaterloo.ca',
    department: 'Computer Science',
    year: '3rd Year',
    degree: 'B.Math',
    gpa: 3.91,
    bio: 'Backend developer focused strictly on Python, database indexing, and query tuning. Has identical skill coverage to Rahul to showcase duplicate role dynamics.',
    avatarUrl: '',
    skills: [
      { name: 'Python', proficiency: 88, category: 'Backend', years: 3.0 },
      { name: 'PostgreSQL', proficiency: 85, category: 'Backend', years: 2.5 },
      { name: 'FastAPI', proficiency: 80, category: 'Backend', years: 2.0 },
      { name: 'Docker', proficiency: 70, category: 'Cloud/DevOps', years: 1.5 }
    ],
    interests: ['Distributed Systems', 'Cloud Architecture', 'Databases'],
    roles: ['Backend Developer'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 15, preferences: ['Weekdays', 'Evenings'] },
    projects: ['High-throughput Log Ingestion Engine', 'Distributed Key-Value Store'],
    achievements: ['PostgreSQL Certification', 'Waterloo Hack the North Winner'],
    githubUrl: 'https://github.com/siddharth-roy-uw',
    linkedinUrl: 'https://linkedin.com/in/siddharthroy-cs',
    portfolioUrl: 'https://siddharthroy.me',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 6. Maya Lin (Georgia Tech)
  {
    id: 'student-maya',
    universityId: 'univ-gatech',
    name: 'Maya Lin',
    email: 'maya.l@gatech.edu',
    department: 'Information Technology',
    year: '3rd Year',
    degree: 'B.S.',
    gpa: 3.82,
    bio: 'DevOps & Cloud architecture specialist. Bridges developer code with resilient Kubernetes clusters, Terraform infrastructure, and continuous integration pipelines.',
    avatarUrl: '',
    skills: [
      { name: 'Cloud', proficiency: 92, category: 'Cloud/DevOps', years: 3.0 },
      { name: 'Docker', proficiency: 90, category: 'Cloud/DevOps', years: 3.0 },
      { name: 'DevOps', proficiency: 88, category: 'Cloud/DevOps', years: 2.5 },
      { name: 'Node.js', proficiency: 75, category: 'Backend', years: 2.0 },
      { name: 'Linux', proficiency: 85, category: 'Cloud/DevOps', years: 3.0 }
    ],
    interests: ['Cloud Infrastructure', 'Cybersecurity', 'Automation', 'DevOps'],
    roles: ['DevOps Engineer', 'Cloud Architect'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 12, preferences: ['Weekends', 'Evenings'] },
    projects: ['Multi-Cloud Cluster Orchestrator', 'GitOps Infrastructure Pipeline'],
    achievements: ['AWS Certified Solutions Architect Associate', 'HackGT Cloud Prize'],
    githubUrl: 'https://github.com/mayalin-infra',
    linkedinUrl: 'https://linkedin.com/in/mayalin-devops',
    portfolioUrl: 'https://mayalin.cloud',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 7. Kevin Zhang (UIUC)
  {
    id: 'student-kevin',
    universityId: 'univ-uiuc',
    name: 'Kevin Zhang',
    email: 'kevin.z@illinois.edu',
    department: 'Electrical & Computer Engineering',
    year: '2nd Year',
    degree: 'B.S.',
    gpa: 3.79,
    bio: 'Embedded software & IoT tinkerer. Has not filled in availability details yet to prove missing data weight redistribution.',
    avatarUrl: '',
    skills: [
      { name: 'Python', proficiency: 85, category: 'Backend', years: 2.0 },
      { name: 'C++', proficiency: 88, category: 'Backend', years: 2.5 },
      { name: 'IoT', proficiency: 82, category: 'Other', years: 2.0 }
    ],
    interests: ['Robotics', 'Hardware', 'Smart Devices'],
    roles: ['Embedded Systems Engineer'],
    experience: 'Intermediate',
    availability: null, // Intentionally null for Case 5
    projects: ['Smart Campus Sensor Node', 'CAN Bus Telemetry Reader'],
    achievements: ['UIUC Robotics Club Hardware Lead', 'IEEE Student Project Award'],
    githubUrl: 'https://github.com/kevinzhang-ece',
    linkedinUrl: 'https://linkedin.com/in/kevinzhang-embedded',
    portfolioUrl: 'https://kevinzhang.dev',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 8. Sara Al-Mansoor (Columbia)
  {
    id: 'student-sara',
    universityId: 'univ-columbia',
    name: 'Sara Al-Mansoor',
    email: 'sara.a@columbia.edu',
    department: 'Design',
    year: '1st Year',
    degree: 'B.A.',
    gpa: 3.75,
    bio: 'Passionate graphic design student eager to team up on hackathons. Has not filled in project interests yet.',
    avatarUrl: '',
    skills: [
      { name: 'UI/UX', proficiency: 88, category: 'Design/UIUX', years: 1.5 },
      { name: 'Figma', proficiency: 85, category: 'Design/UIUX', years: 1.5 }
    ],
    interests: [], // Intentionally empty for Case 6
    roles: ['UI/UX Designer'],
    experience: 'Beginner',
    availability: { hoursPerWeek: 10, preferences: ['Weekends'] },
    projects: ['Campus Sustainability Campaign Poster Series'],
    achievements: ['First-Year Creative Arts Fellow at Columbia'],
    githubUrl: 'https://github.com/sara-almansoor',
    linkedinUrl: 'https://linkedin.com/in/sara-almansoor',
    portfolioUrl: 'https://saraalmansoor.art',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 9. Marcus Vance (Harvard)
  {
    id: 'student-marcus',
    universityId: 'univ-harvard',
    name: 'Marcus Vance',
    email: 'marcus.v@harvard.edu',
    department: 'Computer Science & Economics',
    year: '4th Year',
    degree: 'A.B.',
    gpa: 3.96,
    bio: 'Full-stack software engineer & fintech founder. Built automated arbitrage engines, decentralized liquidity pools, and predictive financial models.',
    avatarUrl: '',
    skills: [
      { name: 'Go', proficiency: 92, category: 'Backend', years: 3.5 },
      { name: 'React', proficiency: 86, category: 'Frontend', years: 3.0 },
      { name: 'TypeScript', proficiency: 90, category: 'Frontend', years: 3.0 },
      { name: 'PostgreSQL', proficiency: 88, category: 'Backend', years: 2.5 },
      { name: 'Solidity', proficiency: 80, category: 'Backend', years: 2.0 }
    ],
    interests: ['FinTech', 'Decentralized Finance', 'Macroeconomics', 'Startups'],
    roles: ['Full Stack Developer', 'Product Manager'],
    experience: 'Expert',
    availability: { hoursPerWeek: 20, preferences: ['Weekdays', 'Evenings', 'Weekends'] },
    projects: ['Peer-to-Peer Campus Lending Protocol', 'High-Frequency Orderbook Simulator'],
    achievements: ['Harvard Innovation Labs Grantee ($15k)', 'Forbes Under 30 Scholar'],
    githubUrl: 'https://github.com/marcusvance',
    linkedinUrl: 'https://linkedin.com/in/marcus-vance-fintech',
    portfolioUrl: 'https://marcusvance.io',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 10. Elena Rostova (MIT)
  {
    id: 'student-elena',
    universityId: 'univ-mit',
    name: 'Elena Rostova',
    email: 'elena.r@mit.edu',
    department: 'Electrical Engineering & Computer Science',
    year: 'Masters',
    degree: 'M.S.',
    gpa: 4.0,
    bio: 'Cybersecurity researcher focused on zero-knowledge cryptography, binary exploitation, and hardware security tokens.',
    avatarUrl: '',
    skills: [
      { name: 'Cybersecurity', proficiency: 98, category: 'Other', years: 4.5 },
      { name: 'C++', proficiency: 94, category: 'Backend', years: 4.0 },
      { name: 'Rust', proficiency: 91, category: 'Backend', years: 3.0 },
      { name: 'Linux', proficiency: 95, category: 'Cloud/DevOps', years: 4.0 },
      { name: 'Python', proficiency: 89, category: 'Backend', years: 3.5 }
    ],
    interests: ['Cryptography', 'Reverse Engineering', 'Ethical Hacking', 'Kernel Dev'],
    roles: ['Security Engineer', 'System Architect'],
    experience: 'Expert',
    availability: { hoursPerWeek: 16, preferences: ['Weekdays', 'Evenings'] },
    projects: ['ZK-Rollup Proof Verifier', 'Automated Fuzzing Framework for Linux Drivers'],
    achievements: ['DEF CON CTF Finalist', 'MIT EECS Masterworks Best Thesis Award'],
    githubUrl: 'https://github.com/elena-rostova-sec',
    linkedinUrl: 'https://linkedin.com/in/elena-rostova-cyber',
    portfolioUrl: 'https://elenarostova.security',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 11. David Kim (UC Berkeley)
  {
    id: 'student-david',
    universityId: 'univ-berkeley',
    name: 'David Kim',
    email: 'david.k@berkeley.edu',
    department: 'Data Science & Statistics',
    year: '3rd Year',
    degree: 'B.S.',
    gpa: 3.86,
    bio: 'Data scientist transforming unstructured big data into actionable models. Proficient in Apache Spark, dbt, SQL, and interactive dashboards.',
    avatarUrl: '',
    skills: [
      { name: 'Data Science', proficiency: 94, category: 'Data', years: 3.0 },
      { name: 'Python', proficiency: 91, category: 'Backend', years: 3.0 },
      { name: 'PostgreSQL', proficiency: 90, category: 'Backend', years: 3.0 },
      { name: 'Machine Learning', proficiency: 86, category: 'AI/ML', years: 2.5 },
      { name: 'Tableau', proficiency: 84, category: 'Data', years: 2.0 }
    ],
    interests: ['Big Data', 'Quantitative Finance', 'Sports Analytics', 'Data Journalism'],
    roles: ['Data Scientist', 'Machine Learning Engineer'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 15, preferences: ['Evenings', 'Weekends'] },
    projects: ['NBA Player Trajectory Performance Engine', 'Voter Turnout Geospatial Visualizer'],
    achievements: ['Kaggle Competitions Grandmaster', 'UC Berkeley Data Science Fellow'],
    githubUrl: 'https://github.com/davidkim-data',
    linkedinUrl: 'https://linkedin.com/in/davidkim-datascience',
    portfolioUrl: 'https://davidkim.analytics',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 12. Sofia Morales (UT Austin)
  {
    id: 'student-sofia',
    universityId: 'univ-utaustin',
    name: 'Sofia Morales',
    email: 'sofia.m@utexas.edu',
    department: 'Mobile Computing & Interactive Media',
    year: '2nd Year',
    degree: 'B.S.',
    gpa: 3.89,
    bio: 'Mobile application developer passionate about native iOS (Swift/SwiftUI) and cross-platform Flutter. Built apps with 50k+ App Store downloads.',
    avatarUrl: '',
    skills: [
      { name: 'Swift', proficiency: 94, category: 'Mobile', years: 3.0 },
      { name: 'iOS Development', proficiency: 92, category: 'Mobile', years: 3.0 },
      { name: 'Flutter', proficiency: 85, category: 'Mobile', years: 2.0 },
      { name: 'Firebase', proficiency: 82, category: 'Cloud/DevOps', years: 2.0 },
      { name: 'UI/UX', proficiency: 78, category: 'Design/UIUX', years: 1.5 }
    ],
    interests: ['Mobile HCI', 'ARKit', 'Fitness Tech', 'Accessibility'],
    roles: ['Mobile Developer', 'UI/UX Designer'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 18, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Campus Habit Tracker iOS App', 'AR Indoor Navigation for Large Lecture Halls'],
    achievements: ['Apple WWDC Swift Student Challenge Winner 2025', 'UT Austin Best Mobile App'],
    githubUrl: 'https://github.com/sofiamorales-dev',
    linkedinUrl: 'https://linkedin.com/in/sofiamorales-ios',
    portfolioUrl: 'https://sofiamorales.app',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 13. Tenzin Norbu (Stanford)
  {
    id: 'student-tenzin',
    universityId: 'univ-stanford',
    name: 'Tenzin Norbu',
    email: 'tenzin.n@stanford.edu',
    department: 'Artificial Intelligence & Linguistics',
    year: '4th Year',
    degree: 'B.S.',
    gpa: 3.94,
    bio: 'NLP researcher focused on low-resource language translation, instruction-tuning LLMs, and synthetic benchmark generation.',
    avatarUrl: '',
    skills: [
      { name: 'Natural Language Processing', proficiency: 96, category: 'AI/ML', years: 3.5 },
      { name: 'Python', proficiency: 93, category: 'Backend', years: 4.0 },
      { name: 'PyTorch', proficiency: 92, category: 'AI/ML', years: 3.5 },
      { name: 'HuggingFace', proficiency: 95, category: 'AI/ML', years: 3.0 },
      { name: 'FastAPI', proficiency: 80, category: 'Backend', years: 2.0 }
    ],
    interests: ['Large Language Models', 'Multilingual AI', 'Computational Linguistics', 'Ethics in AI'],
    roles: ['Machine Learning Engineer', 'Researcher'],
    experience: 'Expert',
    availability: { hoursPerWeek: 16, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Himalayan Dialect Neural Translator', 'Hallucination Detector for Medical QA'],
    achievements: ['ACL 2025 Student Co-author', 'Stanford Center for Human-Centered AI Fellow'],
    githubUrl: 'https://github.com/tenzin-norbu-nlp',
    linkedinUrl: 'https://linkedin.com/in/tenzinnorbu-ai',
    portfolioUrl: 'https://tenzinnorbu.ai',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 14. Chloe Dubois (Carnegie Mellon)
  {
    id: 'student-chloe',
    universityId: 'univ-cmu',
    name: 'Chloe Dubois',
    email: 'chloe.d@cmu.edu',
    department: 'Robotics Institute',
    year: 'Masters',
    degree: 'M.S. Robotics',
    gpa: 3.97,
    bio: 'Robotics engineer specializing in autonomous path planning, ROS2, SLAM algorithms, and physical quadruped robots.',
    avatarUrl: '',
    skills: [
      { name: 'ROS2', proficiency: 95, category: 'Other', years: 3.5 },
      { name: 'C++', proficiency: 93, category: 'Backend', years: 4.0 },
      { name: 'Python', proficiency: 88, category: 'Backend', years: 3.5 },
      { name: 'Robotics', proficiency: 96, category: 'Other', years: 4.0 },
      { name: 'Linux', proficiency: 89, category: 'Cloud/DevOps', years: 3.0 }
    ],
    interests: ['Autonomous Navigation', 'Quadruped Dynamics', 'Perception', 'Space Exploration'],
    roles: ['Robotics Engineer', 'Embedded Systems Engineer'],
    experience: 'Expert',
    availability: { hoursPerWeek: 20, preferences: ['Weekdays', 'Weekends'] },
    projects: ['Subterranean Terrain Mapping Rover', 'Hexapod Kinematics Controller'],
    achievements: ['NASA Space Grant Scholar', 'CMU Robotics Showcase 1st Place'],
    githubUrl: 'https://github.com/chloe-dubois-robotics',
    linkedinUrl: 'https://linkedin.com/in/chloedubois-robotics',
    portfolioUrl: 'https://chloedubois.space',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 15. Arjun Narang (IIT Delhi)
  {
    id: 'student-arjun',
    universityId: 'univ-iitd',
    name: 'Arjun Narang',
    email: 'arjun.n@iitd.ac.in',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    degree: 'B.Tech',
    gpa: 3.95,
    bio: 'Competitive programmer and system architect. Candidate Master on Codeforces, top 0.1% JEE Advanced ranker, building low-latency C++ engines.',
    avatarUrl: '',
    skills: [
      { name: 'C++', proficiency: 98, category: 'Backend', years: 4.5 },
      { name: 'Algorithms', proficiency: 99, category: 'Other', years: 5.0 },
      { name: 'Go', proficiency: 88, category: 'Backend', years: 2.5 },
      { name: 'System Design', proficiency: 90, category: 'Backend', years: 3.0 },
      { name: 'Linux', proficiency: 88, category: 'Cloud/DevOps', years: 3.0 }
    ],
    interests: ['Competitive Programming', 'Low-Latency Trading', 'Kernel Optimization'],
    roles: ['Backend Developer', 'System Architect'],
    experience: 'Expert',
    availability: { hoursPerWeek: 16, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Lock-Free High Frequency Matching Engine', 'Custom Memory Allocator'],
    achievements: ['ICPC World Finals Qualifier 2025', 'Codeforces Candidate Master (Rating 2050)'],
    githubUrl: 'https://github.com/arjunnarang-iitd',
    linkedinUrl: 'https://linkedin.com/in/arjunnarang-cs',
    portfolioUrl: 'https://arjunnarang.code',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 16. Jessica Williams (University of Michigan)
  {
    id: 'student-jessica',
    universityId: 'univ-umich',
    name: 'Jessica Williams',
    email: 'jessica.w@umich.edu',
    department: 'School of Information',
    year: '3rd Year',
    degree: 'B.S. Information',
    gpa: 3.84,
    bio: 'Product manager and UX strategist who aligns engineering sprint velocity with real customer retention and market discovery.',
    avatarUrl: '',
    skills: [
      { name: 'Product Management', proficiency: 94, category: 'Other', years: 3.0 },
      { name: 'User Research', proficiency: 90, category: 'Design/UIUX', years: 2.5 },
      { name: 'UI/UX', proficiency: 82, category: 'Design/UIUX', years: 2.0 },
      { name: 'SQL', proficiency: 84, category: 'Data', years: 2.0 },
      { name: 'Figma', proficiency: 80, category: 'Design/UIUX', years: 2.0 }
    ],
    interests: ['Product Strategy', 'SaaS Growth', 'User Behavioral Analytics', 'Venture Capital'],
    roles: ['Product Manager', 'UI/UX Designer'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 14, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Campus RideShare Matching MVP', 'B2B Procurement Feedback Dashboard'],
    achievements: ['President of Michigan Product Club', 'MHacks Best Business Pitch'],
    githubUrl: 'https://github.com/jessicawilliams-pm',
    linkedinUrl: 'https://linkedin.com/in/jessica-williams-pm',
    portfolioUrl: 'https://jessicawilliams.pm',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 17. Liam Gallagher (Oxford)
  {
    id: 'student-liam',
    universityId: 'univ-oxford',
    name: 'Liam Gallagher',
    email: 'liam.g@ox.ac.uk',
    department: 'Department of Computer Science',
    year: 'PhD',
    degree: 'DPhil',
    gpa: 4.0,
    bio: 'Theoretical computer scientist researching quantum error-correcting codes, formal verification with Coq/Lean, and categorical semantics.',
    avatarUrl: '',
    skills: [
      { name: 'Haskell', proficiency: 95, category: 'Backend', years: 4.0 },
      { name: 'Rust', proficiency: 92, category: 'Backend', years: 3.5 },
      { name: 'Formal Verification', proficiency: 96, category: 'Other', years: 4.0 },
      { name: 'Python', proficiency: 85, category: 'Backend', years: 3.0 },
      { name: 'Algorithms', proficiency: 96, category: 'Other', years: 4.5 }
    ],
    interests: ['Quantum Computing', 'Formal Methods', 'Type Theory', 'Category Theory'],
    roles: ['Researcher', 'System Architect'],
    experience: 'Expert',
    availability: { hoursPerWeek: 12, preferences: ['Weekdays'] },
    projects: ['Verified Consensus Protocol in Lean 4', 'Topological Quantum Code Simulator'],
    achievements: ['Clarendon Scholarship at Oxford', 'POPL 2025 Paper Author'],
    githubUrl: 'https://github.com/liam-gallagher-ox',
    linkedinUrl: 'https://linkedin.com/in/liam-gallagher-dphil',
    portfolioUrl: 'https://liamgallagher.oxford',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 18. Aisha Al-Hassan (National University of Singapore)
  {
    id: 'student-aisha',
    universityId: 'univ-nus',
    name: 'Aisha Al-Hassan',
    email: 'aisha.h@nus.edu.sg',
    department: 'School of Computing',
    year: '3rd Year',
    degree: 'B.Comp',
    gpa: 3.91,
    bio: 'Full stack web engineer specializing in enterprise Next.js applications, GraphQL architectures, and high-performance serverless cloud topologies.',
    avatarUrl: '',
    skills: [
      { name: 'Next.js', proficiency: 94, category: 'Frontend', years: 3.0 },
      { name: 'React', proficiency: 93, category: 'Frontend', years: 3.0 },
      { name: 'TypeScript', proficiency: 91, category: 'Frontend', years: 3.0 },
      { name: 'GraphQL', proficiency: 88, category: 'Backend', years: 2.5 },
      { name: 'Tailwind CSS', proficiency: 92, category: 'Frontend', years: 2.5 }
    ],
    interests: ['Full Stack Web', 'Cloud-Native Architecture', 'Fintech', 'Developer Tooling'],
    roles: ['Frontend Developer', 'Full Stack Developer'],
    experience: 'Advanced',
    availability: { hoursPerWeek: 16, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Global Cross-Border Micro-payment Portal', 'Smart Academic Schedule Optimizer'],
    achievements: ['NUS Hack&Roll Overall Champion 2025', 'AWS Certified Developer'],
    githubUrl: 'https://github.com/aisha-h-nus',
    linkedinUrl: 'https://linkedin.com/in/aisha-alhassan-dev',
    portfolioUrl: 'https://aishahassan.dev',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 19. Nathan Drake (Waterloo)
  {
    id: 'student-nathan',
    universityId: 'univ-waterloo',
    name: 'Nathan Drake',
    email: 'nathan.d@uwaterloo.ca',
    department: 'Systems Design Engineering',
    year: '4th Year',
    degree: 'B.A.Sc',
    gpa: 3.87,
    bio: 'Hardware-software co-designer with 6 coop internships across Tesla, Apple, and Palantir. Specializes in FPGA synthesis and high-speed bus interfaces.',
    avatarUrl: '',
    skills: [
      { name: 'Verilog', proficiency: 92, category: 'Other', years: 3.5 },
      { name: 'C++', proficiency: 90, category: 'Backend', years: 3.5 },
      { name: 'FPGA', proficiency: 91, category: 'Other', years: 3.0 },
      { name: 'Python', proficiency: 86, category: 'Backend', years: 3.0 },
      { name: 'Linux', proficiency: 88, category: 'Cloud/DevOps', years: 3.0 }
    ],
    interests: ['FPGA Acceleration', 'Hardware Design', 'Embedded Linux', 'Automotive Systems'],
    roles: ['Embedded Systems Engineer', 'System Architect'],
    experience: 'Expert',
    availability: { hoursPerWeek: 15, preferences: ['Evenings', 'Weekends'] },
    projects: ['Real-time Raytracing Accelerator on Xilinx FPGA', 'CAN-FD Data Logger'],
    achievements: ['Waterloo Capstone Best Hardware Award', 'Published in IEEE Embedded Systems'],
    githubUrl: 'https://github.com/nathandrake-uwaterloo',
    linkedinUrl: 'https://linkedin.com/in/nathan-drake-syde',
    portfolioUrl: 'https://nathandrake.eng',
    verified: true,
    defaultPassword: 'Password123!'
  },
  // 20. Zoe Sterling (Stanford)
  {
    id: 'student-zoe',
    universityId: 'univ-stanford',
    name: 'Zoe Sterling',
    email: 'zoe.s@stanford.edu',
    department: 'Symbolic Systems',
    year: '2nd Year',
    degree: 'B.S.',
    gpa: 3.93,
    bio: 'Cognitive scientist and frontend engineer investigating spatial user interfaces and augmented reality interactions for neurodiverse students.',
    avatarUrl: '',
    skills: [
      { name: 'React', proficiency: 89, category: 'Frontend', years: 2.0 },
      { name: 'TypeScript', proficiency: 85, category: 'Frontend', years: 2.0 },
      { name: 'Three.js', proficiency: 88, category: 'Frontend', years: 2.0 },
      { name: 'UI/UX', proficiency: 91, category: 'Design/UIUX', years: 2.5 },
      { name: 'Figma', proficiency: 87, category: 'Design/UIUX', years: 2.0 }
    ],
    interests: ['Spatial Computing', 'WebXR', 'Cognitive Ergonomics', 'Assistive Tech'],
    roles: ['Frontend Developer', 'UI/UX Designer'],
    experience: 'Intermediate',
    availability: { hoursPerWeek: 15, preferences: ['Weekdays', 'Evenings'] },
    projects: ['Spatial Memory Palace 3D Web App', 'Assistive Reading Chrome Extension'],
    achievements: ['Stanford SymSys Undergraduate Fellow', 'HackMIT Accessibility Track Winner'],
    githubUrl: 'https://github.com/zoesterling',
    linkedinUrl: 'https://linkedin.com/in/zoe-sterling-symsys',
    portfolioUrl: 'https://zoesterling.space',
    verified: true,
    defaultPassword: 'Password123!'
  }
];

// Generate an additional 30 accounts programmatically with diverse universities, realistic names, roles, skills, and bios to reach 50+ real accounts
const FIRST_NAMES = ['Kavita', 'Lucas', 'Fatima', 'Dmitry', 'Isabella', 'Takeshi', 'Mia', 'Mateo', 'Hannah', 'Zara', 'Ethan', 'Chloe', 'Jin', 'Amara', 'Oscar', 'Devi', 'Gabriel', 'Svetlana', 'Rohan', 'Camila', 'Julian', 'Mei-Ling', 'Frederik', 'Leila', 'Samir', 'Olga', 'Victor', 'Nia', 'Kenji', 'Tara'];
const LAST_NAMES = ['Reddy', 'Santos', 'Al-Zaidi', 'Volkov', 'Rossi', 'Takahashi', 'Schmidt', 'Silva', 'Lindqvist', 'Nasser', 'Bauer', 'Kovacs', 'Park', 'Okafor', 'Mueller', 'Menon', 'Costa', 'Petrova', 'Verma', 'Gomez', 'Novak', 'Zhao', 'Hansen', 'Toure', 'Kapadia', 'Smirnova', 'Dupont', 'Kimathi', 'Tanaka', 'Bhatia'];

const DEPARTMENTS = [
  'Computer Science',
  'Software Engineering',
  'Electrical & Computer Engineering',
  'Data Science & Analytics',
  'Design & Human Computer Interaction',
  'Artificial Intelligence',
  'Computational Biology',
  'Information Systems'
];

const ROLES_POOL = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Machine Learning Engineer',
  'UI/UX Designer',
  'Product Designer',
  'DevOps Engineer',
  'Data Scientist',
  'Mobile Developer',
  'Security Engineer',
  'System Architect',
  'Product Manager',
  'Researcher',
  'Embedded Systems Engineer'
];

const SKILLS_LIBRARY = [
  { name: 'React', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Go', category: 'Backend' },
  { name: 'PostgreSQL', category: 'Backend' },
  { name: 'FastAPI', category: 'Backend' },
  { name: 'Rust', category: 'Backend' },
  { name: 'C++', category: 'Backend' },
  { name: 'Machine Learning', category: 'AI/ML' },
  { name: 'PyTorch', category: 'AI/ML' },
  { name: 'Computer Vision', category: 'AI/ML' },
  { name: 'Natural Language Processing', category: 'AI/ML' },
  { name: 'UI/UX', category: 'Design/UIUX' },
  { name: 'Figma', category: 'Design/UIUX' },
  { name: 'Design Systems', category: 'Design/UIUX' },
  { name: 'Cloud', category: 'Cloud/DevOps' },
  { name: 'Docker', category: 'Cloud/DevOps' },
  { name: 'Kubernetes', category: 'Cloud/DevOps' },
  { name: 'Data Science', category: 'Data' },
  { name: 'Swift', category: 'Mobile' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'Cybersecurity', category: 'Other' },
  { name: 'Product Management', category: 'Other' }
];

const GENERATED_STUDENTS: StudentAccount[] = [];

// First add the 20 handcrafted students with full details
RAW_STUDENTS.forEach(student => {
  const uni = UNIVERSITIES.find(u => u.id === student.universityId) || UNIVERSITIES[0];
  GENERATED_STUDENTS.push({
    ...student,
    universityName: uni.name
  });
});

// Now generate 32 more students to have a grand total of 52 verified collegiate accounts
for (let i = 0; i < 32; i++) {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[i % LAST_NAMES.length];
  const fullName = `${firstName} ${lastName}`;
  const uni = UNIVERSITIES[i % UNIVERSITIES.length];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${uni.domain}`;
  const dept = DEPARTMENTS[i % DEPARTMENTS.length];
  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Masters'];
  const year = yearOptions[i % yearOptions.length];
  const primaryRole = ROLES_POOL[i % ROLES_POOL.length];
  const secondaryRole = ROLES_POOL[(i + 3) % ROLES_POOL.length];

  // Pick 4-5 relevant skills
  const skillsCount = 4 + (i % 2);
  const studentSkills = [];
  const startSkillIdx = (i * 3) % SKILLS_LIBRARY.length;
  for (let s = 0; s < skillsCount; s++) {
    const skillRef = SKILLS_LIBRARY[(startSkillIdx + s) % SKILLS_LIBRARY.length];
    const proficiency = 72 + ((i * 7 + s * 11) % 26); // 72 to 98
    const years = +(1.5 + ((i + s) % 3) * 0.8).toFixed(1);
    studentSkills.push({
      name: skillRef.name,
      proficiency,
      category: skillRef.category,
      years
    });
  }

  const expLevels: ('Beginner' | 'Intermediate' | 'Advanced' | 'Expert')[] = ['Intermediate', 'Advanced', 'Expert', 'Intermediate'];
  const experience = expLevels[i % expLevels.length];

  GENERATED_STUDENTS.push({
    id: `student-gen-${i + 21}`,
    universityId: uni.id,
    universityName: uni.name,
    name: fullName,
    email,
    department: dept,
    year,
    degree: year === 'Masters' ? 'M.S.' : 'B.S.',
    gpa: +(3.65 + ((i * 13) % 35) / 100).toFixed(2),
    bio: `${experience} ${primaryRole} at ${uni.name}. Eager to collaborate on high-impact projects, hackathons, and research publications in ${dept}.`,
    avatarUrl: '',
    skills: studentSkills,
    interests: [primaryRole, 'Open Source', 'Hackathons', 'Scalable Systems', 'Tech For Good'],
    roles: [primaryRole, secondaryRole],
    experience,
    availability: {
      hoursPerWeek: 12 + (i % 8),
      preferences: i % 2 === 0 ? ['Weekdays', 'Evenings'] : ['Evenings', 'Weekends']
    },
    projects: [`${dept.split(' ')[0]} Capstone Platform`, 'Open Source Contribution Sprint'],
    achievements: [`Dean's Honors List at ${uni.name}`, `${uni.name} Innovation Challenge Finalist`],
    githubUrl: `https://github.com/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    portfolioUrl: `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.dev`,
    verified: true,
    defaultPassword: 'Password123!'
  });
}

// Write database/accounts.json
fs.mkdirSync('./database', { recursive: true });
fs.writeFileSync(
  './database/accounts.json',
  JSON.stringify(
    {
      meta: {
        totalAccounts: GENERATED_STUDENTS.length,
        universitiesCount: UNIVERSITIES.length,
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      },
      universities: UNIVERSITIES,
      students: GENERATED_STUDENTS
    },
    null,
    2
  )
);

// Generate database/seeds.sql
let sql = `-- TeamSync Complete Relational Database Seed Script\n`;
sql += `-- Generated: ${new Date().toISOString()}\n`;
sql += `-- Total Accounts: ${GENERATED_STUDENTS.length} Verified Collegiate Students\n\n`;

UNIVERSITIES.forEach(u => {
  sql += `INSERT INTO universities (id, name, domain, location, country, ranking) VALUES ('${u.id}', '${u.name.replace(/'/g, "''")}', '${u.domain}', '${u.location.replace(/'/g, "''")}', '${u.country}', ${u.ranking}) ON CONFLICT (id) DO NOTHING;\n`;
});
sql += `\n`;

GENERATED_STUDENTS.forEach(s => {
  const bioEscaped = (s.bio || '').replace(/'/g, "''");
  const nameEscaped = s.name.replace(/'/g, "''");
  const availPrefs = s.availability ? JSON.stringify(s.availability.preferences).replace(/'/g, "''") : '[]';
  const hours = s.availability ? s.availability.hoursPerWeek : 0;
  
  sql += `INSERT INTO students (id, university_id, full_name, email, password_hash, department, academic_year, degree, bio, gpa, experience_level, hours_per_week, availability_prefs, github_url, linkedin_url, portfolio_url, verified_student) VALUES ('${s.id}', '${s.universityId}', '${nameEscaped}', '${s.email}', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '${s.department}', '${s.year}', '${s.degree}', '${bioEscaped}', ${s.gpa}, '${s.experience}', ${hours}, '${availPrefs}', '${s.githubUrl}', '${s.linkedinUrl}', '${s.portfolioUrl}', TRUE) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;\n`;

  s.skills.forEach((sk, idx) => {
    sql += `INSERT INTO student_skills (id, student_id, skill_name, proficiency_score, category, years_experience) VALUES ('sk-${s.id}-${idx}', '${s.id}', '${sk.name}', ${sk.proficiency}, '${sk.category}', ${sk.years}) ON CONFLICT (id) DO NOTHING;\n`;
  });

  s.roles.forEach((r, idx) => {
    sql += `INSERT INTO student_roles (id, student_id, role_name, is_primary) VALUES ('ro-${s.id}-${idx}', '${s.id}', '${r}', ${idx === 0 ? 'TRUE' : 'FALSE'}) ON CONFLICT (id) DO NOTHING;\n`;
  });

  s.interests.forEach((intr, idx) => {
    sql += `INSERT INTO student_interests (id, student_id, interest_tag) VALUES ('in-${s.id}-${idx}', '${s.id}', '${intr.replace(/'/g, "''")}') ON CONFLICT (id) DO NOTHING;\n`;
  });

  sql += `\n`;
});

fs.writeFileSync('./database/seeds.sql', sql);
console.log(`Successfully generated database/accounts.json and database/seeds.sql with ${GENERATED_STUDENTS.length} accounts!`);
