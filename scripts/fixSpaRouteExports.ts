import fs from "node:fs/promises";
import path from "node:path";

const ROUTES_DIR = path.join(process.cwd(), "frontend", "src", "routes");
const ROUTE_ENTRY_FILES = new Set(["index.tsx", "layout.tsx"]);
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "coverage",
]);

async function main() {
  const files = await collectRouteEntries(ROUTES_DIR);

  const results: Array<{ file: string; changed: boolean }> = [];

  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    const transformed = transformContent(original);

    if (transformed !== original) {
      await fs.writeFile(file, transformed, "utf8");
      results.push({ file, changed: true });
    }
  }

  if (!results.length) {
    console.log("No files required SPA loader/action updates.");
    return;
  }

  console.log(
    `Updated ${results.length} route file(s) to clientLoader/clientAction exports:`,
  );
  for (const { file } of results) {
    console.log(` - ${path.relative(process.cwd(), file)}`);
  }
}

async function collectRouteEntries(root: string): Promise<string[]> {
  const queue: string[] = [root];
  const files: string[] = [];

  while (queue.length) {
    const current = queue.pop();
    if (!current) {
      continue;
    }

    const stat = await fs.stat(current);
    if (stat.isDirectory()) {
      const dirName = path.basename(current);
      if (SKIP_DIRS.has(dirName)) {
        continue;
      }

      const entries = await fs.readdir(current);
      for (const entry of entries) {
        queue.push(path.join(current, entry));
      }
    } else if (stat.isFile()) {
      const base = path.basename(current);
      if (ROUTE_ENTRY_FILES.has(base)) {
        files.push(current);
      }
    }
  }

  return files;
}

function transformContent(content: string): string {
  let next = content;

  // Skip if already exporting clientLoader/clientAction
  const hasClientExports = /clientLoader|clientAction/.test(next);

  // Re-exported loader: export { foo as loader } from './loader';
  next = next.replace(
    /export\s+\{\s*([^{}]*?)\s+as\s+loader\s*\}\s+from\s+(["']\.\/[^"']+["'])\s*;?/g,
    "export { $1 as clientLoader } from $2;",
  );

  // Re-exported loader: export { loader } from './loader';
  next = next.replace(
    /export\s+\{\s*loader\s*\}\s+from\s+(["']\.\/[^"']+["'])\s*;?/g,
    "export { loader as clientLoader } from $1;",
  );

  // Inline loader definitions
  next = next.replace(
    /export\s+const\s+loader(\s*[:=])/g,
    "export const clientLoader$1",
  );
  next = next.replace(
    /export\s+async\s+function\s+loader(\s*\()/g,
    "export async function clientLoader$1",
  );
  next = next.replace(
    /export\s+function\s+loader(\s*\()/g,
    "export function clientLoader$1",
  );

  // Re-exported action aliases
  next = next.replace(
    /export\s+\{\s*([^{}]*?)\s+as\s+action\s*\}\s+from\s+(["']\.\/[^"']+["'])\s*;?/g,
    "export { $1 as clientAction } from $2;",
  );
  next = next.replace(
    /export\s+\{\s*action\s*\}\s+from\s+(["']\.\/[^"']+["'])\s*;?/g,
    "export { action as clientAction } from $1;",
  );
  next = next.replace(
    /export\s+const\s+action(\s*[:=])/g,
    "export const clientAction$1",
  );
  next = next.replace(
    /export\s+async\s+function\s+action(\s*\()/g,
    "export async function clientAction$1",
  );
  next = next.replace(
    /export\s+function\s+action(\s*\()/g,
    "export function clientAction$1",
  );

  // If we already had client exports and nothing changed, return original.
  if (next === content && hasClientExports) {
    return content;
  }

  return next;
}

main().catch((error) => {
  console.error("Failed to update SPA route exports:", error);
  process.exitCode = 1;
});
