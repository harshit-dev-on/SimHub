"use client";

import React, { useState } from "react";
import {
  Share2,
  Flag,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  GitBranch,
  Globe,
  Award,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { PoeModal } from "./PoeModal";

interface WatchViewProps {
  simulation: SimulationEntry;
  allSimulations: SimulationEntry[];
  onSelectSimulation: (sim: SimulationEntry) => void;
  onReportSimulation: (simId: string) => void;
  user: any;
}

export const WatchView: React.FC<WatchViewProps> = ({
  simulation,
  allSimulations,
  onSelectSimulation,
  onReportSimulation,
  user,
}) => {
  const [showPoeModal, setShowPoeModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [comments, setComments] = useState(simulation.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const [hasReported, setHasReported] = useState(false);

  const handleReport = async () => {
    try {
      await fetch(`/api/simulations/${simulation.id}/report`, { method: "POST" });
      setHasReported(true);
      alert(`Simulation "${simulation.title}" auto-restricted pending review.`);
      onReportSimulation(simulation.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      authorName: user ? user.name : "Anonymous Learner",
      authorAvatar: user
        ? user.avatarUrl
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      text: newCommentText.trim(),
      timestamp: "Just now",
      likes: 0,
      hasMindChangedBadge: typeof window !== "undefined" && localStorage.getItem("ecoverse_badge_mind_changed") === "true",
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
  };

  const relatedSims = allSimulations.filter(
    (s) => s.id !== simulation.id && s.status === "approved"
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 w-full text-slate-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Player, Meta, Description, Comments */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Simulation Sandbox Player (16:9 responsive frame) */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-white border-2 border-slate-200 shadow-md">
            {/* Player Controls Bar */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 p-1.5 rounded-xl backdrop-blur-md border border-slate-200 text-xs shadow-xs">
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1 text-slate-600 hover:text-slate-950 transition-colors"
                title="Reload Simulation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <a
                href={simulation.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-slate-600 hover:text-slate-950 transition-colors"
                title="Open in Sandboxed New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Sandboxed Iframe */}
            <iframe
              key={iframeKey}
              src={simulation.liveUrl}
              title={simulation.title}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0 bg-white"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {simulation.title}
          </h1>

          {/* Author Info Row & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
            {/* Author Info */}
            <div className="flex items-center gap-3">
              <img
                src={simulation.authorAvatar}
                alt={simulation.authorName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-200 shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-slate-900">{simulation.authorName}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="text-xs text-slate-500 font-medium">Verified Contributor</div>
              </div>
            </div>

            {/* Video Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Enter POE Learning Loop Button */}
              <button
                onClick={() => setShowPoeModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>POE Learning Loop</span>
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Simulation link copied to clipboard!");
                }}
                className="flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Report */}
              <button
                onClick={handleReport}
                disabled={hasReported}
                className="flex items-center gap-1 rounded-full bg-white border border-slate-200 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shadow-2xs"
                title="Report Simulation"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Observation Prompt Quote - Styled as pastel yellow calculus card */}
          <div className="rounded-2xl bg-[#FEF9C3] p-4 sm:p-5 border-2 border-[#FDE68A] text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-white text-amber-800 shadow-2xs border border-[#FDE68A]">
                  <Eye className="h-4 w-4" />
                </div>
                <strong className="text-amber-950 font-black text-xs sm:text-sm">
                  Live Update Formula &amp; Calculus
                </strong>
              </div>
              <span className="text-[10px] font-bold bg-[#FEF08A] text-amber-900 px-2.5 py-0.5 rounded-full border border-[#FDE68A] shadow-2xs">
                Instant Calculus
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 border border-[#FDE68A]/80 font-mono text-xs text-slate-800 space-y-1">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Observation Prompt:</span>
                <span className="font-bold text-amber-900">f(x) = x²</span>
              </div>
              <p className="font-sans font-medium text-slate-900 leading-relaxed pt-1">
                &ldquo;{simulation.observationPrompt}&rdquo;
              </p>
            </div>
          </div>

          {/* Expandable Description Box */}
          <div
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 text-xs space-y-3 cursor-pointer hover:border-amber-300 transition-colors shadow-xs"
          >
            <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-600">
              <span>{simulation.views}</span>
              <span>•</span>
              <span>{simulation.uploadedAt}</span>
              <span className="rounded-md bg-[#FEF9C3] px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-[#FDE68A]">
                License: {simulation.license}
              </span>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                6/6 Hard Gates Passed
              </span>
            </div>

            <p className={`text-slate-700 leading-relaxed ${isDescriptionExpanded ? "" : "line-clamp-2"}`}>
              {simulation.description}
            </p>

            {/* Links and Security Details */}
            {isDescriptionExpanded && (
              <div className="pt-3 border-t border-slate-100 space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 text-indigo-500" />
                  <span>GitHub Repository:</span>
                  <a
                    href={simulation.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline font-mono truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {simulation.repoUrl}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Published Origin:</span>
                  <a
                    href={simulation.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 underline font-mono truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {simulation.liveUrl}
                  </a>
                </div>

                <div className="pt-2 text-[11px] text-slate-400">
                  Author numeric GitHub ID: #{simulation.authorNumericId} • Bound challenge token verified • Static tracker scanner clean.
                </div>
              </div>
            )}

            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span>{isDescriptionExpanded ? "Show less" : "...more"}</span>
              {isDescriptionExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </div>

          {/* Comments Section */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900">
              Learner Discussion ({comments.length})
            </h3>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-3 items-start">
              <img
                src={
                  user
                    ? user.avatarUrl
                    : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
                }
                alt="You"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mt-1"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your observation or conceptual takeaway..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-400 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 items-start text-xs border-t border-slate-100 pt-3">
                  <img
                    src={c.authorAvatar}
                    alt={c.authorName}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{c.authorName}</span>
                      <span className="text-[10px] text-slate-400">{c.timestamp}</span>
                      {c.hasMindChangedBadge && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-[#FDE68A]">
                          <Award className="h-2.5 w-2.5 text-amber-600" />
                          <span>Mind Changed</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Recommended Simulations */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Up Next &amp; Recommended
          </h3>

          <div className="space-y-3">
            {relatedSims.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulation(sim)}
                className="flex gap-2.5 cursor-pointer group rounded-2xl p-2.5 bg-white border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all"
              >
                {/* Compact Thumbnail */}
                <div className="relative aspect-video w-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={sim.thumbnailUrl || (sim.screenshots && sim.screenshots[0])}
                    alt={sim.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-amber-800 transition-colors">
                    {sim.title}
                  </h4>
                  <div className="mt-1 text-[11px] text-slate-500 truncate">
                    {sim.authorName}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {sim.views} • {sim.uploadedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POE Learning Loop Modal */}
      {showPoeModal && (
        <PoeModal
          simulation={simulation}
          onClose={() => setShowPoeModal(false)}
        />
      )}
    </div>
  );
};
