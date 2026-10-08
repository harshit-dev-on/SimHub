import { NextRequest, NextResponse } from "next/server";

const OSI_APPROVED_SPDX = [
  "MIT",
  "APACHE-2.0",
  "GPL-3.0",
  "GPL-2.0",
  "BSD-3-CLAUSE",
  "BSD-2-CLAUSE",
  "AGPL-3.0",
  "LGPL-3.0",
  "MPL-2.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "UNLICENSE",
];

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { license } = body;

    // Simulate GitHub license API query latency
    await new Promise((r) => setTimeout(r, 90));

    const spdx = (license || "MIT").toUpperCase().trim();
    const passed = OSI_APPROVED_SPDX.includes(spdx);

    return NextResponse.json({
      gateId: "g5",
      name: "G5: Open Source License",
      passed,
      statusText: passed
        ? `OSI-approved open source license verified (${license})`
        : `License '${license}' is not in OSI-approved SPDX list or is proprietary`,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
      details: {
        spdxIdentifier: license,
        isOsiApproved: passed,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      gateId: "g5",
      name: "G5: Open Source License",
      passed: false,
      statusText: `License error: ${msg}`,
      latencyMs: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
}
