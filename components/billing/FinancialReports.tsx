import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, TrendingUp, DollarSign, Users, Briefcase } from 'lucide-react';
import { financialReportsService } from '@/services/financialReportsService';
import ARAgingChart from './ARAgingChart';
import ProfitabilityDashboard from './ProfitabilityDashboard';

const FinancialReports: React.FC = () => {
  const [reportType, setReportType] = useState<string>('ar-aging');
  const [period, setPeriod] = useState<string>('month');
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      const report = await financialReportsService.generateReport(reportType, period);
      // Create PDF download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_${period}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar-aging">AR Aging Report</SelectItem>
                <SelectItem value="wip">Work in Progress</SelectItem>
                <SelectItem value="realization">Realization Report</SelectItem>
                <SelectItem value="profitability">Profitability Analysis</SelectItem>
              </SelectContent>
            </Select>

            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={generateReport} disabled={generating}>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ar-aging" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ar-aging">AR Aging</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
        </TabsList>

        <TabsContent value="ar-aging" className="space-y-4">
          <ARAgingChart />
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <ProfitabilityDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports;
