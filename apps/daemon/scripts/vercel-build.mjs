import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

console.log("=== Starting OpenDesign Vercel Build (from apps/daemon) ===");

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

const targetOutRoot = path.join(rootDir, "out");
const targetOutCwd = path.resolve("out");

fs.mkdirSync(targetOutRoot, { recursive: true });
if (targetOutCwd !== targetOutRoot) {
  fs.mkdirSync(targetOutCwd, { recursive: true });
}

let foundSource = null;
for (const cand of candidates) {
  if (fs.existsSync(cand)) {
    console.log(`Found candidate output directory: ${cand}`);
    foundSource = cand;
    break;
  }
}

if (foundSource) {
  console.log(`Copying files from ${foundSource} to target out directories...`);
  fs.cpSync(foundSource, targetOutRoot, { recursive: true });
  if (targetOutCwd !== targetOutRoot) {
    fs.cpSync(foundSource, targetOutCwd, { recursive: true });
  }
  console.log("Successfully copied output artifacts to out directories!");
}

console.log("=== Vercel Build Complete ===");
