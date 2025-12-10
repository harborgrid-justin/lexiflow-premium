import { LayoutDashboard, FileText, Clock, Wallet, ShieldCheck, BarChart2 } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export type BillingView = 'overview' | 'invoices' | 'wip' | 'expenses' | 'trust' | 'analytics';

export const BILLING_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'revenue', label: 'Revenue', icon: LayoutDashboard,
    subTabs: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'wip', label: 'WIP', icon: Clock },
    ]
  },
  {
    id: 'ledger', label: 'Ledger', icon: Wallet,
    subTabs: [
      { id: 'expenses', label: 'Expenses', icon: Wallet },
      { id: 'trust', label: 'Trust (IOLTA)', icon: ShieldCheck },
    ]
  },
  {
    id: 'reports', label: 'Reporting', icon: BarChart2,
    subTabs: [
      { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    ]
  }
];