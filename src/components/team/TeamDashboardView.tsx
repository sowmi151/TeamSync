import React, { useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { analyzeTeam } from "../../utils/matching/teamMatching";
import { Avatar } from "../common/Avatar";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Crown,
  Plus,
  Search,
  Users,
} from "lucide-react";

export const TeamDashboardView: React.FC<{
  onOpenProfile: (student: Student) => void;
  onOpenMessage: (student: Student) => void;
  onOpenCreateProject: () => void;
}> = ({ onOpenProfile, onOpenMessage, onOpenCreateProject }) => {
  const { currentUser, projects, students, setActiveTab, setFilterSkillQuery } =
    useApp();

  const myProjects = useMemo(() => {
    return projects.filter((p) =>
      p.members.some((m) => m.studentId === currentUser.id),
    );
  }, [projects, currentUser]);

  const [activeProjectId, setActiveProjectId] = React.useState<string>(
    myProjects[0]?.id || projects[0]?.id || "",
  );

  const currentProject = useMemo(() => {
    return (
      projects.find((p) => p.id === activeProjectId) ||
      myProjects[0] ||
      projects[0]
    );
  }, [projects, activeProjectId, myProjects]);

  const teamStudents = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.members
      .map((m) => students.find((s) => s.id === m.studentId))
      .filter((s): s is Student => Boolean(s));
  }, [currentProject, students]);

  const analysis = useMemo(() => {
    if (!currentProject || teamStudents.length === 0) return null;
    return analyzeTeam(teamStudents, currentProject);
  }, [teamStudents, currentProject]);

  if (!currentProject) {
    return (
      <div className="p-12 rounded-xl bg-[#121217] text-center border border-white/8 space-y-4">
        <Users className="w-8 h-8 text-[#D4AF37] mx-auto opacity-75" />
        <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
          No active project affiliations
        </h3>
        <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
          Create a project to lead a squad or accept pending team requests to
          collaborate.
        </p>
        <button
          onClick={onOpenCreateProject}
          className="px-4 py-2 rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 text-xs font-semibold"
        >
          Create Project
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Project Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
              {currentProject.title}
            </h2>
            <span className="px-2 py-0.5 rounded bg-[#251E14] text-[10px] text-[#E5C07B] border border-[#D4AF37]/30 font-bold uppercase tracking-widest font-mono">
              {currentProject.category}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            {currentProject.description}
          </p>
        </div>

        {myProjects.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717A]">Switch Project:</span>
            <select
              value={currentProject.id}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#121217] text-[#FAF7F2] border border-white/[0.12] focus:outline-none"
            >
              {myProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Team Health Analytics Bar */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Collective Synergy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-[#FAF7F2]">
                {analysis.teamCompatibility}%
              </span>
              <span className="text-xs text-[#E5C07B] font-serif-title">
                Section 39
              </span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">
              50% Pairwise + 30% Skill + 20% Role
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Skill Coverage
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-emerald-400">
                {analysis.skillCoverage}%
              </span>
              <span className="text-xs text-[#71717A]">Index</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${analysis.skillCoverage}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Role Fulfillment
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-[#E5C07B]">
                {analysis.roleCoverage}%
              </span>
              <span className="text-xs text-[#71717A]">
                {analysis.missingRoles.length === 0 ? "Full" : "Deficits"}
              </span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 truncate">
              {analysis.missingRoles.length > 0
                ? `Deficit: ${analysis.missingRoles.join(", ")}`
                : "All target roles covered"}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Squad Quota
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-[#FAF7F2]">
                {currentProject.members.length} / {currentProject.teamSize}
              </span>
              <span className="text-xs text-[#71717A]">Scholars</span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">
              {currentProject.members.length >= currentProject.teamSize
                ? "Full squad formalized"
                : `${currentProject.teamSize - currentProject.members.length} open position(s)`}
            </div>
          </div>
        </div>
      )}

      {/* Active Team Members Roster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#E5C07B]" />
            <span>Active Squad Roster</span>
          </h3>

          {currentProject.members.length < currentProject.teamSize && (
            <button
              onClick={() => setActiveTab("build-team")}
              className="text-xs text-[#E5C07B] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assemble Additional Teammates</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentProject.members.map((member) => {
            const studentObj = students.find((s) => s.id === member.studentId);
            if (!studentObj) return null;

            const isCurrentStudentLeader =
              currentProject.creatorId === studentObj.id;
            const isMe = studentObj.id === currentUser.id;

            return (
              <div
                key={member.studentId}
                className="p-4 rounded-xl bg-[#121217] border border-white/8 flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Avatar
                      name={studentObj.name}
                      avatarUrl={studentObj.avatarUrl}
                      department={studentObj.department}
                      size="md"
                    />
                    {isCurrentStudentLeader ? (
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35 font-semibold">
                        <Crown className="w-3 h-3 text-[#E5C07B]" />
                        <span>Lead</span>
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D0D11] border border-white/[0.06] text-[#71717A]">
                        Member
                      </span>
                    )}
                  </div>

                  <div className="font-serif-title font-bold text-base text-[#FAF7F2]">
                    {studentObj.name} {isMe ? "(You)" : ""}
                  </div>
                  <div className="text-xs text-[#E5C07B] font-medium mt-0.5">
                    {member.role || studentObj.roles?.[0] || "Contributor"}
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] mt-1 truncate">
                    {studentObj.department}
                  </div>

                  {/* Key skills preview */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {studentObj.skills?.slice(0, 2).map((sk) => (
                      <span
                        key={sk.name}
                        className="px-1.5 py-0.5 rounded bg-[#0D0D11] border border-white/[0.06] text-[10px] font-mono-nums text-[#FAF7F2]"
                      >
                        {sk.name} {sk.proficiency}%
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <button
                    onClick={() => onOpenProfile(studentObj)}
                    className="text-[#E5C07B] hover:underline"
                  >
                    Examine
                  </button>
                  {!isMe && (
                    <button
                      onClick={() => onOpenMessage(studentObj)}
                      className="text-[#A1A1AA] hover:text-[#FAF7F2]"
                    >
                      Message
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Skill Matrix */}
      <div className="p-5 rounded-xl bg-[#121217] border border-white/8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
              Squad Competency Matrix
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Proficiency distribution across all project members and collective
              team coverage status.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/8 bg-[#0E0E12]">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-[#15151B] text-[#71717A] border-b border-white/8">
              <tr>
                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest font-mono">
                  Required Competency
                </th>
                <th className="py-3 px-3 text-center">Min Req</th>
                {teamStudents.map((member) => (
                  <th key={member.id} className="py-3 px-3 text-center">
                    {member.name.split(" ")[0]}
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-bold text-[#E5C07B]">
                  Squad Max
                </th>
                <th className="py-3 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-[#FAF7F2]">
              {currentProject.requiredSkills?.map((reqSkill) => {
                let highest = 0;
                teamStudents.forEach((student) => {
                  const found = (student.skills || []).find(
                    (s) => s.name.toLowerCase() === reqSkill.name.toLowerCase(),
                  );
                  if (found && found.proficiency > highest) {
                    highest = found.proficiency;
                  }
                });

                const isCovered = highest >= reqSkill.minProficiency;
                const isWeak = highest > 0 && highest < reqSkill.minProficiency;

                return (
                  <tr
                    key={reqSkill.name}
                    className="hover:bg-[#16161D]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-white">
                      {reqSkill.name}
                      {!reqSkill.isRequired && (
                        <span className="text-[10px] text-[#71717A] font-normal ml-1.5 font-mono">
                          (Preferred)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono-nums text-[#71717A]">
                      {reqSkill.minProficiency}%
                    </td>
                    {teamStudents.map((member) => {
                      const sk = (member.skills || []).find(
                        (s) =>
                          s.name.toLowerCase() === reqSkill.name.toLowerCase(),
                      );
                      return (
                        <td
                          key={member.id}
                          className="py-3 px-3 text-center font-mono-nums"
                        >
                          {sk ? (
                            <span
                              className={`font-semibold ${
                                sk.proficiency >= reqSkill.minProficiency
                                  ? "text-emerald-400"
                                  : "text-[#E5C07B]"
                              }`}
                            >
                              {sk.proficiency}%
                            </span>
                          ) : (
                            <span className="text-[#71717A] opacity-40">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center font-mono-nums font-bold text-[#FAF7F2]">
                      {highest > 0 ? `${highest}%` : "0%"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isCovered ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Covered</span>
                        </span>
                      ) : isWeak ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E5C07B]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Sub-threshold</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Deficit</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill Gaps Detection & Role Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Gaps Widget */}
        <div className="p-5 rounded-xl bg-[#121217] border border-white/8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#E5C07B]" />
              <span>Competency Deficit Analysis</span>
            </h3>
            <span className="text-xs text-[#71717A] font-mono">
              Continuous Audit
            </span>
          </div>

          <div className="space-y-2.5">
            {analysis?.skillGaps.map((gap) => (
              <div
                key={gap.skillName}
                className="p-3.5 rounded-lg bg-[#0C0C10] border border-white/[0.06] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-medium text-[#FAF7F2]">
                    {gap.skillName}
                  </span>
                  <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Squad Max: {gap.highestTeamProficiency}% (Min:{" "}
                    {gap.minProficiency}%)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                      gap.status === "Covered"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : gap.status === "Weak"
                          ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                    }`}
                  >
                    {gap.status}
                  </span>

                  {gap.status !== "Covered" && (
                    <button
                      onClick={() => {
                        setFilterSkillQuery(gap.skillName);
                        setActiveTab("discover");
                      }}
                      className="px-2 py-1 rounded bg-[#181822] text-[11px] font-medium text-[#E5C07B] hover:text-[#FAF7F2] border border-white/8 flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      <span>Locate Peer</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Role Balance */}
        <div className="p-5 rounded-xl bg-[#121217] border border-white/8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
              Domain Role Distribution
            </h3>
            <span className="text-xs text-[#71717A] font-mono">
              Functional Balance
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {currentProject.requiredRoles?.map((role) => {
              const count = analysis?.roleDistribution[role] || 0;
              const isFilled = count > 0;

              return (
                <div key={role} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#FAF7F2]">{role}</span>
                    <span className="font-mono-nums text-[11px] text-[#C5A880]">
                      {isFilled ? `${count} scholar(s)` : "Vacant"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFilled
                          ? "bg-linear-to-r from-[#967246] via-[#B8860B] to-[#E5C07B] w-full"
                          : "w-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
