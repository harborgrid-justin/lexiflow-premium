import { CaseCalendar } from '@/components/case-calendar/CaseCalendar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Calendar | LexiFlow',
  description: 'Manage Case Calendar',
};

export default function Page() {
  return <CaseCalendar />;
}
