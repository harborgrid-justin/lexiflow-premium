
import React from 'react';
import { DashboardOverview } from './DashboardOverview';
import { PersonalWorkspace } from './PersonalWorkspace';

interface DashboardContentProps {
  activeTab: string;
  onSelectCase: (caseId: string) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeTab, onSelectCase }) => {
  switch (activeTab) {
    case 'overview': return <DashboardOverview onSelectCase={onSelectCase} />;
    case 'tasks': return <PersonalWorkspace activeTab="tasks" />;
    case 'notifications': return <PersonalWorkspace activeTab="notifications" />;
    // Fallback
    default: return <DashboardOverview onSelectCase={onSelectCase} />;
  }
};
