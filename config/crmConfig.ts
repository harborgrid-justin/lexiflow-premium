
import { LayoutDashboard, Users, GitPullRequest, BarChart3 } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export type CRMView = 'dashboard' | 'directory' | 'pipeline' | 'analytics';

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
