import React, { useState } from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  Database,
  Download,
  Menu,
  Shield,
  Sparkles,
  X
} from 'lucide-react';
import { Avatar } from './Avatar';

interface HeaderProps {
  onOpenDownloadZip: () => void;
  onOpenCreateProject: () => void;
  onOpenDatabaseModal: () => void;
  onOpenPythonModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDownloadZip,
  onOpenCreateProject,
  onOpenDatabaseModal,
  onOpenPythonModal
}) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    students,
    switchDemoUser,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    requests
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingRequestsCount = requests.filter(
    (r) => r.receiverId === currentUser.id && r.status === 'pending'
  ).length;

  const navItems: Array<{ id: NavigationTab; label: string; badge?: number }> = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'discover', label: 'Discover' },
    { id: 'compare', label: 'Compare' },
    { id: 'projects', label: 'Projects' },
    { id: 'build-team', label: 'Assemble Team' },
    { id: 'my-team', label: 'My Squad' },
    { id: 'requests', label: 'Requests', badge: pendingRequestsCount },
    { id: 'messages', label: 'Messages' },
    { id: 'test-suite', label: 'Harness' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0E0E12]/92 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark in Classic Serif */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#1E1A14] to-[#2E271B] flex items-center justify-center border border-[#D4AF37]/35 shadow-sm group-hover:border-[#D4AF37]/60 transition-colors">
              <span className="font-serif-title font-bold text-sm text-[#E5C07B]">TS</span>
            </div>
            <span className="font-serif-title text-2xl font-bold tracking-tight text-[#FAF7F2] group-hover:text-[#E8D390] transition-colors">
              TeamSync
            </span>
          </button>
        </div>

        {/* Zone 2: Clean, classic text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#FAF7F2] bg-[#1E1E24] border border-white/[0.12] shadow-sm'
                    : 'text-[#A1A1AA] hover:text-[#FAF7F2] hover:bg-[#15151A]'
                }`}
              >
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="font-mono-nums text-[10px] px-1.5 py-0.2 rounded-full bg-[#967246] text-[#FAF7F2]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Python Build, Accounts DB, Download ZIP, Notifications, User Switcher) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Python Build & Engine Trigger */}
          <button
            onClick={onOpenPythonModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-[#17221C] to-[#121915] hover:from-[#1D2C24] hover:to-[#17221C] text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition-all shadow-sm"
            title="Python 3.10+ Web Application & SQLite Build"
          >
            <span>🐍</span>
            <span className="hidden md:inline font-semibold">Python</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/20">
              app.py
            </span>
          </button>

          {/* Collegiate Database & Accounts Modal Trigger */}
          <button
            onClick={onOpenDatabaseModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141418] hover:bg-[#1B1B22] text-[#FAF7F2] border border-white/[0.12] hover:border-[#D4AF37]/50 transition-all shadow-sm"
            title="Explore 52 Verified Real Collegiate Accounts & SQL Database"
          >
            <Database className="w-3.5 h-3.5 text-[#E5C07B]" />
            <span className="hidden sm:inline">Accounts DB</span>
            <span className="text-[10px] font-mono-nums px-1.5 py-0.2 rounded-full bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/30">
              {students.length}
            </span>
          </button>

          {/* Download Complete Project (.ZIP) Button */}
          <button
            onClick={onOpenDownloadZip}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141418] hover:bg-[#1B1B22] text-[#E8D390] border border-[#D4AF37]/25 hover:border-[#D4AF37]/45 transition-all"
            title="Download full project code runnable in VS Code"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .ZIP</span>
          </button>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#141418] hover:bg-[#1B1B22] text-[#A1A1AA] hover:text-[#FAF7F2] border border-white/[0.08] transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#0E0E12]" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#141418] border border-white/[0.12] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-serif-title font-bold text-base text-[#FAF7F2]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="font-mono-nums text-[11px] px-2 py-0.5 rounded-md bg-[#251E14] text-[#E5C07B] border border-[#D4AF37]/25">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-[#A1A1AA] hover:text-[#FAF7F2] flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.linkTab) setActiveTab(notif.linkTab as NavigationTab);
                          setShowNotifications(false);
                        }}
                        className={`p-3 rounded-lg transition-all cursor-pointer text-xs ${
                          notif.isRead
                            ? 'bg-[#0E0E12] text-[#71717A]'
                            : 'bg-[#1A1A22] text-[#FAF7F2] border border-white/[0.08]'
                        }`}
                      >
                        <div className="font-semibold mb-0.5 text-[#FAF7F2]">{notif.title}</div>
                        <div className="text-[11px] text-[#A1A1AA] line-clamp-2">
                          {notif.description}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[#71717A]">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Demo User Switcher / Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-[#141418] border border-white/[0.08] hover:border-white/[0.18] transition-all"
            >
              <Avatar
                name={currentUser.name}
                avatarUrl={currentUser.avatarUrl}
                size="sm"
              />
              <span className="hidden md:block text-xs font-medium text-[#FAF7F2] max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#141418] border border-white/[0.12] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2 py-1.5 mb-2 border-b border-white/[0.08]">
                  <div className="font-semibold text-xs text-[#FAF7F2]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-[#71717A] truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-[#E5C07B] mt-0.5">
                    Demo Mode · {currentUser.roles?.[0] || 'Student'}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-[#FAF7F2] hover:bg-[#1E1E24] rounded-lg transition-colors"
                  >
                    Edit Profile & Skills
                  </button>

                  <div className="pt-2 border-t border-white/[0.08]">
                    <span className="block px-2 text-[10px] uppercase font-semibold text-[#71717A] mb-1">
                      Switch Demo Profile:
                    </span>
                    {students.slice(0, 4).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          switchDemoUser(s.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-xs rounded-md transition-colors flex items-center justify-between ${
                          s.id === currentUser.id
                            ? 'text-[#E5C07B] font-semibold bg-[#1F1C16]'
                            : 'text-[#A1A1AA] hover:text-[#FAF7F2] hover:bg-[#1A1A22]'
                        }`}
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="text-[10px] text-[#71717A]">
                          {s.roles?.[0]?.split(' ')[0] || ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#141418] border border-white/[0.08] text-[#A1A1AA] hover:text-[#FAF7F2]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#111115] border-b border-white/[0.08] px-4 py-3 space-y-1.5 animate-in slide-in-from-top duration-150">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-[#1E1E24] text-[#FAF7F2]'
                  : 'text-[#A1A1AA] hover:bg-[#16161B]'
              }`}
            >
              <span>{item.label}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono-nums">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onOpenPythonModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-emerald-300 font-medium flex items-center gap-1.5 py-1"
            >
              <span>🐍</span>
              <span>Python app.py</span>
            </button>
            <button
              onClick={() => {
                onOpenDatabaseModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-[#FAF7F2] font-medium flex items-center gap-1.5 py-1"
            >
              <Database className="w-3.5 h-3.5 text-[#E5C07B]" />
              <span>Accounts ({students.length})</span>
            </button>
            <button
              onClick={() => {
                onOpenDownloadZip();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-[#E5C07B] font-medium flex items-center gap-1.5 py-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.ZIP</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
