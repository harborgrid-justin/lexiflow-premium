'use client';

import { CreditCard, Loader2, DollarSign, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DataService } from '@/services/data/dataService';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/shadcn/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Badge } from '@/components/ui/shadcn/badge';
import { cn } from '@/lib/utils';

// Helper for real currency
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue' | string;
  date: string;
}

interface BillingMetrics {
  totalRevenue: number;
  collected: number;
  outstanding: number;
  invoices: Invoice[];
}

export const BillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [metrics, setMetrics] = useState<BillingMetrics>({
    totalRevenue: 0,
    collected: 0,
    outstanding: 0,
    invoices: []
  });

  useEffect(() => {
    async function loadBillingData() {
      setLoading(true);
      try {
        let data: BillingMetrics = { totalRevenue: 0, collected: 0, outstanding: 0, invoices: [] };

        // Use type assertion to access extended methods if they exist at runtime
        // but keep TS happy with known types
        const billingService = DataService.billing as unknown as {
          getMetrics?: (period: string) => Promise<BillingMetrics>;
          getAll?: (params: { period: string }) => Promise<Invoice[]>;
        };

        if (billingService.getMetrics) {
          data = await billingService.getMetrics(period);
        } else if (billingService.getAll) {
          const invoices = await billingService.getAll({ period });
          // Calculate totals client-side if metrics endpoint missing
          data.totalRevenue = invoices.reduce((acc: number, inv: Invoice) => acc + (inv.total || 0), 0);
          data.collected = invoices.filter((inv: Invoice) => inv.status === 'Paid').reduce((acc: number, inv: Invoice) => acc + (inv.total || 0), 0);
          data.outstanding = data.totalRevenue - data.collected;
          data.invoices = invoices.slice(0, 5);
        }

        setMetrics({
          totalRevenue: data.totalRevenue || 0,
          collected: data.collected || 0,
          outstanding: data.outstanding || 0,
          invoices: data.invoices || []
        });
      } catch (error) {
        console.error("Failed to load billing metrics", error);
      } finally {
        setLoading(false);
      }
    }
    loadBillingData();
  }, [period]);

  if (loading) return <div className="h-full flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Finance</h2>
          <p className="text-muted-foreground">Manage invoices, track revenue, and analyze financial health.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">in selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.collected)}</div>
            <p className="text-xs text-muted-foreground">processed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(metrics.outstanding)}</div>
            <p className="text-xs text-muted-foreground">pending collection</p>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest billing activity for this period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.invoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No invoices found for this period.</p>
            ) : (
              metrics.invoices.map((inv: Invoice) => (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium">{inv.number || 'INV-####'}</p>
                    <p className="text-sm text-muted-foreground">{inv.clientName || 'Unknown Client'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">{formatCurrency(inv.total || 0)}</p>
                    <Badge variant={inv.status === 'Paid' ? 'secondary' : 'destructive'}
                      className={cn(inv.status === 'Paid' && "bg-emerald-100 text-emerald-700")}>
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
