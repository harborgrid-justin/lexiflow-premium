import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { financialReportsApi } from './utils/api';
import type { FinancialSummary } from './types';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface FinancialReportsProps {
  organizationId: string;
  startDate: string;
  endDate: string;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  organizationId,
  startDate,
  endDate,
}) => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [cashFlow, setCashFlow] = useState<any[]>([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [organizationId, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, cashFlowData, breakdownData] = await Promise.all([
        financialReportsApi.getSummary({ organizationId, startDate, endDate }),
        financialReportsApi.getCashFlow({ organizationId, startDate, endDate }),
        financialReportsApi.getRevenueBreakdown({ organizationId, startDate, endDate }),
      ]);
      setSummary(summaryData);
      setCashFlow(cashFlowData);
      setRevenueBreakdown(breakdownData);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !summary) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>

      {/* Revenue & Profitability Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.revenue.total.toLocaleString()}
          </p>
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Billed</span>
              <span>${summary.revenue.billed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Collected</span>
              <span className="text-green-600">
                ${summary.revenue.collected.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Outstanding</span>
              <span className="text-orange-600">
                ${summary.revenue.outstanding.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Gross Profit</p>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.profitability.grossProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Margin: {summary.profitability.grossMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Net Profit</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.profitability.netProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Margin: {summary.profitability.netMargin.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Expenses</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${summary.expenses.total.toLocaleString()}
          </p>
          <div className="mt-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Personnel</span>
              <span>${summary.expenses.personnel.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overhead</span>
              <span>${summary.expenses.overhead.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={cashFlow}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" />
            <Area type="monotone" dataKey="outflow" stackId="2" stroke="#ef4444" fill="#ef4444" />
            <Line type="monotone" dataKey="cumulative" stroke="#3b82f6" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* WIP & AR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Work in Progress</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total WIP</span>
              <span className="text-xl font-bold">
                ${summary.workInProgress.total.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">0-30 days</span>
                <span>${summary.workInProgress.aged30.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(summary.workInProgress.aged30 / summary.workInProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">31-60 days</span>
                <span>${summary.workInProgress.aged60.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${(summary.workInProgress.aged60 / summary.workInProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">60+ days</span>
                <span className="text-red-600">
                  ${summary.workInProgress.aged90.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${(summary.workInProgress.aged90 / summary.workInProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Receivable</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total AR</span>
              <span className="text-xl font-bold">
                ${summary.accountsReceivable.total.toLocaleString()}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current</span>
                <span>${summary.accountsReceivable.current.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(summary.accountsReceivable.current / summary.accountsReceivable.total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">30-60 days</span>
                <span>${summary.accountsReceivable.aged30.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${(summary.accountsReceivable.aged30 / summary.accountsReceivable.total) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">90+ days</span>
                <span className="text-red-600">
                  ${summary.accountsReceivable.aged90plus.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${(summary.accountsReceivable.aged90plus / summary.accountsReceivable.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      {revenueBreakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue by Practice Group
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueBreakdown.byPracticeGroup}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueBreakdown.byMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
