/**
 * SimHub Component Library
 * Professional domain-driven barrel export
 */

// 1. Layout Components
export { Header, YouTubeHeader, Sidebar, YouTubeSidebar } from "./layout";
export type { HeaderProps, YouTubeHeaderProps, SidebarProps, YouTubeSidebarProps } from "./layout";

// 2. View Components
export {
  FeedView,
  YouTubeFeed,
  WatchView,
  SubscriptionsFeed,
  AdminQueue,
  GatesConsole,
  EducatorConsole,
  SimulationWorkbench,
} from "./views";
export type {
  FeedViewProps,
  YouTubeFeedProps,
  WatchViewProps,
  SubscriptionsFeedProps,
  AdminQueueProps,
  GatesConsoleProps,
  EducatorConsoleProps,
  SimulationWorkbenchProps,
} from "./views";

// 3. Modal Components
export {
  AuthModal,
  ProfileSetupModal,
  UploadModal,
  PoeModal,
  InterstitialModal,
} from "./modals";
export type {
  AuthModalProps,
  ProfileSetupModalProps,
  UploadModalProps,
  PoeModalProps,
  InterstitialModalProps,
} from "./modals";

// 4. Markdown Components
export { MarkdownRenderer, MarkdownEditor } from "./markdown";
export type { MarkdownRendererProps, MarkdownEditorProps } from "./markdown";

// 5. Community & Discussion Components
export { RedditCommentsSection } from "./comments";
export type { RedditCommentsSectionProps } from "./comments";
