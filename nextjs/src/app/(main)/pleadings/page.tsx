import { PleadingsView } from '@/components/pleadings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pleadings | LexiFlow',
  description: 'Manage and draft legal pleadings',
};

export default function Page() {
  return <PleadingsView />;
}
