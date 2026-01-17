import { Play, Save } from 'lucide-react';

import { Button } from '@/components/organisms/_legacy/Button';

import { useDataPlatform } from '../hooks/useDataPlatform';

export function QueryWorkbenchTab() {
  const { queries } = useDataPlatform();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold mb-2">Refine Query</h3>
        <textarea
          className="w-full h-32 p-3 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md"
          placeholder="SELECT * FROM cases WHERE status = 'active'..."
        />
        <div className="flex gap-2 mt-2 justify-end">
          <Button variant="secondary" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save Query
          </Button>
          <Button variant="primary" size="sm">
            <Play className="w-4 h-4 mr-2" />
            Run Query
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Saved Queries</h3>
        <div className="space-y-2">
          {queries.map(q => (
            <div key={q.id} className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="font-medium text-sm">{q.name}</span>
              <span className="text-xs text-slate-500">Last run: {new Date(q.lastExecuted).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
