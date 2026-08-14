import fs from "node:fs";
import path from "node:path";
import { defineCliConfig } from "sanity/cli";

// Load root .env into process.env if present
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

const projectId = process.env.SANITY_PROJECT_ID || "dummy-project-id";
const dataset = process.env.SANITY_DATASET || "production";

// Forward to Studio client bundle
process.env.SANITY_STUDIO_PROJECT_ID = projectId;
process.env.SANITY_STUDIO_DATASET = dataset;

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
