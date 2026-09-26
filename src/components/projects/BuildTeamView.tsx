import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { recommendTeam } from '../../utils/matching/teamMatching';
import { Avatar } from '../common/Avatar';
import {
  CheckCircle2,
  Crown,
  Send,
  Sparkles
} from 'lucide-react';

export const BuildTeamView: React.FC<{
  onOpenCreateProject: () => void;
  onOpenProfile: (student: any) => void;
}> = ({ onOpenCreateProject, onOpenProfile }) => {
  const { currentUser, students, projects, sendTeamRequest, setActiveTab } = useApp();

  const userCreatedProjects = projects.filter((p) => p.creatorId === currentUser.id);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    userCreatedProjects[0]?.id || projects[0]?.id || ''
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  const recommendation = useMemo(() => {
    if (!activeProject) return null;
    return recommendTeam(currentUser, students, activeProject);
  }, [currentUser, students, activeProject]);

  const [invitingAll, setInvitingAll] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);

  const handleInviteAll = () => {
    if (!recommendation || !activeProject) return;
    setInvitingAll(true);
    const toInvite = recommendation.recommendedMembers.filter((m) => m.id !== currentUser.id);

    toInvite.forEach((student) => {
      sendTeamRequest(
        student.id,
        activeProject.id,
        `Salutations ${student.name.split(' ')[0]}. In accordance with our calculated complementary synergy for "${activeProject.title}", you are invited to join the project squad.`
      );
    });

    setInvitedMembers(toInvite.map((s) => s.id));
    setTimeout(() => {
      setInvitingAll(false);
    }, 800);
  };

  if (!activeProject) {
    return (
      <div className="p-12 rounded-xl bg-[#121217] text-center border border-white/[0.08]">
        <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
        <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">No Projects Found</h3>
        <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto mt-1 mb-4">
          Initiate a collegiate project brief to calculate high-synergy teammate assemblies.
        </p>
        <button
          onClick={onOpenCreateProject}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 text-xs font-semibold"
        >
          Create First Project
        </button>
      </div>
    );
  }

  const analysis = recommendation?.predictedAnalysis;

  return (
    <div className="space-y-6">
      {/* Header & Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif-title text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF7F2]">
              Automated Squad Assembly
            </span>
            <span className="px-2 py-0.5 rounded bg-[#251E14] text-[10px] text-[#E5C07B] border border-[#D4AF37]/30 font-bold uppercase tracking-widest font-mono">
              Algorithmic
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            Greedy complementary team recommendation engine to maximize project skill coverage and minimize gaps.
          </p>
        </div>

        {/* Project Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#121217] text-[#FAF7F2] border border-white/[0.12] focus:outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.category})
              </option>
            ))}
          </select>

          <button
            onClick={onOpenCreateProject}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#FAF7F2] border border-white/[0.08]"
          >
            + New Brief
          </button>
        </div>
      </div>

      {/* Target Project Overview Card */}
      <div className="p-5 rounded-xl bg-[#121217] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">{activeProject.title}</h3>
            <span className="text-xs text-[#C5A880]">· {activeProject.category}</span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl">{activeProject.description}</p>
        </div>

        <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-white/[0.08] pt-3 md:pt-0 md:pl-5 shrink-0 text-xs">
          <div>
            <div className="text-[#71717A]">Target Scale</div>
            <div className="font-mono-nums font-bold text-sm text-[#FAF7F2]">
              {activeProject.teamSize} Scholars
            </div>
          </div>
          <div>
            <div className="text-[#71717A]">Constraints</div>
            <div className="font-mono-nums font-bold text-sm text-[#E5C07B]">
              {activeProject.requiredSkills?.length || 0} Skills
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Metrics Grid */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#121217] border border-white/[0.08]">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Projected Squad Synergy
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-[#FAF7F2]">
                {analysis.teamCompatibility}%
              </span>
              <span className="text-xs text-[#E5C07B] font-serif-title">
                Section 39 Metric
              </span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1">
              50% Pairwise + 30% Skill + 20% Role
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121217] border border-white/[0.08]">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Competency Coverage
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-emerald-400">
                {analysis.skillCoverage}%
              </span>
              <span className="text-xs text-[#71717A]">
                of target thresholds
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden mt-2">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${analysis.skillCoverage}%` }}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#121217] border border-white/[0.08]">
            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest block mb-1 font-mono">
              Functional Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-3xl text-[#E5C07B]">
                {analysis.roleCoverage}%
              </span>
              <span className="text-xs text-[#71717A]">
                {analysis.missingRoles.length === 0 ? 'All roles covered' : `${analysis.missingRoles.length} deficit`}
              </span>
            </div>
            <div className="text-[11px] text-[#A1A1AA] mt-1 truncate">
              {analysis.missingRoles.length > 0
                ? `Needs: ${analysis.missingRoles.join(', ')}`
                : 'Balanced multidisciplinary team'}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Members Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E5C07B]" />
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
              Recommended Teammate Assembly
            </h3>
          </div>

          <button
            onClick={handleInviteAll}
            disabled={invitingAll}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-[#E5C07B]" />
            <span>
              {invitingAll
                ? 'Dispatching...'
                : invitedMembers.length > 0
                ? 'Invitations Dispatched ✓'
                : 'Invite Recommended Assembly'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendation?.recommendedMembers.map((member) => {
            const isLeader = member.id === currentUser.id;
            const reasoningItem = recommendation.reasoning.find(
              (r) => r.studentId === member.id
            );
            const role = isLeader
              ? 'Lead Architect & Initiator'
              : reasoningItem?.role || member.roles?.[0] || 'Contributor';
            const wasInvited = invitedMembers.includes(member.id);

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-[#121217] border border-white/[0.08] flex items-start gap-4 hover:border-[#D4AF37]/30 transition-all shadow-sm"
              >
                <Avatar
                  name={member.name}
                  avatarUrl={member.avatarUrl}
                  department={member.department}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-serif-title font-bold text-base text-[#FAF7F2] truncate">
                        {member.name}
                      </span>
                      {isLeader && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30 font-semibold shrink-0">
                          <Crown className="w-3 h-3 text-[#E5C07B]" />
                          <span>Lead</span>
                        </span>
                      )}
                    </div>

                    {!isLeader && wasInvited && (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispatched</span>
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-medium text-[#E5C07B] mb-1">
                    {role}
                  </div>

                  <div className="text-xs text-[#A1A1AA] mb-3">
                    {isLeader
                      ? 'Project Originator & Core System Design'
                      : reasoningItem?.contribution || 'Complementary skill contributor'}
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills?.slice(0, 3).map((sk) => (
                      <span
                        key={sk.name}
                        className="px-2 py-0.5 rounded bg-[#0D0D11] border border-white/[0.06] text-[11px] text-[#FAF7F2] font-mono-nums"
                      >
                        {sk.name} {sk.proficiency}%
                      </span>
                    ))}
                  </div>

                  {!isLeader && (
                    <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-end">
                      <button
                        onClick={() => onOpenProfile(member)}
                        className="text-xs text-[#E5C07B] hover:underline"
                      >
                        Examine Dossier →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skill Gaps Breakdown */}
      {analysis && (
        <div className="p-5 rounded-xl bg-[#121217] border border-white/[0.08] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
              Competency Fulfillment & Deficit Audit
            </h4>
            <span className="text-xs text-[#71717A]">
              Cohort maximum proficiency evaluated against project thresholds
            </span>
          </div>

          <div className="space-y-3">
            {analysis.skillGaps.map((gap) => (
              <div
                key={gap.skillName}
                className="p-3.5 rounded-lg bg-[#0C0C10] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-28 font-medium text-[#FAF7F2]">
                    {gap.skillName}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      gap.status === 'Covered'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : gap.status === 'Weak'
                        ? 'bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {gap.status === 'Covered' && '✓ Covered'}
                    {gap.status === 'Weak' && '⚠ Sub-threshold'}
                    {gap.status === 'Missing' && '✕ Deficit'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[#71717A]">Squad Maximum: </span>
                    <span className="font-mono-nums font-bold text-[#FAF7F2]">
                      {gap.highestTeamProficiency}%
                    </span>
                    <span className="text-[#71717A] font-mono-nums">
                      {' '}
                      / {gap.minProficiency}% req
                    </span>
                  </div>

                  {gap.status !== 'Covered' && (
                    <button
                      onClick={() => {
                        setActiveTab('discover');
                      }}
                      className="px-2.5 py-1 rounded bg-[#181822] text-xs font-medium text-[#E5C07B] hover:text-[#FAF7F2] border border-white/[0.08]"
                    >
                      Locate Teammate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
