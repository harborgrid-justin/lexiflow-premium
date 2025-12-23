import React from 'react';
import { ModuleRegistry } from '../services/infrastructure/moduleRegistry';
import { NAVIGATION_ITEMS } from './nav.config';
import { PATHS } from './paths.config';
import { FilePlus } from 'lucide-react';

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
const CaseList = lazyWithPreload(() => import('../components/case-list/CaseList') as Promise<{ default: React.ComponentType<any> }>);
const CreateCase = lazyWithPreload(() => import('../components/case-list/CreateCase') as Promise<{ default: React.ComponentType<any> }>);
// MatterModule consolidated into CaseList - matters and cases are the same entity
const MatterModule = CaseList;
const DocketManager = lazyWithPreload(() => import('../components/docket/DocketManager') as Promise<{ default: React.ComponentType<any> }>);
const CorrespondenceManager = lazyWithPreload(() => import('../components/correspondence/CorrespondenceManager') as Promise<{ default: React.ComponentType<any> }>);
const MasterWorkflow = lazyWithPreload(() => import('../components/workflow/MasterWorkflow') as Promise<{ default: React.ComponentType<any> }>);
const DocumentManager = lazyWithPreload(() => import('../components/documents/DocumentManager') as Promise<{ default: React.ComponentType<any> }>);
const WarRoom = lazyWithPreload(() => import('../components/war-room/WarRoom') as Promise<{ default: React.ComponentType<any> }>);
const ExhibitManager = lazyWithPreload(() => import('../components/exhibits/ExhibitManager') as Promise<{ default: React.ComponentType<any> }>);
const DiscoveryPlatform = lazyWithPreload(() => import('../components/discovery/DiscoveryPlatform') as Promise<{ default: React.ComponentType<any> }>);
const EvidenceVault = lazyWithPreload(() => import('../components/evidence/EvidenceVault') as Promise<{ default: React.ComponentType<any> }>);
const ResearchTool = lazyWithPreload(() => import('../components/research/ResearchTool') as Promise<{ default: React.ComponentType<any> }>);
const FirmOperations = lazyWithPreload(() => import('../components/practice/FirmOperations') as Promise<{ default: React.ComponentType<any> }>);
const BillingDashboard = lazyWithPreload(() => import('../components/billing/BillingDashboard') as Promise<{ default: React.ComponentType<any> }>);
const ClientCRM = lazyWithPreload(() => import('../components/crm/ClientCRM') as Promise<{ default: React.ComponentType<any> }>);
const ComplianceDashboard = lazyWithPreload(() => import('../components/compliance/ComplianceDashboard') as Promise<{ default: React.ComponentType<any> }>);
const AdminPanel = lazyWithPreload(() => import('../components/admin/AdminPanel') as Promise<{ default: React.ComponentType<any> }>);
const SecureMessenger = lazyWithPreload(() => import('../components/messenger/SecureMessenger') as Promise<{ default: React.ComponentType<any> }>);
const EntityDirector = lazyWithPreload(() => import('../components/entities/EntityDirector') as Promise<{ default: React.ComponentType<any> }>);
const AdminDatabaseControl = lazyWithPreload(() => import('../components/admin/data/AdminDatabaseControl') as Promise<{ default: React.ComponentType<any> }>);
const AnalyticsDashboard = lazyWithPreload(() => import('../components/analytics/AnalyticsDashboard') as Promise<{ default: React.ComponentType<any> }>);
const JurisdictionManager = lazyWithPreload(() => import('../components/jurisdiction/JurisdictionManager') as Promise<{ default: React.ComponentType<any> }>);
const CalendarView = lazyWithPreload(() => import('../components/calendar/CalendarView') as Promise<{ default: React.ComponentType<any> }>);
const RulesPlatform = lazyWithPreload(() => import('../components/rules/RulesPlatform') as Promise<{ default: React.ComponentType<any> }>);
const UserProfileManager = lazyWithPreload(() => import('../components/profile/UserProfileManager') as Promise<{ default: React.ComponentType<any> }>);
const PleadingBuilder = lazyWithPreload(() => import('../components/pleading/PleadingBuilder') as Promise<{ default: React.ComponentType<any> }>);
const KnowledgeBase = lazyWithPreload(() => import('../components/knowledge/KnowledgeBase') as Promise<{ default: React.ComponentType<any> }>);
const LitigationBuilder = lazyWithPreload(() => import('../components/litigation/LitigationBuilder') as Promise<{ default: React.ComponentType<any> }>);
const ClauseLibrary = lazyWithPreload(() => import('../components/clauses/ClauseLibrary') as Promise<{ default: React.ComponentType<any> }>);
const CitationManager = lazyWithPreload(() => import('../components/citation/CitationManager') as Promise<{ default: React.ComponentType<any> }>);

const COMPONENT_MAP: Record<string, React.LazyExoticComponent<unknown>> = {
  [PATHS.DASHBOARD]: Dashboard,
  [PATHS.CASES]: CaseList,
  [PATHS.CREATE_CASE]: CreateCase,
  [PATHS.MATTERS]: MatterModule,
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
    ModuleRegistry.register({
        id: PATHS.CREATE_CASE,
        label: 'Create Case',
        icon: FilePlus,
        category: 'Case Work',
        component: CreateCase
    });
};

