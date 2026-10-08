import { NextResponse } from "next/server";
import { deriveBindingToken } from "@/lib/crypto";

export async function GET() {
  const token = deriveBindingToken(9841234, 74512091, "http://localhost:3000/api/mock-sim/repo-b/");

  const manifest = {
    name: "Carbon Bathtub: CO₂ Stock & Flow Model",
    version: "1.0.0",
    description:
      "Interactive stock-and-flow atmospheric CO₂ model confronting emissions stabilization misconceptions.",
    token: token,
    license: "MIT",
    author: "ecoteacher",
    githubUserId: 9841234,
    repoId: 74512091,
    entryPoint: "index.html",
    observationPrompt:
      "Adjust emissions and absorption rates. Notice what happens to the atmospheric CO₂ water level when emissions match net uptake vs when emissions stay flat.",
    topic: "Carbon Cycle",
    gradeLevel: "High School / College",
  };

  return NextResponse.json(manifest, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
