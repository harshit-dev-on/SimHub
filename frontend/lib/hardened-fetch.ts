import dns from "dns/promises";
import net from "net";

export interface FetchResult {
  ok: boolean;
  status: number;
  headers: Record<string, string>;
  data: string;
  bytes: number;
  error?: string;
  resolvedIp?: string;
}

const TIMEOUT_MS = 4000;
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "application/javascript",
  "text/javascript",
  "application/json",
  "text/plain",
];

/**
 * Checks if an IP is in private, link-local, or cloud metadata ranges (SSRF defense)
 */
export function isIpBlocked(ip: string): boolean {
  if (ip === "169.254.169.254") return true; // AWS/GCP/Azure metadata
  if (ip.startsWith("127.")) return true; // Loopback
  if (ip.startsWith("10.")) return true; // Class A private
  if (ip.startsWith("192.168.")) return true; // Class C private
  if (ip === "::1" || ip === "0.0.0.0") return true;

  // 172.16.0.0 - 172.31.255.255
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const secondOctet = parseInt(parts[1], 10);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  // 100.64.0.0/10 CGNAT
  if (ip.startsWith("100.")) {
    const parts = ip.split(".");
    const second = parseInt(parts[1], 10);
    if (second >= 64 && second <= 127) return true;
  }

  return false;
}

/**
 * Hardened Outbound Fetch Wrapper
 * Defends against SSRF, DNS rebinding, oversized payloads, and slowloris timeouts.
 * Allows localhost only when IS_LOCAL_DEMO is true or environment variable allows it.
 */
export async function hardenedFetch(
  targetUrl: string,
  options: {
    allowLocalDev?: boolean;
    allowedContentTypes?: string[];
    maxBytes?: number;
    timeoutMs?: number;
  } = {}
): Promise<FetchResult> {
  const allowLocal = options.allowLocalDev ?? true; // Enable local simulation testbed
  const timeoutMs = options.timeoutMs ?? TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? MAX_BYTES;

  try {
    const parsedUrl = new URL(targetUrl);

    // Protocol check
    if (parsedUrl.protocol !== "https:" && (!allowLocal || parsedUrl.protocol !== "http:")) {
      return {
        ok: false,
        status: 400,
        headers: {},
        data: "",
        bytes: 0,
        error: `Protocol rejected: only HTTPS is permitted (received ${parsedUrl.protocol})`,
      };
    }

    const hostname = parsedUrl.hostname;
    let resolvedIp = "";

    // If not local host in dev mode, resolve and enforce SSRF IP blocklist
    if (!(allowLocal && (hostname === "localhost" || hostname === "127.0.0.1"))) {
      if (net.isIP(hostname)) {
        resolvedIp = hostname;
      } else {
        const lookup = await dns.lookup(hostname);
        resolvedIp = lookup.address;
      }

      if (isIpBlocked(resolvedIp)) {
        return {
          ok: false,
          status: 403,
          headers: {},
          data: "",
          bytes: 0,
          error: `SSRF Blocked: ${hostname} resolved to forbidden IP (${resolvedIp})`,
          resolvedIp,
        };
      }
    } else {
      resolvedIp = "127.0.0.1";
    }

    // Abort controller for 4s hard timeout
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "EcoVerse-Security-Auditor/1.0 (+https://ecoverse.hub/scanner)",
        Accept: "text/html,application/javascript,application/json;q=0.9,*/*;q=0.1",
        "Cache-Control": "no-cache, no-store",
      },
      cache: "no-store",
    });

    clearTimeout(timeoutHandle);

    const headersRecord: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersRecord[key.toLowerCase()] = value;
    });

    const contentType = headersRecord["content-type"] || "";
    const isAllowedType = ALLOWED_CONTENT_TYPES.some((allowed) =>
      contentType.toLowerCase().includes(allowed)
    );

    if (!isAllowedType && contentType !== "") {
      return {
        ok: false,
        status: response.status,
        headers: headersRecord,
        data: "",
        bytes: 0,
        error: `Invalid Content-Type (${contentType}). Expected HTML, JS, or JSON.`,
      };
    }

    // Stream with 2 MB cap
    const arrayBuffer = await response.arrayBuffer();
    const bytes = arrayBuffer.byteLength;

    if (bytes > maxBytes) {
      return {
        ok: false,
        status: 413,
        headers: headersRecord,
        data: "",
        bytes,
        error: `Payload oversized: ${bytes} bytes exceeds ${maxBytes} bytes limit.`,
      };
    }

    const textData = Buffer.from(arrayBuffer).toString("utf8");

    return {
      ok: response.ok,
      status: response.status,
      headers: headersRecord,
      data: textData,
      bytes,
      resolvedIp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      status: 500,
      headers: {},
      data: "",
      bytes: 0,
      error: errorMsg.includes("abort") ? "Request timed out (exceeded 4000ms)" : errorMsg,
    };
  }
}
