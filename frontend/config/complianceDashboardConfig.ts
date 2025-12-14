import { LayoutDashboard, ShieldAlert, Lock, ScrollText } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

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
