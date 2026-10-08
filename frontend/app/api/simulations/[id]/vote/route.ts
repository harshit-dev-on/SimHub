import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { direction, currentVote } = body;

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json({ error: "Invalid vote direction" }, { status: 400 });
    }

    const result = store.voteSimulation(id, direction, currentVote);

    if (!result) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      likes: result.likes,
      userVote: result.userVote,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
