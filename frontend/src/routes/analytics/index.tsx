/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { AnalyticsDashboard } from '@/routes/admin/components/analytics/AnalyticsDashboard';
import { createListMeta } from '../_shared/meta-utils';
export function meta() {
  return createListMeta({
    entityType: 'Analytics',
    description: 'View system usage, performance metrics, and business intelligence',
  });
}

export default function AnalyticsIndexRoute() {
  return <AnalyticsDashboard />;
}
