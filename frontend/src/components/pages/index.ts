/**
 * @module components/pages
 * @category Pages
 * @description Enterprise page architecture - domain-organized pages following composition pattern
 * 
 * ORGANIZATION STRUCTURE:
 * Pages are organized by business domain for improved scalability, maintainability, and discoverability.
 * 
 * DOMAINS:
 * - dashboard/     - Executive overview and firm-wide analytics (1 page)
 * - cases/         - Case lifecycle management (7 pages)
 * - litigation/    - Litigation workflows (4 pages)
 * - operations/    - Business operations (6 pages)
 * - documents/     - Document generation (2 pages)
 * - knowledge/     - Knowledge management (4 pages)
 * - collaboration/ - Team coordination (2 pages)
 * - user/          - User management (2 pages)
 * 
 * ARCHITECTURE PATTERN:
 * Pages are thin wrappers around feature components, following the composition pattern.
 * Each page uses layout templates for consistent structure and wraps domain-specific features.
 * 
 * DESIGN PRINCIPLES:
 * 1. Pages are purely compositional - no business logic
 * 2. Features contain domain logic and are reusable
 * 3. Templates provide consistent layout patterns
 * 4. Pages act as routing endpoints and feature orchestration
 * 5. Domain organization reflects business structure
 * 
 * IMPORT PATTERNS:
 * 
 * // Option 1: Root import (backwards compatible)
 * import { DashboardPage, CaseListPage } from '@/components/pages';
 * 
 * // Option 2: Domain import (recommended for new code)
 * import { CaseListPage, CaseOverviewPage } from '@/components/pages/cases';
 * 
 * // Option 3: Direct import (explicit)
 * import { CaseListPage } from '@/components/pages/cases/CaseListPage';
 */

// ============================================================================
// DASHBOARD & ANALYTICS
// ============================================================================
export * from './dashboard';

// ============================================================================
// CASE MANAGEMENT SUITE (7 PAGES)
// ============================================================================
export * from './cases';

// ============================================================================
// LITIGATION WORKFLOWS (4 PAGES)
// ============================================================================
export * from './litigation';

// ============================================================================
// BUSINESS OPERATIONS (6 PAGES)
// ============================================================================
export * from './operations';

// ============================================================================
// DOCUMENT GENERATION (2 PAGES)
// ============================================================================
export * from './documents';

// ============================================================================
// KNOWLEDGE MANAGEMENT (4 PAGES)
// ============================================================================
export * from './knowledge';

// ============================================================================
// TEAM COLLABORATION (2 PAGES)
// ============================================================================
export * from './collaboration';

// ============================================================================
// USER & PROFILE (2 PAGES)
// ============================================================================
export * from './user';

// ============================================================================
// DOMAIN-SPECIFIC RE-EXPORTS (for type safety and tree-shaking)
// ============================================================================

// These named re-exports ensure backwards compatibility while enabling
// tree-shaking and providing clear type definitions

// Dashboard
export { DashboardPage } from './dashboard';

// Cases
export {
  CaseListPage,
  CaseOverviewPage,
  CaseAnalyticsPage,
  CaseIntakePage,
  CaseOperationsPage,
  CaseInsightsPage,
  CaseFinancialsPage,
} from './cases';

// Litigation
export {
  DiscoveryPage,
  PleadingsPage,
  EvidencePage,
  LitigationStrategyPage,
} from './litigation';

// Operations
export {
  BillingPage,
  CompliancePage,
  CRMPage,
  DocumentsPage,
  CorrespondencePage,
  AdminPage,
} from './operations';

// Documents
export {
  DraftingPage,
  DocumentAssemblyPage,
} from './documents';

// Knowledge
export {
  LegalResearchPage,
  RulesPage,
  JurisdictionPage,
  ClauseLibraryPage,
} from './knowledge';

// Collaboration
export {
  WorkflowPage,
  CalendarPage,
} from './collaboration';

// User
export {
  ProfilePage,
  MarketingPage,
} from './user';
