import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Project, ProjectSkillRequirement } from "../../types";
import { Plus, Trash2, X, Sparkles } from "lucide-react";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onCreated,
}) => {
  const { currentUser, createProject } = useApp();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Project["category"]>("Hackathon");
  const [teamSize, setTeamSize] = useState<number>(4);

  const [requiredSkills, setRequiredSkills] = useState<
    ProjectSkillRequirement[]
  >([
    { name: "Python", minProficiency: 75, isRequired: true },
    { name: "React", minProficiency: 75, isRequired: true },
    { name: "UI/UX", minProficiency: 70, isRequired: false },
  ]);

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillMinProf, setNewSkillMinProf] = useState(70);
  const [newSkillIsRequired, setNewSkillIsRequired] = useState(true);

  const [requiredRoles, setRequiredRoles] = useState<string[]>([
    "Backend Developer",
    "Frontend Developer",
    "UI/UX Designer",
  ]);
  const [newRole, setNewRole] = useState("");

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setRequiredSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        minProficiency: newSkillMinProf,
        isRequired: newSkillIsRequired,
      },
    ]);
    setNewSkillName("");
    setNewSkillMinProf(70);
  };

  const handleRemoveSkill = (index: number) => {
    setRequiredSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRole = () => {
    if (!newRole.trim()) return;
    if (!requiredRoles.includes(newRole.trim())) {
      setRequiredRoles((prev) => [...prev, newRole.trim()]);
    }
    setNewRole("");
  };

  const handleRemoveRole = (role: string) => {
    setRequiredRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newProj = createProject({
      title: title.trim(),
      description: description.trim(),
      category,
      creatorId: currentUser.id,
      teamSize,
      requiredSkills,
      requiredRoles,
      status: "open",
    });

    if (onCreated) {
      onCreated(newProj);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121217] border border-white/[0.12] shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/8 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E5C07B]" />
            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
                Publish Collegiate Project Brief
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Define skill criteria, target roles, and team scale for
                intelligent teammate matching.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Autonomous Rover Vision or Decentralized Credential Ledger"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0C0C10] text-xs sm:text-sm text-[#FAF7F2] border border-white/8 focus:outline-none focus:border-[#D4AF37]/40"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
              Abstract & Scope of Work *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the core technical problem, architecture approach, and project goals..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0C0C10] text-xs sm:text-sm text-[#FAF7F2] border border-white/8 focus:outline-none focus:border-[#D4AF37]/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
                Initiative Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8 focus:outline-none"
              >
                <option value="Academic">Academic Capstone</option>
                <option value="Hackathon">Hackathon Sprint</option>
                <option value="Competition">National Competition</option>
                <option value="Research">Research Laboratory</option>
                <option value="Startup">Early-Stage Venture</option>
                <option value="Personal Project">Personal R&D</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
                Target Squad Quota ({teamSize} Scholars)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={2}
                  max={8}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="flex-1 accent-[#D4AF37]"
                />
                <span className="font-mono-nums font-bold text-sm text-[#FAF7F2] w-12 text-center py-1 rounded-md bg-[#0C0C10] border border-white/8">
                  {teamSize}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
              Requisite Competencies (with Minimum Thresholds)
            </label>
            <div className="space-y-2 mb-3">
              {requiredSkills.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0C0C10] border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#FAF7F2]">
                      {req.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        req.isRequired
                          ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35"
                          : "bg-[#181822] text-[#71717A]"
                      }`}
                    >
                      {req.isRequired ? "Mandatory" : "Preferred"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono-nums text-[#C5A880]">
                      Min: {req.minProficiency}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      className="text-[#71717A] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[#15151C] border border-white/8 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Competency (e.g. PyTorch, Docker)"
                className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8"
              />
              <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                <span>Min:</span>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={newSkillMinProf}
                  onChange={(e) => setNewSkillMinProf(Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded-md bg-[#0C0C10] text-xs font-mono-nums text-[#FAF7F2] border border-white/8"
                />
                <span>%</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-[#A1A1AA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSkillIsRequired}
                  onChange={(e) => setNewSkillIsRequired(e.target.checked)}
                  className="rounded accent-[#D4AF37]"
                />
                <span>Mandatory</span>
              </label>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-lg bg-[#1E1E26] hover:bg-[#252532] text-xs font-medium text-[#FAF7F2] border border-white/8 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5C07B]" />
                <span>Add Criterion</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-2 font-mono">
              Target Functional Roles
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {requiredRoles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 rounded-lg bg-[#14141A] border border-white/8 text-xs text-[#FAF7F2] flex items-center gap-1.5"
                >
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(role)}
                    className="hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Embedded Firmware Engineer"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3.5 py-1.5 rounded-lg bg-[#1E1E26] text-xs font-medium text-[#FAF7F2] border border-white/8"
              >
                + Add Role
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14141A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/8"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 transition-all shadow-sm"
            >
              Publish Brief & Begin Matching
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
