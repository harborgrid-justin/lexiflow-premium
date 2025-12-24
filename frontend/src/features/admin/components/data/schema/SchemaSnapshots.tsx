
import React from 'react';
import { Camera, Download, RefreshCw, Calendar, Database } from 'lucide-react';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '../../../components/atoms/Button';

export const SchemaSnapshots: React.FC = () => {
    const { theme } = useTheme();

    const snapshots = [
        { id: 'snap_v2.4', name: 'Pre-Migration Backup', date: '2024-03-01', tables: 45, size: '24KB' },
        { id: 'snap_v2.3', name: 'Q4 Stable Release', date: '2023-12-15', tables: 42, size: '22KB' },
        { id: 'snap_v2.2', name: 'Initial Enterprise', date: '2023-10-01', tables: 38, size: '18KB' },
    ];

    return (
        <div className="p-6 h-full overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className={cn("font-bold text-lg", theme.text.primary)}>Schema Version Control</h3>
                <Button variant="primary" icon={Camera}>Create Snapshot</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {snapshots.map(snap => (
                    <div key={snap.id} className={cn("p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group", theme.surface.default, theme.border.default)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn("p-2 rounded-lg bg-blue-100 text-blue-600")}>
                                <Database className="h-6 w-6"/>
                            </div>
                            <span className={cn("text-xs font-mono px-2 py-1 rounded", theme.surface.highlight, theme.text.secondary)}>{snap.size}</span>
                        </div>
                        <h4 className={cn("font-bold text-base mb-1", theme.text.primary)}>{snap.name}</h4>
                        <p className={cn("text-xs font-mono text-slate-400 mb-4")}>{snap.id}</p>
                        
                        <div className={cn("space-y-2 text-xs", theme.text.secondary)}>
                            <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-2 opacity-70"/> {snap.date}
                            </div>
                            <div className="flex items-center">
                                <Database className="h-3 w-3 mr-2 opacity-70"/> {snap.tables} Tables
                            </div>
                        </div>

                        <div className={cn("mt-4 pt-4 border-t flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity", theme.border.default)}>
                            <Button size="sm" variant="outline" className="flex-1" icon={RefreshCw}>Restore</Button>
                            <Button size="sm" variant="ghost" className="flex-1" icon={Download}>Export</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
