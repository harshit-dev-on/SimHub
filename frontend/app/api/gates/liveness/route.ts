import { NextRequest, NextResponse } from "next/server";
import { hardenedFetch } from "@/lib/hardened-fetch";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { liveUrl } = body;
    const url = liveUrl || "http://localhost:3000/api/mock-sim/repo-b/";

    const res = await hardenedFetch(url);
    const latency = Date.now() - start;

    const xFrame = res.headers["x-frame-options"] || "";
    const csp = res.headers["content-security-policy"] || "";
    const framingDisallowed =
      xFrame.toUpperCase().includes("DENY") ||
      xFrame.toUpperCase().includes("SAMEORIGIN") ||
      csp.includes("frame-ancestors 'none'");

    const passed = res.ok && (res.status >= 200 && res.status < 300);

    return NextResponse.json({
      gateId: "g3",
      name: "G3: Liveness & Reachability",
      passed,
      statusText: passed
        ? `HTTP ${res.status} OK | ${res.bytes} bytes received | ${latency}ms`
        : `Liveness failed: ${res.error || `HTTP ${res.status}`}`,
      latencyMs: latency,
      timestamp: new Date().toISOString(),
      details: {
        statusCode: res.status,
        contentLength: res.bytes,
        framingDisallowed,
        warning: framingDisallowed ? "Framing disallowed by origin (fallback to sandboxed new tab)" : null,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      gateId: "g3",
      name: "G3: Liveness & Reachability",
      passed: false,
      statusText: `Liveness error: ${msg}`,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
}
