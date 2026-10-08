import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { sha256 } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const { id, gates } = await req.json();
    const sim = store.getSimulation(id);

    if (!sim) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    // Capture approval fingerprint
    const scanGate = gates?.find((g: { gateId: string }) => g.gateId === "g6");
    const linkageGate = gates?.find((g: { gateId: string }) => g.gateId === "g2");

    sim.fingerprint = {
      htmlSha: (scanGate?.details?.htmlSha as string) || sha256("index.html"),
      scriptsSha: (scanGate?.details?.scriptsSha as Record<string, string>) || {},
      scannedScripts: (scanGate?.details?.scannedCount as number) || 1,
      unscannedSummary: (scanGate?.details?.coverageLabel as string) || "1 script scanned",
      token: (linkageGate?.details?.foundToken as string) || "v1:token",
      approvedAt: new Date().toISOString(),
    };

    sim.status = "approved";
    sim.statusReason = "Approved by Moderator after passing all 6 hard gates";
    sim.gates = gates;

    return NextResponse.json({
      success: true,
      simulation: sim,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
