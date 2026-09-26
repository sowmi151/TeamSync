/**
 * Student-to-Student Intelligent Deterministic Matching Engine
 * Implements Section 15 to 25 with strict Missing-Data Redistribution
 */

import { Student, MatchResult, FactorScore, ExperienceLevel } from '../../types';
import { findComplementaryPairs, normalizeSkill } from './skillUtils';
import { calculateRoleScore } from './roleCompatibility';

const BASE_WEIGHTS = {
  skill: 0.40,
  complementary: 0.20,
  role: 0.15,
  interest: 0.10,
  availability: 0.10,
  experience: 0.05
};

const EXPERIENCE_MAP: Record<ExperienceLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100
};

export function calculateStudentMatch(studentA: Student, studentB: Student): MatchResult {
  // 1. Skill Factor Evaluation
  const hasSkillsA = Boolean(studentA.skills && studentA.skills.length > 0);
  const hasSkillsB = Boolean(studentB.skills && studentB.skills.length > 0);

  let skillScore = 0;
  let isSkillValid = false;
  let skillDetails = '';
  const commonSkills: Array<{ name: string; userProf: number; otherProf: number }> = [];

  if (hasSkillsA && hasSkillsB) {
    isSkillValid = true;
    for (const sA of studentA.skills) {
      const matchB = studentB.skills.find(
        (sB) => normalizeSkill(sB.name) === normalizeSkill(sA.name)
      );
      if (matchB) {
        commonSkills.push({
          name: sA.name,
          userProf: sA.proficiency,
          otherProf: matchB.proficiency
        });
      }
    }

    if (commonSkills.length > 0) {
      const totalCommonScore = commonSkills.reduce((acc, curr) => {
        const diff = Math.abs(curr.userProf - curr.otherProf);
        const pairSim = Math.max(0, 100 - diff);
        return acc + pairSim;
      }, 0);
      skillScore = Math.round(totalCommonScore / commonSkills.length);
      skillDetails = `${commonSkills.length} shared technical skill${commonSkills.length > 1 ? 's' : ''}`;
    } else {
      skillScore = 0;
      skillDetails = 'No common technical skills, but strong complementary skill coverage.';
    }
  } else if (!hasSkillsA && !hasSkillsB) {
    isSkillValid = false;
    skillScore = 0;
    skillDetails = 'Skill compatibility unavailable.';
  } else {
    isSkillValid = false;
    skillScore = 0;
    skillDetails = 'Skill data incomplete. Add skills to improve match accuracy.';
  }

  // 2. Complementary Skills Evaluation
  let compScore = 0;
  let isCompValid = false;
  let compDetails = '';
  let complementaryPairs: Array<{ studentASkill: string; studentBSkill: string; explanation: string }> = [];

  if (hasSkillsA && hasSkillsB) {
    isCompValid = true;
    const pairs = findComplementaryPairs(studentA.skills, studentB.skills);
    complementaryPairs = pairs.map(p => ({
      studentASkill: p.studentASkill,
      studentBSkill: p.studentBSkill,
      explanation: p.explanation
    }));

    if (pairs.length > 0) {
      const topPairs = pairs.slice(0, 3);
      const avgTop = topPairs.reduce((sum, p) => sum + p.score, 0) / topPairs.length;
      compScore = Math.round(avgTop);
      compDetails = `${pairs.length} high-synergy complementary skill pairing${pairs.length > 1 ? 's' : ''} identified.`;
    } else {
      compScore = 55; // Moderate baseline if skills are present but not explicitly listed in standard pairings
      compDetails = 'Distinct skillsets that can contribute diverse perspectives.';
    }
  } else {
    isCompValid = false;
    compScore = 0;
    compDetails = 'Complementary skill analysis is limited because one profile is incomplete.';
  }

  // 3. Role Compatibility Evaluation
  const hasRoleA = Boolean(studentA.roles && studentA.roles.length > 0);
  const hasRoleB = Boolean(studentB.roles && studentB.roles.length > 0);
  let roleScore = 0;
  let isRoleValid = false;
  let roleDetails = '';

  if (hasRoleA && hasRoleB) {
    isRoleValid = true;
    const roleResult = calculateRoleScore(studentA.roles, studentB.roles);
    roleScore = roleResult.score;
    roleDetails = roleResult.rationale;
  } else {
    isRoleValid = false;
    roleScore = 0;
    roleDetails = 'Role compatibility unavailable.';
  }

  // 4. Interest Compatibility (Jaccard similarity)
  const hasInterestsA = Boolean(studentA.interests && studentA.interests.length > 0);
  const hasInterestsB = Boolean(studentB.interests && studentB.interests.length > 0);
  let interestScore = 0;
  let isInterestValid = false;
  let interestDetails = '';

  if (hasInterestsA && hasInterestsB) {
    isInterestValid = true;
    const setA = new Set(studentA.interests.map(i => i.trim().toLowerCase()));
    const setB = new Set(studentB.interests.map(i => i.trim().toLowerCase()));
    const commonInterests = [...setA].filter(x => setB.has(x));
    const allUnique = new Set([...setA, ...setB]);

    if (allUnique.size > 0) {
      const jaccard = (commonInterests.length / allUnique.size) * 100;
      interestScore = Math.round(Math.min(100, Math.max(0, jaccard * 1.4))); // boost slightly for college interest clusters
      interestDetails = `${commonInterests.length} shared interest domain${commonInterests.length === 1 ? '' : 's'}`;
    }
  } else {
    isInterestValid = false;
    interestScore = 0;
    interestDetails = 'Interest compatibility unavailable.';
  }

  // 5. Availability Compatibility
  const hasAvailA = Boolean(studentA.availability && studentA.availability.hoursPerWeek > 0);
  const hasAvailB = Boolean(studentB.availability && studentB.availability.hoursPerWeek > 0);
  let availScore = 0;
  let isAvailValid = false;
  let availDetails = '';

  if (hasAvailA && hasAvailB && studentA.availability && studentB.availability) {
    isAvailValid = true;
    const prefA = new Set(studentA.availability.preferences.map(p => p.toLowerCase()));
    const prefB = new Set(studentB.availability.preferences.map(p => p.toLowerCase()));
    const overlapPrefs = [...prefA].filter(x => prefB.has(x));
    const unionPrefs = new Set([...prefA, ...prefB]);

    const prefOverlapRatio = unionPrefs.size > 0 ? (overlapPrefs.length / unionPrefs.size) : 0.8;
    const hoursDiff = Math.abs(studentA.availability.hoursPerWeek - studentB.availability.hoursPerWeek);
    const hoursMatch = Math.max(20, 100 - (hoursDiff * 5));

    availScore = Math.round((prefOverlapRatio * 100 * 0.6) + (hoursMatch * 0.4));
    availDetails = `Shared schedule preferences (${overlapPrefs.join(', ') || 'flexible'}) with similar weekly commitment`;
  } else {
    isAvailValid = false;
    availScore = 0;
    availDetails = 'Availability not specified.';
  }

  // 6. Experience Compatibility
  const hasExpA = Boolean(studentA.experience);
  const hasExpB = Boolean(studentB.experience);
  let expScore = 0;
  let isExpValid = false;
  let expDetails = '';

  if (hasExpA && hasExpB && studentA.experience && studentB.experience) {
    isExpValid = true;
    const valA = EXPERIENCE_MAP[studentA.experience];
    const valB = EXPERIENCE_MAP[studentB.experience];
    expScore = 100 - Math.abs(valA - valB);
    expDetails = `${studentA.experience} and ${studentB.experience} level balance`;
  } else {
    isExpValid = false;
    expScore = 0;
    expDetails = 'Experience compatibility unavailable.';
  }

  // REDISTRIBUTION OF MISSING DATA WEIGHTS (Section 16)
  const validityMap = {
    skill: isSkillValid,
    complementary: isCompValid,
    role: isRoleValid,
    interest: isInterestValid,
    availability: isAvailValid,
    experience: isExpValid
  };

  const rawScores = {
    skill: skillScore,
    complementary: compScore,
    role: roleScore,
    interest: interestScore,
    availability: availScore,
    experience: expScore
  };

  // Sum weights of all factors that have valid data
  let validWeightSum = 0;
  (Object.keys(BASE_WEIGHTS) as Array<keyof typeof BASE_WEIGHTS>).forEach(key => {
    if (validityMap[key]) {
      validWeightSum += BASE_WEIGHTS[key];
    }
  });

  const factors: Record<string, FactorScore> = {};

  let finalWeightedSum = 0;

  (Object.keys(BASE_WEIGHTS) as Array<keyof typeof BASE_WEIGHTS>).forEach(key => {
    const origWeight = BASE_WEIGHTS[key];
    const isValid = validityMap[key];
    const raw = rawScores[key];

    let effectiveWeight = 0;
    let contribution = 0;

    if (isValid && validWeightSum > 0) {
      effectiveWeight = origWeight / validWeightSum;
      contribution = raw * effectiveWeight;
      finalWeightedSum += contribution;
    }

    let statusLabel = '';
    if (key === 'skill') statusLabel = skillDetails;
    else if (key === 'complementary') statusLabel = compDetails;
    else if (key === 'role') statusLabel = roleDetails;
    else if (key === 'interest') statusLabel = interestDetails;
    else if (key === 'availability') statusLabel = availDetails;
    else if (key === 'experience') statusLabel = expDetails;

    factors[key] = {
      score: raw,
      isValid,
      originalWeight: origWeight,
      effectiveWeight: Number(effectiveWeight.toFixed(4)),
      contribution: Number(contribution.toFixed(2)),
      statusLabel
    };
  });

  const overallScore = validWeightSum > 0 ? Math.min(100, Math.round(finalWeightedSum)) : 0;
  const confidenceScore = Math.round(validWeightSum * 100);

  let confidenceLabel: 'High confidence' | 'Medium confidence' | 'Low confidence' = 'Low confidence';
  if (confidenceScore >= 80) confidenceLabel = 'High confidence';
  else if (confidenceScore >= 60) confidenceLabel = 'Medium confidence';

  // Section 31 Match Labels:
  // 90–100 -> Excellent Compatibility
  // 75–89  -> Strong Compatibility
  // 60–74  -> Moderate Compatibility
  // 40–59  -> Limited Compatibility
  // 0–39   -> Low Compatibility
  let matchLabel: MatchResult['matchLabel'] = 'Low Compatibility';
  if (overallScore >= 90) matchLabel = 'Excellent Compatibility';
  else if (overallScore >= 75) matchLabel = 'Strong Compatibility';
  else if (overallScore >= 60) matchLabel = 'Moderate Compatibility';
  else if (overallScore >= 40) matchLabel = 'Limited Compatibility';

  // Find strongest skills for explanation
  const strongestA = studentA.skills?.length
    ? [...studentA.skills].sort((a, b) => b.proficiency - a.proficiency)[0]
    : undefined;
  const strongestB = studentB.skills?.length
    ? [...studentB.skills].sort((a, b) => b.proficiency - a.proficiency)[0]
    : undefined;

  // Construct strong match bullets
  const strongMatches: string[] = [];
  if (isCompValid && compScore >= 80 && complementaryPairs.length > 0) {
    strongMatches.push(`${complementaryPairs[0].studentASkill} complements ${complementaryPairs[0].studentBSkill}`);
  }
  if (isInterestValid && interestScore >= 60) {
    strongMatches.push('Shared passion in collaborative project domains');
  }
  if (isRoleValid && roleScore >= 85) {
    strongMatches.push('Balanced role synergy without duplicate bottlenecks');
  }
  if (isAvailValid && availScore >= 80) {
    strongMatches.push('High availability and schedule overlap');
  }
  if (commonSkills.length > 0) {
    strongMatches.push(`Collaborative shared background in ${commonSkills.map(c => c.name).slice(0, 2).join(', ')}`);
  }
  if (strongMatches.length === 0) {
    if (isCompValid) strongMatches.push('Broad spectrum of diverse technical interests');
    else strongMatches.push('Potential match pending complete profile details');
  }

  // Construct intelligent recommendation
  let recommendation = 'Promising partner for collaborative college hackathons and multidisciplinary team projects.';
  if (compScore >= 85 && roleScore >= 85) {
    recommendation = 'Strong complementary skill coverage for full-stack, research, and product development projects.';
  } else if (commonSkills.length >= 2) {
    recommendation = 'Exceptional alignment in shared technical frameworks; ideal for high-speed technical sprints.';
  } else if (confidenceScore < 60) {
    recommendation = 'Incomplete profile data detected. Match confidence is limited until additional skills or roles are added.';
  }

  return {
    overallScore,
    confidenceScore,
    confidenceLabel,
    matchLabel,
    factors: factors as MatchResult['factors'],
    commonSkills,
    complementaryPairs,
    strongMatches,
    skillDifferences: {
      myStrongest: strongestA ? { name: strongestA.name, prof: strongestA.proficiency } : undefined,
      theirStrongest: strongestB ? { name: strongestB.name, prof: strongestB.proficiency } : undefined
    },
    recommendation,
    isInsufficientData: confidenceScore < 40
  };
}
