import { CaseAnalytics } from '@/components/case-analytics/CaseAnalytics';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Analytics | LexiFlow',
  description: 'Manage Case Analytics',
};

export default function Page() {
  return <CaseAnalytics />;
}
