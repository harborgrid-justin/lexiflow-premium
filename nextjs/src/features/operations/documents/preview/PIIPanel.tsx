import { Button } from '@/components/ui/atoms/Button/Button';
import { useTheme } from '@/providers';
import { PIIDetectionService, type PIIEntity as PIIEntityType } from '@/services/ai/piiDetectionService';
import { RedactionService } from '@/services/documents/redactionService';
import { cn } from '@/utils/cn';
import { AlertTriangle, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PIIPanelProps {
    content: string;
    documentId?: string;
    onApplyRedactions: (redactedContent: string) => void;
}

interface PIIEntity extends PIIEntityType {
    confidence: number;
}

export function PIIPanel({ content, documentId, onApplyRedactions }: PIIPanelProps) {
    const { theme } = useTheme();
    const [entities, setEntities] = useState<PIIEntity[]>([]);
    const [isScanning, setIsScanning] = useState(true);
    const [scanDuration, setScanDuration] = useState<number>(0);

    useEffect(() => {
        let isCancelled = false;

        const scan = async () => {
            if (!content || content.length === 0) {
                setIsScanning(false);
                return;
            }

            setIsScanning(true);

            try {
                const result = await PIIDetectionService.scanDocument(content);

                if (!isCancelled) {
                    setEntities(result.entities as PIIEntity[]);
                    setScanDuration(result.duration);
                    setIsScanning(false);
                }
            } catch (error) {
                console.error('PII scan failed:', error);
                if (!isCancelled) {
                    setEntities([]);
                    setIsScanning(false);
                }
            }
        };

        const timer = setTimeout(scan, 300);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [content]);

    const handleToggleIgnore = (id: string) => {
        setEntities(prev => prev.map(e => e.id === id ? { ...e, ignored: !e.ignored } : e));
    };

    const handleRedactAll = async () => {
        const activeEntities = entities.filter(e => !e.ignored);
        if (activeEntities.length === 0) return;

        const redactedContent = RedactionService.applyRedactions(content, activeEntities, {
            preserveLength: true,
            preserveFormat: true,
        });

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
                        <div className="animate-pulse">Scanning document...</div>
                        <div className="text-xs mt-2">Analyzing {Math.round(content.length / 1024)}KB</div>
                    </div>
                ) : entities.length === 0 ? (
                    <div className={cn("text-center py-8", theme.text.tertiary)}>
                        <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No PII detected</p>
                        <p className="text-xs mt-1">Scan completed in {scanDuration.toFixed(0)}ms</p>
                    </div>
                ) : (
                    <>
                        <div className={cn("text-xs pb-2", theme.text.tertiary)}>
                            Scan time: {scanDuration.toFixed(0)}ms
                        </div>
                        {entities.map(entity => (
                            <div key={entity.id} className={cn("p-3 rounded border transition-opacity", theme.surface.default, theme.border.default, entity.ignored ? "opacity-50" : "shadow-sm")}>
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 rounded border",
                                            entity.type === 'SSN' ? "bg-red-50 text-red-700 border-red-100" :
                                                entity.type === 'CreditCard' ? "bg-purple-50 text-purple-700 border-purple-100" :
                                                    entity.type === 'Phone' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                        entity.type === 'Email' ? "bg-green-50 text-green-700 border-green-100" :
                                                            "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            {entity.type}
                                        </span>
                                        <span className={cn("text-[10px]", theme.text.tertiary)}>
                                            {Math.round(entity.confidence * 100)}%
                                        </span>
                                    </div>
                                    <button onClick={() => handleToggleIgnore(entity.id)} className={cn("hover:text-slate-600", theme.text.tertiary)}>
                                        {entity.ignored ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className={cn("font-mono text-sm mb-1", entity.ignored ? "line-through text-slate-400" : theme.text.primary)}>
                                    {entity.value}
                                </p>
                                {entity.context && (
                                    <p className={cn("text-xs truncate", theme.text.tertiary)}>
                                        {entity.context}
                                    </p>
                                )}
                            </div>
                        ))}
                    </>
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
