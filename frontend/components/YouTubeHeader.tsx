"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Mic,
  MicOff,
  Bell,
  User,
  Plus,
  LogOut,
  Sparkles,
  X,
  Volume2,
} from "lucide-react";
import { UserProfile } from "@/lib/supabase";

interface YouTubeHeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenProfileSetup: () => void;
}

const VOICE_PROMPT_SUGGESTIONS = [
  "Projectile Motion",
  "Gradient Descent",
  "Quantum Physics",
  "Monty Hall Problem",
  "Electron Clouding",
  "Classical Kinematics",
];

export const YouTubeHeader: React.FC<YouTubeHeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  user,
  onOpenAuth,
  onLogout,
  onGoHome,
  onOpenProfileSetup,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("Listening... Speak now");

  const startVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback modal if SpeechRecognition is not supported in this browser
      setShowVoiceModal(true);
      setVoiceFeedback("Web Speech API not supported in this browser. Click any topic below:");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setShowVoiceModal(true);
        setVoiceFeedback("Listening... Say a simulation topic or concept");
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        setVoiceFeedback(`"${transcript}"`);

        if (event.results[0].isFinal) {
          setSearchQuery(transcript);
          setTimeout(() => {
            setShowVoiceModal(false);
            setIsListening(false);
          }, 700);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setVoiceFeedback("Microphone access blocked. Click any simulation suggestion below:");
        } else {
          setVoiceFeedback(`Voice input: ${event.error}. Click a suggestion or try again:`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setShowVoiceModal(true);
      setVoiceFeedback("Click any simulation below to test voice search:");
      setIsListening(false);
    }
  };

  const selectSuggestion = (phrase: string) => {
    setSearchQuery(phrase);
    setShowVoiceModal(false);
    setIsListening(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 shadow-xs">
      {/* Left: Hamburger & SimHub Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-full p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={onGoHome}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="flex h-7 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
            <span className="text-xs font-black">▶</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              Sim<span className="text-red-600">Hub</span>
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-[#FEF9C3] px-1.5 py-0.5 rounded-md border border-[#FDE68A] uppercase tracking-tighter">
              EDU
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Bar with Functional Voice Search */}
      <div className="hidden sm:flex items-center flex-1 max-w-xl mx-4">
        <div className="flex w-full items-center rounded-full border border-slate-300 bg-slate-50 shadow-inner focus-within:border-amber-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-200 transition-all overflow-hidden">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search math &amp; physics simulations..."
            className="w-full bg-transparent px-4 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-2 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button className="flex h-9 w-12 items-center justify-center border-l border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </div>

        {/* Functional Voice Search Mic Button */}
        <button
          onClick={startVoiceSearch}
          title={isListening ? "Listening... click to stop" : "Search with voice"}
          className={`ml-2 rounded-full p-2 border transition-all cursor-pointer ${
            isListening
              ? "bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300"
              : "bg-[#FEF9C3] text-amber-900 hover:bg-[#FEF08A] border-[#FDE68A] shadow-xs"
          }`}
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>

      {/* Right: Upload, Notifications, User Profile */}
      <div className="flex items-center gap-2">
        {/* Upload Simulation Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4 text-emerald-400" />
          <span className="hidden md:inline">Upload Sim</span>
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Profile Avatar or Sign In */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center rounded-full ring-2 ring-amber-400/80 focus:outline-none cursor-pointer"
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 text-xs text-slate-800">
                <div className="border-b border-slate-100 px-3 py-2 bg-slate-50/70 rounded-xl mb-1">
                  <div className="font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      #{user.numericId}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>
                      {user.role === "admin" ? "🛡️ Admin" : "User"}
                    </span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenProfileSetup();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-indigo-700 hover:bg-indigo-50 font-medium cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <span>Customize Profile &amp; Avatar</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onOpenUpload();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Upload New Simulation</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 shadow-xs transition-all cursor-pointer"
          >
            <User className="h-4 w-4 text-slate-600" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Functional Voice Search Interactive Listening Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-[#FEF9C3] border-2 border-[#FDE68A] p-6 sm:p-8 shadow-2xl text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowVoiceModal(false);
                setIsListening(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-4">
              {/* Mic Listening Animation Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md relative">
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-red-400 opacity-40 animate-ping pointer-events-none" />
                )}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all ${
                    isListening ? "bg-red-500 text-white shadow-lg" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <Mic className="h-7 w-7" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  {isListening ? "Listening with Microphone..." : "Voice Search"}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-amber-900 bg-white/80 rounded-xl py-2 px-3 mt-2 border border-[#FDE68A] min-h-[38px] flex items-center justify-center">
                  {voiceFeedback}
                </p>
              </div>

              {/* Suggestions Chips */}
              <div className="pt-2 text-left">
                <p className="text-[11px] font-bold text-amber-900/80 uppercase tracking-wider mb-2">
                  Or click to search instantly:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {VOICE_PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => selectSuggestion(suggestion)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-amber-100 border border-[#FDE68A] text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
