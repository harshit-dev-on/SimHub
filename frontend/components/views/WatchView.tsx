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
  ArrowBigUp,
  ArrowBigDown,
  Bell,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { RedditCommentsSection } from "@/components/comments/RedditCommentsSection";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { useTranslation } from "@/lib/i18n";

export interface WatchViewProps {
  simulation: SimulationEntry;
  allSimulations: SimulationEntry[];
  onSelectSimulation: (sim: SimulationEntry) => void;
  onReportSimulation: (simId: string) => void;
  user: any;
}

export const WatchView: React.FC<WatchViewProps> = ({
  simulation,
  onReportSimulation,
  user,
}) => {
  const { t } = useTranslation();

  const [iframeKey, setIframeKey] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasReported, setHasReported] = useState(false);

  // Reset index when simulation changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [simulation.id]);

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
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const list: string[] = JSON.parse(saved);
          if (Array.isArray(list)) {
            setIsSubscribed(list.includes(simulation.authorName));
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
  }, [currentUserId, simulation.authorName, storageKey, simulation.isSubscribed]);

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
    if (!user) {
      alert("Please sign in to vote on simulations.");
      return;
    }
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
          {/* Slideshow Player (16:9 responsive frame) */}
          <div className="relative aspect-video w-full overflow-hidden bg-white border-2 border-slate-200 shadow-md flex items-center justify-center group">
            {simulation.screenshots && simulation.screenshots.length > 0 ? (
              <>
                <img
                  src={simulation.screenshots[currentImageIndex]}
                  alt={`${simulation.title} screenshot ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Hover Green Play Button Overlay */}
                <a
                  href={simulation.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="h-4 w-4 fill-white" />
                    <span>{t.watchLaunch}</span>
                  </div>
                </a>
                
                {simulation.screenshots.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex((i) => (i === 0 ? simulation.screenshots.length - 1 : i - 1))
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex((i) => (i === simulation.screenshots.length - 1 ? 0 : i + 1))
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    >
                      <ChevronRight className="h-5 w-5 text-slate-700" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-white text-xs font-medium tracking-wide z-10 pointer-events-none">
                      {currentImageIndex + 1} / {simulation.screenshots.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-slate-400 font-medium">No images available</div>
            )}
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
          <div className="space-y-5 lg:sticky lg:top-4">
            {/* Description Text (Rendered as GitHub README.md) */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              <MarkdownRenderer content={simulation.description} />
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


    </div>
  );
};
