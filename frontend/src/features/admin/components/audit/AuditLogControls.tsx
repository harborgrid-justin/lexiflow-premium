import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/features/theme';
import { IntegrityReport } from '@/services/infrastructure/chainService';
import { cn } from '@/shared/lib/cn';
import { Download, GitCommit, LayoutList, Loader2, RefreshCw, Shield, ShieldCheck, Skull } from 'lucide-react';
interface AuditLogControlsProps {
    viewMode: 'table' | 'visual';
    setViewMode: (mode: 'table' | 'visual') => void;
    handleReset: () => void;
    handleSimulateTamper: () => void;
    handleVerifyChain: () => void;
    handleExport: () => void;
    isVerifying: boolean;
    verifyResult: IntegrityReport | null;
}

export const AuditLogControls: React.FC<AuditLogControlsProps> = ({
    viewMode, setViewMode, handleReset, handleSimulateTamper, handleVerifyChain, handleExport, isVerifying, verifyResult
}) => {
    const { theme } = useTheme();

    return (
        <div className={cn("p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 shrink-0", theme.surface.highlight, theme.border.default)}>
            <div>
                <h3 className={cn("font-bold flex items-center gap-2", theme.text.primary)}>
                    <Shield className="h-5 w-5 text-blue-600" /> Immutable Audit Ledger
                </h3>
                <p className={cn("text-xs mt-1", theme.text.secondary)}>Cryptographically chained events.</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end items-center">
                <div className={cn("flex p-0.5 rounded-lg border mr-2", theme.surface.default, theme.border.default)}>
                    <button onClick={() => setViewMode('table')} className={cn("p-1.5 rounded", viewMode === 'table' ? cn(theme.surface.highlight, "text-blue-600") : theme.text.tertiary)}><LayoutList className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode('visual')} className={cn("p-1.5 rounded", viewMode === 'visual' ? cn(theme.surface.highlight, "text-blue-600") : theme.text.tertiary)}><GitCommit className="h-4 w-4" /></button>
                </div>
                <div className="flex gap-1 mr-2">
                    <Button size="sm" variant="ghost" onClick={handleReset} className={theme.text.secondary}><RefreshCw className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={handleSimulateTamper} className="text-red-600 border-red-200 hover:bg-red-50" icon={Skull}>Tamper</Button>
                </div>
                <div className={cn("h-6 w-px mx-1 self-center", theme.border.default)}></div>
                <Button size="sm" variant={verifyResult?.isValid ? "primary" : verifyResult?.isValid === false ? "danger" : "outline"} icon={isVerifying ? Loader2 : ShieldCheck} onClick={handleVerifyChain} isLoading={isVerifying}>
                    {isVerifying ? 'Verifying...' : verifyResult?.isValid ? 'Verified' : verifyResult?.isValid === false ? 'Broken!' : 'Verify'}
                </Button>
                <Button size="sm" variant="secondary" icon={Download} onClick={handleExport}>Export</Button>
            </div>
        </div>
    );
};
