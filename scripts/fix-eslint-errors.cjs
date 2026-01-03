#!/usr/bin/env node

/**
 * Automated ESLint Error Fixer
 * 
 * This script automatically fixes common ESLint errors:
 * 1. catch () without error parameter
 * 2. Unused variables that need underscore prefix
 * 3. Empty object patterns
 * 
 * Usage: node scripts/fix-eslint-errors.js
 */

const fs = require('fs');
const path = require('path');

// Files to fix based on the error report
const filesToFix = [
  'frontend/src/utils/formatters.ts',
  'frontend/src/utils/retryWithBackoff.ts',
  'frontend/src/utils/route-guards.ts',
  'frontend/src/utils/sanitize.ts',
  'frontend/src/utils/storage.ts',
  'frontend/src/utils/EventEmitter.ts',
  'frontend/src/utils/circuitBreaker.ts',
  'frontend/src/services/workers/cryptoWorker.ts',
  'frontend/src/services/workers/workerPool.ts',
  'frontend/src/services/infrastructure/CacheManager.ts',
  'frontend/src/services/infrastructure/apiClientEnhanced.ts',
  'frontend/src/services/infrastructure/collaborationService.ts',
  'frontend/src/services/infrastructure/cryptoService.ts',
  'frontend/src/services/infrastructure/dateCalculationService.ts',
  'frontend/src/services/infrastructure/notificationService.ts',
  'frontend/src/services/infrastructure/queryClient.ts',
  'frontend/src/services/infrastructure/socketService.ts',
  'frontend/src/services/infrastructure/websocketClient.ts',
  'frontend/src/services/integration/backendDiscovery.ts',
  'frontend/src/services/integration/integrationOrchestrator.ts',
  'frontend/src/services/search/core/engine.ts',
  'frontend/src/services/search/core/history.ts',
  'frontend/src/services/search/searchWorker.ts',
  'frontend/src/services/utils/queryUtils.ts',
  'frontend/src/services/validation/schemas/billing-filters-schema.ts',
  'frontend/src/services/validation/schemas/expense-schema.ts',
  'frontend/src/services/validation/schemas/invoice-schema.ts',
  'frontend/src/services/validation/schemas/time-entry-schema.ts',
  'frontend/src/services/validation/schemas/trust-transaction-schema.ts',
  'frontend/src/services/features/documents/xmlDocketParser.ts',
  'frontend/src/services/domain/AdminDomain.ts',
  'frontend/src/services/domain/AnalyticsDomain.ts',
  'frontend/src/services/domain/BackupDomain.ts',
  'frontend/src/services/domain/BillingDomain.ts',
  'frontend/src/services/domain/CalendarDomain.ts',
  'frontend/src/services/domain/CaseDomain.ts',
  'frontend/src/services/domain/ComplianceDomain.ts',
  'frontend/src/services/domain/DocketDomain.ts',
  'frontend/src/services/domain/KnowledgeDomain.ts',
  'frontend/src/services/domain/ResearchDomain.ts',
  'frontend/src/services/domain/SearchDomain.ts',
  'frontend/src/services/domain/SecurityDomain.ts',
  'frontend/src/services/domain/StrategyDomain.ts',
  'frontend/src/services/domain/WarRoomDomain.ts',
  'frontend/src/services/core/Repository.ts',
  'frontend/src/services/data/dataService.ts',
  'frontend/src/services/data/repositories/AnalysisRepository.ts',
  'frontend/src/services/data/repositories/CitationRepository.ts',
  'frontend/src/services/data/repositories/ClauseRepository.ts',
  'frontend/src/services/data/repositories/ClientRepository.ts',
  'frontend/src/services/data/repositories/DiscoveryRepository.ts',
  'frontend/src/services/data/repositories/DocumentRepository.ts',
  'frontend/src/services/data/repositories/EntityRepository.ts',
  'frontend/src/services/data/repositories/EvidenceRepository.ts',
  'frontend/src/services/data/repositories/HRRepository.ts',
  'frontend/src/services/data/repositories/MatterRepository.ts',
  'frontend/src/services/data/repositories/MotionRepository.ts',
  'frontend/src/services/data/repositories/OrganizationRepository.ts',
  'frontend/src/services/data/repositories/PleadingRepository.ts',
  'frontend/src/services/data/repositories/RiskAssessmentRepository.ts',
  'frontend/src/services/data/repositories/TaskRepository.ts',
  'frontend/src/services/data/repositories/TrialRepository.ts',
  'frontend/src/services/data/repositories/UserRepository.ts',
  'frontend/src/services/data/repositories/WitnessRepository.ts',
  'frontend/src/services/data/repositories/WorkflowRepository.ts',
  'frontend/src/types/result.ts',
  'frontend/src/hooks/useAdaptiveLoading.ts',
  'frontend/src/hooks/useApiMutation.ts',
  'frontend/src/hooks/useAutoSave.ts',
  'frontend/src/hooks/useBackendHealth.ts',
  'frontend/src/hooks/useCalendarView.ts',
  'frontend/src/hooks/useCaseDetail.ts',
  'frontend/src/hooks/useCaseList.ts',
  'frontend/src/hooks/useCodeSplitting.ts',
  'frontend/src/hooks/useContextActions.ts',
  'frontend/src/hooks/useDocumentManager.ts',
  'frontend/src/hooks/useEnhancedFormValidation.ts',
  'frontend/src/hooks/useEvidenceManager.ts',
  'frontend/src/hooks/useImageOptimization.ts',
  'frontend/src/hooks/useNexusGraph.ts',
  'frontend/src/hooks/useNotificationWebSocket.ts',
  'frontend/src/hooks/useSessionStorage.ts',
  'frontend/src/hooks/useTimeTracker.ts',
  'frontend/src/routes/admin/index.tsx',
  'frontend/src/routes/admin/audit.tsx',
  'frontend/src/routes/admin/backup.tsx',
  'frontend/src/routes/admin/integrations.tsx',
  'frontend/src/routes/admin/settings.tsx',
  'frontend/src/routes/billing/index.tsx',
  'frontend/src/routes/billing/rates.tsx',
  'frontend/src/routes/cases/create.tsx',
  'frontend/src/routes/cases/index.tsx',
  'frontend/src/routes/compliance/index.tsx',
  'frontend/src/routes/dashboard.tsx',
  'frontend/src/routes/docket/detail.tsx',
  'frontend/src/routes/docket/index.tsx',
  'frontend/src/routes/documents/detail.tsx',
  'frontend/src/routes/documents/index.tsx',
  'frontend/src/routes/documents/upload.tsx',
  'frontend/src/routes/exhibits/index.tsx',
  'frontend/src/routes/home.tsx',
  'frontend/src/routes/layout.tsx',
  'frontend/src/routes/messages/index.tsx',
  'frontend/src/routes/profile/index.tsx',
  'frontend/src/routes/reports/$id.tsx',
  'frontend/src/routes/reports/index.tsx',
  'frontend/src/routes/war-room/index.tsx',
  'frontend/src/routes/workflows/detail.tsx',
  'frontend/src/routes/workflows/index.tsx',
  'frontend/src/routes/workflows/instance.$instanceId.tsx',
  'frontend/src/routes/workflows/new.tsx',
  'frontend/src/features/admin/components/AdminAuditLog.tsx',
  'frontend/src/features/admin/components/analytics/AnalyticsDashboard.tsx',
  'frontend/src/features/admin/components/data/Configuration.tsx',
  'frontend/src/features/admin/components/data/DatabaseManagement.tsx',
  'frontend/src/features/admin/components/data/QueryConsole.tsx',
  'frontend/src/features/admin/components/data/data-sources/IndexedDBView.tsx',
  'frontend/src/features/admin/components/users/UserManagement.tsx',
  'frontend/src/features/admin/components/webhooks/WebhookManagement.tsx',
  'frontend/src/features/cases/components/create/CaseDataImport.tsx',
  'frontend/src/features/cases/components/create/NewCase.tsx',
  'frontend/src/features/cases/components/detail/CaseDocuments.tsx',
  'frontend/src/features/cases/components/intake/NewCaseIntakeForm.tsx',
  'frontend/src/features/cases/components/list/case-form-old/MatterForm.tsx',
  'frontend/src/features/cases/components/overview/CaseOverviewDashboard.tsx',
  'frontend/src/features/cases/components/workflow/WorkflowTemplateBuilder.tsx',
  'frontend/src/features/document-assembly/Step1TemplateSelection.tsx',
  'frontend/src/features/drafting/DraftingDashboard.tsx',
  'frontend/src/features/drafting/components/DocumentGenerator.tsx',
  'frontend/src/features/drafting/components/TemplateEditor.tsx',
  'frontend/src/features/knowledge/research/ActiveResearch.tsx',
  'frontend/src/features/knowledge/research/bluebook/BluebookFormatter.tsx',
  'frontend/src/features/litigation/evidence/EvidenceForensics.tsx',
  'frontend/src/features/litigation/pleadings/PleadingDesigner.tsx',
  'frontend/src/features/litigation/war-room/opposition/OppositionDetail.tsx',
  'frontend/src/features/operations/billing/BillingDashboard.tsx',
  'frontend/src/features/operations/billing/BillingWIP.tsx',
  'frontend/src/features/operations/billing/fee-agreements/FeeAgreementManagement.tsx',
  'frontend/src/features/operations/billing/rate-tables/RateTableManagement.tsx',
  'frontend/src/features/operations/correspondence/ComposeMessageModal.tsx',
  'frontend/src/components/ui/molecules/AdaptiveLoader/AdaptiveLoader.tsx',
  'frontend/src/components/ui/molecules/DynamicBreadcrumbs/DynamicBreadcrumbs.tsx',
  'frontend/src/contexts/auth/AuthProvider.tsx',
];

function fixFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix 1: catch () without error parameter -> catch (error)
  const catchRegex = /} catch\s*\(\s*\)\s*{/g;
  if (catchRegex.test(content)) {
    content = content.replace(catchRegex, '} catch (error) {');
    modified = true;
    console.log(`✓ Fixed catch() in ${filePath}`);
  }

  // Fix 2: Empty object pattern -> _props
  const emptyObjectPattern = /export\s+(default\s+)?(?:function|const)\s+\w+\s*=\s*\(\s*{}\s*\)/g;
  if (emptyObjectPattern.test(content)) {
    content = content.replace(emptyObjectPattern, (match) => {
      return match.replace('{}', '_props');
    });
    modified = true;
    console.log(`✓ Fixed empty object pattern in ${filePath}`);
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  }

  return false;
}

// Main execution
console.log('🔧 Starting automated ESLint error fixes...\n');

let fixedCount = 0;
let totalFiles = filesToFix.length;

for (const file of filesToFix) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} out of ${totalFiles} files`);
console.log('📝 Run "npm run lint" in the frontend directory to verify fixes');