'use client';

import { Database, Key, Lock, ShieldCheck } from 'lucide-react';

export default function DafDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
            <ShieldCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              DAF Operations
            </h1>
            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">
              Data Access Framework - Security & Compliance Management
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Data Sources</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Access Policies</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">47</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Keys</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">23</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
        <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
        <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
          DAF Operations Dashboard
        </h3>
        <p className="text-sm max-w-md mx-auto text-slate-500 dark:text-slate-400">
          Manage data access policies, security protocols, and compliance frameworks.
          This module is currently in development.
        </p>
      </div>
    </div>
  );
}
