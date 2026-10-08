import { NextResponse } from "next/server";

export async function GET() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carbon Bathtub Simulator</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; max-width: 640px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 1.35rem; color: #38bdf8; margin-bottom: 8px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
    p.sub { font-size: 0.85rem; color: #94a3b8; margin-bottom: 20px; line-height: 1.4; }
    .tub-container { position: relative; width: 100%; height: 180px; background: #090d16; border: 3px solid #64748b; border-top: none; border-radius: 0 0 24px 24px; overflow: hidden; margin-bottom: 20px; }
    .water { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(180deg, #38bdf8 0%, #0284c7 100%); transition: height 0.3s ease; display: flex; align-items: center; justify-content: center; color: #082f49; font-weight: 800; font-size: 1.1rem; }
    .faucet-label { position: absolute; top: 10px; left: 16px; font-size: 0.75rem; color: #f87171; font-weight: 700; }
    .drain-label { position: absolute; bottom: 10px; right: 16px; font-size: 0.75rem; color: #4ade80; font-weight: 700; }
    .controls { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .control-box { background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; }
    .control-box label { display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 6px; }
    .control-box span.val { font-size: 1.1rem; font-weight: 800; }
    input[type=range] { width: 100%; margin-top: 8px; accent-color: #38bdf8; cursor: pointer; }
    .stats { background: #090d16; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; font-size: 0.85rem; border: 1px solid #1e293b; }
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .rising { background: rgba(239, 68, 68, 0.2); color: #f87171; }
    .stable { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
    .falling { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/></svg>
      The Carbon Bathtub (Stock & Flow)
    </h1>
    <p class="sub">Notice: Atmospheric CO₂ concentration (the water level) only stabilizes when human emissions equal natural sink absorption.</p>
    
    <div class="tub-container">
      <div class="faucet-label">▲ INFLOW (Emissions)</div>
      <div class="drain-label">▼ OUTFLOW (Natural Sinks)</div>
      <div id="water" class="water" style="height: 65%;">420 ppm CO₂</div>
    </div>

    <div class="controls">
      <div class="control-box">
        <label style="color: #f87171;">Human Emissions (Faucet): <span id="inflow-val" class="val">40</span> Gt/yr</label>
        <input type="range" id="inflow" min="0" max="60" value="40">
      </div>
      <div class="control-box">
        <label style="color: #4ade80;">Natural Sink Removal (Drain): <span id="outflow-val" class="val">20</span> Gt/yr</label>
        <input type="range" id="outflow" min="10" max="30" value="20">
      </div>
    </div>

    <div class="stats">
      <div>Net Accumulation: <b id="net-rate" style="color: #f87171;">+20 Gt/yr</b></div>
      <div>Atmospheric Trend: <span id="trend-badge" class="status-badge rising">RISING RAPIDLY</span></div>
    </div>
  </div>

  <script src="./game.js"></script>
</body>
</html>`;

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
