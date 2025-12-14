import React from 'react';
import { ModuleRegistry } from '../services/moduleRegistry';
import { NAVIGATION_ITEMS } from '../constants/navConfig';
import { PATHS } from '../constants/paths';

// Advanced Factory Type that includes a preload method
type PreloadableComponent<T extends React.ComponentType<any>> = React.LazyExoticComponent<T> & {
    preload: () => Promise<any>;
};

// Helper to attach preload capability to lazy imports
function lazyWithPreload<T extends React.ComponentType<any>>(
    factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
    const Component = React.lazy(factory) as PreloadableComponent<T>;
    Component.preload = factory;
    return Component;
}

// Lazy Imports with Strict Relative Paths
const Dashboard = lazyWithPreload(() => import('../components/dashboard/Dashboard'));
const CaseList = lazyWithPreload(() => import('../components/case-list/CaseList'));
const DocketManager = lazyWithPreload(() => import('../components/docket/DocketManager'));
const CorrespondenceManager = lazyWithPreload(() => import('../components/correspondence/CorrespondenceManager'));
const MasterWorkflow = lazyWithPreload(() => import('../components/workflow/MasterWorkflow').then(m => ({ default: m.MasterWorkflow })));
const DocumentManager = lazyWithPreload(() => import('../components/documents/DocumentManager'));
const WarRoom = lazyWithPreload(() => import('../components/war-room/WarRoom').then(m => ({ default: m.WarRoom })));
const ExhibitManager = lazyWithPreload(() => import('../components/exhibits/ExhibitManager').then(m => ({ default: m.ExhibitManager })));
const DiscoveryPlatform = lazyWithPreload(() => import('../components/discovery/DiscoveryPlatform').then(m => ({ default: m.DiscoveryPlatform })));
const EvidenceVault = lazyWithPreload(() => import('../components/evidence/EvidenceVault').then(m => ({ default: m.EvidenceVault })));
const ResearchTool = lazyWithPreload(() => import('../components/research/ResearchTool'));
const FirmOperations = lazyWithPreload(() => import('../components/practice/FirmOperations').then(m => ({ default: m.FirmOperations })));
const BillingDashboard = lazyWithPreload(() => import('../components/billing/BillingDashboard'));
const ClientCRM = lazyWithPreload(() => import('../components/crm/ClientCRM'));
const ComplianceDashboard = lazyWithPreload(() => import('../components/compliance/ComplianceDashboard'));
const AdminPanel = lazyWithPreload(() => import('../components/admin/AdminPanel').then(m => ({ default: m.AdminPanel })));
const SecureMessenger = lazyWithPreload(() => import('../components/messenger/SecureMessenger').then(m => ({ default: m.SecureMessenger })));
const EntityDirector = lazyWithPreload(() => import('../components/entities/EntityDirector').then(m => ({ default: m.EntityDirector })));
const AdminDatabaseControl = lazyWithPreload(() => import('../components/admin/data/AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));
const AnalyticsDashboard = lazyWithPreload(() => import('../components/analytics/AnalyticsDashboard'));
const JurisdictionManager = lazyWithPreload(() => import('../components/jurisdiction/JurisdictionManager'));
const CalendarView = lazyWithPreload(() => import('../components/calendar/CalendarView').then(m => ({ default: m.CalendarView })));
const RulesPlatform = lazyWithPreload(() => import('../components/rules/RulesPlatform').then(m => ({ default: m.RulesPlatform })));
const UserProfileManager = lazyWithPreload(() => import('../components/profile/UserProfileManager').then(m => ({ default: m.UserProfileManager })));
const PleadingBuilder = lazyWithPreload(() => import('../components/pleading/PleadingBuilder').then(m => ({ default: m.PleadingBuilder })));
const KnowledgeBase = lazyWithPreload(() => import('../components/knowledge/KnowledgeBase'));
const LitigationBuilder = lazyWithPreload(() => import('../components/litigation/LitigationBuilder').then(m => ({ default: m.LitigationBuilder })));
const ClauseLibrary = lazyWithPreload(() => import('../components/clauses/ClauseLibrary'));
const CitationManager = lazyWithPreload(() => import('../components/citation/CitationManager'));

const COMPONENT_MAP: Record<string, React.LazyExoticComponent<any>> = {
  [PATHS.DASHBOARD]: Dashboard,
  [PATHS.CASES]: CaseList,
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
};
