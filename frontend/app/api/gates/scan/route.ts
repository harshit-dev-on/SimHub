import { NextRequest, NextResponse } from "next/server";
import { hardenedFetch } from "@/lib/hardened-fetch";
import { scanContentForTrackers } from "@/lib/trackers";
import { sha256 } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { liveUrl } = body;
    const url = liveUrl || "http://localhost:3000/api/mock-sim/repo-b/";

    // 1. Fetch entry HTML as inert bytes
    const htmlFetch = await hardenedFetch(url);
    if (!htmlFetch.ok) {
      return NextResponse.json({
        gateId: "g6",
        name: "G6: Static Tracker Scan",
        passed: false,
        statusText: `Cannot scan: Failed to fetch entry HTML (${htmlFetch.error || htmlFetch.status})`,
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Discover same-origin scripts referenced by HTML
    const scriptsToScan: { url: string; content: string; size: number; oversized?: boolean; sha: string }[] = [];
    const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
    let match;
    const baseOrigin = new URL(url).origin;

    while ((match = scriptRegex.exec(htmlFetch.data)) !== null) {
      const src = match[1];
      if (!src.startsWith("http://") && !src.startsWith("https://") && !src.startsWith("//")) {
        // Resolve relative URL
        const scriptUrl = new URL(src, url).toString();
        const scriptFetch = await hardenedFetch(scriptUrl);
        if (scriptFetch.ok) {
          scriptsToScan.push({
            url: scriptUrl,
            content: scriptFetch.data,
            size: scriptFetch.bytes,
            sha: sha256(scriptFetch.data),
          });
        }
      }
    }

    // 3. Scan with Disconnect & EasyPrivacy pinned list
    const scanResult = scanContentForTrackers(htmlFetch.data, scriptsToScan);

    const scriptHashes: Record<string, string> = {};
    scriptsToScan.forEach((s) => {
      scriptHashes[s.url] = s.sha;
    });

    const statusText = scanResult.passed
      ? `Clean static scan: No ad/tracking hostnames detected. (${scanResult.coverageLabel})`
      : `Blocked: Found ${scanResult.detectedTrackers.length} tracker/ad domain(s) [${scanResult.detectedTrackers
          .map((t) => t.domain)
          .join(", ")}]`;

    return NextResponse.json({
      gateId: "g6",
      name: "G6: Static Tracker Scan",
      passed: scanResult.passed,
      statusText,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: {
        detectedTrackers: scanResult.detectedTrackers,
        coverageLabel: scanResult.coverageLabel,
        htmlSha: sha256(htmlFetch.data),
        scriptsSha: scriptHashes,
        scannedCount: scanResult.scannedScriptsCount,
        disclaimer:
          "Static scan of entry HTML & same-origin scripts against pinned Disconnect list. Does not cover runtime dynamically injected trackers.",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      gateId: "g6",
      name: "G6: Static Tracker Scan",
      passed: false,
      statusText: `Scan error: ${msg}`,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
}
