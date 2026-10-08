"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
} from "lucide-react";
import { GateResult } from "@/lib/store";

export interface GatesConsoleProps {
  onSubmissionSuccess: () => void;
}

export type EducatorConsoleProps = GatesConsoleProps;

export const GatesConsole: React.FC<GatesConsoleProps> = ({ onSubmissionSuccess }) => {
  const [repoUrl, setRepoUrl] = useState("https://github.com/ecoteacher/carbon-bathtub");
  const [liveUrl, setLiveUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/mock-sim/repo-b/`;
    }
    return "http://localhost:3000/api/mock-sim/repo-b/";
  });
  const [title, setTitle] = useState("Carbon Bathtub: CO₂ Stock & Flow Model");
  const [license, setLicense] = useState("MIT");
  const [topic, setTopic] = useState("Carbon Cycle");
  const [gradeLevel] = useState("High School / College");

  const [isRunningGates, setIsRunningGates] = useState(false);
  const [gateResults, setGateResults] = useState<GateResult[]>([]);

  const [isSubmittingToQueue, setIsSubmittingToQueue] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);

  // Pre-configured stage demo presets
  const handleLoadRepoA = () => {
    setRepoUrl("https://github.com/ecoteacher/glacier-melt-sim");
    setLiveUrl("https://ecoteacher.github.io/glacier-melt-sim/");
    setTitle("Glacier Retreat & Ice Albedo Feedback");
    setLicense("MIT");
    setTopic("Cryosphere");
    setGateResults([]);
    setSubmissionComplete(false);
  };

  const handleLoadRepoB = () => {
    setRepoUrl("https://github.com/ecoteacher/carbon-bathtub");
    const dynOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    setLiveUrl(`${dynOrigin}/api/mock-sim/repo-b/`);
    setTitle("Carbon Bathtub: CO₂ Stock & Flow Model");
    setLicense("MIT");
    setTopic("Carbon Cycle");
    setGateResults([]);
    setSubmissionComplete(false);
  };

  // Run the 6 Hard Gates in Parallel
  const handleRunGates = async () => {
    setIsRunningGates(true);
    setGateResults([]);
    setSubmissionComplete(false);

    // Call each gate endpoint independently in parallel
    const gatePromises = [
      fetch("/api/gates/ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, claimedUserId: 9841234 }),
      })
        .then((r) => r.json())
        .then((res: GateResult) => {
          setGateResults((prev) => [...prev, res]);
          return res;
        }),

      fetch("/api/gates/linkage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          liveUrl,
          claimedUserId: 9841234,
          repoId: 74512091,
        }),
      })
        .then((r) => r.json())
        .then((res: GateResult) => {
          setGateResults((prev) => [...prev, res]);
          return res;
        }),

      fetch("/api/gates/liveness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl }),
      })
        .then((r) => r.json())
        .then((res: GateResult) => {
          setGateResults((prev) => [...prev, res]);
          return res;
        }),

      fetch("/api/gates/safebrowsing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl }),
      })
        .then((r) => r.json())
        .then((res: GateResult) => {
          setGateResults((prev) => [...prev, res]);
          return res;
        }),

      fetch("/api/gates/license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license }),
      })
        .then((r) => r.json())
        .then((res: GateResult) => {
          setGateResults((prev) => [...prev, res]);
          return res;
        }),

      fetch("/api/gates/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl }),
      })
        .then((r) => r.json())
        .then((res: GateResult) => {
          setGateResults((prev) => [...prev, res]);
          return res;
        }),
    ];

    try {
      await Promise.all(gatePromises);
    } catch (err) {
      console.error("Gate verification error", err);
    } finally {
      setIsRunningGates(false);
    }
  };

  const allSixGatesFinished = gateResults.length === 6;
  const allSixGatesPassed = allSixGatesFinished && gateResults.every((g) => g.passed);

  const handleSubmitToQueue = async () => {
    setIsSubmittingToQueue(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          liveUrl,
          title,
          license,
          topic,
          gradeLevel,
          observationPrompt:
            "Adjust emissions and absorption rates. Notice what happens to the atmospheric CO₂ water level when emissions match net uptake vs when emissions stay flat.",
        }),
      });
      if (res.ok) {
        setSubmissionComplete(true);
        onSubmissionSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingToQueue(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pitch Quick Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block">
            Stage Rehearsal Presets (0:15 - 0:50 Flow)
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Test Rejection First (Repo A missing manifest fails G2), then Pass (Repo B passes all 6 gates).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadRepoA}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            1. Load Repo A (Rejection)
          </button>
          <button
            onClick={handleLoadRepoB}
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition-all"
          >
            2. Load Repo B (Full Pass)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Simulation Metadata</h2>
              <span className="text-[11px] font-mono text-cyan-400">OAuth ID: #9841234</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">GitHub Repository URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Published Live URL</label>
                <input
                  type="text"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">SPDX License</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white font-mono text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Simulation Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-white text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleRunGates}
              disabled={isRunningGates}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isRunningGates
                  ? "bg-slate-800 text-slate-400 cursor-wait"
                  : "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/20"
              }`}
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{isRunningGates ? "Auditing 6 Hard Gates in Parallel..." : "Execute 6 Hard Security Gates"}</span>
            </button>
          </div>

          {/* Token & Manifest helper card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Derived Challenge Token</span>
              <span className="text-[10px] text-slate-500 font-mono">HMAC-SHA256 (Stateless)</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Token is bound to <code className="text-slate-300">github_user_id | repo_id | live_url</code>. Public by
              design; copying to an unauthorized repo fails by definition.
            </p>
          </div>
        </div>

        {/* Right Column: Live Parallel Gates Ticker */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Gate Verification Results</h3>
                <p className="text-xs text-slate-400">
                  Six parallel routes write timestamped results. All 6 must pass to enable listing.
                </p>
              </div>

              {allSixGatesFinished && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                    allSixGatesPassed
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {allSixGatesPassed ? "6/6 PASSED" : "APPROVAL BLOCKED"}
                </span>
              )}
            </div>

            {/* Gates List */}
            {gateResults.length === 0 && !isRunningGates ? (
              <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-500">
                Tap &ldquo;Execute 6 Hard Security Gates&rdquo; to fire parallel verification routes.
              </div>
            ) : (
              <div className="space-y-2.5">
                {["g1", "g2", "g3", "g4", "g5", "g6"].map((gateKey) => {
                  const result = gateResults.find((g) => g.gateId === gateKey);

                  const gateNames: Record<string, string> = {
                    g1: "G1 Ownership (Numeric GitHub ID)",
                    g2: "G2 Linkage (HMAC Token in Repo & Origin)",
                    g3: "G3 Liveness (HTTPS, 2xx, 2MB Cap)",
                    g4: "G4 Safe Browsing (Threat Clean)",
                    g5: "G5 License (OSI-Approved SPDX)",
                    g6: "G6 Static Tracker Scan (Disconnect List)",
                  };

                  return (
                    <div
                      key={gateKey}
                      className={`rounded-lg border p-3 text-xs transition-all ${
                        !result
                          ? "border-slate-800 bg-slate-950/40 opacity-50 animate-pulse"
                          : result.passed
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : "border-rose-500/40 bg-rose-500/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          {!result ? (
                            <Clock className="h-4 w-4 text-slate-500 mt-0.5 animate-spin" />
                          ) : result.passed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
                          )}

                          <div>
                            <span className="font-semibold text-white block">
                              {gateNames[gateKey]}
                            </span>
                            <span
                              className={`text-[11px] mt-0.5 block ${
                                !result
                                  ? "text-slate-500"
                                  : result.passed
                                  ? "text-slate-300"
                                  : "text-rose-300 font-semibold"
                              }`}
                            >
                              {!result ? "Awaiting parallel route response..." : result.statusText}
                            </span>
                          </div>
                        </div>

                        {result && (
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-mono text-slate-500 block">
                              {result.latencyMs}ms
                            </span>
                            <span className="text-[10px] font-mono text-slate-600 block">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Submission Action */}
            {allSixGatesFinished && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {allSixGatesPassed
                    ? "All six gates passed. Ready for moderator queue."
                    : "Gate G2 failed: Third-party site cannot be attributable without matching token."}
                </span>

                <button
                  disabled={!allSixGatesPassed || isSubmittingToQueue || submissionComplete}
                  onClick={handleSubmitToQueue}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${
                    allSixGatesPassed && !submissionComplete
                      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {submissionComplete
                    ? "Submitted to Admin Queue ✓"
                    : isSubmittingToQueue
                    ? "Submitting..."
                    : "Submit to Admin Queue"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Backward-compatible alias
export const EducatorConsole = GatesConsole;
