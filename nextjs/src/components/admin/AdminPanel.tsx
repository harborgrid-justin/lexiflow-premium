'use client';

import { Activity, Database, FileText, Link, Lock, Server, Shield, Users } from 'lucide-react';
import { useState } from 'react';

// Mock Sub-components
const AdminHierarchy = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Organization Hierarchy</h3>
    <div className="space-y-4">
      <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <Users className="text-blue-500" size={20} />
          <h4 className="font-medium text-slate-900 dark:text-white">Headquarters</h4>
        </div>
        <div className="pl-8 space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <span>Legal Department</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            <span>HR Department</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminSecurity = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-emerald-500" size={24} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Security Score</h3>
        </div>
        <p className="text-3xl font-bold text-emerald-600">98/100</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <Lock className="text-blue-500" size={24} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Active Sessions</h3>
        </div>
        <p className="text-3xl font-bold text-blue-600">42</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="text-amber-500" size={24} />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Failed Logins</h3>
        </div>
        <p className="text-3xl font-bold text-amber-600">3</p>
      </div>
    </div>
  </div>
);

const AdminDatabase = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Database Management</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <Server className="text-blue-500" size={24} />
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">Primary Database</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">PostgreSQL 15.4</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <span className="text-emerald-600 font-medium">Healthy</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Size</span>
            <span className="text-slate-900 dark:text-white font-medium">4.2 GB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Connections</span>
            <span className="text-slate-900 dark:text-white font-medium">128</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminLogs = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">System Logs</h3>
    </div>
    <div className="p-0">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
          <tr>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">Level</th>
            <th className="px-6 py-3">Message</th>
            <th className="px-6 py-3">User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">2024-01-02 10:{30 + i}:00</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  INFO
                </span>
              </td>
              <td className="px-6 py-4 text-slate-900 dark:text-white">User login successful</td>
              <td className="px-6 py-4 text-slate-500 dark:text-slate-400">admin@lexiflow.com</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminIntegrations = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Integrations</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {['Google Drive', 'Microsoft 365', 'Slack', 'Zoom', 'QuickBooks'].map((app) => (
        <div key={app} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <Link size={20} className="text-slate-500 dark:text-slate-400" />
            </div>
            <span className="font-medium text-slate-900 dark:text-white">{app}</span>
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id={`toggle-${app}`} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" />
            <label htmlFor={`toggle-${app}`} className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function AdminPanel({ initialHealth, initialUsersCount }: { initialHealth?: any; initialUsersCount?: number }) {
  const [activeTab, setActiveTab] = useState('hierarchy');

  const tabs = [
    { id: 'hierarchy', label: 'Hierarchy', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'db', label: 'Database', icon: Database },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Link },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Console</h1>
          <p className="text-slate-500 dark:text-slate-400">System settings, security audits, and data management.</p>
        </div>
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
      <div className="min-h-[400px]">
        {activeTab === 'hierarchy' && <AdminHierarchy />}
        {activeTab === 'security' && <AdminSecurity />}
        {activeTab === 'db' && <AdminDatabase />}
        {activeTab === 'logs' && <AdminLogs />}
        {activeTab === 'integrations' && <AdminIntegrations />}
      </div>
    </div>
  );
}
