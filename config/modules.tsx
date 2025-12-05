
import React from 'react';
import { ModuleRegistry } from '../services/moduleRegistry';
import { NAVIGATION_ITEMS } from '../constants/navConfig';
import { PATHS } from '../constants/paths';

// Lazy Imports
const Dashboard = React.lazy(() => import('../components/Dashboard'));
const CaseList = React.lazy(() => import('../components/CaseList'));
const DocketManager = React.lazy(() => import('../components/DocketManager'));
const CorrespondenceManager = React.lazy(() => import('../components/CorrespondenceManager').then(m => ({ default: m.CorrespondenceManager })));
const MasterWorkflow = React.lazy(() => import('../components/MasterWorkflow').then(m => ({ default: m.MasterWorkflow })));
const DocumentManager = React.lazy(() => import('../components/DocumentManager'));
const WarRoom = React.lazy(() => import('../components/WarRoom').then(m => ({ default: m.WarRoom })));
const ExhibitManager = React.lazy(() => import('../components/ExhibitManager').then(m => ({ default: m.ExhibitManager })));
const DiscoveryPlatform = React.lazy(() => import('../components/DiscoveryPlatform').then(m => ({ default: m.DiscoveryPlatform })));
const EvidenceVault = React.lazy(() => import('../components/EvidenceVault'));
const JurisdictionManager = React.lazy(() => import('../components/JurisdictionManager'));
const ResearchTool = React.lazy(() => import('../components/ResearchTool').then(m => ({ default: m.ResearchTool })));
const CitationManager = React.lazy(() => import('../components/CitationManager').then(m => ({ default: m.CitationManager })));
const FirmOperations = React.lazy(() => import('../components/FirmOperations').then(m => ({ default: m.FirmOperations })));
const BillingDashboard = React.lazy(() => import('../components/BillingDashboard'));
const ClientCRM = React.lazy(() => import('../components/ClientCRM'));
const KnowledgeBase = React.lazy(() => import('../components/KnowledgeBase'));
const ClauseLibrary = React.lazy(() => import('../components/ClauseLibrary').then(m => ({ default: m.ClauseLibrary })));
const AnalyticsDashboard = React.lazy(() => import('../components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const ComplianceDashboard = React.lazy(() => import('../components/ComplianceDashboard'));
const AdminPanel = React.lazy(() => import('../components/AdminPanel').then(m => ({ default: m.AdminPanel })));
const SecureMessenger = React.lazy(() => import('../components/SecureMessenger').then(m => ({ default: m.SecureMessenger })));
const RulesPlatform = React.lazy(() => import('../components/RulesPlatform').then(m => ({ default: m.RulesPlatform })));
const EntityDirector = React.lazy(() => import('../components/EntityDirector').then(m => ({ default: m.EntityDirector })));
const AdminDatabaseControl = React.lazy(() => import('../components/admin/AdminDatabaseControl').then(m => ({ default: m.AdminDatabaseControl })));

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
  [PATHS.JURISDICTION]: JurisdictionManager,
  [PATHS.RESEARCH]: ResearchTool,
  [PATHS.CITATIONS]: CitationManager,
  [PATHS.PRACTICE]: FirmOperations,
  [PATHS.BILLING]: BillingDashboard,
  [PATHS.CRM]: ClientCRM,
  [PATHS.LIBRARY]: KnowledgeBase,
  [PATHS.CLAUSES]: ClauseLibrary,
  [PATHS.ANALYTICS]: AnalyticsDashboard,
  [PATHS.COMPLIANCE]: ComplianceDashboard,
  [PATHS.ADMIN]: AdminPanel,
  [PATHS.MESSAGES]: SecureMessenger,
  [PATHS.RULES_ENGINE]: RulesPlatform,
  [PATHS.ENTITIES]: EntityDirector,
  [PATHS.DATA_PLATFORM]: AdminDatabaseControl,
};

export const initializeModules = () => {
    const modules = NAVIGATION_ITEMS.map(item => ({
        ...item,
        component: COMPONENT_MAP[item.id]
    })).filter(m => m.component !== undefined);

    ModuleRegistry.registerBatch(modules);
};
