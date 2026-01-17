import { CheckCircle2, ChevronDown, Lock } from 'lucide-react';

import { FileIcon } from '@/components/atoms/FileIcon/FileIcon';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { type LegalDocument } from '@/types';

interface PreviewHeaderProps {
    document: LegalDocument;
    onCloseMobile?: () => void;
    onToggleEncryption?: () => void;
}

export function PreviewHeader({ document, onCloseMobile }: PreviewHeaderProps) {
    const { theme } = useTheme();
    return (
        <div className={cn("p-5 border-b relative shrink-0", theme.border.default, theme.surface.default)}>
            <div className="md:hidden absolute top-3 right-3">
                <button onClick={onCloseMobile} className={cn("p-2 rounded-full", theme.surface.highlight, theme.text.secondary)}><ChevronDown className="h-5 w-5" /></button>
            </div>
            {document.isEncrypted && (
                <div className="absolute top-0 right-0 p-2 hidden md:block">
                    <Lock className="h-5 w-5 text-amber-500" />
                </div>
            )}
            <div className="flex items-start gap-3">
                <div className={cn("p-3 border rounded-lg shadow-sm relative", theme.surface.highlight, theme.border.default)}>
                    <FileIcon type={document.type} className="h-8 w-8" />
                    {document.isEncrypted && <div className={cn("absolute -bottom-1 -right-1 rounded-full", theme.surface.default)}><Lock className="h-3 w-3 text-amber-500" /></div>}
                </div>
                <div className="flex-1 min-w-0 pr-8 md:pr-0">
                    <h3 className={cn("font-bold text-sm line-clamp-2 leading-snug", theme.text.primary)}>{document.title}</h3>
                    <p className={cn("text-xs mt-1", theme.text.secondary)}>{document.type}</p>
                </div>
            </div>
            <div className={cn("mt-4 flex items-center justify-between p-2 border rounded text-xs", theme.status.success.bg, theme.status.success.border, theme.status.success.text)}>
                <span className="flex items-center font-medium"><CheckCircle2 className="h-3 w-3 mr-1.5" /> Data Quality</span>
                <span className="font-bold">98%</span>
            </div>
        </div>
    );
}
