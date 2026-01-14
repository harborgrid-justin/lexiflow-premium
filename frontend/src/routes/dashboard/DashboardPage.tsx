import { useLoaderData } from 'react-router';
import { DashboardProvider } from './DashboardProvider';
import { DashboardView } from './DashboardView';
import type { clientLoader } from './loader';

/**
 * Dashboard Page - Data Orchestration Layer
 */
export function DashboardPageContent() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <DashboardProvider
      initialCases={data.cases}
      initialDocketEntries={data.recentDocketEntries}
      initialTimeEntries={data.recentTimeEntries}
      initialTasks={data.tasks}
    >
      <DashboardView />
    </DashboardProvider>
  );
}
