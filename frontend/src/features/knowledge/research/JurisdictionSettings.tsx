import { Card } from '@/shared/ui/molecules/Card/Card';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { CheckCircle, Globe } from 'lucide-react';
import React from 'react';

export const JurisdictionSettings: React.FC = () => {
    const { theme } = useTheme();

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <Card title="Search Scope Configuration">
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <Globe className={cn("h-5 w-5 mt-1", theme.text.tertiary)} />
                        <div className="flex-1">
                            <label htmlFor="primary-jurisdiction" className={cn("block text-sm font-bold mb-1", theme.text.primary)}>Primary Jurisdiction</label>
                            <select id="primary-jurisdiction" className={cn("w-full p-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}>
                                <option>Federal (All Circuits)</option>
                                <option>California (State & Federal)</option>
                                <option>New York (State & Federal)</option>
                                <option>Delaware (Chancery Focus)</option>
                            </select>
                            <p className={cn("text-xs mt-1", theme.text.secondary)}>Default scope for all new research sessions.</p>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                        <label className={cn("block text-sm font-bold", theme.text.primary)}>Included Sources</label>

                        {['Case Law (Published)', 'Case Law (Unpublished)', 'Statutes & Codes', 'Regulations (CFR)', 'Secondary Sources'].map(opt => (
                            <label key={opt} className="flex items-center cursor-pointer">
                                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 mr-3" defaultChecked />
                                <span className={cn("text-sm", theme.text.secondary)}>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </Card>

            <div className={cn("p-4 rounded-lg border flex items-center justify-between", theme.surface.highlight, theme.border.default)}>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className={cn("text-sm font-medium", theme.text.primary)}>Shepard's / KeyCite Integration Active</span>
                </div>
                <button className={cn("text-xs underline", theme.primary.text)}>Manage API Key</button>
            </div>
        </div>
    );
};
