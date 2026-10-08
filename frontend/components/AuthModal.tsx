"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Mail,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  DEMO_USERS,
  UserProfile,
  isLiveSupabaseConfigured,
  supabase,
  mapSupabaseUserToProfile,
} from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // GitHub OAuth Login
  const handleGithubOAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isLiveSupabaseConfigured) {
        // Live Supabase OAuth
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
      } else {
        // Smooth zero-config fallback: instantly sign in as the GitHub authenticated session
        await new Promise((r) => setTimeout(r, 400));
        const githubUser = DEMO_USERS[0]; // Dr. Aris Thorne (@ecoteacher #9841234)
        onLoginSuccess(githubUser);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("unsupported provider") || msg.toLowerCase().includes("not enabled")) {
        setErrorMsg("GitHub login is not enabled in your Supabase dashboard yet. Use the 1-Click Demo Sign In below, or enable GitHub in Supabase Dashboard → Authentication → Providers.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleOAuth = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isLiveSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        if (error) throw error;
      } else {
        await new Promise((r) => setTimeout(r, 400));
        const googleUser = DEMO_USERS[1]; // Priya Sharma
        onLoginSuccess(googleUser);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("unsupported provider") || msg.toLowerCase().includes("not enabled")) {
        setErrorMsg("Google login is not enabled in your Supabase dashboard yet. Use the 1-Click Demo Sign In below, or enable Google in Supabase Dashboard → Authentication → Providers.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (isLiveSupabaseConfigured) {
        if (tab === "signin") {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          if (data.user) {
            const profile = mapSupabaseUserToProfile(data.user);
            onLoginSuccess(profile);
            onClose();
          }
        } else {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
          if (data.session && data.user) {
            const profile = mapSupabaseUserToProfile(data.user);
            onLoginSuccess(profile);
            onClose();
          } else {
            setInfoMsg("Verification email sent! Check your inbox, or click below for instant 1-click access.");
          }
        }
      } else {
        // Zero-config fallback: login with the entered email immediately
        await new Promise((r) => setTimeout(r, 300));
        const username = email.split("@")[0] || "user";
        const customUser: UserProfile = {
          id: `usr-${Date.now()}`,
          numericId: Math.floor(Math.random() * 8000000) + 1000000,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          username: username.toLowerCase(),
          email,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          role: "user",
        };
        onLoginSuccess(customUser);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("invalid login credentials")) {
        setErrorMsg("Invalid credentials. Don't have an account yet? Switch to the 'Create Account' tab below.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save Supabase credentials directly to .env.local
  const handleSelectDemoProfile = (profile: UserProfile) => {
    onLoginSuccess(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-950 p-7 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md">
            <span className="text-xl font-bold bg-gradient-to-tr from-rose-400 to-indigo-400 bg-clip-text text-transparent">✦</span>
          </div>
          <h2 className="text-xl font-bold text-white pt-2">Sign into SimHub</h2>
          <p className="text-xs text-slate-500">
            Explore interactive simulations and participate in POE challenges
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
            {infoMsg}
          </div>
        )}

        {/* Social Sign In Buttons */}
        <div className="space-y-2.5">
          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* GitHub Sign In Button */}
          <button
            onClick={handleGithubOAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Continue with GitHub</span>
          </button>

          {/* Instant 1-Click Demo Login Button */}
          <button
            type="button"
            onClick={() => {
              onLoginSuccess(DEMO_USERS[0]);
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Instant Demo Sign In as Dr. Thorne (GitHub #9841234)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 my-2 text-slate-400 text-[11px]">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span>OR CONTINUE WITH EMAIL</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Tab Toggle for Sign In vs Sign Up */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800/80">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "signin"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-500 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === "signup"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-500 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-medium block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu.in"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-slate-300 font-medium block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors shadow-xs"
          >
            {loading
              ? tab === "signin"
                ? "Signing In..."
                : "Creating Account..."
              : tab === "signin"
              ? "Sign In with Email"
              : "Create SimHub Account"}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
              className="text-[11px] text-slate-500 hover:text-white underline"
            >
              {tab === "signin"
                ? "Don't have an account yet? Create one here"
                : "Already have an account? Sign in here"}
            </button>
          </div>
        </form>

        {/* 1-Click Fast Profile Switcher: Regular User vs Admin */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Fast Profile Switcher (User vs Admin)</span>
            <span className="text-cyan-400 font-mono text-[9px]">1-Click</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DEMO_USERS.map((usr) => (
              <button
                key={usr.id}
                onClick={() => handleSelectDemoProfile(usr)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                  usr.role === "admin"
                    ? "border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20"
                    : "border-slate-800 bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <img src={usr.avatarUrl} alt={usr.name} className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-700" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-white truncate">{usr.name}</div>
                  <div className={`text-[9px] font-mono font-bold uppercase ${usr.role === "admin" ? "text-amber-400" : "text-emerald-400"}`}>
                    {usr.role === "admin" ? "🛡️ Admin" : "User"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
