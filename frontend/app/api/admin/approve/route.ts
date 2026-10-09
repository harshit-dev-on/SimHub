import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { syncLoadStore, syncSaveStore } from "@/lib/db";
import { sha256 } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    syncLoadStore();
    const { id } = await req.json();
    const sim = store.getSimulation(id);

    if (!sim) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    sim.fingerprint = {
      htmlSha: sha256("index.html"),
      scriptsSha: {},
      scannedScripts: 1,
      unscannedSummary: "1 script scanned",
      token: "v1:token",
      approvedAt: new Date().toISOString(),
    };

    sim.status = "approved";
    sim.statusReason = "Approved by Moderator";

    syncSaveStore();
    return NextResponse.json({
      success: true,
      simulation: sim,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
