/**
 * CaseListReporters.tsx
 *
 * Court reporter management view for deposition scheduling
 * and transcript coordination.
 *
 * @module components/case-list/CaseListReporters
 * @category Case Management - Reporter Views
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Mic2, Plus } from 'lucide-react';
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Button } from '@/components/atoms/Button';

// Hooks & Context
import { useTheme } from '@/theme';
import { useQuery } from '@/hooks/useQueryHooks';

// Services & Utils
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
import React from "react";
// ✅ Migrated to backend API (2025-12-21)

// Types
interface Reporter {
    id: string;
    name: string;
    type: string;
    status: string;
}

export const CaseListReporters: React.FC = () => {
    const { theme } = useTheme();

    const { data: reporters = [] } = useQuery<Reporter[]>(
        ['reporters', 'all'],
        async () => {
            // Safe cast as we define the interface here for usage
            return (await DataService.discovery.getReporters()) as Reporter[];
        }
    );

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h3 className={cn("text-lg font-bold", theme.text.primary)}>Court Reporter Directory</h3>
                <Button variant="primary" icon={Plus}>Add Agency</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reporters.map((r) => (
                    <div key={r.id} className={cn("p-4 rounded-lg border shadow-sm flex items-center gap-3", theme.surface.default, theme.border.default)}>
                        <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                            <Mic2 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className={cn("font-bold text-sm", theme.text.primary)}>{r.name}</p>
                            <p className={cn("text-xs", theme.text.secondary)}>{r.type} • {r.status}</p>
                        </div>
                    </div>
                ))}

                <div className={cn("rounded-lg border-2 border-dashed p-4 flex flex-col items-center justify-center text-center text-slate-400", theme.border.default)}>
                    <p className="text-sm">Manage preferred reporting agencies and individual reporters.</p>
                </div>
            </div>
        </div>
    );
};
