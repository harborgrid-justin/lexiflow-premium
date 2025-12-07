
import { Search, BookOpen, Scale, Gavel, History, Bookmark, Settings } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export const RESEARCH_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'search_group', label: 'Research', icon: Search,
    subTabs: [
      { id: 'active', label: 'Active Session', icon: Search },
      { id: 'history', label: 'History', icon: History },
      { id: 'saved', label: 'Saved', icon: Bookmark },
    ]
  },
  {
    id: 'tools_group', label: 'Tools', icon: Scale,
    subTabs: [
        { id: 'shepard', label: 'Shepards', icon: Scale },
        { id: 'bluebook', label: 'Bluebook', icon: BookOpen },
    ]
  },
  {
      id: 'config_group', label: 'Config', icon: Settings,
      subTabs: [
          { id: 'settings', label: 'Jurisdictions', icon: Gavel }
      ]
  }
];
