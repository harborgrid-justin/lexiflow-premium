/**
 * Consolidated Tab Configurations
 * All tab configurations for various modules in one reusable file
 */

import { 
  LayoutDashboard, Users, GitPullRequest, BarChart3, ShieldAlert, Lock, 
  ScrollText, Database, GitMerge, Archive, Terminal, Book, Radio, 
  Sparkles, Repeat, Network, DollarSign, Table, Code, Activity, History, 
  FileText, Key, BarChart2, FileSearch, AlertOctagon, Layers, GitCommit, 
  HardDrive, Cloud, CheckSquare, Bell, PieChart, Folder, Clock, Star, 
  LayoutTemplate, FileSignature, Eraser, Cpu, Box, Plus, BookOpen, 
  GraduationCap, Library, Send, Search, Scale, Gavel, Map, Settings, 
  GitCompare, Briefcase, UserPlus, BrainCircuit, TrendingUp, Wallet, 
  ShieldCheck, Link
} from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';
import { PlatformView } from '../components/admin/data/AdminDatabaseControl';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type CRMView = 'dashboard' | 'directory' | 'pipeline' | 'analytics';
export type DocView = 'browse' | 'recent' | 'favorites' | 'templates' | 'drafts' | 'pending' | 'shared' | 'editor' | 'redaction' | 'signing' | 'batch';
export type KnowledgeView = 'wiki' | 'precedents' | 'qa' | 'analytics' | 'cle';
export type RulesView = 'dashboard' | 'federal_evidence' | 'federal_civil' | 'local' | 'standing_orders' | 'compare' | 'search';
export type BillingView = 'dashboard' | 'timekeeper' | 'reports' | 'trust' | 'settings' | 'analytics';

type MenuItem = {
  id: PlatformView;
  label: string;
  icon: any;
  children?: { id: PlatformView; label: string; icon: any }[];
};

// =============================================================================
// ADMIN MODULE TABS
// =============================================================================

export const ADMIN_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'org', label: 'Organization', icon: Network,
    subTabs: [
      { id: 'profile', label: 'Firm Profile', icon: Network },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'security', label: 'Security & Compliance', icon: ShieldAlert },
    ]
  },
  {
    id: 'data_mgmt', label: 'Data Management', icon: Database,
    subTabs: [
      { id: 'data', label: 'Data Platform', icon: Database },
      { id: 'integrations', label: 'Integrations', icon: Link },
      { id: 'audit', label: 'Audit Log', icon: Activity },
    ]
  },
  {
    id: 'system', label: 'System', icon: Server,
    subTabs: [
      { id: 'security', label: 'Security', icon: Lock },
      { id: 'api', label: 'API Keys', icon: Key },
    ]
  }
];

// =============================================================================
// ANALYTICS MODULE TABS
// =============================================================================

export const ANALYTICS_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'intel', label: 'Business Intelligence', icon: BarChart3,
    subTabs: [
      { id: 'firm', label: 'Firm Metrics', icon: BarChart3 },
      { id: 'practice', label: 'Practice Group', icon: Gavel },
      { id: 'attorney', label: 'Attorney Performance', icon: Users },
      { id: 'financial', label: 'Financial KPIs', icon: TrendingUp },
    ]
  },
  {
    id: 'model', label: 'Predictive Models', icon: BrainCircuit,
    subTabs: [
      { id: 'outcomes', label: 'Case Outcomes', icon: BrainCircuit },
    ]
  }
];

// =============================================================================
// BILLING MODULE TABS
// =============================================================================

export const BILLING_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'revenue', label: 'Revenue Ops', icon: DollarSign,
    subTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'reports', label: 'Reports', icon: FileText },
      { id: 'timekeeper', label: 'Time Entry', icon: Clock },
    ]
  },
  {
    id: 'ledger', label: 'Ledger & Trust', icon: Wallet,
    subTabs: [
      { id: 'trust', label: 'Trust Accounts', icon: Wallet },
      { id: 'settings', label: 'Settings', icon: ShieldCheck },
    ]
  },
  {
    id: 'reports', label: 'Analytics', icon: BarChart2,
    subTabs: [
      { id: 'analytics', label: 'Revenue Analytics', icon: BarChart2 },
    ]
  }
];

// =============================================================================
// CASE LIST MODULE TABS
// =============================================================================

export const CASE_LIST_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'matters', label: 'Matters', icon: Briefcase,
    subTabs: [
      { id: 'active', label: 'Active Cases', icon: Briefcase },
      { id: 'intake', label: 'Intake Pipeline', icon: UserPlus },
      { id: 'docket', label: 'Master Docket', icon: FileText },
    ]
  },
  {
    id: 'ops', label: 'Operations', icon: CheckSquare,
    subTabs: [
      { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
      { id: 'conflicts', label: 'Conflict Check', icon: ShieldAlert },
      { id: 'resources', label: 'Resources', icon: Users },
    ]
  },
  {
    id: 'finance', label: 'Financials', icon: DollarSign,
    subTabs: [
      { id: 'trust', label: 'Trust Accounts', icon: DollarSign },
    ]
  },
  {
    id: 'archive', label: 'Archives', icon: Archive,
    subTabs: [
      { id: 'closing', label: 'Closing', icon: Archive },
      { id: 'archived', label: 'Archived', icon: Archive },
    ]
  }
];

// =============================================================================
// COMPLIANCE MODULE TABS
// =============================================================================

export const COMPLIANCE_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'risk_center', label: 'Risk Center', icon: ShieldAlert,
    subTabs: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'policies', label: 'Regulatory Policies', icon: ScrollText },
    ]
  },
  {
    id: 'clearance', label: 'Clearance', icon: ShieldAlert,
    subTabs: [
      { id: 'conflicts', label: 'Conflict Checks', icon: ShieldAlert },
    ]
  },
  {
    id: 'barriers', label: 'Information Barriers', icon: Lock,
    subTabs: [
      { id: 'walls', label: 'Ethical Walls', icon: Lock },
    ]
  }
];

// =============================================================================
// CRM MODULE TABS
// =============================================================================

export const CRM_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'crm_main', label: 'CRM', icon: Users,
    subTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'directory', label: 'Clients', icon: Users },
      { id: 'pipeline', label: 'Pipeline', icon: GitPullRequest },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ]
  }
];

// =============================================================================
// DASHBOARD MODULE TABS
// =============================================================================

export const DASHBOARD_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'overview_group', label: 'Overview', icon: LayoutDashboard,
    subTabs: [
      { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
      { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ]
  },
  {
    id: 'performance_group', label: 'Performance', icon: PieChart,
    subTabs: [
      { id: 'analytics', label: 'Firm Analytics', icon: PieChart },
      { id: 'activity', label: 'Activity Log', icon: Activity },
    ]
  }
];

// =============================================================================
// DATA PLATFORM MENU
// =============================================================================

export const DATA_PLATFORM_MENU: MenuItem[] = [
  { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
  { 
    id: 'sources', label: 'Data Sources', icon: Database,
    children: [
      { id: 'sources-local', label: 'Local Storage', icon: HardDrive },
      { id: 'sources-indexeddb', label: 'IndexedDB', icon: Database },
      { id: 'sources-cloud', label: 'Cloud Databases', icon: Cloud }
    ]
  },
  { 
    id: 'schema', label: 'Schema Architect', icon: Database,
    children: [
      { id: 'schema-designer', label: 'Visual Designer', icon: Table },
      { id: 'schema-migrations', label: 'Migrations', icon: Code },
      { id: 'schema-snapshots', label: 'Snapshots', icon: History }
    ]
  },
  { 
    id: 'query', label: 'SQL Workbench', icon: Terminal,
    children: [
      { id: 'query-editor', label: 'Query Editor', icon: Code },
      { id: 'query-history', label: 'History', icon: History },
      { id: 'query-saved', label: 'Saved Queries', icon: Book }
    ]
  },
  { 
    id: 'pipeline', label: 'ETL Pipelines', icon: GitMerge,
    children: [
      { id: 'pipeline-monitor', label: 'Job Monitor', icon: Activity },
      { id: 'pipeline-visual', label: 'Topology', icon: GitMerge },
      { id: 'pipeline-connectors', label: 'Connectors', icon: Network }
    ]
  },
  { 
    id: 'sync', label: 'Sync Engine', icon: Repeat,
    children: [
      { id: 'sync-status', label: 'Status', icon: Activity },
      { id: 'sync-queues', label: 'Queue Manager', icon: Layers },
      { id: 'sync-conflicts', label: 'Conflicts', icon: AlertOctagon }
    ]
  },
  { 
    id: 'security', label: 'Security', icon: ShieldCheck,
    children: [
      { id: 'security-keys', label: 'API Keys', icon: Key },
      { id: 'security-audit', label: 'Audit Trail', icon: History },
      { id: 'security-encryption', label: 'Encryption', icon: Lock }
    ]
  },
  { 
    id: 'backup', label: 'Backup & Restore', icon: Archive,
    children: [
      { id: 'backup-snapshots', label: 'Snapshots', icon: History },
      { id: 'backup-schedule', label: 'Schedule', icon: Clock },
      { id: 'backup-restore', label: 'Restore', icon: Archive }
    ]
  },
  { 
    id: 'monitoring', label: 'Monitoring', icon: Activity,
    children: [
      { id: 'monitoring-performance', label: 'Performance', icon: Activity },
      { id: 'monitoring-alerts', label: 'Alerts', icon: Bell },
      { id: 'monitoring-logs', label: 'System Logs', icon: FileText }
    ]
  },
  { 
    id: 'ai', label: 'AI Data Ops', icon: Sparkles,
    children: [
      { id: 'ai-vectors', label: 'Vector Store', icon: Sparkles },
      { id: 'ai-embeddings', label: 'Embeddings', icon: Network },
      { id: 'ai-models', label: 'Model Registry', icon: BrainCircuit }
    ]
  },
  { 
    id: 'realtime', label: 'Realtime', icon: Radio,
    children: [
      { id: 'realtime-streams', label: 'Data Streams', icon: Radio },
      { id: 'realtime-webhooks', label: 'Webhooks', icon: Link },
      { id: 'realtime-events', label: 'Event Bus', icon: GitCommit }
    ]
  },
  { 
    id: 'versions', label: 'Version Control', icon: GitCommit,
    children: [
      { id: 'versions-history', label: 'History', icon: History },
      { id: 'versions-branches', label: 'Branches', icon: GitMerge },
      { id: 'versions-tags', label: 'Tags', icon: Bookmark }
    ]
  },
  { 
    id: 'config', label: 'Configuration', icon: Settings,
    children: [
      { id: 'config-general', label: 'General', icon: Settings },
      { id: 'config-advanced', label: 'Advanced', icon: Code },
      { id: 'config-imports', label: 'Import/Export', icon: FileSearch }
    ]
  }
];

// =============================================================================
// DOCUMENT MANAGER MODULE TABS
// =============================================================================

export const DOCUMENT_MANAGER_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'files', label: 'Files', icon: Folder,
    subTabs: [
      { id: 'browse', label: 'Browse', icon: Folder },
      { id: 'recent', label: 'Recent', icon: Clock },
      { id: 'favorites', label: 'Favorites', icon: Star },
    ]
  },
  {
    id: 'drafting', label: 'Drafting', icon: LayoutTemplate,
    subTabs: [
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Cpu,
    subTabs: [
      { id: 'signing', label: 'eSignature', icon: FileSignature },
      { id: 'redaction', label: 'Redaction', icon: Eraser },
      { id: 'batch', label: 'Batch Ops', icon: Cpu },
    ]
  }
];

// =============================================================================
// EVIDENCE VAULT MODULE TABS
// =============================================================================

export const EVIDENCE_PARENT_TABS: TabConfigItem[] = [
  {
    id: 'vault_main', label: 'Vault', icon: Box,
    subTabs: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'inventory', label: 'Inventory', icon: Box },
      { id: 'custody', label: 'Chain of Custody', icon: Lock },
      { id: 'intake', label: 'Intake', icon: Plus },
    ]
  }
];

// =============================================================================
// KNOWLEDGE BASE MODULE TABS
// =============================================================================

export const KNOWLEDGE_BASE_TABS: TabConfigItem[] = [
  {
    id: 'content',
    label: 'Content',
    icon: BookOpen,
    subTabs: [
      { id: 'wiki', label: 'Firm Wiki & SOPs', icon: BookOpen },
      { id: 'precedents', label: 'Precedents Library', icon: FileText },
      { id: 'qa', label: 'Q&A Forum', icon: Users },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
      { id: 'cle', label: 'CLE Tracker', icon: GraduationCap },
    ],
  },
];

// =============================================================================
// PLEADING BUILDER MODULE TABS
// =============================================================================

export const PLEADING_BUILDER_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'workspace', label: 'Workspace', icon: FileText,
    subTabs: [
      { id: 'drafts', label: 'My Drafts', icon: FileText },
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Library,
    subTabs: [
      { id: 'clauses', label: 'Clause Library', icon: Library },
    ]
  },
  {
    id: 'filing', label: 'Filing', icon: Send,
    subTabs: [
      { id: 'queue', label: 'Filing Queue', icon: Send },
      { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    ]
  }
];

// =============================================================================
// RESEARCH TOOL MODULE TABS
// =============================================================================

export const RESEARCH_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'search_group', label: 'Research', icon: Search,
    subTabs: [
      { id: 'active', label: 'Active Session', icon: Search },
      { id: 'history', label: 'History', icon: History },
      { id: 'saved', label: 'Saved', icon: Bookmark },
    ]
  },
  {
    id: 'tools_group', label: 'Tools', icon: Scale,
    subTabs: [
        { id: 'shepardize', label: 'Shepardize', icon: Scale },
        { id: 'bluebook', label: 'Bluebook', icon: BookOpen },
        { id: 'library', label: 'Clause Library', icon: Library },
    ]
  },
  {
      id: 'config_group', label: 'Config', icon: Settings,
      subTabs: [
          { id: 'settings', label: 'Jurisdictions', icon: Gavel }
      ]
  }
];

// =============================================================================
// RULES PLATFORM MODULE TABS
// =============================================================================

export const RULES_PLATFORM_TABS: TabConfigItem[] = [
  {
    id: 'overview', label: 'Overview', icon: LayoutDashboard,
    subTabs: [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard } ]
  },
  {
    id: 'federal', label: 'Federal Rules', icon: Scale,
    subTabs: [
      { id: 'federal_evidence', label: 'Evidence (FRE)', icon: BookOpen },
      { id: 'federal_civil', label: 'Civil Procedure (FRCP)', icon: FileText },
    ]
  },
  {
    id: 'local_courts', label: 'Local & Standing', icon: Gavel,
    subTabs: [
      { id: 'local', label: 'Local Rules', icon: Map },
      { id: 'standing_orders', label: 'Standing Orders', icon: Gavel },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Settings,
    subTabs: [
      { id: 'search', label: 'Deep Search', icon: Search },
      { id: 'compare', label: 'Redline / Compare', icon: GitCompare },
    ]
  }
];
