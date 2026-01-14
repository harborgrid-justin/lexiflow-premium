import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { Activity } from 'lucide-react';

export function ClientPortalActivity() {
    const { theme } = useTheme();
    return (
        <div className="p-4">
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Activity Log</h3>
            <div className={cn("p-8 text-center border-2 border-dashed rounded-lg", theme.border.default)}>
                <Activity className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className={theme.text.secondary}>No recent activity.</p>
            </div>
        </div>
    );
};
