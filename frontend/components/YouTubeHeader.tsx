"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Mic,
  Video,
  Bell,
  User,
  Plus,
  LogOut,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { UserProfile } from "@/lib/supabase";

interface YouTubeHeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenHud: () => void;
  onResetDemo: () => void;
}

export const YouTubeHeader: React.FC<YouTubeHeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  user,
  onOpenAuth,
  onLogout,
  onGoHome,
  onOpenHud,
  onResetDemo,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      {/* Left: Hamburger & YouTube-style SimHub Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-full p-2 text-slate-300 hover:bg-slate-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="flex h-7 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <span className="text-xs font-black">▶</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-white font-sans">
              Sim<span className="text-red-500">Hub</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
              EDU
            </span>
          </div>
        </div>
      </div>

      {/* Center: YouTube Pill Search Bar */}
      <div className="hidden sm:flex items-center flex-1 max-w-xl mx-4">
        <div className="flex w-full items-center rounded-full border border-slate-700 bg-slate-900/90 shadow-inner focus-within:border-cyan-500 overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search environmental simulations..."
            className="w-full bg-transparent px-4 py-1.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button className="flex h-9 w-12 items-center justify-center border-l border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </div>

        <button
          title="Voice Search"
          className="ml-2 rounded-full bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Upload, Notifications, User Profile */}
      <div className="flex items-center gap-2">
        {/* Upload Simulation Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-sm"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span className="hidden md:inline">Upload Sim</span>
        </button>

        {/* Demo HUD shortcut */}
        <button
          onClick={onOpenHud}
          title="Stage Rehearsal HUD"
          className="hidden sm:flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 text-xs font-medium text-indigo-300 hover:bg-indigo-500/20"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>Stage HUD</span>
        </button>

        {/* Bell notifications */}
        <button
          className="relative rounded-full p-2 text-slate-300 hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Profile Avatar or Sign In */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center rounded-full ring-2 ring-emerald-500/40 focus:outline-none"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50 text-xs">
                <div className="border-b border-slate-800 px-3 py-2">
                  <div className="font-bold text-white">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="mt-1 text-[10px] font-mono text-emerald-400">
                    GitHub ID: #{user.numericId}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenUpload();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload New Simulation</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenHud();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Layers className="h-4 w-4" />
                    <span>Stage Demo Pitch HUD</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onResetDemo();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset Stage Demo State</span>
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-all"
          >
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
