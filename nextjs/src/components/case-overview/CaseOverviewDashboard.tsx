'use client';

import {
  Activity,
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  Plus,
  Search,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

// Mock Data
const MOCK_KPIS = {
  activeMatters: 142,
  activeMattersChange: 12,
  pendingIntake: 28,
  pendingIntakeChange: 5,
  upcomingDeadlines: 15,
  upcomingDeadlinesChange: -2,
  revenueYTD: 1250000,
  revenueChange: 8
};

const MOCK_PIPELINE = [
  { stage: 'Initial Contact', count: 12, value: 150000 },
  { stage: 'Conflict Check', count: 8, value: 320000 },
  { stage: 'Engagement Review', count: 5, value: 85000 },
  { stage: 'Contract Pending', count: 3, value: 45000 }
];

const MOCK_ACTIVITIES = [
  { id: '1', type: 'matter_created', title: 'Smith v. Jones', description: 'New matter created', time: '2 hours ago', priority: 'medium' },
  { id: '2', type: 'deadline', title: 'TechCorp Merger', description: 'Filing deadline approaching', time: '4 hours ago', priority: 'high' },
  { id: '3', type: 'status_change', title: 'Estate of H. Doe', description: 'Status changed to Closed', time: '1 day ago', priority: 'low' },
  { id: '4', type: 'milestone', title: 'City of NY vs. Uber', description: 'Discovery phase completed', time: '2 days ago', priority: 'medium' }
];

export function CaseOverviewDashboard() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Case Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Enterprise Matter Management Command Center</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search matters..."
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>New Matter</span>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Matters"
          value={MOCK_KPIS.activeMatters}
          change={MOCK_KPIS.activeMattersChange}
          icon={Briefcase}
          color="blue"
        />
        <KpiCard
          title="Pending Intake"
          value={MOCK_KPIS.pendingIntake}
          change={MOCK_KPIS.pendingIntakeChange}
          icon={Users}
          color="purple"
        />
        <KpiCard
          title="Upcoming Deadlines"
          value={MOCK_KPIS.upcomingDeadlines}
          change={MOCK_KPIS.upcomingDeadlinesChange}
          icon={Clock}
          color="amber"
          inverse={true}
        />
        <KpiCard
          title="Revenue YTD"
          value={`$${(MOCK_KPIS.revenueYTD / 1000000).toFixed(2)}M`}
          change={MOCK_KPIS.revenueChange}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Intake Pipeline</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-3 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="space-y-4">
            {MOCK_PIPELINE.map((stage) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{stage.stage}</span>
                  <span className="text-slate-500 dark:text-slate-400">{stage.count} matters • ${(stage.value / 1000).toFixed(0)}k</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(stage.count / 20) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {MOCK_ACTIVITIES.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className={`mt-1 p-1.5 rounded-full h-fit ${activity.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    activity.priority === 'medium' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                  {activity.type === 'deadline' ? <AlertCircle className="h-4 w-4" /> :
                    activity.type === 'matter_created' ? <Plus className="h-4 w-4" /> :
                      activity.type === 'status_change' ? <Activity className="h-4 w-4" /> :
                        <CheckCircle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activity.description}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon: Icon, color, inverse = false }: any) {
  const isPositive = change > 0;
  const isGood = inverse ? !isPositive : isPositive;

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 rotate-180" />}
          {Math.abs(change)}%
        </span>
        <span className="text-slate-500 dark:text-slate-400 ml-2">vs last month</span>
      </div>
    </div>
  );
}
