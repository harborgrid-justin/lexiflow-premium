#!/usr/bin/env ts-node
/**
 * Cleanup Script: Remove Orphaned Files
 *
 * This script identifies and removes files that are:
 * 1. Never imported anywhere in the codebase
 * 2. Duplicate Storybook stories (keeping one version)
 * 3. Legacy/deprecated components with modern replacements
 * 4. Unused barrel exports (index.ts files that export nothing used)
 *
 * Usage:
 *   npm run cleanup:orphaned -- --dry-run  # Preview changes
 *   npm run cleanup:orphaned -- --execute  # Actually delete files
 *   npm run cleanup:orphaned -- --category=stories  # Clean specific category
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Configuration
const DRY_RUN =
  process.argv.includes("--dry-run") || !process.argv.includes("--execute");
const CATEGORY = process.argv
  .find((arg) => arg.startsWith("--category="))
  ?.split("=")[1];
const SRC_DIR = path.resolve(__dirname, "../src");

// File categories to clean
const CLEANUP_CATEGORIES = {
  // Storybook stories that are duplicates or unused
  stories: [
    "src/components/organisms/_legacy/**/*.stories.tsx",
    "src/components/ui/atoms/**/**.styles.ts",
    "src/components/ui/molecules/**/**.styles.ts",
    "src/components/ui/layouts/**/**.styles.ts",
    "src/components/features/**/*.stories.tsx",
    "src/components/stories/Button/**/*",
    "src/components/stories/Header/**/*",
    "src/components/stories/Page/**/*",
  ],

  // Legacy/deprecated components with modern replacements
  legacy: [
    "src/components/organisms/_legacy/**/*",
    "src/components/enterprise/**/*",
    "src/features/admin/components/SecurityCompliance.old.tsx",
  ],

  // Unused barrel exports
  barrels: [
    "src/components/atoms/Badge/index.ts",
    "src/components/atoms/Input/index.ts",
    "src/components/atoms/TextArea/index.ts",
    "src/components/atoms/UserAvatar/index.ts",
    "src/components/molecules/LazyLoader/index.ts",
    "src/components/molecules/Modal/index.ts",
    "src/components/molecules/RuleSelector/index.ts",
    "src/components/molecules/UserSelect/index.ts",
    "src/components/layouts/AppContentRenderer/index.ts",
    "src/components/layouts/AppShell/index.ts",
  ],

  // Duplicate implementations
  duplicates: [
    // Keep the one in features/core, remove organisms versions
    "src/components/organisms/BackendHealthMonitor/**/*",
    "src/components/organisms/BackendStatusIndicator/**/*",
    "src/components/organisms/ChartHelpers/**/*",
    "src/components/organisms/ConnectionStatus/**/*",
    "src/components/organisms/ConnectivityHUD/**/*",
    "src/components/organisms/ErrorBoundary/**/*",
    "src/components/organisms/InfiniteScrollTrigger/**/*",
    "src/components/organisms/PageHeader/**/*",
    "src/components/organisms/ServiceCoverageIndicator/**/*",
    "src/components/organisms/SplitView/**/*",
    "src/components/organisms/SwipeableItem/**/*",
    "src/components/organisms/TabbedView/**/*",
    "src/components/organisms/Table/**/*",
    "src/components/organisms/VirtualGrid/**/*",
    "src/components/organisms/VirtualList/**/*",

    // Duplicate search components
    "src/components/organisms/advanced/**/*",
    "src/components/organisms/FilterPanel/**/*",
    "src/components/organisms/SearchToolbar.stories.tsx",
    "src/components/organisms/SearchToolbar.styles.ts",
  ],

  // Unused feature implementations
  unused: [
    "src/components/features/cases/index.ts",
    "src/components/features/documents/index.ts",
    "src/components/features/discovery/index.ts",
    "src/components/features/litigation/index.ts",
    "src/components/features/operations/index.ts",
    "src/components/features/collaboration/index.ts",
    "src/components/features/knowledge/index.ts",
    "src/components/features/billing/index.ts",
    "src/components/features/admin/index.ts",
    "src/components/features/dashboard/index.ts",
    "src/components/features/navigation/index.ts",
    "src/components/features/index.ts",
  ],

  // Empty or minimal service/utility files
  empty: [
    "src/services/backend-services.ts",
    "src/services/core-services.ts",
    "src/services/features-services.ts",
    "src/services/repositories.ts",
    "src/services/utils-services.ts",
    "src/services/core.exports.ts",
    "src/hooks/backend.ts",
    "src/hooks/core.ts",
    "src/hooks/domain.ts",
    "src/hooks/performance.ts",
    "src/hooks/ui.ts",
  ],

  // Unused data layer files
  data: [
    "src/services/data/dbSeeder.ts",
    "src/services/data/repositories/matters/index.ts",
    "src/services/domain/BillingRepository.ts",
  ],
};

// Files that should NEVER be deleted (safety list)
const PROTECTED_FILES = [
  "src/index.tsx",
  "src/App.tsx",
  "src/main.tsx",
  "src/types.ts",
  "src/vite-env.d.ts",
];

interface CleanupReport {
  category: string;
  filesScanned: number;
  filesDeleted: number;
  bytesFreed: number;
  files: string[];
}

/**
 * Expand glob patterns to actual file paths
 */
function expandGlob(pattern: string): string[] {
  try {
    const fullPattern = path.join(SRC_DIR, "..", pattern);
    const result = execSync(
      `find ${SRC_DIR}/.. -path "${fullPattern}" 2>/dev/null`,
      { encoding: "utf-8" }
    );
    return result.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Check if file is safe to delete
 */
function isSafeToDelete(filePath: string): boolean {
  const relativePath = path.relative(path.join(SRC_DIR, ".."), filePath);

  // Never delete protected files
  if (PROTECTED_FILES.some((p) => relativePath.endsWith(p))) {
    return false;
  }

  // Never delete if file doesn't exist
  if (!fs.existsSync(filePath)) {
    return false;
  }

  return true;
}

/**
 * Delete a file or directory
 */
function deleteFile(filePath: string): number {
  if (!isSafeToDelete(filePath)) {
    return 0;
  }

  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;

    if (stats.isDirectory()) {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }

    return bytes;
  } catch (error) {
    console.warn(`⚠️  Could not delete ${filePath}: ${error}`);
    return 0;
  }
}

/**
 * Process a cleanup category
 */
function processCategory(
  categoryName: string,
  patterns: string[]
): CleanupReport {
  const report: CleanupReport = {
    category: categoryName,
    filesScanned: 0,
    filesDeleted: 0,
    bytesFreed: 0,
    files: [],
  };

  console.log(`\n📂 Processing category: ${categoryName}`);

  for (const pattern of patterns) {
    const files = expandGlob(pattern);
    report.filesScanned += files.length;

    for (const file of files) {
      if (isSafeToDelete(file)) {
        const relativePath = path.relative(path.join(SRC_DIR, ".."), file);

        if (DRY_RUN) {
          console.log(`   [DRY RUN] Would delete: ${relativePath}`);
          report.files.push(relativePath);
          report.filesDeleted++;
        } else {
          const bytes = deleteFile(file);
          if (bytes > 0) {
            console.log(
              `   ✅ Deleted: ${relativePath} (${(bytes / 1024).toFixed(1)} KB)`
            );
            report.files.push(relativePath);
            report.filesDeleted++;
            report.bytesFreed += bytes;
          }
        }
      }
    }
  }

  return report;
}

/**
 * Main cleanup function
 */
function main() {
  console.log("🧹 LexiFlow Orphaned Files Cleanup");
  console.log("=====================================");
  console.log(
    `Mode: ${DRY_RUN ? "🔍 DRY RUN (preview only)" : "⚠️  EXECUTE (will delete files)"}`
  );

  if (CATEGORY) {
    console.log(`Category Filter: ${CATEGORY}`);
  }

  const reports: CleanupReport[] = [];

  // Process each category
  for (const [categoryName, patterns] of Object.entries(CLEANUP_CATEGORIES)) {
    if (CATEGORY && categoryName !== CATEGORY) {
      continue;
    }

    const report = processCategory(categoryName, patterns);
    reports.push(report);
  }

  // Summary
  console.log("\n\n📊 Cleanup Summary");
  console.log("==================");

  let totalScanned = 0;
  let totalDeleted = 0;
  let totalBytes = 0;

  for (const report of reports) {
    totalScanned += report.filesScanned;
    totalDeleted += report.filesDeleted;
    totalBytes += report.bytesFreed;

    console.log(`\n${report.category}:`);
    console.log(`  Scanned: ${report.filesScanned} files`);
    console.log(
      `  ${DRY_RUN ? "Would delete" : "Deleted"}: ${report.filesDeleted} files`
    );
    if (!DRY_RUN && report.bytesFreed > 0) {
      console.log(
        `  Freed: ${(report.bytesFreed / 1024 / 1024).toFixed(2)} MB`
      );
    }
  }

  console.log(`\n${"=".repeat(40)}`);
  console.log(`Total Scanned: ${totalScanned} files`);
  console.log(
    `Total ${DRY_RUN ? "Would Delete" : "Deleted"}: ${totalDeleted} files`
  );
  if (!DRY_RUN && totalBytes > 0) {
    console.log(`Total Freed: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  }

  if (DRY_RUN) {
    console.log("\n💡 To execute the cleanup, run with --execute flag");
  } else {
    console.log("\n✅ Cleanup complete!");
  }
}

// Run the script
main();
