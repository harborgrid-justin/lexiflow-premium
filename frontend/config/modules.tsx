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
const Dashboard = lazyWithPreload(() => import('../components/dashboard/Dashboard') as Promise<{ default: React.ComponentType<any> }>);
const CaseList = lazyWithPreload(() => import('../components/matters/list/CaseList') as Promise<{ default: React.ComponentType<any> }>);
const CreateCase = lazyWithPreload(() => import('../components/matters/list/CreateCase') as Promise<{ default: React.ComponentType<any> }>);
const CreateCasePage = lazyWithPreload(() => import('../components/matters/create/CreateCasePage') as Promise<{ default: React.ComponentType<any> }>);
const DocketManager = lazyWithPreload(() => import('../components/matters/docket/DocketManager') as Promise<{ default: React.ComponentType<any> }>);
const CorrespondenceManager = lazyWithPreload(() => import('../components/operations/correspondence/CorrespondenceManager') as Promise<{ default: React.ComponentType<any> }>);
const MasterWorkflow = lazyWithPreload(() => import('../components/matters/workflow/MasterWorkflow') as Promise<{ default: React.ComponentType<any> }>);
const DocumentManager = lazyWithPreload(() => import('../components/operations/documents/DocumentManager') as Promise<{ default: React.ComponentType<any> }>);
const WarRoom = lazyWithPreload(() => import('../components/litigation/war-room/WarRoom') as Promise<{ default: React.ComponentType<any> }>);
const ExhibitManager = lazyWithPreload(() => import('../components/litigation/exhibits/ExhibitManager') as Promise<{ default: React.ComponentType<any> }>);
const DiscoveryPlatform = lazyWithPreload(() => import('../components/litigation/discovery/DiscoveryPlatform') as Promise<{ default: React.ComponentType<any> }>);
const EvidenceVault = lazyWithPreload(() => import('../components/litigation/evidence/EvidenceVault') as Promise<{ default: React.ComponentType<any> }>);
const ResearchTool = lazyWithPreload(() => import('../components/knowledge/research/ResearchTool') as Promise<{ default: React.ComponentType<any> }>);
const FirmOperations = lazyWithPreload(() => import('../components/knowledge/practice/FirmOperations') as Promise<{ default: React.ComponentType<any> }>);
const BillingDashboard = lazyWithPreload(() => import('../components/operations/billing/BillingDashboard') as Promise<{ default: React.ComponentType<any> }>);
const ClientCRM = lazyWithPreload(() => import('../components/operations/crm/ClientCRM') as Promise<{ default: React.ComponentType<any> }>);
const ComplianceDashboard = lazyWithPreload(() => import('../components/operations/compliance/ComplianceDashboard') as Promise<{ default: React.ComponentType<any> }>);
const AdminPanel = lazyWithPreload(() => import('../components/admin/AdminPanel') as Promise<{ default: React.ComponentType<any> }>);
const SecureMessenger = lazyWithPreload(() => import('../components/operations/messenger/SecureMessenger') as Promise<{ default: React.ComponentType<any> }>);
const EntityDirector = lazyWithPreload(() => import('../components/matters/entities/EntityDirector') as Promise<{ default: React.ComponentType<any> }>);
const AdminDatabaseControl = lazyWithPreload(() => import('../components/admin/data/AdminDatabaseControl') as Promise<{ default: React.ComponentType<any> }>);
const AnalyticsDashboard = lazyWithPreload(() => import('../components/admin/analytics/AnalyticsDashboard') as Promise<{ default: React.ComponentType<any> }>);
const JurisdictionManager = lazyWithPreload(() => import('../components/knowledge/jurisdiction/JurisdictionManager') as Promise<{ default: React.ComponentType<any> }>);
const CalendarView = lazyWithPreload(() => import('../components/matters/calendar/CalendarView') as Promise<{ default: React.ComponentType<any> }>);
const RulesPlatform = lazyWithPreload(() => import('../components/knowledge/rules/RulesPlatform') as Promise<{ default: React.ComponentType<any> }>);
const UserProfileManager = lazyWithPreload(() => import('../components/profile/UserProfileManager') as Promise<{ default: React.ComponentType<any> }>);
const PleadingBuilder = lazyWithPreload(() => import('../components/litigation/pleadings/PleadingBuilder') as Promise<{ default: React.ComponentType<any> }>);
const KnowledgeBase = lazyWithPreload(() => import('../components/knowledge/base/KnowledgeBase') as Promise<{ default: React.ComponentType<any> }>);
const LitigationBuilder = lazyWithPreload(() => import('../components/litigation/strategy/LitigationBuilder') as Promise<{ default: React.ComponentType<any> }>);
const ClauseLibrary = lazyWithPreload(() => import('../components/knowledge/clauses/ClauseLibrary') as Promise<{ default: React.ComponentType<any> }>);
const CitationManager = lazyWithPreload(() => import('../components/knowledge/citation/CitationManager') as Promise<{ default: React.ComponentType<any> }>);

const COMPONENT_MAP: Record<string, React.LazyExoticComponent<unknown>> = {
  [PATHS.DASHBOARD]: Dashboard,
  [PATHS.CASES]: CaseList,
  [PATHS.CREATE_CASE]: CreateCase,
  [PATHS.CASE_MANAGEMENT]: CaseList, // Redirect to CaseList
  [PATHS.MATTERS]: CaseList, // Primary matter management
  [PATHS.DOCKET]: DocketManager,
  [PATHS.CORRESPONDENCE]: CorrespondenceManager,
  [PATHS.WORKFLOWS]: MasterWorkflow,
  [PATHS.DOCUMENTS]: DocumentManager,
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
  [PATHS.PLEADING_BUILDER]: PleadingBuilder,
  [PATHS.LIBRARY]: KnowledgeBase,
  [PATHS.LITIGATION_BUILDER]: LitigationBuilder,
  [PATHS.CLAUSES]: ClauseLibrary,
  [PATHS.CITATIONS]: CitationManager,
};

export const initializeModules = () => {
    const modules = NAVIGATION_ITEMS.map(item => ({
        ...item,
        component: COMPONENT_MAP[item.id]
    })).filter(m => m.component !== undefined);

    ModuleRegistry.registerBatch(modules);
    
    // Register non-navigation routes (pages without sidebar items)
    // These are accessed via other components (footer, page actions, etc.)
    ModuleRegistry.register({
        id: PATHS.CREATE_CASE,
        label: 'Create Matter',
        icon: FilePlus,
        category: 'Case Work',
        component: CreateCasePage,
        hidden: true // Accessed via Matter Management page
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

