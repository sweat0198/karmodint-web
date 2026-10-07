import { execFile } from "node:child_process";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { KEPT_URLS } from "../../shared/migration/keptUrls";
import { REDIRECTS } from "../../shared/migration/redirects";

const repoRoot = path.join(__dirname, "../..");
const run = promisify(execFile);

let server: Server | undefined;

afterEach(async () => {
  await new Promise((resolve) => (server ? server.close(resolve) : resolve(undefined)));
  server = undefined;
});

type StubResponse = { status: number; location?: string };

/** A host that serves the shipped redirect map the way Cloudflare Pages does, plus `overrides`. */
async function stubDeploy(overrides: Record<string, StubResponse> = {}) {
  const routes: Record<string, StubResponse> = {};
  for (const { from, to, status } of REDIRECTS) {
    routes[from] = routes[from.replace(/\/$/, "")] = { status, location: to };
    routes[to] = { status: 200 };
  }
  for (const kept of KEPT_URLS) routes[kept] = { status: 200 };
  Object.assign(routes, overrides);

  const requested = new Set<string>();
  server = createServer((request, response) => {
    requested.add(request.url ?? "/");
    const route = routes[request.url ?? "/"] ?? { status: 404 };
    response.writeHead(route.status, route.location ? { Location: route.location } : {});
    response.end();
  });
  await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
  return { origin: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, requested };
}

/** Runs the CLI as `pnpm migration:check-redirects` would, without throwing on a non-zero exit. */
async function checkRedirectsCli(...args: string[]) {
  try {
    const { stdout, stderr } = await run(path.join(repoRoot, "node_modules/.bin/jiti"), [
      path.join(repoRoot, "scripts/migration/check-redirects.ts"),
      ...args,
    ]);
    return { code: 0, stdout, stderr };
  } catch (error) {
    const { code, stdout, stderr } = error as { code: number; stdout: string; stderr: string };
    return { code, stdout, stderr };
  }
}

describe("pnpm migration:check-redirects", () => {
  it("passes against a host serving every shipped redirect (both forms) and every Kept URL", async () => {
    const host = await stubDeploy();

    const result = await checkRedirectsCli(host.origin);

    expect(result.stderr).toBe("");
    expect(result.code).toBe(0);
    const expected = [...REDIRECTS.flatMap(({ from }) => [from, from.replace(/\/$/, "")]), ...KEPT_URLS];
    expect(expected.filter((url) => !host.requested.has(url))).toEqual([]);
  });

  it("exits non-zero and lists each failure", async () => {
    const [first, second] = REDIRECTS;
    // A Kept URL no shipped redirect targets, so its 404 is one failure, not one per redirect into it.
    const kept = KEPT_URLS.find((url) => !REDIRECTS.some(({ to }) => to === url))!;
    const host = await stubDeploy({
      [first!.from]: { status: 302, location: first!.to },
      [second!.from.replace(/\/$/, "")]: { status: 404 },
      [kept]: { status: 404 },
    });

    const result = await checkRedirectsCli("--host", host.origin);

    expect(result.code).toBe(1);
    expect(result.stdout).toContain(`${first!.from}  expected 301 → ${first!.to}, got 302 → ${first!.to}`);
    expect(result.stdout).toContain(`${second!.from.replace(/\/$/, "")}  expected 301 → ${second!.to}, got 404`);
    expect(result.stdout).toContain(`${kept}  Kept URL: expected 200, got 404`);
    expect(result.stdout).toContain("3 failures");
  });

  it("refuses to run without a host", async () => {
    const result = await checkRedirectsCli();

    expect(result.code).toBe(1);
    expect(result.stderr).toContain("Usage");
  });
});
