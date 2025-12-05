
import React from 'react';
import { Database, Settings, Plus, Key, Link as LinkIcon, X } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { cn } from '../../../../utils/cn';

interface SchemaVisualizerProps {
    tables: any[];
    onAddColumn: (tableName: string) => void;
    onRemoveColumn: (tableName: string, colName: string) => void;
    onCreateTable: () => void;
}

export const SchemaVisualizer: React.FC<SchemaVisualizerProps> = ({ tables, onAddColumn, onRemoveColumn, onCreateTable }) => {
  const { theme } = useTheme();

  return (
    <div className="h-full overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        <div className="flex gap-8 h-full min-w-max">
            {tables.map(t => (
                <div key={t.name} className={cn("w-64 h-fit max-h-full flex flex-col rounded-lg shadow-md border overflow-hidden flex-shrink-0 animate-in zoom-in-95 duration-200", theme.surface, theme.border.default)}>
                    <div className={cn("p-3 border-b flex justify-between items-center shrink-0", theme.surfaceHighlight, theme.border.default)}>
                        <h4 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
                            <Database className="h-3 w-3 mr-2 text-blue-600"/> {t.name}
                        </h4>
                        <Settings className={cn("h-3 w-3 cursor-pointer", theme.text.tertiary, `hover:${theme.text.secondary}`)}/>
                    </div>
                    <div className={cn("divide-y overflow-y-auto", theme.border.light)}>
                        {t.columns.map((c: any, i: number) => (
                            <div key={i} className={cn("px-3 py-2 flex justify-between items-center group transition-colors", `hover:${theme.surfaceHighlight}`)}>
                                <div className="flex items-center">
                                    {c.pk && <Key className="h-3 w-3 mr-2 text-yellow-500"/>}
                                    {c.fk && <LinkIcon className="h-3 w-3 mr-2 text-blue-400"/>}
                                    <span className={cn("text-xs font-mono", c.pk ? cn("font-bold", theme.text.primary) : theme.text.secondary)}>{c.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-[9px] uppercase font-bold", theme.text.tertiary)}>{c.type}</span>
                                    <button onClick={() => onRemoveColumn(t.name, c.name)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
                                        <X className="h-3 w-3"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => onAddColumn(t.name)}
                        className={cn("w-full py-2 text-xs flex items-center justify-center transition-colors font-medium border-t shrink-0", theme.border.default, theme.primary.text, `hover:${theme.surfaceHighlight}`)}
                    >
                        <Plus className="h-3 w-3 mr-1"/> Add Column
                    </button>
                </div>
            ))}
            
            <button onClick={onCreateTable} className={cn("w-64 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer", theme.border.default, theme.text.tertiary, `hover:${theme.primary.border}`, `hover:${theme.primary.text}`, `hover:${theme.surface}`)}>
                <Plus className="h-8 w-8 mb-2"/>
                <span className="font-bold text-sm">Create New Table</span>
            </button>
        </div>
    </div>
  );
};
