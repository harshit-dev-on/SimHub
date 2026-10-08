"use client";

import React, { useState, useEffect } from "react";
import { YouTubeHeader } from "@/components/YouTubeHeader";
import { YouTubeSidebar } from "@/components/YouTubeSidebar";
import { YouTubeFeed } from "@/components/YouTubeFeed";
import { WatchView } from "@/components/WatchView";
import { UploadModal } from "@/components/UploadModal";
import { AuthModal } from "@/components/AuthModal";
import { ProfileSetupModal } from "@/components/ProfileSetupModal";
import { EducatorConsole } from "@/components/EducatorConsole";
import { AdminQueue } from "@/components/AdminQueue";
import { SimulationEntry } from "@/lib/store";
import {
  DEMO_USERS,
  UserProfile,
  isLiveSupabaseConfigured,
  supabase,
  mapSupabaseUserToProfile,
} from "@/lib/supabase";

export default function Home() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("simhub_user");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [currentView, setCurrentView] = useState<"feed" | "watch" | "verify" | "admin">("feed");
  const [selectedSim, setSelectedSim] = useState<SimulationEntry | null>(null);

  const [simulations, setSimulations] = useState<SimulationEntry[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [hasMindChangedBadge, setHasMindChangedBadge] = useState(false);

  // Restore session from localStorage on mount and sync with Supabase
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUserStr = localStorage.getItem("simhub_user");
      if (savedUserStr) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch (e) {
          console.error(e);
        }
      } else if (!isLiveSupabaseConfigured) {
        setUser(DEMO_USERS[0]);
      }

      // Check if arriving with a PKCE code on the homepage directly
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code && isLiveSupabaseConfigured) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (data?.session?.user) {
            const profile = mapSupabaseUserToProfile(data.session.user);
            setUser(profile);
            localStorage.setItem("simhub_user", JSON.stringify(profile));
            const hasCustomized = localStorage.getItem("simhub_profile_customized");
            if (!hasCustomized) {
              setIsFirstTimeSetup(true);
              setIsProfileSetupOpen(true);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        });
      }

      // Check if arriving with firstTime param
      if (urlParams.get("firstTime") === "true") {
        setIsFirstTimeSetup(true);
        setIsProfileSetupOpen(true);
      }
    }

    if (isLiveSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setUser(profile);
          if (typeof window !== "undefined") {
            localStorage.setItem("simhub_user", JSON.stringify(profile));
          }
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const profile = mapSupabaseUserToProfile(session.user);
          setUser(profile);
          if (typeof window !== "undefined") {
            localStorage.setItem("simhub_user", JSON.stringify(profile));
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("simhub_user");
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("simhub_user", JSON.stringify(loggedInUser));
      const hasCustomized = localStorage.getItem("simhub_profile_customized");
      if (!hasCustomized) {
        setIsFirstTimeSetup(true);
        setIsProfileSetupOpen(true);
      }
    }
  };

  const handleLogout = async () => {
    if (isLiveSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error(err);
      }
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("simhub_user");
    }
  };

  // Load simulations catalogue
  const loadData = async () => {
    try {
      const res = await fetch("/api/submissions");
      const data = await res.json();
      if (data.simulations) {
        setSimulations(data.simulations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      setHasMindChangedBadge(localStorage.getItem("ecoverse_badge_mind_changed") === "true");
    }
  }, [refreshTrigger]);

  const handleSelectSimulation = (sim: SimulationEntry) => {
    setSelectedSim(sim);
    setCurrentView("watch");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoHome = () => {
    setCurrentView("feed");
    setSelectedSim(null);
  };

  const handleUploadSuccess = (newSim: SimulationEntry) => {
    setSimulations((prev) => [newSim, ...prev]);
    setSelectedSim(newSim);
    setCurrentView("watch");
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-red-600/30 selection:text-white">
      {/* YouTube Style Header */}
      <YouTubeHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onGoHome={handleGoHome}
        onOpenProfileSetup={() => {
          setIsFirstTimeSetup(false);
          setIsProfileSetupOpen(true);
        }}
      />

      {/* Main Body: Sidebar + Dynamic Content View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left YouTube Navigation Drawer */}
        <YouTubeSidebar
          isOpen={isSidebarOpen}
          activeTopic={selectedTopic}
          setActiveTopic={setSelectedTopic}
          onGoHome={handleGoHome}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenAdmin={() => setCurrentView("admin")}
          onOpenEducatorVerify={() => setCurrentView("verify")}
          hasMindChangedBadge={hasMindChangedBadge}
        />

        {/* Dynamic Main Views */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {currentView === "feed" && (
            <YouTubeFeed
              simulations={simulations}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              onSelectSimulation={handleSelectSimulation}
              searchQuery={searchQuery}
            />
          )}

          {currentView === "watch" && selectedSim && (
            <WatchView
              simulation={selectedSim}
              allSimulations={simulations}
              onSelectSimulation={handleSelectSimulation}
              onReportSimulation={(id) => {
                setRefreshTrigger((prev) => prev + 1);
                handleGoHome();
              }}
              user={user}
            />
          )}

          {currentView === "verify" && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              <EducatorConsole
                onSubmissionSuccess={() => {
                  setRefreshTrigger((prev) => prev + 1);
                  setCurrentView("admin");
                }}
              />
            </div>
          )}

          {currentView === "admin" && (
            <div className="max-w-7xl mx-auto p-4 sm:p-6">
              <AdminQueue
                onQueueUpdated={() => {
                  setRefreshTrigger((prev) => prev + 1);
                }}
                refreshTrigger={refreshTrigger}
              />
            </div>
          )}
        </main>
      </div>

      {/* Upload Simulation Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        user={user}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* First-time & Custom Profile/Avatar Modal */}
      <ProfileSetupModal
        isOpen={isProfileSetupOpen}
        onClose={() => setIsProfileSetupOpen(false)}
        user={user}
        onSaveProfile={(updatedProfile) => {
          setUser(updatedProfile);
        }}
        isFirstTime={isFirstTimeSetup}
      />
    </div>
  );
}
