#!/usr/bin/env node
/**
 * Comprehensive Import Path Migration
 * Updates all imports from old component structure to new shared/features architecture
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

// Comprehensive import transformations
const transformations = [
  // UI Components - atoms
  { from: /from ['"]@\/components\/ui\/atoms\/Button\/Button['"]/g, to: `from '@/shared/ui/atoms/Button/Button'` },
  { from: /from ['"]@\/components\/ui\/atoms\/Button['"]/g, to: `from '@/shared/ui/atoms/Button'` },
  { from: /from ['"]@\/components\/ui\/atoms\/Badge\/Badge['"]/g, to: `from '@/shared/ui/atoms/Badge/Badge'` },
  { from: /from ['"]@\/components\/ui\/atoms\/Badge['"]/g, to: `from '@/shared/ui/atoms/Badge'` },
  { from: /from ['"]@\/components\/ui\/atoms\/Input\/Input['"]/g, to: `from '@/shared/ui/atoms/Input/Input'` },
  { from: /from ['"]@\/components\/ui\/atoms\/Input['"]/g, to: `from '@/shared/ui/atoms/Input'` },
  { from: /from ['"]@\/components\/ui\/atoms\/TextArea['"]/g, to: `from '@/shared/ui/atoms/TextArea'` },
  { from: /from ['"]@\/components\/ui\/atoms\/UserAvatar['"]/g, to: `from '@/shared/ui/atoms/UserAvatar'` },

  // UI Components - molecules
  { from: /from ['"]@\/components\/ui\/molecules\/Card\/Card['"]/g, to: `from '@/shared/ui/molecules/Card/Card'` },
  { from: /from ['"]@\/components\/ui\/molecules\/Card['"]/g, to: `from '@/shared/ui/molecules/Card'` },
  { from: /from ['"]@\/components\/ui\/molecules\/Modal\/Modal['"]/g, to: `from '@/shared/ui/molecules/Modal/Modal'` },
  { from: /from ['"]@\/components\/ui\/molecules\/Modal['"]/g, to: `from '@/shared/ui/molecules/Modal'` },
  { from: /from ['"]@\/components\/ui\/molecules\/LazyLoader\/LazyLoader['"]/g, to: `from '@/shared/ui/molecules/LazyLoader/LazyLoader'` },
  { from: /from ['"]@\/components\/ui\/molecules\/LazyLoader['"]/g, to: `from '@/shared/ui/molecules/LazyLoader'` },
  { from: /from ['"]@\/components\/ui\/molecules\/MetricCard\/MetricCard['"]/g, to: `from '@/shared/ui/molecules/MetricCard/MetricCard'` },
  { from: /from ['"]@\/components\/ui\/molecules\/EmptyState\/EmptyState['"]/g, to: `from '@/shared/ui/molecules/EmptyState/EmptyState'` },
  { from: /from ['"]@\/components\/ui\/molecules\/Tabs\/Tabs['"]/g, to: `from '@/shared/ui/molecules/Tabs/Tabs'` },
  { from: /from ['"]@\/components\/ui\/molecules\/AdaptiveLoader\/AdaptiveLoader['"]/g, to: `from '@/shared/ui/molecules/AdaptiveLoader/AdaptiveLoader'` },
  { from: /from ['"]@\/components\/ui\/molecules\/RuleSelector['"]/g, to: `from '@/shared/ui/molecules/RuleSelector'` },
  { from: /from ['"]@\/components\/ui\/molecules\/UserSelect['"]/g, to: `from '@/shared/ui/molecules/UserSelect'` },

  // UI Components - organisms
  { from: /from ['"]@\/components\/ui\/organisms\//g, to: `from '@/shared/ui/organisms/` },

  // Layouts
  { from: /from ['"]@\/components\/ui\/layouts\/PageContainerLayout\/PageContainerLayout['"]/g, to: `from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout'` },
  { from: /from ['"]@\/components\/ui\/layouts\//g, to: `from '@/shared/ui/layouts/` },

  // Generic catch-all for any remaining @/components/ui
  { from: /from ['"]@\/components\/ui\//g, to: `from '@/shared/ui/` },

  // Generic utilities
  { from: /from ['"]@\/utils\/cn['"]/g, to: `from '@/shared/lib/cn'` },
  { from: /from ['"]@\/utils\/dateUtils['"]/g, to: `from '@/shared/lib/dateUtils'` },
  { from: /from ['"]@\/utils\/formatDate['"]/g, to: `from '@/shared/lib/formatDate'` },
  { from: /from ['"]@\/utils\/formatUtils['"]/g, to: `from '@/shared/lib/formatUtils'` },
  { from: /from ['"]@\/utils\/stringUtils['"]/g, to: `from '@/shared/lib/stringUtils'` },
  { from: /from ['"]@\/utils\/idGenerator['"]/g, to: `from '@/shared/lib/idGenerator'` },
  { from: /from ['"]@\/utils\/validation['"]/g, to: `from '@/shared/lib/validation'` },
  { from: /from ['"]@\/utils\/sanitize['"]/g, to: `from '@/shared/lib/sanitize'` },

  // Generic hooks
  { from: /from ['"]@\/hooks\/useDebounce['"]/g, to: `from '@/shared/hooks/useDebounce'` },
  { from: /from ['"]@\/hooks\/useToggle['"]/g, to: `from '@/shared/hooks/useToggle'` },
  { from: /from ['"]@\/hooks\/useClickOutside['"]/g, to: `from '@/shared/hooks/useClickOutside'` },
  { from: /from ['"]@\/hooks\/useInterval['"]/g, to: `from '@/shared/hooks/useInterval'` },
  { from: /from ['"]@\/hooks\/useResizeObserver['"]/g, to: `from '@/shared/hooks/useResizeObserver'` },
  { from: /from ['"]@\/hooks\/useIntersectionObserver['"]/g, to: `from '@/shared/hooks/useIntersectionObserver'` },
  { from: /from ['"]@\/hooks\/useFormId['"]/g, to: `from '@/shared/hooks/useFormId'` },
  { from: /from ['"]@\/hooks\/useKeyboardNav['"]/g, to: `from '@/shared/hooks/useKeyboardNav'` },
  { from: /from ['"]@\/hooks\/useScrollLock['"]/g, to: `from '@/shared/hooks/useScrollLock'` },
  { from: /from ['"]@\/hooks\/useHoverIntent['"]/g, to: `from '@/shared/hooks/useHoverIntent'` },
  { from: /from ['"]@\/hooks\/useArrayState['"]/g, to: `from '@/shared/hooks/useArrayState'` },
  { from: /from ['"]@\/hooks\/useMemoized['"]/g, to: `from '@/shared/hooks/useMemoized'` },
];

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    transformations.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Failed to process ${filePath}: ${error.message}`);
    return false;
  }
}

function findFiles(directory, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];

  function walk(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          if (['node_modules', 'build', 'dist', '.git', '.react-router'].includes(entry.name)) {
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
    } catch (error) {
      log.warning(`Skipping directory ${dir}: ${error.message}`);
    }
  }

  walk(directory);
  return files;
}

// Main execution
log.section('🔧 Comprehensive Import Path Migration');

const srcDir = path.join(__dirname, '..', 'src');
log.info(`Scanning ${srcDir}...`);

const files = findFiles(srcDir);
log.info(`Found ${files.length} files to process`);

log.section('📝 Updating imports...');

let updatedCount = 0;
let progressInterval = Math.max(1, Math.floor(files.length / 20));

files.forEach((file, index) => {
  if ((index + 1) % progressInterval === 0) {
    process.stdout.write(`\r${colors.cyan}Progress: ${index + 1}/${files.length} (${Math.floor((index + 1) / files.length * 100)}%)${colors.reset}`);
  }

  if (updateFile(file)) {
    updatedCount++;
  }
});

console.log(''); // New line after progress
log.section('📊 Summary');
log.success(`Updated ${updatedCount} files`);
log.info(`Skipped ${files.length - updatedCount} files (no changes needed)`);

log.section('✅ Migration complete!');
log.info('Next steps:');
log.info('1. Run: npm run type-check');
log.info('2. Verify changes with: git diff');
log.info('3. Test the application');

process.exit(0);
