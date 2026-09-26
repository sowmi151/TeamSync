/**
 * Skill Utilities and Complementary Relationship Definitions
 */

export interface ComplementaryRule {
  skillA: string;
  skillB: string;
  synergyWeight: number; // 0 - 100
  description: string;
}

// Map of canonical complementary skill sets
export const COMPLEMENTARY_RULES: ComplementaryRule[] = [
  { skillA: 'python', skillB: 'ui/ux', synergyWeight: 95, description: 'Python backend/logic complements UI/UX user interaction design.' },
  { skillA: 'python', skillB: 'figma', synergyWeight: 95, description: 'Python logic complements Figma wireframing & prototyping.' },
  { skillA: 'backend', skillB: 'frontend', synergyWeight: 95, description: 'Server-side API architecture seamlessly pairs with frontend web interfaces.' },
  { skillA: 'backend', skillB: 'ui/ux', synergyWeight: 92, description: 'Robust backend systems pair with intuitive UI/UX design.' },
  { skillA: 'node.js', skillB: 'react', synergyWeight: 94, description: 'Node.js backend complements React client-side interfaces.' },
  { skillA: 'express', skillB: 'react', synergyWeight: 94, description: 'Express REST APIs power modern React SPAs.' },
  { skillA: 'django', skillB: 'react', synergyWeight: 92, description: 'Django data models integrate with React client apps.' },
  { skillA: 'machine learning', skillB: 'backend', synergyWeight: 92, description: 'ML model deployment requires solid backend serving pipelines.' },
  { skillA: 'machine learning', skillB: 'frontend', synergyWeight: 88, description: 'Interactive frontend brings machine learning models to end-users.' },
  { skillA: 'deep learning', skillB: 'ui/ux', synergyWeight: 85, description: 'Deep learning intelligence benefits from clear visualization and UI.' },
  { skillA: 'data science', skillB: 'data visualization', synergyWeight: 96, description: 'Data modeling is empowered by high-clarity visual dashboards.' },
  { skillA: 'data science', skillB: 'ui/ux', synergyWeight: 90, description: 'Data insights translate directly into actionable UI dashboards.' },
  { skillA: 'data science', skillB: 'backend', synergyWeight: 88, description: 'Data processing pipelines pair with scalable backend databases.' },
  { skillA: 'mobile development', skillB: 'backend', synergyWeight: 94, description: 'Native/hybrid mobile apps connect to cloud backend APIs.' },
  { skillA: 'flutter', skillB: 'node.js', synergyWeight: 92, description: 'Cross-platform Flutter apps rely on high-performance backends.' },
  { skillA: 'react native', skillB: 'backend', synergyWeight: 92, description: 'Mobile client integrates with cloud backend infrastructure.' },
  { skillA: 'devops', skillB: 'backend', synergyWeight: 90, description: 'CI/CD and cloud deployment optimize backend services.' },
  { skillA: 'cloud', skillB: 'frontend', synergyWeight: 85, description: 'Cloud hosting & CDNs ensure scalable frontend delivery.' },
  { skillA: 'cybersecurity', skillB: 'backend', synergyWeight: 90, description: 'Security hardening protects backend endpoints and databases.' },
  { skillA: 'research', skillB: 'technical writing', synergyWeight: 95, description: 'Deep academic research pairs with rigorous technical documentation.' },
  { skillA: 'research', skillB: 'ui/ux', synergyWeight: 88, description: 'Research methodologies inform user persona discovery and design.' },
  { skillA: 'product management', skillB: 'full stack', synergyWeight: 92, description: 'Product roadmapping guides full-stack development execution.' },
  { skillA: 'blockchain', skillB: 'frontend', synergyWeight: 88, description: 'Smart contracts interface with Web3 frontends.' },
  { skillA: 'sql', skillB: 'react', synergyWeight: 85, description: 'Relational data stores power dynamic frontends.' },
  { skillA: 'postgresql', skillB: 'ui/ux', synergyWeight: 82, description: 'Structured databases support clean user interface workflows.' }
];

export function normalizeSkill(skill: string): string {
  const s = skill.trim().toLowerCase();
  if (s.includes('ui') || s.includes('ux') || s.includes('figma')) return 'ui/ux';
  if (s.includes('machine learning') || s.includes('ml') || s.includes('deep learning')) return 'machine learning';
  if (s.includes('front') || s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('html')) return 'frontend';
  if (s.includes('back') || s.includes('node') || s.includes('express') || s.includes('spring') || s.includes('django') || s.includes('fastapi')) return 'backend';
  if (s.includes('data sci') || s.includes('data anal') || s.includes('pandas')) return 'data science';
  if (s.includes('cloud') || s.includes('aws') || s.includes('gcp') || s.includes('azure') || s.includes('docker') || s.includes('devops')) return 'devops';
  if (s.includes('mobile') || s.includes('flutter') || s.includes('android') || s.includes('ios') || s.includes('swift')) return 'mobile development';
  return s;
}

export function findComplementaryPairs(
  skillsA: Array<{ name: string; proficiency: number }>,
  skillsB: Array<{ name: string; proficiency: number }>
): Array<{ studentASkill: string; studentBSkill: string; score: number; explanation: string }> {
  const matches: Array<{ studentASkill: string; studentBSkill: string; score: number; explanation: string }> = [];

  for (const sA of skillsA) {
    const normA = normalizeSkill(sA.name);
    for (const sB of skillsB) {
      const normB = normalizeSkill(sB.name);
      if (normA === normB) continue; // Not complementary, they are shared

      for (const rule of COMPLEMENTARY_RULES) {
        if (
          (normA.includes(rule.skillA) && normB.includes(rule.skillB)) ||
          (normA.includes(rule.skillB) && normB.includes(rule.skillA))
        ) {
          // Weight complementary pair by both students' proficiency in their respective domains
          const avgProf = (sA.proficiency + sB.proficiency) / 2;
          const pairScore = (rule.synergyWeight * 0.6) + (avgProf * 0.4);
          matches.push({
            studentASkill: sA.name,
            studentBSkill: sB.name,
            score: Math.min(100, Math.round(pairScore)),
            explanation: rule.description
          });
        }
      }
    }
  }

  // Remove duplicates and return sorted by score descending
  const seen = new Set<string>();
  const unique: typeof matches = [];
  for (const m of matches) {
    const key = `${m.studentASkill}-${m.studentBSkill}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(m);
    }
  }
  return unique.sort((a, b) => b.score - a.score);
}
