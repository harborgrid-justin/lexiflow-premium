
import { LayoutDashboard, CheckSquare, Bell, PieChart, Activity } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

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
