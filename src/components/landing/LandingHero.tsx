import React from 'react';
import { TeamNetwork3D } from '../network/TeamNetwork3D';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

export const LandingHero: React.FC<{
  onFindTeam: () => void;
  onExploreProjects: () => void;
  onOpenProfile: (student: any) => void;
}> = ({ onFindTeam, onExploreProjects, onOpenProfile }) => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16161D] border border-white/[0.08]">
          <Sparkles className="w-3.5 h-3.5 text-[#E5C07B]" />
          <span className="text-xs font-medium text-[#FAF7F2]">
            Collegiate Teammate Matching & Complementary Synergy Platform
          </span>
        </div>

        <h1 className="font-serif-title text-5xl sm:text-7xl font-bold tracking-tight text-[#FAF7F2] leading-[1.08] text-balance">
          Assemble Extraordinary Teams.{' '}
          <span className="italic font-normal text-[#E8D390]">
            Together.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
          Discover college teammates who complement your competencies, research focus, specialization, and availability for hackathons, labs, and ventures.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onFindTeam}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#2B2317] via-[#3D321F] to-[#2B2317] text-[#FAF7F2] text-sm font-semibold border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 hover:scale-102 transition-all flex items-center gap-2 shadow-md"
          >
            <span>Discover Teammates</span>
            <ArrowRight className="w-4 h-4 text-[#E5C07B]" />
          </button>

          <button
            onClick={onExploreProjects}
            className="px-6 py-3 rounded-xl bg-[#14141A] hover:bg-[#1B1B22] text-[#FAF7F2] text-sm font-medium border border-white/[0.08] hover:border-white/[0.18] transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#C5A880]" />
            <span>Explore Projects</span>
          </button>
        </div>
      </div>

      {/* Hero Visual: Interactive 3D Celestial Orbit */}
      <div className="max-w-5xl mx-auto">
        <TeamNetwork3D onSelectStudent={onOpenProfile} height={460} />
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E5C07B] font-mono">
            Systematic Methodology
          </span>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-bold tracking-tight text-[#FAF7F2]">
            The Architecture of Team Formation
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA]">
            A deterministic algorithm calculating complementary coverage while preserving confidence transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-[#121217] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all space-y-3">
            <div className="text-xs font-mono font-bold text-[#E5C07B]">
              01
            </div>
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
              Calibrate Your Competencies
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Register verified technical proficiencies (0–100), primary role specializations, schedule windows, and research interests.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#121217] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all space-y-3">
            <div className="text-xs font-mono font-bold text-[#E5C07B]">
              02
            </div>
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
              Inspect Complementary Synergies
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Our 6-factor model identifies cross-disciplinary pairings (e.g. Backend Architecture + UI/UX Research) and redistributes missing data fairly.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#121217] border border-white/[0.08] hover:border-[#D4AF37]/30 transition-all space-y-3">
            <div className="text-xs font-mono font-bold text-[#E5C07B]">
              03
            </div>
            <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
              Assemble & Balance Your Squad
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Initiate project briefs, audit team skill gap matrices, dispatch invitations, and automatically formalize multidisciplinary teams.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
