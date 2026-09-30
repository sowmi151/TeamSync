/**
 * TeamSync Main Application State & Context
 * Handles LocalStorage persistence, demo authentication, automatic team formation,
 * messaging simulation, requests, notifications, and browser history routing.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
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
  setCurrentUser: (student: Student) => void;
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
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  filterSkillQuery: string;
  setFilterSkillQuery: (skill: string) => void;
  resetDemoData: () => void;
  switchDemoUser: (studentId: string) => void;
}

const STORAGE_KEY = "teamsync_v1_data";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load saved state or default to seeds
  const [currentUser, setCurrentUser] = useState<Student>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_STUDENTS[0];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_STUDENTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_projects`);
      if (saved) return JSON.parse(saved);
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

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SEED_MESSAGES;
  });

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
  // BROWSER HISTORY ROUTING LOGIC (FIXED)
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
    if (validTabs.includes(hash as NavigationTab)) {
      return hash as NavigationTab;
    }
    return "dashboard";
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

      if (validTabs.includes(hash as NavigationTab)) {
        setActiveTabState(hash as NavigationTab);
      } else {
        setActiveTabState("dashboard");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);
  // ==========================================

  const [selectedStudentForModal, setSelectedStudentForModal] =
    useState<Student | null>(null);
  const [selectedProjectForModal, setSelectedProjectForModal] =
    useState<Project | null>(null);
  const [comparisonList, setComparisonList] = useState<Student[]>([
    SEED_STUDENTS[1],
    SEED_STUDENTS[2],
  ]);
  const [filterSkillQuery, setFilterSkillQuery] = useState<string>("");

  // Persist state changes to LocalStorage
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

  // Synchronize currentUser changes into students list
  const updateCurrentUserProfile = (updated: Partial<Student>) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...updated };
      setStudents((all) => all.map((s) => (s.id === prev.id ? next : s)));
      return next;
    });
  };

  const addSkillToCurrentUser = (skill: {
    name: string;
    proficiency: number;
    category: any;
  }) => {
    const existing = (currentUser.skills || []).find(
      (s) => s.name.toLowerCase() === skill.name.toLowerCase(),
    );
    let nextSkills;
    if (existing) {
      nextSkills = currentUser.skills.map((s) =>
        s.name.toLowerCase() === skill.name.toLowerCase() ? skill : s,
      );
    } else {
      nextSkills = [...(currentUser.skills || []), skill];
    }
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
    if (comparisonList.length >= 4) return;
    if (!comparisonList.some((s) => s.id === student.id)) {
      setComparisonList((prev) => [...prev, student]);
    }
  };

  const removeFromComparison = (studentId: string) => {
    setComparisonList((prev) => prev.filter((s) => s.id !== studentId));
  };

  const clearComparison = () => setComparisonList([]);

  const sendTeamRequest = (
    receiverId: string,
    projectId: string,
    message: string,
  ) => {
    const targetProject = projects.find((p) => p.id === projectId);
    const receiver = students.find((s) => s.id === receiverId);

    const newReq: TeamRequest = {
      id: `req-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      projectId,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    setRequests((prev) => [newReq, ...prev]);

    // Add local notification
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

  // Section 41: AUTOMATIC TEAM FORMATION ON ACCEPT
  const respondToRequest = (requestId: string, action: "accept" | "reject") => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    const applicant =
      students.find((s) => s.id === req.senderId) ||
      students.find((s) => s.id === req.receiverId);
    const targetProject = projects.find((p) => p.id === req.projectId);

    const newStatus: "accepted" | "rejected" =
      action === "accept" ? "accepted" : "rejected";
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)),
    );

    if (action === "accept" && targetProject && applicant) {
      // 1. Check if member already present
      const alreadyMember = targetProject.members.some(
        (m) => m.studentId === applicant.id,
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

        // 2. Update project members and status
        const isFull = updatedMembers.length >= targetProject.teamSize;
        setProjects((all) =>
          all.map((p) =>
            p.id === targetProject.id
              ? {
                  ...p,
                  members: updatedMembers,
                  status: isFull ? "in_progress" : p.status,
                }
              : p,
          ),
        );

        // 3. Trigger Notification
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

        // 4. Trigger automated welcome message
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

  const sendMessage = (
    receiverId: string,
    content: string,
    projectId?: string,
  ) => {
    if (!content.trim()) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      projectId,
      content,
      timestamp: new Date().toISOString(),
      isRead: true,
    };
    setMessages((prev) => [...prev, newMsg]);

    // Simulate friendly automatic reply after 1.5 seconds if replying to another student
    setTimeout(() => {
      const recipient = students.find((s) => s.id === receiverId);
      if (recipient && recipient.id !== currentUser.id) {
        const replyMsg: Message = {
          id: `msg-reply-${Date.now()}`,
          senderId: recipient.id,
          receiverId: currentUser.id,
          projectId,
          content: `Thanks for reaching out! Looking forward to reviewing our skill synergy and collaborating on the project.`,
          timestamp: new Date().toISOString(),
          isRead: false,
        };
        setMessages((prev) => [...prev, replyMsg]);

        const notif: NotificationItem = {
          id: `notif-msg-${Date.now()}`,
          type: "message",
          title: `New Message from ${recipient.name}`,
          description: `"${replyMsg.content.slice(0, 60)}..."`,
          timestamp: new Date().toISOString(),
          isRead: false,
          linkTab: "messages",
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }, 1500);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const switchDemoUser = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setCurrentUser(student);
    }
  };

  const resetDemoData = () => {
    setCurrentUser(SEED_STUDENTS[0]);
    setStudents(SEED_STUDENTS);
    setProjects(SEED_PROJECTS);
    setRequests(SEED_REQUESTS);
    setMessages(SEED_MESSAGES);
    setShortlist(["student-ananya"]);
    setNotifications(SEED_NOTIFICATIONS);
    setComparisonList([SEED_STUDENTS[1], SEED_STUDENTS[2]]);
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
