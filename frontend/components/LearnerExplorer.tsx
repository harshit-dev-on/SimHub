"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
  Tag,
  GraduationCap,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { InterstitialModal } from "./InterstitialModal";
import { PoeModal } from "./PoeModal";

interface LearnerExplorerProps {
  onReportSimulation: (simId: string) => void;
  refreshTrigger: number;
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

export const LearnerExplorer: React.FC<LearnerExplorerProps> = ({
  onReportSimulation,
  refreshTrigger,
}) => {
  const [simulations, setSimulations] = useState<SimulationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [loading, setLoading] = useState(true);

  const [selectedSimForInterstitial, setSelectedSimForInterstitial] = useState<SimulationEntry | null>(null);
  const [selectedSimForPoe, setSelectedSimForPoe] = useState<SimulationEntry | null>(null);
  const [hasMindChangedBadge, setHasMindChangedBadge] = useState(false);

  useEffect(() => {
    async function fetchSims() {
      setLoading(true);
      try {
        const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : "";
        const topicParam = selectedTopic !== "All" ? `&topic=${encodeURIComponent(selectedTopic)}` : "";
        const res = await fetch(`/api/simulations?${queryParam}${topicParam}`);
        const data = await res.json();
        setSimulations(data.simulations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSims();

    if (typeof window !== "undefined") {
      setHasMindChangedBadge(localStorage.getItem("ecoverse_badge_mind_changed") === "true");
    }
  }, [searchQuery, selectedTopic, refreshTrigger]);

  const handleLaunchPoe = () => {
    if (selectedSimForInterstitial) {
      const sim = selectedSimForInterstitial;
      setSelectedSimForInterstitial(null);
      setSelectedSimForPoe(sim);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Lock className="h-3.5 w-3.5" />
            <span>Zero Learner Identifiers Collected • Client Sandboxed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Explore Verified Environmental Simulations
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every simulation in this catalogue is publisher-bound, static-tracker scanned, and safe-browsing vetted.
            Challenge your mental models with the <span className="text-emerald-400 font-semibold">Predict-Observe-Explain</span> loop.
          </p>

          {/* Badge Showcase */}
          {hasMindChangedBadge && (
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-300">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/40">
                ★
              </span>
              <span>Learner Badge Active: <strong>&ldquo;Mind Changed&rdquo;</strong> (Stored locally in your browser)</span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Topic Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search simulations (e.g., carbon cycle, greenhouse, ocean)..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Topic Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                selectedTopic === topic
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Simulations Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500 animate-pulse">
          Loading verified simulations...
        </div>
      ) : simulations.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-12 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">No verified simulations found.</p>
          <p className="text-xs text-slate-500">
            If Repo B was just auto-restricted during the drift demo, it was removed from public search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulations.map((sim) => (
            <div
              key={sim.id}
              onClick={() => setSelectedSimForInterstitial(sim)}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-emerald-500/40 hover:bg-slate-900 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/5"
            >
              <div>
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    6/6 Gates Passed
                  </span>

                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                    {sim.license}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {sim.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {sim.description}
                </p>

                {/* Observation Prompt Quote */}
                <div className="mt-3.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800 text-[11px] text-slate-300">
                  <strong className="text-emerald-400 block mb-0.5">Observation Focus:</strong>
                  <span className="line-clamp-2 italic text-slate-400">&ldquo;{sim.observationPrompt}&rdquo;</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3 text-cyan-400" />
                  <span>{sim.topic}</span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Enter POE</span>
                  <Play className="h-3 w-3 fill-emerald-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interstitial Modal */}
      {selectedSimForInterstitial && (
        <InterstitialModal
          simulation={selectedSimForInterstitial}
          onClose={() => setSelectedSimForInterstitial(null)}
          onLaunchPoe={handleLaunchPoe}
          onReport={onReportSimulation}
        />
      )}

      {/* POE Learning Loop Modal */}
      {selectedSimForPoe && (
        <PoeModal
          simulation={selectedSimForPoe}
          onClose={() => setSelectedSimForPoe(null)}
        />
      )}
    </div>
  );
};
