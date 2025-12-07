import { Scale, Gavel, BookOpen, Map, Search, LayoutDashboard, FileText, Settings, GitCompare } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export type RulesView = 'dashboard' | 'federal_evidence' | 'federal_civil' | 'local' | 'standing_orders' | 'compare' | 'search';

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
