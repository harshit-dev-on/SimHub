import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { supabaseUrl, supabaseAnonKey } = await req.json();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required." },
        { status: 400 }
      );
    }

    const envPath = path.join(process.cwd(), ".env.local");
    const envContent = `# Supabase Cloud Credentials
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl.trim()}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}

# EcoVerse HMAC Secret
ECOVERSE_SERVER_SECRET=ecoverse-hackathon-hmac-secret-key-2026
`;

    fs.writeFileSync(envPath, envContent, "utf8");

    return NextResponse.json({
      success: true,
      message: "Credentials saved to .env.local! Please restart the Next.js dev server or reload the page.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
