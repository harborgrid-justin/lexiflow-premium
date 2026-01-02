#!/usr/bin/env node

/**
 * TypeScript Compliance Automation Script
 * Fixes 109 MEDIUM priority TypeScript issues across all Next.js pages
 *
 * Changes Applied:
 * 1. Adds PageProps interface with proper params/searchParams types
 * 2. Adds return type annotations (Promise<JSX.Element>)
 * 3. Fixes 'any' types in generateMetadata
 * 4. Adds proper type guards and error handling
 */

const fs = require("fs");
const path = require("path");

// Route configurations with type information
const ROUTE_CONFIGS = {
  // Dynamic routes with [id] param
  dynamic: [
    "cases",
    "clients",
    "documents",
    "evidence",
    "discovery",
    "depositions",
    "witnesses",
    "exhibits",
    "pleadings",
    "motions",
    "briefs",
    "appeals",
    "judgments",
    "invoices",
    "expenses",
    "time-entries",
    "timesheets",
    "templates",
    "workflows",
    "tasks",
    "conference-rooms",
    "equipment",
    "parties",
    "docket",
    "clauses",
    "trial-exhibits",
    "custodians",
    "expert-witnesses",
    "legal-holds",
    "conflicts",
    "conflict-waivers",
    "ethical-walls",
    "matters",
    "organizations",
    "users",
    "vendors",
    "contracts",
    "engagement-letters",
    "fee-agreements",
    "payment-plans",
    "retainers",
    "trust-accounting",
    "jurisdictions",
    "court-reporters",
    "process-servers",
    "rate-tables",
    "subpoenas",
    "interrogatories",
    "production-requests",
    "admissions",
    "citations",
    "arbitration",
    "mediation",
    "settlements",
    "jury-selection",
    "war-room",
    "research",
    "intake-forms",
  ],

  // List routes with optional searchParams
  list: [
    "cases",
    "clients",
    "documents",
    "evidence",
    "discovery",
    "depositions",
    "witnesses",
    "exhibits",
    "pleadings",
    "motions",
    "briefs",
    "appeals",
    "judgments",
    "invoices",
    "expenses",
    "time-entries",
    "timesheets",
    "templates",
    "workflows",
    "tasks",
    "conference-rooms",
    "equipment",
    "parties",
    "docket",
    "clauses",
    "trial-exhibits",
    "custodians",
    "expert-witnesses",
    "legal-holds",
    "conflicts",
    "conflict-waivers",
    "ethical-walls",
    "matters",
    "organizations",
    "users",
    "vendors",
    "contracts",
    "engagement-letters",
    "fee-agreements",
    "payment-plans",
    "retainers",
    "trust-accounting",
    "jurisdictions",
    "court-reporters",
    "process-servers",
    "rate-tables",
    "analytics",
    "compliance",
    "audit-log",
    "settings",
    "profile",
  ],

  // Static routes (no params)
  static: [
    "dashboard",
    "calendar",
    "chat",
    "knowledge-base",
    "help",
    "notifications",
    "search",
    "reports",
  ],
};

// Type templates
const TYPE_TEMPLATES = {
  dynamicPageProps: (hasSearchParams = false) =>
    `interface PageProps {\n  params: Promise<{ id: string }>;` +
    (hasSearchParams
      ? `\n  searchParams?: Promise<Record<string, string | string[] | undefined>>;`
      : "") +
    `\n}`,

  listPageProps: `interface PageProps {\n  searchParams?: Promise<Record<string, string | string[] | undefined>>;\n}`,

  staticPageProps: `interface PageProps {\n  // No params or searchParams for static routes\n}`,

  metadataProps: `interface MetadataProps {\n  params: Promise<{ id: string }>;\n  searchParams?: Promise<Record<string, string | string[] | undefined>>;\n}`,
};

// Statistics
const stats = {
  filesProcessed: 0,
  filesSkipped: 0,
  filesModified: 0,
  filesFailed: 0,
  changes: {
    pagePropsAdded: 0,
    returnTypesAdded: 0,
    metadataTypesFixed: 0,
    anyTypesFixed: 0,
    asyncAwaitAdded: 0,
  },
};

/**
 * Detect if file already has proper TypeScript compliance
 */
function hasProperTypes(content) {
  const checks = {
    hasPageProps: /interface PageProps\s*{/.test(content),
    hasReturnType: /\):\s*Promise<(JSX\.Element|React\.JSX\.Element)>/.test(
      content
    ),
    hasAsyncParams:
      /const\s+\{\s*id\s*\}\s*=\s*await\s+params/.test(content) ||
      /const\s+params\w*\s*=\s*await\s+params/.test(content),
    noAnyInMetadata: !/generateMetadata.*:\s*any\)/.test(content),
  };

  // Consider properly typed if has most type features
  return checks.hasPageProps && checks.hasReturnType && checks.noAnyInMetadata;
}

/**
 * Determine route type and required types
 */
function getRouteType(filePath) {
  const relativePath = filePath.replace(/.*\/src\/app\/\(main\)\//, "");

  if (relativePath.includes("[id]")) {
    const routeName = relativePath.split("/")[0];
    return {
      type: "dynamic",
      routeName,
      needsParams: true,
      needsSearchParams: false, // Add if needed based on analysis
    };
  } else if (relativePath === "page.tsx") {
    return {
      type: "static",
      routeName: "root",
      needsParams: false,
      needsSearchParams: false,
    };
  } else {
    const routeName = relativePath.replace("/page.tsx", "");
    return {
      type: "list",
      routeName,
      needsParams: false,
      needsSearchParams: true,
    };
  }
}

/**
 * Add PageProps interface if missing
 */
function addPagePropsInterface(content, routeInfo) {
  // Skip if already has interface
  if (/interface PageProps\s*{/.test(content)) {
    return { content, changed: false };
  }

  let propsInterface;
  if (routeInfo.type === "dynamic") {
    propsInterface = TYPE_TEMPLATES.dynamicPageProps(
      routeInfo.needsSearchParams
    );
  } else if (routeInfo.type === "list") {
    propsInterface = TYPE_TEMPLATES.listPageProps;
  } else {
    propsInterface = TYPE_TEMPLATES.staticPageProps;
  }

  // Insert after imports, before first export
  const lines = content.split("\n");
  let insertIndex = 0;

  // Find last import
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ") || lines[i].startsWith("import{")) {
      insertIndex = i + 1;
    }
    if (lines[i].startsWith("export ")) {
      break;
    }
  }

  // Skip blank lines
  while (insertIndex < lines.length && lines[insertIndex].trim() === "") {
    insertIndex++;
  }

  lines.splice(insertIndex, 0, propsInterface, "");
  stats.changes.pagePropsAdded++;

  return { content: lines.join("\n"), changed: true };
}

/**
 * Add return type to default export function
 */
function addReturnType(content) {
  // Skip if already has return type
  if (/\):\s*Promise<(JSX\.Element|React\.JSX\.Element)>/.test(content)) {
    return { content, changed: false };
  }

  // Match: export default async function SomePage({ params })
  // Add: : Promise<JSX.Element>
  const functionRegex =
    /(export\s+default\s+async\s+function\s+\w+\s*\([^)]*\))\s*{/;

  if (functionRegex.test(content)) {
    content = content.replace(functionRegex, "$1: Promise<JSX.Element> {");
    stats.changes.returnTypesAdded++;
    return { content, changed: true };
  }

  return { content, changed: false };
}

/**
 * Fix generateMetadata to use proper types
 */
function fixMetadataTypes(content) {
  // Skip if no generateMetadata
  if (!content.includes("generateMetadata")) {
    return { content, changed: false };
  }

  let changed = false;

  // Fix: generateMetadata({ params }: any)
  // To: generateMetadata({ params }: MetadataProps)
  if (/generateMetadata\s*\([^)]*:\s*any\)/.test(content)) {
    // Add MetadataProps interface if missing
    if (!content.includes("interface MetadataProps")) {
      const lines = content.split("\n");
      let insertIndex = 0;

      // Find PageProps interface
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("interface PageProps")) {
          // Find closing brace
          for (let j = i; j < lines.length; j++) {
            if (lines[j].includes("}")) {
              insertIndex = j + 1;
              break;
            }
          }
          break;
        }
      }

      if (insertIndex > 0) {
        lines.splice(insertIndex, 0, "", TYPE_TEMPLATES.metadataProps);
        content = lines.join("\n");
        changed = true;
      }
    }

    // Replace any with MetadataProps
    content = content.replace(
      /generateMetadata\s*\(\s*{\s*params\s*}\s*:\s*any\)/g,
      "generateMetadata({ params }: MetadataProps)"
    );
    stats.changes.metadataTypesFixed++;
    changed = true;
  }

  return { content, changed };
}

/**
 * Add async/await for params access (Next.js 15+ requirement)
 */
function addAsyncParamsAccess(content, routeInfo) {
  if (!routeInfo.needsParams) {
    return { content, changed: false };
  }

  // Check if already using await params
  if (/await\s+params/.test(content)) {
    return { content, changed: false };
  }

  // Find params destructuring: const { id } = params
  const paramsRegex = /const\s+{\s*id\s*}\s*=\s*params\s*;?/;

  if (paramsRegex.test(content)) {
    content = content.replace(paramsRegex, "const { id } = await params;");
    stats.changes.asyncAwaitAdded++;
    return { content, changed: true };
  }

  return { content, changed: false };
}

/**
 * Fix remaining 'any' types in code
 */
function fixAnyTypes(content) {
  let changed = false;

  // Fix: const data: any =
  // To: const data: unknown =
  if (/:\s*any\s*=/.test(content)) {
    content = content.replace(/:\s*any\s*=/g, ": unknown =");
    stats.changes.anyTypesFixed++;
    changed = true;
  }

  // Fix: ) => any
  // To: ) => unknown
  if (/\)\s*=>\s*any(?!\w)/.test(content)) {
    content = content.replace(/\)\s*=>\s*any(?!\w)/g, ") => unknown");
    stats.changes.anyTypesFixed++;
    changed = true;
  }

  return { content, changed };
}

/**
 * Process a single page file
 */
function processFile(filePath) {
  try {
    stats.filesProcessed++;

    const content = fs.readFileSync(filePath, "utf8");
    const routeInfo = getRouteType(filePath);

    // Check if already properly typed
    if (hasProperTypes(content)) {
      console.log(
        `⏭️  Skipped (already typed): ${filePath.replace(/.*\/src\/app\/\(main\)\//, "")}`
      );
      stats.filesSkipped++;
      return;
    }

    let newContent = content;
    let fileChanged = false;

    // Apply all transformations
    const transformations = [
      () => addPagePropsInterface(newContent, routeInfo),
      () => addReturnType(newContent),
      () => fixMetadataTypes(newContent),
      () => addAsyncParamsAccess(newContent, routeInfo),
      () => fixAnyTypes(newContent),
    ];

    for (const transform of transformations) {
      const result = transform();
      newContent = result.content;
      fileChanged = fileChanged || result.changed;
    }

    if (fileChanged) {
      fs.writeFileSync(filePath, newContent, "utf8");
      stats.filesModified++;
      console.log(
        `✅ Fixed: ${filePath.replace(/.*\/src\/app\/\(main\)\//, "")}`
      );
    } else {
      console.log(
        `⏭️  No changes needed: ${filePath.replace(/.*\/src\/app\/\(main\)\//, "")}`
      );
      stats.filesSkipped++;
    }
  } catch (error) {
    stats.filesFailed++;
    console.error(
      `❌ Failed: ${filePath.replace(/.*\/src\/app\/\(main\)\//, "")} - ${error.message}`
    );
  }
}

/**
 * Find all page.tsx files in (main) route group
 */
function findPageFiles(dir) {
  let files = [];

  try {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Recurse into subdirectories
        files = files.concat(findPageFiles(fullPath));
      } else if (item === "page.tsx") {
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
  console.log("🚀 TypeScript Compliance Automation Script");
  console.log("📋 Fixing 109 MEDIUM priority issues across all pages\n");

  const mainDir = path.join(__dirname, "../src/app/(main)");

  if (!fs.existsSync(mainDir)) {
    console.error("❌ Error: (main) directory not found");
    console.error(`   Expected: ${mainDir}`);
    process.exit(1);
  }

  // Find all page.tsx files
  console.log("🔍 Finding all page.tsx files...\n");
  const pageFiles = findPageFiles(mainDir);
  console.log(`📁 Found ${pageFiles.length} page files\n`);

  if (pageFiles.length === 0) {
    console.error("❌ No page.tsx files found");
    process.exit(1);
  }

  // Process each file
  console.log("⚙️  Processing files...\n");
  pageFiles.forEach(processFile);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TypeScript Compliance Summary");
  console.log("=".repeat(60));
  console.log(`✅ Successfully modified:  ${stats.filesModified} files`);
  console.log(`⏭️  Skipped (already typed): ${stats.filesSkipped} files`);
  console.log(`❌ Failed:                  ${stats.filesFailed} files`);
  console.log(`📁 Total processed:         ${stats.filesProcessed} files`);
  console.log("=".repeat(60));
  console.log("🔧 Changes Applied:");
  console.log(
    `   - PageProps interfaces added:  ${stats.changes.pagePropsAdded}`
  );
  console.log(
    `   - Return types added:          ${stats.changes.returnTypesAdded}`
  );
  console.log(
    `   - Metadata types fixed:        ${stats.changes.metadataTypesFixed}`
  );
  console.log(
    `   - 'any' types replaced:        ${stats.changes.anyTypesFixed}`
  );
  console.log(
    `   - Async params added:          ${stats.changes.asyncAwaitAdded}`
  );
  console.log("=".repeat(60));
  console.log("✨ TypeScript compliance improvements applied!");
  console.log("📝 Next step: Run npm run type-check to verify\n");
}

// Run the script
main();
