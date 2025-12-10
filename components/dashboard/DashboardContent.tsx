import React from 'react';
import { DashboardOverview } from './DashboardOverview';
import { PersonalWorkspace } from './PersonalWorkspace';
import { User } from '../types';

interface DashboardContentProps {
  activeTab: string;
  onSelectCase: (caseId: string) => void;
  currentUser: User;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeTab, onSelectCase, currentUser }) => {
  switch (activeTab) {
    case 'overview': return <DashboardOverview onSelectCase={onSelectCase} />;
    case 'tasks': return <PersonalWorkspace activeTab="tasks" currentUser={currentUser} />;
    case 'notifications': return <PersonalWorkspace activeTab="notifications" currentUser={currentUser} />;
    // Fallback
    default: return <DashboardOverview onSelectCase={onSelectCase} />;
  }
};