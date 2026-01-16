/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import type { MetaArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';
import BillingDashboard from './components/BillingDashboard';

export function meta(_args: MetaArgs) {
  return createListMeta({
    entityType: 'Billing',
    description: 'Manage invoices, payments, and financial reports',
  });
}

export default function BillingIndexRoute() {
  return <BillingDashboard />;
}
