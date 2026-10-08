import { NextRequest, NextResponse } from "next/server";
import { store, SimulationEntry } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    simulations: store.simulations,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl, liveUrl, title, description, topic, gradeLevel, license, observationPrompt } = body;

    const newSim: SimulationEntry = {
      id: `sim-${Date.now()}`,
      title: title || "Submitted Environmental Simulation",
      description: description || "Interactive open source environmental simulation",
      topic: topic || "Climate Science",
      gradeLevel: gradeLevel || "High School",
      repoUrl: repoUrl || "",
      liveUrl: liveUrl || "",
      authorLogin: "ecoteacher",
      authorNumericId: 9841234,
      repoNumericId: Math.floor(Math.random() * 80000000) + 10000000,
      license: license || "MIT",
      status: "pending",
      warnings: [],
      observationPrompt: observationPrompt || "Observe how variable changes affect model equilibrium.",
      reportsCount: 0,
      questions: [],
    };

    store.simulations.unshift(newSim);

    return NextResponse.json({
      success: true,
      simulation: newSim,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
