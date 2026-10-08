"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Compass,
  FileCheck,
  Layers,
  Sparkles,
} from "lucide-react";

interface StageDemoHudProps {
  onSwitchTab: (tab: "learner" | "educator" | "admin") => void;
  onResetDemo: () => void;
  isDriftActive: boolean;
  onToggleDrift: () => void;
}

export const StageDemoHud: React.FC<StageDemoHudProps> = ({
  onSwitchTab,
  onResetDemo,
  isDriftActive,
  onToggleDrift,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getPhaseIndex = (secs: number) => {
    if (secs < 15) return 0;
    if (secs < 50) return 1;
    if (secs < 60) return 2;
    if (secs < 140) return 3;
    if (secs < 170) return 4;
    return 5;
  };

  const currentPhase = getPhaseIndex(seconds);

  const PHASES = [
    {
      time: "0:00 - 0:15",
      title: "Problem & Accountability Pitch",
      cue: 'Open with largest real number: "9 of 20 repos lack an OSI license and 7 have no live URL. We verify who is accountable, not what is benign. Servers never run third-party code."',
      actionTab: "learner" as const,
    },
    {
      time: "0:15 - 0:50",
      title: "Rejection First, Then Pass",
      cue: 'Submit Repo A (fails G2 in red: "Token not found"). Then submit Repo B: all 6 turn green with timestamps.',
      actionTab: "educator" as const,
    },
    {
      time: "0:50 - 1:00",
      title: "Moderator 1-Tap Approval",
      cue: "Admin queue shows Repo B with 6 gates and warnings. Admin taps approve to lock SHA-256 fingerprint.",
      actionTab: "admin" as const,
    },
    {
      time: "1:00 - 2:20",
      title: "Learner POE Loop & Mind Changed Badge",
      cue: 'Search "carbon cycle", open interstitial, make 3 predictions (stage script auto-fill), observe bathtub dynamics, explain post-test. Graded reveal shows 2 net flips and "Mind Changed" badge.',
      actionTab: "learner" as const,
    },
    {
      time: "2:20 - 2:50",
      title: "Post-Approval Drift Swap & Auto-Restrict",
      cue: 'Toggle Repo B drift (adds tracker to game.js, HTML identical). Click "Re-verify now" -> fails G6, auto-restricted, instantly vanishes from search!',
      actionTab: "admin" as const,
    },
    {
      time: "2:50 - 3:00",
      title: "Close & Summary",
      cue: '"Attributable and bannable. Real trust without running untrusted code."',
      actionTab: "learner" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stopwatch Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-950 p-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center justify-center h-20 w-32 rounded-xl bg-slate-950 border border-indigo-500/30 text-indigo-300 font-mono text-3xl font-extrabold shadow-inner">
            {formatTime(seconds)}
            <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">3:00 Target</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Stage Rehearsal &amp; Pitch Director
            </span>
            <h2 className="text-xl font-bold text-white">Stopwatch Rehearsal Mode</h2>
            <p className="text-xs text-slate-400">
              Synchronize your narrative beats with the exact 24-hour hackathon 3-minute stage flow.
            </p>
          </div>
        </div>

        {/* Stopwatch Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimerRunning(!timerRunning)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              timerRunning
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-indigo-500/20"
            }`}
          >
            {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{timerRunning ? "Pause Stopwatch" : "Start Pitch Clock"}</span>
          </button>

          <button
            onClick={() => {
              setTimerRunning(false);
              setSeconds(0);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:text-white"
            title="Reset stopwatch to 0:00"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stage Flow Cue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {PHASES.map((phase, idx) => {
          const isActive = idx === currentPhase;
          const isPassed = idx < currentPhase;

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4.5 transition-all flex flex-col justify-between space-y-3 ${
                isActive
                  ? "border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400"
                  : isPassed
                  ? "border-slate-800 bg-slate-900/40 opacity-70"
                  : "border-slate-800 bg-slate-900/70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-indigo-500 text-slate-950 font-extrabold"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {phase.time}
                  </span>

                  {isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{phase.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{phase.cue}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => onSwitchTab(phase.actionTab)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Jump to {phase.actionTab.toUpperCase()} Tab &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Emergency Controls */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Presenter Quick Actions (Zero Stage Latency)
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onToggleDrift}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isDriftActive
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>
              {isDriftActive
                ? "Drift Active (Tracker Injected in game.js) - Click to Clean"
                : "Inject Tracker into Repo B game.js (Simulate Drift)"}
            </span>
          </button>

          <button
            onClick={onResetDemo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Full Demo Reset (Clean State)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
