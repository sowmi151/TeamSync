/**
 * Project-to-Student Intelligent Matching Engine
 * Implements Section 26, 27, 28
 */

import { Student, Project, ProjectMatchResult, FactorScore, ExperienceLevel } from '../../types';
import { normalizeSkill } from './skillUtils';

const BASE_PROJECT_WEIGHTS = {
  requiredSkill: 0.55,
  role: 0.15,
  interest: 0.10,
  experience: 0.10,
  availability: 0.10
};

const EXPERIENCE_MAP: Record<ExperienceLevel, number> = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 100
};

export function calculateProjectMatch(student: Student, project: Project): ProjectMatchResult {
  // 1. Required Skill Match (55%)
  // Section 26: If student lacks a required skill, that requirement score is 0.
  // It is a real gap, NEVER redistributed!
  const skillBreakdown: ProjectMatchResult['skillBreakdown'] = [];

  let totalSkillScore = 0;
  const projectSkills = project.requiredSkills || [];

  if (projectSkills.length > 0) {
    for (const req of projectSkills) {
      const studentSkill = (student.skills || []).find(
        s => normalizeSkill(s.name) === normalizeSkill(req.name)
      );

      let reqScore = 0;
      let status: 'Covered' | 'Weak' | 'Missing' = 'Missing';
      const studentProf = studentSkill ? studentSkill.proficiency : 0;

      if (!studentSkill || studentProf === 0) {
        reqScore = 0;
        status = 'Missing';
      } else if (studentProf >= req.minProficiency) {
        reqScore = 100;
        status = 'Covered';
      } else {
        reqScore = Math.round((studentProf / req.minProficiency) * 100);
        status = 'Weak';
      }

      skillBreakdown.push({
        name: req.name,
        isRequired: req.isRequired,
        minProficiency: req.minProficiency,
        studentProficiency: studentProf,
        score: reqScore,
        status
      });

      totalSkillScore += reqScore;
    }
  }

  const avgSkillScore = projectSkills.length > 0
    ? Math.round(totalSkillScore / projectSkills.length)
    : 100; // If project has no skills listed, defaults to 100

  const isSkillFactorValid = true; // Always valid because missing skill is a real 0 score

  // 2. Role Match (15%)
  let roleScore = 0;
  let isRoleValid = false;
  let roleStatus = 'Role compatibility unavailable.';

  if (student.roles && student.roles.length > 0 && project.requiredRoles && project.requiredRoles.length > 0) {
    isRoleValid = true;
    const projectNormRoles = project.requiredRoles.map(r => r.toLowerCase().trim());
    const studentNormRoles = student.roles.map(r => r.toLowerCase().trim());

    const hasMatchingRole = studentNormRoles.some(sRole =>
      projectNormRoles.some(pRole => sRole.includes(pRole) || pRole.includes(sRole))
    );

    if (hasMatchingRole) {
      roleScore = 100;
      roleStatus = 'Fulfills a target role for this project';
    } else {
      roleScore = 40;
      roleStatus = 'Candidate role is auxiliary to target roles';
    }
  } else if (!student.roles || student.roles.length === 0) {
    isRoleValid = false;
    roleScore = 0;
    roleStatus = 'Role not specified by student.';
  } else {
    isRoleValid = false;
    roleScore = 0;
    roleStatus = 'Project has no role constraints.';
  }

  // 3. Interest Match (10%)
  let interestScore = 0;
  let isInterestValid = false;
  let interestStatus = 'Interest compatibility unavailable.';

  if (student.interests && student.interests.length > 0) {
    isInterestValid = true;
    const cat = project.category.toLowerCase();
    const desc = project.description.toLowerCase();
    const title = project.title.toLowerCase();

    const matches = student.interests.filter(i => {
      const ni = i.toLowerCase();
      return desc.includes(ni) || title.includes(ni) || cat.includes(ni);
    });

    if (matches.length > 0) {
      interestScore = Math.min(100, 60 + (matches.length * 20));
      interestStatus = `Direct match on ${matches.join(', ')}`;
    } else {
      interestScore = 50; // neutral general domain curiosity
      interestStatus = 'General interest overlap';
    }
  } else {
    isInterestValid = false;
    interestScore = 0;
    interestStatus = 'Student has not specified interests.';
  }

  // 4. Experience Match (10%)
  let expScore = 0;
  let isExpValid = false;
  let expStatus = 'Experience compatibility unavailable.';

  if (student.experience) {
    isExpValid = true;
    const num = EXPERIENCE_MAP[student.experience];
    // Most projects benefit from Intermediate/Advanced
    if (student.experience === 'Expert' || student.experience === 'Advanced') expScore = 100;
    else if (student.experience === 'Intermediate') expScore = 85;
    else expScore = 65;
    expStatus = `${student.experience} experience level`;
  } else {
    isExpValid = false;
    expScore = 0;
    expStatus = 'Experience not specified.';
  }

  // 5. Availability Match (10%)
  let availScore = 0;
  let isAvailValid = false;
  let availStatus = 'Availability not specified.';

  if (student.availability && student.availability.hoursPerWeek > 0) {
    isAvailValid = true;
    if (student.availability.hoursPerWeek >= 10) {
      availScore = 100;
      availStatus = `${student.availability.hoursPerWeek} hrs/week commitment meets project velocity needs`;
    } else {
      availScore = Math.round((student.availability.hoursPerWeek / 10) * 100);
      availStatus = `${student.availability.hoursPerWeek} hrs/week commitment`;
    }
  } else {
    isAvailValid = false;
    availScore = 0;
    availStatus = 'Availability not specified.';
  }

  // MISSING-DATA REDISTRIBUTION FOR PROJECT FACTORS
  const validity = {
    requiredSkill: isSkillFactorValid,
    role: isRoleValid,
    interest: isInterestValid,
    experience: isExpValid,
    availability: isAvailValid
  };

  const rawScores = {
    requiredSkill: avgSkillScore,
    role: roleScore,
    interest: interestScore,
    experience: expScore,
    availability: availScore
  };

  let validWeightSum = 0;
  (Object.keys(BASE_PROJECT_WEIGHTS) as Array<keyof typeof BASE_PROJECT_WEIGHTS>).forEach(key => {
    if (validity[key]) validWeightSum += BASE_PROJECT_WEIGHTS[key];
  });

  const factors: Record<string, FactorScore> = {};
  let finalWeightedSum = 0;

  (Object.keys(BASE_PROJECT_WEIGHTS) as Array<keyof typeof BASE_PROJECT_WEIGHTS>).forEach(key => {
    const origWeight = BASE_PROJECT_WEIGHTS[key];
    const isValid = validity[key];
    const raw = rawScores[key];

    let effectiveWeight = 0;
    let contribution = 0;

    if (isValid && validWeightSum > 0) {
      effectiveWeight = origWeight / validWeightSum;
      contribution = raw * effectiveWeight;
      finalWeightedSum += contribution;
    }

    let statusLabel = '';
    if (key === 'requiredSkill') statusLabel = `${skillBreakdown.filter(s => s.status === 'Covered').length}/${projectSkills.length} required skills covered`;
    else if (key === 'role') statusLabel = roleStatus;
    else if (key === 'interest') statusLabel = interestStatus;
    else if (key === 'experience') statusLabel = expStatus;
    else if (key === 'availability') statusLabel = availStatus;

    factors[key] = {
      score: raw,
      isValid,
      originalWeight: origWeight,
      effectiveWeight: Number(effectiveWeight.toFixed(4)),
      contribution: Number(contribution.toFixed(2)),
      statusLabel
    };
  });

  const overallScore = Math.min(100, Math.round(finalWeightedSum));
  const confidenceScore = Math.round(validWeightSum * 100);

  let confidenceLabel: 'High confidence' | 'Medium confidence' | 'Low confidence' = 'Low confidence';
  if (confidenceScore >= 80) confidenceLabel = 'High confidence';
  else if (confidenceScore >= 60) confidenceLabel = 'Medium confidence';

  let matchLabel = 'Low Compatibility';
  if (overallScore >= 90) matchLabel = 'Excellent Compatibility';
  else if (overallScore >= 75) matchLabel = 'Strong Compatibility';
  else if (overallScore >= 60) matchLabel = 'Moderate Compatibility';
  else if (overallScore >= 40) matchLabel = 'Limited Compatibility';

  return {
    overallScore,
    confidenceScore,
    confidenceLabel,
    matchLabel,
    factors: factors as ProjectMatchResult['factors'],
    skillBreakdown
  };
}
