import { createClient, User as SupabaseAuthUser } from "@supabase/supabase-js";

// Read environment variables and sanitize URL (strip trailing /rest/v1 or slashes)
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("https://") &&
  !supabaseUrl.includes("mock-simhub")
);

// Fallback dummy URL so createClient doesn't throw on initialization if env vars are missing
const activeUrl = isLiveSupabaseConfigured ? supabaseUrl : "https://placeholder-simhub.supabase.co";
const activeKey = isLiveSupabaseConfigured ? supabaseAnonKey : "placeholder-anon-key";

export const supabase = createClient(activeUrl, activeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface UserProfile {
  id: string;
  numericId: number;
  email: string;
  name: string;
  username: string;
  avatarUrl: string;
  role: "educator" | "learner" | "admin";
  institution?: string;
}

/**
 * Transforms a real Supabase Auth user object into the SimHub UserProfile model
 */
export function mapSupabaseUserToProfile(sbUser: SupabaseAuthUser): UserProfile {
  const metadata = sbUser.user_metadata || {};
  const identity = sbUser.identities && sbUser.identities[0];

  // Try extracting numeric GitHub user ID if logged in via GitHub OAuth
  let numericId = 9841234;
  if (identity?.provider === "github" && identity?.id) {
    const parsed = parseInt(identity.id, 10);
    if (!isNaN(parsed)) numericId = parsed;
  } else if (metadata.custom_claims?.global_name) {
    numericId = Math.abs(sbUser.id.split("-").reduce((acc, part) => acc + (parseInt(part, 16) || 0), 0)) % 10000000;
  } else {
    // Generate a consistent numeric ID from the UUID for non-GitHub providers (Google, Email)
    const cleanId = Math.abs(sbUser.id.split("-").reduce((acc, part) => acc + (parseInt(part, 16) || 0), 0)) % 10000000;
    numericId = cleanId > 0 ? cleanId : 8492011;
  }

  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.user_name ||
    sbUser.email?.split("@")[0] ||
    "SimHub Educator";

  const username =
    metadata.user_name ||
    metadata.preferred_username ||
    sbUser.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "_") ||
    "user";

  const avatarUrl =
    metadata.avatar_url ||
    metadata.picture ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${sbUser.id}`;

  return {
    id: sbUser.id,
    numericId,
    email: sbUser.email || "user@simhub.edu",
    name,
    username,
    avatarUrl,
    role: "educator",
  };
}

export const DEMO_USERS: UserProfile[] = [
  {
    id: "usr-dr-thorne",
    numericId: 9841234,
    name: "Dr. Aris Thorne",
    username: "ecoteacher",
    email: "aris.thorne@delhi.ac.in",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "educator",
    institution: "Dept. of Environmental Science, University of Delhi",
  },
  {
    id: "usr-priya-sharma",
    numericId: 104523,
    name: "Priya Sharma",
    username: "priya_stem",
    email: "priya.learner@kv-school.edu.in",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "learner",
    institution: "Kendriya Vidyalaya, Sector 8",
  },
];
