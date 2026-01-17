import { Shield } from 'lucide-react';

import { useDataPlatform } from '../hooks/useDataPlatform';

export function RLSPoliciesTab() {
  const { policies } = useDataPlatform();

  return (
    <div className="space-y-4">
      {policies.length === 0 ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400 border rounded-lg border-dashed">
          No RLS policies defined.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {policies.map(policy => (
            <div key={policy.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{policy.name}</h3>
                    <p className="text-sm text-slate-500">Table: {policy.table}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {policy.roles.map(r => (
                    <span key={r} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{r}</span>
                  ))}
                </div>
              </div>
              <pre className="mt-3 bg-slate-50 dark:bg-slate-950 p-2 rounded text-xs overflow-x-auto">
                {policy.definition}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
