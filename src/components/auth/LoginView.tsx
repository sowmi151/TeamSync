import React, { useState } from "react";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication delay for effect
    setTimeout(() => {
      onLogin();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative z-10">
      {/* 3D Glassmorphism Login Card */}
      <div
        className="w-full max-w-md bg-[rgba(10,14,30,0.3)] backdrop-blur-[24px] rounded-3xl p-8 relative overflow-hidden transition-all duration-500 ease-out"
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.3)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
          borderRight: "1px solid rgba(0, 0, 0, 0.6)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.8)",
          boxShadow: isHovering
            ? "0 35px 50px -15px rgba(0, 0, 0, 0.9), inset 0 1px 2px rgba(255, 255, 255, 0.4)"
            : "0 25px 40px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          transform: isHovering
            ? "translateY(-4px) scale(1.01)"
            : "translateY(0) scale(1)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Animated Glass Glare */}
        <div className="absolute top-0 left-[-150%] w-[50%] h-full bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent skew-x-[-25deg] animate-[glassShine_6s_infinite] pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[rgba(5,8,25,0.6)] border border-[#38BDF8]/30 shadow-[0_0_15px_rgba(56,189,248,0.3)] mb-4">
            <Sparkles className="w-8 h-8 text-[#38BDF8]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Team
            <span
              className="text-[#38BDF8]"
              style={{ textShadow: "0 0 10px rgba(56,189,248,0.6)" }}
            >
              Sync
            </span>
          </h1>
          <p className="text-sm text-[#CBD5E1]">
            Collegiate Intelligent Team Matching
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider ml-1">
              University Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#38BDF8]/70" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#050819]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#38BDF8]/60 focus:ring-1 focus:ring-[#38BDF8]/60 transition-all shadow-inner"
                placeholder="scholar@university.edu"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#A855F7]/70" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#050819]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]/60 focus:ring-1 focus:ring-[#A855F7]/60 transition-all shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl text-white font-bold transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.8), rgba(56, 189, 248, 0.8))",
              borderTop: "1px solid rgba(255, 255, 255, 0.6)",
              borderBottom: "1px solid rgba(0, 0, 0, 0.6)",
              boxShadow:
                "0 5px 15px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(56, 189, 248, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 5px 15px rgba(168, 85, 247, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)";
            }}
          >
            <LogIn className="w-4 h-4" />
            <span>Initiate Session</span>
          </button>
        </form>
      </div>
    </div>
  );
};
