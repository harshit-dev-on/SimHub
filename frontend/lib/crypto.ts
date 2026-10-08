import crypto from "crypto";

const SERVER_SECRET = process.env.ECOVERSE_SERVER_SECRET || "ecoverse-hackathon-hmac-secret-key-2026";

/**
 * Normalizes live URL according to EcoVerse specifications:
 * - Trims query parameters and hashes
 * - Strips index.html / index.htm
 * - Ensures canonical format for deterministic HMAC binding
 */
export function normalizeLiveUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    let pathname = parsed.pathname.replace(/\/index\.html?$/i, "");
    if (!pathname.endsWith("/") && !pathname.includes(".")) {
      pathname = pathname + "/";
    }
    return `${parsed.protocol}//${parsed.host}${pathname}`;
  } catch {
    return rawUrl.trim().toLowerCase();
  }
}

/**
 * Derives a stateless, public binding token:
 * HMAC(server_secret, github_user_id | repo_id | normalized_live_url)
 * Prefix with key version 'v1:'
 */
export function deriveBindingToken(
  githubUserId: string | number,
  repoId: string | number,
  normalizedLiveUrl: string
): string {
  const payload = `${githubUserId}|${repoId}|${normalizedLiveUrl}`;
  const hmac = crypto.createHmac("sha256", SERVER_SECRET);
  hmac.update(payload);
  return `v1:${hmac.digest("hex").substring(0, 32)}`;
}

/**
 * Computes SHA-256 hash of inert bytes (HTML or scripts)
 */
export function sha256(content: string | Buffer): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
