import React from 'react';
import { Archive, Download, Clock, RefreshCw, HardDrive } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';

export const BackupVault: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className={cn("p-6 rounded-xl border flex justify-between items-center", theme.surfaceHighlight, theme.border.default)}>
            <div>
                <h3 className={cn("text-lg font-bold", theme.text.primary)}>Automated Snapshots</h3>
                <p className={cn("text-sm", theme.text.secondary)}>Point-in-time recovery for entire cluster. Retention: 30 Days.</p>
            </div>
            <Button variant="primary" icon={RefreshCw}>Trigger Snapshot</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
                <h4 className={cn("text-sm font-bold uppercase border-b pb-2", theme.text.secondary, theme.border.default)}>Recovery Points</h4>
                {[
                    { id: 'snap-001', date: 'Today, 02:00 AM', size: '4.2 GB', type: 'Incremental' },
                    { id: 'snap-002', date: 'Yesterday, 02:00 AM', size: '4.1 GB', type: 'Incremental' },
                    { id: 'snap-full', date: 'Sunday, 02:00 AM', size: '145 GB', type: 'Full' },
                ].map(snap => (
                    <div key={snap.id} className={cn("flex items-center justify-between p-4 border rounded-lg shadow-sm transition-colors cursor-pointer", theme.surface, theme.border.default, `hover:${theme.primary.border}`)}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg"><Archive className="h-5 w-5"/></div>
                            <div>
                                <p className={cn("font-bold text-sm", theme.text.primary)}>{snap.id}</p>
                                <p className={cn("text-xs flex items-center gap-2", theme.text.secondary)}>
                                    <Clock className="h-3 w-3"/> {snap.date} • {snap.type}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={cn("font-mono text-sm", theme.text.secondary)}>{snap.size}</span>
                            <Button size="sm" variant="outline" icon={Download}>Restore</Button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="space-y-4">
                 <h4 className={cn("text-sm font-bold uppercase border-b pb-2", theme.text.secondary, theme.border.default)}>Cold Storage</h4>
                 <div className={cn("p-4 border rounded-lg", theme.surfaceHighlight, theme.border.default)}>
                     <div className="flex items-center gap-3 mb-3">
                         <HardDrive className={cn("h-6 w-6", theme.text.tertiary)}/>
                         <div>
                             <p className={cn("font-bold text-sm", theme.text.primary)}>Glacier Archive</p>
                             <p className={cn("text-xs", theme.text.secondary)}>Long-term retention</p>
                         </div>
                     </div>
                     <div className={cn("space-y-2 text-xs", theme.text.secondary)}>
                         <div className="flex justify-between"><span>Total Size</span><span className={cn("font-mono", theme.text.primary)}>12 TB</span></div>
                         <div className="flex justify-between"><span>Cost/Mo</span><span className={cn("font-mono", theme.text.primary)}>$45.00</span></div>
                     </div>
                 </div>
            </div>
        </div>
    </div>
  );
};
