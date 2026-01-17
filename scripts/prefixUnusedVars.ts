import fs from "node:fs";
import path from "node:path";
import { Project, SyntaxKind } from "ts-morph";

/**
 * Prefix unused variables/parameters reported by ESLint with "_" to satisfy @typescript-eslint/no-unused-vars.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS","esModuleInterop":true}' scripts/prefixUnusedVars.ts
 *
 * Requires: `ts-morph` dependency. Uses eslint_errors.json generated via `npx eslint src --format json > eslint_errors.json`.
 */
async function main() {
  const eslintReportPath = path.join(process.cwd(), "eslint_errors.json");
  if (!fs.existsSync(eslintReportPath)) {
    throw new Error(
      "eslint_errors.json not found. Run ESLint with --format json first.",
    );
  }

  const tsconfigPath = path.join(process.cwd(), "frontend", "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error(
      "frontend/tsconfig.json not found. Ensure tsconfig exists.",
    );
  }

  const reportRaw = fs.readFileSync(eslintReportPath, "utf8");
  const report = JSON.parse(reportRaw) as Array<{
    filePath: string;
    messages: Array<{ ruleId?: string; message: string }>;
  }>;

  const targets = new Map<string, Set<string>>();
  for (const entry of report) {
    for (const message of entry.messages ?? []) {
      if (message.ruleId !== "@typescript-eslint/no-unused-vars") continue;
      const match = /'([^']+)'/u.exec(message.message);
      if (!match) continue;
      const name = match[1];
      if (name.startsWith("_")) continue;
      if (!targets.has(entry.filePath)) targets.set(entry.filePath, new Set());
      targets.get(entry.filePath)?.add(name);
    }
  }

  if (!targets.size) {
    console.log("No unused vars found in eslint report.");
    return;
  }

  const project = new Project({
    tsConfigFilePath: tsconfigPath,
    skipFileDependencyResolution: true,
  });

  let touchedFiles = 0;

  for (const [filePath, names] of targets.entries()) {
    const sourceFile =
      project.getSourceFile(filePath) ??
      project.addSourceFileAtPathIfExists(filePath);
    if (!sourceFile) {
      console.warn("Skipped missing file", filePath);
      continue;
    }

    let changed = false;

    const renameIfMatch = (node: {
      getNameNode?: () => any;
      rename?: (newName: string) => void;
      getName?: () => string;
    }) => {
      const name = node.getName?.() ?? node.getNameNode?.()?.getText?.();
      if (!name || !names.has(name) || name.startsWith("_")) return false;
      node.rename?.(`_${name}`);
      return true;
    };

    for (const param of sourceFile.getDescendantsOfKind(SyntaxKind.Parameter)) {
      if (renameIfMatch(param)) changed = true;
    }

    for (const decl of sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration,
    )) {
      if (renameIfMatch(decl)) changed = true;
    }

    for (const binding of sourceFile.getDescendantsOfKind(
      SyntaxKind.BindingElement,
    )) {
      if (renameIfMatch(binding)) changed = true;
    }

    if (changed) {
      touchedFiles += 1;
    }
  }

  await project.save();

  console.log(`Prefixed unused identifiers in ${touchedFiles} file(s).`);
}

main().catch((error) => {
  console.error("Failed to prefix unused variables:", error);
  process.exitCode = 1;
});
