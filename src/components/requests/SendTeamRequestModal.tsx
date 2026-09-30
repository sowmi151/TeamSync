import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { Avatar } from "../common/Avatar";
import { Send, UserPlus, X } from "lucide-react";

interface SendTeamRequestModalProps {
  targetStudent: Student | null;
  onClose: () => void;
}

export const SendTeamRequestModal: React.FC<SendTeamRequestModalProps> = ({
  targetStudent,
  onClose,
}) => {
  const { currentUser, projects, sendTeamRequest, setActiveTab } = useApp();

  const userProjects = projects.filter(
    (p) =>
      p.creatorId === currentUser.id ||
      p.members.some((m) => m.studentId === currentUser.id),
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    userProjects[0]?.id || "",
  );
  const [message, setMessage] = useState(
    targetStudent
      ? `Salutations ${targetStudent.name.split(" ")[0]}. In review of your verified competency profile, we would like to invite you to join our collegiate project squad.`
      : "",
  );

  if (!targetStudent) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !message.trim()) return;

    sendTeamRequest(targetStudent.id, selectedProjectId, message.trim());
    onClose();
    setActiveTab("requests");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#121217] border border-white/[0.12] shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-5">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#E5C07B]" />
            <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
              Dispatch Collaborative Invitation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Student Preview */}
        <div className="p-3.5 rounded-xl bg-[#0C0C10] border border-white/[0.06] flex items-center gap-3 mb-4">
          <Avatar
            name={targetStudent.name}
            avatarUrl={targetStudent.avatarUrl}
            department={targetStudent.department}
            size="sm"
          />
          <div>
            <div className="font-serif-title font-bold text-sm text-[#FAF7F2]">
              {targetStudent.name}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">
              {targetStudent.department} ·{" "}
              {targetStudent.roles?.[0] || "Contributor"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
              Target Project Initiative *
            </label>
            {userProjects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8 focus:outline-none"
              >
                {userProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.members.length}/{p.teamSize} scholars)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-[#E5C07B] p-2 rounded-lg bg-[#1C1812] border border-[#D4AF37]/25">
                You must publish a project brief before dispatching team
                invitations.
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
              Formal Invitation Message
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8 focus:outline-none focus:border-[#D4AF37]/40"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14141A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={userProjects.length === 0}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span>Dispatch Invitation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
