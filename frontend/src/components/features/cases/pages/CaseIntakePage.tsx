/**
 * @module components/pages/CaseIntakePage
 * @category Pages
 * @description New case intake and onboarding page - form-based case creation
 */

import React from 'react';
import { NewCaseIntakeForm } from '@/features/cases/components/intake/NewCaseIntakeForm';
import { CenteredLayout } from '@/components/ui/layouts/CenteredLayout/CenteredLayout';

interface CaseIntakePageProps {
  onComplete?: (caseId: string) => void;
  onCancel?: () => void;
}

/**
 * CaseIntakePage - React 18 optimized with React.memo
 */
export const CaseIntakePage = React.memo<CaseIntakePageProps>(({ 
  onComplete: _onComplete, 
  onCancel: _onCancel
}) => {
  return (
    <CenteredLayout maxWidth="2xl" verticalCenter={false}>
      <NewCaseIntakeForm />
    </CenteredLayout>
  );
});
