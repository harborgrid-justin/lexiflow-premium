import { Migration } from '@/api/admin/schema-api';
import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { CheckCircle, Clock, FileCode, Loader2, RotateCcw, XCircle } from 'lucide-react';
import React from 'react';

/**
 * MigrationHistory - React 18 optimized with React.memo
 */
export const MigrationHistory = React.memo(function MigrationHistory() {
    const { theme } = useTheme();

    const { data: migrations = [], isLoading } = useQuery<Migration[]>(
        ['admin', 'migrations'],
        () => (DataService.admin as any).schema.getMigrations()
    );

    if (isLoading) {
        return (
            <div className="p-6 h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="space-y-6">
                {migrations.map((mig, idx) => (
                    <div key={mig.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                                theme.surface.default,
                                mig.status === 'Applied' ? "border-green-500 text-green-500" : "border-red-500 text-red-500"
                            )}>
                                {mig.status === 'Applied' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </div>
                            {idx !== migrations.length - 1 && <div className={cn("w-0.5 flex-1 -mb-4", theme.surface.highlight)}></div>}
                        </div>
                        <div className={cn("flex-1 p-4 rounded-lg border shadow-sm mb-4", theme.surface.default, theme.border.default)}>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={cn("font-bold text-sm", theme.text.primary)}>{mig.id}</h4>
                                <span className={cn("text-xs font-mono", theme.text.tertiary)}>{mig.date}</span>
                            </div>
                            <p className={cn("text-sm mb-3", theme.text.secondary)}>{mig.desc}</p>
                            <div className={cn("flex items-center justify-between pt-3 border-t", theme.border.default)}>
                                <span className={cn("text-xs flex items-center", theme.text.secondary)}>
                                    <Clock className="h-3 w-3 mr-1" /> by {mig.author}
                                </span>
                                <div className="flex gap-2">
                                    <Button size="xs" variant="ghost" icon={FileCode}>SQL</Button>
                                    <Button size="xs" variant="outline" icon={RotateCcw}>Rollback</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
