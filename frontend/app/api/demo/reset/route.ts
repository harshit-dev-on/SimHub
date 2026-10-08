import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST() {
  store.resetToDefaults();
  return NextResponse.json({
    success: true,
    message: "EcoVerse demo state reset to pristine stage baseline. Repo B is clean and pending.",
  });
}
