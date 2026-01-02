/**
 * Billing Page - Server Component
 */
import BillingDashboard from '@/components/billing/BillingDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing & Finance | LexiFlow',
  description: 'Manage invoices, track time, and monitor financial health',
};

export default function BillingPage() {
  return <BillingDashboard />;
}
