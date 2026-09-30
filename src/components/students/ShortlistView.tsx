import React from "react";
import { useApp } from "../../context/AppContext";
import { Student } from "../../types";
import { StudentCard } from "./StudentCard";
import { Bookmark } from "lucide-react";

export const ShortlistView: React.FC<{
  onOpenProfile: (student: Student) => void;
  onSendMessage: (student: Student) => void;
  onRequestTeam: (student: Student) => void;
}> = ({ onOpenProfile, onSendMessage, onRequestTeam }) => {
  const { shortlist, students, setActiveTab } = useApp();

  const savedStudents = students.filter((s) => shortlist.includes(s.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
          Bookmarked Scholars & Shortlist
        </h2>
        <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
          Curated portfolio of prospective teammates reserved for future
          hackathons and project proposals.
        </p>
      </div>

      {savedStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onOpenProfile={onOpenProfile}
              onSendMessage={onSendMessage}
              onRequestTeam={onRequestTeam}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-xl bg-[#121217] text-center border border-white/8 space-y-3">
          <Bookmark className="w-8 h-8 text-[#D4AF37] mx-auto opacity-75" />
          <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
            No scholars bookmarked in shortlist
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Select the bookmark marker on any scholar profile card in the
            Registry to curate them here.
          </p>
          <button
            onClick={() => setActiveTab("discover")}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/35 text-xs font-semibold"
          >
            Explore Registry
          </button>
        </div>
      )}
    </div>
  );
};
