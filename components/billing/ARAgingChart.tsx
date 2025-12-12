import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { financialReportsService } from '@/services/financialReportsService';

interface ARAgingData {
  totalAR: number;
  buckets: Array<{
    range: string;
    amount: number;
    percentage: number;
    invoiceCount: number;
  }>;
  byClient: Array<{
    clientName: string;
    totalOutstanding: number;
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days120Plus: number;
  }>;
}

const ARAgingChart: React.FC = () => {
  const [data, setData] = useState<ARAgingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchARData();
  }, []);

  const fetchARData = async () => {
    try {
      const result = await financialReportsService.getARAging();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch AR data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return <div>Loading...</div>;

  const getStatusColor = (range: string) => {
    if (range.includes('0-30')) return 'bg-green-500';
    if (range.includes('31-60')) return 'bg-yellow-500';
    if (range.includes('61-90')) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total AR</CardDescription>
            <CardTitle className="text-3xl">${(data.totalAR / 1000).toFixed(0)}k</CardTitle>
          </CardHeader>
        </Card>
        {data.buckets.slice(0, 3).map((bucket) => (
          <Card key={bucket.range}>
            <CardHeader className="pb-2">
              <CardDescription>{bucket.range}</CardDescription>
              <CardTitle className="text-2xl">${(bucket.amount / 1000).toFixed(0)}k</CardTitle>
              <p className="text-sm text-muted-foreground">{bucket.percentage.toFixed(1)}%</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aging Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.buckets.map((bucket) => (
              <div key={bucket.range} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{bucket.range}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {bucket.invoiceCount} invoices
                    </span>
                    <span className="font-medium">${bucket.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getStatusColor(bucket.range)}`}
                    style={{ width: `${bucket.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Outstanding Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.byClient.slice(0, 10).map((client, index) => (
              <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{client.clientName}</p>
                  <div className="flex gap-2 flex-wrap">
                    {client.current > 0 && (
                      <Badge variant="outline" className="text-xs">
                        Current: ${(client.current / 1000).toFixed(1)}k
                      </Badge>
                    )}
                    {client.days30 > 0 && (
                      <Badge variant="warning" className="text-xs">
                        30+: ${(client.days30 / 1000).toFixed(1)}k
                      </Badge>
                    )}
                    {client.days60 > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        60+: ${(client.days60 / 1000).toFixed(1)}k
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">${client.totalOutstanding.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ARAgingChart;
