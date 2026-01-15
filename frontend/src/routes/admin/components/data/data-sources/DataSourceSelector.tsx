import { useTheme } from '@/contexts/ThemeContext';
import { useDataSource } from '@/providers';
import { cn } from '@/lib/cn';
import { Cloud, Database, Power, RefreshCw, Server } from 'lucide-react';
import { useState } from 'react';

export function DataSourceSelector() {
  const { theme } = useTheme();
  const { currentSource, switchDataSource } = useDataSource();
  const [isSwitching, setIsSwitching] = useState(false);

  const sources = [
    {
      id: 'indexeddb' as const,
      name: 'IndexedDB',
      desc: 'Client-side offline storage',
      icon: Database,
      color: 'blue'
    },
    {
      id: 'postgresql' as const,
      name: 'PostgreSQL',
      desc: 'Backend database (requires server)',
      icon: Server,
      color: 'purple'
    },
    {
      id: 'cloud' as const,
      name: 'Cloud Database',
      desc: 'External cloud provider',
      icon: Cloud,
      color: 'emerald'
    },
  ];

  const handleSwitch = async (sourceId: typeof currentSource) => {
    if (sourceId === currentSource) return;

    const sourceName = sources.find(s => s.id === sourceId)?.name;
    if (confirm(`Switch to ${sourceName}? This will reload the application and clear all cached data.`)) {
      setIsSwitching(true);
      await switchDataSource(sourceId);
    }
  };

  return (
    <div className={cn("p-6 rounded-xl border shadow-sm", theme.surface.default, theme.border.default)}>
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", theme.text.primary)}>
        <Power className="h-5 w-5 text-emerald-500" /> Active Data Source
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map((source) => {
          const isActive = currentSource === source.id;
          const Icon = source.icon;

          return (
            <button
              key={source.id}
              onClick={() => handleSwitch(source.id)}
              disabled={isActive || isSwitching}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-left",
                isActive
                  ? `border-${source.color}-500 bg-${source.color}-50 dark:bg-${source.color}-900/20`
                  : `border-gray-200 dark:border-gray-700 hover:border-${source.color}-300 dark:hover:border-${source.color}-700`,
                isActive || isSwitching ? "cursor-default" : "cursor-pointer hover:shadow-md"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <Icon className={cn("h-5 w-5", isActive ? `text-${source.color}-600` : "text-gray-400")} />
                {isActive && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    ACTIVE
                  </div>
                )}
              </div>
              <h4 className={cn("font-bold text-sm mb-1", theme.text.primary)}>{source.name}</h4>
              <p className={cn("text-xs", theme.text.secondary)}>{source.desc}</p>
            </button>
          );
        })}
      </div>
      {isSwitching && (
        <div className={cn(
          "mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
          "text-sm flex items-center gap-2",
          theme.text.primary
        )}>
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          Switching data source and reloading application...
        </div>
      )}
    </div>
  );
};
