import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.toLowerCase();
  const topic = searchParams.get("topic")?.toLowerCase();

  let results = store.simulations.filter((s) => s.status === "approved");

  if (query) {
    results = results.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.topic.toLowerCase().includes(query)
    );
  }

  if (topic && topic !== "all") {
    results = results.filter((s) => s.topic.toLowerCase() === topic);
  }

  return NextResponse.json({
    total: results.length,
    simulations: results,
  });
}
