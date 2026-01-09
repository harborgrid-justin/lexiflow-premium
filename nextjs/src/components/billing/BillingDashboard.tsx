'use client';

import { Calendar, CreditCard, Download, RefreshCw } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Badge } from '@/components/ui/shadcn/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { cn } from '@/lib/utils';

const PeriodSelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
  <div className="w-[180px]">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <Calendar className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="ytd">Year to Date</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const ExportMenu = ({ onExport, isExporting }: any) => (
  <Button variant="outline" onClick={() => onExport('pdf')} disabled={isExporting} className="gap-2">
    <Download className="h-4 w-4" />
    Export
  </Button>
);

// Mock Sub-components
const BillingOverview = () => (
  <Card>
    <CardHeader>
      <CardTitle>Financial Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-100 dark:border-blue-900">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-50">$124,500</div>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-md border border-emerald-100 dark:border-emerald-900">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Collected</div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-50">$98,200</div>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-md border border-amber-100 dark:border-amber-900">
          <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">Outstanding</div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-50">$26,300</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const BillingInvoices = () => (
  <Card>
    <CardHeader>
      <CardTitle>Invoices</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div>
              <div className="font-medium">INV-2024-00{i}</div>
              <div className="text-sm text-slate-500">Acme Corp - Legal Services</div>
            </div>
            <div className="text-right">
              <div className="font-medium">$1,250.00</div>
              <Badge variant="outline" className="mt-1 border-emerald-200 bg-emerald-50 text-emerald-700">Paid</Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BillingWIP = () => (
  <Card>
    <CardHeader>
      <CardTitle>Work In Progress</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-slate-500">Track unbilled time and expenses here.</p>
    </CardContent>
  </Card>
);

const BillingLedger = () => (
  <Card>
    <CardHeader>
      <CardTitle>General Ledger</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-slate-500">View all financial transactions.</p>
    </CardContent>
  </Card>
);

const Analytics = () => (
  <Card>
    <CardHeader>
      <CardTitle>Analytics</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-slate-500">Financial charts and reports.</p>
    </CardContent>
  </Card>
);

export default function BillingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('30d');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}...`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Billing & Finance</h1>
              <p className="text-slate-500 dark:text-slate-400">Manage invoices, track time, and monitor financial health</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PeriodSelector value={period} onChange={setPeriod} />
            <Button
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <ExportMenu onExport={handleExport} isExporting={false} />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="wip">WIP</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
            <TabsTrigger value="trust">Trust</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <BillingOverview />
          </TabsContent>
          <TabsContent value="wip">
            <BillingWIP />
          </TabsContent>
          <TabsContent value="invoices">
            <BillingInvoices />
          </TabsContent>
          <TabsContent value="expenses">
            <BillingLedger />
          </TabsContent>
          <TabsContent value="ledger">
            <BillingLedger />
          </TabsContent>
          <TabsContent value="trust">
            <BillingLedger />
          </TabsContent>
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
