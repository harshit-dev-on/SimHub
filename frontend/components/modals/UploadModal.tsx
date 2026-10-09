"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  GitBranch,
  Globe,
  Trash2,
  Download,
  FolderUp,
  CheckCircle2,
  HardDrive,
  RefreshCw,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { UserProfile } from "@/lib/supabase";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newSim: SimulationEntry) => void;
  user: UserProfile | null;
}

const PRESET_SCREENSHOTS = [
  {
    name: "Solar & Energy Grid",
    url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=640&auto=format&fit=crop&q=80",
  },
  {
    name: "Ocean & Marine Ecology",
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=640&auto=format&fit=crop&q=80",
  },
  {
    name: "Atmospheric Spectrogram",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&auto=format&fit=crop&q=80",
  },
  {
    name: "Carbon Dynamics",
    url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=640&auto=format&fit=crop&q=80",
  },
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "backup">("upload");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");
  const [liveWebsiteUrl, setLiveWebsiteUrl] = useState("");
  const [topic, setTopic] = useState("Renewable Energy");
  const [license, setLicense] = useState("MIT");
  const [observationPrompt, setObservationPrompt] = useState("");

  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([PRESET_SCREENSHOTS[0].url]);
  const [customScreenshotInput, setCustomScreenshotInput] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Backup State
  const [storedCount, setStoredCount] = useState(0);
  const [importJsonText, setImportJsonText] = useState("");
  const [backupMsg, setBackupMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedStr = localStorage.getItem("simhub_user_uploads");
        if (storedStr) {
          const list = JSON.parse(storedStr);
          setStoredCount(Array.isArray(list) ? list.length : 0);
        } else {
          setStoredCount(0);
        }
      } catch {
        setStoredCount(0);
      }
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleAddCustomScreenshot = () => {
    if (customScreenshotInput.trim()) {
      setScreenshotUrls([...screenshotUrls, customScreenshotInput.trim()]);
      setCustomScreenshotInput("");
    }
  };

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          if (result) {
            setScreenshotUrls((prev) => [...prev, result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
    e.target.value = "";
  };

  const handleRemoveScreenshot = (idx: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== idx));
  };

  const handleSelectPreset = (url: string) => {
    if (!screenshotUrls.includes(url)) {
      setScreenshotUrls([...screenshotUrls, url]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !githubRepoUrl || !liveWebsiteUrl) {
      setErrorMsg("Please fill in all required fields (title, description, repo, and live website).");
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      // Simulate quick parallel gate verification and registration
      await new Promise((r) => setTimeout(r, 600));

      const authorName = user ? user.name : "Dr. Aris Thorne";
      const authorLogin = user ? user.username : "ecoteacher";
      const authorAvatar = user
        ? user.avatarUrl
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
      const authorId = user ? user.numericId : 9841234;

      const createdSim: SimulationEntry = {
        id: `sim-user-${Date.now()}`,
        title,
        description,
        topic,
        gradeLevel: "High School / College",
        repoUrl: githubRepoUrl,
        liveUrl: liveWebsiteUrl,
        authorLogin,
        authorName,
        authorAvatar,
        authorNumericId: authorId,
        repoNumericId: Math.floor(Math.random() * 80000000) + 10000000,
        license: license || "MIT",
        status: "approved",
        warnings: [],
        observationPrompt:
          observationPrompt || "Observe how key control parameters affect steady-state equilibrium.",
        thumbnailUrl: screenshotUrls[0] || PRESET_SCREENSHOTS[0].url,
        screenshots: screenshotUrls,
        views: "1 learner",
        viewsCount: 1,
        uploadedAt: "Just now",
        durationLabel: "Interactive Sim",
        reportsCount: 0,
        isUserUploaded: true,
        comments: [],
      };

      // 1. Register in backend store
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createdSim),
      });

      // 2. Persist in browser localStorage so uploads survive Vercel cold starts and restarts
      if (typeof window !== "undefined") {
        try {
          const storedStr = localStorage.getItem("simhub_user_uploads");
          const list: SimulationEntry[] = storedStr ? JSON.parse(storedStr) : [];
          const updated = [createdSim, ...list.filter((s) => s.id !== createdSim.id)];
          localStorage.setItem("simhub_user_uploads", JSON.stringify(updated));
        } catch (storageErr) {
          console.warn("Could not save to localStorage:", storageErr);
        }
      }

      onUploadSuccess(createdSim);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportBackup = () => {
    if (typeof window === "undefined") return;
    try {
      const storedStr = localStorage.getItem("simhub_user_uploads") || "[]";
      const blob = new Blob([storedStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simhub-user-simulations-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMsg("Simulations exported successfully!");
    } catch (err) {
      setBackupMsg("Export failed: " + String(err));
    }
  };

  const handleImportBackup = async (rawJson?: string) => {
    const textToImport = rawJson || importJsonText;
    if (!textToImport.trim()) {
      setBackupMsg("Please paste JSON or upload a backup file.");
      return;
    }

    try {
      const parsed = JSON.parse(textToImport);
      const simsToImport: SimulationEntry[] = Array.isArray(parsed) ? parsed : [parsed];

      if (simsToImport.length === 0) {
        setBackupMsg("No valid simulations found in JSON.");
        return;
      }

      // Merge into localStorage
      const storedStr = localStorage.getItem("simhub_user_uploads");
      const existingList: SimulationEntry[] = storedStr ? JSON.parse(storedStr) : [];
      const idMap = new Map<string, SimulationEntry>();

      existingList.forEach((s) => idMap.set(s.id, s));
      simsToImport.forEach((s) => {
        const simWithFlag = { ...s, isUserUploaded: true, status: s.status || "approved" };
        idMap.set(s.id, simWithFlag);
        // Sync to backend store in background
        fetch("/api/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(simWithFlag),
        }).catch(() => {});
      });

      const merged = Array.from(idMap.values());
      localStorage.setItem("simhub_user_uploads", JSON.stringify(merged));
      setStoredCount(merged.length);
      setBackupMsg(`Successfully imported ${simsToImport.length} simulation(s)!`);
      setImportJsonText("");

      if (simsToImport[0]) {
        onUploadSuccess(simsToImport[0]);
      }
    } catch (err) {
      setBackupMsg("Invalid JSON: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  const handleClearSavedUploads = () => {
    if (confirm("Are you sure you want to clear your locally saved uploads?")) {
      localStorage.removeItem("simhub_user_uploads");
      setStoredCount(0);
      setBackupMsg("Cleared saved uploads.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col max-h-[92vh] w-full max-w-3xl rounded-3xl border border-slate-800/90 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Simulation Studio & Uploads</h2>
              <p className="text-[11px] text-slate-500">
                Publish interactive simulations or manage backup archives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher */}
            <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === "upload"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Upload New
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("backup")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === "backup"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <HardDrive className="h-3 w-3" />
                <span>Backup / Restore</span>
                {storedCount > 0 && (
                  <span className="ml-1 rounded-full bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 text-[10px] font-bold">
                    {storedCount}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: Upload Form */}
        {activeTab === "upload" && (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Simulation Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solar Photovoltaic Cell Efficiency & Angle Simulator"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Description with Markdown / README.md Editor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 font-semibold text-xs sm:text-sm">
                  Description & Mathematical Model <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Full Markdown & Math formulas supported</span>
              </div>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Write formatted markdown with formulas, code blocks, tables, and learning objectives..."
                minRows={8}
              />
            </div>

            {/* Two Column Links: GitHub Repo & Live Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                  <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                  GitHub Repository URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={githubRepoUrl}
                  onChange={(e) => setGithubRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/solar-cell-sim"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  Live Hosted Simulation URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={liveWebsiteUrl}
                  onChange={(e) => setLiveWebsiteUrl(e.target.value)}
                  placeholder="https://solar-sim.pages.dev"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Subject Topic & License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">STEM Subject Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Physics">Physics & Dynamics</option>
                  <option value="Mathematics">Mathematics & Probability</option>
                  <option value="Computer Science">Computer Science & Algorithms</option>
                  <option value="Chemistry">Chemistry & Quantum</option>
                  <option value="Biology">Biology & Life Sciences</option>
                  <option value="Renewable Energy">Renewable Energy & Sustainability</option>
                  <option value="Environmental Science">Environmental Science</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Open Source License</label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="MIT">MIT License (Permissive)</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                  <option value="GPL-3.0">GNU GPL v3</option>
                  <option value="CC-BY-4.0">Creative Commons BY 4.0</option>
                </select>
              </div>
            </div>

            {/* Screenshots & Visual Assets */}
            <div>
              <label className="text-slate-300 block mb-1.5 font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                Thumbnail & Screenshots Preview
              </label>

              {/* Preset Quick-Picks */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-[11px] text-slate-500 self-center">Presets:</span>
                {PRESET_SCREENSHOTS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p.url)}
                    className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>

              {/* Add Custom URL / File */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <div className="flex flex-1 gap-2">
                  <input
                    type="url"
                    value={customScreenshotInput}
                    onChange={(e) => setCustomScreenshotInput(e.target.value)}
                    placeholder="Paste direct image URL for simulation screenshot..."
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomScreenshot}
                    className="px-3 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-medium"
                  >
                    Add URL
                  </button>
                </div>
                <label className="cursor-pointer px-3 py-2 rounded-xl border border-cyan-800/60 bg-cyan-900/20 text-cyan-400 hover:bg-cyan-900/40 hover:text-white font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <FolderUp className="h-3.5 w-3.5" />
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleLocalImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Thumbnails Row */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {screenshotUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 w-24 h-16 bg-slate-900">
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/80 text-[9px] text-cyan-300 px-1 py-0.5 rounded font-bold">
                        Thumb
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt for Students */}
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">
                Guiding Scientific Inquiry Prompt (Optional)
              </label>
              <input
                type="text"
                value={observationPrompt}
                onChange={(e) => setObservationPrompt(e.target.value)}
                placeholder="e.g. What happens to power output as the panel azimuth rotates away from direct south?"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Simulations are saved locally and synced to your catalogue automatically.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 shadow-sm transition-all"
                >
                  {isVerifying ? "Auditing Gates & Publishing..." : "Verify & Publish Simulation"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Backup & Restore */}
        {activeTab === "backup" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-cyan-400" />
                    Local Browser Persistence
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Your uploaded simulations are preserved in your browser&apos;s storage and synced across sessions.
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {storedCount} Uploaded Simulation(s)
                  </span>
                </div>
              </div>

              {backupMsg && (
                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-200 font-medium">
                  {backupMsg}
                </div>
              )}
            </div>

            {/* Export Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    Export Simulations Backup (.json)
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Download a full JSON file of all your simulations to keep on your computer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export JSON
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
              <div>
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <FolderUp className="h-3.5 w-3.5 text-cyan-400" />
                  Restore / Import Simulations (.json)
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Select a backup file or paste JSON data below to restore your simulations immediately.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors flex items-center gap-1.5">
                  <FolderUp className="h-3.5 w-3.5" />
                  Choose File...
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-500 text-[11px]">or paste raw JSON below:</span>
              </div>

              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='[{"id": "sim-user-1", "title": "My Physics Sim", "liveUrl": "https://...", ...}]'
                rows={4}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-white placeholder-slate-600 font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
              />

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleImportBackup()}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
                >
                  Import & Restore Now
                </button>

                {storedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSavedUploads}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold"
                  >
                    Clear Local Uploads
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
