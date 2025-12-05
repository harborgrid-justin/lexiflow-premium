
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  DollarSign, FileText, PieChart, Activity, Calculator, CreditCard, Landmark, RefreshCw 
} from 'lucide-react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { PeriodSelector } from './common/PeriodSelector';
import { ExportMenu } from './common/ExportMenu';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { useMutation } from '../services/queryClient';
import { DataService } from '../services/dataService';
import { useNotify } from '../hooks/useNotify';

// Sub-components
import { BillingOverview } from './billing/BillingOverview';
import { BillingInvoices } from './billing/BillingInvoices';
import { BillingWIP } from './billing/BillingWIP';
import { BillingLedger } from './billing/BillingLedger';

type BillingView = 'overview' | 'invoices' | 'wip' | 'expenses' | 'trust' | 'analytics';

const PARENT_TABS = [
  {
    id: 'revenue', label: 'Revenue Cycle', icon: DollarSign,
    subTabs: [
      { id: 'overview', label: 'Dashboard', icon: Activity },
      { id: 'invoices', label: 'Invoices', icon: FileText },
      { id: 'wip', label: 'WIP & Time', icon: Calculator },
    ]
  },
  {
    id: 'accounting', label: 'Accounting', icon: Landmark,
    subTabs: [
      { id: 'expenses', label: 'General Ledger', icon: CreditCard },
      { id: 'trust', label: 'Trust (IOLTA)', icon: Landmark },
    ]
  },
  {
    id: 'reporting', label: 'Reporting', icon: PieChart,
    subTabs: [
      { id: 'analytics', label: 'Analytics', icon: PieChart },
    ]
  }
];

interface BillingDashboardProps {
  navigateTo?: (view: string) => void;
  initialTab?: BillingView;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ navigateTo, initialTab }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [activeTab, setActiveTab] = useState<BillingView>('overview');
  const [period, setPeriod] = useState('30d');

  // Sync Mutation
  const { mutate: syncFinancials, isLoading: isSyncing } = useMutation(
      DataService.billing.sync,
      {
          onSuccess: () => notify.success("Financial data synced with external ledger.")
      }
  );

  // Export Mutation
  const { mutate: exportReport } = useMutation(
      async (format: string) => {
          return DataService.billing.export(format);
      },
      {
          onSuccess: (_, format) => notify.success(`Report exported successfully (${format.toUpperCase()}).`)
      }
  );

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as BillingView);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <BillingOverview onNavigate={navigateTo} />;
      case 'invoices': return <BillingInvoices />;
      case 'wip': return <BillingWIP />;
      case 'expenses': return <BillingLedger />; // Defaults to operating tab inside
      case 'trust': return <BillingLedger />; // Could pass prop to default to trust
      case 'analytics': return <div className={cn("p-12 text-center italic", theme.text.tertiary)}>Advanced analytics module loading...</div>;
      default: return <BillingOverview />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Billing & Finance" 
          subtitle="Revenue cycle management, invoicing, and firm accounting."
          actions={
            <div className="flex gap-3 items-center">
                <PeriodSelector selected={period} onChange={setPeriod} />
                <ExportMenu onExport={exportReport} />
                <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => syncFinancials(undefined)} isLoading={isSyncing}>Sync</Button>
            </div>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as BillingView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
