import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const initialCwd = process.cwd();
console.log(`=== Starting OpenDesign Vercel Build (from apps/daemon, initialCwd: ${initialCwd}) ===`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findWorkspaceRoot(startDir) {
  let curr = startDir;
  while (curr && curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, "pnpm-workspace.yaml"))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return process.cwd();
}

const rootDir = findWorkspaceRoot(__dirname);
console.log(`Working in monorepo root: ${rootDir}`);
process.chdir(rootDir);

try {
  execSync("pnpm --filter @open-design/web build", {
    cwd: rootDir,
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

const candidates = [
  path.join(rootDir, "apps/web/out"),
  path.join(rootDir, "apps/web/.next/server/app"),
  path.join(rootDir, "apps/web/.next"),
];

let foundSource = null;
for (const cand of candidates) {
  if (fs.existsSync(cand)) {
    console.log(`Found candidate output directory: ${cand}`);
    foundSource = cand;
    break;
  }
}

const targetDirs = [
  path.join(rootDir, "out"),
  path.join(initialCwd, "out"),
  path.join(rootDir, "apps/daemon/out"),
  path.join(rootDir, "apps/web/out"),
];

if (foundSource) {
  for (const target of targetDirs) {
    if (target !== foundSource) {
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(foundSource, target, { recursive: true });
      console.log(`Materialized out directory at: ${target}`);
    }
  }
  console.log("Successfully copied output artifacts to all target out locations!");
}

console.log("=== Vercel Build Complete ===");
