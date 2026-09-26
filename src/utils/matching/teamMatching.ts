/**
 * Team Matching, Skill Coverage, Skill Gap Detection, and Balance Calculations
 * Implements Sections 34 to 39
 */

import { Student, Project, TeamAnalysis, SkillGapItem } from '../../types';
import { calculateStudentMatch } from './studentMatching';
import { normalizeSkill } from './skillUtils';

export function analyzeTeam(teamMembers: Student[], project: Project): TeamAnalysis {
  // 1. Calculate Average Pairwise Compatibility (50% weight)
  let pairwiseTotal = 0;
  let pairCount = 0;

  if (teamMembers.length <= 1) {
    pairwiseTotal = 100;
    pairCount = 1;
  } else {
    for (let i = 0; i < teamMembers.length; i++) {
      for (let j = i + 1; j < teamMembers.length; j++) {
        const match = calculateStudentMatch(teamMembers[i], teamMembers[j]);
        pairwiseTotal += match.overallScore;
        pairCount++;
      }
    }
  }

  const averagePairwiseCompatibility = pairCount > 0 ? Math.round(pairwiseTotal / pairCount) : 100;

  // 2. Calculate Skill Coverage & Skill Gaps (30% weight)
  // Section 35: For each required skill, use highest relevant team-member proficiency
  const skillGaps: SkillGapItem[] = [];
  let totalCoveragePct = 0;

  const projectSkills = project.requiredSkills || [];

  if (projectSkills.length > 0) {
    for (const req of projectSkills) {
      let highestTeamProf = 0;

      for (const member of teamMembers) {
        const found = (member.skills || []).find(
          s => normalizeSkill(s.name) === normalizeSkill(req.name)
        );
        if (found && found.proficiency > highestTeamProf) {
          highestTeamProf = found.proficiency;
        }
      }

      let coveragePct = 0;
      let status: 'Covered' | 'Weak' | 'Missing' = 'Missing';

      if (highestTeamProf >= req.minProficiency) {
        coveragePct = 100;
        status = 'Covered';
      } else if (highestTeamProf > 0) {
        coveragePct = Math.round((highestTeamProf / req.minProficiency) * 100);
        status = 'Weak';
      } else {
        coveragePct = 0;
        status = 'Missing';
      }

      skillGaps.push({
        skillName: req.name,
        isRequired: req.isRequired,
        minProficiency: req.minProficiency,
        highestTeamProficiency: highestTeamProf,
        coveragePercentage: coveragePct,
        status
      });

      totalCoveragePct += coveragePct;
    }
  }

  const skillCoverage = projectSkills.length > 0
    ? Math.round(totalCoveragePct / projectSkills.length)
    : 100;

  // 3. Calculate Role Coverage & Balance (20% weight)
  const roleDistribution: Record<string, number> = {};
  const projectRoles = project.requiredRoles || [];
  const missingRoles: string[] = [];

  for (const member of teamMembers) {
    for (const r of member.roles || []) {
      roleDistribution[r] = (roleDistribution[r] || 0) + 1;
    }
  }

  let filledRolesCount = 0;
  for (const reqRole of projectRoles) {
    const isCovered = Object.keys(roleDistribution).some(
      r => r.toLowerCase().includes(reqRole.toLowerCase()) || reqRole.toLowerCase().includes(r.toLowerCase())
    );
    if (isCovered) {
      filledRolesCount++;
    } else {
      missingRoles.push(reqRole);
    }
  }

  const roleCoverage = projectRoles.length > 0
    ? Math.round((filledRolesCount / projectRoles.length) * 100)
    : 100;

  // Section 39 Formula:
  // Team Compatibility = Average Pairwise * 0.50 + Skill Coverage * 0.30 + Role Coverage * 0.20
  const teamCompatibility = Math.round(
    (averagePairwiseCompatibility * 0.50) +
    (skillCoverage * 0.30) +
    (roleCoverage * 0.20)
  );

  return {
    teamCompatibility,
    averagePairwiseCompatibility,
    skillCoverage,
    roleCoverage,
    skillGaps,
    roleDistribution,
    missingRoles
  };
}

/**
 * Intelligent "Build My Team" recommendation algorithm (Section 34)
 * Greedily selects candidates that maximize coverage of missing project skills,
 * complementary roles, and highest mutual compatibility.
 */
export function recommendTeam(
  leader: Student,
  candidates: Student[],
  project: Project
): {
  recommendedMembers: Student[];
  predictedAnalysis: TeamAnalysis;
  reasoning: Array<{ studentId: string; role: string; contribution: string }>;
} {
  const targetSize = project.teamSize || 4;
  const currentTeam: Student[] = [leader];
  const pool = candidates.filter(c => c.id !== leader.id);
  const reasoning: Array<{ studentId: string; role: string; contribution: string }> = [];

  while (currentTeam.length < targetSize && pool.length > 0) {
    const currentAnalysis = analyzeTeam(currentTeam, project);

    let bestCandidate: Student | null = null;
    let bestScore = -1;
    let bestReason = '';
    let bestRole = '';

    for (const candidate of pool) {
      const testTeam = [...currentTeam, candidate];
      const testAnalysis = analyzeTeam(testTeam, project);
      const matchWithLeader = calculateStudentMatch(leader, candidate);

      // Score candidate by how much they improve skill coverage and their pairwise compatibility
      const coverageGain = testAnalysis.skillCoverage - currentAnalysis.skillCoverage;
      const roleBonus = (candidate.roles || []).some(r => currentAnalysis.missingRoles.includes(r)) ? 25 : 0;
      const candidateScore = (coverageGain * 2) + roleBonus + (matchWithLeader.overallScore * 0.8);

      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestCandidate = candidate;
        bestRole = candidate.roles?.[0] || 'Contributor';

        const coveredGaps = currentAnalysis.skillGaps
          .filter(g => g.status !== 'Covered')
          .filter(g => (candidate.skills || []).some(s => normalizeSkill(s.name) === normalizeSkill(g.skillName) && s.proficiency >= g.minProficiency));

        if (coveredGaps.length > 0) {
          bestReason = `Fills critical skill gaps: ${coveredGaps.map(g => g.skillName).join(', ')}`;
        } else if (roleBonus > 0) {
          bestReason = `Fills target role requirement: ${bestRole}`;
        } else {
          bestReason = `High complementary synergy (${matchWithLeader.overallScore}% compatibility)`;
        }
      }
    }

    if (bestCandidate) {
      currentTeam.push(bestCandidate);
      reasoning.push({
        studentId: bestCandidate.id,
        role: bestRole,
        contribution: bestReason
      });
      const idx = pool.indexOf(bestCandidate);
      if (idx !== -1) pool.splice(idx, 1);
    } else {
      break;
    }
  }

  const predictedAnalysis = analyzeTeam(currentTeam, project);

  return {
    recommendedMembers: currentTeam,
    predictedAnalysis,
    reasoning
  };
}
