/**
 * @module components/pages/RulesPage
 * @category Pages
 * @description Rules and procedures page - federal and local rules library
 */

import React from 'react';
import { RulesDashboard } from '@/features/knowledge/rules/RulesDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import { RulesView } from '@/config/tabs.config';

interface RulesPageProps {
  onNavigate: (view: RulesView) => void;
}

/**
 * RulesPage - React 18 optimized with React.memo
 */
export const RulesPage = React.memo<RulesPageProps>(({ onNavigate }) => {
  return (
    <PageContainerLayout>
      <RulesDashboard onNavigate={onNavigate} />
    </PageContainerLayout>
  );
});
