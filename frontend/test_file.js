const fs = require("fs");
const path = require("path");

function getLocalDataPath() {
  try {
    const dataDir = path.join(process.cwd(), "data");
    return path.join(dataDir, "user_simulations.json");
  } catch {
    return null;
  }
}

function testSave() {
  try {
    const p = getLocalDataPath();
    console.log("Path is", p);
    if (p) {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log("Created dir", dir);
      }
      fs.writeFileSync(p, JSON.stringify([], null, 2), "utf-8");
      console.log("Wrote file");
    }
  } catch (err) {
    console.error("Failed:", err);
  }
}

testSave();
