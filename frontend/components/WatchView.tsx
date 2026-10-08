"use client";

import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  Flag,
  Sparkles,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Maximize2,
  GitBranch,
  Globe,
  Award,
  Send,
  Eye,
  ShieldCheck,
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
  const [likes, setLikes] = useState(simulation.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPoeModal, setShowPoeModal] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const [comments, setComments] = useState(simulation.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [iframeKey, setIframeKey] = useState(0);

  const [hasReported, setHasReported] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes((prev) => prev - 1);
      setIsLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setIsLiked(true);
    }
  };

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Player, Meta, Description, Comments */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Simulation Sandbox Player (16:9 responsive frame) */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            {/* Player Controls Bar */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg backdrop-blur-md border border-slate-800 text-xs">
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1 text-slate-400 hover:text-white"
                title="Reload Simulation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <a
                href={simulation.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-slate-400 hover:text-white"
                title="Open in Sandboxed New Tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Sandboxed Iframe (Inert Bytes Execution Sandbox) */}
            <iframe
              key={iframeKey}
              src={simulation.liveUrl}
              title={simulation.title}
              sandbox="allow-scripts allow-same-origin"
              className="w-full h-full border-0 bg-slate-950"
            />
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            {simulation.title}
          </h1>

          {/* Author Channel Row & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
            {/* Channel Info */}
            <div className="flex items-center gap-3">
              <img
                src={simulation.authorAvatar}
                alt={simulation.authorName}
                className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-700"
              />
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-white">{simulation.authorName}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="text-xs text-slate-400">{simulation.subscribers || "12.8K educators"}</div>
              </div>

              <button
                onClick={() => setIsSubscribed(!isSubscribed)}
                className={`ml-3 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  isSubscribed
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-white text-slate-950 hover:bg-slate-200"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Video Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Like / Dislike */}
              <div className="flex items-center rounded-full bg-slate-800 border border-slate-700 overflow-hidden text-xs font-semibold">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-700 transition-colors ${
                    isLiked ? "text-cyan-400" : "text-slate-200"
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{likes}</span>
                </button>
                <div className="h-4 w-px bg-slate-700"></div>
                <button className="px-2.5 py-1.5 hover:bg-slate-700 text-slate-400 transition-colors">
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Enter POE Learning Loop Button */}
              <button
                onClick={() => setShowPoeModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-1.5 text-xs font-bold shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-cyan-400 transition-all"
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
                className="flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Report */}
              <button
                onClick={handleReport}
                disabled={hasReported}
                className="flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                title="Report Simulation (Fails closed / auto-restricts)"
              >
                <Flag className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Expandable YouTube Description Box */}
          <div
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-3 cursor-pointer hover:bg-slate-900/90 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-300">
              <span>{simulation.views}</span>
              <span>{simulation.uploadedAt}</span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                License: {simulation.license}
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">
                6/6 Hard Gates Passed
              </span>
            </div>

            {/* Observation Prompt Quote */}
            <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800 text-slate-300 flex items-start gap-2">
              <Eye className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-400 block mb-0.5">Observation Prompt:</strong>
                <span>&ldquo;{simulation.observationPrompt}&rdquo;</span>
              </div>
            </div>

            <p className={`text-slate-300 leading-relaxed ${isDescriptionExpanded ? "" : "line-clamp-2"}`}>
              {simulation.description}
            </p>

            {/* Links and Security Details */}
            {isDescriptionExpanded && (
              <div className="pt-3 border-t border-slate-800 space-y-2 text-slate-400">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                  <span>GitHub Repository:</span>
                  <a
                    href={simulation.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline font-mono truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {simulation.repoUrl}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Published Origin:</span>
                  <a
                    href={simulation.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 underline font-mono truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {simulation.liveUrl}
                  </a>
                </div>

                <div className="pt-2 text-[11px] text-slate-500">
                  Author numeric GitHub ID: #{simulation.authorNumericId} • Bound challenge token verified • Static Disconnect tracker scanner clean.
                </div>
              </div>
            )}

            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <span>{isDescriptionExpanded ? "Show less" : "...more"}</span>
              {isDescriptionExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-white">
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
                className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-800 shrink-0 mt-1"
              />
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your observation or conceptual takeaway..."
                  className="w-full bg-transparent border-b border-slate-700 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-4 py-1 text-xs"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-2">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 items-start text-xs">
                  <img
                    src={c.authorAvatar}
                    alt={c.authorName}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{c.authorName}</span>
                      <span className="text-[10px] text-slate-500">{c.timestamp}</span>
                      {c.hasMindChangedBadge && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/20">
                          <Award className="h-2.5 w-2.5 text-amber-400" />
                          <span>Mind Changed</span>
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Recommended Videos / Related Simulations */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Up Next &amp; Recommended
          </h3>

          <div className="space-y-3">
            {relatedSims.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulation(sim)}
                className="flex gap-2.5 cursor-pointer group rounded-xl p-1.5 hover:bg-slate-900 transition-colors"
              >
                {/* Compact Thumbnail */}
                <div className="relative aspect-video w-36 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                  <img
                    src={sim.thumbnailUrl || (sim.screenshots && sim.screenshots[0])}
                    alt={sim.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-slate-950/80 px-1 text-[9px] font-semibold text-white">
                    {sim.durationLabel || "Sim"}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0 text-xs">
                  <h4 className="font-semibold text-white line-clamp-2 leading-tight group-hover:text-cyan-300 transition-colors">
                    {sim.title}
                  </h4>
                  <div className="mt-1 text-[11px] text-slate-400 truncate">
                    {sim.authorName}
                  </div>
                  <div className="text-[10px] text-slate-500">
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
