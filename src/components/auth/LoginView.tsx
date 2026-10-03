import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Mail,
  Lock,
  LogIn,
  User,
  UserPlus,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface LoginViewProps {
  // We added name and email parameters here so we can pass them back to App.tsx
  onLogin: (name?: string, email?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<
    "form" | "google" | "github" | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProvider("form");
    setErrorMsg(null);

    try {
      if (isLoginMode) {
        // Authenticate existing user
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (authError) throw authError;

        // Fetch corresponding profile from the students table
        const { data: student } = await supabase
          .from("students")
          .select("full_name, email")
          .eq("email", email.trim())
          .maybeSingle();

        const displayName =
          student?.full_name ||
          authData.user?.user_metadata?.full_name ||
          email.split("@")[0];

        onLogin(displayName, email.trim());
      } else {
        // Sign up new user
        const { data: authData, error: authError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: name.trim(),
              },
            },
          });

        if (authError) throw authError;

        const studentId = authData.user?.id || `student-${Date.now()}`;
        const displayName = name.trim() || email.split("@")[0];

        // Insert new student profile into public.students
        const { error: insertError } = await supabase.from("students").insert([
          {
            id: studentId,
            full_name: displayName,
            email: email.trim(),
            department: "Computer Science",
            academic_year: "1st Year",
            degree: "B.Tech",
            verified_student: true,
          },
        ]);

        if (insertError) {
          console.warn("Profile insert warning:", insertError.message);
        }

        onLogin(displayName, email.trim());
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoadingProvider(provider);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `Unable to authenticate with ${provider}.`);
      setLoadingProvider(null);
    }
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
        <div className="absolute top-0 left-[-150%] w-[50%] h-full bg-linear-to-r from-transparent via-[rgba(255,255,255,0.08)] to-transparent skew-x-[-25deg] animate-[glassShine_6s_infinite] pointer-events-none" />

        {/* Header with Custom Logo */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[rgba(5,8,25,0.7)] border border-[#38BDF8]/40 shadow-[0_0_25px_rgba(56,189,248,0.35)] mb-4 overflow-hidden p-2">
            <img
              src="/logo.png.jpeg"
              alt="TeamSync Logo"
              className="w-full h-full object-contain rounded-xl drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            />
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
            {isLoginMode
              ? "Authenticate to continue"
              : "Join the scholar network"}
          </p>
        </div>

        {/* Dynamic Error Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Name Field - Only visible when Sign Up is active */}
          {!isLoginMode && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#38BDF8]/70" />
                </div>
                <input
                  type="text"
                  required={!isLoginMode}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#050819]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-[#38BDF8]/60 focus:ring-1 focus:ring-[#38BDF8]/60 transition-all shadow-inner"
                  placeholder="Rahul Sharma"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider ml-1">
              Email{" "}
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
            {isLoginMode ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>
              {loadingProvider === "form"
                ? "Connecting to Cloud..."
                : isLoginMode
                  ? "Initiate Session"
                  : "Create Scholar Profile"}
            </span>
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-6 flex items-center justify-center z-10">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#0b1021] px-3 text-xs tracking-widest text-[#94A3B8] font-semibold uppercase">
            OR
          </span>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-3 relative z-10">
          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleOAuthSignIn("google")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#050819]/50 py-3 px-4 font-medium text-white transition-all hover:bg-[#0c122b] hover:border-white/20 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {loadingProvider === "google" ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#38BDF8]" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="text-sm font-semibold tracking-wide">
              {loadingProvider === "google"
                ? "Connecting to Google..."
                : "Sign in with Google"}
            </span>
          </button>

          <button
            type="button"
            disabled={loadingProvider !== null}
            onClick={() => handleOAuthSignIn("github")}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#050819]/50 py-3 px-4 font-medium text-white transition-all hover:bg-[#0c122b] hover:border-white/20 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {loadingProvider === "github" ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <svg
                className="h-5 w-5 fill-current text-white"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            )}
            <span className="text-sm font-semibold tracking-wide">
              {loadingProvider === "github"
                ? "Connecting to Github..."
                : "Sign in with Github"}
            </span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="mt-6 text-center relative z-10">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMsg(null);
            }}
            className="text-xs text-[#CBD5E1] hover:text-white transition-colors cursor-pointer"
          >
            {isLoginMode
              ? "Don't have an account? Sign up here."
              : "Already a scholar? Log in here."}
          </button>
        </div>
      </div>
    </div>
  );
};
