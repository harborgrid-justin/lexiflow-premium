
import { LayoutDashboard, Box, Lock, Plus } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

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
