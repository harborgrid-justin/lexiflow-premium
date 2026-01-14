import { Button } from '@/shared/ui/atoms/Button/Button';
import { useTheme } from '@/theme';
import { yieldToMain } from '@/utils/apiUtils';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PIIPanelProps {
    content: string;
    onApplyRedactions: (redactedContent: string) => void;
}

interface PIIEntity {
    id: string;
    type: 'SSN' | 'Email' | 'Phone' | 'CreditCard';
    value: string;
    index: number;
    ignored: boolean;
}

export function PIIPanel({ content, onApplyRedactions }: PIIPanelProps) {
    const { theme } = useTheme();
    const [entities, setEntities] = useState<PIIEntity[]>([]);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        const scan = async () => {
            setIsScanning(true);
            const findings: PIIEntity[] = [];

            // Real-time findings based on content patterns
            const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+.[a-zA-Z0-9_-]+/g;
            const phoneRegex = /\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/g;
            const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
            const ccRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;

            let match;
            let count = 0;

            // Process Emails
            while ((match = emailRegex.exec(content)) !== null) {
                if (isCancelled) return;
                findings.push({ id: `pii-e-${match.index}`, type: 'Email', value: match[0], index: match.index, ignored: false });
                count++;
                if (count % 10 === 0) await yieldToMain();
            }

            // Process Phones
            while ((match = phoneRegex.exec(content)) !== null) {
                if (isCancelled) return;
                findings.push({ id: `pii-p-${match.index}`, type: 'Phone', value: match[0], index: match.index, ignored: false });
                count++;
                if (count % 10 === 0) await yieldToMain();
            }

            // Process SSNs
            while ((match = ssnRegex.exec(content)) !== null) {
                if (isCancelled) return;
                findings.push({ id: `pii-s-${match.index}`, type: 'SSN', value: match[0], index: match.index, ignored: false });
                count++;
                if (count % 10 === 0) await yieldToMain();
            }

            // Process Credit Cards
            while ((match = ccRegex.exec(content)) !== null) {
                if (isCancelled) return;
                findings.push({ id: `pii-c-${match.index}`, type: 'CreditCard', value: match[0], index: match.index, ignored: false });
                count++;
                if (count % 10 === 0) await yieldToMain();
            }

            if (!isCancelled) {
                setEntities(findings);
                setIsScanning(false);
            }
        };

        // Small delay to allow initial render
        const timer = setTimeout(scan, 500);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [content]);

    const handleToggleIgnore = (id: string) => {
        setEntities(prev => prev.map(e => e.id === id ? { ...e, ignored: !e.ignored } : e));
    };

    const handleRedactAll = () => {
        let redactedContent = content;
        // Sort entities by index descending to avoid shifting indices during replacement
        const toRedact = entities.filter(e => !e.ignored).sort((a, b) => b.index - a.index);

        for (const entity of toRedact) {
            const replacement = '█'.repeat(entity.value.length);
            // Use substring to replace at specific index
            redactedContent = redactedContent.substring(0, entity.index) + replacement + redactedContent.substring(entity.index + entity.value.length);
        }

        onApplyRedactions(redactedContent);
    };

    return (
        <div className={cn("w-80 border-l flex flex-col", theme.surface.highlight, theme.border.default)}>
            <div className={cn("p-4 border-b flex justify-between items-center", theme.surface.default, theme.border.default)}>
                <h3 className={cn("font-bold text-sm flex items-center", theme.text.primary)}>
                    <ShieldAlert className="h-4 w-4 mr-2 text-amber-600" /> PII Detection
                </h3>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {entities.filter(e => !e.ignored).length} Found
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isScanning ? (
                    <div className={cn("text-center py-8", theme.text.tertiary)}>
                        Scanning document...
                    </div>
                ) : (
                    entities.map(entity => (
                        <div key={entity.id} className={cn("p-3 rounded border transition-opacity", theme.surface.default, theme.border.default, entity.ignored ? "opacity-50" : "shadow-sm")}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 rounded border",
                                    entity.type === 'SSN' ? "bg-red-50 text-red-700 border-red-100" :
                                        entity.type === 'CreditCard' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                            "bg-blue-50 text-blue-700 border-blue-100"
                                )}>
                                    {entity.type}
                                </span>
                                <button onClick={() => handleToggleIgnore(entity.id)} className={cn("hover:text-slate-600", theme.text.tertiary)}>
                                    {entity.ignored ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <p className={cn("font-mono text-sm", entity.ignored ? "line-through text-slate-400" : theme.text.primary)}>
                                {entity.value}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className={cn("p-4 border-t space-y-3", theme.surface.default, theme.border.default)}>
                <div className={cn("flex items-start gap-2 text-xs", theme.text.secondary)}>
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    <p>Redaction is permanent. A new version of the document will be created.</p>
                </div>
                <Button variant="primary" className="w-full bg-slate-900 hover:bg-slate-800" onClick={handleRedactAll} disabled={isScanning}>
                    Redact Selected
                </Button>
            </div>
        </div>
    );
};
