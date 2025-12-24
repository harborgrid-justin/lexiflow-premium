
import React from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, FileCode } from 'lucide-react';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '../../../components/atoms/Button';

export const MigrationHistory: React.FC = () => {
    const { theme } = useTheme();

    const migrations = [
        { id: 'mig_004', date: 'Today, 09:30 AM', author: 'System', status: 'Applied', desc: 'Add case_value index' },
        { id: 'mig_003', date: 'Yesterday, 04:15 PM', author: 'Admin User', status: 'Applied', desc: 'Create document_versions table' },
        { id: 'mig_002', date: 'Oct 15, 2023', author: 'System', status: 'Failed', desc: 'Alter column type: users.role' },
        { id: 'mig_001', date: 'Oct 10, 2023', author: 'Admin User', status: 'Applied', desc: 'Initial Schema Load' },
    ];

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
                                {mig.status === 'Applied' ? <CheckCircle className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
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
                                    <Clock className="h-3 w-3 mr-1"/> by {mig.author}
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
};
