/**
 * ReportingDashboard - Main reporting dashboard
 */

import type { Report } from '../../../services/data/api/gateways/reportingGateway';
import { Button } from '../../../ui/components/Button';
import { Table, type Column } from '../../../ui/components/Table';
import { useReporting } from '../hooks/useReporting';

export function ReportingDashboard() {
  const { reports, loading, error, refresh } = useReporting();

  const columns: Column<Report>[] = [
    { key: 'name', header: 'Report Name' },
    { key: 'type', header: 'Type', render: (r) => r.type.toUpperCase() },
    { key: 'status', header: 'Status' },
    { key: 'generatedAt', header: 'Date', render: (r) => new Date(r.generatedAt).toLocaleDateString() }
  ];

  if (loading) return <div>Loading reports...</div>;

  if (error) return (
    <div className="error-state">
      <p>{error}</p>
      <Button onClick={refresh}>Retry</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Reporting & Analytics</h1>
        <Button onClick={() => console.info('Generate report')}>Generate Report</Button>
      </div>

      {reports.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
          <p className="mb-4 text-slate-600">No reports generated yet.</p>
          <Button variant="secondary" onClick={() => console.info('Generate report')}>
            Generate First Report
          </Button>
        </div>
      ) : (
        <Table
          data={reports}
          columns={columns}
          keyExtractor={(r) => r.id}
        />
      )}
    </div>
  );
}
