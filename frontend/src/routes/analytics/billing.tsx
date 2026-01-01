/**
 * Billing Analytics Route
 * Revenue, realization, collection rates, AR aging, and WIP reports
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import type { Route } from "./+types/billing";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import { MetricCard, ChartCard, DateRangeSelector } from '@/components/enterprise/analytics';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { subDays } from 'date-fns';
import { ArrowLeft, Download, TrendingUp } from 'lucide-react';

export function meta({}: Route.MetaArgs) {
  return createMeta({
    title: 'Billing Analytics',
    description: 'Revenue, realization, and collection metrics',
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Fetch real data from API
  return {
    metrics: {
      totalRevenue: 2847500,
      collectedRevenue: 2524000,
      outstandingAR: 1235000,
      realizationRate: 92.3,
      collectionRate: 88.7,
      wipTotal: 458000,
      avgDaysToCollect: 42,
    },
  };
}

export default function BillingAnalyticsRoute({ loaderData }: Route.ComponentProps) {
  const { metrics } = loaderData;

  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 90),
    end: new Date(),
    label: 'Last 90 Days',
  });

  const revenueTrend = [
    { month: 'Jan', revenue: 445000, collected: 398000, billed: 482000, outstanding: 195000 },
    { month: 'Feb', revenue: 468000, collected: 425000, billed: 495000, outstanding: 208000 },
    { month: 'Mar', revenue: 512000, collected: 458000, billed: 528000, outstanding: 225000 },
    { month: 'Apr', revenue: 489000, collected: 442000, billed: 508000, outstanding: 218000 },
    { month: 'May', revenue: 524000, collected: 475000, billed: 545000, outstanding: 232000 },
    { month: 'Jun', revenue: 556000, collected: 502000, billed: 572000, outstanding: 245000 },
  ];

  const revenueByPracticeArea = [
    { area: 'Corporate Law', revenue: 845000, hours: 3420, avgRate: 247 },
    { area: 'Litigation', revenue: 682000, hours: 2850, avgRate: 239 },
    { area: 'IP/Patent', revenue: 534000, hours: 1980, avgRate: 270 },
    { area: 'Real Estate', revenue: 425000, hours: 1680, avgRate: 253 },
    { area: 'Employment', revenue: 361000, hours: 1520, avgRate: 237 },
  ];

  const arAging = [
    { range: '0-30 Days', amount: 425000, count: 42, percentage: 34.4 },
    { range: '31-60 Days', amount: 368000, count: 35, percentage: 29.8 },
    { range: '61-90 Days', amount: 287000, count: 28, percentage: 23.2 },
    { range: '90+ Days', amount: 155000, count: 18, percentage: 12.6 },
  ];

  const topBillingAttorneys = [
    { name: 'Sarah Chen', revenue: 458000, hours: 1842, rate: 248, realization: 94.2 },
    { name: 'Michael Torres', revenue: 395000, hours: 1654, rate: 238, realization: 91.8 },
    { name: 'Jessica Park', revenue: 368000, hours: 1524, rate: 241, realization: 93.5 },
    { name: 'David Kim', revenue: 342000, hours: 1458, rate: 234, realization: 89.7 },
    { name: 'Emily Davis', revenue: 315000, hours: 1325, rate: 237, realization: 90.2 },
  ];

  const wipByAttorney = [
    { name: 'Sarah Chen', amount: 82000, hours: 324 },
    { name: 'Michael Torres', amount: 68000, hours: 285 },
    { name: 'Jessica Park', amount: 74000, hours: 298 },
    { name: 'David Kim', amount: 52000, hours: 218 },
    { name: 'Emily Davis', amount: 48000, hours: 195 },
  ];

  const collectionRateByClient = [
    { client: 'TechCorp Inc', billed: 485000, collected: 458000, rate: 94.4 },
    { client: 'Global Industries', billed: 425000, collected: 385000, rate: 90.6 },
    { client: 'Innovate LLC', billed: 368000, collected: 312000, rate: 84.8 },
    { client: 'Digital Ventures', billed: 295000, collected: 265000, rate: 89.8 },
    { client: 'Enterprise Solutions', billed: 242000, collected: 218000, rate: 90.1 },
  ];

  const metricsData = [
    {
      label: 'Total Revenue',
      value: metrics.totalRevenue,
      format: 'currency' as const,
      trend: { direction: 'up' as const, value: 12.5, period: 'last quarter' },
      icon: '💰',
      color: 'green' as const,
    },
    {
      label: 'Collected Revenue',
      value: metrics.collectedRevenue,
      format: 'currency' as const,
      trend: { direction: 'up' as const, value: 9.8, period: 'last quarter' },
      icon: '✅',
      color: 'blue' as const,
    },
    {
      label: 'Outstanding A/R',
      value: metrics.outstandingAR,
      format: 'currency' as const,
      trend: { direction: 'down' as const, value: -5.2, period: 'last month' },
      icon: '⏳',
      color: 'yellow' as const,
    },
    {
      label: 'Realization Rate',
      value: metrics.realizationRate,
      format: 'percentage' as const,
      trend: { direction: 'up' as const, value: 1.8, period: 'last quarter' },
      icon: '📊',
      color: 'purple' as const,
    },
    {
      label: 'Collection Rate',
      value: metrics.collectionRate,
      format: 'percentage' as const,
      trend: { direction: 'down' as const, value: -0.9, period: 'last month' },
      icon: '💳',
      color: 'blue' as const,
    },
    {
      label: 'WIP Total',
      value: metrics.wipTotal,
      format: 'currency' as const,
      trend: { direction: 'up' as const, value: 4.2, period: 'last month' },
      icon: '⚙️',
      color: 'gray' as const,
    },
    {
      label: 'Avg Days to Collect',
      value: metrics.avgDaysToCollect,
      format: 'duration' as const,
      trend: { direction: 'down' as const, value: -6.5, period: 'last quarter' },
      icon: '⏱️',
      color: 'green' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/analytics"
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Billing Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Revenue, realization, and collection performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {metricsData.map((metric, index) => (
          <MetricCard key={index} data={metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <ChartCard title="Revenue Trend" subtitle="Billed, collected, and outstanding">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="billed"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Billed"
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorCollected)"
                name="Collected"
              />
              <Line type="monotone" dataKey="outstanding" stroke="#F59E0B" name="Outstanding" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* AR Aging */}
        <ChartCard title="A/R Aging Report" subtitle="Outstanding receivables by age">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={arAging}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="amount" fill="#EF4444" name="Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue by Practice Area */}
        <ChartCard title="Revenue by Practice Area" subtitle="Performance by practice area">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByPracticeArea} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="area" type="category" stroke="#6b7280" width={120} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Billing Attorneys */}
        <ChartCard title="Top Billing Attorneys" subtitle="Revenue leaders">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBillingAttorneys}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* WIP by Attorney */}
        <ChartCard title="Work in Progress (WIP)" subtitle="Unbilled work by attorney">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wipByAttorney}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="amount" fill="#F59E0B" name="WIP Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Collection Rate by Client */}
        <ChartCard title="Collection Rate by Client" subtitle="Top clients performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={collectionRateByClient}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="client" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="rate" fill="#3B82F6" name="Collection Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Billing Analytics"
      message="We couldn't load the billing analytics data. Please try again."
      backTo="/analytics"
      backLabel="Back to Analytics"
    />
  );
}
