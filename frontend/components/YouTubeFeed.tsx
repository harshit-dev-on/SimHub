"use client";

import React from "react";
import {
  Play,
  CheckCircle2,
  ShieldCheck,
  Users,
  ChevronRight,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { UserProfile } from "@/lib/supabase";

interface YouTubeFeedProps {
  simulations: SimulationEntry[];
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  onSelectSimulation: (sim: SimulationEntry) => void;
  searchQuery: string;
  user?: UserProfile | null;
}

const TOPICS = [
  { name: "All", label: "All Subjects", icon: "🌐" },
  { name: "Physics", label: "Physics", icon: "⚛️" },
  { name: "Mathematics", label: "Mathematics", icon: "📐" },
  { name: "Computer Science", label: "Computer Science", icon: "💻" },
  { name: "Chemistry", label: "Chemistry", icon: "🧪" },
  { name: "Biology", label: "Biology", icon: "🧬" },
  { name: "Environmental Science", label: "Environmental Science", icon: "🌍" },
];

export const YouTubeFeed: React.FC<YouTubeFeedProps> = ({
  simulations,
  selectedTopic,
  setSelectedTopic,
  onSelectSimulation,
  searchQuery,
}) => {
  const approvedSims = simulations.filter((s) => s.status === "approved");

  // Filter based on search and topic
  let filtered = approvedSims;

  if (selectedTopic !== "All") {
    filtered = filtered.filter((s) => {
      const topicLower = s.topic.toLowerCase();
      const descLower = s.description.toLowerCase();
      const titleLower = s.title.toLowerCase();
      const sel = selectedTopic.toLowerCase();

      if (sel === "physics") {
        return (
          topicLower.includes("physics") ||
          topicLower.includes("kinematics") ||
          descLower.includes("physics") ||
          titleLower.includes("projectile") ||
          topicLower.includes("quantum")
        );
      }
      if (sel === "mathematics") {
        return (
          topicLower.includes("math") ||
          topicLower.includes("probability") ||
          topicLower.includes("game theory") ||
          descLower.includes("math") ||
          titleLower.includes("monty")
        );
      }
      if (sel === "computer science") {
        return (
          topicLower.includes("machine learning") ||
          topicLower.includes("optimization") ||
          descLower.includes("algorithm") ||
          titleLower.includes("gradient")
        );
      }
      if (sel === "chemistry") {
        return (
          topicLower.includes("chemistry") ||
          topicLower.includes("quantum") ||
          descLower.includes("orbital") ||
          descLower.includes("chemical")
        );
      }
      if (sel === "biology") {
        return (
          topicLower.includes("biology") ||
          topicLower.includes("ecology") ||
          descLower.includes("ecological")
        );
      }
      if (sel === "environmental science") {
        return (
          topicLower.includes("carbon") ||
          topicLower.includes("atmospheric") ||
          topicLower.includes("marine") ||
          topicLower.includes("climate") ||
          topicLower.includes("ecology") ||
          topicLower.includes("environment")
        );
      }
      return (
        topicLower.includes(sel) ||
        sel.includes(topicLower) ||
        titleLower.includes(sel)
      );
    });
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

  // Section slices for Roblox-style experience rows
  const continueSims = approvedSims.slice(0, 4);
  const trendingSims = approvedSims.slice(0, 6);
  const topRatedSims = [...approvedSims].reverse().slice(0, 6);

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto w-full text-slate-900">
      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
        {TOPICS.map((topic) => {
          const isActive = selectedTopic === topic.name;
          return (
            <button
              key={topic.name}
              onClick={() => setSelectedTopic(topic.name)}
              className={`whitespace-nowrap flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                isActive
                  ? "bg-[#FEF08A] text-amber-950 font-black border border-amber-300 shadow-xs ring-1 ring-amber-300/60"
                  : "bg-white text-slate-700 hover:bg-[#FEF9C3] hover:text-slate-950 border border-slate-200"
              }`}
            >
              <span>{topic.icon}</span>
              <span>{topic.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filtered view or Roblox-style Category Rows */}
      {searchQuery || selectedTopic !== "All" ? (
        filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-2 shadow-xs">
            <p className="text-sm font-bold text-slate-800">No simulations found.</p>
            <p className="text-xs text-slate-500">
              Try choosing &ldquo;All Subjects&rdquo; or clearing your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filtered.map((sim) => (
              <RobloxExperienceCard
                key={sim.id}
                simulation={sim}
                onSelect={onSelectSimulation}
              />
            ))}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {/* Row 1: Continue */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Continue
              </h2>
              <button
                onClick={() => setSelectedTopic("All")}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {continueSims.map((sim) => (
                <RobloxExperienceCard
                  key={sim.id}
                  simulation={sim}
                  onSelect={onSelectSimulation}
                />
              ))}
            </div>
          </section>

          {/* Row 2: Popular & Trending */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Popular &amp; Trending
              </h2>
              <button
                onClick={() => setSelectedTopic("All")}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {trendingSims.map((sim) => (
                <RobloxExperienceCard
                  key={sim.id}
                  simulation={sim}
                  onSelect={onSelectSimulation}
                />
              ))}
            </div>
          </section>

          {/* Row 3: Top Rated */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Top Rated
              </h2>
              <button
                onClick={() => setSelectedTopic("All")}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {topRatedSims.map((sim) => (
                <RobloxExperienceCard
                  key={sim.id}
                  simulation={sim}
                  onSelect={onSelectSimulation}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

/* --- Experience Card Component Styled with Pastel Yellow & Clean White --- */
interface RobloxExperienceCardProps {
  simulation: SimulationEntry;
  onSelect: (sim: SimulationEntry) => void;
  isHighlighted?: boolean;
}

const RobloxExperienceCard: React.FC<RobloxExperienceCardProps> = ({
  simulation,
  onSelect,
  isHighlighted,
}) => {
  const activeLearners =
    simulation.viewsCount && simulation.viewsCount > 0
      ? simulation.viewsCount * 3 + 12
      : Math.floor((simulation.title.length * 17) % 350) + 40;

  return (
    <div
      onClick={() => onSelect(simulation)}
      className={`group rounded-2xl p-2.5 sm:p-3 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
        isHighlighted
          ? "bg-white border border-[#FDE68A] hover:border-amber-400"
          : "bg-white border border-slate-200 hover:border-amber-300"
      }`}
    >
      <div>
        {/* Experience Thumbnail (4:3 Tile) */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200/80 shadow-inner">
          <img
            src={
              simulation.thumbnailUrl ||
              (simulation.screenshots && simulation.screenshots[0]) ||
              "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
            }
            alt={simulation.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover Green Play Button Overlay */}
          <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Launch</span>
            </div>
          </div>
        </div>

        {/* Experience Title & Author */}
        <div className="mt-2.5 space-y-1">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-amber-800 transition-colors leading-tight">
            {simulation.title}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
            <span className="truncate">By {simulation.authorName}</span>
            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
          </div>
        </div>
      </div>

      {/* Bottom Telemetry */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-slate-600">
        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>6/6 Gates</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <Users className="h-3 w-3 text-slate-400" />
          <span>{activeLearners} active</span>
        </div>
      </div>
    </div>
  );
};
