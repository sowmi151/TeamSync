import React from 'react';
import { useApp } from '../../context/AppContext';
import { Project, Student } from '../../types';
import { calculateProjectMatch } from '../../utils/matching/projectMatching';
import { Avatar } from '../common/Avatar';
import { Crown, Sparkles, X } from 'lucide-react';

export const ProjectDetailsModal: React.FC<{
  project: Project | null;
  onClose: () => void;
  onRequestJoin: (project: Project) => void;
  onOpenProfile: (student: Student) => void;
}> = ({ project, onClose, onRequestJoin, onOpenProfile }) => {
  const { currentUser, students, setActiveTab } = useApp();

  if (!project) return null;

  const matchResult = calculateProjectMatch(currentUser, project);
  const isMember = project.members.some((m) => m.studentId === currentUser.id);
  const isFull = project.members.length >= project.teamSize;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121217] border border-white/[0.12] shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#E5C07B] font-mono">
                {project.category}
              </span>
              <span className="text-xs text-[#71717A] font-mono">
                · Initiated {project.createdAt}
              </span>
            </div>
            <h2 className="font-serif-title font-bold text-2xl text-[#FAF7F2]">{project.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
            Project Scope & Architecture
          </h4>
          <p className="text-sm text-[#E8E4DD] leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Alignment */}
        <div className="p-4 rounded-xl bg-[#0D0D11] border border-[#D4AF37]/25 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#71717A]">Your Profile Alignment for this Brief</div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono-nums font-bold text-2xl text-[#FAF7F2]">
                {matchResult.overallScore}%
              </span>
              <span className="text-xs font-serif-title text-[#E5C07B]">
                {matchResult.matchLabel}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {matchResult.confidenceLabel}
          </span>
        </div>

        {/* Required Skills Table */}
        <div>
          <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
            Required Technical Competencies
          </h4>
          <div className="space-y-2">
            {matchResult.skillBreakdown.map((sk) => (
              <div
                key={sk.name}
                className="p-3 rounded-xl bg-[#0C0C10] border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
              >
                <div className="w-36">
                  <span className="font-medium text-[#FAF7F2]">{sk.name}</span>
                  <div className="text-[10px] text-[#71717A] font-mono">
                    {sk.isRequired ? 'Mandatory' : 'Preferred'} (Min: {sk.minProficiency}%)
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#71717A]">Your Level:</span>
                    <span className="font-mono-nums font-semibold text-[#FAF7F2]">
                      {sk.studentProficiency}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sk.status === 'Covered'
                          ? 'bg-emerald-500'
                          : sk.status === 'Weak'
                          ? 'bg-[#E5C07B]'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${sk.studentProficiency}%` }}
                    />
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${
                    sk.status === 'Covered'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : sk.status === 'Weak'
                      ? 'bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {sk.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Team Members */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
              Current Squad ({project.members.length} / {project.teamSize})
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.members.map((m) => {
              const student = students.find((s) => s.id === m.studentId);
              if (!student) return null;
              const isLeader = project.creatorId === student.id;

              return (
                <div
                  key={student.id}
                  onClick={() => onOpenProfile(student)}
                  className="p-3 rounded-lg bg-[#0C0C10] border border-white/[0.06] flex items-center gap-3 cursor-pointer hover:border-white/[0.18] transition-all"
                >
                  <Avatar
                    name={student.name}
                    avatarUrl={student.avatarUrl}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif-title font-bold text-sm text-[#FAF7F2] truncate">
                        {student.name}
                      </span>
                      {isLeader && <Crown className="w-3 h-3 text-[#E5C07B] shrink-0" />}
                    </div>
                    <div className="text-[11px] text-[#C5A880] truncate">
                      {m.role}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              setActiveTab('build-team');
            }}
            className="text-xs text-[#E5C07B] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open in Squad Assembler</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#181822] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.08]"
            >
              Close
            </button>

            {!isMember && !isFull && (
              <button
                onClick={() => {
                  onClose();
                  onRequestJoin(project);
                }}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75"
              >
                Request Admission
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
