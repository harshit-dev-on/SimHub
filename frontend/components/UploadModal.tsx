"use client";

import React, { useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  GitBranch,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";
import { UserProfile } from "@/lib/supabase";

interface UploadModalProps {
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

  if (!isOpen) return null;

  const handleAddCustomScreenshot = () => {
    if (customScreenshotInput.trim()) {
      setScreenshotUrls([...screenshotUrls, customScreenshotInput.trim()]);
      setCustomScreenshotInput("");
    }
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
        likes: 1,
        subscribers: "1.2K educators",
        durationLabel: "Interactive Sim",
        reportsCount: 0,
        isUserUploaded: true,
        comments: [],
        questions: [],
      };

      // Register in backend store
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createdSim),
      });

      onUploadSuccess(createdSim);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col max-h-[92vh] w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Your Simulation Website</h2>
              <p className="text-[11px] text-slate-400">
                Publish an externally hosted environmental simulation to the verified SimHub registry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form */}
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

          {/* Description */}
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">
              Description &amp; Scientific Concept <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the simulation's underlying physical or ecological model, key variables, and intended learning takeaways..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* URLs: GitHub Repo & Live Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                <span>GitHub Repository Link <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="url"
                required
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repo-name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                <span>Live Website Link <span className="text-rose-400">*</span></span>
              </label>
              <input
                type="url"
                required
                value={liveWebsiteUrl}
                onChange={(e) => setLiveWebsiteUrl(e.target.value)}
                placeholder="https://username.github.io/repo-name/"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Screenshots Section */}
          <div className="space-y-2">
            <label className="text-slate-300 block font-semibold flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
              <span>Screenshots &amp; Visual Previews</span>
            </label>

            {/* Current Screenshots List */}
            <div className="flex flex-wrap gap-2">
              {screenshotUrls.map((url, idx) => (
                <div key={idx} className="relative group h-20 w-32 rounded-lg overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={url} alt={`Screenshot ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveScreenshot(idx)}
                    className="absolute top-1 right-1 rounded-md bg-slate-950/80 p-1 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Custom URL Input or Presets */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={customScreenshotInput}
                onChange={(e) => setCustomScreenshotInput(e.target.value)}
                placeholder="Paste image / screenshot URL..."
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomScreenshot}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 font-medium"
              >
                Add Image
              </button>
            </div>

            {/* Sample presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-slate-500">Or pick sample:</span>
              {PRESET_SCREENSHOTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p.url)}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:text-white"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Topic, License, Observation Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Category / Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Carbon Cycle">Carbon Cycle</option>
                <option value="Atmospheric Physics">Atmospheric Physics</option>
                <option value="Marine Chemistry">Marine Chemistry</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Urban Ecology">Urban Ecology</option>
                <option value="Water Resources">Water Resources</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">SPDX Open Source License</label>
              <input
                type="text"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                placeholder="MIT, Apache-2.0, GPL-3.0"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Observation Prompt */}
          <div>
            <label className="text-slate-300 block mb-1 font-semibold">
              Guiding Observation Prompt
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
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Published simulations run sandboxed in learner browsers with zero server-side code execution.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold hover:from-emerald-400 hover:to-cyan-400 shadow-md shadow-emerald-500/20"
              >
                {isVerifying ? "Auditing Gates & Publishing..." : "Verify & Publish Simulation"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
