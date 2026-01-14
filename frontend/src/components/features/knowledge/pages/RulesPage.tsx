/**
 * @module components/pages/RulesPage
 * @category Pages
 * @description Rules and procedures page - federal and local rules library
 */

import { RulesDashboard } from '@/routes/rules/components/RulesDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import { RulesView } from '@/config/tabs.config';
import React from "react";

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
