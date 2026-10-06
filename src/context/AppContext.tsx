/**
 * TeamSync Main Application State & Context
 * Handles Supabase cloud synchronization, real-time listeners, LocalStorage caching,
 * automated team formation, and browser history routing.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "../lib/supabase";
import { validateMedia } from "../lib/chatMedia";
import {
  Student,
  Project,
  TeamRequest,
  Message,
  NotificationItem,
} from "../types";
import {
  SEED_STUDENTS,
  SEED_PROJECTS,
  SEED_REQUESTS,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
} from "../data/seedData";

export type NavigationTab =
  | "dashboard"
  | "discover"
  | "compare"
  | "projects"
  | "build-team"
  | "my-team"
  | "messages"
  | "requests"
  | "shortlist"
  | "profile"
  | "test-suite";

interface AppContextType {
  currentUser: Student;
  setCurrentUser: React.Dispatch<React.SetStateAction<Student>>;
  students: Student[];
  projects: Project[];
  requests: TeamRequest[];
  messages: Message[];
  shortlist: string[];
  notifications: NotificationItem[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedStudentForModal: Student | null;
  setSelectedStudentForModal: (student: Student | null) => void;
  selectedProjectForModal: Project | null;
  setSelectedProjectForModal: (project: Project | null) => void;
  comparisonList: Student[];
  addToComparison: (student: Student) => void;
  removeFromComparison: (studentId: string) => void;
  clearComparison: () => void;
  toggleShortlist: (studentId: string) => void;
  isShortlisted: (studentId: string) => boolean;
  updateCurrentUserProfile: (updated: Partial<Student>) => void;
  addSkillToCurrentUser: (skill: {
    name: string;
    proficiency: number;
    category: any;
  }) => void;
  removeSkillFromCurrentUser: (skillName: string) => void;
  updateSkillProficiency: (skillName: string, proficiency: number) => void;
  sendTeamRequest: (
    receiverId: string,
    projectId: string,
    message: string,
  ) => void;
  respondToRequest: (requestId: string, action: "accept" | "reject") => void;
  createProject: (
    newProject: Omit<Project, "id" | "createdAt" | "members">,
  ) => Project;
  sendMessage: (
    receiverId: string,
    content: string,
    projectId?: string,
    attachment?: File,
  ) => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  filterSkillQuery: string;
  setFilterSkillQuery: (skill: string) => void;
  resetDemoData: () => void;
  switchDemoUser: (studentId: string) => void;
}

const STORAGE_KEY = "teamsync_v1_data";

// A fresh browser has no cached profile; sample data may intentionally be empty.
const EMPTY_USER: Student = {
  id: "", name: "Scholar", email: "", department: "", year: "",
  bio: "", skills: [], interests: [], roles: [], experience: null,
  availability: null, projects: [], achievements: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<Student>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile && typeof profile === "object" && typeof profile.id === "string") {
          return { ...EMPTY_USER, ...profile };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return SEED_STUDENTS[0] || { ...EMPTY_USER };
  });

  const currentUserRef = useRef<Student>(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_STUDENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      if (saved && JSON.parse(saved).length > 0) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_PROJECTS;
  });

  const [requests, setRequests] = useState<TeamRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_REQUESTS;
  });

  const [messages, setMessages] = useState<Message[]>([]);

  const [shortlist, setShortlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_shortlist`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ["student-ananya"];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_NOTIFICATIONS;
  });

  // ==========================================
  // SUPABASE REAL-TIME CLOUD DATA SYNC
  // ==========================================
  const syncWithSupabase = useCallback(async () => {
    try {
      // 1. Fetch live students with relations
      const { data: dbStudents, error: studentError } = await supabase
        .from("students")
        .select("*, student_skills(*), student_roles(*)");

      if (!studentError && dbStudents) {
        const cloudStudents: Student[] = dbStudents.map((cs: any) => {
          const avatarGenerated =
            cs.avatar_url ||
            cs.avatar ||
            cs.github_url ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
              cs.full_name || cs.id,
            )}`;

          const skillsList =
            cs.student_skills && cs.student_skills.length > 0
              ? cs.student_skills.map((s: any) => ({
                  name: s.skill_name || "Skill",
                  proficiency: s.proficiency_score || 80,
                  category: s.category || "Technical",
                }))
              : [
                  { name: "Full Stack Development", proficiency: 85, category: "Frontend" },
                  { name: "PostgreSQL", proficiency: 80, category: "Backend" },
                  { name: "UI/UX Architecture", proficiency: 75, category: "Design" },
                ];

          const rolesList =
            cs.student_roles && cs.student_roles.length > 0
              ? cs.student_roles.map((r: any) => r.role_name)
              : ["Full Stack Engineer", "Team Contributor"];

          const studentObj: any = {
            id: String(cs.id),
            name: cs.full_name || "Scholar",
            email: cs.email || "",
            avatar: avatarGenerated,
            avatarUrl: avatarGenerated,
            university: cs.department || "Computer Science Institute",
            department: cs.department || "Computer Science",
            year: cs.academic_year || "1st Year",
            gpa: Number(cs.gpa) || 3.85,
            skills: skillsList,
            roles: rolesList,
            interests: ["Collaborative AI", "Web Systems", "Cloud Architecture"],
            bio: cs.bio || "Passionate scholar focused on innovative collaborative projects.",
            availability: {
              hoursPerWeek: cs.hours_per_week || 15,
              preferences: ["remote", "flexible"],
            },
            githubUrl: cs.github_url || "",
            linkedinUrl: cs.linkedin_url || "",
          };

          return studentObj as Student;
        });

        setStudents((prev) => {
          const combined = [...cloudStudents];
          const cloudIds = new Set(cloudStudents.map((s) => s.id));
          const cloudEmails = new Set(
            cloudStudents.map((s) => (s.email || "").toLowerCase()),
          );

          SEED_STUDENTS.forEach((seed) => {
            if (!cloudIds.has(seed.id) && !cloudEmails.has((seed.email || "").toLowerCase())) {
              combined.push(seed);
            }
          });

          return combined;
        });

        const activeEmail = currentUserRef.current.email;
        if (activeEmail) {
          const matchedProfile = cloudStudents.find(
            (s) => s.email?.toLowerCase() === activeEmail.toLowerCase(),
          );
          if (matchedProfile) {
            setCurrentUser((prev) => ({ ...prev, ...matchedProfile }));
          }
        }
      }

      // 2. Fetch live projects
      const { data: dbProjects, error: projError } = await supabase
        .from("projects")
        .select("*");

      if (!projError && dbProjects && dbProjects.length > 0) {
        const formattedProjects: Project[] = dbProjects.map((p: any) => {
          const projectObj: any = {
            id: String(p.id),
            title: p.title,
            description: p.description || "Active collaborative team project.",
            category: p.category || "Web App",
            creatorId: String(p.creator_id || currentUserRef.current.id),
            createdAt: p.created_at ? p.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            members: [
              {
                studentId: String(p.creator_id || currentUserRef.current.id),
                role: "Team Lead",
                joinedAt: new Date().toISOString().split("T")[0],
              },
            ],
            teamSize: p.team_size || 4,
            requiredSkills: Array.isArray(p.required_skills) ? p.required_skills : ["React", "TypeScript"],
            requiredRoles: Array.isArray(p.required_roles) ? p.required_roles : ["Developer", "Designer"],
            status: (p.status as any) || "open",
          };
          return projectObj as Project;
        });

        setProjects((prev) => {
          const projIds = new Set(formattedProjects.map((p) => p.id));
          const merged = [...formattedProjects];
          SEED_PROJECTS.forEach((sp) => {
            if (!projIds.has(sp.id)) merged.push(sp);
          });
          return merged;
        });
      }

      // 3. Fetch live team requests
      const { data: dbRequests, error: reqError } = await supabase
        .from("team_requests")
        .select("*");

      if (!reqError && dbRequests) {
        const formattedRequests: TeamRequest[] = dbRequests.map((r: any) => ({
          id: String(r.id),
          senderId: String(r.sender_id),
          receiverId: String(r.receiver_id),
          projectId: String(r.project_id),
          message: r.message || "",
          status: r.status || "pending",
          createdAt: r.created_at || new Date().toISOString(),
        }));

        setRequests((prev) => {
          const reqIds = new Set(formattedRequests.map((r) => r.id));
          const merged = [...formattedRequests];
          prev.forEach((pr) => {
            if (!reqIds.has(pr.id)) merged.push(pr);
          });
          return merged;
        });
      }
    } catch (err) {
      console.warn("Supabase background sync notice:", err);
    }
  }, []);

  // Initial Sync on load
  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Persistent Realtime Listener
  useEffect(() => {
    const channel = supabase
      .channel("teamsync-global-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "team_requests" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const raw = payload.new;
            const incoming: TeamRequest = {
              id: String(raw.id),
              senderId: String(raw.sender_id),
              receiverId: String(raw.receiver_id),
              projectId: String(raw.project_id),
              message: raw.message || "",
              status: raw.status || "pending",
              createdAt: raw.created_at || new Date().toISOString(),
            };

            setRequests((prev) => {
              if (prev.some((r) => r.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });

            const activeId = String(currentUserRef.current.id);
            if (incoming.receiverId === activeId) {
              const newNotif: NotificationItem = {
                id: `notif-rec-${Date.now()}`,
                type: "team_request",
                title: "New Team Invitation",
                description: `You have received an invitation to join a squad.`,
                timestamp: new Date().toISOString(),
                isRead: false,
                linkTab: "requests",
              };
              setNotifications((prev) => [newNotif, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === String(payload.new.id)
                  ? { ...r, status: payload.new.status }
                  : r,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setRequests((prev) =>
              prev.filter((r) => r.id !== String(payload.old.id)),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          syncWithSupabase();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => {
          syncWithSupabase();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [syncWithSupabase]);

  // ==========================================
  // BROWSER HISTORY ROUTING LOGIC
  // ==========================================
  const getInitialTab = (): NavigationTab => {
    const hash = window.location.hash.replace("#", "");
    const validTabs: NavigationTab[] = [
      "dashboard",
      "discover",
      "compare",
      "projects",
      "build-team",
      "my-team",
      "messages",
      "requests",
      "shortlist",
      "profile",
      "test-suite",
    ];
    return validTabs.includes(hash as NavigationTab)
      ? (hash as NavigationTab)
      : "dashboard";
  };

  const [activeTab, setActiveTabState] = useState<NavigationTab>(getInitialTab);

  const setActiveTab = (tab: NavigationTab) => {
    if (activeTab !== tab) {
      window.location.hash = tab;
      setActiveTabState(tab);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      const validTabs: NavigationTab[] = [
        "dashboard",
        "discover",
        "compare",
        "projects",
        "build-team",
        "my-team",
        "messages",
        "requests",
        "shortlist",
        "profile",
        "test-suite",
      ];
      setActiveTabState(
        validTabs.includes(hash as NavigationTab)
          ? (hash as NavigationTab)
          : "dashboard",
      );
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  const [selectedStudentForModal, setSelectedStudentForModal] =
    useState<Student | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] =
    useState<Project | null>(null);
  const [comparisonList, setComparisonList] = useState<Student[]>([]);
  const [filterSkillQuery, setFilterSkillQuery] = useState<string>("");

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_projects`, JSON.stringify(projects));
      localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(requests));
      localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
      localStorage.setItem(
        `${STORAGE_KEY}_shortlist`,
        JSON.stringify(shortlist),
      );
      localStorage.setItem(
        `${STORAGE_KEY}_notifications`,
        JSON.stringify(notifications),
      );
    } catch (e) {
      console.error("LocalStorage write error:", e);
    }
  }, [
    currentUser,
    students,
    projects,
    requests,
    messages,
    shortlist,
    notifications,
  ]);

  const updateCurrentUserProfile = async (updated: Partial<Student>) => {
    const next = { ...currentUser, ...updated };
    setCurrentUser(next);
    setStudents((all) => all.map((s) => (s.id === next.id ? next : s)));

    const hours =
      (updated as any)?.hoursPerWeek ??
      updated.availability?.hoursPerWeek ??
      currentUser.availability?.hoursPerWeek;

    try {
      await supabase
        .from("students")
        .update({
          full_name: next.name,
          bio: next.bio,
          department: next.department,
          academic_year: next.year,
          github_url: next.githubUrl,
          linkedin_url: next.linkedinUrl,
          hours_per_week: hours,
        })
        .eq("email", next.email);
    } catch (e) {
      console.warn("Cloud update synced locally:", e);
    }
  };

  const addSkillToCurrentUser = (skill: {
    name: string;
    proficiency: number;
    category: any;
  }) => {
    const existing = (currentUser.skills || []).find(
      (s) => s.name.toLowerCase() === skill.name.toLowerCase(),
    );
    const nextSkills = existing
      ? currentUser.skills.map((s) =>
          s.name.toLowerCase() === skill.name.toLowerCase() ? skill : s,
        )
      : [...(currentUser.skills || []), skill];

    updateCurrentUserProfile({ skills: nextSkills });
  };

  const removeSkillFromCurrentUser = (skillName: string) => {
    const nextSkills = (currentUser.skills || []).filter(
      (s) => s.name.toLowerCase() !== skillName.toLowerCase(),
    );
    updateCurrentUserProfile({ skills: nextSkills });
  };

  const updateSkillProficiency = (skillName: string, proficiency: number) => {
    const nextSkills = (currentUser.skills || []).map((s) =>
      s.name.toLowerCase() === skillName.toLowerCase()
        ? { ...s, proficiency: Math.min(100, Math.max(0, proficiency)) }
        : s,
    );
    updateCurrentUserProfile({ skills: nextSkills });
  };

  const toggleShortlist = (studentId: string) => {
    setShortlist((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const isShortlisted = (studentId: string) => shortlist.includes(studentId);

  const addToComparison = (student: Student) => {
    if (!student?.id) return;
    setComparisonList((prev) => {
      const valid = prev.filter((candidate) => candidate?.id);
      if (valid.length >= 4 || valid.some((candidate) => String(candidate.id) === String(student.id))) return valid;
      return [...valid, student];
    });
  };

  const removeFromComparison = (studentId: string) => {
    setComparisonList((prev) => prev.filter((s) => s?.id && String(s.id) !== String(studentId)));
  };

  const clearComparison = () => setComparisonList([]);

  const sendTeamRequest = async (
    receiverId: string,
    projectId: string,
    message: string,
  ) => {
    const targetProject = projects.find((p) => String(p.id) === String(projectId));
    const receiver = students.find((s) => String(s.id) === String(receiverId));

    const newReq: TeamRequest = {
      id: `req-${Date.now()}`,
      senderId: String(currentUser.id),
      receiverId: String(receiverId),
      projectId: String(projectId),
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);

    try {
      await supabase.from("team_requests").insert([
        {
          id: newReq.id,
          sender_id: newReq.senderId,
          receiver_id: newReq.receiverId,
          project_id: newReq.projectId,
          message: newReq.message,
          status: "pending",
        },
      ]);
    } catch (e) {
      console.warn("Cloud request saved locally:", e);
    }

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: "team_request",
      title: "Team Request Sent",
      description: `Sent invitation to ${receiver ? receiver.name : "student"} for "${targetProject ? targetProject.title : "Project"}".`,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkTab: "requests",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const respondToRequest = async (requestId: string, action: "accept" | "reject") => {
    const req = requests.find((r) => String(r.id) === String(requestId));
    if (!req) return;

    const applicant =
      students.find((s) => String(s.id) === String(req.senderId)) ||
      students.find((s) => String(s.id) === String(req.receiverId));
    const targetProject = projects.find((p) => String(p.id) === String(req.projectId));

    const newStatus: "accepted" | "rejected" =
      action === "accept" ? "accepted" : "rejected";

    setRequests((prev) =>
      prev.map((r) => (String(r.id) === String(requestId) ? { ...r, status: newStatus } : r)),
    );

    try {
      await supabase
        .from("team_requests")
        .update({ status: newStatus })
        .eq("id", requestId);
    } catch (e) {
      console.warn("Could not update request in cloud:", e);
    }

    if (action === "accept" && targetProject && applicant) {
      const alreadyMember = targetProject.members.some(
        (m) => String(m.studentId) === String(applicant.id),
      );
      if (!alreadyMember) {
        const applicantRole = applicant.roles?.[0] || "Team Contributor";
        const updatedMembers = [
          ...targetProject.members,
          {
            studentId: applicant.id,
            role: applicantRole,
            joinedAt: new Date().toISOString().split("T")[0],
          },
        ];

        const isFull = updatedMembers.length >= targetProject.teamSize;
        setProjects((all) =>
          all.map((p) =>
            String(p.id) === String(targetProject.id)
              ? {
                  ...p,
                  members: updatedMembers,
                  status: isFull ? "in_progress" : p.status,
                }
              : p,
          ),
        );

        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          type: "request_accepted",
          title: "Team Request Accepted! 🎉",
          description: `${applicant.name} has officially joined "${targetProject.title}" as ${applicantRole}. Team is now ${updatedMembers.length}/${targetProject.teamSize} members.`,
          timestamp: new Date().toISOString(),
          isRead: false,
          linkTab: "my-team",
        };
        setNotifications((prev) => [notif, ...prev]);

        const welcomeMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          receiverId: applicant.id,
          projectId: targetProject.id,
          content: `Welcome to ${targetProject.title}! Glad to have your skills on board. Let's build something extraordinary.`,
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        setMessages((prev) => [...prev, welcomeMsg]);
      }
    } else if (action === "reject" && applicant && targetProject) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: "request_rejected",
        title: "Team Request Declined",
        description: `Request for ${applicant.name} on "${targetProject.title}" was declined.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        linkTab: "requests",
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const createProject = (
    newProjectData: Omit<Project, "id" | "createdAt" | "members">,
  ): Project => {
    const newProj: Project = {
      ...newProjectData,
      id: `proj-${Date.now()}`,
      creatorId: currentUser.id,
      createdAt: new Date().toISOString().split("T")[0],
      members: [
        {
          studentId: currentUser.id,
          role: currentUser.roles?.[0] || "Team Leader",
          joinedAt: new Date().toISOString().split("T")[0],
        },
      ],
    };

    setProjects((prev) => [newProj, ...prev]);

    supabase
      .from("projects")
      .insert([
        {
          id: newProj.id,
          title: newProj.title,
          description: newProj.description,
          category: newProj.category,
          creator_id: currentUser.id,
          team_size: newProj.teamSize,
          required_skills: newProj.requiredSkills,
          required_roles: newProj.requiredRoles,
          status: "open",
        },
      ])
      .then(() => {});

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: "high_match",
      title: "Project Created Successfully",
      description: `"${newProj.title}" is now open for teammate matching! Check out recommendations in Build My Team.`,
      timestamp: new Date().toISOString(),
      isRead: false,
      linkTab: "my-team",
    };
    setNotifications((prev) => [notif, ...prev]);

    return newProj;
  };

  useEffect(() => {
    let active = true;
    let fetching = false;
    const userId = currentUser.id;
    setMessages([]);
    if (!userId) return;
    const refresh = async () => {
      if (fetching || !active) return;
      fetching = true;
      try {
        const { data, error } = await supabase.from("messages").select("*")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order("created_at", { ascending: true });
        if (!active || error) return;
        setMessages((data || []).map((row) => ({
          id: String(row.id), senderId: String(row.sender_id), receiverId: String(row.receiver_id),
          content: row.content, timestamp: row.created_at,
          projectId: row.project_id || undefined, isRead: Boolean(row.read_status),
          readAt: row.read_at || undefined, attachmentPath: row.attachment_path || undefined,
          attachmentType: row.attachment_type || undefined, attachmentName: row.attachment_name || undefined,
        })));
      } finally { fetching = false; }
    };
    void refresh();
    const channel = supabase.channel(`messages-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => { void refresh(); })
      .subscribe();
    // Polling also delivers messages when Realtime is not enabled in the dashboard.
    const timer = window.setInterval(() => { void refresh(); }, 3000);
    return () => { active = false; window.clearInterval(timer); void supabase.removeChannel(channel); };
  }, [currentUser.id]);

  const sendMessage = async (receiverId: string, content: string, projectId?: string, attachment?: File): Promise<void> => {
    const trimmed = content.trim();
    if (!trimmed && !attachment) return;
    if (!currentUser.id || receiverId === currentUser.id) throw new Error("Choose another user to message.");
    const newMsg: Message = {
      id: crypto.randomUUID(), senderId: currentUser.id, receiverId, projectId,
      content: trimmed || (attachment?.type.startsWith("image/") ? "Photo" : "Video"), timestamp: new Date().toISOString(), isRead: false,
    };
    if (attachment) {
      validateMedia(attachment);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Sign in again to upload a file.");
      const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" } as Record<string,string>)[attachment.type];
      const path = `${sessionData.session.user.id}/${receiverId}/${newMsg.id}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("chat-media").upload(path, attachment, { contentType: attachment.type });
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      newMsg.attachmentPath = path;
      newMsg.attachmentType = attachment.type.startsWith("image/") ? "image" : "video";
      newMsg.attachmentName = attachment.name;
    }
    const { data, error } = await supabase.from("messages").insert({
      id: newMsg.id, sender_id: newMsg.senderId, receiver_id: receiverId,
      project_id: projectId || null, content: newMsg.content, created_at: newMsg.timestamp, read_status: false,
      ...(newMsg.attachmentPath && { attachment_path: newMsg.attachmentPath, attachment_type: newMsg.attachmentType, attachment_name: newMsg.attachmentName }),
    }).select("id").single();
    if (error) {
      if (newMsg.attachmentPath) await supabase.storage.from("chat-media").remove([newMsg.attachmentPath]);
      throw new Error(`Message was not sent: ${error.message}`);
    }
    if (!data) throw new Error("Message was not saved. Please check database permissions.");
    if (currentUserRef.current.id !== newMsg.senderId) return;
    setMessages((prev) => prev.some((message) => message.id === newMsg.id) ? prev : [...prev, newMsg]);
  };
  useEffect(() => {
    if (!currentUser.id) return;
    const heartbeat = () => {
      if (document.visibilityState === "visible" && document.hasFocus()) void supabase.rpc("teamsync_activity", { active_now: true });
    };
    const leave = () => { void supabase.rpc("teamsync_activity", { active_now: false }); };
    const visibility = () => document.visibilityState === "visible" ? heartbeat() : leave();
    heartbeat();
    const timer = window.setInterval(heartbeat, 30000);
    window.addEventListener("focus", heartbeat);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", heartbeat);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", visibility);
      leave();
    };
  }, [currentUser.id]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const switchDemoUser = (studentId: string) => {
    const student = students.find((s) => String(s.id) === String(studentId));
    if (student) {
      setCurrentUser(student);
    }
  };

  const resetDemoData = () => {
    setCurrentUser(SEED_STUDENTS[0] || { ...EMPTY_USER });
    setStudents(SEED_STUDENTS);
    setProjects(SEED_PROJECTS);
    setRequests(SEED_REQUESTS);
    setMessages(SEED_MESSAGES);
    setShortlist(["student-ananya"]);
    setNotifications(SEED_NOTIFICATIONS);
    setComparisonList([]);
    try {
      localStorage.clear();
    } catch (e) {}
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        students,
        projects,
        requests,
        messages,
        shortlist,
        notifications,
        activeTab,
        setActiveTab,
        selectedStudentForModal,
        setSelectedStudentForModal,
        selectedProjectForModal,
        setSelectedProjectForModal,
        comparisonList,
        addToComparison,
        removeFromComparison,
        clearComparison,
        toggleShortlist,
        isShortlisted,
        updateCurrentUserProfile,
        addSkillToCurrentUser,
        removeSkillFromCurrentUser,
        updateSkillProficiency,
        sendTeamRequest,
        respondToRequest,
        createProject,
        sendMessage,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        filterSkillQuery,
        setFilterSkillQuery,
        resetDemoData,
        switchDemoUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};


