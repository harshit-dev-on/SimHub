import { NextRequest, NextResponse } from "next/server";
import { store, SimulationEntry } from "@/lib/store";
import fs from "fs";
import path from "path";

function getLocalDataPath(): string | null {
  try {
    const dataDir = path.join(process.cwd(), "data");
    return path.join(dataDir, "user_simulations.json");
  } catch {
    return null;
  }
}

function loadLocalUserSimulations(): SimulationEntry[] {
  try {
    const p = getLocalDataPath();
    if (p && fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch {
    // Read-only filesystem or parse error
  }
  return [];
}

function saveLocalUserSimulations(sims: SimulationEntry[]): void {
  try {
    const p = getLocalDataPath();
    if (p) {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify(sims, null, 2), "utf-8");
    }
  } catch {
    // Vercel / read-only filesystem
  }
}

export async function GET() {
  try {
    const localSims = loadLocalUserSimulations();
    if (localSims.length > 0) {
      const localIds = new Set(localSims.map((s) => s.id));
      const nonLocal = store.simulations.filter((s) => !localIds.has(s.id));
      store.simulations = [...localSims, ...nonLocal];
    }
  } catch {
    // Ignore in edge / serverless
  }

  return NextResponse.json({
    simulations: store.simulations,
  });
}

export async function POST(req: NextRequest) {
  try {
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
      questions: body.questions || [],
      comments: body.comments || [],
    };

    // Update in-memory store
    const existingIdx = store.simulations.findIndex((s) => s.id === newSim.id);
    if (existingIdx >= 0) {
      store.simulations[existingIdx] = newSim;
    } else {
      store.simulations.unshift(newSim);
    }

    // Persist to local JSON file for Node.js / dev server
    try {
      const currentLocal = loadLocalUserSimulations().filter((s) => s.id !== newSim.id);
      saveLocalUserSimulations([newSim, ...currentLocal]);
    } catch {
      // Ignore
    }

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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing simulation id" }, { status: 400 });
    }

    store.simulations = store.simulations.filter((s) => s.id !== id);

    try {
      const currentLocal = loadLocalUserSimulations().filter((s) => s.id !== id);
      saveLocalUserSimulations(currentLocal);
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
