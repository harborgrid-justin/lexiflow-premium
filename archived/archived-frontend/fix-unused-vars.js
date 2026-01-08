#!/usr/bin/env node
/**
 * Script to fix ESLint unused variable errors by prefixing with underscore
 */

const fs = require("fs");
const path = require("path");

// Map of file paths to their unused variables/parameters
const fixes = {
  "src/components/enterprise/Billing/InvoiceBuilder.tsx": {
    params: [],
    vars: [],
  },
  "src/components/enterprise/Billing/LEDESBilling.tsx": {
    params: [],
    vars: [],
  },
  "src/components/enterprise/Billing/TrustAccounting.tsx": {
    params: [],
    vars: [],
  },
  "src/components/enterprise/CRM/BusinessDevelopment.tsx": {
    params: [],
    vars: ["totalLeads"],
  },
  "src/components/enterprise/CRM/ClientAnalytics.tsx": {
    params: [],
    vars: ["selectedClient", "setSelectedClient", "clientsArray"],
  },
  "src/components/enterprise/CRM/ClientPortal.tsx": {
    params: ["client"],
    vars: ["selectedDocument"],
  },
  "src/components/enterprise/CRM/EnterpriseCRM.tsx": {
    params: [],
    vars: ["mode"],
  },
  "src/components/enterprise/CRM/IntakeManagement.tsx": {
    params: [],
    vars: ["selectedIntake", "setSelectedIntake"],
  },
  "src/components/enterprise/CaseManagement/CaseBudget.tsx": {
    params: [
      "caseId",
      "periods",
      "onUpdateBudget",
      "onAddExpense",
      "onUpdateAlert",
    ],
    vars: ["showAddExpense"],
  },
  "src/components/enterprise/CaseManagement/CaseTeam.tsx": {
    params: ["caseId", "onAddMember"],
    vars: ["showAddMember"],
  },
  "src/components/enterprise/CaseManagement/CaseTemplates.tsx": {
    params: ["onDeleteTemplate"],
    vars: [],
  },
  "src/components/enterprise/CaseManagement/EnhancedCaseTimeline.tsx": {
    params: ["onEventUpdate", "index"],
    vars: ["setSelectedStatuses", "isUpcoming"],
  },
  "src/components/enterprise/CaseManagement/EnterpriseCaseList.tsx": {
    params: [],
    vars: [],
  },
  "src/components/enterprise/Discovery/EDiscoveryDashboard.tsx": {
    params: ["caseId", "onNavigate"],
    vars: ["selectedCustodian"],
  },
  "src/components/enterprise/Discovery/EvidenceChainOfCustody.tsx": {
    params: ["caseId", "onNavigate"],
    vars: [],
  },
  "src/components/enterprise/Discovery/ExhibitOrganizer.tsx": {
    params: ["caseId", "trialId", "onNavigate"],
    vars: ["exhibitLists", "setExhibitLists", "selectedExhibit"],
  },
  "src/components/enterprise/Discovery/PrivilegeLog.tsx": {
    params: ["caseId", "onNavigate"],
    vars: [],
  },
  "src/components/enterprise/Discovery/ProductionManager.tsx": {
    params: ["caseId", "onNavigate"],
    vars: ["setProductions", "activeTab", "setActiveTab"],
  },
  "src/components/enterprise/Documents/AuditTrail.tsx": {
    params: [],
    vars: [],
  },
  "src/components/enterprise/Documents/DocumentManagementSystem.tsx": {
    params: ["onUpdateMetadata"],
    vars: [],
  },
  "src/components/enterprise/Documents/DocumentViewer.tsx": {
    params: [],
    vars: [],
  },
  "src/components/enterprise/Documents/DocumentWorkflow.tsx": {
    params: ["availableReviewers"],
    vars: ["isPending"],
  },
  "src/components/enterprise/EnterpriseDashboard.tsx": {
    params: ["userId", "dateRange"],
    vars: [],
  },
  "src/components/enterprise/Research/CitationManager.tsx": {
    params: [],
    vars: [],
  },
};

function prefixWithUnderscore(content, name) {
  // Match parameter declarations
  content = content.replace(
    new RegExp(`([,(]\\s*)${name}(\\s*[,):?])`, "g"),
    `$1_${name}$2`
  );

  // Match const declarations
  content = content.replace(
    new RegExp(`(const\\s+)${name}(\\s*[,=:])`, "g"),
    `$1_${name}$2`
  );

  // Match destructuring
  content = content.replace(
    new RegExp(`([{,]\\s*)${name}(\\s*[,}])`, "g"),
    `$1_${name}$2`
  );

  return content;
}

Object.entries(fixes).forEach(([filePath, { params, vars }]) => {
  const fullPath = path.join(__dirname, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  const original = content;

  [...params, ...vars].forEach((name) => {
    content = prefixWithUnderscore(content, name);
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`Fixed: ${filePath}`);
  }
});

console.log("\nDone! Run npm run lint to verify.");
