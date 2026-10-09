"use client";

import React from "react";
import {
  Home,
  Compass,
  ShieldCheck,
  Layers,
  Atom,
  Calculator,
  Cpu,
  FlaskConical,
  Dna,
  Globe,
  Users,
} from "lucide-react";

import { UserProfile } from "@/lib/supabase";

export interface SidebarProps {
  isOpen: boolean;
  activeTopic: string;
  setActiveTopic: (topic: string) => void;
  onGoHome: () => void;
  onOpenSubscriptions: () => void;
  onOpenUpload?: () => void;
  onOpenAdmin: () => void;
  onOpenEducatorVerify: () => void;
  currentView?: string;
  user?: UserProfile | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTopic,
  setActiveTopic,
  onGoHome,
  onOpenSubscriptions,
  onOpenUpload,
  onOpenAdmin,
  onOpenEducatorVerify,
  currentView = "feed",
  user,
}) => {
  const TOPIC_ITEMS = [
    { name: "All", label: "All Subjects", icon: Compass },
    { name: "Physics", label: "Physics", icon: Atom },
    { name: "Mathematics", label: "Mathematics", icon: Calculator },
    { name: "Computer Science", label: "Computer Science", icon: Cpu },
    { name: "Chemistry", label: "Chemistry", icon: FlaskConical },
    { name: "Biology", label: "Biology", icon: Dna },
    { name: "Environmental Science", label: "Environmental Science", icon: Globe },
  ];

  if (!isOpen) {
    // Mini Sidebar (collapsed mode)
    return (
      <aside className="hidden sm:flex flex-col items-center w-18 border-r border-slate-200 bg-white py-3 gap-6 select-none shrink-0 shadow-2xs">
        <button
          onClick={onGoHome}
          className={`flex flex-col items-center gap-1 text-[10px] transition-colors cursor-pointer ${
            currentView === "feed" && activeTopic === "All"
              ? "text-red-600 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </button>

        <button
          onClick={onOpenSubscriptions}
          className={`flex flex-col items-center gap-1 text-[10px] transition-colors cursor-pointer ${
            currentView === "subscriptions"
              ? "text-red-600 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
          title="Subscriptions"
        >
          <Users className="h-5 w-5" />
          <span>Subscriptions</span>
        </button>

        <button
          onClick={onOpenEducatorVerify}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 cursor-pointer"
          title="Security & Gates"
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Gates</span>
        </button>

        {user?.role === "admin" && (
          <button
            onClick={onOpenAdmin}
            className="flex flex-col items-center gap-1 text-[10px] text-amber-600 hover:text-amber-800 cursor-pointer"
            title="Admin Moderation Queue"
          >
            <Layers className="h-5 w-5" />
            <span>Admin</span>
          </button>
        )}
      </aside>
    );
  }

  // Expanded Sidebar
  return (
    <aside className="w-60 border-r border-slate-200 bg-white py-3 px-2 flex flex-col gap-4 text-xs select-none shrink-0 overflow-y-auto shadow-2xs">
      {/* Main Section */}
      <div className="space-y-1">
        <button
          onClick={() => {
            setActiveTopic("All");
            onGoHome();
          }}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors font-medium cursor-pointer ${
            currentView === "feed" && activeTopic === "All"
              ? "bg-[#FEF9C3] text-amber-950 font-bold border border-[#FDE68A] shadow-2xs"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
          }`}
        >
          <Home className="h-4 w-4 text-red-600" />
          <span>Home Feed</span>
        </button>

        <button
          onClick={onOpenSubscriptions}
          className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl transition-colors font-medium cursor-pointer ${
            currentView === "subscriptions"
              ? "bg-[#FEF9C3] text-amber-950 font-bold border border-[#FDE68A] shadow-2xs"
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
          }`}
        >
          <Users className="h-4 w-4 text-red-600" />
          <span>Subscriptions</span>
        </button>
      </div>

      <div className="border-t border-slate-200/80 my-1"></div>

      {/* Subjects */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Explore Subjects
        </div>
        {TOPIC_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === "feed" && activeTopic === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTopic(item.name);
                onGoHome();
              }}
              className={`w-full flex items-center gap-3.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? "bg-[#FEF9C3] text-amber-950 font-bold border border-[#FDE68A] shadow-2xs"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>


      <div className="border-t border-slate-200/80 my-1"></div>

      {/* Security & Verification Tools */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Creator Studio
        </div>

        <button
          onClick={onOpenEducatorVerify}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors cursor-pointer"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Security &amp; Gates</span>
        </button>

        {user?.role === "admin" && (
          <button
            onClick={onOpenAdmin}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer ${
              currentView === "admin"
                ? "bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-2xs"
                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Layers className="h-4 w-4 text-amber-600" />
              <span>Admin Queue</span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </button>
        )}
      </div>
    </aside>
  );
};

export const YouTubeSidebar = Sidebar;
export type YouTubeSidebarProps = SidebarProps;
