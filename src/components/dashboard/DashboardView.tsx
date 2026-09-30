import React, { useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { calculateStudentMatch } from "../../utils/matching/studentMatching";
import { TeamNetwork3D } from "../network/TeamNetwork3D";
import { Avatar } from "../common/Avatar";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  Plus,
  Sparkles,
} from "lucide-react";

interface DashboardViewProps {
  onOpenProfile: (student: Student) => void;
  onSendMessage: (student: Student) => void;
  onRequestTeam: (student: Student) => void;
  onOpenCreateProject: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenProfile,
  onSendMessage,
  onRequestTeam,
  onOpenCreateProject,
}) => {
  const {
    currentUser,
    students,
    projects,
    requests,
    setActiveTab,
    setFilterSkillQuery,
  } = useApp();

  const matches = useMemo(() => {
    return students
      .filter((s) => s.id !== currentUser.id)
      .map((student) => ({
        student,
        match: calculateStudentMatch(currentUser, student),
      }))
      .sort((a, b) => b.match.overallScore - a.match.overallScore);
  }, [students, currentUser]);

  const topMatches = matches.slice(0, 3);

  const averageCompatibility = useMemo(() => {
    if (matches.length === 0) return 0;
    const sum = matches.reduce((acc, curr) => acc + curr.match.overallScore, 0);
    return Math.round(sum / matches.length);
  }, [matches]);

  const pendingRequestsCount = requests.filter(
    (r) => r.receiverId === currentUser.id && r.status === "pending",
  ).length;

  const myProjects = projects.filter((p) =>
    p.members.some((m) => m.studentId === currentUser.id),
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-[#111116] border border-white/8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif-title font-bold text-2xl sm:text-3xl text-[#FAF7F2]">
                Salutations, {currentUser.name.split(" ")[0]}
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30">
                {currentUser.year}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl">
              Deterministic peer compatibility evaluated across{" "}
              {students.length - 1} scholars via weighted complementary
              indexing.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab("discover")}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#FAF7F2] border border-white/8 transition-all flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Discover Peers</span>
          </button>

          <button
            onClick={() => setActiveTab("build-team")}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#181820] hover:bg-[#20202A] text-[#FAF7F2] border border-white/8 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5C07B]" />
            <span>Assemble Squad</span>
          </button>

          <button
            onClick={onOpenCreateProject}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/70 shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C07B]" />
            <span>Initiate Project</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
            Mean Compatibility
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums font-bold text-3xl text-[#FAF7F2]">
              {averageCompatibility}%
            </span>
            <span className="text-xs font-serif-title text-[#E5C07B]">
              Cohort Average
            </span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">
            Weighted across competencies & roles
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
            Active Projects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums font-bold text-3xl text-[#FAF7F2]">
              {myProjects.length}
            </span>
            <span className="text-xs text-[#71717A]">Collegiate Teams</span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1 truncate">
            {myProjects[0]?.title || "No active project"}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
            Pending Invitations
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums font-bold text-3xl text-[#E5C07B]">
              {pendingRequestsCount}
            </span>
            <span className="text-xs text-[#71717A]">Awaiting Review</span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1">
            {pendingRequestsCount > 0 ? (
              <button
                onClick={() => setActiveTab("requests")}
                className="text-[#E5C07B] hover:underline"
              >
                Inspect requests →
              </button>
            ) : (
              "All decisions processed"
            )}
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#121217] border border-white/8 shadow-sm">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
            Rated Competencies
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-nums font-bold text-3xl text-[#FAF7F2]">
              {currentUser.skills?.length || 0}
            </span>
            <span className="text-xs text-[#71717A]">Verified Skills</span>
          </div>
          <div className="text-[11px] text-[#A1A1AA] mt-1 truncate">
            Primary: {currentUser.skills?.[0]?.name} (
            {currentUser.skills?.[0]?.proficiency}%)
          </div>
        </div>
      </div>

      {/* Signature 3D Team Network */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
              Interactive Celestial Orbit
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              Radial distance directly corresponds to computed multi-factor
              synergy.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("discover")}
            className="text-xs text-[#E5C07B] hover:underline font-medium flex items-center gap-1"
          >
            <span>Open Cohort Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <TeamNetwork3D onSelectStudent={onOpenProfile} height={420} />
      </div>

      {/* Two Column Layout: Top Matches + Active Project Skill Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Top Matches Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E5C07B]" />
              <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
                Highest Projected Synergies
              </h3>
            </div>
            <button
              onClick={() => setActiveTab("discover")}
              className="text-xs text-[#E5C07B] hover:underline"
            >
              Examine Registry ({students.length - 1}) →
            </button>
          </div>

          <div className="space-y-3">
            {topMatches.map(({ student, match }) => (
              <div
                key={student.id}
                className="p-4 rounded-xl bg-[#121217] border border-white/8 hover:border-[#D4AF37]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar
                    name={student.name}
                    avatarUrl={student.avatarUrl}
                    department={student.department}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif-title font-bold text-base text-[#FAF7F2]">
                        {student.name}
                      </span>
                      <span className="text-xs text-[#C5A880]">
                        {student.roles?.[0] || "Contributor"}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                      {student.department} · {student.year}
                    </div>

                    {match.complementaryPairs.length > 0 && (
                      <div className="text-xs text-[#C5A880] flex items-center gap-1.5 mt-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#E5C07B] shrink-0" />
                        <span className="truncate">
                          {match.complementaryPairs[0].studentASkill} +{" "}
                          {match.complementaryPairs[0].studentBSkill} synergy
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.06]">
                  <div className="text-right">
                    <span className="font-mono-nums font-bold text-2xl text-[#FAF7F2]">
                      {match.overallScore}%
                    </span>
                    <span className="text-[10px] text-[#E5C07B] block font-serif-title">
                      {match.matchLabel.split(" ")[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenProfile(student)}
                      className="px-2.5 py-1 text-xs rounded-md bg-[#181822] hover:bg-[#20202C] text-[#FAF7F2] border border-white/8"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onRequestTeam(student)}
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right (5 cols): Active Project Health & Gaps Alert */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#C5A880]" />
              <span>Project Health</span>
            </h3>
            <button
              onClick={() => setActiveTab("my-team")}
              className="text-xs text-[#E5C07B] hover:underline"
            >
              Squad Workspace →
            </button>
          </div>

          {myProjects.length > 0 ? (
            <div className="p-5 rounded-xl bg-[#121217] border border-white/8 space-y-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E5C07B] font-mono">
                    {myProjects[0].category}
                  </span>
                  <span className="text-xs text-[#71717A] font-mono-nums">
                    {myProjects[0].members.length}/{myProjects[0].teamSize}{" "}
                    Scholars
                  </span>
                </div>
                <h4 className="font-serif-title font-bold text-lg text-[#FAF7F2] mt-1">
                  {myProjects[0].title}
                </h4>
              </div>

              {/* Skill Gap Alert preview */}
              <div className="p-3.5 rounded-lg bg-[#0E0E12] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A1A1AA]">Skill Coverage Index:</span>
                  <span className="font-mono-nums font-bold text-emerald-400">
                    82%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[82%]" />
                </div>
              </div>

              {/* Missing skills alert */}
              <div className="p-3.5 rounded-lg bg-[#1A1610] border border-[#D4AF37]/25 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-[#E5C07B] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-[#FAF7F2]">
                    Competency Deficit Identified
                  </span>
                  <p className="text-[#A1A1AA] leading-tight">
                    Smart Campus Navigation requires DevOps proficiency for
                    multi-region container orchestration.
                  </p>
                  <button
                    onClick={() => {
                      setFilterSkillQuery("Cloud");
                      setActiveTab("discover");
                    }}
                    className="text-xs text-[#E5C07B] font-semibold hover:underline block pt-1"
                  >
                    Locate Cloud Specialist →
                  </button>
                </div>
              </div>

              {/* Members preview */}
              <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {myProjects[0].members.map((m) => {
                    const st = students.find((s) => s.id === m.studentId);
                    if (!st) return null;
                    return (
                      <Avatar
                        key={st.id}
                        name={st.name}
                        avatarUrl={st.avatarUrl}
                        size="sm"
                        className="border-2 border-[#121217]"
                      />
                    );
                  })}
                </div>
                <button
                  onClick={() => setActiveTab("my-team")}
                  className="px-3 py-1.5 rounded-lg bg-[#181820] hover:bg-[#20202A] text-xs font-medium text-[#FAF7F2] border border-white/8"
                >
                  Manage Squad
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-[#121217] border border-white/8 text-center space-y-3">
              <Briefcase className="w-6 h-6 text-[#71717A] mx-auto" />
              <div className="text-xs text-[#A1A1AA]">
                No current project affiliations found.
              </div>
              <button
                onClick={onOpenCreateProject}
                className="px-3.5 py-1.5 rounded-lg bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30 text-xs font-medium"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
