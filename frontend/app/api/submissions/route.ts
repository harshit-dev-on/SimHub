import { NextRequest, NextResponse } from "next/server";
import { store, SimulationEntry } from "@/lib/store";
import { syncLoadStore, syncSaveStore } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    syncLoadStore();
  } catch {
    // Ignore in edge / serverless
  }

  return NextResponse.json({
    simulations: store.simulations,
  });
}

export async function POST(req: NextRequest) {
  try {
    syncLoadStore();
    const body = await req.json();
    const {
      id,
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
      status,
    } = body;

    const simId = id || `sim-user-${Date.now()}`;
    const newSim: SimulationEntry = {
      id: simId,
      title: title || "Submitted Environmental Simulation",
      description: description || "Interactive open source STEM simulation",
      topic: topic || "Physics",
      gradeLevel: gradeLevel || "High School / College",
      repoUrl: repoUrl || "",
      liveUrl: liveUrl || "",
      authorLogin: authorLogin || "creator",
      authorName: authorName || "Community Contributor",
      authorAvatar:
        authorAvatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      authorNumericId: body.authorNumericId || 9841234,
      repoNumericId: body.repoNumericId || Math.floor(Math.random() * 80000000) + 10000000,
      license: license || "MIT",
      status: status || "approved",
      warnings: body.warnings || [],
      observationPrompt:
        observationPrompt || "Observe how key control parameters affect steady-state equilibrium.",
      thumbnailUrl:
        thumbnailUrl ||
        "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=640&auto=format&fit=crop&q=80",
      screenshots: screenshots || [],
      views: body.views || "1 learner",
      viewsCount: body.viewsCount || 1,
      uploadedAt: body.uploadedAt || "Just now",
      durationLabel: durationLabel || "Interactive Sim",
      reportsCount: 0,
      isUserUploaded: true,
      comments: body.comments || [],
    };

    // Update in-memory store
    const existingIdx = store.simulations.findIndex((s) => s.id === newSim.id);
    if (existingIdx >= 0) {
      store.simulations[existingIdx] = newSim;
    } else {
      store.simulations.unshift(newSim);
    }

    syncSaveStore();

    return NextResponse.json({
      success: true,
      simulation: newSim,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    syncLoadStore();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing simulation id" }, { status: 400 });
    }

    store.simulations = store.simulations.filter((s) => s.id !== id);

    syncSaveStore();

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
