"use client";

import React from "react";
import { ShieldCheck, Compass, FileCheck, Layers, RotateCcw, AlertTriangle } from "lucide-react";

interface NavbarProps {
  activeTab: "learner" | "educator" | "admin" | "hud";
  setActiveTab: (tab: "learner" | "educator" | "admin" | "hud") => void;
  onResetDemo: () => void;
  isDriftActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onResetDemo,
  isDriftActive,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">EcoVerse Hub</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                Verified Registry
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              We verify who is accountable, not what is benign.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab("learner")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "learner"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Learner Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("educator")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "educator"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Educator Verify</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "admin"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Admin Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("hud")}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === "hud"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Stage HUD</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {isDriftActive && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30 animate-pulse">
              <AlertTriangle className="h-3.5 w-3.5" />
              Repo B Drift Active
            </span>
          )}

          <button
            onClick={onResetDemo}
            title="Reset demo data to initial state"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
