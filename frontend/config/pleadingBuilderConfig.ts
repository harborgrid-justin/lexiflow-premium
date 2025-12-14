import { FileText, LayoutTemplate, Library, Send, BarChart2 } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export const PLEADING_BUILDER_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'workspace', label: 'Workspace', icon: FileText,
    subTabs: [
      { id: 'drafts', label: 'My Drafts', icon: FileText },
      { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    ]
  },
  {
    id: 'tools', label: 'Tools', icon: Library,
    subTabs: [
      { id: 'clauses', label: 'Clause Library', icon: Library },
    ]
  },
  {
    id: 'filing', label: 'Filing', icon: Send,
    subTabs: [
      { id: 'queue', label: 'Filing Queue', icon: Send },
      { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    ]
  }
];
