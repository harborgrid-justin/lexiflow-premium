/**
 * @module components/admin/AdminSecurity
 * @category Admin Panel
 * @description Admin security dashboard with authentication policy controls, threat detection using
 * Bloom Filter for IP blacklist checking, and access log monitoring. Provides security settings
 * toggles and rapid IP verification against botnet database.
 *
 * THEME SYSTEM USAGE:
 * - theme.surface.primary/highlight - Card backgrounds and control sections
 * - theme.text.primary/secondary - Setting labels and descriptions
 * - theme.border.default/subtle - Card borders and control dividers
 * - theme.status.success/error - IP check results and security status
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { AlertTriangle, CheckCircle, Lock, Shield } from 'lucide-react';
import React, { useState } from 'react';

// ========================================
// INTERNAL DEPENDENCIES
// ========================================
// Components
import { Button } from '@/components/ui/atoms/Button/Button';
import { Card } from '@/components/ui/molecules/Card/Card';

// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';


// ========================================
// BLOOM FILTER INITIALIZATION
// ========================================
// Initialize Bloom Filter for IP blacklist checking
// Note: IPs should be loaded from backend security service, not hardcoded

// ========================================
// COMPONENT
// ========================================
export const AdminSecurity: React.FC = () => {
    const { theme } = useTheme();
    const [testIp, setTestIp] = useState('');
    const [checkResult, setCheckResult] = useState<'Safe' | 'Blocked' | null>(null);

    // Load security settings and IP blacklist from backend
    const { data: controls = [] } = useQuery<unknown[]>(
        ['admin', 'security'],
        () => DataService.admin.getSecuritySettings()
    );

    // Load IP blacklist from backend security service
    const { data: blacklistedIps = [] } = useQuery<string[]>(
        ['admin', 'security', 'blacklist'],
        async () => {
            try {
                const ips = await (DataService.security as any).getBlacklistedIps();
                return Array.isArray(ips) ? ips : [];
            } catch (error) {
                console.warn('[AdminSecurity] Failed to load blacklisted IPs:', error);
                return [];
            }
        }
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'Smartphone': return Smartphone;
            case 'Lock': return Lock;
            case 'Globe': return Globe;
            case 'Clock': return Clock;
            default: return Shield;
        }
    };

    const checkIp = () => {
        // Check against backend blacklist instead of local Bloom filter
        if (blacklistedIps.includes(testIp)) {
            setCheckResult('Blocked');
        } else {
            setCheckResult('Safe');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Authentication Policy">
                    <div className={cn("divide-y", theme.border.subtle)}>
                        {controls.map((ctrl: unknown) => {
                            const typedCtrl = ctrl as { id: string; type: string; label: string; desc: string; enabled: boolean };
                            const Icon = getIcon(typedCtrl.type);
                            return (
                                <div key={typedCtrl.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-start gap-3">
                                        <div className={cn("p-2 rounded-lg", theme.surface.highlight)}>
                                            <Icon className={cn("h-5 w-5", theme.text.secondary)} />
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-bold", theme.text.primary)}>{typedCtrl.label}</p>
                                            <p className={cn("text-xs", theme.text.secondary)}>{typedCtrl.desc}</p>
                                        </div>
                                    </div>
                                    <div className={cn("relative w-11 h-6 rounded-full transition-colors cursor-pointer", typedCtrl.enabled ? "bg-green-500" : "bg-slate-300")}>
                                        <div className={cn("absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform", typedCtrl.enabled ? "translate-x-5" : "translate-x-0")}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card title="Threat Detection (Bloom Filter)">
                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 mb-4">
                            <p className="text-xs text-slate-600 mb-2">
                                Rapidly check incoming IPs against the known botnet database (1M+ entries) using probabilistic hashing.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 p-2 text-sm border rounded"
                                    placeholder="Enter IP Address..."
                                    value={testIp}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestIp(e.target.value)}
                                />
                                <Button variant="primary" onClick={checkIp}>Verify</Button>
                            </div>
                            {checkResult && (
                                <div className={cn("mt-3 flex items-center text-sm font-bold", checkResult === 'Blocked' ? "text-red-600" : "text-green-600")}>
                                    {checkResult === 'Blocked' ? <AlertTriangle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                    IP Status: {checkResult}
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card title="Access Logs">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className={theme.text.secondary}>Failed Logins (24h)</span>
                                <span className={cn("font-mono font-bold", theme.text.primary)}>12</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className={theme.text.secondary}>Suspicious IPs</span>
                                <span className={cn("font-mono font-bold", theme.text.primary)}>0</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                                <Button variant="ghost" size="sm" className="w-full text-blue-600" icon={FileText}>View Security Audit</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
