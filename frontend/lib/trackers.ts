/**
 * Pinned list of known tracking, advertising, fingerprinting, and analytics hostnames
 * Derived from Disconnect.me and EasyPrivacy lists
 */
export const PINNED_TRACKER_DOMAINS: string[] = [
  // Analytics & Measurement
  "google-analytics.com",
  "googletagmanager.com",
  "analytics.google.com",
  "hotjar.com",
  "mixpanel.com",
  "segment.com",
  "segment.io",
  "amplitude.com",
  "clarity.ms",
  "matomo.cloud",
  "yandex.ru/metrika",
  "mc.yandex.ru",
  "statcounter.com",
  "crazyegg.com",
  "fullstory.com",
  "logrocket.com",
  
  // Advertising & Fingerprinting
  "doubleclick.net",
  "googleadservices.com",
  "googlesyndication.com",
  "facebook.net/en_US/fbevents.js",
  "connect.facebook.net",
  "ads-twitter.com",
  "bat.bing.com",
  "criteo.com",
  "criteo.net",
  "taboola.com",
  "outbrain.com",
  "adroll.com",
  "adnxs.com",
  "scorecardresearch.com",
  "quantserve.com",
  "optimizely.com",
  "appsflyer.com"
];

export interface TrackerScanResult {
  passed: boolean;
  detectedTrackers: { domain: string; source: string; category: string }[];
  scannedScriptsCount: number;
  unscannedScriptsCount: number;
  scannedBytes: number;
  coverageLabel: string;
}

/**
 * Static string scanner that inspects HTML and scripts for pinned tracker domains
 */
export function scanContentForTrackers(
  htmlContent: string,
  scripts: { url: string; content: string; size: number; oversized?: boolean }[]
): TrackerScanResult {
  const detectedTrackers: { domain: string; source: string; category: string }[] = [];
  let scannedScriptsCount = 0;
  let unscannedScriptsCount = 0;
  let scannedBytes = Buffer.byteLength(htmlContent, "utf8");

  // Helper to categorize domain
  const categorize = (domain: string) => {
    if (domain.includes("ad") || domain.includes("doubleclick") || domain.includes("criteo")) {
      return "Advertising";
    }
    if (domain.includes("facebook") || domain.includes("twitter")) {
      return "Social Tracking / Pixel";
    }
    if (domain.includes("fullstory") || domain.includes("clarity") || domain.includes("logrocket")) {
      return "Session Replay / Fingerprinting";
    }
    return "Analytics";
  };

  // 1. Scan entry HTML
  const lowerHtml = htmlContent.toLowerCase();
  for (const domain of PINNED_TRACKER_DOMAINS) {
    if (lowerHtml.includes(domain.toLowerCase())) {
      detectedTrackers.push({
        domain,
        source: "entry:index.html",
        category: categorize(domain),
      });
    }
  }

  // 2. Scan same-origin scripts
  for (const script of scripts) {
    if (script.oversized) {
      unscannedScriptsCount++;
      continue;
    }

    scannedScriptsCount++;
    scannedBytes += script.size;
    const lowerScript = script.content.toLowerCase();

    for (const domain of PINNED_TRACKER_DOMAINS) {
      if (lowerScript.includes(domain.toLowerCase())) {
        detectedTrackers.push({
          domain,
          source: script.url,
          category: categorize(domain),
        });
      }
    }
  }

  const passed = detectedTrackers.length === 0;
  const coverageLabel = `${scannedScriptsCount} script${scannedScriptsCount === 1 ? "" : "s"} scanned${
    unscannedScriptsCount > 0 ? `, ${unscannedScriptsCount} unscanned (oversized)` : ""
  } (~${(scannedBytes / 1024).toFixed(1)} KB)`;

  return {
    passed,
    detectedTrackers,
    scannedScriptsCount,
    unscannedScriptsCount,
    scannedBytes,
    coverageLabel,
  };
}
