import { Table } from 'lucide-react';

import { useDataPlatform } from '../hooks/useDataPlatform';

export function SchemaManagerTab() {
  const { schemas } = useDataPlatform();

  return (
    <div className="space-y-4">
      {schemas.length === 0 ? (
        <div className="text-center py-12 text-slate-600 dark:text-slate-400 border rounded-lg border-dashed">
          No schemas found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schemas.map((schema, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Table className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">{schema.name}</h3>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <div>Tables: {schema.tables}</div>
                <div>Size: {schema.size}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
