import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { RefreshCw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AccessMatrix } from './security/AccessMatrix';
import { RLSPolicyManager } from './security/RLSPolicyManager';

interface SecurityMatrixProps {
    initialTab?: string;
}

/**
 * SecurityMatrix - React 18 optimized with React.memo
 */
export const SecurityMatrix = React.memo<SecurityMatrixProps>(function SecurityMatrix({ initialTab = 'matrix' }) {
    const { theme } = useTheme();
    const [activeView, setActiveView] = useState<'matrix' | 'policies'>('matrix');

    useEffect(() => {
        if (initialTab === 'policies') setActiveView('policies');
        else setActiveView('matrix');
    }, [initialTab]);

    return (
        <div className="flex flex-col h-full">
            <div className={cn("p-4 border-b flex justify-between items-center shrink-0", theme.surface.default, theme.border.default)}>
                <div className={cn("flex gap-2 p-1 rounded-lg border", theme.surface.highlight, theme.border.default)}>
                    <button
                        onClick={() => setActiveView('matrix')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded transition-all", activeView === 'matrix' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}
                    >
                        Access Matrix
                    </button>
                    <button
                        onClick={() => setActiveView('policies')}
                        className={cn("px-4 py-1.5 text-xs font-bold rounded transition-all", activeView === 'policies' ? cn(theme.surface.default, "shadow", theme.primary.text) : theme.text.secondary)}
                    >
                        RLS Policies
                    </button>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" icon={RefreshCw}>Sync</Button>
                    <Button variant="primary" size="sm" icon={Save}>Apply Config</Button>
                </div>
            </div>

            <div className={cn("flex-1 overflow-hidden p-6", theme.surface.highlight)}>
                {activeView === 'matrix' ? (
                    <AccessMatrix />
                ) : (
                    <div className="max-w-4xl mx-auto h-full">
                        <RLSPolicyManager />
                    </div>
                )}
            </div>
        </div>
    );
});

export default SecurityMatrix;
