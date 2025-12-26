import React from 'react';
import { ModuleRegistry } from '../services/infrastructure/moduleRegistry';
import { NAVIGATION_ITEMS } from './nav.config';
import { PATHS } from './paths.config';
import { FilePlus, UserCircle } from 'lucide-react';

// Advanced Factory Type that includes a preload method
type PreloadableComponent<T extends React.ComponentType<unknown>> = React.LazyExoticComponent<T> & {
    preload: () => Promise<unknown>;
};

// Helper to attach preload capability to lazy imports
function lazyWithPreload<T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
    const Component = React.lazy(factory) as PreloadableComponent<T>;
    Component.preload = factory as () => Promise<unknown>;
    return Component;
}

// Lazy Imports with Strict Relative Paths
const Dashboard = lazyWithPreload(() => import('../features/dashboard/components/Dashboard') as Promise<{ default: React.ComponentType<any> }>);
const CaseList = lazyWithPreload(() => import('@features/cases/components/list/CaseList') as Promise<{ default: React.ComponentType<any> }>);
const CaseModule = lazyWithPreload(() => import('@features/cases/components/list/CaseManagement').then(m => ({ default: m.CaseManagement })) as Promise<{ default: React.ComponentType<any> }>);
const NewCasePage = lazyWithPreload(() => import('../features/cases/components/create/NewCase') as Promise<{ default: React.ComponentType<any> }>);
const DocketManager = lazyWithPreload(() => import('../features/cases/components/docket/DocketManager') as Promise<{ default: React.ComponentType<any> }>);

// NEW: Case Management Enterprise Suite
const CaseOverviewDashboard = lazyWithPreload(() => import('../features/cases/components/overview/CaseOverviewDashboard').then(m => ({ default: m.CaseOverviewDashboard })) as Promise<{ default: React.ComponentType<any> }>);
const CaseCalendar = lazyWithPreload(() => import('../features/cases/components/calendar/CaseCalendar').then(m => ({ default: m.CaseCalendar })) as Promise<{ default: React.ComponentType<any> }>);
const CaseAnalyticsDashboard = lazyWithPreload(() => import('../features/cases/components/analytics/CaseAnalyticsDashboard').then(m => ({ default: m.CaseAnalyticsDashboard })) as Promise<{ default: React.ComponentType<any> }>);
const NewCaseIntakeForm = lazyWithPreload(() => import('../features/cases/components/intake/NewCaseIntakeForm').then(m => ({ default: m.NewCaseIntakeForm })) as Promise<{ default: React.ComponentType<any> }>);
const CaseOperationsCenter = lazyWithPreload(() => import('../features/cases/components/operations/CaseOperationsCenter').then(m => ({ default: m.CaseOperationsCenter })) as Promise<{ default: React.ComponentType<any> }>);
const CaseInsightsDashboard = lazyWithPreload(() => import('../features/cases/components/insights/CaseInsightsDashboard').then(m => ({ default: m.CaseInsightsDashboard })) as Promise<{ default: React.ComponentType<any> }>);
const CaseFinancialsCenter = lazyWithPreload(() => import('../features/cases/components/financials/CaseFinancialsCenter').then(m => ({ default: m.CaseFinancialsCenter })) as Promise<{ default: React.ComponentType<any> }>);

const CorrespondenceManager = lazyWithPreload(() => import('../features/operations/correspondence/CorrespondenceManager') as Promise<{ default: React.ComponentType<any> }>);
const MasterWorkflow = lazyWithPreload(() => import('../features/cases/components/workflow/MasterWorkflow') as Promise<{ default: React.ComponentType<any> }>);
const DocumentManager = lazyWithPreload(() => import('../features/operations/documents/DocumentManager') as Promise<{ default: React.ComponentType<any> }>);
const WarRoom = lazyWithPreload(() => import('../features/litigation/war-room/WarRoom') as Promise<{ default: React.ComponentType<any> }>);
const ExhibitManager = lazyWithPreload(() => import('../features/litigation/exhibits/ExhibitManager') as Promise<{ default: React.ComponentType<any> }>);
const DiscoveryPlatform = lazyWithPreload(() => import('../features/litigation/discovery/DiscoveryPlatform') as Promise<{ default: React.ComponentType<any> }>);
const EvidenceVault = lazyWithPreload(() => import('../features/litigation/evidence/EvidenceVault') as Promise<{ default: React.ComponentType<any> }>);
const ResearchTool = lazyWithPreload(() => import('../features/knowledge/research/ResearchTool') as Promise<{ default: React.ComponentType<any> }>);
const FirmOperations = lazyWithPreload(() => import('../features/knowledge/practice/FirmOperations') as Promise<{ default: React.ComponentType<any> }>);
const BillingDashboard = lazyWithPreload(() => import('../features/operations/billing/BillingDashboard') as Promise<{ default: React.ComponentType<any> }>);
const ClientCRM = lazyWithPreload(() => import('../features/operations/crm/ClientCRM') as Promise<{ default: React.ComponentType<any> }>);
const ComplianceDashboard = lazyWithPreload(() => import('../features/operations/compliance/ComplianceDashboard') as Promise<{ default: React.ComponentType<any> }>);
const AdminPanel = lazyWithPreload(() => import('../features/admin/AdminPanel') as Promise<{ default: React.ComponentType<any> }>);
const SecureMessenger = lazyWithPreload(() => import('../features/operations/messenger/SecureMessenger') as Promise<{ default: React.ComponentType<any> }>);
const EntityDirector = lazyWithPreload(() => import('../features/cases/components/entities/EntityDirector') as Promise<{ default: React.ComponentType<any> }>);
const AdminDatabaseControl = lazyWithPreload(() => import('../features/admin/components/data/AdminDatabaseControl') as Promise<{ default: React.ComponentType<any> }>);
const AnalyticsDashboard = lazyWithPreload(() => import('../features/admin/components/analytics/AnalyticsDashboard') as Promise<{ default: React.ComponentType<any> }>);
const JurisdictionManager = lazyWithPreload(() => import('../features/knowledge/jurisdiction/JurisdictionManager') as Promise<{ default: React.ComponentType<any> }>);
const CalendarView = lazyWithPreload(() => import('../features/cases/components/calendar/CalendarView') as Promise<{ default: React.ComponentType<any> }>);
const RulesPlatform = lazyWithPreload(() => import('../features/knowledge/rules/RulesPlatform') as Promise<{ default: React.ComponentType<any> }>);
const UserProfileManager = lazyWithPreload(() => import('../features/profile/UserProfileManager') as Promise<{ default: React.ComponentType<any> }>);
const PleadingBuilder = lazyWithPreload(() => import('../features/litigation/pleadings/PleadingBuilder') as Promise<{ default: React.ComponentType<any> }>);
const KnowledgeBase = lazyWithPreload(() => import('../features/knowledge/base/KnowledgeBase') as Promise<{ default: React.ComponentType<any> }>);
const LitigationBuilder = lazyWithPreload(() => import('../features/litigation/strategy/LitigationBuilder') as Promise<{ default: React.ComponentType<any> }>);
const ClauseLibrary = lazyWithPreload(() => import('../features/knowledge/clauses/ClauseLibrary') as Promise<{ default: React.ComponentType<any> }>);
const CitationManager = lazyWithPreload(() => import('../features/knowledge/citation/CitationManager') as Promise<{ default: React.ComponentType<any> }>);
const DraftingDashboard = lazyWithPreload(() => import('../features/drafting/DraftingDashboard') as Promise<{ default: React.ComponentType<any> }>);

const COMPONENT_MAP: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  [PATHS.DASHBOARD]: Dashboard,
  [PATHS.CREATE_CASE]: NewCasePage, // ✅ Unified case creation page
  [PATHS.CASES]: CaseModule, // ✅ Primary case management with routing
  
  // Case Management Enterprise Suite (using new CASES paths)
  [PATHS.CASES_OVERVIEW]: CaseOverviewDashboard,
  [PATHS.CASES_CALENDAR]: CaseCalendar,
  [PATHS.CASES_ANALYTICS]: CaseAnalyticsDashboard,
  [PATHS.CASES_INTAKE]: NewCaseIntakeForm,
  [PATHS.CASES_OPERATIONS]: CaseOperationsCenter,
  [PATHS.CASES_INSIGHTS]: CaseInsightsDashboard,
  [PATHS.CASES_FINANCIALS]: CaseFinancialsCenter,
  
  [PATHS.DOCKET]: DocketManager,
  [PATHS.CORRESPONDENCE]: CorrespondenceManager,
  [PATHS.WORKFLOWS]: MasterWorkflow,
  [PATHS.DOCUMENTS]: DocumentManager,
  [PATHS.DRAFTING]: DraftingDashboard,
  [PATHS.WAR_ROOM]: WarRoom,
  [PATHS.EXHIBITS]: ExhibitManager,
  [PATHS.DISCOVERY]: DiscoveryPlatform,
  [PATHS.EVIDENCE]: EvidenceVault,
  [PATHS.RESEARCH]: ResearchTool,
  [PATHS.PRACTICE]: FirmOperations,
  [PATHS.BILLING]: BillingDashboard,
  [PATHS.CRM]: ClientCRM,
  [PATHS.COMPLIANCE]: ComplianceDashboard,
  [PATHS.ADMIN]: AdminPanel,
  [PATHS.MESSAGES]: SecureMessenger,
  [PATHS.ENTITIES]: EntityDirector,
  [PATHS.DATA_PLATFORM]: AdminDatabaseControl,
  [PATHS.ANALYTICS]: AnalyticsDashboard,
  [PATHS.JURISDICTION]: JurisdictionManager,
  [PATHS.CALENDAR]: CalendarView,
  [PATHS.RULES_ENGINE]: RulesPlatform,
  [PATHS.PROFILE]: UserProfileManager,
  // [PATHS.DAF]: DafDashboard, // TODO: Create DafDashboard component
  [PATHS.PLEADING_BUILDER]: PleadingBuilder,
  [PATHS.LIBRARY]: KnowledgeBase,
  [PATHS.LITIGATION_BUILDER]: LitigationBuilder,
  [PATHS.CLAUSES]: ClauseLibrary,
  [PATHS.CITATIONS]: CitationManager,
};

export const initializeModules = () => {
    const modules = NAVIGATION_ITEMS.flatMap(item => {
        const { children, ...itemWithoutChildren } = item;
        const mainModule = {
            ...itemWithoutChildren,
            component: COMPONENT_MAP[item.id]
        };

        // If item has children, also register them as modules
        if (children && children.length > 0) {
            const childModules = children.map(child => ({
                id: child.id,
                label: child.label,
                icon: child.icon,
                category: item.category,
                component: COMPONENT_MAP[child.id],
                hidden: true // Children are accessed via parent navigation
            }));
            return [mainModule, ...childModules];
        }

        return [mainModule];
    }).filter(m => m.component !== undefined);

    ModuleRegistry.registerBatch(modules);
    
    // Register non-navigation routes (pages without sidebar items)
    // These are accessed via other components (footer, page actions, etc.)
    ModuleRegistry.register({
        id: PATHS.CREATE_CASE,
        label: 'New Case',
        icon: FilePlus,
        category: 'Case Work',
        component: NewCasePage, // ✅ Unified case creation with intake/conflicts/ops/financials
        hidden: true // Accessed via Case Management page
    });
    
    ModuleRegistry.register({
        id: PATHS.PROFILE,
        label: 'My Profile',
        icon: UserCircle,
        category: 'Admin',
        component: UserProfileManager,
        hidden: true // Accessed via SidebarFooter
    });
};

