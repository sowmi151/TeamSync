/**
 * Collegiate Student Accounts, Projects, Requests, and Messages Database
 * Clean Seed Configuration
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

export const SEED_UNIVERSITIES: UniversityMeta[] = accountsData.universities || [];

export const SEED_STUDENTS: Student[] = [];

export const SEED_PROJECTS: Project[] = [];

export const SEED_REQUESTS: TeamRequest[] = [];

export const SEED_MESSAGES: Message[] = [];

export const SEED_NOTIFICATIONS: NotificationItem[] = [];