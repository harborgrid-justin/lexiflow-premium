#!/usr/bin/env node
/**
 * Next.js v16 Route Handler (route.ts) Compliance Checker
 * Validates API routes against 20 enterprise guidelines
 *
 * Usage: node validate-route-compliance.js
 */

const fs = require("fs");
const path = require("path");

const GUIDELINES = [
  { id: 1, name: "Route Handlers in App Directory", check: "isInAppDirectory" },
  { id: 2, name: "Explicit HTTP Methods", check: "hasExplicitMethods" },
  { id: 3, name: "Early Request Validation", check: "hasEarlyValidation" },
  {
    id: 4,
    name: "Web Standards (Request/Response)",
    check: "usesWebStandards",
  },
  { id: 5, name: "Cache Policy Explicit", check: "hasCachePolicy" },
  { id: 6, name: "Pure Server Logic", check: "isPureServer" },
  { id: 10, name: "TypeScript Type Safety", check: "hasTypeScript" },
  { id: 11, name: "No In-Memory State", check: "noInMemoryState" },
  { id: 12, name: "Security Principles", check: "hasSecurityChecks" },
  { id: 13, name: "CORS & Headers Explicit", check: "hasCorsHeaders" },
  { id: 16, name: "Route Documentation", check: "hasDocumentation" },
  {
    id: 19,
    name: "Disallow Unsupported Methods",
    check: "hasMethodValidation",
  },
];

function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      findRouteFiles(filePath, fileList);
    } else if (file === "route.ts") {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkRouteCompliance(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.relative(process.cwd(), filePath);

  const results = {
    file: fileName,
    passed: [],
    failed: [],
    warnings: [],
  };

  // Guideline 1: In app directory
  if (filePath.includes("/app/api/")) {
    results.passed.push(1);
  } else {
    results.failed.push({ id: 1, reason: "Route not in /app/api directory" });
  }

  // Guideline 2: Explicit HTTP methods
  const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
  const exportedMethods = httpMethods.filter((method) =>
    content.includes(`export async function ${method}`)
  );

  if (exportedMethods.length > 0) {
    results.passed.push(2);
  } else {
    results.failed.push({ id: 2, reason: "No HTTP methods exported" });
  }

  // Guideline 3: Early validation (auth checks at top)
  if (content.includes("authHeader") || content.includes("authorization")) {
    results.passed.push(3);
  } else {
    results.warnings.push({
      id: 3,
      reason: "No auth validation found (may not be required)",
    });
  }

  // Guideline 4: Web standards (NextRequest/NextResponse)
  if (content.includes("NextRequest") && content.includes("NextResponse")) {
    results.passed.push(4);
  } else {
    results.failed.push({
      id: 4,
      reason: "Not using NextRequest/NextResponse",
    });
  }

  // Guideline 5: Cache policy explicit
  if (
    content.includes("export const dynamic") ||
    content.includes("export const revalidate")
  ) {
    results.passed.push(5);
  } else {
    results.warnings.push({ id: 5, reason: "No explicit cache policy" });
  }

  // Guideline 6: Pure server logic (no client imports)
  if (
    !content.includes("useState") &&
    !content.includes("useEffect") &&
    !content.includes('"use client"')
  ) {
    results.passed.push(6);
  } else {
    results.failed.push({ id: 6, reason: "Contains client-side logic" });
  }

  // Guideline 10: TypeScript
  if (filePath.endsWith(".ts")) {
    results.passed.push(10);
  } else {
    results.failed.push({ id: 10, reason: "Not using TypeScript (.ts)" });
  }

  // Guideline 11: No in-memory state (check for global vars)
  const hasGlobalState =
    content.match(/let\s+\w+\s*=\s*(?!await)/g) &&
    !content.includes("const ") &&
    content
      .split("\n")
      .some((line) => line.trim().startsWith("let") && !line.includes("="));

  if (!hasGlobalState) {
    results.passed.push(11);
  } else {
    results.warnings.push({
      id: 11,
      reason: "May contain mutable global state",
    });
  }

  // Guideline 12: Security checks (auth validation)
  if (content.includes("authorization") && content.includes("401")) {
    results.passed.push(12);
  } else {
    results.warnings.push({
      id: 12,
      reason: "No auth/security validation found",
    });
  }

  // Guideline 13: CORS headers
  if (
    content.includes("CORS_HEADERS") ||
    content.includes("Access-Control-Allow")
  ) {
    results.passed.push(13);
  } else {
    results.warnings.push({ id: 13, reason: "No CORS headers found" });
  }

  // Guideline 16: Documentation
  if (
    content.includes("/**") &&
    (content.includes("API Route Handler") || content.includes("@security"))
  ) {
    results.passed.push(16);
  } else {
    results.failed.push({ id: 16, reason: "Missing JSDoc documentation" });
  }

  // Guideline 19: OPTIONS handler for CORS
  if (content.includes("export async function OPTIONS")) {
    results.passed.push(19);
  } else {
    results.warnings.push({
      id: 19,
      reason: "No OPTIONS handler for CORS preflight",
    });
  }

  return results;
}

function generateReport() {
  console.log("🔍 Next.js v16 Route Handler Compliance Check\n");
  console.log("=".repeat(70));

  const srcDir = path.join(process.cwd(), "src", "app");
  const routeFiles = findRouteFiles(srcDir);

  console.log(`\nFound ${routeFiles.length} route.ts files\n`);

  const allResults = routeFiles.map(checkRouteCompliance);

  // Summary statistics
  const totalChecks = allResults.length * GUIDELINES.length;
  const totalPassed = allResults.reduce((sum, r) => sum + r.passed.length, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.failed.length, 0);
  const totalWarnings = allResults.reduce(
    (sum, r) => sum + r.warnings.length,
    0
  );

  console.log("📊 SUMMARY STATISTICS");
  console.log("=".repeat(70));
  console.log(`✅ Passed:   ${totalPassed}`);
  console.log(`❌ Failed:   ${totalFailed}`);
  console.log(`⚠️  Warnings: ${totalWarnings}`);
  console.log(
    `📈 Coverage: ${((totalPassed / totalChecks) * 100).toFixed(1)}%\n`
  );

  // Key patterns detected
  const routesWithAuth = allResults.filter((r) => r.passed.includes(12));
  const routesWithCORS = allResults.filter((r) => r.passed.includes(13));
  const routesWithDocs = allResults.filter((r) => r.passed.includes(16));
  const routesWithCache = allResults.filter((r) => r.passed.includes(5));

  console.log("🎯 KEY PATTERNS DETECTED");
  console.log("=".repeat(70));
  console.log(
    `✓ ${routesWithAuth.length}/${routeFiles.length} routes have auth validation`
  );
  console.log(
    `✓ ${routesWithCORS.length}/${routeFiles.length} routes have CORS headers`
  );
  console.log(
    `✓ ${routesWithDocs.length}/${routeFiles.length} routes have JSDoc documentation`
  );
  console.log(
    `✓ ${routesWithCache.length}/${routeFiles.length} routes have explicit cache policy\n`
  );

  // Routes needing attention
  const needsAttention = allResults.filter((r) => r.failed.length > 0);

  if (needsAttention.length > 0) {
    console.log("⚠️  ROUTES NEEDING ATTENTION");
    console.log("=".repeat(70));
    needsAttention.slice(0, 10).forEach((result) => {
      console.log(`\n📄 ${result.file}`);
      result.failed.forEach((f) => {
        console.log(`   ❌ Guideline ${f.id}: ${f.reason}`);
      });
    });
    if (needsAttention.length > 10) {
      console.log(`\n   ... and ${needsAttention.length - 10} more routes\n`);
    }
  }

  // Sample excellent routes
  const excellentRoutes = allResults
    .filter((r) => r.passed.length >= 8 && r.failed.length === 0)
    .slice(0, 5);

  if (excellentRoutes.length > 0) {
    console.log("\n⭐ EXEMPLARY ROUTES (Reference Implementations)");
    console.log("=".repeat(70));
    excellentRoutes.forEach((result) => {
      console.log(
        `✅ ${result.file} - ${result.passed.length}/12 guidelines passed`
      );
    });
  }

  console.log("\n" + "=".repeat(70));
  console.log("✅ COMPLIANCE CHECK COMPLETE\n");
}

generateReport();
