import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { syncLoadStore, syncSaveStore } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    syncLoadStore();
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const subscriptions = store.getUserSubscriptions(userId);
    return NextResponse.json({ userId, subscriptions });
  } catch (err: any) {
    console.error("Error fetching user subscriptions:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    syncLoadStore();
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const body = await request.json();
    const { authorName, subscriptions } = body;

    if (Array.isArray(subscriptions)) {
      const updated = store.setUserSubscriptions(userId, subscriptions);
      syncSaveStore();
      return NextResponse.json({ userId, subscriptions: updated });
    }

    if (!authorName || typeof authorName !== "string") {
      return NextResponse.json(
        { error: "Missing authorName to toggle" },
        { status: 400 }
      );
    }

    const result = store.toggleUserSubscription(userId, authorName.trim());
    syncSaveStore();
    return NextResponse.json({
      userId,
      isSubscribed: result.isSubscribed,
      subscriptions: result.subscriptions,
    });
  } catch (err: any) {
    console.error("Error updating user subscriptions:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
