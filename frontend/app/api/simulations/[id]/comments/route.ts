import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { syncLoadStore, syncSaveStore } from "@/lib/db";

export async function GET(
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

    return NextResponse.json({
      success: true,
      comments: sim.comments || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { text, authorName, authorAvatar, isCreator, hasMindChangedBadge, parentId } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const newComment = store.addComment(id, {
      text: text.trim(),
      authorName: authorName || "Anonymous Learner",
      authorAvatar: authorAvatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=Learner",
      isCreator: Boolean(isCreator),
      hasMindChangedBadge: Boolean(hasMindChangedBadge),
      parentId,
    });

    syncSaveStore();
    return NextResponse.json({
      success: true,
      comment: newComment,
      comments: sim.comments,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
