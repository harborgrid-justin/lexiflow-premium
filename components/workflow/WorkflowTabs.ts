
import { LayoutTemplate, Briefcase, Layers, Activity, BarChart2, Settings, Play } from 'lucide-react';

export const WORKFLOW_TABS = [
  {
    id: 'design', label: 'Design', icon: LayoutTemplate,
    subTabs: [
      { id: 'templates', label: 'Template Library', icon: LayoutTemplate },
    ]
  },
  {
    id: 'execution', label: 'Execution', icon: Play,
    subTabs: [
      { id: 'cases', label: 'Case Workflows', icon: Briefcase },
      { id: 'firm', label: 'Firm Processes', icon: Layers },
    ]
  },
  {
    id: 'ops', label: 'Operations', icon: Activity,
    subTabs: [
      { id: 'ops_center', label: 'Ops Center', icon: Activity },
      { id: 'analytics', label: 'Performance', icon: BarChart2 },
    ]
  },
  {
    id: 'admin', label: 'Admin', icon: Settings,
    subTabs: [
      { id: 'settings', label: 'Configuration', icon: Settings },
    ]
  }
];
