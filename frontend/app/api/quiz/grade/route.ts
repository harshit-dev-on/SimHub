import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const { simId, preAnswers, postAnswers } = await req.json();
    const sim = store.getSimulation(simId);

    if (!sim) {
      return NextResponse.json({ error: "Simulation not found" }, { status: 404 });
    }

    let preCorrect = 0;
    let postCorrect = 0;
    let wrongToRightFlips = 0;
    let rightToWrongFlips = 0;

    const questionBreakdown = sim.questions.map((q) => {
      const correctOption = q.options.find((o) => o.isCorrect);
      const preSelectedId = preAnswers[q.id];
      const postSelectedId = postAnswers[q.id];

      const preSelectedOpt = q.options.find((o) => o.id === preSelectedId);
      const postSelectedOpt = q.options.find((o) => o.id === postSelectedId);

      const isPreCorrect = preSelectedOpt?.isCorrect ?? false;
      const isPostCorrect = postSelectedOpt?.isCorrect ?? false;

      if (isPreCorrect) preCorrect++;
      if (isPostCorrect) postCorrect++;

      let flipped = false;
      let flipType: "none" | "wrong_to_right" | "right_to_wrong" = "none";

      if (!isPreCorrect && isPostCorrect) {
        wrongToRightFlips++;
        flipped = true;
        flipType = "wrong_to_right";
      } else if (isPreCorrect && !isPostCorrect) {
        rightToWrongFlips++;
        flipped = true;
        flipType = "right_to_wrong";
      }

      return {
        questionId: q.id,
        question: q.question,
        explanation: q.explanation,
        correctOptionId: correctOption?.id,
        correctOptionText: correctOption?.text,
        preAnswer: {
          id: preSelectedOpt?.id,
          text: preSelectedOpt?.text,
          isCorrect: isPreCorrect,
          misconceptionLabel: preSelectedOpt?.misconceptionLabel,
        },
        postAnswer: {
          id: postSelectedOpt?.id,
          text: postSelectedOpt?.text,
          isCorrect: isPostCorrect,
          misconceptionLabel: postSelectedOpt?.misconceptionLabel,
        },
        flipped,
        flipType,
      };
    });

    const netFlips = wrongToRightFlips - rightToWrongFlips;
    const earnedMindChangedBadge = netFlips >= 1;

    return NextResponse.json({
      success: true,
      totalQuestions: sim.questions.length,
      preScore: preCorrect,
      postScore: postCorrect,
      wrongToRightFlips,
      rightToWrongFlips,
      netFlips,
      earnedMindChangedBadge,
      badge: earnedMindChangedBadge
        ? {
            name: "Mind Changed",
            icon: "sparkles",
            description: "Overcame common misconception after interacting with simulation model",
            awardedAt: new Date().toISOString(),
          }
        : null,
      breakdown: questionBreakdown,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
