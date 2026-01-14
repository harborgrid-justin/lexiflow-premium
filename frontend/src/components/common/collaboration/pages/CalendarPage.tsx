/**
 * @module components/pages/CalendarPage
 * @category Pages
 * @description Calendar and scheduling page - deadline tracking and event management
 */

import { CalendarMaster } from '@/features/cases/components/calendar/CalendarMaster';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

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
