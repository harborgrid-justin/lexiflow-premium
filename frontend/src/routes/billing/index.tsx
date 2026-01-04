import BillingDashboard from '@/features/operations/billing/BillingDashboard';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Billing',
    description: 'Manage invoices, payments, and financial reports',
  });
}

export default function BillingIndexRoute() {
  return <BillingDashboard />;
}
