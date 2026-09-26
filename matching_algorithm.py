"""
TeamSync - Collegiate Intelligent Team Matching Engine (Python Edition)
Implements multi-factor deterministic scoring and missing-data weight redistribution.
Pure Python 3 - Zero external dependencies.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple
import math

BASE_WEIGHTS = {
    "skill": 0.40,
    "complementary": 0.20,
    "role": 0.15,
    "interest": 0.10,
    "availability": 0.10,
    "experience": 0.05
}

EXPERIENCE_MAP = {
    "Beginner": 25,
    "Intermediate": 50,
    "Advanced": 75,
    "Expert": 100
}

COMPLEMENTARY_RULES = [
    ("python", "ui/ux", 95, "Python backend/logic complements UI/UX user interaction design."),
    ("python", "figma", 95, "Python logic complements Figma wireframing & prototyping."),
    ("backend", "frontend", 95, "Server-side API architecture seamlessly pairs with frontend web interfaces."),
    ("backend", "ui/ux", 92, "Robust backend systems pair with intuitive UI/UX design."),
    ("node.js", "react", 94, "Node.js backend complements React client-side interfaces."),
    ("express", "react", 94, "Express REST APIs power modern React SPAs."),
    ("django", "react", 92, "Django data models integrate with React client apps."),
    ("fastapi", "react", 94, "FastAPI asynchronous endpoints pair with dynamic client interfaces."),
    ("machine learning", "backend", 92, "ML model deployment requires solid backend serving pipelines."),
    ("machine learning", "frontend", 88, "Interactive frontend brings machine learning models to end-users."),
    ("deep learning", "ui/ux", 85, "Deep learning intelligence benefits from clear visualization and UI."),
    ("data science", "data visualization", 96, "Data modeling is empowered by high-clarity visual dashboards."),
    ("data science", "ui/ux", 90, "Data insights translate directly into actionable UI dashboards."),
    ("data science", "backend", 88, "Data processing pipelines pair with scalable backend databases."),
    ("mobile development", "backend", 94, "Native/hybrid mobile apps connect to cloud backend APIs."),
    ("flutter", "node.js", 92, "Cross-platform Flutter apps rely on high-performance backends."),
    ("react native", "backend", 92, "Mobile client integrates with cloud backend infrastructure."),
    ("devops", "backend", 90, "CI/CD and cloud deployment optimize backend services."),
    ("cloud", "frontend", 85, "Cloud hosting & CDNs ensure scalable frontend delivery."),
    ("cybersecurity", "backend", 90, "Security hardening protects backend endpoints and databases."),
    ("research", "technical writing", 95, "Deep academic research pairs with rigorous technical documentation."),
    ("research", "ui/ux", 88, "Research methodologies inform user persona discovery and design."),
    ("product management", "full stack", 92, "Product roadmapping guides full-stack development execution."),
    ("blockchain", "frontend", 88, "Smart contracts interface with Web3 frontends."),
    ("sql", "react", 85, "Relational data stores power dynamic frontends."),
    ("postgresql", "ui/ux", 82, "Structured databases support clean user interface workflows.")
]

ROLE_MATRIX = {
    ("Frontend Developer", "Backend Developer"): (95, "Classic client-server architecture synergy."),
    ("Frontend Developer", "UI/UX Designer"): (94, "Seamless design-to-code workflow and rapid iteration."),
    ("Backend Developer", "DevOps Engineer"): (93, "High-efficiency deployment pipeline and infrastructure stability."),
    ("Backend Developer", "Machine Learning Engineer"): (92, "Scalable data ingestion and model inference pipeline."),
    ("Product Manager", "Full Stack Developer"): (94, "Clear product roadmap paired with end-to-end execution."),
    ("Researcher", "Technical Writer"): (95, "Comprehensive theoretical research with rigorous documentation."),
    ("Data Scientist", "UI/UX Designer"): (90, "Complex analytics communicated through intuitive visualization.")
}

def normalize_skill(skill: str) -> str:
    s = skill.strip().lower()
    if "ui" in s or "ux" in s or "figma" in s:
        return "ui/ux"
    if "machine learning" in s or "ml" in s or "deep learning" in s or "ai" in s:
        return "machine learning"
    if "front" in s or "react" in s or "vue" in s or "angular" in s or "html" in s:
        return "frontend"
    if "back" in s or "node" in s or "express" in s or "spring" in s or "django" in s or "fastapi" in s:
        return "backend"
    if "data sci" in s or "data anal" in s or "pandas" in s:
        return "data science"
    if "cloud" in s or "aws" in s or "gcp" in s or "azure" in s or "docker" in s or "devops" in s:
        return "devops"
    if "mobile" in s or "flutter" in s or "android" in s or "ios" in s or "swift" in s:
        return "mobile development"
    return s

def find_complementary_pairs(skills_a: List[Dict[str, Any]], skills_b: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    matches = []
    for s_a in skills_a:
        norm_a = normalize_skill(s_a.get("name", ""))
        for s_b in skills_b:
            norm_b = normalize_skill(s_b.get("name", ""))
            if norm_a == norm_b:
                continue

            for (rule_a, rule_b, synergy, desc) in COMPLEMENTARY_RULES:
                if (norm_a == rule_a and norm_b == rule_b) or (norm_a == rule_b and norm_b == rule_a):
                    score = min(100, int(synergy * 0.7 + ((s_a.get("proficiency", 50) + s_b.get("proficiency", 50)) / 2) * 0.3))
                    matches.append({
                        "studentASkill": s_a.get("name", ""),
                        "studentBSkill": s_b.get("name", ""),
                        "score": score,
                        "explanation": desc
                    })
    # Sort descending by score
    matches.sort(key=lambda x: x["score"], reverse=True)
    return matches

def calculate_role_compatibility(roles_a: List[str], roles_b: List[str]) -> Tuple[int, str]:
    if not roles_a or not roles_b:
        return 0, "Role compatibility unavailable."

    best_score = 50
    best_rationale = "General cross-functional collaboration potential."

    for r_a in roles_a:
        for r_b in roles_b:
            if r_a.lower() == r_b.lower():
                score = 65
                rationale = f"Shared focus on {r_a}. Consider ensuring distinct task ownership."
                if score > best_score:
                    best_score = score
                    best_rationale = rationale
            else:
                pair = (r_a, r_b)
                rev_pair = (r_b, r_a)
                if pair in ROLE_MATRIX:
                    score, rationale = ROLE_MATRIX[pair]
                    if score > best_score:
                        best_score = score
                        best_rationale = rationale
                elif rev_pair in ROLE_MATRIX:
                    score, rationale = ROLE_MATRIX[rev_pair]
                    if score > best_score:
                        best_score = score
                        best_rationale = rationale
                else:
                    score = 75
                    rationale = f"Complementary disciplines: {r_a} and {r_b}."
                    if score > best_score:
                        best_score = score
                        best_rationale = rationale

    return best_score, best_rationale

def calculate_student_match(student_a: Dict[str, Any], student_b: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes deterministic match between student_a and student_b
    Returns overallScore (0-100), confidenceScore, and individual factor breakdown.
    """
    skills_a = student_a.get("skills", [])
    skills_b = student_b.get("skills", [])
    has_skills_a = len(skills_a) > 0
    has_skills_b = len(skills_b) > 0

    # 1. Technical Skills
    is_skill_valid = False
    skill_score = 0
    skill_details = ""
    common_skills = []

    if has_skills_a and has_skills_b:
        is_skill_valid = True
        for s_a in skills_a:
            for s_b in skills_b:
                if normalize_skill(s_a.get("name", "")) == normalize_skill(s_b.get("name", "")):
                    common_skills.append({
                        "name": s_a.get("name"),
                        "userProf": s_a.get("proficiency", 50),
                        "otherProf": s_b.get("proficiency", 50)
                    })
                    break

        if common_skills:
            total_sim = sum(max(0, 100 - abs(c["userProf"] - c["otherProf"])) for c in common_skills)
            skill_score = round(total_sim / len(common_skills))
            skill_details = f"{len(common_skills)} shared technical skill{'s' if len(common_skills) > 1 else ''}"
        else:
            skill_score = 0
            skill_details = "No common technical skills, but strong complementary potential."
    else:
        is_skill_valid = False
        skill_score = 0
        skill_details = "Skill compatibility data incomplete."

    # 2. Complementary Skills
    is_comp_valid = False
    comp_score = 0
    comp_details = ""
    comp_pairs = []

    if has_skills_a and has_skills_b:
        is_comp_valid = True
        comp_pairs = find_complementary_pairs(skills_a, skills_b)
        if comp_pairs:
            top_pairs = comp_pairs[:3]
            comp_score = round(sum(p["score"] for p in top_pairs) / len(top_pairs))
            comp_details = f"{len(comp_pairs)} high-synergy complementary skill pairing{'s' if len(comp_pairs) > 1 else ''} identified."
        else:
            comp_score = 55
            comp_details = "Distinct skillsets that can contribute diverse perspectives."
    else:
        is_comp_valid = False
        comp_score = 0
        comp_details = "Complementary skill analysis limited by incomplete data."

    # 3. Roles
    roles_a = student_a.get("roles", [])
    roles_b = student_b.get("roles", [])
    is_role_valid = bool(roles_a and roles_b)
    role_score, role_details = calculate_role_compatibility(roles_a, roles_b) if is_role_valid else (0, "Role compatibility unavailable.")

    # 4. Interests (Jaccard similarity)
    interests_a = [i.strip().lower() for i in student_a.get("interests", [])]
    interests_b = [i.strip().lower() for i in student_b.get("interests", [])]
    is_interest_valid = bool(interests_a and interests_b)
    interest_score = 0
    interest_details = ""

    if is_interest_valid:
        set_a = set(interests_a)
        set_b = set(interests_b)
        common = set_a.intersection(set_b)
        union = set_a.union(set_b)
        if union:
            jaccard = (len(common) / len(union)) * 100
            interest_score = round(min(100, jaccard * 1.4))
            interest_details = f"{len(common)} shared interest domain{'s' if len(common) != 1 else ''}"
    else:
        interest_details = "Interest compatibility unavailable."

    # 5. Availability
    avail_a = student_a.get("availability") or {}
    avail_b = student_b.get("availability") or {}
    is_avail_valid = bool(avail_a.get("hoursPerWeek", 0) > 0 and avail_b.get("hoursPerWeek", 0) > 0)
    avail_score = 0
    avail_details = ""

    if is_avail_valid:
        pref_a = set(p.lower() for p in avail_a.get("preferences", []))
        pref_b = set(p.lower() for p in avail_b.get("preferences", []))
        overlap_pref = pref_a.intersection(pref_b)
        union_pref = pref_a.union(pref_b)
        ratio = (len(overlap_pref) / len(union_pref)) if union_pref else 0.8
        diff_hours = abs(avail_a.get("hoursPerWeek", 10) - avail_b.get("hoursPerWeek", 10))
        hours_match = max(20, 100 - (diff_hours * 5))
        avail_score = round((ratio * 100 * 0.6) + (hours_match * 0.4))
        avail_details = f"Shared schedule ({', '.join(overlap_pref) or 'flexible'}) with aligned weekly hours."
    else:
        avail_details = "Availability schedule not specified."

    # 6. Experience
    exp_a = student_a.get("experience")
    exp_b = student_b.get("experience")
    is_exp_valid = bool(exp_a and exp_b and exp_a in EXPERIENCE_MAP and exp_b in EXPERIENCE_MAP)
    exp_score = 0
    exp_details = ""

    if is_exp_valid:
        val_a = EXPERIENCE_MAP[exp_a]
        val_b = EXPERIENCE_MAP[exp_b]
        exp_score = 100 - abs(val_a - val_b)
        exp_details = f"{exp_a} and {exp_b} seniority balance."
    else:
        exp_details = "Experience level unavailable."

    # Missing-Data Redistribution
    validity_map = {
        "skill": is_skill_valid,
        "complementary": is_comp_valid,
        "role": is_role_valid,
        "interest": is_interest_valid,
        "availability": is_avail_valid,
        "experience": is_exp_valid
    }

    raw_scores = {
        "skill": skill_score,
        "complementary": comp_score,
        "role": role_score,
        "interest": interest_score,
        "availability": avail_score,
        "experience": exp_score
    }

    valid_weight_sum = sum(BASE_WEIGHTS[k] for k, valid in validity_map.items() if valid)
    factors = {}
    final_weighted_sum = 0.0

    labels = {
        "skill": skill_details,
        "complementary": comp_details,
        "role": role_details,
        "interest": interest_details,
        "availability": avail_details,
        "experience": exp_details
    }

    for key, orig_weight in BASE_WEIGHTS.items():
        is_valid = validity_map[key]
        raw = raw_scores[key]
        eff_weight = (orig_weight / valid_weight_sum) if (is_valid and valid_weight_sum > 0) else 0.0
        contrib = raw * eff_weight
        if is_valid:
            final_weighted_sum += contrib

        factors[key] = {
            "score": raw,
            "isValid": is_valid,
            "originalWeight": orig_weight,
            "effectiveWeight": round(eff_weight, 4),
            "contribution": round(contrib, 2),
            "statusLabel": labels[key]
        }

    overall_score = min(100, round(final_weighted_sum)) if valid_weight_sum > 0 else 0
    confidence_score = round(valid_weight_sum * 100)
    confidence_label = "High confidence" if confidence_score >= 80 else ("Medium confidence" if confidence_score >= 60 else "Low confidence")

    # Strengths and considerations
    strengths = []
    considerations = []
    if is_comp_valid and comp_score >= 80:
        strengths.append(f"Exceptional complementary skill synergy ({comp_score}%).")
    if is_role_valid and role_score >= 85:
        strengths.append(f"Strong role balance: {role_details}")
    if is_interest_valid and interest_score >= 70:
        strengths.append(f"Common domain focus: {interest_details}")
    if is_skill_valid and skill_score < 40 and comp_score < 60:
        considerations.append("Minimal technical overlap or synergy. May require deliberate division of tasks.")
    if is_avail_valid and avail_score < 50:
        considerations.append("Divergent schedules or weekly commitment differences.")

    if not strengths:
        strengths.append("Cross-disciplinary collaboration potential with broad adaptability.")

    return {
        "targetStudentId": student_b.get("id", ""),
        "overallScore": overall_score,
        "confidenceScore": confidence_score,
        "confidenceLabel": confidence_label,
        "factors": factors,
        "strengths": strengths,
        "considerations": considerations,
        "complementaryPairs": comp_pairs[:5],
        "commonSkills": common_skills
    }

def find_best_teammates(student: Dict[str, Any], candidate_pool: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
    """Rank candidates for a given student from highest match to lowest."""
    results = []
    for candidate in candidate_pool:
        if candidate.get("id") == student.get("id"):
            continue
        match = calculate_student_match(student, candidate)
        results.append({
            "student": candidate,
            "match": match
        })
    results.sort(key=lambda x: x["match"]["overallScore"], reverse=True)
    return results[:limit]
