/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseIntakePage
 * @category Pages
 * @description New case intake and onboarding page - form-based case creation
 */

import { CenteredLayout } from '@/layouts/CenteredLayout/CenteredLayout';
import { NewCaseIntakeForm } from '@/routes/cases/components/intake/NewCaseIntakeForm';
import React from 'react';

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
