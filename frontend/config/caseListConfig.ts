import { Briefcase, UserPlus, FileText, CheckSquare, ShieldAlert, Users, DollarSign, Archive } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

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