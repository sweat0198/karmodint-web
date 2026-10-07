/**
 * Sweeps a host for the UK migration (docs/LAUNCH_CHECKLIST.md, step 13): every shipped Redirect source, slashed and
 * slashless, must answer its status and `Location` in one hop, and every Kept URL must answer 200. Exits 1 and lists
 * each failure otherwise. Read-only: GET requests, redirects not followed.
 *
 *   pnpm migration:check-redirects https://karmodint-web.pages.dev
 *   pnpm migration:check-redirects --host https://www.karmodint.co.uk
 */
import { KEPT_URLS } from "../../shared/migration/keptUrls";
import { REDIRECTS } from "../../shared/migration/redirects";
import { checkRedirects } from "./checkRedirects";

const USAGE = "Usage: pnpm migration:check-redirects [--host] <https://host>";

function readOrigin(args: string[]): string {
  const flag = args.indexOf("--host");
  const value = flag === -1 ? args.find((arg) => !arg.startsWith("--")) : args[flag + 1];
  if (!value) throw new Error(USAGE);
  const url = new URL(/^https?:\/\//.test(value) ? value : `https://${value}`);
  return url.origin;
}

async function main(): Promise<void> {
  const origin = readOrigin(process.argv.slice(2));
  console.log(
    `Checking ${REDIRECTS.length} Redirect sources (×2: with and without the trailing slash) ` +
      `and ${KEPT_URLS.length} Kept URLs on ${origin}`,
  );

  const { checked, failures } = await checkRedirects({ origin, redirects: REDIRECTS, keptUrls: KEPT_URLS });

  for (const { path, problem } of failures) console.log(`  ${path}  ${problem}`);
  if (failures.length > 0) {
    console.log(`${failures.length} failure${failures.length === 1 ? "" : "s"} out of ${checked} requests`);
    process.exitCode = 1;
  } else {
    console.log(`All ${checked} requests passed`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
