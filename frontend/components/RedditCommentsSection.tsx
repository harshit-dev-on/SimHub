"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Award,
  Share2,
  Check,
  ChevronDown,
  Sparkles,
  Flame,
  Clock,
  Send,
  CornerDownRight,
  Minus,
  Plus,
} from "lucide-react";
import { SimulationComment } from "@/lib/store";
import { UserProfile } from "@/lib/supabase";

interface RedditCommentsSectionProps {
  simulationId: string;
  initialComments: SimulationComment[];
  simulationTitle: string;
  creatorName: string;
  user: UserProfile | null;
  onCommentsChange?: (updated: SimulationComment[]) => void;
}

type SortMode = "top" | "new" | "discussed";

export const RedditCommentsSection: React.FC<RedditCommentsSectionProps> = ({
  simulationId,
  initialComments,
  creatorName,
  user,
  onCommentsChange,
}) => {
  const [comments, setComments] = useState<SimulationComment[]>(() => {
    // Ensure all comments have score, upvotes, downvotes, userVote initialized
    return normalizeComments(initialComments);
  });
  const [newCommentText, setNewCommentText] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync latest comments from server on mount or simulationId change
  useEffect(() => {
    if (simulationId) {
      fetch(`/api/simulations/${simulationId}/comments`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.comments && Array.isArray(data.comments)) {
            setComments(normalizeComments(data.comments));
          }
        })
        .catch((err) => console.error("Failed to sync comments from server:", err));
    }
  }, [simulationId]);

  // Helper to normalize comments with scores
  function normalizeComments(list: SimulationComment[]): SimulationComment[] {
    return list.map((c) => ({
      ...c,
      score: c.score ?? c.likes ?? 0,
      upvotes: c.upvotes ?? c.likes ?? 0,
      downvotes: c.downvotes ?? 0,
      userVote: c.userVote ?? null,
      replies: c.replies ? normalizeComments(c.replies) : [],
    }));
  }

  // Voting handler for any comment in the recursive tree
  const handleVote = (commentId: string, direction: "up" | "down") => {
    let targetCurrentVote: "up" | "down" | null = null;
    const updateRecursive = (list: SimulationComment[]): SimulationComment[] => {
      return list.map((c) => {
        if (c.id === commentId) {
          const currentVote = c.userVote;
          targetCurrentVote = currentVote || null;
          let newVote: "up" | "down" | null = direction;
          let scoreDelta = 0;

          if (currentVote === direction) {
            // Undo vote
            newVote = null;
            scoreDelta = direction === "up" ? -1 : 1;
          } else if (currentVote === null || currentVote === undefined) {
            // Fresh vote
            scoreDelta = direction === "up" ? 1 : -1;
          } else {
            // Reversing vote (e.g. from down to up or up to down)
            scoreDelta = direction === "up" ? 2 : -2;
          }

          const newScore = (c.score ?? 0) + scoreDelta;
          return {
            ...c,
            userVote: newVote,
            score: newScore,
            likes: Math.max(0, newScore),
          };
        }

        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: updateRecursive(c.replies),
          };
        }

        return c;
      });
    };

    const updated = updateRecursive(comments);
    setComments(updated);
    onCommentsChange?.(updated);

    // Sync vote to server
    if (simulationId) {
      fetch(`/api/simulations/${simulationId}/comments/${commentId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, currentVote: targetCurrentVote }),
      }).catch((err) => console.error("Failed to sync comment vote to server:", err));
    }
  };

  // Add a reply to a specific comment
  const handleAddReply = (parentId: string, replyText: string) => {
    if (!replyText.trim()) return;

    const newReply: SimulationComment = {
      id: `c-rep-${Date.now()}`,
      authorName: user ? (user.name || user.username) : "Curious Student",
      authorAvatar: user
        ? user.avatarUrl
        : "https://api.dicebear.com/7.x/adventurer/svg?seed=CuriousStudent",
      text: replyText.trim(),
      timestamp: "Just now",
      likes: 1,
      score: 1,
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      isCreator: user ? (user.name === creatorName || user.username === creatorName) : false,
      hasMindChangedBadge: false,
      replies: [],
    };

    const addReplyRecursive = (list: SimulationComment[]): SimulationComment[] => {
      return list.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [newReply, ...(c.replies || [])],
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: addReplyRecursive(c.replies),
          };
        }
        return c;
      });
    };

    const updated = addReplyRecursive(comments);
    setComments(updated);
    onCommentsChange?.(updated);

    // Sync reply to server
    if (simulationId) {
      fetch(`/api/simulations/${simulationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: replyText.trim(),
          authorName: user ? (user.name || user.username) : "Curious Student",
          authorAvatar: user
            ? user.avatarUrl
            : "https://api.dicebear.com/7.x/adventurer/svg?seed=CuriousStudent",
          isCreator: user ? (user.name === creatorName || user.username === creatorName) : false,
          hasMindChangedBadge: false,
          parentId,
        }),
      }).catch((err) => console.error("Failed to sync reply to server:", err));
    }
  };

  // Add top-level comment
  const handleAddTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: SimulationComment = {
      id: `c-top-${Date.now()}`,
      authorName: user ? (user.name || user.username) : "Curious Student",
      authorAvatar: user
        ? user.avatarUrl
        : "https://api.dicebear.com/7.x/adventurer/svg?seed=CuriousStudent",
      text: newCommentText.trim(),
      timestamp: "Just now",
      likes: 1,
      score: 1,
      upvotes: 1,
      downvotes: 0,
      userVote: "up",
      isCreator: user ? (user.name === creatorName || user.username === creatorName) : false,
      hasMindChangedBadge: false,
      replies: [],
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    const submittedText = newCommentText.trim();
    setNewCommentText("");
    onCommentsChange?.(updated);

    // Sync top-level comment to server
    if (simulationId) {
      fetch(`/api/simulations/${simulationId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: submittedText,
          authorName: user ? (user.name || user.username) : "Curious Student",
          authorAvatar: user
            ? user.avatarUrl
            : "https://api.dicebear.com/7.x/adventurer/svg?seed=CuriousStudent",
          isCreator: user ? (user.name === creatorName || user.username === creatorName) : false,
          hasMindChangedBadge: false,
        }),
      }).catch((err) => console.error("Failed to sync comment to server:", err));
    }
  };

  // Copy comment permalink
  const handleShareComment = (id: string) => {
    setCopiedId(id);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate total comment count recursively
  const countAll = (list: SimulationComment[]): number => {
    return list.reduce((acc, curr) => acc + 1 + countAll(curr.replies || []), 0);
  };
  const totalCount = countAll(comments);

  // Sorting
  const sortedComments = [...comments].sort((a, b) => {
    if (sortMode === "top") {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    if (sortMode === "discussed") {
      return (b.replies?.length ?? 0) - (a.replies?.length ?? 0);
    }
    // "new": recent first
    return 0; // preserve insertion order as recent
  });

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-4 sm:p-6 space-y-5 shadow-xs">
      {/* 1. Reddit Header & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Discussion <span className="text-slate-400 font-semibold text-xs sm:text-sm">({totalCount})</span>
          </h3>
        </div>

        {/* Reddit Sort Buttons */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setSortMode("top")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              sortMode === "top"
                ? "bg-white text-orange-600 shadow-2xs border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Top</span>
          </button>

          <button
            onClick={() => setSortMode("new")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              sortMode === "new"
                ? "bg-white text-orange-600 shadow-2xs border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>New</span>
          </button>

          <button
            onClick={() => setSortMode("discussed")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              sortMode === "discussed"
                ? "bg-white text-orange-600 shadow-2xs border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Most Discussed</span>
          </button>
        </div>
      </div>

      {/* 2. Top-level Reddit Composer */}
      <form onSubmit={handleAddTopComment} className="flex gap-3 items-start">
        <img
          src={
            user
              ? user.avatarUrl
              : "https://api.dicebear.com/7.x/adventurer/svg?seed=CurrentLearner"
          }
          alt={user ? (user.name || user.username) : "You"}
          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0 mt-1 shadow-2xs"
        />
        <div className="flex-1 space-y-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 transition-all overflow-hidden shadow-inner">
            <textarea
              rows={2}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="What are your thoughts or observations on this simulation?"
              className="w-full bg-transparent p-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between bg-slate-100/60 px-3 py-2 border-t border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium">
                Commenting as <strong className="text-slate-800">u/{user?.username || user?.name || "user"}</strong>
              </span>
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-4 py-1.5 text-xs shadow-xs transition-all cursor-pointer"
              >
                <Send className="h-3 w-3" />
                <span>Comment</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 3. Nested Reddit Comment Tree */}
      <div className="space-y-3 pt-2">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <MessageSquare className="h-8 w-8 mx-auto text-slate-300 mb-2 stroke-1" />
            <p className="font-semibold text-slate-600">No comments yet</p>
            <p className="text-slate-400 text-[11px]">Be the first to share an observation!</p>
          </div>
        ) : (
          sortedComments.map((c) => (
            <RedditCommentItem
              key={c.id}
              comment={c}
              creatorName={creatorName}
              user={user}
              onVote={handleVote}
              onReply={handleAddReply}
              onShare={handleShareComment}
              copiedId={copiedId}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* --- Single Reddit Comment Item (Recursive Component) --- */
interface RedditCommentItemProps {
  comment: SimulationComment;
  creatorName: string;
  user: UserProfile | null;
  onVote: (commentId: string, direction: "up" | "down") => void;
  onReply: (parentId: string, text: string) => void;
  onShare: (commentId: string) => void;
  copiedId: string | null;
  depth: number;
}

const RedditCommentItem: React.FC<RedditCommentItemProps> = ({
  comment,
  creatorName,
  user,
  onVote,
  onReply,
  onShare,
  copiedId,
  depth,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isUpvoted = comment.userVote === "up";
  const isDownvoted = comment.userVote === "down";
  const score = comment.score ?? comment.likes ?? 0;
  const isAuthorOP = comment.isCreator || comment.authorName === creatorName;

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  const repliesCount = (comment.replies || []).length;

  return (
    <div className={`text-xs ${depth > 0 ? "mt-3" : "pt-1"}`}>
      {/* Collapsed state header */}
      {isCollapsed ? (
        <div
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 cursor-pointer select-none transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-slate-700">u/{comment.authorName}</span>
          <span className="text-[11px] text-slate-400">
            • {score} points • {repliesCount > 0 ? `(${repliesCount} replies collapsed)` : "collapsed"}
          </span>
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 items-start group">
          {/* Left Reddit Upvote / Downvote Vertical Column */}
          <div className="flex flex-col items-center shrink-0 select-none pt-0.5">
            {/* Upvote Arrow */}
            <button
              onClick={() => onVote(comment.id, "up")}
              title="Upvote"
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isUpvoted
                  ? "text-orange-600 bg-orange-100/80 hover:bg-orange-200/80"
                  : "text-slate-400 hover:text-orange-600 hover:bg-slate-100"
              }`}
            >
              <ArrowBigUp className={`h-4.5 w-4.5 ${isUpvoted ? "fill-orange-600 stroke-orange-600" : ""}`} />
            </button>

            {/* Score */}
            <span
              className={`text-[11px] font-bold leading-none py-0.5 ${
                isUpvoted
                  ? "text-orange-600"
                  : isDownvoted
                  ? "text-indigo-600"
                  : "text-slate-700"
              }`}
            >
              {score > 0 ? `+${score}` : score}
            </span>

            {/* Downvote Arrow */}
            <button
              onClick={() => onVote(comment.id, "down")}
              title="Downvote"
              className={`p-1 rounded-md transition-colors cursor-pointer ${
                isDownvoted
                  ? "text-indigo-600 bg-indigo-100/80 hover:bg-indigo-200/80"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
              }`}
            >
              <ArrowBigDown className={`h-4.5 w-4.5 ${isDownvoted ? "fill-indigo-600 stroke-indigo-600" : ""}`} />
            </button>
          </div>

          {/* Right Comment Body */}
          <div className="flex-1 min-w-0">
            {/* Comment Header */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
              />

              {/* Username */}
              <span className="font-bold text-slate-900 hover:underline cursor-pointer">
                u/{comment.authorName}
              </span>

              {/* OP Badge */}
              {isAuthorOP && (
                <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 text-[9px] font-black text-indigo-700 uppercase tracking-tight">
                  OP
                </span>
              )}

              {/* Mind Changed Badge */}
              {comment.hasMindChangedBadge && (
                <span className="inline-flex items-center gap-1 rounded bg-[#FEF9C3] px-1.5 py-0.5 text-[9px] font-bold text-amber-900 border border-[#FDE68A]">
                  <Award className="h-2.5 w-2.5 text-amber-600" />
                  <span>Mind Changed</span>
                </span>
              )}

              <span className="text-slate-300 text-[10px]">•</span>

              {/* Relative Timestamp */}
              <span className="text-[11px] text-slate-400">{comment.timestamp}</span>

              {/* Collapse Button */}
              <button
                onClick={() => setIsCollapsed(true)}
                title="Collapse thread"
                className="text-slate-300 hover:text-slate-600 ml-auto cursor-pointer p-0.5"
              >
                <Minus className="h-3 w-3" />
              </button>
            </div>

            {/* Comment Text */}
            <p className="mt-1.5 text-slate-800 leading-relaxed text-xs sm:text-[13px] break-words whitespace-pre-wrap">
              {comment.text}
            </p>

            {/* Action Bar (Reply, Share) */}
            <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold text-slate-500 select-none">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center gap-1 hover:text-slate-900 hover:bg-slate-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{isReplying ? "Cancel" : "Reply"}</span>
              </button>

              <button
                onClick={() => onShare(comment.id)}
                className="flex items-center gap-1 hover:text-slate-900 hover:bg-slate-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
              >
                {copiedId === comment.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>

            {/* Inline Reply Composer */}
            {isReplying && (
              <form onSubmit={submitReply} className="mt-3 flex gap-2 items-start pl-2">
                <CornerDownRight className="h-4 w-4 text-slate-400 shrink-0 mt-2" />
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to u/${comment.authorName}...`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-amber-400 focus:outline-none resize-none shadow-inner"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReplying(false)}
                      className="px-3 py-1 rounded-full text-slate-600 hover:bg-slate-100 font-medium text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-3.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Nested Child Replies (Classic Reddit Threadline) */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-2 pl-3 sm:pl-4 border-l-2 border-slate-200 hover:border-amber-400 transition-colors space-y-2">
                {comment.replies.map((childReply) => (
                  <RedditCommentItem
                    key={childReply.id}
                    comment={childReply}
                    creatorName={creatorName}
                    user={user}
                    onVote={onVote}
                    onReply={onReply}
                    onShare={onShare}
                    copiedId={copiedId}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
