/**
 * @module components/pages/CalendarPage
 * @category Pages
 * @description Calendar and scheduling page - deadline tracking and event management
 */

import React from 'react';

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { CalendarMaster } from '@/routes/cases/components/calendar/CalendarMaster';

interface CalendarPageProps {
  caseId?: string;
}

/**
 * CalendarPage - React 18 optimized with React.memo
 */
export const CalendarPage = React.memo<CalendarPageProps>(function CalendarPage({ caseId: _caseId }) {
  return (
    <PageContainerLayout>
      <CalendarMaster />
    </PageContainerLayout>
  );
});
