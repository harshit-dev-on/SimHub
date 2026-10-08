"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  XCircle,
  Eye,
  Award,
  X,
  ExternalLink,
} from "lucide-react";
import { SimulationEntry } from "@/lib/store";

export interface PoeModalProps {
  simulation: SimulationEntry;
  onClose: () => void;
}

type PoeStep = "predict" | "observe" | "explain" | "reveal";

interface PoeQuestionData {
  id: string;
  question: string;
  options: { id: string; text: string }[];
}

export const PoeModal: React.FC<PoeModalProps> = ({ simulation, onClose }) => {
  const [step, setStep] = useState<PoeStep>("predict");
  const [questions, setQuestions] = useState<PoeQuestionData[]>([]);
  const [observationPrompt, setObservationPrompt] = useState(simulation.observationPrompt);

  const [preAnswers, setPreAnswers] = useState<Record<string, string>>({});
  const [postAnswers, setPostAnswers] = useState<Record<string, string>>({});

  const [gradeResult, setGradeResult] = useState<any>(null);
  const [isGrading, setIsGrading] = useState(false);

  // Fetch sanitized questions
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch(`/api/quiz/${simulation.id}`);
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
          setObservationPrompt(data.observationPrompt || simulation.observationPrompt);
        }
      } catch (err) {
        console.error("Failed to load POE questions", err);
      }
    }
    loadQuestions();
  }, [simulation.id, simulation.observationPrompt]);

  // Stage script helper: pre-select 2 flipping answers for smooth 3-minute pitch
  const handleScriptedFill = () => {
    if (step === "predict") {
      setPreAnswers({
        q1: "q1-a", // Stock-flow fallacy (wrong)
        q2: "q2-c", // Constant rate fallacy (wrong)
        q3: "q3-b", // Correct
      });
    } else if (step === "explain") {
      setPostAnswers({
        q1: "q1-c", // Correct (Flipped!)
        q2: "q2-a", // Correct (Flipped!)
        q3: "q3-b", // Correct
      });
    }
  };

  const handleGrade = async () => {
    setIsGrading(true);
    try {
      const res = await fetch("/api/quiz/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simId: simulation.id,
          preAnswers,
          postAnswers,
        }),
      });
      const data = await res.json();
      setGradeResult(data);
      if (data.earnedMindChangedBadge) {
        localStorage.setItem("ecoverse_badge_mind_changed", "true");
      }
      setStep("reveal");
    } catch (err) {
      console.error(err);
    } finally {
      setIsGrading(false);
    }
  };

  const allPredictAnswered = questions.length > 0 && questions.every((q) => preAnswers[q.id]);
  const allPostAnswered = questions.length > 0 && questions.every((q) => postAnswers[q.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col h-[92vh] w-full max-w-5xl rounded-3xl border border-slate-800/90 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Top Header & POE Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm sm:text-base">{simulation.title}</span>
            <span className="text-xs text-slate-400 hidden md:inline">Predict-Observe-Explain Learning Loop</span>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800/80 text-xs font-semibold">
              <span
                className={`px-3 py-1 rounded-lg transition-colors ${
                  step === "predict" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                1. Predict
              </span>
              <span
                className={`px-3 py-1 rounded-lg transition-colors ${
                  step === "observe" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                2. Observe
              </span>
              <span
                className={`px-3 py-1 rounded-lg transition-colors ${
                  step === "explain" || step === "reveal" ? "bg-slate-800 text-white shadow-xs" : "text-slate-500"
                }`}
              >
                3. Explain
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Observation Prompt Banner */}
        <div className="bg-amber-50/80 border-b border-amber-100 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-800">
            <Eye className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong className="text-amber-800">Guiding Question:</strong> {observationPrompt}
            </span>
          </div>

          {(step === "predict" || step === "explain") && (
            <button
              onClick={handleScriptedFill}
              className="text-[11px] text-slate-500 hover:text-slate-900 underline font-mono shrink-0"
              title="Fast autofill matching 3-min pitch script"
            >
              [Stage Script Auto-Fill]
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 relative bg-slate-950">
          {/* STEP 1: PREDICT */}
          {step === "predict" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
                <strong>Phase 1: Make Your Prediction.</strong> Before interacting with the simulation, register your
                initial intuition. Wrong guesses will help uncover hidden cognitive misconceptions!
              </div>

              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-slate-800/90 bg-slate-900/50 p-5 space-y-3 shadow-xs">
                  <div className="text-sm font-semibold text-white">
                    <span className="text-blue-600 mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setPreAnswers({ ...preAnswers, [q.id]: opt.id })}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          preAnswers[q.id] === opt.id
                            ? "border-blue-500 bg-blue-500/10 text-white font-medium"
                            : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`pre-${q.id}`}
                          checked={preAnswers[q.id] === opt.id}
                          onChange={() => {}}
                          className="mt-0.5 accent-blue-600"
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <button
                  disabled={!allPredictAnswered}
                  onClick={() => setStep("observe")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all ${
                    allPredictAnswered
                      ? "bg-slate-950 text-white hover:bg-slate-900 shadow-sm"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span>Lock Predictions &amp; Observe Simulation</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OBSERVE (The Sandboxed Iframe) */}
          <div
            className={`w-full h-full flex flex-col ${
              step === "observe" ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400">
                Playing in sandboxed iframe (
                <code className="text-emerald-400">sandbox=&quot;allow-scripts allow-same-origin&quot;</code>)
              </span>
              <a
                href={simulation.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-slate-400 hover:text-white"
              >
                <span>Open in new tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div className="flex-1 w-full rounded-xl border border-slate-800 overflow-hidden bg-slate-950 relative">
              <iframe
                src={simulation.liveUrl}
                title={simulation.title}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setStep("predict")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:bg-slate-800"
              >
                <span>Back to Predictions</span>
              </button>

              <button
                onClick={() => setStep("explain")}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-xs font-semibold text-white hover:from-purple-400 hover:to-indigo-400 shadow-lg shadow-purple-500/20"
              >
                <span>Proceed to Explain (Post-Quiz)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* STEP 3: EXPLAIN (Post-Quiz) */}
          {step === "explain" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs text-purple-200">
                <strong>Phase 3: Explain & Re-evaluate.</strong> Now that you observed the system dynamics, has your
                understanding shifted? Answer the questions again to test cognitive change.
              </div>

              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-5 space-y-3">
                  <div className="text-sm font-semibold text-white">
                    <span className="text-purple-400 mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        onClick={() => setPostAnswers({ ...postAnswers, [q.id]: opt.id })}
                        className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          postAnswers[q.id] === opt.id
                            ? "border-purple-500 bg-purple-500/10 text-white"
                            : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`post-${q.id}`}
                          checked={postAnswers[q.id] === opt.id}
                          onChange={() => {}}
                          className="mt-0.5 accent-purple-500"
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setStep("observe")}
                  className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Return to Simulation
                </button>

                <button
                  disabled={!allPostAnswered || isGrading}
                  onClick={handleGrade}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                    allPostAnswered
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:from-emerald-400 hover:to-cyan-400 shadow-emerald-500/20"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isGrading ? "Evaluating Cognitive Flips..." : "Submit Explanations & Grade"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: REVEAL (Net Flips & Mind Changed Badge) */}
          {step === "reveal" && gradeResult && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Badge & Metrics Hero */}
              <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-slate-950 p-6 text-center space-y-3">
                {gradeResult.earnedMindChangedBadge ? (
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20 animate-bounce">
                    <Award className="h-8 w-8 stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-800 text-slate-400">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {gradeResult.earnedMindChangedBadge ? 'Badge Unlocked: "Mind Changed"!' : "POE Loop Completed"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    {gradeResult.earnedMindChangedBadge
                      ? "You challenged and overturned persistent scientific misconceptions after interacting with the simulation."
                      : "Review your conceptual progression below."}
                  </p>
                </div>

                {/* Score & Net Flips Counter */}
                <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pre-Observation</span>
                    <span className="font-bold text-slate-300 text-sm">
                      {gradeResult.preScore} / {gradeResult.totalQuestions}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-800"></div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Post-Observation</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {gradeResult.postScore} / {gradeResult.totalQuestions}
                    </span>
                  </div>

                  <div className="h-8 w-px bg-slate-800"></div>

                  <div className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 block text-[11px] font-semibold">Net Flips</span>
                    <span className="font-extrabold text-emerald-300 text-sm">
                      +{gradeResult.netFlips} (Wrong ➔ Right)
                    </span>
                  </div>
                </div>
              </div>

              {/* Per-Question Explanations & Misconception Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Conceptual Progression Breakdown
                </h4>

                {gradeResult.breakdown?.map((item: any, idx: number) => (
                  <div
                    key={item.questionId}
                    className={`rounded-xl border p-4 space-y-2.5 text-xs ${
                      item.flipped && item.flipType === "wrong_to_right"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-slate-800 bg-slate-950/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-white">
                        <span className="text-slate-400 mr-1.5">Q{idx + 1}.</span>
                        {item.question}
                      </div>

                      {item.flipped && item.flipType === "wrong_to_right" && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                          Flipped to Right ✓
                        </span>
                      )}
                    </div>

                    {/* Pre vs Post Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block mb-1">Your Initial Prediction:</span>
                        <div className="flex items-start gap-1.5">
                          {item.preAnswer.isCorrect ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <span className={item.preAnswer.isCorrect ? "text-emerald-300" : "text-rose-300"}>
                            {item.preAnswer.text}
                          </span>
                        </div>
                        {item.preAnswer.misconceptionLabel && (
                          <div className="mt-1.5 text-[10px] text-amber-400/90 bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                            <strong>Misconception:</strong> {item.preAnswer.misconceptionLabel}
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-500 block mb-1">Your Post-Observation:</span>
                        <div className="flex items-start gap-1.5">
                          {item.postAnswer.isCorrect ? (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                          )}
                          <span className={item.postAnswer.isCorrect ? "text-emerald-300" : "text-rose-300"}>
                            {item.postAnswer.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scientific Explanation */}
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-slate-300">
                      <strong className="text-emerald-400 block mb-0.5 text-[11px]">Scientific Explanation:</strong>
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
                >
                  Done & Back to Catalogue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
