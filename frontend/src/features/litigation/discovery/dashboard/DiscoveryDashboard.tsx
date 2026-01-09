import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Card } from '@/components/ui/molecules/Card/Card';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, ArrowRight, CheckCircle, Database, FileText, Scale } from 'lucide-react';
import React from 'react';
// ✅ Migrated to backend API (2025-12-21)
import { DiscoveryView } from '@/hooks/useDiscoveryPlatform';
import { DiscoveryRequest, LegalHold, PrivilegeLogEntry } from '@/types';
import DiscoveryCharts from './DiscoveryCharts';
import DiscoveryMetrics from './DiscoveryMetrics';

interface DiscoveryDashboardProps {
    onNavigate: (view: DiscoveryView, id?: string) => void;
    caseId?: string;
}

const DiscoveryDashboard: React.FC<DiscoveryDashboardProps> = ({ onNavigate, caseId }) => {
    const { theme } = useTheme();

    // Parallel Queries for Dashboard Stats
    const { data: requests = [] } = useQuery<DiscoveryRequest[]>(
        caseId ? ['requests', 'case', caseId] : ['requests', 'all'],
        () => DataService.discovery.getRequests(caseId)
    );
    const { data: holds = [] } = useQuery<LegalHold[]>(
        caseId ? ['legal-holds', 'case', caseId] : ['legal-holds', 'all'],
        () => DataService.discovery.getLegalHolds(caseId)
    );
    const { data: privilegeLog = [] } = useQuery<PrivilegeLogEntry[]>(
        caseId ? ['privilege-log', 'case', caseId] : ['privilege-log', 'all'],
        () => DataService.discovery.getPrivilegeLog(caseId)
    );

    const stats = {
        pendingRequests: requests.filter(r => r.status === 'Served').length,
        legalHolds: holds.filter((h: LegalHold) => h.status === 'Pending').length,
        privilegedItems: privilegeLog.length
    };

    const overdueCount = requests.filter(r => r.status === 'Overdue').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <DiscoveryMetrics stats={stats} onNavigate={onNavigate} />

            {/* FRCP Compliance Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="FRCP Compliance Tracker">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded border bg-green-50 border-green-200">
                            <div className="flex items-center gap-3">
                                <Scale className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-bold text-green-800">Rule 26(f) Conference</p>
                                    <p className="text-xs text-green-700">Plan Adopted</p>
                                </div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onNavigate('requests')}>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>Rule 26(a)(1) Disclosures</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>Initial Exchange Due</p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>

                        {overdueCount > 0 && (
                            <div className="flex items-center justify-between p-3 rounded border bg-red-50 border-red-200 cursor-pointer" onClick={() => onNavigate('requests')}>
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-sm font-bold text-red-800">Rule 37 Enforcement</p>
                                        <p className="text-xs text-red-700">{overdueCount} Responses Overdue</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="danger" className="text-xs h-7">Compel</Button>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="md:col-span-2">
                    <DiscoveryCharts />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Review Progress">
                    <div className="space-y-4">
                        <div>
                            <div className={cn("flex justify-between text-sm mb-1", theme.text.primary)}>
                                <span>Responsive Documents Review</span>
                                <span className="font-bold">78%</span>
                            </div>
                            <div className={cn("w-full rounded-full h-2", theme.surface.highlight)}>
                                <div className="bg-blue-600 h-2 rounded-full w-[78%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className={cn("flex justify-between text-sm mb-1", theme.text.primary)}>
                                <span>Privilege Redactions</span>
                                <span className="font-bold">45%</span>
                            </div>
                            <div className={cn("w-full rounded-full h-2", theme.surface.highlight)}>
                                <div className="bg-amber-500 h-2 rounded-full w-[45%]"></div>
                            </div>
                        </div>
                        <div className={cn("pt-4 border-t flex justify-between items-center", theme.border.default)}>
                            <span className={cn("text-xs", theme.text.secondary)}>Next Production Volume Due: March 31</span>
                            <Button size="sm" variant="outline" icon={ArrowRight} onClick={() => onNavigate('productions')}>Create Production Set</Button>
                        </div>
                    </div>
                </Card>

                <Card title="Active Integrations">
                    <div className="space-y-4">
                        <div className={cn("flex items-center justify-between p-3 border rounded-lg", theme.surface.highlight, theme.border.default)}>
                            <div className="flex items-center gap-3">
                                <Database className={cn("h-5 w-5", theme.text.secondary)} />
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>Relativity Server</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>Sync: 15 mins ago</p>
                                </div>
                            </div>
                            <Badge variant="success">Connected</Badge>
                        </div>
                        <div className={cn("flex items-center justify-between p-3 border rounded-lg", theme.surface.highlight, theme.border.default)}>
                            <div className="flex items-center gap-3">
                                <FileText className={cn("h-5 w-5", theme.text.secondary)} />
                                <div>
                                    <p className={cn("text-sm font-bold", theme.text.primary)}>Office 365 Purview</p>
                                    <p className={cn("text-xs", theme.text.secondary)}>Collection Active</p>
                                </div>
                            </div>
                            <Badge variant="warning">Ingesting</Badge>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DiscoveryDashboard;
