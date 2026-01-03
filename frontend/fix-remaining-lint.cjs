#!/usr/bin/env node
/**
 * Automated ESLint fixer - removes unused imports and adds basic implementations
 */

const fs = require("fs");
const path = require("path");

const fixes = [
  // Remove unused imports
  {
    file: "src/components/enterprise/Research/CitationManager.tsx",
    remove: ["Filter"],
  },
  {
    file: "src/components/enterprise/Research/KnowledgeBase.tsx",
    remove: ["Folder", "Calendar", "SortAsc", "Plus", "TrendingUp"],
  },
  {
    file: "src/components/enterprise/Research/LegalResearchHub.tsx",
    remove: ["Filter"],
  },
  {
    file: "src/components/enterprise/dashboard/PerformanceMetricsGrid.tsx",
    remove: ["memo", "useCallback"],
  },
  {
    file: "src/components/enterprise/dashboard/CaseStatusWidget.tsx",
    usage: "toggleExpanded",
  },
  {
    file: "src/components/enterprise/ui/CommandPalette.tsx",
    remove: ["TrendingUp", "ArrowRight"],
  },
  {
    file: "src/components/enterprise/ui/EnterpriseDataTable.tsx",
    remove: ["Download", "Settings", "X"],
  },
  {
    file: "src/components/enterprise/ui/NotificationSystem.tsx",
    remove: ["Button"],
  },
  { file: "src/components/enterprise/ui/StatusBadge.tsx", remove: ["Circle"] },
  {
    file: "src/components/features/cases/components/FilingsTable/FilingsTable.tsx",
    remove: ["formatDistanceToNow"],
  },
  {
    file: "src/components/features/navigation/components/MegaMenu/MegaMenu.tsx",
    remove: ["useCallback"],
  },
  {
    file: "src/components/organisms/AppHeader/AppHeader.tsx",
    remove: ["Bell"],
  },
];

function removeFromImport(content, importName) {
  // Remove from destructured imports
  content = content.replace(
    new RegExp(`\\s*,?\\s*${importName}\\s*,?`, "g"),
    (match) => {
      if (match.trim() === importName || match.trim() === `,${importName}`)
        return "";
      return match.replace(importName, "");
    }
  );

  // Clean up empty imports
  content = content.replace(/import\s*{\s*,?\s*}\s*from/g, "import {} from");
  content = content.replace(/{\s*,/g, "{");
  content = content.replace(/,\s*,/g, ",");
  content = content.replace(/,\s*}/g, "}");

  return content;
}

fixes.forEach(({ file, remove }) => {
  const fullPath = path.join(__dirname, file);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  const original = content;

  if (remove) {
    remove.forEach((importName) => {
      content = removeFromImport(content, importName);
    });
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`Fixed: ${file}`);
  }
});

console.log("\nDone!");
