import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Project } from "../../types";
import { calculateProjectMatch } from "../../utils/matching/projectMatching";
import { Plus, Search, Users } from "lucide-react";

export const ProjectDiscoveryView: React.FC<{
  onOpenCreateProject: () => void;
  onSelectProject: (project: Project) => void;
  onRequestJoin: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}> = ({
  onOpenCreateProject,
  onSelectProject,
  onRequestJoin,
}) => {
  const { projects, currentUser } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((project) => {
    if (categoryFilter !== "all" && project.category !== categoryFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = project.title.toLowerCase().includes(q);
      const matchDesc = project.description.toLowerCase().includes(q);
      const matchSkill = project.requiredSkills?.some((s) =>
        s.name.toLowerCase().includes(q)
      );
      if (!matchTitle && !matchDesc && !matchSkill) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
            Project & Capstone Initiatives
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            Discover active campus initiatives, research labs, and hackathons
            actively seeking complementary skillsets.
          </p>
        </div>

        <button
          onClick={onOpenCreateProject}
          className="px-4 py-2.5 rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 text-xs font-semibold hover:border-[#D4AF37]/75 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#E5C07B]" />
          <span>Publish Project Brief</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#121217] border border-white/8 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, keywords, or required competency..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/8 focus:outline-none focus:border-[#D4AF37]/40"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            "all",
            "Hackathon",
            "Academic",
            "Research",
            "Startup",
            "Competition",
          ].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35 shadow-sm"
                  : "bg-[#16161D] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.06]"
              }`}
            >
              {cat === "all" ? "All Domains" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((project) => {
          const matchResult = calculateProjectMatch(currentUser, project);
          const isFull = project.members.length >= project.teamSize;
          const isMember = project.members.some(
            (m) => m.studentId === currentUser?.id
          );

          return (
            <div
              key={project.id}
              className="rounded-xl bg-[#121217] p-5 border border-white/8 hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between shadow-sm hover:shadow-xl"
            >
              <div>
                {/* Category & Team Scale */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B] font-mono">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-[#71717A] font-mono-nums">
                    <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>
                      {project.members.length} / {project.teamSize} Scholars
                    </span>
                  </div>
                </div>

                <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2] mb-1.5 hover:text-[#E8D390] transition-colors">
                  {project.title}
                </h3>

                <p className="text-xs text-[#A1A1AA] line-clamp-3 mb-4 leading-relaxed">
                  {project.description}
                </p>

                {/* Compatibility for current student */}
                <div className="mb-4 p-3 rounded-lg bg-[#0D0D11] border border-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-mono text-[#71717A]">
                        Your Alignment
                      </div>
                      <div className="font-mono-nums font-bold text-xl text-[#FAF7F2]">
                        {matchResult.overallScore}%
                      </div>
                    </div>
                    <span className="text-xs text-[#E5C07B] font-serif-title">
                      {matchResult.matchLabel}
                    </span>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-2 mb-4">
                  <div className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                    Target Competencies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.skillBreakdown.map((sk) => (
                      <span
                        key={sk.name}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                          sk.status === "Covered"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                            : sk.status === "Weak"
                              ? "bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35"
                              : "bg-rose-950/80 text-rose-300 border border-rose-800/40"
                        }`}
                        title={`Requirement: ${sk.minProficiency}%, You: ${sk.studentProficiency}%`}
                      >
                        {sk.status === "Covered" && "✓"}
                        {sk.status === "Weak" && "⚠"}
                        {sk.status === "Missing" && "✕"}
                        <span>{sk.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/8 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectProject(project)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#181822] hover:bg-[#20202A] text-[#FAF7F2] border border-white/8 transition-colors"
                >
                  Examine Brief
                </button>

                {isMember ? (
                  <span className="text-xs text-emerald-400 font-medium">
                    Squad Member ✓
                  </span>
                ) : isFull ? (
                  <span className="text-xs text-[#71717A]">Quota Reached</span>
                ) : (
                  <button
                    onClick={() => onRequestJoin(project)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 hover:border-[#D4AF37]/65 transition-all"
                  >
                    Request Entry
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};