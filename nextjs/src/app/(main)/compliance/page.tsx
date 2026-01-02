/**
 * Compliance Page - Server Component with Data Fetching
 * Fetches compliance data and conflict checks from backend
 */
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Compliance | LexiFlow',
  description: 'Risk & Compliance Center',
};

export default async function CompliancePage() {
  // Fetch compliance data from backend
  let complianceData = null;
  let conflicts = [];
  let ethicalWalls = [];

  try {
    const [data, conflictsData, wallsData] = await Promise.all([
      apiFetch(API_ENDPOINTS.COMPLIANCE.ROOT).catch(() => null),
      apiFetch(API_ENDPOINTS.CONFLICT_CHECKS.LIST).catch(() => []),
      apiFetch(API_ENDPOINTS.ETHICAL_WALLS.LIST).catch(() => []),
    ]);
    complianceData = data;
    conflicts = conflictsData;
    ethicalWalls = wallsData;
  } catch (error) {
    console.error('Failed to load compliance data:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading compliance dashboard...</div>}>
        <ComplianceDashboard
          initialData={complianceData}
          initialConflicts={conflicts}
          initialEthicalWalls={ethicalWalls}
        />
      </Suspense>
    </div>
  );
}
