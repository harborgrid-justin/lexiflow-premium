#!/usr/bin/env node

/**
 * Dynamic Route Optimization Script
 *
 * Automatically adds generateStaticParams to all dynamic [id] route pages
 * for Static Site Generation (SSG) optimization in Next.js 16.
 *
 * Features:
 * - Detects existing generateStaticParams functions
 * - Adds enterprise-grade SSG with fallback
 * - Preserves existing code structure
 * - Adds proper TypeScript types
 * - Includes revalidation strategies
 */

const fs = require("fs");
const path = require("path");

// Configuration for different entity types
const ENTITY_CONFIGS = {
  // Legal entities
  cases: { plural: "cases", singular: "case", revalidate: 3600 },
  clients: { plural: "clients", singular: "client", revalidate: 1800 },
  documents: { plural: "documents", singular: "document", revalidate: 600 },
  evidence: { plural: "evidence", singular: "evidence", revalidate: 3600 },
  discovery: { plural: "discovery", singular: "discovery", revalidate: 3600 },
  depositions: {
    plural: "depositions",
    singular: "deposition",
    revalidate: 3600,
  },
  witnesses: { plural: "witnesses", singular: "witness", revalidate: 1800 },
  exhibits: { plural: "exhibits", singular: "exhibit", revalidate: 3600 },

  // Court documents
  pleadings: { plural: "pleadings", singular: "pleading", revalidate: 3600 },
  motions: { plural: "motions", singular: "motion", revalidate: 3600 },
  briefs: { plural: "briefs", singular: "brief", revalidate: 3600 },
  appeals: { plural: "appeals", singular: "appeal", revalidate: 3600 },
  judgments: { plural: "judgments", singular: "judgment", revalidate: 3600 },

  // Business entities
  invoices: { plural: "invoices", singular: "invoice", revalidate: 1800 },
  expenses: { plural: "expenses", singular: "expense", revalidate: 1800 },
  "time-entries": {
    plural: "time-entries",
    singular: "time-entry",
    revalidate: 900,
  },
  timesheets: { plural: "timesheets", singular: "timesheet", revalidate: 900 },

  // Configuration
  templates: { plural: "templates", singular: "template", revalidate: 7200 },
  workflows: { plural: "workflows", singular: "workflow", revalidate: 3600 },
  tasks: { plural: "tasks", singular: "task", revalidate: 600 },

  // Default for unmapped entities
  _default: { revalidate: 3600 },
};

/**
 * Generate the generateStaticParams function code
 */
function generateStaticParamsCode(entityName, config) {
  const endpoint = entityName.toUpperCase().replace(/-/g, "_");
  const revalidate = config.revalidate || 3600;

  return `
// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = ${revalidate}; // Revalidate every ${revalidate / 60} minutes

/**
 * Generate static params for ${entityName} detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of ${entityName} IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.${endpoint}.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(\`[generateStaticParams] Failed to fetch ${entityName} list:\`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}
`;
}

/**
 * Check if file already has generateStaticParams
 */
function hasGenerateStaticParams(content) {
  return (
    content.includes("generateStaticParams") ||
    content.includes("export const dynamic") ||
    content.includes("export const revalidate")
  );
}

/**
 * Add generateStaticParams to a page file
 */
function addGenerateStaticParams(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  // Skip if already has SSG configuration
  if (hasGenerateStaticParams(content)) {
    console.log(
      `⏭️  Skipped (already optimized): ${path.relative(process.cwd(), filePath)}`
    );
    return { status: "skipped", reason: "already_optimized" };
  }

  // Extract entity name from path (e.g., /cases/[id]/page.tsx -> cases)
  const pathParts = filePath.split(path.sep);
  const idIndex = pathParts.findIndex((part) => part === "[id]");
  const entityName = idIndex > 0 ? pathParts[idIndex - 1] : "unknown";

  // Get configuration for this entity
  const config = ENTITY_CONFIGS[entityName] || ENTITY_CONFIGS._default;

  // Generate the SSG code
  const ssgCode = generateStaticParamsCode(entityName, config);

  // Find insertion point (after imports, before first export default)
  const lines = content.split("\n");
  let insertIndex = -1;
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track last import
    if (line.startsWith("import ") || line.startsWith("} from ")) {
      lastImportIndex = i;
    }

    // Find first export (metadata or default)
    if (
      line.startsWith("export async function generateMetadata") ||
      line.startsWith("export default async function")
    ) {
      insertIndex = i;
      break;
    }
  }

  // Insert after imports
  if (insertIndex === -1) {
    insertIndex = lastImportIndex + 2;
  }

  // Insert SSG code
  lines.splice(insertIndex, 0, ssgCode);
  const newContent = lines.join("\n");

  // Write back to file
  fs.writeFileSync(filePath, newContent, "utf8");

  console.log(
    `✅ Added SSG: ${path.relative(process.cwd(), filePath)} (revalidate: ${config.revalidate}s)`
  );
  return {
    status: "success",
    entity: entityName,
    revalidate: config.revalidate,
  };
}

/**
 * Process all dynamic route pages
 */
function processDynamicRoutes() {
  const { execSync } = require("child_process");

  console.log("🔍 Finding all dynamic [id] route pages...\n");

  // Find all [id]/page.tsx files
  const files = execSync('find src/app -type f -path "*/\\[id\\]/*.tsx"', {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  console.log(`Found ${files.length} dynamic route pages\n`);
  console.log("📝 Processing files...\n");

  const results = {
    success: 0,
    skipped: 0,
    failed: 0,
    files: [],
  };

  files.forEach((file) => {
    try {
      const result = addGenerateStaticParams(file);
      if (result.status === "success") {
        results.success++;
        results.files.push({ file, ...result });
      } else if (result.status === "skipped") {
        results.skipped++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      results.failed++;
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Successfully optimized: ${results.success} files`);
  console.log(`⏭️  Skipped (already optimized): ${results.skipped} files`);
  console.log(`❌ Failed: ${results.failed} files`);
  console.log(`📁 Total files processed: ${files.length}`);
  console.log("=".repeat(60));

  if (results.success > 0) {
    console.log("\n✨ Next.js 16 SSG optimization complete!");
    console.log("\n💡 Benefits:");
    console.log("   • Pages pre-rendered at build time");
    console.log("   • Faster initial page loads");
    console.log("   • Better SEO");
    console.log("   • Reduced server load");
    console.log("   • Automatic background revalidation");
  }

  return results;
}

// Run the script
if (require.main === module) {
  try {
    const results = processDynamicRoutes();
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

module.exports = { addGenerateStaticParams, processDynamicRoutes };
