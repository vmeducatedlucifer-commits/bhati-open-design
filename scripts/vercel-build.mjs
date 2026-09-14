import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

console.log("=== Starting OpenDesign Vercel Build ===");

// 1. Build the web app with static export
try {
  execSync("pnpm --filter @open-design/web build", {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      OD_WEB_OUTPUT_MODE: "",
    },
  });
} catch (err) {
  console.error("Next.js build failed:", err);
  process.exit(1);
}

// 2. Locate output directory
const candidates = [
  path.resolve("apps/web/out"),
  path.resolve("apps/web/.next/server/app"),
  path.resolve("apps/web/.next"),
  path.resolve("out"),
];

const targetOut = path.resolve("out");
fs.mkdirSync(targetOut, { recursive: true });

let foundSource = null;
for (const cand of candidates) {
  if (cand !== targetOut && fs.existsSync(cand)) {
    console.log(`Found candidate output directory: ${cand}`);
    foundSource = cand;
    break;
  }
}

if (foundSource) {
  console.log(`Copying files from ${foundSource} to ${targetOut}...`);
  fs.cpSync(foundSource, targetOut, { recursive: true });
  console.log("Successfully copied output artifacts to ./out directory!");
} else {
  console.warn("No candidate output directory found. Checking apps/web directory...");
  const webFiles = fs.readdirSync(path.resolve("apps/web"));
  console.log("apps/web contents:", webFiles);
}

// 3. Verify out directory contents
if (fs.existsSync(targetOut)) {
  const contents = fs.readdirSync(targetOut);
  console.log("Final ./out contents:", contents);
}

console.log("=== Vercel Build Complete ===");
