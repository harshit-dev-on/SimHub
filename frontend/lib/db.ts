import fs from "fs";
import path from "path";
import { store } from "@/lib/store";

let isLoaded = false;

export function syncLoadStore() {
  if (isLoaded) return;
  try {
    const dataDir = path.join(process.cwd(), "data");
    const p = path.join(dataDir, "database.json");
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.simulations && Array.isArray(parsed.simulations) && parsed.simulations.length > 0) {
        store.simulations = parsed.simulations;
      }
      if (parsed.userSubscriptions) {
        store.userSubscriptions = parsed.userSubscriptions;
      }
    }
  } catch (e) {
    console.error("Failed to load store from disk", e);
  }
  isLoaded = true;
}

export function syncSaveStore() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const p = path.join(dataDir, "database.json");
    const data = {
      simulations: store.simulations,
      userSubscriptions: store.userSubscriptions
    };
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save store to disk", e);
  }
}
