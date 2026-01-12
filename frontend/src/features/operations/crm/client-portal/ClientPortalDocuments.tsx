import React from 'react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { FileText } from 'lucide-react';

export const ClientPortalDocuments: React.FC = () => {
    const { theme } = useTheme();
    return (
        <div className="p-4">
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Shared Documents</h3>
            <div className={cn("p-8 text-center border-2 border-dashed rounded-lg", theme.border.default)}>
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className={theme.text.secondary}>No documents shared yet.</p>
            </div>
        </div>
    );
};
