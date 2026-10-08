"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { LearnerExplorer } from "@/components/LearnerExplorer";
import { EducatorConsole } from "@/components/EducatorConsole";
import { AdminQueue } from "@/components/AdminQueue";
import { StageDemoHud } from "@/components/StageDemoHud";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"learner" | "educator" | "admin" | "hud">("learner");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDriftActive, setIsDriftActive] = useState(false);

  const fetchDriftState = async () => {
    try {
      const res = await fetch("/api/mock-sim/repo-b/toggle-drift");
      const data = await res.json();
      setIsDriftActive(data.driftActive ?? false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDriftState();
  }, []);

  const handleResetDemo = async () => {
    try {
      await fetch("/api/demo/reset", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("ecoverse_badge_mind_changed");
      }
      setIsDriftActive(false);
      setRefreshTrigger((prev) => prev + 1);
      alert("Demo state reset to pristine stage baseline. Repo B is clean and pending.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDrift = async () => {
    try {
      const res = await fetch("/api/mock-sim/repo-b/toggle-drift", { method: "POST" });
      const data = await res.json();
      setIsDriftActive(data.driftActive);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetDemo={handleResetDemo}
        isDriftActive={isDriftActive}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "learner" && (
          <LearnerExplorer
            onReportSimulation={(id) => {
              setRefreshTrigger((prev) => prev + 1);
            }}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === "educator" && (
          <EducatorConsole
            onSubmissionSuccess={() => {
              setRefreshTrigger((prev) => prev + 1);
              setActiveTab("admin");
            }}
          />
        )}

        {activeTab === "admin" && (
          <AdminQueue
            onQueueUpdated={() => {
              setRefreshTrigger((prev) => prev + 1);
            }}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === "hud" && (
          <StageDemoHud
            onSwitchTab={(tab) => setActiveTab(tab)}
            onResetDemo={handleResetDemo}
            isDriftActive={isDriftActive}
            onToggleDrift={handleToggleDrift}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EcoVerse Hub • Centrally Moderated Registry of Externally Hosted Simulations</span>
          <span className="font-mono text-slate-600">DPDP Act 2023 Compliant • NEP 2020 Aligned</span>
        </div>
      </footer>
    </div>
  );
}
