
import { 
  LayoutDashboard, Database, ShieldCheck, GitMerge, Archive, Terminal, 
  Lock, Book, Radio, Sparkles, Repeat, Network, DollarSign, 
  Table, Code, Activity, History, FileText, Key, BarChart2, FileSearch,
  AlertOctagon, Layers, GitCommit, Users, HardDrive
} from 'lucide-react';
import { PlatformView } from '../components/admin/AdminDatabaseControl';

type MenuItem = {
  id: PlatformView;
  label: string;
  icon: any;
  children?: { id: PlatformView; label: string; icon: any }[];
};

export const DATA_PLATFORM_MENU: MenuItem[] = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
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
        { id: 'pipeline-dag', label: 'DAG Monitor', icon: Activity },
        { id: 'pipeline-jobs', label: 'Job History', icon: Activity },
        { id: 'pipeline-connectors', label: 'Connectors', icon: Network }
      ]
    },
    {
      id: 'lake', label: 'Data Lake', icon: HardDrive
    },
    { 
      id: 'lineage', label: 'Data Lineage', icon: Network,
      children: [
        { id: 'lineage-graph', label: 'Dependency Graph', icon: GitCommit },
        { id: 'lineage-impact', label: 'Impact Analysis', icon: Layers },
      ]
    },
    { 
      id: 'quality', label: 'Data Quality', icon: Sparkles,
      children: [
        { id: 'quality-dashboard', label: 'Quality Scorecard', icon: BarChart2 },
        { id: 'quality-profiler', label: 'Data Profiler', icon: FileSearch },
        { id: 'quality-rules', label: 'Validation Rules', icon: AlertOctagon },
      ]
    },
    { 
      id: 'governance', label: 'Governance', icon: ShieldCheck,
      children: [
         { id: 'governance-overview', label: 'Compliance', icon: ShieldCheck },
         { id: 'governance-policies', label: 'Policies', icon: FileText },
         { id: 'governance-access', label: 'Access Reviews', icon: Users },
      ] 
    },
    { 
      id: 'catalog', label: 'Data Catalog', icon: Book,
      children: [
          { id: 'catalog-browse', label: 'Browse Assets', icon: Table },
          { id: 'catalog-dictionary', label: 'Data Dictionary', icon: Book },
          { id: 'catalog-requests', label: 'Access Requests', icon: Key },
      ]
    },
    { 
      id: 'security', label: 'Row Security', icon: Lock,
      children: [
        { id: 'security-policies', label: 'RLS Policies', icon: FileText },
        { id: 'security-roles', label: 'DB Roles', icon: ShieldCheck }
      ]
    },
    { id: 'replication', label: 'Replication', icon: Repeat },
    { id: 'api', label: 'API Gateway', icon: Radio },
    { id: 'backup', label: 'Vault & Recovery', icon: Archive },
    { id: 'cost', label: 'FinOps', icon: DollarSign },
  ];
