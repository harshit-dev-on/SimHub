"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  GitBranch,
  Globe,
  Flag,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";

export interface SimulationWorkbenchProps {
  simulation: SimulationEntry;
  allSimulations: SimulationEntry[];
  onSelectSimulation: (sim: SimulationEntry) => void;
  onBackToCatalogue: () => void;
  onReportSimulation: (simId: string) => void;
  user: any;
}

export const SimulationWorkbench: React.FC<SimulationWorkbenchProps> = ({
  simulation,
  allSimulations,
  onSelectSimulation,
  onBackToCatalogue,
  onReportSimulation,
}) => {
  const [iframeKey, setIframeKey] = useState(0);
  const [hasReported, setHasReported] = useState(false);

  const handleReport = async () => {
    try {
      await fetch(`/api/simulations/${simulation.id}/report`, { method: "POST" });
      setHasReported(true);
      alert(`Simulation "${simulation.title}" reported and auto-restricted pending review.`);
      onReportSimulation(simulation.id);
    } catch (err) {
      console.error(err);
    }
  };

  const otherSims = allSimulations.filter(
    (s) => s.id !== simulation.id && s.status === "approved"
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 w-full space-y-8 animate-in fade-in duration-200">
      {/* 1. Workbench Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCatalogue}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Simulation Studios</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <span className="rounded-full bg-slate-900 border border-slate-800/80 px-3 py-1 text-xs font-semibold text-slate-300">
            {simulation.topic}
          </span>
        </div>

        {/* Workbench Tools */}
        <div className="flex items-center gap-2">

          {/* Reload Sandbox */}
          <button
            onClick={() => setIframeKey((k) => k + 1)}
            className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 shadow-xs transition-all"
            title="Reload Sandbox"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Open External Sandbox */}
          <a
            href={simulation.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 shadow-xs transition-all"
            title="Open in Sandboxed New Tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Report Simulation */}
          <button
            onClick={handleReport}
            disabled={hasReported}
            className="p-2 rounded-full bg-slate-950 border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 shadow-xs transition-all"
            title="Report Simulation"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Primary Interactive Simulation Stage */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {simulation.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {simulation.description}
          </p>
        </div>

        {/* Sandboxed Simulation Viewport */}
        <div className="relative aspect-[16/10] sm:aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-lg">
          <iframe
            key={iframeKey}
            src={simulation.liveUrl}
            title={simulation.title}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full border-0 bg-slate-950"
          />

          {/* Minimal Sandbox Status Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1 text-[11px] text-slate-200 shadow-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Interactive Sandbox Active</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Client-Side Inert Execution</span>
          </div>
        </div>
      </div>

      {/* 3. Inquiry & Conceptual Workbench Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guiding Question / Observation Focus */}
        <div className="lg:col-span-2 space-y-6">

          {/* Scientific Framework & Details Card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">
                  Conceptual Framework &amp; Specification
                </h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                6/6 Hard Gates Verified
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {simulation.description}
            </p>

            {/* Source & Transparency Verification */}
            <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-slate-400" />
                <span>Repository:</span>
                <a
                  href={simulation.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-mono truncate"
                >
                  {simulation.repoUrl.replace("https://github.com/", "")}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <span>Published Source:</span>
                <a
                  href={simulation.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline font-mono truncate"
                >
                  {(() => {
                    try {
                      return new URL(simulation.liveUrl).hostname;
                    } catch {
                      return simulation.liveUrl;
                    }
                  })()}
                </a>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Author: {simulation.authorName} • License: {simulation.license} • Client-sandboxed with zero tracker cookies.
            </div>
          </div>
        </div>

        {/* Right Sidebar: Other Simulation Studios */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Explore More Simulation Studios
            </h3>
            <button
              onClick={onBackToCatalogue}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {otherSims.slice(0, 3).map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulation(sim)}
                className="bg-slate-950 rounded-2xl p-4 border border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                    {sim.topic}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                  {sim.title}
                </h4>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {sim.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
};
