import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST() {
  const currentState = store.toggleRepoBDrift();
  return NextResponse.json({
    driftActive: currentState,
    message: currentState
      ? "Repo B modified: Tracker script injected into game.js (Post-Approval Drift)"
      : "Repo B restored: Clean game.js restored",
  });
}

export async function GET() {
  return NextResponse.json({
    driftActive: store.repoBDriftActive,
  });
}
