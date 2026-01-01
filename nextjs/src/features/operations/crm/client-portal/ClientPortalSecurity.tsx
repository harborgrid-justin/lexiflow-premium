import React from 'react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Shield } from 'lucide-react';

export const ClientPortalSecurity: React.FC = () => {
    const { theme } = useTheme();
    return (
        <div className="p-4">
            <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Security Settings</h3>
             <div className={cn("p-8 text-center border-2 border-dashed rounded-lg", theme.border.default)}>
                <Shield className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className={theme.text.secondary}>Security settings unavailable.</p>
            </div>
        </div>
    );
};
