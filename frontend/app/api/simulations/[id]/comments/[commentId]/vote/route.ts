import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { syncLoadStore, syncSaveStore } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    syncLoadStore();
    const { id, commentId } = await context.params;
    const body = await req.json();
    const { direction, currentVote } = body;

    if (direction !== "up" && direction !== "down") {
      return NextResponse.json({ error: "Invalid vote direction" }, { status: 400 });
    }

    const result = store.voteComment(id, commentId, direction, currentVote);

    if (!result) {
      return NextResponse.json({ error: "Simulation or comment not found" }, { status: 404 });
    }

    syncSaveStore();
    return NextResponse.json({
      success: true,
      commentId,
      score: result.score,
      userVote: result.userVote,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
