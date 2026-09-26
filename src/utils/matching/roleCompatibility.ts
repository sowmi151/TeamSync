/**
 * Role Compatibility Rules and Calculations
 */

export interface RolePairWeight {
  roleA: string;
  roleB: string;
  compatibility: number; // 0 - 100
  rationale: string;
}

export const ROLE_COMPATIBILITY_PAIRS: RolePairWeight[] = [
  { roleA: 'backend developer', roleB: 'frontend developer', compatibility: 96, rationale: 'Standard full-stack pair: client-facing frontend powered by API backend.' },
  { roleA: 'backend developer', roleB: 'ui/ux designer', compatibility: 94, rationale: 'Clear functional architecture paired with empathetic design.' },
  { roleA: 'frontend developer', roleB: 'ui/ux designer', compatibility: 96, rationale: 'Design-to-code implementation loop is fast and cohesive.' },
  { roleA: 'machine learning engineer', roleB: 'backend developer', compatibility: 95, rationale: 'Model serving and data inference pipelines built seamlessly.' },
  { roleA: 'machine learning engineer', roleB: 'frontend developer', compatibility: 88, rationale: 'ML inference visual presentation and user interface.' },
  { roleA: 'machine learning engineer', roleB: 'ui/ux designer', compatibility: 86, rationale: 'Explainable AI interfaces and user feedback loops.' },
  { roleA: 'data scientist', roleB: 'backend developer', compatibility: 90, rationale: 'Data pipeline integration and database query optimization.' },
  { roleA: 'data scientist', roleB: 'ui/ux designer', compatibility: 88, rationale: 'Complex data insights visualized for non-technical stakeholders.' },
  { roleA: 'mobile developer', roleB: 'backend developer', compatibility: 95, rationale: 'Mobile client needs robust REST/GraphQL endpoints.' },
  { roleA: 'mobile developer', roleB: 'ui/ux designer', compatibility: 95, rationale: 'Touch ergonomics, component design, and mobile UX.' },
  { roleA: 'product manager', roleB: 'full stack developer', compatibility: 92, rationale: 'Scoping, backlog prioritization, and rapid feature execution.' },
  { roleA: 'product manager', roleB: 'ui/ux designer', compatibility: 94, rationale: 'User journey mapping, user testing, and prototype validation.' },
  { roleA: 'devops engineer', roleB: 'backend developer', compatibility: 92, rationale: 'Containerization, CI/CD pipelines, and cloud infra monitoring.' },
  { roleA: 'researcher', roleB: 'technical writer', compatibility: 95, rationale: 'Academic rigour paired with clear publication-ready documentation.' },
  { roleA: 'full stack developer', roleB: 'ui/ux designer', compatibility: 92, rationale: 'High velocity end-to-end implementation of wireframes.' }
];

export function calculateRoleScore(rolesA: string[], rolesB: string[]): { score: number; rationale: string } {
  if (!rolesA || rolesA.length === 0 || !rolesB || rolesB.length === 0) {
    return { score: 0, rationale: 'Role compatibility unavailable.' };
  }

  let highestScore = 70; // baseline for non-conflicting diverse roles
  let bestRationale = 'Complementary general roles for team collaboration.';

  for (const rA of rolesA) {
    const normA = rA.trim().toLowerCase();
    for (const rB of rolesB) {
      const normB = rB.trim().toLowerCase();

      // Identical roles: good for capacity, but less complementary role balance
      if (normA === normB) {
        if (highestScore < 72) {
          highestScore = 72;
          bestRationale = `Both have expertise in ${rA}; solid redundancy but identical specializations.`;
        }
        continue;
      }

      for (const pair of ROLE_COMPATIBILITY_PAIRS) {
        if (
          (normA.includes(pair.roleA) && normB.includes(pair.roleB)) ||
          (normA.includes(pair.roleB) && normB.includes(pair.roleA))
        ) {
          if (pair.compatibility > highestScore) {
            highestScore = pair.compatibility;
            bestRationale = pair.rationale;
          }
        }
      }
    }
  }

  return { score: highestScore, rationale: bestRationale };
}
