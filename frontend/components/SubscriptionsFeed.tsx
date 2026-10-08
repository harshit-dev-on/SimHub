"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  Play,
  ShieldCheck,
  Sparkles,
  Clock,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { UserProfile } from "@/lib/supabase";

interface SubscriptionsFeedProps {
  simulations: SimulationEntry[];
  onSelectSimulation: (sim: SimulationEntry) => void;
  onGoHome: () => void;
  user?: UserProfile | null;
}

const DEFAULT_SUBSCRIBED_EDUCATORS = [
  "Dr. Aris Thorne",
  "Priya Sharma",
  "PhET Interactive Physics",
];

export const SubscriptionsFeed: React.FC<SubscriptionsFeedProps> = ({
  simulations,
  onSelectSimulation,
  user,
}) => {
  const currentUserId = user?.id || "guest";
  const storageKey = `simhub_subs_${currentUserId}`;

  const [subscribedEducators, setSubscribedEducators] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) return list;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [selectedEducator, setSelectedEducator] = useState<string>("All");

  // Fetch subscriptions from server and sync with local storage whenever active user changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            setSubscribedEducators(list);
          }
        } else {
          setSubscribedEducators([]);
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetch(`/api/users/${encodeURIComponent(currentUserId)}/subscriptions`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.subscriptions)) {
          setSubscribedEducators(data.subscriptions);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(data.subscriptions));
          }
        }
      })
      .catch((err) => console.error("Error fetching user subscriptions:", err));
  }, [currentUserId, storageKey]);

  const toggleSubscribe = async (authorName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySubbed = subscribedEducators.includes(authorName);
    const updated = isCurrentlySubbed
      ? subscribedEducators.filter((name) => name !== authorName)
      : [...subscribedEducators, authorName];

    setSubscribedEducators(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(currentUserId)}/subscriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorName }),
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.subscriptions)) {
        setSubscribedEducators(data.subscriptions);
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(data.subscriptions));
        }
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    }
  };

  const handleSubscribeDefaults = async () => {
    setSubscribedEducators(DEFAULT_SUBSCRIBED_EDUCATORS);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(DEFAULT_SUBSCRIBED_EDUCATORS));
    }
    try {
      await fetch(
        `/api/users/${encodeURIComponent(currentUserId)}/subscriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptions: DEFAULT_SUBSCRIBED_EDUCATORS }),
        }
      );
    } catch (err) {
      console.error("Error saving default subscriptions:", err);
    }
  };

  // Extract unique educators from approved simulations
  const approvedSims = simulations.filter((s) => s.status === "approved");
  const allEducatorsMap = new Map<string, { name: string; avatar: string; topic: string; uploadsCount: number }>();

  approvedSims.forEach((s) => {
    if (!allEducatorsMap.has(s.authorName)) {
      allEducatorsMap.set(s.authorName, {
        name: s.authorName,
        avatar: s.authorAvatar,
        topic: s.topic,
        uploadsCount: 1,
      });
    } else {
      const entry = allEducatorsMap.get(s.authorName)!;
      entry.uploadsCount += 1;
    }
  });

  const allEducators = Array.from(allEducatorsMap.values());

  // Filter uploads from subscribed educators
  let feedSims = approvedSims.filter((s) =>
    subscribedEducators.includes(s.authorName)
  );

  if (selectedEducator !== "All") {
    feedSims = feedSims.filter((s) => s.authorName === selectedEducator);
  }

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto w-full text-slate-900">
      {/* 1. Subscriptions Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Subscriptions
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-950 bg-[#FEF9C3] px-3.5 py-2 rounded-xl border border-[#FDE68A] shadow-xs">
          <UserCheck className="h-4 w-4 text-emerald-600" />
          <span>{subscribedEducators.length} Subscribed Educators</span>
        </div>
      </div>

      {/* 2. Educator Channels Strip */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Subscribed Channels
        </h2>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
          <button
            onClick={() => setSelectedEducator("All")}
            className={`whitespace-nowrap flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition-all border cursor-pointer ${
              selectedEducator === "All"
                ? "bg-[#FEF08A] text-amber-950 border-amber-300 shadow-xs"
                : "bg-white text-slate-700 hover:bg-[#FEF9C3] border-slate-200"
            }`}
          >
            <span>All Channels ({feedSims.length})</span>
          </button>

          {allEducators.map((edu) => {
            const isSubbed = subscribedEducators.includes(edu.name);
            const isSelected = selectedEducator === edu.name;

            return (
              <div
                key={edu.name}
                onClick={() => setSelectedEducator(isSelected ? "All" : edu.name)}
                className={`whitespace-nowrap flex items-center gap-2.5 rounded-2xl px-3.5 py-1.5 text-xs font-semibold transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-[#FEF08A] text-amber-950 border-amber-300 shadow-xs font-bold"
                    : isSubbed
                    ? "bg-white text-slate-800 hover:bg-[#FEF9C3] border-slate-200"
                    : "bg-slate-50 text-slate-400 border-dashed border-slate-200"
                }`}
              >
                <img
                  src={edu.avatar}
                  alt={edu.name}
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="font-bold text-xs">{edu.name}</span>

                <button
                  onClick={(e) => toggleSubscribe(edu.name, e)}
                  title={isSubbed ? "Unsubscribe" : "Subscribe"}
                  className={`ml-1 p-1 rounded-full text-[10px] transition-colors cursor-pointer ${
                    isSubbed
                      ? isSelected
                        ? "text-emerald-700 hover:bg-amber-100"
                        : "text-emerald-600 hover:bg-emerald-50"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {isSubbed ? (
                    <UserCheck className="h-3.5 w-3.5" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Subscribed Uploads Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span>
              {selectedEducator === "All"
                ? "Latest Uploads"
                : `Uploads by ${selectedEducator}`}
            </span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {feedSims.length} simulations
          </span>
        </div>

        {feedSims.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {subscribedEducators.length === 0
                  ? "No Subscribed Educators"
                  : `No uploads found for ${selectedEducator}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                {subscribedEducators.length === 0
                  ? "Subscribe to verified educators above to see their latest simulations in this feed."
                  : "Try selecting 'All Channels' or subscribing to additional educators."}
              </p>
            </div>

            {subscribedEducators.length === 0 && (
              <button
                onClick={handleSubscribeDefaults}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Subscribe to Featured STEM Educators</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {feedSims.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulation(sim)}
                className="group bg-white rounded-2xl border border-slate-200 p-3 shadow-xs hover:shadow-md hover:border-amber-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={
                        sim.thumbnailUrl ||
                        (sim.screenshots && sim.screenshots[0]) ||
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                      }
                      alt={sim.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Hover Launch button */}
                    <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="h-3.5 w-3.5 fill-white" />
                        <span>Launch</span>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-3 flex gap-2.5 items-start">
                    <img
                      src={sim.authorAvatar}
                      alt={sim.authorName}
                      className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 group-hover:text-amber-800 transition-colors leading-tight">
                        {sim.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                        <span className="truncate">{sim.authorName}</span>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>Uploaded {sim.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-700">
                    {sim.topic}
                  </span>
                  <span className="text-emerald-700 font-bold">Interactive Sandbox</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
