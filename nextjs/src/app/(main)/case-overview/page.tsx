import { CaseOverviewDashboard } from '@/components/case-overview/CaseOverviewDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Overview | LexiFlow',
  description: 'Enterprise Matter Management Command Center',
};

export default function Page() {
  return <CaseOverviewDashboard />;
}
