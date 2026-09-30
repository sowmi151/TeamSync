import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { calculateStudentMatch } from "../../utils/matching/studentMatching";
import { Avatar } from "../common/Avatar";
import {
  Award,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Columns,
  GraduationCap,
  MessageSquare,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  onOpenMessage: (student: Student) => void;
  onOpenRequest: (student: Student) => void;
  onEditProfile?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onOpenMessage,
  onOpenRequest,
  onEditProfile,
}) => {
  const {
    currentUser,
    isShortlisted,
    toggleShortlist,
    comparisonList,
    addToComparison,
    removeFromComparison,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"profile" | "matchBreakdown">(
    "profile",
  );

  if (!student) return null;

  const isSelf = currentUser.id === student.id;

  const matchResult = useMemo(() => {
    return calculateStudentMatch(currentUser, student);
  }, [currentUser, student]);

  const saved = isShortlisted(student.id);
  const inComparison = comparisonList.some((s) => s.id === student.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121217] border border-white/[0.12] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="p-6 border-b border-white/8 flex items-start justify-between gap-4 bg-[#15151C]">
          <div className="flex items-center gap-4">
            <Avatar
              name={student.name}
              avatarUrl={student.avatarUrl}
              department={student.department}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title font-bold text-2xl text-[#FAF7F2]">
                  {student.name}
                </h2>
                {isSelf && (
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#2A2318] text-[#E5C07B] border border-[#D4AF37]/30">
                    Self
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mt-0.5">
                <span>{student.year}</span>
                <span aria-hidden="true" className="text-[#71717A]">
                  ·
                </span>
                <span>{student.department}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#1D1D26] hover:bg-[#252532] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Overview vs Match Breakdown */}
        {!isSelf && (
          <div className="px-6 pt-3 border-b border-white/8 flex items-center gap-6 bg-[#121217]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all ${
                activeTab === "profile"
                  ? "border-[#E5C07B] text-[#FAF7F2]"
                  : "border-transparent text-[#71717A] hover:text-[#FAF7F2]"
              }`}
            >
              Curriculum & Profile
            </button>
            <button
              onClick={() => setActiveTab("matchBreakdown")}
              className={`pb-2.5 text-xs font-semibold tracking-wide border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === "matchBreakdown"
                  ? "border-[#E5C07B] text-[#FAF7F2]"
                  : "border-transparent text-[#71717A] hover:text-[#FAF7F2]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span>Compatibility Analysis ({matchResult.overallScore}%)</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#121217]">
          {activeTab === "profile" ? (
            <>
              {/* Bio */}
              <div>
                <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
                  Statement of Intent
                </h4>
                <p className="text-sm text-[#E8E4DD] leading-relaxed">
                  {student.bio || "No personal statement provided."}
                </p>
              </div>

              {/* Roles & Experience & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0D0D11] border border-white/[0.07]">
                  <div className="flex items-center gap-1.5 text-xs text-[#71717A] mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Specialization</span>
                  </div>
                  <div className="text-xs font-medium text-[#FAF7F2]">
                    {student.roles?.join(", ") || (
                      <span className="text-[#71717A] italic">Unspecified</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D0D11] border border-white/[0.07]">
                  <div className="flex items-center gap-1.5 text-xs text-[#71717A] mb-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Seniority</span>
                  </div>
                  <div className="text-xs font-medium text-[#FAF7F2]">
                    {student.experience || (
                      <span className="text-[#71717A] italic">
                        Not specified
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0D0D11] border border-white/[0.07]">
                  <div className="flex items-center gap-1.5 text-xs text-[#71717A] mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Availability</span>
                  </div>
                  <div className="text-xs font-medium text-[#FAF7F2]">
                    {student.availability ? (
                      `${student.availability.hoursPerWeek} hrs/wk (${student.availability.preferences.join(", ")})`
                    ) : (
                      <span className="text-[#71717A] italic">
                        Not specified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills with 0 - 100 Proficiency Bars */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                    Technical Proficiencies (0 - 100)
                  </h4>
                  {isSelf && onEditProfile && (
                    <button
                      onClick={onEditProfile}
                      className="text-xs text-[#E5C07B] hover:underline"
                    >
                      Manage Skills
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {student.skills && student.skills.length > 0 ? (
                    student.skills.map((skill) => (
                      <div key={skill.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-[#FAF7F2]">
                            {skill.name}
                          </span>
                          <span className="font-mono-nums text-[#C5A880]">
                            {skill.proficiency}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-linear-to-r from-[#967246] via-[#B8860B] to-[#E5C07B]"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#71717A] italic">
                      Add skills to calculate skill compatibility.
                    </div>
                  )}
                </div>
              </div>

              {/* Interests & Domains */}
              <div>
                <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
                  Fields of Investigation
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.interests && student.interests.length > 0 ? (
                    student.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 text-xs rounded-lg bg-[#16161D] text-[#E8E4DD] border border-white/8"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#71717A] italic">
                      Add interests to improve matching accuracy.
                    </span>
                  )}
                </div>
              </div>

              {/* Past Projects & Achievements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
                    Prior Project Works
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#E8E4DD]">
                    {student.projects && student.projects.length > 0 ? (
                      student.projects.map((p, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          <span>{p}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#71717A] italic">
                        No projects recorded.
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
                    Academic Honours
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#E8E4DD]">
                    {student.achievements && student.achievements.length > 0 ? (
                      student.achievements.map((a, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#E5C07B] shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#71717A] italic">
                        No honours recorded.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Match Breakdown */
            <div className="space-y-6">
              {/* Score Headline */}
              <div className="p-4 rounded-xl bg-[#0D0D11] border border-[#D4AF37]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-[#231E16] to-[#121217] border border-[#D4AF37]/40 shadow-inner">
                    <span className="font-mono-nums font-bold text-2xl text-[#FAF7F2]">
                      {matchResult.overallScore}%
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-mono text-[#E5C07B]">
                      Index
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
                      {matchResult.matchLabel}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#A1A1AA] mt-0.5">
                      <span>Reliability:</span>
                      <span className="text-emerald-400 font-medium">
                        {matchResult.confidenceLabel} (
                        {matchResult.confidenceScore}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-[#C5A880] font-mono">
                  <span>Deterministic Model</span>
                </div>
              </div>

              {/* Strong Matches */}
              <div>
                <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
                  Symmetric Strengths
                </h4>
                <div className="space-y-2">
                  {matchResult.strongMatches.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#0F0F14] border border-white/[0.06] flex items-center gap-2.5 text-xs text-[#FAF7F2]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill Differences */}
              {matchResult.skillDifferences.myStrongest &&
                matchResult.skillDifferences.theirStrongest && (
                  <div>
                    <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
                      Domain Complementarity
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#0D0D11] border border-white/[0.06]">
                        <span className="text-[#71717A] block mb-1">
                          Your Primary Asset:
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#FAF7F2]">
                            {matchResult.skillDifferences.myStrongest.name}
                          </span>
                          <span className="font-mono-nums text-[#E5C07B]">
                            {matchResult.skillDifferences.myStrongest.prof}%
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#0D0D11] border border-white/[0.06]">
                        <span className="text-[#71717A] block mb-1">
                          Their Primary Asset:
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#FAF7F2]">
                            {matchResult.skillDifferences.theirStrongest.name}
                          </span>
                          <span className="font-mono-nums text-[#E5C07B]">
                            {matchResult.skillDifferences.theirStrongest.prof}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* Recommendation */}
              <div className="p-4 rounded-xl bg-[#1A1813] border border-[#D4AF37]/25">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#E5C07B] mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analytical Recommendation</span>
                </div>
                <p className="text-xs text-[#E8E4DD] leading-relaxed">
                  {matchResult.recommendation}
                </p>
              </div>

              {/* Factor Weight Redistribution Table */}
              <div>
                <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono flex items-center justify-between">
                  <span>Factor Weight Distribution Matrix</span>
                  <span className="text-[#C5A880] lowercase">
                    Normalized to 100%
                  </span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-white/8 bg-[#0E0E12]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#15151B] text-[#71717A] border-b border-white/8">
                      <tr>
                        <th className="py-2.5 px-3">Factor</th>
                        <th className="py-2.5 px-3">Validity</th>
                        <th className="py-2.5 px-3 text-right">Raw</th>
                        <th className="py-2.5 px-3 text-right">Base Wt</th>
                        <th className="py-2.5 px-3 text-right">Eff Wt</th>
                        <th className="py-2.5 px-3 text-right">Yield</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-[#FAF7F2]">
                      {Object.entries(matchResult.factors).map(([key, f]) => {
                        const labels: Record<string, string> = {
                          skill: "Skill Compatibility",
                          complementary: "Complementary Skills",
                          role: "Role Compatibility",
                          interest: "Interests",
                          availability: "Availability",
                          experience: "Experience",
                        };
                        return (
                          <tr
                            key={key}
                            className={
                              f.isValid ? "" : "text-[#71717A] bg-[#09090C]"
                            }
                          >
                            <td className="py-2 px-3 font-medium">
                              {labels[key] || key}
                            </td>
                            <td className="py-2 px-3 text-[11px]">
                              {f.isValid ? (
                                <span className="text-emerald-400">Valid</span>
                              ) : (
                                <span className="text-[#E5C07B]">
                                  Redistributed
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono-nums">
                              {f.isValid ? `${f.score}%` : "—"}
                            </td>
                            <td className="py-2 px-3 text-right font-mono-nums text-[#71717A]">
                              {Math.round(f.originalWeight * 100)}%
                            </td>
                            <td className="py-2 px-3 text-right font-mono-nums font-semibold text-[#E5C07B]">
                              {Math.round(f.effectiveWeight * 100)}%
                            </td>
                            <td className="py-2 px-3 text-right font-mono-nums font-bold text-white">
                              {f.contribution.toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-white/8 bg-[#0E0E12] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isSelf && (
              <>
                <button
                  onClick={() => toggleShortlist(student.id)}
                  className={`p-2.5 rounded-lg transition-all ${
                    saved
                      ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35"
                      : "bg-[#181820] text-[#71717A] hover:text-[#FAF7F2] border border-white/[0.06]"
                  }`}
                  title={saved ? "Remove from Shortlist" : "Save to Shortlist"}
                >
                  {saved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (inComparison) removeFromComparison(student.id);
                    else addToComparison(student);
                  }}
                  className={`p-2.5 rounded-lg transition-all ${
                    inComparison
                      ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35"
                      : "bg-[#181820] text-[#71717A] hover:text-[#FAF7F2] border border-white/[0.06]"
                  }`}
                  title="Compare Candidate"
                >
                  <Columns className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isSelf ? (
              <button
                onClick={onEditProfile}
                className="py-2 px-4 rounded-lg bg-[#2A2318] text-[#FAF7F2] border border-[#D4AF37]/40 text-xs font-semibold hover:border-[#D4AF37]/70"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenMessage(student);
                  }}
                  className="py-2 px-4 rounded-lg bg-[#181822] hover:bg-[#20202C] text-[#FAF7F2] border border-white/8 text-xs font-medium flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenRequest(student);
                  }}
                  className="py-2 px-4 rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/70 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#E5C07B]" />
                  <span>Invite to Squad</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
