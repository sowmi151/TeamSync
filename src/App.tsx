import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isOAuthReturn, supabase } from "./lib/supabase";
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
import { ConfirmProfileView } from "./components/auth/ConfirmProfileView";
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
    setCurrentUser,
  } = useApp();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signedInThisVisit, setSignedInThisVisit] = useState(isOAuthReturn);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    const applySession = (session: Session | null) => {
      if (!active) return;
      setNeedsConfirmation(Boolean(session &&
        session.user.app_metadata.provider === "google" &&
        session.user.user_metadata.teamsync_profile_confirmed !== true));
      if (session) {
        const user = session.user;
        const email = user.email || "";
        setCurrentUser((previous) => ({
          ...(previous.id === user.id ? previous : {
            id: user.id, name: "", email: "", department: "", year: "",
            bio: "", skills: [], interests: [], roles: [], experience: null,
            availability: null, projects: [], achievements: [],
          }),
          id: user.id,
          email,
          name: user.user_metadata.full_name || user.user_metadata.name ||
            user.user_metadata.user_name || email.split("@")[0] || "Scholar",
          avatarUrl: user.user_metadata.avatar_url || "",
        }));
      }
      setIsAuthenticated(Boolean(session) && signedInThisVisit);
      setCheckingSession(false);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      applySession(session);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authEventReceived) return;
      if (error) setAuthError(error.message);
      applySession(data.session);
    }).catch((error: Error) => {
      if (!active || authEventReceived) return;
      setAuthError(error.message);
      applySession(null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [setCurrentUser, signedInThisVisit]);

  const handleLogout = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) setAuthError(error.message);
    else {
      setSignedInThisVisit(false);
      setIsAuthenticated(false);
    }
  };
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

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-white">Checking your session...</div>;
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={() => setSignedInThisVisit(true)}
      />
    );
  }

  if (needsConfirmation) {
    return <ConfirmProfileView name={currentUser.name} email={currentUser.email}
      onComplete={(name) => {
        setCurrentUser((previous) => ({ ...previous, name }));
        setNeedsConfirmation(false);
        setActiveTab("dashboard");
      }} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen text-[#FAF7F2] flex flex-col font-sans selection:bg-[#00FFFF]/30 selection:text-white">
      <Header
        onLogout={handleLogout}
        onOpenDownloadZip={() => setShowDownloadZip(true)}
        onOpenCreateProject={() => setShowCreateProject(true)}
        onOpenDatabaseModal={() => setShowDatabaseModal(true)}
        onOpenPythonModal={() => setShowPythonModal(true)}
      />

      {authError && <div role="alert" className="p-4 text-red-400">{authError}</div>}

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
      <section className="border-t border-white/10 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              👥 TeamSync — Meet the Creators
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sowmiya",
                role: "UI/UX Designer",
                linkedin: "https://www.linkedin.com/in/sowmiya-a-work/",
                github: "https://github.com/sowmi151",
                email: "sowmi2378ak@gmail.com",
              },
              {
                name: "Yogasree",
                role: "Frontend Developer",
                linkedin:
                  "https://www.linkedin.com/in/yogasree-kumaran-633708440/",
                github: "https://github.com/proton2006",
                email: "yogasreegk@gmail.com",
              },
              {
                name: "Mokshitha",
                role: "Backend Developer",
                linkedin: "https://www.linkedin.com/in/mokshitha-k-m-0786a9337",
                github: "https://github.com/mokshakm3",
                email: "mokshakm3@gmail.com",
              },
            ].map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-lg font-semibold text-white">
                  {member.name}
                </h3>

                <p className="text-sm text-cyan-400 mt-1">{member.role}</p>

                <div className="mt-4 flex flex-col gap-2 text-sm text-[#A1A1AA]">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    🔗 LinkedIn
                  </a>

                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    💻 GitHub
                  </a>

                  <a
                    href={`mailto:${member.email}`}
                    className="hover:text-white"
                  >
                    ✉️ Email
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              💬 Feedback & Queries
            </h2>

            <div className="max-w-2xl rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm text-[#A1A1AA] mb-5">
                Share your feedback or suggestions…
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name (optional)"
                  className="w-full rounded-lg bg-[#0B1020] border border-white/10 px-4 py-3 text-white outline-none"
                />

                <input
                  type="email"
                  placeholder="Email (optional)"
                  className="w-full rounded-lg bg-[#0B1020] border border-white/10 px-4 py-3 text-white outline-none"
                />

                <textarea
                  placeholder="Feedback / Query"
                  rows={5}
                  className="w-full rounded-lg bg-[#0B1020] border border-white/10 px-4 py-3 text-white outline-none resize-none"
                />

                <button className="px-5 py-3 rounded-lg bg-linear-to-r from-purple-500 to-cyan-500 text-white font-semibold">
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>

          <footer className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
            <div>© 2026 TeamSync • Built with ❤️ by TeamSync</div>

            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white">
                LinkedIn
              </a>

              <a href="#" className="hover:text-white">
                GitHub
              </a>

              <a href="mailto:example@email.com" className="hover:text-white">
                Email
              </a>
            </div>
          </footer>
        </div>
      </section>
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
