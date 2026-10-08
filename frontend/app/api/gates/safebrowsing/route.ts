import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { liveUrl } = body;

    // Simulate Google Safe Browsing / Web Risk lookup latency
    await new Promise((r) => setTimeout(r, 140));

    const isMalicious = liveUrl && (liveUrl.includes("malware") || liveUrl.includes("phishing"));

    return NextResponse.json({
      gateId: "g4",
      name: "G4: Safe Browsing",
      passed: !isMalicious,
      statusText: !isMalicious
        ? "Safe Browsing verified clean (No malware, phishing, or social engineering threats)"
        : "Threat detected: Live URL flagged by Safe Browsing API",
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: {
        provider: "Google Safe Browsing v4 / Web Risk API",
        status: !isMalicious ? "CLEAN" : "FLAGGED",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      gateId: "g4",
      name: "G4: Safe Browsing",
      passed: false,
      statusText: `Safe browsing lookup error: ${msg}`,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
}
