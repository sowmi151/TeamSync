import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { calculateStudentMatch } from '../../utils/matching/studentMatching';
import { StudentCard } from './StudentCard';
import { Filter, RotateCcw, Search, Sparkles } from 'lucide-react';

interface DiscoverViewProps {
  onOpenProfile: (student: Student) => void;
  onSendMessage: (student: Student) => void;
  onRequestTeam: (student: Student) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  onOpenProfile,
  onSendMessage,
  onRequestTeam
}) => {
  const { students, currentUser, filterSkillQuery, setFilterSkillQuery } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedExp, setSelectedExp] = useState('all');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const departments = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.department).filter(Boolean)));
  }, [students]);

  const roles = useMemo(() => {
    return Array.from(new Set(students.flatMap((s) => s.roles || []).filter(Boolean)));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => s.id !== currentUser.id)
      .map((student) => {
        const matchResult = calculateStudentMatch(currentUser, student);
        return {
          student,
          matchResult
        };
      })
      .filter(({ student, matchResult }) => {
        if (matchResult.overallScore < minMatchScore) return false;

        if (filterSkillQuery.trim()) {
          const targetSkill = filterSkillQuery.toLowerCase();
          const hasSkill = (student.skills || []).some((sk) =>
            sk.name.toLowerCase().includes(targetSkill)
          );
          if (!hasSkill) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = student.name.toLowerCase().includes(q);
          const matchDept = student.department.toLowerCase().includes(q);
          const matchBio = student.bio.toLowerCase().includes(q);
          const matchSkills = (student.skills || []).some((sk) =>
            sk.name.toLowerCase().includes(q)
          );
          const matchRole = (student.roles || []).some((r) => r.toLowerCase().includes(q));
          if (!matchName && !matchDept && !matchBio && !matchSkills && !matchRole) return false;
        }

        if (selectedDept !== 'all' && student.department !== selectedDept) return false;
        if (selectedYear !== 'all' && student.year !== selectedYear) return false;
        if (selectedRole !== 'all' && !(student.roles || []).includes(selectedRole)) return false;
        if (selectedExp !== 'all' && student.experience !== selectedExp) return false;

        return true;
      })
      .sort((a, b) => b.matchResult.overallScore - a.matchResult.overallScore);
  }, [
    students,
    currentUser,
    searchQuery,
    selectedDept,
    selectedYear,
    selectedRole,
    selectedExp,
    minMatchScore,
    filterSkillQuery
  ]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedYear('all');
    setSelectedRole('all');
    setSelectedExp('all');
    setMinMatchScore(0);
    setFilterSkillQuery('');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedDept !== 'all' ||
    selectedYear !== 'all' ||
    selectedRole !== 'all' ||
    selectedExp !== 'all' ||
    minMatchScore > 0 ||
    filterSkillQuery !== '';

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-title font-bold text-2xl sm:text-3xl tracking-tight text-[#FAF7F2]">
            Cohort Registry & Teammate Discovery
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-0.5">
            Scholars indexed by complementary synergy, shared domains, and verified schedule availability.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {filterSkillQuery && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30 text-xs font-medium">
              <span>Target Competency: {filterSkillQuery}</span>
              <button
                onClick={() => setFilterSkillQuery('')}
                className="hover:text-white ml-1"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              showFilters || hasActiveFilters
                ? 'bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35 shadow-sm'
                : 'bg-[#14141A] hover:bg-[#1B1B22] text-[#FAF7F2] border border-white/[0.08]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Parameters {hasActiveFilters ? '(Active)' : ''}</span>
          </button>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="p-4 rounded-xl bg-[#121217] border border-white/[0.08] space-y-3 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholars by name, skills (e.g. Python, UI/UX, PyTorch), department, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#0C0C10] text-xs sm:text-sm text-[#FAF7F2] border border-white/[0.08] focus:outline-none focus:border-[#D4AF37]/40"
          />
        </div>

        {/* Collapsible Extended Filters */}
        {showFilters && (
          <div className="pt-3 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
              >
                <option value="all">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Specialization
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
              >
                <option value="all">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Seniority
              </label>
              <select
                value={selectedExp}
                onChange={(e) => setSelectedExp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
              >
                <option value="all">Any Seniority</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Min Match ({minMatchScore}%)
              </label>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(Number(e.target.value))}
                className="w-full accent-[#D4AF37] mt-1"
              />
            </div>
          </div>
        )}

        {hasActiveFilters && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetAllFilters}
              className="text-xs text-[#E5C07B] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Filter Parameters</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Count & Student Cards Grid */}
      <div className="flex items-center justify-between text-xs text-[#71717A] px-1 font-mono">
        <span>Displaying {filteredStudents.length} candidate teammates</span>
        <span>Sorted by Deterministic Yield</span>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map(({ student }) => (
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
        <div className="p-12 rounded-xl bg-[#121217] text-center border border-white/[0.08] space-y-3">
          <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto opacity-75" />
          <h3 className="font-serif-title font-bold text-lg text-[#FAF7F2]">
            No matching scholars found
          </h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Try adjusting filter bounds or searching for complementary cross-disciplinary competencies.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 rounded-lg bg-[#181822] text-xs font-medium text-[#FAF7F2] border border-white/[0.08]"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
