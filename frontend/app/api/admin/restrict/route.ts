import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { id, reason } = await req.json();
    const sim = store.getSimulation(id);

    if (!sim) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    sim.status = "restricted";
    sim.statusReason = reason || "Restricted by Administrator";

    return NextResponse.json({
      success: true,
      simulation: sim,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
