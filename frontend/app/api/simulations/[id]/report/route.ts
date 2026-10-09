import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
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

    sim.reportsCount += 1;
    sim.status = "restricted";
    sim.statusReason = "Auto-restricted pending review: Learner report filed (fails closed)";

    syncSaveStore();
    return NextResponse.json({
      success: true,
      message: "Simulation auto-restricted from public search pending administrative review.",
      reportsCount: sim.reportsCount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
