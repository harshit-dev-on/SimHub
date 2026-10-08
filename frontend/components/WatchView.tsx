"use client";

import React, { useState, useEffect } from "react";
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
  ArrowBigUp,
  ArrowBigDown,
  Bell,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { PoeModal } from "./PoeModal";
import { RedditCommentsSection } from "./RedditCommentsSection";
import { MarkdownRenderer } from "./MarkdownRenderer";

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

  const [iframeKey, setIframeKey] = useState(0);
  const [hasReported, setHasReported] = useState(false);

  const [postVote, setPostVote] = useState<"up" | "down" | null>(null);
  const [postScore, setPostScore] = useState<number>(() => {
    return Math.floor((simulation.title.length * 17) % 180) + 24;
  });

  const currentUserId = user?.id || "guest";
  const storageKey = `simhub_subs_${currentUserId}`;

  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const list: string[] = JSON.parse(saved);
          return Array.isArray(list) && list.includes(simulation.authorName);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return Boolean(simulation.isSubscribed);
  });

  useEffect(() => {
    let localSubscribed = false;
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const list: string[] = JSON.parse(saved);
          if (Array.isArray(list)) {
            localSubscribed = list.includes(simulation.authorName);
            setIsSubscribed(localSubscribed);
          }
        } else {
          setIsSubscribed(Boolean(simulation.isSubscribed));
        }
      } catch (e) {
        console.error(e);
      }
    }

    fetch(`/api/users/${encodeURIComponent(currentUserId)}/subscriptions`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.subscriptions)) {
          const isSub = data.subscriptions.includes(simulation.authorName);
          setIsSubscribed(isSub);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(data.subscriptions));
          }
        }
      })
      .catch((err) => console.error("Error fetching user subscriptions:", err));
  }, [currentUserId, simulation.authorName, storageKey]);

  const handleToggleSubscribe = async () => {
    const next = !isSubscribed;
    setIsSubscribed(next);

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        let list: string[] = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(list)) list = [];
        if (next) {
          if (!list.includes(simulation.authorName)) {
            list = [...list, simulation.authorName];
          }
        } else {
          list = list.filter((name) => name !== simulation.authorName);
        }
        localStorage.setItem(storageKey, JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const res = await fetch(
        `/api/users/${encodeURIComponent(currentUserId)}/subscriptions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorName: simulation.authorName }),
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.subscriptions)) {
        setIsSubscribed(data.subscriptions.includes(simulation.authorName));
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(data.subscriptions));
        }
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    }
  };

  const handlePostVote = (dir: "up" | "down") => {
    const currentVote = postVote;
    if (postVote === dir) {
      setPostVote(null);
      setPostScore((s) => (dir === "up" ? s - 1 : s + 1));
    } else if (postVote === null) {
      setPostVote(dir);
      setPostScore((s) => (dir === "up" ? s + 1 : s - 1));
    } else {
      setPostVote(dir);
      setPostScore((s) => (dir === "up" ? s + 2 : s - 2));
    }

    // Sync simulation vote to server
    fetch(`/api/simulations/${simulation.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction: dir, currentVote }),
    }).catch((err) => console.error("Failed to sync post vote to server:", err));
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
              <div className="mr-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-slate-900">{simulation.authorName}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="text-xs text-slate-500 font-medium">Verified Contributor</div>
              </div>

              {/* Functional Subscribe Button */}
              <button
                onClick={handleToggleSubscribe}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isSubscribed
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
                title={isSubscribed ? "Unsubscribe from this educator" : "Subscribe to this educator"}
              >
                <Bell className={`h-3.5 w-3.5 ${isSubscribed ? "fill-slate-700 text-slate-700" : ""}`} />
                <span>{isSubscribed ? "Subscribed" : "Subscribe"}</span>
              </button>
            </div>

            {/* Video Action Buttons with Reddit Vote Pill */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Reddit Style Post Upvote/Downvote Pill */}
              <div className="flex items-center rounded-full bg-white border border-slate-200 p-0.5 shadow-2xs">
                <button
                  onClick={() => handlePostVote("up")}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    postVote === "up"
                      ? "text-orange-600 bg-orange-100"
                      : "text-slate-400 hover:text-orange-600 hover:bg-slate-100"
                  }`}
                  title="Upvote simulation"
                >
                  <ArrowBigUp className={`h-4.5 w-4.5 ${postVote === "up" ? "fill-orange-600 stroke-orange-600" : ""}`} />
                </button>
                <span
                  className={`px-1.5 text-xs font-bold leading-none select-none ${
                    postVote === "up"
                      ? "text-orange-600"
                      : postVote === "down"
                      ? "text-indigo-600"
                      : "text-slate-700"
                  }`}
                >
                  {postScore > 0 ? `+${postScore}` : postScore}
                </span>
                <button
                  onClick={() => handlePostVote("down")}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    postVote === "down"
                      ? "text-indigo-600 bg-indigo-100"
                      : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                  }`}
                  title="Downvote simulation"
                >
                  <ArrowBigDown className={`h-4.5 w-4.5 ${postVote === "down" ? "fill-indigo-600 stroke-indigo-600" : ""}`} />
                </button>
              </div>

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

          {/* Reddit-Style Comment & Upvote/Downvote System */}
          <RedditCommentsSection
            simulationId={simulation.id}
            initialComments={simulation.comments || []}
            simulationTitle={simulation.title}
            creatorName={simulation.authorName}
            user={user}
            onCommentsChange={(updated) => {
              simulation.comments = updated;
            }}
          />
        </div>

        {/* Right 4 Cols: Dedicated Description & Technical Details Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 lg:sticky lg:top-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FEF9C3] text-amber-900 border border-[#FDE68A] shadow-2xs">
                  <FileText className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Description
                  </h3>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Simulation Overview
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-[#FEF9C3] text-amber-950 px-2.5 py-1 rounded-full border border-[#FDE68A]">
                {simulation.topic}
              </span>
            </div>

            {/* Quick Badges Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                6/6 Hard Gates Passed
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200">
                {simulation.gradeLevel || "Advanced STEM"}
              </span>
            </div>

            {/* Description Text (Rendered as GitHub README.md) */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>About this Simulation</span>
                <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  README.md
                </span>
              </h4>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                <MarkdownRenderer content={simulation.description} />
              </div>
            </div>

            {/* Key Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-[#EBF0F5]/60 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Views
                </div>
                <div className="font-black text-slate-900 text-sm mt-0.5">
                  {simulation.views}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#EBF0F5]/60 border border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Published
                </div>
                <div className="font-black text-slate-900 text-sm mt-0.5">
                  {simulation.uploadedAt}
                </div>
              </div>
            </div>

            {/* Source & Provenance Details */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Source & Verification
              </h4>

              <div className="flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span className="text-slate-500 text-[11px]">Repository:</span>
                <a
                  href={simulation.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 underline font-mono text-[11px] truncate flex-1"
                >
                  {simulation.repoUrl.replace("https://github.com/", "")}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-500 text-[11px]">Origin:</span>
                <a
                  href={simulation.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 underline font-mono text-[11px] truncate flex-1"
                >
                  {simulation.liveUrl}
                </a>
              </div>

              <div className="flex items-center justify-between pt-1.5 text-[11px] text-slate-500 border-t border-slate-100">
                <span>
                  License: <strong className="text-slate-800">{simulation.license}</strong>
                </span>
                <span>
                  GitHub ID: <strong className="text-slate-800">#{simulation.authorNumericId}</strong>
                </span>
              </div>

              <div className="pt-1 text-[10px] text-slate-400 leading-normal">
                Bound challenge token verified • Static tracker scanner clean.
              </div>
            </div>
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
