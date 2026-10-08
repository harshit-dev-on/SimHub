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
    const {
      repoUrl,
      liveUrl,
      title,
      description,
      topic,
      gradeLevel,
      license,
      observationPrompt,
      authorName,
      authorAvatar,
      authorLogin,
      thumbnailUrl,
      screenshots,
      durationLabel,
    } = body;

    const newSim: SimulationEntry = {
      id: `sim-${Date.now()}`,
      title: title || "Submitted Environmental Simulation",
      description: description || "Interactive open source environmental simulation",
      topic: topic || "Climate Science",
      gradeLevel: gradeLevel || "High School",
      repoUrl: repoUrl || "",
      liveUrl: liveUrl || "",
      authorLogin: authorLogin || "ecoteacher",
      authorName: authorName || "Eco Educator",
      authorAvatar: authorAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      authorNumericId: 9841234,
      repoNumericId: Math.floor(Math.random() * 80000000) + 10000000,
      license: license || "MIT",
      status: "pending",
      warnings: [],
      observationPrompt: observationPrompt || "Observe how variable changes affect model equilibrium.",
      thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      screenshots: screenshots || [],
      views: "0 views",
      viewsCount: 0,
      uploadedAt: "Just now",
      durationLabel: durationLabel || "Interactive Sim",
      reportsCount: 0,
      questions: [],
      comments: [],
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
