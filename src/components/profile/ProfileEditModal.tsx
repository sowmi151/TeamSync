import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExperienceLevel, StudentSkill } from '../../types';
import { Plus, Trash2, X, Sparkles } from 'lucide-react';

export const ProfileEditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentUser, updateCurrentUserProfile } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [year, setYear] = useState(currentUser.year);
  const [bio, setBio] = useState(currentUser.bio);
  const [experience, setExperience] = useState<ExperienceLevel>(
    currentUser.experience || 'Intermediate'
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(
    currentUser.availability?.hoursPerWeek || 15
  );
  const [availabilityPrefs, setAvailabilityPrefs] = useState<string[]>(
    currentUser.availability?.preferences || ['Weekdays', 'Evenings']
  );
  const [roles, setRoles] = useState<string[]>(currentUser.roles || ['Full Stack Developer']);
  const [newRole, setNewRole] = useState('');

  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [newInterest, setNewInterest] = useState('');

  const [skills, setSkills] = useState<StudentSkill[]>(currentUser.skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProf, setNewSkillProf] = useState(80);
  const [newSkillCat, setNewSkillCat] = useState<StudentSkill['category']>('Backend');

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const exists = skills.find(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      setSkills(
        skills.map((s) =>
          s.name.toLowerCase() === newSkillName.trim().toLowerCase()
            ? { ...s, proficiency: newSkillProf, category: newSkillCat }
            : s
        )
      );
    } else {
      setSkills([
        ...skills,
        {
          name: newSkillName.trim(),
          proficiency: newSkillProf,
          category: newSkillCat
        }
      ]);
    }
    setNewSkillName('');
    setNewSkillProf(80);
  };

  const handleRemoveSkill = (nameToRemove: string) => {
    setSkills(skills.filter((s) => s.name !== nameToRemove));
  };

  const handleAddRole = () => {
    if (!newRole.trim()) return;
    if (!roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()]);
    }
    setNewRole('');
  };

  const handleRemoveRole = (r: string) => {
    setRoles(roles.filter((item) => item !== r));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (i: string) => {
    setInterests(interests.filter((item) => item !== i));
  };

  const toggleAvailabilityPref = (pref: string) => {
    setAvailabilityPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: name.trim(),
      department: department.trim(),
      year,
      bio: bio.trim(),
      experience,
      availability: {
        hoursPerWeek,
        preferences: availabilityPrefs
      },
      roles,
      interests,
      skills
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121217] border border-white/[0.12] shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E5C07B]" />
            <div>
              <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
                Calibrate Profile & Competencies
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Modifications instantly recalculate multi-factor compatibility across all scholars and project briefs.
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Full Scholar Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none focus:border-[#D4AF37]/40"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduate / Masters">Graduate / Masters</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
              Academic Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1 font-mono">
              Statement of Intent / Research Focus
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08] focus:outline-none"
            />
          </div>

          {/* Skill Management & Proficiency */}
          <div className="p-4 rounded-xl bg-[#0C0C10] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#E5C07B] uppercase tracking-widest font-mono">
                Competencies & Proficiencies (0 - 100)
              </label>
              <span className="text-[10px] text-[#71717A] font-mono">
                Section 11 Calibration
              </span>
            </div>

            <div className="space-y-2">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-3 rounded-lg bg-[#14141A] border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-2 w-32 truncate">
                    <span className="font-medium text-[#FAF7F2] truncate">{skill.name}</span>
                    <span className="text-[10px] text-[#71717A]">({skill.category})</span>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={skill.proficiency}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSkills(
                          skills.map((s) =>
                            s.name === skill.name ? { ...s, proficiency: val } : s
                          )
                        );
                      }}
                      className="flex-1 accent-[#D4AF37]"
                    />
                    <span className="font-mono-nums font-bold text-[#E5C07B] w-12 text-right">
                      {skill.proficiency}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.name)}
                    className="text-[#71717A] hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="Competency (e.g. PyTorch, Rust)"
                className="flex-1 min-w-[130px] px-3 py-1.5 rounded-lg bg-[#14141A] text-xs text-[#FAF7F2] border border-white/[0.08]"
              />
              <select
                value={newSkillCat}
                onChange={(e) => setNewSkillCat(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg bg-[#14141A] text-xs text-[#FAF7F2] border border-white/[0.08]"
              >
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="AI/ML">AI / ML</option>
                <option value="Design/UIUX">Design / UIUX</option>
                <option value="Cloud/DevOps">Cloud / DevOps</option>
                <option value="Data">Data</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
                <span>Index:</span>
                <input
                  type="number"
                  min={10}
                  max={100}
                  value={newSkillProf}
                  onChange={(e) => setNewSkillProf(Number(e.target.value))}
                  className="w-14 px-2 py-1 rounded-lg bg-[#14141A] text-xs font-mono-nums text-[#FAF7F2]"
                />
                <span>%</span>
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-lg bg-[#1E1E26] hover:bg-[#252532] text-xs font-medium text-[#FAF7F2] border border-white/[0.08] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5 text-[#E5C07B]" />
                <span>Add Competency</span>
              </button>
            </div>
          </div>

          {/* Roles & Experience & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
                Target Roles
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {roles.map((r) => (
                  <span
                    key={r}
                    className="px-2.5 py-1 rounded-lg bg-[#14141A] border border-white/[0.08] text-xs text-[#FAF7F2] flex items-center gap-1.5"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(r)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Systems Engineer"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08]"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="px-3 py-1.5 rounded-lg bg-[#1E1E26] text-xs font-medium text-[#FAF7F2] border border-white/[0.08]"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
                Seniority Tier
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#0C0C10] text-xs text-[#FAF7F2] border border-white/[0.08]"
              >
                <option value="Beginner">Beginner (Foundational coursework)</option>
                <option value="Intermediate">Intermediate (Practicum, hackathons)</option>
                <option value="Advanced">Advanced (Production systems, published)</option>
                <option value="Expert">Expert (Principal engineer, research lead)</option>
              </select>

              <div className="mt-4">
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
                  Weekly Commitment ({hoursPerWeek} hrs)
                </label>
                <input
                  type="range"
                  min={5}
                  max={35}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="w-full accent-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Schedule Preferences */}
          <div>
            <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-widest mb-1.5 font-mono">
              Availability Days
            </label>
            <div className="flex flex-wrap gap-2">
              {['Weekdays', 'Evenings', 'Weekends', 'Late Nights', 'Flexible'].map((pref) => {
                const isSelected = availabilityPrefs.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleAvailabilityPref(pref)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/35 shadow-sm'
                        : 'bg-[#14141A] text-[#71717A] border border-white/[0.06]'
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14141A] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.08]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 transition-all shadow-sm"
            >
              Commit Calibration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
