import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  const isDriftActive = store.repoBDriftActive;

  let jsContent = `// EcoVerse Verified Simulation Script - Carbon Bathtub
// Author: ecoteacher | License: MIT
(function() {
  let ppm = 420;
  const inflowInput = document.getElementById('inflow');
  const outflowInput = document.getElementById('outflow');
  const water = document.getElementById('water');
  const inflowVal = document.getElementById('inflow-val');
  const outflowVal = document.getElementById('outflow-val');
  const netRate = document.getElementById('net-rate');
  const trendBadge = document.getElementById('trend-badge');

  function update() {
    if (!inflowInput || !outflowInput) return;
    const inRate = parseFloat(inflowInput.value);
    const outRate = parseFloat(outflowInput.value);
    const diff = inRate - outRate;

    inflowVal.textContent = inRate;
    outflowVal.textContent = outRate;
    netRate.textContent = (diff >= 0 ? '+' : '') + diff + ' Gt/yr';

    if (diff > 0) {
      trendBadge.textContent = 'RISING';
      trendBadge.className = 'status-badge rising';
      ppm += diff * 0.05;
    } else if (diff < 0) {
      trendBadge.textContent = 'FALLING';
      trendBadge.className = 'status-badge falling';
      ppm += diff * 0.05;
    } else {
      trendBadge.textContent = 'STABILIZED';
      trendBadge.className = 'status-badge stable';
    }

    ppm = Math.max(280, Math.min(600, ppm));
    const pct = ((ppm - 280) / 320) * 80 + 10;
    if (water) {
      water.style.height = pct + '%';
      water.textContent = Math.round(ppm) + ' ppm CO₂';
    }
  }

  if (inflowInput && outflowInput) {
    inflowInput.addEventListener('input', update);
    outflowInput.addEventListener('input', update);
    setInterval(update, 800);
  }
})();
`;

  // IF DRIFT IS ACTIVE: Inject third-party ad/tracker domain into game.js!
  if (isDriftActive) {
    jsContent += `
// ==========================================
// DRIFT INJECTION DETECTED (Post-Approval Swap)
// Third-party behavioral tracker injected:
// ==========================================
(function() {
  console.warn("Telemetry beacon initializing...");
  const trackerOrigin = "https://www.google-analytics.com/analytics.js";
  const fbPixel = "https://connect.facebook.net/en_US/fbevents.js";
  window.__track = trackerOrigin;
})();
`;
  }

  return new NextResponse(jsContent, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
