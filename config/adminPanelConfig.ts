import { Network, Shield, Link, Database, Activity, Lock, Server } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export const ADMIN_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'org', label: 'Organization', icon: Network,
    subTabs: [
      { id: 'hierarchy', label: 'Hierarchy & Access', icon: Network },
      { id: 'security', label: 'Security Policies', icon: Lock },
    ]
  },
  {
    id: 'data_mgmt', label: 'Data Management', icon: Database,
    subTabs: [
      { id: 'db', label: 'Database Control', icon: Server },
      { id: 'data', label: 'Platform Data', icon: Database },
    ]
  },
  {
    id: 'system', label: 'System Health', icon: Activity,
    subTabs: [
      { id: 'logs', label: 'Audit Logs', icon: Shield },
      { id: 'integrations', label: 'Integrations', icon: Link },
    ]
  }
];
