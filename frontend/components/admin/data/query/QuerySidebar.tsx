
import React from 'react';
import { Database, Clock, Star, Table } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface QuerySidebarProps {
  activeTab: 'schema' | 'history' | 'saved';
  setActiveTab: (tab: 'schema' | 'history' | 'saved') => void;
  schema: unknown;
}

export const QuerySidebar: React.FC<QuerySidebarProps> = ({ activeTab, setActiveTab, schema }) => {
  const { theme } = useTheme();

  return (
    <div className={cn("w-full md:w-72 border-b md:border-b-0 md:border-r p-0 flex flex-col shrink-0", theme.surface.default, theme.border.default)}>
        <div className={cn("flex border-b", theme.border.default)}>
            <button onClick={() => setActiveTab('schema')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeTab === 'schema' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}><Database className="h-4 w-4 mx-auto"/></button>
            <button onClick={() => setActiveTab('history')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeTab === 'history' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}><Clock className="h-4 w-4 mx-auto"/></button>
            <button onClick={() => setActiveTab('saved')} className={cn("flex-1 py-3 text-xs font-bold uppercase", activeTab === 'saved' ? cn("border-b-2", theme.primary.text, theme.primary.border) : cn(theme.text.tertiary, `hover:${theme.text.primary}`))}><Star className="h-4 w-4 mx-auto"/></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'schema' && Object.entries(schema).map(([table, details]: [string, any]) => (
                <details key={table} className="group mb-2">
                    <summary className={cn("flex items-center text-sm cursor-pointer p-1.5 rounded list-none transition-colors", `group-hover:${theme.surface.highlight}`, theme.text.primary)}>
                        <Table className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/> {table}
                    </summary>
                    <div className="pl-6 pt-1 space-y-1">
                        {details.columns.map((col: unknown) => (
                            <div key={col.name} className={cn("text-xs flex items-center", theme.text.secondary)}>
                            <div className={cn("w-2 h-2 rounded-full mr-2", theme.border.default, theme.surface.highlight)}></div>
                            <span className="font-mono">{col.name}</span>
                            <span className={cn("ml-2 font-sans", theme.text.tertiary)}>({col.type})</span>
                            </div>
                        ))}
                    </div>
                </details>
            ))}
        </div>
    </div>
  );
};
