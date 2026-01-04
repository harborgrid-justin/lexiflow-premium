import BillingDashboard from '@/features/operations/billing/BillingDashboard';
import type { MetaArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';

export function meta(_args: MetaArgs) {
  return createListMeta({
    entityType: 'Billing',
    description: 'Manage invoices, payments, and financial reports',
  });
}

export default function BillingIndexRoute() {
  return <BillingDashboard />;
}
