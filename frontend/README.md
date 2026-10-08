# SimHub Frontend

The client application for the SimHub STEM simulation platform, built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS v4**, and **TypeScript**.

## Folder Structure

```text
frontend/
├── app/                  # Next.js App Router (pages & API routes)
│   ├── api/              # Backend endpoints (gates, simulations, quiz, admin)
│   ├── layout.tsx        # Global HTML root layout
│   └── page.tsx          # Main interactive interface
├── components/           # Domain-driven modular components
│   ├── comments/         # Reddit-style threaded comments & voting
│   ├── layout/           # Header, Sidebar, and navigation drawers
│   ├── markdown/         # Live Markdown editor & zero-dependency GFM renderer
│   ├── modals/           # Auth, Profile Setup, Upload, POE Loop, Interstitial
│   ├── views/            # Feed, Watch, Subscriptions, Admin Queue, Gates Console
│   └── index.ts          # Central barrel export
├── lib/                  # Utilities, Supabase client, and in-memory store
├── types/                # Shared TypeScript definitions
└── public/               # Static assets & icons
```

## Importing Components

All components are cleanly exported from `@/components` via barrel exports:

```typescript
// From central barrel
import {
  Header,
  Sidebar,
  FeedView,
  WatchView,
  AuthModal,
  UploadModal,
  MarkdownEditor,
} from "@/components";

// Or from specific domains
import { Header } from "@/components/layout";
import { FeedView, WatchView } from "@/components/views";
import { AuthModal, UploadModal } from "@/components/modals";
import { MarkdownEditor, MarkdownRenderer } from "@/components/markdown";
import { RedditCommentsSection } from "@/components/comments";
```

## Scripts

- `npm run dev`: Starts development server on `http://localhost:3000`
- `npm run build`: Builds the production bundle
- `npm run start`: Runs production server
- `npx tsc --noEmit`: Typecheck the codebase
