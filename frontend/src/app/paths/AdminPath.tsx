// src/app/paths/AdminPath.tsx
import { DeterministicLoader } from "@/components/performance/DeterministicLoader";
import { OptimisticInput } from "@/components/performance/OptimisticInput";
import { ZeroClsWrapper } from "@/components/performance/ZeroClsWrapper";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useEntitlements } from "@/providers/application/entitlementsprovider";
import { useData } from "@/routes/dashboard";
import { cn } from "@/lib/cn";
import React, { useEffect, useMemo, useState } from "react";

export const AdminPath: React.FC = () => {
  const { auth, logout } = useAuth();
  const { theme } = useTheme();
  const { entitlements } = useEntitlements();
  const { items, refresh, isLoading, error } = useData();
  const [filter, setFilter] = useState("");

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    return items.filter(i =>
      i.label.toLowerCase().includes(filter.toLowerCase()) ||
      i.id.includes(filter)
    );
  }, [items, filter]);

  return (
    <div className={cn('p-8 min-h-screen', theme.surface.hover)}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={cn('text-2xl font-bold', theme.text.primary)}>Admin Console</h1>
          <div className={cn('flex gap-4 mt-2 text-sm', theme.text.secondary)}>
            <span>Role: <span className={cn('font-mono px-1 rounded', theme.surface.card)}>{auth.user?.role}</span></span>
            <span>Plan: <span className={cn('font-mono px-1 rounded uppercase', theme.surface.card)}>{entitlements.plan}</span></span>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className={cn('border px-4 py-2 rounded', theme.surface.card, theme.border.default, `hover:${theme.surface.hover}`, theme.text.primary)}
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ZeroClsWrapper minHeight="120px" className="bg-white p-6 rounded shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">System Status</h3>
          <div className="text-2xl font-bold text-emerald-600">Operational</div>
        </ZeroClsWrapper>
        <ZeroClsWrapper minHeight="120px" className="bg-white p-6 rounded shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Storage Usage</h3>
          <div className="text-2xl font-bold text-slate-900">
            45% <span className="text-sm font-normal text-slate-500">of {entitlements.storageLimitGB}GB</span>
          </div>
        </ZeroClsWrapper>
        <ZeroClsWrapper minHeight="120px" className="bg-white p-6 rounded shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Active Cases</h3>
          <div className="text-2xl font-bold text-slate-900">
            {items.filter(i => i.type === 'case').length} <span className="text-sm font-normal text-slate-500">/ {entitlements.maxCases}</span>
          </div>
        </ZeroClsWrapper>
      </div>

      <div className="bg-white rounded shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">System Audit Logs</h2>
          <div className="flex gap-4">
            <OptimisticInput
              value={filter}
              onChange={setFilter}
              placeholder="Search logs..."
              className="border rounded px-2 py-1 text-sm w-64"
              metricName="AdminLogFilter"
            />
            <button onClick={refresh} className="text-blue-600 hover:text-blue-800 text-sm">
              Refresh Data
            </button>
          </div>
        </div>

        {error && <div className="p-8 text-center text-red-500">{error}</div>}

        <DeterministicLoader
          isLoading={isLoading}
          fallback={
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          }
        >
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.type === 'audit' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                      }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{item.label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{item.id}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-slate-500">No audit logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </DeterministicLoader>
      </div>
    </div>
  );
};
