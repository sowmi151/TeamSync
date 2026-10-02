import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/common/Header";
import { DashboardView } from "./components/dashboard/DashboardView";
import { DiscoverView } from "./components/students/DiscoverView";
import { CompareView } from "./components/students/CompareView";
import { ProjectDiscoveryView } from "./components/projects/ProjectDiscoveryView";
import { BuildTeamView } from "./components/projects/BuildTeamView";
import { TeamDashboardView } from "./components/team/TeamDashboardView";
import { RequestsView } from "./components/requests/RequestsView";
import { MessagingView } from "./components/messages/MessagingView";
import { ShortlistView } from "./components/students/ShortlistView";
import { AlgorithmTestSuite } from "./components/testing/AlgorithmTestSuite";
import { StudentProfileModal } from "./components/students/StudentProfileModal";
import { ProjectDetailsModal } from "./components/projects/ProjectDetailsModal";
import { CreateProjectModal } from "./components/projects/CreateProjectModal";
import { SendTeamRequestModal } from "./components/requests/SendTeamRequestModal";
import { ProfileEditModal } from "./components/profile/ProfileEditModal";
import { DownloadZipModal } from "./components/export/DownloadZipModal";
import { DatabaseModal } from "./components/database/DatabaseModal";
import { PythonModal } from "./components/python/PythonModal";
import { LoginView } from "./components/auth/LoginView";
import { Student } from "./types";
import { Code, Database, Download, RotateCcw, LogOut } from "lucide-react";

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedStudentForModal,
    setSelectedStudentForModal,
    selectedProjectForModal,
    setSelectedProjectForModal,
    currentUser,
    resetDemoData,
    updateCurrentUserProfile,
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDownloadZip, setShowDownloadZip] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showPythonModal, setShowPythonModal] = useState(false);
  const [requestTargetStudent, setRequestTargetStudent] =
    useState<Student | null>(null);
  const [messagingTargetStudent, setMessagingTargetStudent] =
    useState<Student | null>(null);

  const handleOpenMessage = (student: Student) => {
    setMessagingTargetStudent(student);
    setActiveTab("messages");
  };

  const handleOpenRequest = (student: Student) => {
    setRequestTargetStudent(student);
  };

  // --- THE MAGIC FIX IS HERE ---
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={(newName, newEmail) => {
          setIsAuthenticated(true);

          // 1. If no name was typed (Log In mode), generate one from the email prefix
          let finalName = newName;
          if (!finalName && newEmail && newEmail !== currentUser.email) {
            finalName = newEmail.split("@")[0]; // e.g. "akshyalux2619"
          }

          if (finalName || newEmail) {
            updateCurrentUserProfile({
              name: finalName || currentUser.name,
              email: newEmail || currentUser.email,
              avatarUrl: "", // 2. Clear Rahul's photo so your initials (AL) take over!
            });
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen text-[#FAF7F2] flex flex-col font-sans selection:bg-[#00FFFF]/30 selection:text-white">
      <Header
        onLogout={() => setIsAuthenticated(false)}
        onOpenDownloadZip={() => setShowDownloadZip(true)}
        onOpenCreateProject={() => setShowCreateProject(true)}
        onOpenDatabaseModal={() => setShowDatabaseModal(true)}
        onOpenPythonModal={() => setShowPythonModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "dashboard" && (
          <DashboardView
            onOpenProfile={(s) => setSelectedStudentForModal(s)}
            onSendMessage={handleOpenMessage}
            onRequestTeam={handleOpenRequest}
            onOpenCreateProject={() => setShowCreateProject(true)}
          />
        )}
        {activeTab === "discover" && (
          <DiscoverView
            onOpenProfile={(s) => setSelectedStudentForModal(s)}
            onSendMessage={handleOpenMessage}
            onRequestTeam={handleOpenRequest}
          />
        )}
        {activeTab === "compare" && (
          <CompareView
            onOpenMessage={handleOpenMessage}
            onOpenRequest={handleOpenRequest}
          />
        )}
        {activeTab === "projects" && (
          <ProjectDiscoveryView
            onOpenCreateProject={() => setShowCreateProject(true)}
            onSelectProject={(p) => setSelectedProjectForModal(p)}
            onRequestJoin={(p) => {
              const creator = {
                id: p.creatorId,
                name: "Project Leader",
              } as Student;
              handleOpenRequest(creator);
            }}
          />
        )}
        {activeTab === "build-team" && (
          <BuildTeamView
            onOpenCreateProject={() => setShowCreateProject(true)}
            onOpenProfile={(s) => setSelectedStudentForModal(s)}
          />
        )}
        {activeTab === "my-team" && (
          <TeamDashboardView
            onOpenProfile={(s) => setSelectedStudentForModal(s)}
            onOpenMessage={handleOpenMessage}
            onOpenCreateProject={() => setShowCreateProject(true)}
          />
        )}
        {activeTab === "requests" && (
          <RequestsView onOpenProfile={(s) => setSelectedStudentForModal(s)} />
        )}
        {activeTab === "messages" && (
          <MessagingView initialSelectedStudent={messagingTargetStudent} />
        )}
        {activeTab === "shortlist" && (
          <ShortlistView
            onOpenProfile={(s) => setSelectedStudentForModal(s)}
            onSendMessage={handleOpenMessage}
            onRequestTeam={handleOpenRequest}
          />
        )}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-title font-bold text-3xl text-[#FAF7F2]">
                Scholar Curriculum & Profile
              </h2>
              <button
                onClick={() => setShowEditProfile(true)}
                className="px-4 py-2 rounded-lg bg-linear-to-r from-[#2B2317] to-[#3D321F] text-[#FAF7F2] border border-[#D4AF37]/40 hover:border-[#D4AF37]/75 text-xs font-semibold shadow-sm transition-all"
              >
                Calibrate Profile & Skills
              </button>
            </div>
            <div className="p-6 rounded-xl bg-[#121217] border border-white/8 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-[#1C1812] border border-[#D4AF37]/30 flex items-center justify-center font-serif-title font-bold text-2xl text-[#E5C07B]">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif-title font-bold text-xl text-[#FAF7F2]">
                    {currentUser.name}
                  </h3>
                  <div className="text-xs text-[#A1A1AA]">
                    {currentUser.department} • {currentUser.year}
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#E8E4DD] leading-relaxed mb-5">
                {currentUser.bio}
              </p>
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest font-mono">
                  Calibrated Competencies
                </h4>
                {currentUser.skills.map((s) => (
                  <div key={s.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#FAF7F2] font-medium">
                        {s.name}
                      </span>
                      <span className="font-mono-nums text-[#C5A880]">
                        {s.proficiency}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A1A22] overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#967246] via-[#B8860B] to-[#E5C07B]"
                        style={{ width: `${s.proficiency}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeTab === "test-suite" && <AlgorithmTestSuite />}
      </main>

      <footer className="mt-16 border-t border-white/8 bg-[#0A0A0D]/50 py-8 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif-title font-bold text-sm tracking-tight text-[#FAF7F2]">
              TeamSync
            </span>
            <span>•</span>
            <span>Collegiate Intelligent Team Matching System</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 pt-4 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-[#71717A]">
          <div>
            Collegiate Functional Platform • Deterministic Multi-Factor
            Algorithmic Matching
          </div>
          <div>Designed with Galaxy Glassmorphism UI</div>
        </div>
      </footer>

      {selectedStudentForModal && (
        <StudentProfileModal
          student={selectedStudentForModal}
          onClose={() => setSelectedStudentForModal(null)}
          onOpenMessage={handleOpenMessage}
          onOpenRequest={handleOpenRequest}
          onEditProfile={() => {
            setSelectedStudentForModal(null);
            setShowEditProfile(true);
          }}
        />
      )}
      {selectedProjectForModal && (
        <ProjectDetailsModal
          project={selectedProjectForModal}
          onClose={() => setSelectedProjectForModal(null)}
          onRequestJoin={(p) => {
            setSelectedProjectForModal(null);
            const creator = {
              id: p.creatorId,
              name: "Project Leader",
            } as Student;
            handleOpenRequest(creator);
          }}
          onOpenProfile={(s) => setSelectedStudentForModal(s)}
        />
      )}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreated={(p) => {
            setSelectedProjectForModal(p);
          }}
        />
      )}
      {showEditProfile && (
        <ProfileEditModal onClose={() => setShowEditProfile(false)} />
      )}
      {showDownloadZip && (
        <DownloadZipModal onClose={() => setShowDownloadZip(false)} />
      )}
      {showDatabaseModal && (
        <DatabaseModal
          onClose={() => setShowDatabaseModal(false)}
          onOpenDownloadZip={() => {
            setShowDatabaseModal(false);
            setShowDownloadZip(true);
          }}
        />
      )}
      {showPythonModal && (
        <PythonModal
          onClose={() => setShowPythonModal(false)}
          onOpenDownloadZip={() => {
            setShowPythonModal(false);
            setShowDownloadZip(true);
          }}
        />
      )}
      {requestTargetStudent && (
        <SendTeamRequestModal
          targetStudent={requestTargetStudent}
          onClose={() => setRequestTargetStudent(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
