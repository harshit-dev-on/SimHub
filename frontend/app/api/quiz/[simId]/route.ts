import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ simId: string }> }
) {
  try {
    const { simId } = await context.params;
    const sim = store.getSimulation(simId);

    if (!sim) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    // Strip answers and explanations so learner cannot inspect network payloads
    const sanitizedQuestions = sim.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    }));

    return NextResponse.json({
      simId: sim.id,
      title: sim.title,
      observationPrompt: sim.observationPrompt,
      questions: sanitizedQuestions,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
