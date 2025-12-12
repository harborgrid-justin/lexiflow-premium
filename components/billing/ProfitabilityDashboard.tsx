import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Percent, Users, Briefcase } from 'lucide-react';
import { financialReportsService } from '@/services/financialReportsService';

interface ProfitabilityData {
  overall: {
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    profitMargin: number;
    roi: number;
  };
  byMatter: Array<{
    matterName: string;
    clientName: string;
    revenue: number;
    profit: number;
    profitMargin: number;
    status: 'profitable' | 'break_even' | 'unprofitable';
  }>;
  byClient: Array<{
    clientName: string;
    revenue: number;
    profit: number;
    profitMargin: number;
    matterCount: number;
  }>;
}

const ProfitabilityDashboard: React.FC = () => {
  const [data, setData] = useState<ProfitabilityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfitability();
  }, []);

  const fetchProfitability = async () => {
    try {
      const result = await financialReportsService.getProfitability();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch profitability data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div>Loading...</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'profitable':
        return <Badge className="bg-green-500">Profitable</Badge>;
      case 'break_even':
        return <Badge variant="warning">Break Even</Badge>;
      default:
        return <Badge variant="destructive">Unprofitable</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <DollarSign className="h-5 w-5 mr-1" />
              ${(data.overall.totalRevenue / 1000).toFixed(0)}k
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Costs</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <DollarSign className="h-5 w-5 mr-1" />
              ${(data.overall.totalCosts / 1000).toFixed(0)}k
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Profit</CardDescription>
            <CardTitle className="text-2xl flex items-center text-green-600">
              <TrendingUp className="h-5 w-5 mr-1" />
              ${(data.overall.totalProfit / 1000).toFixed(0)}k
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profit Margin</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <Percent className="h-5 w-5 mr-1" />
              {data.overall.profitMargin.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ROI</CardDescription>
            <CardTitle className="text-2xl flex items-center">
              <Percent className="h-5 w-5 mr-1" />
              {data.overall.roi.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Top Profitable Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.byMatter.slice(0, 10).map((matter, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{matter.matterName}</p>
                    <p className="text-xs text-muted-foreground">{matter.clientName}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-sm">${matter.profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{matter.profitMargin.toFixed(1)}% margin</p>
                  </div>
                  <div className="ml-2">
                    {getStatusBadge(matter.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Client Profitability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.byClient.slice(0, 10).map((client, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{client.clientName}</p>
                    <p className="text-xs text-muted-foreground">{client.matterCount} matters</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold text-sm">${client.profit.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      {client.profitMargin >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <p className="text-xs">{client.profitMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfitabilityDashboard;
