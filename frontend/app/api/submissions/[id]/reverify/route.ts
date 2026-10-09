import { NextRequest, NextResponse } from "next/server";
import { store, GateResult } from "@/lib/store";
import { syncLoadStore, syncSaveStore } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    syncLoadStore();
    const { id } = await context.params;
    const sim = store.getSimulation(id);

    if (!sim) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    const origin = req.nextUrl.origin;

    // Run all 6 gates in parallel
    const [resG1, resG2, resG3, resG4, resG5, resG6] = await Promise.all([
      fetch(`${origin}/api/gates/ownership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: sim.repoUrl, claimedUserId: sim.authorNumericId }),
      }).then((r) => r.json()),
      fetch(`${origin}/api/gates/linkage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl: sim.repoUrl,
          liveUrl: sim.liveUrl,
          claimedUserId: sim.authorNumericId,
          repoId: sim.repoNumericId,
        }),
      }).then((r) => r.json()),
      fetch(`${origin}/api/gates/liveness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl: sim.liveUrl }),
      }).then((r) => r.json()),
      fetch(`${origin}/api/gates/safebrowsing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl: sim.liveUrl }),
      }).then((r) => r.json()),
      fetch(`${origin}/api/gates/license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ license: sim.license }),
      }).then((r) => r.json()),
      fetch(`${origin}/api/gates/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveUrl: sim.liveUrl }),
      }).then((r) => r.json()),
    ]);

    const gates: GateResult[] = [resG1, resG2, resG3, resG4, resG5, resG6];
    sim.gates = gates;

    // Evaluate hard failures
    const failedGate = gates.find((g) => !g.passed);

    if (failedGate) {
      // Auto-restrict on hard-fail (e.g. tracker domain found or token missing)
      sim.status = "restricted";
      sim.statusReason = `Drift Hard-Fail: ${failedGate.name} failed (${failedGate.statusText})`;
      syncSaveStore();
      return NextResponse.json({
        outcome: "auto_restricted",
        reason: sim.statusReason,
        simulation: sim,
        gates,
      });
    }

    // Evaluate soft drift (hash change while passing)
    const newHtmlSha = resG6.details?.htmlSha as string;
    const newScriptsSha = (resG6.details?.scriptsSha as Record<string, string>) || {};

    let contentChanged = false;
    if (sim.fingerprint) {
      if (sim.fingerprint.htmlSha !== newHtmlSha) contentChanged = true;
      for (const [url, sha] of Object.entries(newScriptsSha)) {
        if (sim.fingerprint.scriptsSha[url] && sim.fingerprint.scriptsSha[url] !== sha) {
          contentChanged = true;
        }
      }
    }

    if (contentChanged) {
      sim.status = "drift_flagged";
      sim.statusReason = "Content modified: Entry script or HTML hash differs from approved fingerprint";
      syncSaveStore();
      return NextResponse.json({
        outcome: "re_queued",
        reason: sim.statusReason,
        simulation: sim,
        gates,
      });
    }

    sim.status = "approved";
    sim.statusReason = "Re-verified: All 6 gates passed and cryptographic fingerprint matches approved baseline.";

    syncSaveStore();
    return NextResponse.json({
      outcome: "clean",
      reason: sim.statusReason,
      simulation: sim,
      gates,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
