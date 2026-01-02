'use client';

import { Calendar, CreditCard, Download, RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';

// Mock Components
const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, leftIcon, className }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${variant === 'outline'
        ? 'border border-slate-200 hover:bg-slate-50 text-slate-700'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {leftIcon}
    {children}
  </button>
);

const PeriodSelector = ({ value, onChange }: any) => (
  <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-2 bg-white">
    <Calendar className="h-4 w-4 text-slate-500" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
    >
      <option value="7d">Last 7 days</option>
      <option value="30d">Last 30 days</option>
      <option value="90d">Last 90 days</option>
      <option value="ytd">Year to Date</option>
    </select>
  </div>
);

const ExportMenu = ({ onExport, isExporting }: any) => (
  <Button variant="outline" onClick={() => onExport('pdf')} disabled={isExporting} leftIcon={<Download className="h-4 w-4" />}>
    Export
  </Button>
);

// Mock Sub-components
const BillingOverview = () => (
  <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
        <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
        <div className="text-2xl font-bold text-blue-900">$124,500</div>
      </div>
      <div className="p-4 bg-emerald-50 rounded-md border border-emerald-100">
        <div className="text-sm text-emerald-600 font-medium">Collected</div>
        <div className="text-2xl font-bold text-emerald-900">$98,200</div>
      </div>
      <div className="p-4 bg-amber-50 rounded-md border border-amber-100">
        <div className="text-sm text-amber-600 font-medium">Outstanding</div>
        <div className="text-2xl font-bold text-amber-900">$26,300</div>
      </div>
    </div>
  </div>
);

const BillingInvoices = () => (
  <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Invoices</h3>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-md hover:bg-slate-50">
          <div>
            <div className="font-medium">INV-2024-00{i}</div>
            <div className="text-sm text-slate-500">Acme Corp - Legal Services</div>
          </div>
          <div className="text-right">
            <div className="font-medium">$1,250.00</div>
            <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block mt-1">Paid</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const BillingWIP = () => (
  <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Work In Progress</h3>
    <p className="text-slate-500">Track unbilled time and expenses here.</p>
  </div>
);

const BillingLedger = () => (
  <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">General Ledger</h3>
    <p className="text-slate-500">View all financial transactions.</p>
  </div>
);

const Analytics = () => (
  <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
    <h3 className="text-lg font-semibold mb-4">Analytics</h3>
    <p className="text-slate-500">Financial charts and reports.</p>
  </div>
);

// Tab Configuration
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'wip', label: 'WIP' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'trust', label: 'Trust' },
  { id: 'analytics', label: 'Analytics' },
];

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('30d');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}...`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <BillingOverview />;
      case 'invoices': return <BillingInvoices />;
      case 'wip': return <BillingWIP />;
      case 'expenses':
      case 'trust':
      case 'ledger': return <BillingLedger />;
      case 'analytics': return <Analytics />;
      default: return <BillingOverview />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Billing & Finance</h1>
              <p className="text-slate-500">Manage invoices, track time, and monitor financial health</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              leftIcon={<RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>
            <ExportMenu onExport={handleExport} isExporting={false} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className={`transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
