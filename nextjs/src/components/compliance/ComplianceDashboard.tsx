'use client';

import { AlertTriangle, Download, FileText, Lock, Shield } from 'lucide-react';
import { useState } from 'react';

// Mock Data
const MOCK_CONFLICTS = [
  { id: '1', caseName: 'Smith v. Jones', status: 'Cleared', date: '2024-01-15' },
  { id: '2', caseName: 'Tech Corp Merger', status: 'Pending', date: '2024-01-16' },
];

const MOCK_WALLS = [
  { id: '1', name: 'Project X', restrictedUsers: 5, status: 'Active' },
  { id: '2', name: 'Merger Y', restrictedUsers: 3, status: 'Active' },
];

// Mock Sub-components
const ComplianceOverview = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Pending Conflicts</h3>
        <p className="text-3xl font-bold text-amber-600">3</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Active Walls</h3>
        <p className="text-3xl font-bold text-emerald-600">12</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Policy Updates</h3>
        <p className="text-3xl font-bold text-blue-600">1</p>
      </div>
    </div>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Conflict Check Completed</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Case #2024-{100 + i}</p>
              </div>
            </div>
            <span className="text-xs text-slate-400">2h ago</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ComplianceConflicts = ({ conflicts }: { conflicts: { id: string; caseName: string; status: string; date: string }[] }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Conflict Checks</h3>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
        New Check
      </button>
    </div>
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
        <tr>
          <th className="px-6 py-3">Case Name</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Date</th>
          <th className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
        {conflicts.map((conflict) => (
          <tr key={conflict.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{conflict.caseName}</td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conflict.status === 'Cleared'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                {conflict.status}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{conflict.date}</td>
            <td className="px-6 py-4">
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ComplianceWalls = ({ walls }: { walls: { id: string; name: string; restrictedUsers: number; status: string }[] }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">Ethical Walls</h3>
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
        Create Wall
      </button>
    </div>
    <div className="p-6 grid gap-4">
      {walls.map((wall) => (
        <div key={wall.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{wall.name}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">{wall.restrictedUsers} restricted users</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            {wall.status}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const CompliancePolicies = () => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Firm Policies</h3>
    <div className="space-y-4">
      {['Data Retention Policy', 'Anti-Money Laundering', 'Client Confidentiality'].map((policy, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="text-slate-400" size={20} />
            <span className="font-medium text-slate-900 dark:text-white">{policy}</span>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Download PDF</button>
        </div>
      ))}
    </div>
  </div>
);

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'conflicts', label: 'Conflicts', icon: AlertTriangle },
    { id: 'walls', label: 'Ethical Walls', icon: Lock },
    { id: 'policies', label: 'Policies', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Risk & Compliance Center</h1>
          <p className="text-slate-500 dark:text-slate-400">Conflicts, Ethical Walls, and Regulatory Monitoring.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Download size={16} />
          Audit Report
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
        {activeTab === 'overview' && <ComplianceOverview />}
        {activeTab === 'conflicts' && <ComplianceConflicts conflicts={MOCK_CONFLICTS} />}
        {activeTab === 'walls' && <ComplianceWalls walls={MOCK_WALLS} />}
        {activeTab === 'policies' && <CompliancePolicies />}
      </div>
    </div>
  );
}
