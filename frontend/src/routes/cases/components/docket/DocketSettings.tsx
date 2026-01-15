/**
 * DocketSettings.tsx
 *
 * Court integration settings for CM/ECF sync with PACER and state courts.
 *
 * @module components/docket/DocketSettings
 * @category Case Management - Docket
 */

// External Dependencies
import { AlertTriangle, CheckCircle, Key } from 'lucide-react';
import { useState } from 'react';

// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button/Button';
import { Card } from '@/components/molecules/Card/Card';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/contexts/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '@/lib/cn';

export const DocketSettings: React.FC = () => {
    const { theme } = useTheme();
    const [syncEnabled, setSyncEnabled] = useState(true);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card title="Court Integrations (CM/ECF)">
                <div className="space-y-6">
                    <div className={cn("flex items-center justify-between p-4 border rounded-lg", theme.surface.highlight, theme.border.default)}>
                        <div className="flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg", theme.surface.highlight, theme.text.link)}>P</div>
                            <div>
                                <h4 className={cn("font-bold text-sm", theme.text.primary)}>PACER (Public Access to Court Electronic Records)</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>Federal district and appellate courts.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" /> Connected
                            </span>
                            <Button variant="outline" size="sm">Configure</Button>
                        </div>
                    </div>

                    <div className={cn("flex items-center justify-between p-4 border rounded-lg", theme.surface.highlight, theme.border.default)}>
                        <div className="flex items-center gap-4">
                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg", theme.surface.highlight, theme.action.primary.text)}>N</div>
                            <div>
                                <h4 className={cn("font-bold text-sm", theme.text.primary)}>NYSCEF (New York State Courts)</h4>
                                <p className={cn("text-xs", theme.text.secondary)}>Electronic Filing System.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={cn("flex items-center text-xs font-medium px-2 py-1 rounded border", theme.status.warning.text, theme.surface.highlight, theme.status.warning.border)}>
                                <AlertTriangle className="h-3 w-3 mr-1" /> Auth Expired
                            </span>
                            <Button variant="outline" size="sm">Reconnect</Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card title="Sync Preferences">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={cn("font-medium text-sm", theme.text.primary)}>Auto-Sync Frequency</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Check for new filings automatically.</p>
                        </div>
                        <select className={cn("text-sm border rounded px-3 py-1.5 outline-none", theme.surface.default, theme.border.default, theme.text.primary)}>
                            <option>Every 15 minutes</option>
                            <option>Every hour</option>
                            <option>Daily</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                            <p className={cn("font-medium text-sm", theme.text.primary)}>Download Free Looks</p>
                            <p className={cn("text-xs", theme.text.secondary)}>Auto-download documents when "One Free Look" is available.</p>
                        </div>
                        <button
                            onClick={() => setSyncEnabled(!syncEnabled)}
                            className={cn("w-11 h-6 rounded-full transition-colors relative", syncEnabled ? theme.action.primary.bg : "bg-slate-300")}
                        >
                            <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform", syncEnabled ? "translate-x-5" : "translate-x-0")}></div>
                        </button>
                    </div>
                </div>
            </Card>

            <div className={cn("p-4 rounded-lg border flex items-center justify-between", theme.status.warning.bg, theme.status.warning.border)}>
                <div className="flex items-center gap-3">
                    <Key className={cn("h-5 w-5", theme.status.warning.text)} />
                    <div>
                        <p className={cn("font-bold text-sm", theme.status.warning.text)}>Credential Management</p>
                        <p className={cn("text-xs", theme.status.warning.text)}>Credentials are encrypted using AES-256. Do not share firm logins.</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="bg-white/50 border-amber-300 text-amber-900 hover:bg-white/80">Manage Keys</Button>
            </div>
        </div>
    );
};
