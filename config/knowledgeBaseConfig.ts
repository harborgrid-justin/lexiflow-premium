import { BookOpen, FileText, Users, BarChart3, GraduationCap } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export type KnowledgeView = 'wiki' | 'precedents' | 'qa' | 'analytics' | 'cle';

export const KNOWLEDGE_BASE_TABS: TabConfigItem[] = [
  {
    id: 'content',
    label: 'Content',
    icon: BookOpen,
    subTabs: [
      { id: 'wiki', label: 'Firm Wiki & SOPs', icon: BookOpen },
      { id: 'precedents', label: 'Precedents Library', icon: FileText },
      { id: 'qa', label: 'Q&A Forum', icon: Users },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: BarChart3,
    subTabs: [
      { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
      { id: 'cle', label: 'CLE Tracker', icon: GraduationCap },
    ],
  },
];
