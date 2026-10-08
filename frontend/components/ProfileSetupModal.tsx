"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Check,
  User,
  Shuffle,
  Camera,
  ShieldCheck,
  GraduationCap,
  Atom,
  Flame,
  Globe2,
} from "lucide-react";
import { UserProfile, supabase, isLiveSupabaseConfigured } from "@/lib/supabase";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  isFirstTime?: boolean;
}

// Curated avatar presets with thematic styles
const PRESET_AVATARS = [
  {
    category: "Scientists & Researchers",
    items: [
      { id: "sci-1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", label: "Dr. Thorne" },
      { id: "sci-2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80", label: "Priya" },
      { id: "sci-3", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", label: "Alex" },
      { id: "sci-4", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", label: "Elena" },
    ],
  },
  {
    category: "Eco Bots & AI Explorers",
    items: [
      { id: "bot-1", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TerraBot&backgroundColor=0284c7", label: "TerraBot" },
      { id: "bot-2", url: "https://api.dicebear.com/7.x/bottts/svg?seed=Solaris&backgroundColor=16a34a", label: "Solaris" },
      { id: "bot-3", url: "https://api.dicebear.com/7.x/bottts/svg?seed=QuantumGreen&backgroundColor=d97706", label: "Quantum" },
      { id: "bot-4", url: "https://api.dicebear.com/7.x/bottts/svg?seed=AtmoSphere&backgroundColor=7c3aed", label: "Atmo" },
    ],
  },
  {
    category: "Illustrated Pioneers",
    items: [
      { id: "art-1", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=MayaGreen&backgroundColor=bbf7d0", label: "Maya" },
      { id: "art-2", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=LeoClimate&backgroundColor=fed7aa", label: "Leo" },
      { id: "art-3", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=ZaraOcean&backgroundColor=bae6fd", label: "Zara" },
      { id: "art-4", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanEarth&backgroundColor=e9d5ff", label: "Rohan" },
    ],
  },
];

const SUGGESTED_NAMES = [
  "EcoExplorer",
  "TerraLab",
  "ClimatePioneer",
  "GreenMind",
  "SolarCraft",
  "BioSphereEDU",
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  isFirstTime = false,
}) => {
  const [name, setName] = useState(user?.name || "EcoExplorer");
  const [username, setUsername] = useState(user?.username || "eco_explorer");
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=TerraBot&backgroundColor=0284c7"
  );
  const role = user?.role === "admin" ? "admin" : "user";
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync initial values when user changes
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.username) setUsername(user.username);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  if (!isOpen) return null;

  // Handle Nickname change and auto-generate handle if untouched
  const handleNameChange = (val: string) => {
    setName(val);
    const cleanHandle = val.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
    setUsername(cleanHandle);
  };

  // Generate a random avatar seed
  const handleRandomizeAvatar = () => {
    const randomSeeds = ["Gaia", "Titan", "Photon", "Aura", "Prism", "Echo", "Verde", "Zephyr", "Nova"];
    const seed = randomSeeds[Math.floor(Math.random() * randomSeeds.length)] + Math.floor(Math.random() * 1000);
    const styles = ["bottts", "lorelei", "adventurer", "personas"];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const newAvatar = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
    setAvatarUrl(newAvatar);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const trimmedName = name.trim() || "SimHub Contributor";
      const trimmedUsername = username.trim() || "user";
      const cleanAvatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmedUsername}`;

      const updatedProfile: UserProfile = {
        id: user?.id || `usr-${Date.now()}`,
        numericId: user?.numericId || Math.floor(Math.random() * 8000000) + 1000000,
        email: user?.email || `${trimmedUsername}@simhub.edu`,
        name: trimmedName,
        username: trimmedUsername,
        avatarUrl: cleanAvatar,
        role,
        institution: user?.institution || "SimHub STEM Community",
      };

      // If connected to Supabase Cloud, update user metadata
      if (isLiveSupabaseConfigured) {
        try {
          await supabase.auth.updateUser({
            data: {
              name: trimmedName,
              full_name: trimmedName,
              preferred_username: trimmedUsername,
              avatar_url: cleanAvatar,
              role,
            },
          });
        } catch (supabaseErr) {
          console.warn("Could not sync metadata to Supabase Cloud:", supabaseErr);
        }
      }

      // Mark profile as customized in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("simhub_profile_customized", "true");
        localStorage.setItem("simhub_user", JSON.stringify(updatedProfile));
      }

      onSaveProfile(updatedProfile);
      onClose();
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800/90 bg-slate-950 p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>{isFirstTime ? "First Time Setup" : "Profile Customization"}</span>
          </div>
          <h2 className="text-xl font-bold text-white pt-1">
            {isFirstTime ? "Welcome to SimHub! Set Up Your Profile" : "Edit Nickname & Avatar"}
          </h2>
          <p className="text-xs text-slate-500">
            Pick your display nickname and avatar to represent your simulations &amp; feedback
          </p>
        </div>

        {/* Live Profile Card Preview */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-r from-rose-200/50 via-amber-200/30 to-blue-200/40"></div>
          <div className="relative pt-3 flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={name}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-slate-800 bg-slate-950 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold">
                ✓
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white truncate">{name || "Your Display Name"}</span>
                <span className="rounded-full bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold text-slate-300 uppercase">
                  SIMHUB
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">@{username || "handle"}</div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="capitalize text-blue-400 font-medium">● {role}</span>
                <span>•</span>
                <span>Verified Learner</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Nickname / Display Name Input */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Channel Nickname / Display Name</span>
              <span className="text-slate-500 font-normal">Displayed on comments &amp; sims</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Dr. Aris Thorne, EcoExplorer, TerraLab"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-white focus:border-cyan-500 focus:outline-none text-sm"
            />

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-500">Quick ideas:</span>
              {SUGGESTED_NAMES.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => handleNameChange(sug)}
                  className="rounded-full border border-slate-800 bg-slate-950 px-2.5 py-0.5 text-[10px] text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Username / Handle */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-semibold">Channel Handle</label>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 focus-within:border-cyan-500">
              <span className="text-slate-500 font-mono text-sm mr-1">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="eco_creator"
                className="w-full bg-transparent text-white font-mono text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar Gallery Selection */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Choose Your Avatar</label>
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Shuffle className="h-3 w-3 text-cyan-400" />
                <span>Randomize AI Avatar</span>
              </button>
            </div>

            {/* Avatar Preset Grid */}
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-3">
              {PRESET_AVATARS.map((grp) => (
                <div key={grp.category} className="space-y-1.5">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    {grp.category}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {grp.items.map((item) => {
                      const isSelected = avatarUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAvatarUrl(item.url)}
                          className={`relative flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/20 scale-105"
                              : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.label}
                            className="h-10 w-10 rounded-full object-cover shadow-sm bg-slate-950"
                          />
                          <span className="text-[10px] text-slate-300 mt-1 truncate max-w-full">
                            {item.label}
                          </span>
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Custom Image URL option */}
              <div className="pt-1 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCustomUrl(!showCustomUrl)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" />
                  <span>{showCustomUrl ? "Hide custom image link" : "Or use your own image URL"}</span>
                </button>

                {showCustomUrl && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://example.com/my-photo.jpg"
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customUrlInput.trim()) {
                          setAvatarUrl(customUrlInput.trim());
                        }
                      }}
                      className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white hover:bg-slate-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Role Display */}
          <div className="space-y-1.5 text-xs">
            <label className="text-slate-300 font-semibold">Account Role</label>
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`h-4 w-4 shrink-0 ${role === "admin" ? "text-amber-400" : "text-emerald-400"}`} />
                <div>
                  <div className="font-semibold text-white">
                    {role === "admin" ? "Platform Administrator" : "Standard Platform User"}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {role === "admin"
                      ? "Full moderator queue & gate management privileges"
                      : "Can build, test, upload, play simulations & join discussions"}
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                role === "admin"
                  ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                  : "bg-emerald-400/10 text-emerald-300 border-emerald-400/30"
              }`}>
                {role}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-200 shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>{saving ? "Saving Profile..." : "Save Profile & Enter SimHub"}</span>
            </button>

            {isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 text-xs transition-colors"
              >
                Skip for Now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
