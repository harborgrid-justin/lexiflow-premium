import React, { lazy } from 'react';
import { BillingView } from '../../../config/tabs.config';

const BillingOverview = lazy(() => import('./BillingOverview').then(m => ({ default: m.BillingOverview })));
const BillingInvoices = lazy(() => import('./BillingInvoices').then(m => ({ default: m.BillingInvoices })));
const BillingWIP = lazy(() => import('./BillingWIP').then(m => ({ default: m.BillingWIP })));
const BillingLedger = lazy(() => import('./BillingLedger').then(m => ({ default: m.BillingLedger })));
const Analytics = () => <div className="p-8 text-center text-slate-500">Financial Analytics Module Loading...</div>;

interface BillingDashboardContentProps {
  activeTab: BillingView;
  navigateTo?: (view: string) => void;
}

export const BillingDashboardContent: React.FC<BillingDashboardContentProps> = ({ activeTab, navigateTo }) => {
    switch (activeTab as string) {
        case 'overview': return <BillingOverview onNavigate={navigateTo} />;
        case 'invoices': return <BillingInvoices />;
        case 'wip': return <BillingWIP />;
        case 'expenses':
        case 'trust':
            return <BillingLedger />;
        case 'analytics': return <Analytics />;
        default: return <BillingOverview onNavigate={navigateTo} />;
    }
};