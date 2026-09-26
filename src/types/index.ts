/**
 * TeamSync Core Types
 */

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface StudentSkill {
  name: string;
  proficiency: number; // 0 - 100
  category: 'Frontend' | 'Backend' | 'AI/ML' | 'Mobile' | 'Design/UIUX' | 'Cloud/DevOps' | 'Data' | 'Other';
}

export interface StudentAvailability {
  hoursPerWeek: number;
  preferences: string[]; // e.g. ['Weekdays', 'Evenings', 'Weekends']
}

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string; // e.g. '3rd Year'
  avatarUrl?: string;
  bio: string;
  skills: StudentSkill[];
  interests: string[];
  roles: string[]; // e.g. ['Frontend Developer', 'UI/UX Designer']
  experience: ExperienceLevel | null; // null represents missing data
  availability: StudentAvailability | null; // null represents missing data
  projects: string[]; // project titles or achievements
  achievements: string[];
  university?: string;
  gpa?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  verified?: boolean;
}

export interface ProjectSkillRequirement {
  name: string;
  minProficiency: number; // e.g. 75
  isRequired: boolean; // required vs preferred
}

export interface ProjectMember {
  studentId: string;
  role: string;
  joinedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Academic' | 'Hackathon' | 'Competition' | 'Research' | 'Startup' | 'Personal Project';
  creatorId: string;
  teamSize: number;
  requiredSkills: ProjectSkillRequirement[];
  requiredRoles: string[];
  members: ProjectMember[];
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface TeamRequest {
  id: string;
  senderId: string;
  receiverId: string;
  projectId: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  projectId?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export type NotificationType =
  | 'team_request'
  | 'request_accepted'
  | 'request_rejected'
  | 'message'
  | 'high_match'
  | 'skill_gap'
  | 'project_invitation';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
  relatedId?: string;
}

export interface FactorScore {
  score: number; // 0 - 100
  isValid: boolean; // whether data was present
  originalWeight: number; // e.g. 0.40
  effectiveWeight: number; // normalized weight when missing data is redistributed
  contribution: number; // score * effectiveWeight
  statusLabel?: string;
  details?: string;
}

export interface MatchResult {
  overallScore: number; // 0 - 100 rounded
  confidenceScore: number; // 0 - 100 (percentage of original weights that were valid)
  confidenceLabel: 'High confidence' | 'Medium confidence' | 'Low confidence';
  matchLabel:
    | 'Excellent Compatibility'
    | 'Strong Compatibility'
    | 'Moderate Compatibility'
    | 'Limited Compatibility'
    | 'Low Compatibility';
  factors: {
    skill: FactorScore;
    complementary: FactorScore;
    role: FactorScore;
    interest: FactorScore;
    availability: FactorScore;
    experience: FactorScore;
  };
  commonSkills: Array<{ name: string; userProf: number; otherProf: number }>;
  complementaryPairs: Array<{ studentASkill: string; studentBSkill: string; explanation: string }>;
  strongMatches: string[];
  skillDifferences: {
    myStrongest?: { name: string; prof: number };
    theirStrongest?: { name: string; prof: number };
  };
  recommendation: string;
  isInsufficientData: boolean;
}

export interface ProjectMatchResult {
  overallScore: number;
  confidenceScore: number;
  confidenceLabel: 'High confidence' | 'Medium confidence' | 'Low confidence';
  matchLabel: string;
  factors: {
    requiredSkill: FactorScore;
    role: FactorScore;
    interest: FactorScore;
    experience: FactorScore;
    availability: FactorScore;
  };
  skillBreakdown: Array<{
    name: string;
    isRequired: boolean;
    minProficiency: number;
    studentProficiency: number;
    score: number;
    status: 'Covered' | 'Weak' | 'Missing';
  }>;
}

export interface SkillGapItem {
  skillName: string;
  isRequired: boolean;
  minProficiency: number;
  highestTeamProficiency: number;
  coveragePercentage: number;
  status: 'Covered' | 'Weak' | 'Missing';
}

export interface TeamAnalysis {
  teamCompatibility: number;
  averagePairwiseCompatibility: number;
  skillCoverage: number;
  roleCoverage: number;
  skillGaps: SkillGapItem[];
  roleDistribution: Record<string, number>;
  missingRoles: string[];
}
