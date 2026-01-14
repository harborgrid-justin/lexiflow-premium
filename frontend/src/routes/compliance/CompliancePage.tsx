import { useLoaderData } from 'react-router';
import { ComplianceProvider } from './ComplianceProvider';
import { ComplianceView } from './ComplianceView';
import type { clientLoader } from './loader';

export function CompliancePageContent() {
  const data = useLoaderData<typeof clientLoader>();
  return (
    <ComplianceProvider initialChecks={data.checks} initialConflicts={data.conflicts} initialDeadlines={data.deadlines}>
      <ComplianceView />
    </ComplianceProvider>
  );
}
