"use client";

import React from "react";
import { CheckCircle2, Play, ShieldCheck, Tag, ExternalLink } from "lucide-react";
import { SimulationEntry } from "@/lib/store";

interface YouTubeFeedProps {
  simulations: SimulationEntry[];
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  onSelectSimulation: (sim: SimulationEntry) => void;
  searchQuery: string;
}

const TOPICS = [
  "All",
  "Carbon Cycle",
  "Atmospheric Physics",
  "Marine Chemistry",
  "Renewable Energy",
  "Urban Ecology",
  "Water Resources",
];

export const YouTubeFeed: React.FC<YouTubeFeedProps> = ({
  simulations,
  selectedTopic,
  setSelectedTopic,
  onSelectSimulation,
  searchQuery,
}) => {
  // Filter by topic and search query
  let filtered = simulations.filter((s) => s.status === "approved");

  if (selectedTopic !== "All") {
    filtered = filtered.filter((s) => s.topic.toLowerCase() === selectedTopic.toLowerCase());
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topic.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Category Pill Bar (YouTube style horizontal carousel) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedTopic === topic
                ? "bg-white text-slate-950 shadow"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* Grid of Simulation Cards (YouTube Video Cards) */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-16 text-center space-y-2">
          <p className="text-sm font-semibold text-white">No simulations match your search.</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or selecting another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-4 gap-y-8">
          {filtered.map((sim) => (
            <div
              key={sim.id}
              onClick={() => onSelectSimulation(sim)}
              className="flex flex-col gap-3 cursor-pointer group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md transition-all group-hover:rounded-none group-hover:shadow-cyan-500/10">
                <img
                  src={sim.thumbnailUrl || (sim.screenshots && sim.screenshots[0])}
                  alt={sim.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Duration / Sim Badge in Bottom Right */}
                <div className="absolute bottom-2 right-2 rounded-md bg-slate-950/85 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {sim.durationLabel || "Interactive"}
                </div>

                {/* 6/6 Verified Shield in Top Left */}
                <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-emerald-950/90 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300 backdrop-blur-sm">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  <span>6/6 Verified</span>
                </div>

                {/* Hover Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Info Row (Avatar + Details) */}
              <div className="flex gap-3 items-start">
                {/* Channel Avatar */}
                <img
                  src={sim.authorAvatar}
                  alt={sim.authorName}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-800 shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  {/* Title (2 lines clamp) */}
                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {sim.title}
                  </h3>

                  {/* Channel Name with Verified Checkmark */}
                  <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <span className="hover:text-slate-200 truncate">{sim.authorName}</span>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  </div>

                  {/* Views & Timestamp */}
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <span>{sim.views}</span>
                    <span>•</span>
                    <span>{sim.uploadedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
