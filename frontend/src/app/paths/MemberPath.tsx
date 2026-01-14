// src/app/paths/MemberPath.tsx
import { DeterministicLoader } from "@/components/performance/DeterministicLoader";
import { OptimisticInput } from "@/components/performance/OptimisticInput";
import { ZeroClsWrapper } from "@/components/performance/ZeroClsWrapper";
import { useAuth } from "@/contexts/auth/AuthContext";
import { usePredictivePreload } from "@/hooks/performance/usePredictivePreload";
import { useData } from "@/routes/dashboard";
import React, { useEffect, useMemo, useState } from "react";

export const MemberPath: React.FC<{ enableNewDashboard?: boolean }> = ({ enableNewDashboard = false }) => {
  const { auth, logout } = useAuth();
  const { items, refresh, isLoading, error } = useData();
  const [filter, setFilter] = useState("");

  // Principle 14: Predictive Pre-Rendering
  // Simulate preloading details when hovering over a case
  const preloadDetails = usePredictivePreload(() => {
    console.log("Preloading case details...");
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Filter items based on optimistic input
  const filteredItems = useMemo(() => {
    if (!filter) return items;
    return items.filter(i => i.label.toLowerCase().includes(filter.toLowerCase()));
  }, [items, filter]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Member Experience</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            User: {auth.status === "authenticated" ? auth.user?.email : "n/a"}
          </span>
          <button
            onClick={() => logout()}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </div>

      {enableNewDashboard ? (
        <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-900">New Dashboard Active</h2>
          <p className="text-blue-700">You are viewing the enhanced dashboard experience.</p>
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded mb-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Legacy Dashboard</h2>
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Your Cases</h3>
          <div className="flex gap-4">
            {/* Principle 10: Input Predictability */}
            <OptimisticInput
              value={filter}
              onChange={setFilter}
              placeholder="Filter cases..."
              className="border rounded px-2 py-1 text-sm w-64"
              metricName="CaseFilter"
            />
            <button onClick={refresh} className="text-blue-600 hover:text-blue-800 text-sm">
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {/* Principle 4: Deterministic Loading */}
        <DeterministicLoader
          isLoading={isLoading}
          fallback={
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <ZeroClsWrapper key={i} height="48px" className="bg-gray-100 rounded animate-pulse">
                  <div className="h-full w-full" />
                </ZeroClsWrapper>
              ))}
            </div>
          }
        >
          <ul className="divide-y divide-gray-200">
            {filteredItems.map((x) => (
              // Principle 1: Zero Layout Shift (minHeight enforced)
              <ZeroClsWrapper key={x.id} minHeight="48px" className="block">
                <li
                  className="py-3 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  {...preloadDetails} // Principle 14
                >
                  <div>
                    <span className="font-medium">{x.label}</span>
                    {x.type === 'case' && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                        {x.status}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 uppercase">{x.type}</span>
                </li>
              </ZeroClsWrapper>
            ))}
            {filteredItems.length === 0 && (
              <li className="py-4 text-center text-gray-500">No items found</li>
            )}
          </ul>
        </DeterministicLoader>
      </div>
    </div>
  );
};
