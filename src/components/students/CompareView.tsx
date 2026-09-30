import React from "react";
import { useApp } from "../../context/AppContext";
import { Avatar } from "../common/Avatar";
import { calculateStudentMatch } from "../../utils/matching/studentMatching";
import {
  AlertCircle,
  Briefcase,
  Clock,
  GraduationCap,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

export const CompareView: React.FC<{
  onOpenMessage: (student: any) => void;
  onOpenRequest: (student: any) => void;
}> = ({ onOpenMessage, onOpenRequest }) => {
  const {
    currentUser,
    students,
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
  } = useApp();

  const allComparedSkills = Array.from(
    new Set(
      comparisonList.flatMap((s) => (s.skills || []).map((sk) => sk.name)),
    ),
  ).sort();

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
            Candidate Comparative Matrix
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            Side-by-side analysis of complementary synergies, technical
            proficiencies, and missing data transparency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {comparisonList.length > 0 && (
            <button
              onClick={clearComparison}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#14141A] hover:bg-[#1C1C24] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Matrix</span>
            </button>
          )}

          {comparisonList.length < 4 && (
            <div className="relative">
              <select
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  const found = students.find((s) => s.id === id);
                  if (found) addToComparison(found);
                  e.target.value = "";
                }}
                defaultValue=""
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#121217] text-[#FAF7F2] border border-white/[0.12] cursor-pointer focus:outline-none"
              >
                <option value="" disabled>
                  + Add Scholar ({comparisonList.length}/4)
                </option>
                {students
                  .filter((s) => !comparisonList.some((c) => c.id === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roles?.[0] || "Student"})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {comparisonList.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#121217] text-center border border-white/8 space-y-4">
          <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto opacity-75" />
          <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
            No Candidates Selected for Matrix
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            Select 2 to 4 scholars from the Discover directory to evaluate
            pairwise compatibility, skill overlaps, and schedule alignments.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            {students.slice(0, 3).map((s) => (
              <button
                key={s.id}
                onClick={() => addToComparison(s)}
                className="px-3 py-1.5 rounded-lg bg-[#181822] text-xs font-medium text-[#FAF7F2] border border-white/8 hover:border-[#D4AF37]/40"
              >
                + Compare {s.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-[#121217] border border-white/8 shadow-xl">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#15151B] border-b border-white/8">
                <th className="p-4 w-48 text-[10px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Attribute / Candidate
                </th>
                {comparisonList.map((student) => {
                  const match = calculateStudentMatch(currentUser, student);
                  const isSelf = student.id === currentUser.id;
                  return (
                    <th key={student.id} className="p-4 w-64 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={student.name}
                            avatarUrl={student.avatarUrl}
                            department={student.department}
                            size="md"
                          />
                          <div>
                            <div className="font-serif-title font-bold text-base text-[#FAF7F2]">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-[#A1A1AA]">
                              {student.year} · {student.department}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromComparison(student.id)}
                          className="p-1 rounded hover:bg-[#1E1E26] text-[#71717A] hover:text-[#FAF7F2]"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {!isSelf && (
                        <div className="mt-3 p-2 rounded-lg bg-[#0C0C10] border border-white/[0.06] flex items-center justify-between">
                          <span className="text-[11px] text-[#71717A]">
                            Synergy with You:
                          </span>
                          <span className="font-mono-nums font-bold text-xs text-[#E5C07B]">
                            {match.overallScore}% (
                            {match.matchLabel.split(" ")[0]})
                          </span>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06] text-xs">
              {/* Target Role */}
              <tr className="hover:bg-[#16161D]/50 transition-colors">
                <td className="p-4 font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Specialization</span>
                </td>
                {comparisonList.map((student) => (
                  <td key={student.id} className="p-4 text-[#FAF7F2]">
                    {student.roles && student.roles.length > 0 ? (
                      student.roles.join(", ")
                    ) : (
                      <span className="text-[#E5C07B] italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Role unspecified</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Experience Level */}
              <tr className="hover:bg-[#16161D]/50 transition-colors">
                <td className="p-4 font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Seniority</span>
                </td>
                {comparisonList.map((student) => (
                  <td key={student.id} className="p-4 text-[#FAF7F2]">
                    {student.experience ? (
                      <span className="font-medium text-[#FAF7F2]">
                        {student.experience}
                      </span>
                    ) : (
                      <span className="text-[#E5C07B] italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Not specified (Weight redistributed)</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr className="hover:bg-[#16161D]/50 transition-colors">
                <td className="p-4 font-semibold text-[#A1A1AA] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Commitment</span>
                </td>
                {comparisonList.map((student) => (
                  <td key={student.id} className="p-4 text-[#FAF7F2]">
                    {student.availability ? (
                      <div>
                        <span className="font-semibold text-[#FAF7F2]">
                          {student.availability.hoursPerWeek} hrs/week
                        </span>
                        <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                          {student.availability.preferences.join(", ")}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#E5C07B] italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Not specified</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Interests */}
              <tr className="hover:bg-[#16161D]/50 transition-colors">
                <td className="p-4 font-semibold text-[#A1A1AA]">
                  <span>Domains</span>
                </td>
                {comparisonList.map((student) => (
                  <td key={student.id} className="p-4 text-[#FAF7F2]">
                    {student.interests && student.interests.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {student.interests.map((int) => (
                          <span
                            key={int}
                            className="px-2 py-0.5 rounded bg-[#0C0C10] border border-white/[0.06] text-[11px] text-[#E8E4DD]"
                          >
                            {int}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#E5C07B] italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>Unspecified</span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Complementary Synergy with You */}
              <tr className="hover:bg-[#16161D]/50 transition-colors bg-[#181611]/60">
                <td className="p-4 font-semibold text-[#E5C07B]">
                  <span>Complementary Synergy</span>
                </td>
                {comparisonList.map((student) => {
                  const match = calculateStudentMatch(currentUser, student);
                  const isSelf = student.id === currentUser.id;
                  if (isSelf) {
                    return (
                      <td
                        key={student.id}
                        className="p-4 text-[#71717A] italic"
                      >
                        Self profile
                      </td>
                    );
                  }
                  return (
                    <td key={student.id} className="p-4 text-[#FAF7F2]">
                      {match.complementaryPairs.length > 0 ? (
                        <div className="space-y-1">
                          <span className="font-semibold text-[#E8D390]">
                            {match.complementaryPairs[0].studentASkill} +{" "}
                            {match.complementaryPairs[0].studentBSkill}
                          </span>
                          <div className="text-[11px] text-[#A1A1AA]">
                            {match.complementaryPairs[0].explanation}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#71717A] italic">
                          No direct complementary rule matched
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Skills Matrix Breakdown */}
              <tr className="bg-[#15151B] border-t border-b border-white/8">
                <td
                  colSpan={comparisonList.length + 1}
                  className="py-2 px-4 font-mono font-bold text-[#E5C07B] uppercase tracking-widest text-[10px]"
                >
                  Technical Competency Ratings (0 - 100)
                </td>
              </tr>

              {allComparedSkills.map((skillName) => (
                <tr
                  key={skillName}
                  className="hover:bg-[#16161D]/50 transition-colors"
                >
                  <td className="p-4 font-medium text-[#FAF7F2]">
                    {skillName}
                  </td>
                  {comparisonList.map((student) => {
                    const sk = (student.skills || []).find(
                      (s) => s.name.toLowerCase() === skillName.toLowerCase(),
                    );
                    return (
                      <td key={student.id} className="p-4">
                        {sk ? (
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#FAF7F2] font-semibold">
                                {sk.proficiency}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-linear-to-r from-[#967246] via-[#B8860B] to-[#E5C07B]"
                                style={{ width: `${sk.proficiency}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#71717A] opacity-40">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Quick Actions Row */}
              <tr className="bg-[#0F0F14]">
                <td className="p-4 font-semibold text-[#71717A]">Actions</td>
                {comparisonList.map((student) => {
                  const isSelf = student.id === currentUser.id;
                  return (
                    <td key={student.id} className="p-4">
                      {!isSelf ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenRequest(student)}
                            className="px-3 py-1.5 rounded-md bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 text-xs font-semibold hover:border-[#D4AF37]/60"
                          >
                            Invite
                          </button>
                          <button
                            onClick={() => onOpenMessage(student)}
                            className="px-3 py-1.5 rounded-md bg-[#181822] hover:bg-[#20202A] text-xs text-[#FAF7F2] border border-white/8"
                          >
                            Chat
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#71717A]">
                          Self record
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
