import React, { useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { calculateStudentMatch } from "../../utils/matching/studentMatching";
import { Avatar } from "../common/Avatar";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Columns,
  MessageSquare,
  UserPlus,
} from "lucide-react";

interface StudentCardProps {
  student: Student;
  onOpenProfile: (student: Student) => void;
  onSendMessage: (student: Student) => void;
  onRequestTeam: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onOpenProfile,
  onSendMessage,
  onRequestTeam,
}) => {
  const {
    currentUser,
    isShortlisted,
    toggleShortlist,
    comparisonList,
    addToComparison,
    removeFromComparison,
  } = useApp();

  const isSelf = currentUser.id === student.id;

  const matchResult = useMemo(() => {
    return calculateStudentMatch(currentUser, student);
  }, [currentUser, student]);

  const saved = isShortlisted(student.id);
  const inComparison = comparisonList.some((s) => s.id === student.id);

  const confidenceColor =
    matchResult.confidenceScore >= 80
      ? "text-emerald-400"
      : matchResult.confidenceScore >= 60
        ? "text-[#E5C07B]"
        : "text-rose-400";

  return (
    <div className="group rounded-xl bg-[#121216] p-5 border border-white/8 hover:border-[#D4AF37]/30 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl">
      <div>
        {/* Top Header: Avatar + Info + Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              name={student.name}
              avatarUrl={student.avatarUrl}
              department={student.department}
              size="md"
            />
            <div>
              <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2] group-hover:text-[#E8D390] transition-colors leading-tight">
                {student.name}
              </h3>
              {/* Unboxed Metadata (Zero-pill discipline) */}
              <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA] mt-0.5">
                <span>{student.year}</span>
                <span aria-hidden="true" className="text-[#71717A]">
                  ·
                </span>
                <span className="truncate max-w-[160px]">
                  {student.department}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toggleShortlist(student.id)}
            className={`p-2 rounded-lg transition-all ${
              saved
                ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30"
                : "bg-[#18181E] text-[#71717A] hover:text-[#FAF7F2] border border-white/[0.06]"
            }`}
            title={saved ? "Remove from Shortlist" : "Save to Shortlist"}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Match Score & Confidence Banner */}
        {!isSelf ? (
          <div className="mb-4 p-3 rounded-lg bg-[#0D0D11] border border-white/[0.07]">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="font-mono-nums font-bold text-2xl text-[#FAF7F2] tracking-tight">
                  {matchResult.overallScore}%
                </span>
                <span className="text-xs font-serif-title font-semibold tracking-wide text-[#E5C07B]">
                  {matchResult.matchLabel}
                </span>
              </div>
              <span className={`text-[11px] font-medium ${confidenceColor}`}>
                {matchResult.confidenceLabel}
              </span>
            </div>

            {matchResult.complementaryPairs.length > 0 && (
              <div className="mt-2 text-xs text-[#C5A880] flex items-center gap-1.5 truncate border-t border-white/[0.06] pt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#E5C07B]" />
                <span className="truncate">
                  {matchResult.complementaryPairs[0].studentASkill} +{" "}
                  {matchResult.complementaryPairs[0].studentBSkill} synergy
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4 p-2.5 rounded-lg bg-[#0E0E12] text-center text-xs text-[#71717A] border border-white/[0.06]">
            Your Profile (Logged In)
          </div>
        )}

        {/* Preferred Role & Availability */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span>Specialization:</span>
            <span className="text-[#FAF7F2] font-medium">
              {student.roles?.[0] || "Unspecified"}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Availability:</span>
            </span>
            <span className="text-[#FAF7F2]">
              {student.availability
                ? `${student.availability.hoursPerWeek} hrs/wk (${student.availability.preferences.slice(0, 2).join(", ")})`
                : "Not specified"}
            </span>
          </div>
        </div>

        {/* Top Skills with Classic Progress Bars (0 - 100) */}
        <div className="space-y-2 mb-5">
          <div className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">
            Key Competencies
          </div>
          {student.skills && student.skills.length > 0 ? (
            student.skills.slice(0, 3).map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#FAF7F2] font-medium">
                    {skill.name}
                  </span>
                  <span className="font-mono-nums text-[#C5A880]">
                    {skill.proficiency}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1A1A20] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#967246] via-[#B8860B] to-[#E5C07B] transition-all duration-300"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#71717A] italic">
              No skills listed yet
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-white/8">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenProfile(student)}
            className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#FAF7F2] border border-white/8 transition-all text-center"
          >
            Examine
          </button>

          {!isSelf ? (
            <button
              onClick={() => onSendMessage(student)}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#FAF7F2] border border-white/8 transition-all flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Message</span>
            </button>
          ) : null}
        </div>

        {!isSelf && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRequestTeam(student)}
              className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 hover:border-[#D4AF37]/60 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span>Invite</span>
            </button>

            <button
              onClick={() => {
                if (inComparison) {
                  removeFromComparison(student.id);
                } else {
                  addToComparison(student);
                }
              }}
              className={`w-full py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                inComparison
                  ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/40"
                  : "bg-[#181820] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{inComparison ? "Selected" : "Compare"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
