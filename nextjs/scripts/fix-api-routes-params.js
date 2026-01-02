#!/usr/bin/env node

/**
 * API Routes Params Fix Script
 * Fixes Next.js 15+ requirement where params is a Promise in API route handlers
 *
 * Changes:
 * - Updates param destructuring to use `await params`
 * - Makes route handlers properly async
 * - Fixes TypeScript validation errors
 */

const fs = require("fs");
const path = require("path");

const stats = {
  filesProcessed: 0,
  filesModified: 0,
  filesSkipped: 0,
  filesFailed: 0,
};

/**
 * Check if file already has await params
 */
function hasAwaitParams(content) {
  return /await\s+params/.test(content);
}

/**
 * Fix params destructuring in route handler
 */
function fixParamsInRoute(content) {
  let modified = false;

  // Pattern 1: { params }: { params: { id: string } }
  // Fix destructuring to await params
  const pattern1 = /{\s*params\s*}\s*:\s*{\s*params:\s*{\s*([^}]+)\s*}\s*}/g;
  if (pattern1.test(content)) {
    content = content.replace(
      pattern1,
      "{ params }: { params: Promise<{ $1 }> }"
    );
    modified = true;
  }

  // Pattern 2: Immediate destructuring const { id } = params
  // Add await
  const lines = content.split("\n");
  let inFunction = false;
  let functionIndent = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect function start
    if (/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)/.test(line)) {
      inFunction = true;
      functionIndent = line.search(/\S/);
      continue;
    }

    // Inside function, look for params destructuring
    if (inFunction && !hasAwaitParams(lines.slice(0, i + 1).join("\n"))) {
      // Match: const { id } = params.id;
      // or: const { id, other } = params;
      const paramDestructureRegex = /const\s+\{\s*[^}]+\s*\}\s*=\s*params/;
      if (paramDestructureRegex.test(line)) {
        // Add await before params
        lines[i] = line.replace(/=\s*params/, "= await params");
        modified = true;
      }

      // Match: return proxyToBackend(request, `/api/something/${params.id}`)
      if (/params\.\w+/.test(line) && !line.includes("await params")) {
        // Need to destructure params first
        const indent = " ".repeat(functionIndent + 2);
        // Find the opening brace of the function
        for (let j = i - 1; j >= 0; j--) {
          if (lines[j].includes("){")) {
            // Insert destructuring after opening brace
            const paramMatches = content.match(
              /params:\s*Promise<{\s*([^}]+)\s*}>/
            );
            if (paramMatches) {
              const paramNames = paramMatches[1]
                .split(",")
                .map((p) => p.split(":")[0].trim());
              lines.splice(
                j + 1,
                0,
                `${indent}const { ${paramNames.join(", ")} } = await params;`
              );
              modified = true;
              break;
            }
          }
        }
      }
    }

    // Detect function end
    if (
      inFunction &&
      line.trim() === "}" &&
      line.search(/\S/) === functionIndent
    ) {
      inFunction = false;
    }
  }

  return { content: lines.join("\n"), modified };
}

/**
 * Process a single API route file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;

    const content = fs.readFileSync(filePath, "utf8");

    // Skip if already has await params
    if (hasAwaitParams(content)) {
      console.log(
        `⏭️  Skipped (already fixed): ${filePath.replace(/.*\/src\/app\/api\//, "")}`
      );
      stats.filesSkipped++;
      return;
    }

    // Skip if doesn't have params
    if (!content.includes("params")) {
      console.log(
        `⏭️  Skipped (no params): ${filePath.replace(/.*\/src\/app\/api\//, "")}`
      );
      stats.filesSkipped++;
      return;
    }

    const result = fixParamsInRoute(content);

    if (result.modified) {
      fs.writeFileSync(filePath, result.content, "utf8");
      stats.filesModified++;
      console.log(`✅ Fixed: ${filePath.replace(/.*\/src\/app\/api\//, "")}`);
    } else {
      stats.filesSkipped++;
      console.log(
        `⏭️  No changes needed: ${filePath.replace(/.*\/src\/app\/api\//, "")}`
      );
    }
  } catch (error) {
    stats.filesFailed++;
    console.error(
      `❌ Failed: ${filePath.replace(/.*\/src\/app\/api\//, "")} - ${error.message}`
    );
  }
}

/**
 * Find all route.ts files in api directory
 */
function findApiRoutes(dir) {
  let files = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(findApiRoutes(fullPath));
      } else if (item === "route.ts") {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * Main execution
 */
function main() {
  console.log("🚀 API Routes Params Fix Script");
  console.log("📋 Fixing Next.js 15+ Promise params requirement\n");

  const apiDir = path.join(__dirname, "../src/app/api");

  if (!fs.existsSync(apiDir)) {
    console.error("❌ Error: api directory not found");
    console.error(`   Expected: ${apiDir}`);
    process.exit(1);
  }

  console.log("🔍 Finding all API route files...\n");
  const routeFiles = findApiRoutes(apiDir);
  console.log(`📁 Found ${routeFiles.length} route files\n`);

  if (routeFiles.length === 0) {
    console.error("❌ No route.ts files found");
    process.exit(1);
  }

  console.log("⚙️  Processing files...\n");
  routeFiles.forEach(processFile);

  console.log("\n" + "=".repeat(60));
  console.log("📊 API Routes Fix Summary");
  console.log("=".repeat(60));
  console.log(`✅ Successfully modified:  ${stats.filesModified} files`);
  console.log(`⏭️  Skipped:               ${stats.filesSkipped} files`);
  console.log(`❌ Failed:                 ${stats.filesFailed} files`);
  console.log(`📁 Total processed:        ${stats.filesProcessed} files`);
  console.log("=".repeat(60));
  console.log("✨ API routes params fixed!");
  console.log("📝 Next step: Run npx tsc --noEmit to verify\n");
}

main();
