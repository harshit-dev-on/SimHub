"use client";

import React from "react";
import {
  Home,
  Compass,
  FolderHeart,
  History,
  Upload,
  Award,
  ShieldCheck,
  Layers,
  Flame,
  Leaf,
  Droplets,
  Sun,
  Building2,
  Wind,
  CheckCircle2,
} from "lucide-react";

interface YouTubeSidebarProps {
  isOpen: boolean;
  activeTopic: string;
  setActiveTopic: (topic: string) => void;
  onGoHome: () => void;
  onOpenUpload: () => void;
  onOpenAdmin: () => void;
  onOpenEducatorVerify: () => void;
  hasMindChangedBadge: boolean;
}

export const YouTubeSidebar: React.FC<YouTubeSidebarProps> = ({
  isOpen,
  activeTopic,
  setActiveTopic,
  onGoHome,
  onOpenUpload,
  onOpenAdmin,
  onOpenEducatorVerify,
  hasMindChangedBadge,
}) => {
  const TOPIC_ITEMS = [
    { name: "All", icon: Compass },
    { name: "Carbon Cycle", icon: Leaf },
    { name: "Atmospheric Physics", icon: Wind },
    { name: "Marine Chemistry", icon: Droplets },
    { name: "Renewable Energy", icon: Sun },
    { name: "Urban Ecology", icon: Building2 },
    { name: "Water Resources", icon: Droplets },
  ];

  if (!isOpen) {
    // Mini Sidebar (YouTube collapsed mode)
    return (
      <aside className="hidden sm:flex flex-col items-center w-18 border-r border-slate-800 bg-slate-950 py-3 gap-6 select-none shrink-0">
        <button
          onClick={onGoHome}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white"
        >
          <Upload className="h-5 w-5" />
          <span>Upload</span>
        </button>

        <button
          onClick={onOpenEducatorVerify}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Verify</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-300 hover:text-white"
        >
          <Layers className="h-5 w-5" />
          <span>Queue</span>
        </button>
      </aside>
    );
  }

  // Expanded Sidebar (Full YouTube style)
  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-950 py-3 px-2 flex flex-col gap-4 text-xs select-none shrink-0 overflow-y-auto">
      {/* Main Section */}
      <div className="space-y-1">
        <button
          onClick={() => {
            setActiveTopic("All");
            onGoHome();
          }}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors font-medium ${
            activeTopic === "All"
              ? "bg-slate-800 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <Home className="h-4 w-4 text-red-500" />
          <span>Home Feed</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <Upload className="h-4 w-4 text-emerald-400" />
          <span>Upload Simulation</span>
        </button>
      </div>

      <div className="border-t border-slate-800/80 my-1"></div>

      {/* Topics */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Explore Topics
        </div>
        {TOPIC_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTopic === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTopic(item.name);
                onGoHome();
              }}
              className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-xl transition-colors ${
                isActive
                  ? "bg-slate-800 text-cyan-400 font-semibold"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-800/80 my-1"></div>

      {/* Badges / You */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Learning Badges
        </div>
        <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-white">Mind Changed</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {hasMindChangedBadge
              ? "✓ Badge active: You overturned a misconception in the POE loop!"
              : "Solve a POE loop on any simulation to unlock this badge."}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800/80 my-1"></div>

      {/* Security & Verification Tools */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Creator Studio
        </div>

        <button
          onClick={onOpenEducatorVerify}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <span>Security &amp; Gates</span>
        </button>

        <button
          onClick={onOpenAdmin}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <Layers className="h-4 w-4 text-amber-400" />
          <span>Moderator Queue</span>
        </button>
      </div>
    </aside>
  );
};
