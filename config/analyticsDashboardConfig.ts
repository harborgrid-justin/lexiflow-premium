import { BarChart3, Gavel, Users, TrendingUp, BrainCircuit } from 'lucide-react';
import { TabConfigItem } from '../components/layout/TabbedPageLayout';

export const ANALYTICS_TAB_CONFIG: TabConfigItem[] = [
  {
    id: 'intel', label: 'Litigation Intelligence', icon: BarChart3,
    subTabs: [
      { id: 'judge', label: 'Judge Analytics', icon: Gavel },
      { id: 'counsel', label: 'Opposing Counsel', icon: Users },
    ]
  },
  {
    id: 'model', label: 'Predictive Modeling', icon: BrainCircuit,
    subTabs: [
      { id: 'prediction', label: 'Outcome Forecast', icon: TrendingUp },
    ]
  }
];
