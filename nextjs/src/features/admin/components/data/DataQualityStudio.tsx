import { useEffect, useRef, useState } from 'react';

import { Activity, Edit2, FileSearch, GitMerge, Loader2, Plus, RefreshCw, Settings, Sparkles, Wand2 } from 'lucide-react';
import { JSX } from 'react/jsx-runtime';

import { Button } from '@/components/ui/atoms/Button';
import { Modal } from '@/components/ui/molecules/Modal';
import { Tabs } from '@/components/ui/molecules/Tabs';
import { useQuery } from '@/hooks/backend';
import { useTheme } from '@/providers';
import { DataService } from '@/services/data/dataService';
import { DataAnomaly, QualityMetricHistory } from '@/types';
import { cn } from '@/utils/cn';

import { DataProfiler } from './quality/DataProfiler';
import { DeduplicationManager } from './quality/DeduplicationManager';
import { QualityDashboard } from './quality/QualityDashboard';
import { QualityRule, RuleBuilder } from './quality/RuleBuilder';
import { StandardizationConsole } from './quality/StandardizationConsole';

// Helper function for severity styling
const getSeverityClassName = (severity: string) => {
    switch (severity.toLowerCase()) {
        case 'critical':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'high':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'low':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
};

interface DataQualityStudioProps {
    initialTab?: string;
}

export function DataQualityStudio({ initialTab = 'dashboard' }: DataQualityStudioProps): JSX.Element {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    // Timer Ref for Cleanup
    const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Builder State
    const [isRuleBuilderOpen, setIsRuleBuilderOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<QualityRule | undefined>(undefined);

    useEffect(() => {
        if (initialTab !== '') { setActiveTab(initialTab); }
    }, [initialTab]);

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (scanIntervalRef.current !== null) { clearInterval(scanIntervalRef.current); }
        };
    }, []);

    // Integrated Data Query
    const { data: fetchedAnomalies = [], isLoading } = useQuery<DataAnomaly[]>(
        ['admin', 'anomalies'],
        async () => await DataService.admin.getAnomalies() as DataAnomaly[]
    );

    const { data: history = [] } = useQuery<QualityMetricHistory[]>(
        ['quality', 'history'],
        async () => await DataService.quality.getHistory() as QualityMetricHistory[]
    );

    const [anomalies, setAnomalies] = useState<DataAnomaly[]>([]);

    useEffect(() => {
        if (fetchedAnomalies.length > 0) { setAnomalies(fetchedAnomalies); }
    }, [fetchedAnomalies]);

    const [rules, setRules] = useState<QualityRule[]>([
        {
            id: 'r1',
            name: 'Email Completeness',
            description: 'Ensure user emails follow standard format',
            severity: 'Critical',
            action: 'Block',
            enabled: true,
            conditions: [{ id: 'c1', field: 'users.email', operator: 'LIKE', value: '%_@__%.__%' }]
        },
        {
            id: 'r2',
            name: 'Case Value Range',
            description: 'Case value cannot be negative',
            severity: 'High',
            action: 'Warn',
            enabled: true,
            conditions: [{ id: 'c1', field: 'cases.value', operator: '>', value: '0' }]
        }
    ]);

    const handleScan = (): void => {
        if (scanIntervalRef.current !== null) { clearInterval(scanIntervalRef.current); }

        setIsScanning(true);
        setScanProgress(0);

        scanIntervalRef.current = setInterval(() => {
            setScanProgress(p => {
                if (p >= 100) {
                    if (scanIntervalRef.current !== null) { clearInterval(scanIntervalRef.current); }
                    setIsScanning(false);
                    return 100;
                }
                return p + 5;
            });
        }, 100);
    };

    if (isLoading) { return <div className="flex h-full items-center justify-center"><Loader2 className={cn("animate-spin", theme.primary.text)} /></div>; }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className={cn("px-6 pt-6 pb-0 border-b shrink-0", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className={cn("text-xl font-bold", theme.text.primary)}>Data Quality Studio</h3>
                        <p className={cn("text-sm", theme.text.secondary)}>Automated cleansing, standardization, and integrity monitoring.</p>
                    </div>
                    <div className="flex gap-2">
                        {isScanning && (
                            <div className={cn("flex items-center text-xs font-bold mr-4", theme.primary.text)}>
                                <RefreshCw className="h-3 w-3 animate-spin mr-2" /> Scanning: {scanProgress}%
                            </div>
                        )}
                        <Button variant="primary" icon={Sparkles} onClick={handleScan} disabled={isScanning}>Run Profiler</Button>
                    </div>
                </div>
                <Tabs
                    tabs={[
                        { id: 'dashboard', label: 'Dashboard', icon: Activity },
                        { id: 'standardization', label: 'Standardization', icon: Wand2 },
                        { id: 'dedupe', label: 'Deduplication', icon: GitMerge },
                        { id: 'profiler', label: 'Profiler', icon: FileSearch },
                        { id: 'rules', label: 'Validation Rules', icon: Settings }
                    ]}
                    activeTab={activeTab}
                    onChange={(t: string) => setActiveTab(t)}
                />
            </div>

            <div className={cn("flex-1 overflow-y-auto p-6", theme.surface.highlight)}>
                {activeTab === 'dashboard' && (
                    <QualityDashboard anomalies={anomalies} history={history} />
                )}

                {activeTab === 'standardization' && <StandardizationConsole />}

                {activeTab === 'dedupe' && <DeduplicationManager />}

                {activeTab === 'rules' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h4 className={cn("font-bold text-lg", theme.text.primary)}>Validation Logic</h4>
                            <Button size="sm" icon={Plus} onClick={() => { setEditingRule(undefined); setIsRuleBuilderOpen(true); }}>Add Rule</Button>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {rules.map(rule => (
                                <div key={rule.id} className={cn("p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between group transition-colors gap-4", theme.surface.default, theme.border.default, `hover:${theme.primary.border}`)}>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h5 className={cn("font-bold text-sm", theme.text.primary)}>{rule.name}</h5>
                                            <span className={cn("text-[10px] px-1.5 rounded uppercase font-bold", getSeverityClassName(rule.severity))}>{rule.severity}</span>
                                        </div>
                                        <div className="flex gap-2 items-center flex-wrap">
                                            <code className={cn("text-xs px-2 py-1 rounded font-mono", theme.surface.highlight, theme.text.secondary)}>
                                                {rule.conditions.length > 0 ? `${rule.conditions[0].field} ${rule.conditions[0].operator} ...` : 'No conditions'}
                                            </code>
                                            <span className={cn("text-xs", theme.text.tertiary)}>{rule.description}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <div className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", rule.enabled ? theme.status.success.text.replace('text-', 'bg-') : cn(theme.status.neutral.bg, "dark:bg-slate-700"))}>
                                            <div className={cn("w-3 h-3 rounded-full shadow-sm transition-transform", theme.surface.default, rule.enabled ? "translate-x-5" : "")} />
                                        </div>
                                        <Button size="sm" variant="ghost" icon={Edit2} onClick={() => { setEditingRule(rule); setIsRuleBuilderOpen(true); }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'profiler' && (
                    <DataProfiler />
                )}
            </div>

            {/* Rule Builder Modal */}
            <Modal isOpen={isRuleBuilderOpen} onClose={() => setIsRuleBuilderOpen(false)} title="" size="xl" className="p-0 overflow-hidden h-[80vh] flex flex-col">
                <div className="flex-1 flex flex-col min-h-0">
                    <RuleBuilder
                        initialRule={editingRule}
                        onSave={(r) => {
                            if (editingRule !== undefined) {
                                setRules(prev => prev.map(rl => rl.id === r.id ? r : rl));
                            } else {
                                setRules(prev => [...prev, r]);
                            }
                            setIsRuleBuilderOpen(false);
                        }}
                        onCancel={() => setIsRuleBuilderOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
}

export default DataQualityStudio;
