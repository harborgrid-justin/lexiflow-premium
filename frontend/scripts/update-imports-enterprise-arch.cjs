#!/usr/bin/env node
/**
 * Enterprise Architecture Import Update Script
 *
 * Updates import paths to match the new feature-based architecture:
 * - Old: @/components/atoms/Button -> New: @/shared/ui/atoms/Button
 * - Old: @/components/dashboard -> New: @/features/dashboard
 * - Old: @/utils/dateUtils -> New: @/shared/lib/dateUtils
 * - Old: @/hooks/useDebounce -> New: @/shared/hooks/useDebounce
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Color output helpers
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Import path transformations
const transformations = [
  // Shared UI components
  { from: /from ['"]@\/components\/atoms\//g, to: `from '@/shared/ui/atoms/` },
  {
    from: /from ['"]@\/components\/molecules\//g,
    to: `from '@/shared/ui/molecules/`,
  },
  {
    from: /from ['"]@\/components\/organisms\//g,
    to: `from '@/shared/ui/organisms/`,
  },
  { from: /from ['"]@\/components\/theme\//g, to: `from '@/shared/ui/theme/` },

  // Generic utilities
  {
    from: /from ['"]@\/utils\/(cn|dateUtils|formatDate|formatUtils|stringUtils|idGenerator|validation|sanitize)/g,
    to: `from '@/shared/lib/$1`,
  },
  { from: /from ['"]@\/lib\/utils/g, to: `from '@/shared/lib/utils` },

  // Generic hooks
  {
    from: /from ['"]@\/hooks\/(useDebounce|useToggle|useClickOutside|useInterval|useResizeObserver|useIntersectionObserver|useFormId|useKeyboardNav|useScrollLock|useHoverIntent|useArrayState|useMemoized)/g,
    to: `from '@/shared/hooks/$1`,
  },

  // Feature consolidation
  {
    from: /from ['"]@\/components\/dashboard\//g,
    to: `from '@/features/dashboard/`,
  },
  {
    from: /from ['"]@\/components\/features\/dashboard\//g,
    to: `from '@/features/dashboard/`,
  },
  {
    from: /from ['"]@\/components\/billing\//g,
    to: `from '@/features/operations/billing/components/time-tracking/`,
  },
  {
    from: /from ['"]@\/components\/features\/billing\//g,
    to: `from '@/features/operations/billing/`,
  },
  {
    from: /from ['"]@\/components\/features\/cases\//g,
    to: `from '@/features/cases/ui/`,
  },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    transformations.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      return true;
    }
    return false;
  } catch (error) {
    log.warning(`Failed to process ${filePath}: ${error.message}`);
    return false;
  }
}

function findFiles(directory, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const files = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, build, dist
        if (["node_modules", "build", "dist", ".git"].includes(entry.name)) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(directory);
  return files;
}

// Main execution
log.section("🏗️  Enterprise Architecture Import Migration");

const srcDir = path.join(__dirname, "..", "src");
log.info(`Scanning ${srcDir}...`);

const files = findFiles(srcDir);
log.info(`Found ${files.length} files to process`);

log.section("📝 Updating imports...");

let updatedCount = 0;
files.forEach((file, index) => {
  if ((index + 1) % 50 === 0) {
    process.stdout.write(
      `\r${colors.cyan}Progress: ${index + 1}/${files.length}${colors.reset}`
    );
  }

  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(""); // New line after progress
log.section("📊 Summary");
log.success(`Updated ${updatedCount} files`);
log.info(`Skipped ${files.length - updatedCount} files (no changes needed)`);

log.section("✅ Migration complete!");
log.info("Next steps:");
log.info("1. Run: npm run typecheck");
log.info("2. Fix any remaining import errors manually");
log.info("3. Test the application");
log.info(
  "4. Remove old directories: components/atoms, components/molecules, components/features"
);

process.exit(0);
