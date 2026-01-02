'use client';

import { BarChart2, Briefcase, Globe, MoreVertical, Search, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

// Mock Data
const MOCK_CLIENTS = [
  { id: '1', name: 'Acme Corp', industry: 'Technology', status: 'Active', balance: '$12,500', cases: 3 },
  { id: '2', name: 'Global Industries', industry: 'Manufacturing', status: 'Active', balance: '$45,200', cases: 8 },
  { id: '3', name: 'John Smith', industry: 'Individual', status: 'Prospective', balance: '$0', cases: 0 },
];

const MOCK_PIPELINE = [
  { id: '1', stage: 'Lead', count: 12, value: '$150k' },
  { id: '2', stage: 'Intake', count: 5, value: '$75k' },
  { id: '3', stage: 'Proposal', count: 3, value: '$120k' },
  { id: '4', stage: 'Retained', count: 8, value: '$350k' },
];

// Mock Sub-components
const CRMDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {MOCK_PIPELINE.map((stage) => (
        <div key={stage.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stage.stage}</h3>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stage.count}</span>
            <span className="text-sm font-medium text-emerald-600">{stage.value}</span>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">New client intake started</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tech Startups Inc. • 2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Revenue Forecast</h3>
        <div className="h-48 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 text-sm">Chart Placeholder</p>
        </div>
      </div>
    </div>
  </div>
);

const ClientDirectory = ({ clients }: { clients: typeof MOCK_CLIENTS }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search clients..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          Filter
        </button>
        <button className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
          Export
        </button>
      </div>
    </div>
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
        <tr>
          <th className="px-6 py-3">Client Name</th>
          <th className="px-6 py-3">Industry</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Active Cases</th>
          <th className="px-6 py-3">Balance</th>
          <th className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {clients.map((client) => (
          <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{client.name}</td>
            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{client.industry}</td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${client.status === 'Active'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                {client.status}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{client.cases}</td>
            <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{client.balance}</td>
            <td className="px-6 py-4">
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <MoreVertical size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ClientPortal = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 text-center">
    <Globe className="mx-auto mb-4 text-blue-500" size={48} />
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Client Portal Management</h3>
    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
      Manage access, permissions, and shared documents for client portals.
    </p>
    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
      Configure Portals
    </button>
  </div>
);

export default function ClientCRM() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'directory', label: 'Client Directory', icon: Users },
    { id: 'pipeline', label: 'Pipeline', icon: Briefcase },
    { id: 'portal', label: 'Client Portal', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Client Relationships</h1>
          <p className="text-slate-500 dark:text-slate-400">CRM, Intake Pipeline, and Secure Client Portals.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          <UserPlus size={16} />
          New Intake
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'}
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-100">
        {activeTab === 'dashboard' && <CRMDashboard />}
        {activeTab === 'directory' && <ClientDirectory clients={MOCK_CLIENTS} />}
        {activeTab === 'pipeline' && <CRMDashboard />} {/* Reusing dashboard for pipeline for now */}
        {activeTab === 'portal' && <ClientPortal />}
      </div>
    </div>
  );
}
