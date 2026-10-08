"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  X,
  ExternalLink,
  Flag,
  Lock,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";

interface InterstitialModalProps {
  simulation: SimulationEntry;
  onClose: () => void;
  onLaunchPoe: () => void;
  onReport: (simId: string) => void;
}

export const InterstitialModal: React.FC<InterstitialModalProps> = ({
  simulation,
  onClose,
  onLaunchPoe,
  onReport,
}) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reported, setReported] = useState(false);

  const handleReport = async () => {
    setIsReporting(true);
    try {
      await fetch(`/api/simulations/${simulation.id}/report`, { method: "POST" });
      setReported(true);
      setTimeout(() => {
        onReport(simulation.id);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsReporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                Verified Publisher
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Author: {simulation.authorLogin} (#{simulation.authorNumericId})
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{simulation.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{simulation.description}</p>
          </div>
        </div>

        {/* Security Gates Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 mb-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Verification Breakdown (6 Hard Gates Passed)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>G1: Ownership (Numeric ID #{simulation.authorNumericId})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>G2: HMAC Linkage Token Bound</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>G3: HTTPS & Liveness Verified</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>G4: Google Safe Browsing Clean</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>G5: SPDX License ({simulation.license})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              <span>G6: Static Ad/Tracker Scan (Disconnect List)</span>
            </div>
          </div>
        </div>

        {/* Warnings & Boundaries */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 mb-5 text-xs text-amber-300/90 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Sandbox Containment & Safety Notice</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            This simulation runs in your browser within an isolated sandbox (
            <code className="text-slate-300">sandbox=&quot;allow-scripts allow-same-origin&quot;</code>). Popups,
            top-navigation, and form redirection are blocked. Static scanner found zero hardcoded trackers.
            <strong className="text-slate-300"> Note:</strong> This is accountability verification, not a legal child-safety guarantee.
          </p>
          {simulation.warnings.length > 0 && (
            <div className="pt-1 border-t border-amber-500/10">
              <span className="font-semibold text-amber-200">Non-blocking warnings:</span>
              <ul className="list-disc list-inside mt-0.5 text-slate-400">
                {simulation.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleReport}
            disabled={isReporting || reported}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{reported ? "Report filed (auto-restricting...)" : "Report this simulation (anonymous)"}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onLaunchPoe}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-xs font-semibold text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>Enter POE Learning Loop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
