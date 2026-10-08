# SimHub 🚀
### Verified Interactive STEM Simulation Registry & Inquiry Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Database-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)

SimHub is a modern, YouTube-style web application for discovering, testing, running, and reviewing verified interactive STEM simulations. Simulations execute inside client-isolated security sandboxes with zero server-side code execution risks.

---

## 🏗️ Architecture & Project Structure

The project is structured following clean domain-driven design principles with modular barrel exports:

```text
SimHub/
├── backend/
│   └── scripts/
│       └── corpus_scanner.js         # Security and static corpus analysis scripts
│
├── frontend/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── api/                      # REST API Endpoints
│   │   │   ├── admin/                # Moderation (approve, restrict, audit)
│   │   │   ├── demo/                 # Stage demonstration harnesses
│   │   │   ├── gates/                # 6 Hard Security Verification Gates
│   │   │   ├── mock-sim/             # Sandboxed testbed simulations
│   │   │   ├── quiz/                 # POE (Predict-Observe-Explain) engine
│   │   │   ├── simulations/          # Simulation registry, voting & comments
│   │   │   ├── submissions/          # Creator submission intake
│   │   │   └── users/                # User subscriptions and profiles
│   │   ├── auth/                     # OAuth redirect callback handler
│   │   ├── globals.css               # Core styling tokens & theme system
│   │   ├── layout.tsx                # App root layout with font configuration
│   │   └── page.tsx                  # Primary single-page shell orchestrator
│   │
│   ├── components/                   # Domain-Organized Component Architecture
│   │   ├── comments/                 # Community & Discussion System
│   │   │   ├── RedditCommentsSection.tsx  # Threaded discussions, upvotes, OP badges
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   ├── layout/                   # Global Shell Layout
│   │   │   ├── Header.tsx            # Global header, search, auth buttons, voice
│   │   │   ├── Sidebar.tsx           # Category navigation & subscriptions drawer
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   ├── markdown/                 # Markdown / README.md Engine
│   │   │   ├── MarkdownEditor.tsx    # Live split-view GFM markdown editor
│   │   │   ├── MarkdownRenderer.tsx  # High-performance zero-dependency GFM parser
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   ├── modals/                   # Dialogs & Overlays
│   │   │   ├── AuthModal.tsx         # Supabase & GitHub OAuth authentication
│   │   │   ├── InterstitialModal.tsx # Sandboxing & security gate disclosure
│   │   │   ├── PoeModal.tsx          # 3-step POE learning challenge loop
│   │   │   ├── ProfileSetupModal.tsx # Nickname, handle, & AI avatar gallery
│   │   │   ├── UploadModal.tsx       # Creator upload flow with README markdown
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   ├── views/                    # Main Application Views
│   │   │   ├── AdminQueue.tsx        # Moderation, 1-tap approve, drift auditing
│   │   │   ├── FeedView.tsx          # Video catalogue & category discovery rows
│   │   │   ├── GatesConsole.tsx      # Parallel 6-gate verification testbed
│   │   │   ├── SimulationWorkbench.tsx # Full simulation stage with POE challenge
│   │   │   ├── SubscriptionsFeed.tsx # Channel subscription feeds & creator directory
│   │   │   ├── WatchView.tsx         # Main player stage with comments & README
│   │   │   └── index.ts              # Barrel export
│   │   │
│   │   └── index.ts                  # Root Component Barrel Export
│   │
│   ├── lib/                          # Core Utilities & Backend Store
│   │   ├── crypto.ts                 # HMAC-SHA256 and cryptographic verification
│   │   ├── hardened-fetch.ts         # Secure HTTP client with timeouts & redirects
│   │   ├── store.ts                  # In-memory registry with mock simulations
│   │   ├── supabase.ts               # Supabase Auth client & demo account profiles
│   │   └── trackers.ts               # Disconnect-list tracker signature detection
│   │
│   ├── types/                        # Centralized TypeScript Domain Types
│   │   └── index.ts                  # UserProfile, SimulationEntry, PoeQuestion, etc.
│   │
│   └── public/                       # Static public assets and avatars
│
├── plan.txt                          # Verification protocol and product requirements
└── README.md                         # Project documentation
```

---

## 🔑 Key Features

### 1. 6 Hard Security Verification Gates
SimHub does not execute arbitrary creator code on the server. Instead, publishers provide an external live URL that passes 6 automated gates:
1. **G1: Ownership Verification** – Validates publisher credentials using GitHub numeric IDs.
2. **G2: Linkage Verification** – Stateless HMAC-SHA256 challenge token embedded in the repository.
3. **G3: Liveness & Performance** – Validates HTTPS status, response latency, and size caps.
4. **G4: Google Safe Browsing Clean** – Asserts that the target domain is clean of malware/phishing.
5. **G5: SPDX License** – Requires an OSI-approved open source license (MIT, Apache-2.0, BSD).
6. **G6: Static Tracker Scan** – Scans external code for surveillance trackers via the Disconnect list.

### 2. Predict-Observe-Explain (POE) Learning Loop
An embedded pedagogical framework that guides learners to:
- **Predict**: Record their initial hypothesis before seeing the dynamic system.
- **Observe**: Interact with the simulation in a sandboxed iframe.
- **Explain**: Re-evaluate understanding, detect cognitive misconceptions, and unlock the **"Mind Changed"** badge.

### 3. Reddit-Style Threaded Discussions
- Recursive nested comments with Reddit-style indentation lines.
- Real-time upvoting and downvoting with server-synced scores.
- Creator OP badges and author attribution.

### 4. Interactive GitHub Markdown (.md / README) System
- Simulation descriptions render full GitHub Flavored Markdown (headings, code blocks, tables, task lists, blockquotes).
- Upload flow includes a live split-screen Markdown editor with real-time formatting preview.

### 5. Role-Based Permissions (User vs. Admin)
- **Standard Users**: Can create simulations, upload README documentation, test gate compliance, interact with sandboxes, vote, and participate in discussions.
- **Administrators**: Gain access to the moderator queue to review incoming submissions, lock cryptographic SHA-256 fingerprints, trigger drift re-verifications, and restrict flagged content.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in your Supabase project credentials (optional; SimHub will automatically fall back to resilient local demo users if Supabase keys are not present):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI & State**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / Authentication**: [Supabase](https://supabase.com/) with Local Fallback Mock Store
