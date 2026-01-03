#!/usr/bin/env node
/**
 * Script to fix ESLint unused variable errors by removing unused imports
 */

const fs = require("fs");
const path = require("path");

const filesToFix = [
  // Files with simple unused imports that can be safely removed
  {
    path: "src/components/enterprise/EnterpriseDashboard.tsx",
    removeImports: [
      "AnimatePresence",
      "TrendingUp",
      "Calendar",
      "PieChart",
      "FileText",
      "XCircle",
      "Minus",
      "Filter",
      "LineChart",
      "RechartsPieChart",
      "Pie",
    ],
  },
  {
    path: "src/components/enterprise/CRM/BusinessDevelopment.tsx",
    removeImports: [
      "TrendingUp",
      "PieChart",
      "Send",
      "Edit",
      "Eye",
      "Download",
      "ArrowUpRight",
      "Filter",
    ],
  },
  {
    path: "src/components/enterprise/CRM/ClientAnalytics.tsx",
    removeImports: [
      "Users",
      "PieChart",
      "BarChart3",
      "Target",
      "Area",
      "AreaChart",
      "Client",
    ],
  },
  {
    path: "src/components/enterprise/CRM/ClientPortal.tsx",
    removeImports: ["Card", "Mail"],
  },
  {
    path: "src/components/enterprise/CRM/EnterpriseCRM.tsx",
    removeImports: [
      "Clock",
      "Target",
      "Briefcase",
      "AlertCircle",
      "CheckCircle2",
      "ContactPerson",
      "ClientActivity",
    ],
  },
  {
    path: "src/components/enterprise/CRM/IntakeManagement.tsx",
    removeImports: ["Card", "Upload", "EngagementLetter"],
  },
  {
    path: "src/components/enterprise/CaseManagement/CaseBudget.tsx",
    removeImports: ["TrendingDown", "Calendar", "BarChart3", "Filter"],
  },
  {
    path: "src/components/enterprise/CaseManagement/CaseTeam.tsx",
    removeImports: [
      "UserMinus",
      "Filter",
      "Calendar",
      "Award",
      "ExternalLink",
      "Settings",
      "Download",
      "ROLE_TEMPLATES",
    ],
  },
  {
    path: "src/components/enterprise/CaseManagement/CaseTemplates.tsx",
    removeImports: [
      "Trash2",
      "Briefcase",
      "Check",
      "ChevronRight",
      "Filter",
      "MoreVertical",
    ],
  },
  {
    path: "src/components/enterprise/CaseManagement/EnhancedCaseTimeline.tsx",
    removeImports: ["Filter"],
  },
  {
    path: "src/components/enterprise/CaseManagement/EnterpriseCaseList.tsx",
    removeImports: [
      "MatterType",
      "Check",
      "X",
      "Calendar",
      "DollarSign",
      "Star",
      "ChevronDown",
      "Eye",
      "EyeOff",
    ],
  },
  {
    path: "src/components/enterprise/Discovery/EDiscoveryDashboard.tsx",
    removeImports: ["AlertCircle", "TrendingUp", "Shield"],
  },
  {
    path: "src/components/enterprise/Discovery/EvidenceChainOfCustody.tsx",
    removeImports: ["Filter", "Upload", "Edit"],
  },
  {
    path: "src/components/enterprise/Discovery/ExhibitOrganizer.tsx",
    removeImports: [
      "Filter",
      "Upload",
      "Maximize2",
      "Copy",
      "Share2",
      "Printer",
    ],
  },
  {
    path: "src/components/enterprise/Discovery/PrivilegeLog.tsx",
    removeImports: ["Tag", "FileText", "Calendar", "Users", "Mail"],
  },
  {
    path: "src/components/enterprise/Discovery/ProductionManager.tsx",
    removeImports: ["Upload", "AlertCircle", "Users", "Settings", "Trash2"],
  },
];

function removeUnusedImports(filePath, importsToRemove) {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");

  importsToRemove.forEach((importName) => {
    // Remove from named imports
    content = content.replace(
      new RegExp(`,\\s*${importName}\\s*(?=,|})`, "g"),
      ""
    );
    content = content.replace(new RegExp(`{\\s*${importName}\\s*,`, "g"), "{");
    content = content.replace(new RegExp(`,\\s*${importName}\\s*}`, "g"), "}");
    content = content.replace(new RegExp(`{\\s*${importName}\\s*}`, "g"), "");

    // Remove standalone declarations
    content = content.replace(
      new RegExp(`^\\s*const\\s+${importName}\\s*=.*?;\\s*$`, "gm"),
      ""
    );
    content = content.replace(
      new RegExp(`^\\s*interface\\s+${importName}\\s*{[^}]*}\\s*$`, "gm"),
      ""
    );
  });

  // Clean up empty import lines
  content = content.replace(
    /import\s*{\s*}\s*from\s*['"][^'"]+['"];?\s*\n/g,
    ""
  );

  fs.writeFileSync(fullPath, content, "utf8");
  console.log(`Fixed: ${filePath}`);
}

filesToFix.forEach(({ path, removeImports }) => {
  removeUnusedImports(path, removeImports);
});

console.log("\nDone! Run npm run lint to verify.");
