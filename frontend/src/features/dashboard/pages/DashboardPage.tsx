/**
 * @module components/pages/DashboardPage
 * @category Pages
 * @description Enterprise dashboard page - aggregates dashboard features into a standardized page
 */

import React from 'react';
import { Dashboard } from '@/features/dashboard/components/Dashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import type { User } from '@/types/system';

interface DashboardPageProps {
  onSelectCase: (caseId: string) => void;
  currentUser: User;
  initialTab?: string;
}

/**
 * DashboardPage - React 18 optimized with React.memo
 */
export const DashboardPage = React.memo<DashboardPageProps>(({ 
  onSelectCase, 
  currentUser, 
  initialTab 
}) => {
  return (
    <PageContainerLayout>
      <Dashboard 
        onSelectCase={onSelectCase} 
        currentUser={currentUser}
        initialTab={initialTab}
      />
    </PageContainerLayout>
  );
});
