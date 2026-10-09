"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";

export interface AdminQueueProps {
  onQueueUpdated: () => void;
  refreshTrigger: number;
}

export const AdminQueue: React.FC<AdminQueueProps> = ({ onQueueUpdated, refreshTrigger }) => {
  const [submissions, setSubmissions] = useState<SimulationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverifyingId, setReverifyingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [hidingId, setHidingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      setSubmissions(data.simulations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [refreshTrigger]);

  const handleApprove = async (sim: SimulationEntry) => {
    setApprovingId(sim.id);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sim.id, gates: sim.gates }),
      });
      if (res.ok) {
        setActionNotice(`Approved "${sim.title}" and locked cryptographic SHA-256 fingerprint.`);
        fetchQueue();
        onQueueUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  const handleReverify = async (sim: SimulationEntry) => {
    setReverifyingId(sim.id);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/submissions/${sim.id}/reverify`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.outcome === "auto_restricted") {
        setActionNotice(`🚨 DRIFT HARD-FAIL DETECTED: Entry was AUTO-RESTRICTED from public search! Reason: ${data.reason}`);
      } else if (data.outcome === "re_queued") {
        setActionNotice(`⚠️ CONTENT DRIFT: Hash mismatch detected. Re-queued for moderator review.`);
      } else {
        setActionNotice(`✓ Re-verification clean: All 6 gates passed and cryptographic hashes match approved baseline.`);
      }

      fetchQueue();
      onQueueUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setReverifyingId(null);
    }
  };

  const handleHide = async (sim: SimulationEntry) => {
    setHidingId(sim.id);
    try {
      const res = await fetch("/api/admin/restrict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sim.id, reason: "Hidden by Administrator" }),
      });
      if (res.ok) {
        setActionNotice(`Hidden "${sim.title}". It will no longer appear in public search.`);
        fetchQueue();
        onQueueUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHidingId(null);
    }
  };

  const handleDelete = async (sim: SimulationEntry) => {
    if (!confirm(`Are you sure you want to permanently delete "${sim.title}"?`)) return;
    setDeletingId(sim.id);
    try {
      const res = await fetch(`/api/submissions?id=${encodeURIComponent(sim.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setActionNotice(`Deleted "${sim.title}" from the database.`);
        fetchQueue();
        onQueueUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Moderator Review &amp; Drift Audit Queue</h2>
          <p className="text-xs text-stone-500">
            Admins review gate outputs, approve listings with immutable SHA-256 fingerprints, and run live drift re-verifications.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs text-stone-700 hover:bg-stone-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {actionNotice && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-semibold text-amber-200 animate-in fade-in duration-200 flex items-center justify-between">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2 text-xs">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500">Loading queue...</div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sim) => (
            <div
              key={sim.id}
              className={`rounded-xl border p-5 transition-all ${
                sim.status === "approved"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : sim.status === "restricted"
                  ? "border-rose-200 bg-rose-50/50"
                  : sim.status === "drift_flagged"
                  ? "border-amber-200 bg-amber-50/50"
                  : "border-stone-200 bg-white"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wide ${
                        sim.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : sim.status === "restricted"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : sim.status === "drift_flagged"
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-cyan-100 text-cyan-700 border-cyan-200"
                      }`}
                    >
                      {sim.status}
                    </span>

                    <span className="text-xs text-stone-500 font-mono">
                      Publisher: {sim.authorLogin} (#{sim.authorNumericId})
                    </span>

                    <span className="text-xs text-stone-400 font-mono">
                      Repo: #{sim.repoNumericId}
                    </span>

                    {sim.isDemoRepoB && (
                      <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                        Stage Repo B Stand-in
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-stone-900">{sim.title}</h3>
                  <p className="text-xs text-stone-600 line-clamp-1">{sim.description}</p>

                  {/* Fingerprint / Reason */}
                  {sim.statusReason && (
                    <div className="text-[11px] text-stone-500 font-mono mt-1">
                      Status Note: <span className="text-amber-700">{sim.statusReason}</span>
                    </div>
                  )}

                  {sim.fingerprint && (
                    <div className="text-[10px] text-stone-400 font-mono mt-1 flex flex-wrap gap-3">
                      <span>HTML SHA: {sim.fingerprint.htmlSha.substring(0, 16)}...</span>
                      <span>Scripts Scanned: {sim.fingerprint.scannedScripts}</span>
                      <span>Approved: {new Date(sim.fingerprint.approvedAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0">
                  {sim.status === "pending" && (
                    <button
                      onClick={() => handleApprove(sim)}
                      disabled={approvingId === sim.id}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition-all"
                    >
                      {approvingId === sim.id ? "Approving..." : "1-Tap Approve"}
                    </button>
                  )}

                  <button
                    onClick={() => handleReverify(sim)}
                    disabled={reverifyingId === sim.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 font-semibold text-xs hover:bg-cyan-100 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${reverifyingId === sim.id ? "animate-spin" : ""}`} />
                    <span>{reverifyingId === sim.id ? "Auditing Live Gates..." : "Re-Verify Now"}</span>
                  </button>

                  {sim.status !== "restricted" && (
                    <button
                      onClick={() => handleHide(sim)}
                      disabled={hidingId === sim.id}
                      className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs hover:bg-amber-100 transition-all"
                    >
                      {hidingId === sim.id ? "Hiding..." : "Hide"}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(sim)}
                    disabled={deletingId === sim.id}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-all"
                  >
                    {deletingId === sim.id ? "Deleting..." : "Delete"}
                  </button>

                  <a
                    href={sim.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-stone-200 bg-white text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                    title="Inspect live URL in sandboxed tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
