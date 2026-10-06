/**
 * Just enough of Cloudflare Pages' routing to test our generated files against, ported from the open-source asset
 * server (github.com/cloudflare/workers-sdk: `workers-shared/utils/configuration/parseRedirects.ts`,
 * `pages-shared/asset-server/handler.ts`):
 *
 * - `_redirects`: a rule without `*` or `:placeholder` is static, but only while no dynamic rule has appeared above it;
 *   after the first dynamic rule every rule counts as dynamic. 2,000 static / 100 dynamic max; extra lines are dropped.
 *   Static rules match the request pathname exactly (no trailing-slash normalisation); the first one listed wins.
 */

export type RedirectRule = { from: string; to: string; status: number; dynamic: boolean };

const PERMITTED_STATUS = new Set([200, 301, 302, 303, 307, 308]);

export function parseRedirects(source: string): { rules: RedirectRule[]; invalid: string[] } {
  const rules: RedirectRule[] = [];
  const invalid: string[] = [];
  let staticCount = 0;
  let dynamicCount = 0;
  let canBeStatic = true;

  for (const raw of source.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const tokens = line.replace(/\s+#.*$/, "").split(/\s+/);
    if (tokens.length < 2 || tokens.length > 3) {
      invalid.push(line);
      continue;
    }
    const [from, to, status = "302"] = tokens as [string, string, string?];
    const isDynamic = !canBeStatic || /\*|:[A-Za-z]\w*/.test(from);
    if (isDynamic) {
      canBeStatic = false;
      if (++dynamicCount > 100) {
        invalid.push(`dynamic rule limit reached at: ${line}`);
        break;
      }
    } else if (++staticCount > 2000) {
      invalid.push(`static rule limit reached at: ${line}`);
      continue;
    }
    if (!PERMITTED_STATUS.has(Number(status))) {
      invalid.push(line);
      continue;
    }
    rules.push({ from, to, status: Number(status), dynamic: isDynamic });
  }
  return { rules, invalid };
}

function patternToRegExp(pattern: string): RegExp {
  const regex = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/:[A-Za-z]\w*/g, "[^/]+");
  return new RegExp(`^${regex}$`);
}

/** The rule Cloudflare applies to a request path, if any: static rules first (exact match), then dynamic ones. */
export function matchRedirect(rules: RedirectRule[], pathname: string): RedirectRule | undefined {
  return (
    rules.find((rule) => !rule.dynamic && rule.from === pathname) ??
    rules.find((rule) => rule.dynamic && patternToRegExp(rule.from).test(pathname))
  );
}
