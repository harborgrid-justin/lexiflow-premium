import { useTheme } from '@/contexts/ThemeContext';
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/molecules/Modal';
import { ModalFooter } from '@/components/molecules/ModalFooter';
import { Tabs } from '@/components/molecules/Tabs';
import { GovernancePolicy } from '@/types';
import type { GovernanceRule as ImportedGovernanceRule } from '@/types/data-infrastructure';
import { FileText, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AccessGovernance } from './governance/AccessGovernance';
import { GovernanceDashboard } from './governance/GovernanceDashboard';

// Local type to match both the API response and component expectations
interface GovernanceRule {
    id: string;
    name: string;
    status: string;
    impact: string;
    passing?: string;
    desc?: string;
}

interface GovernanceConsoleProps {
    initialTab?: string;
}

export function GovernanceConsole({ initialTab = 'overview' }: GovernanceConsoleProps) {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [editingRule, setEditingRule] = useState<GovernanceRule | null>(null);

    const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Data Fetching
    const { data: fetchedRules = [] } = useQuery<ImportedGovernanceRule[]>(
        ['admin', 'governance_rules'],
        DataService.admin.getGovernanceRules
    );

    // Map imported rules to local type
    const rules: GovernanceRule[] = fetchedRules.map(rule => ({
        id: String(rule.id),
        name: rule.name,
        status: rule.status,
        impact: rule.impact,
        passing: rule.passing,
        desc: rule.desc
    }));

    const { data: policies = [] } = useQuery<GovernancePolicy[]>(
        ['admin', 'governance_policies'],
        DataService.admin.getGovernancePolicies
    );

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    useEffect(() => {
        return () => {
            if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        }
    }, []);

    const handleScan = () => {
        if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
        setIsScanning(true);
        setScanProgress(0);
        scanIntervalRef.current = setInterval(() => {
            setScanProgress(p => {
                if (p >= 100) {
                    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
                    setIsScanning(false);
                    return 100;
                }
                return p + 10;
            });
        }, 200);
    };

    return (
        <div className="flex flex-col h-full">
            <div className={cn("px-6 pt-6 border-b", theme.border.default)}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className={cn("text-xl font-bold", theme.text.primary)}>Governance & Compliance</h3>
                        <p className={cn("text-sm", theme.text.secondary)}>Policy enforcement and risk mitigation.</p>
                    </div>
                </div>
                <Tabs
                    tabs={['overview', 'policies', 'access']}
                    activeTab={activeTab}
                    onChange={(t) => setActiveTab(t as string)}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'overview' && (
                    <GovernanceDashboard
                        rules={rules}
                        isScanning={isScanning}
                        scanProgress={scanProgress}
                        handleScan={handleScan}
                        setEditingRule={setEditingRule}
                    />
                )}

                {activeTab === 'policies' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className={cn("text-lg font-bold", theme.text.primary)}>Internal Policies</h3>
                            <Button icon={Plus}>Draft Policy</Button>
                        </div>
                        <div className="space-y-3">
                            {policies.map(pol => (
                                <div key={pol.id} className={cn("flex items-center justify-between p-4 border rounded-lg shadow-sm transition-all hover:shadow-md", theme.surface.default, theme.border.default)}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 rounded-lg", theme.surface.highlight, theme.text.secondary)}><FileText className="h-6 w-6" /></div>
                                        <div>
                                            <h4 className={cn("font-bold text-sm", theme.text.primary)}>{pol.title}</h4>
                                            <p className={cn("text-xs", theme.text.secondary)}>Version {pol.version} • Updated {pol.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn("text-xs font-bold px-2 py-1 rounded border", pol.status === 'Active' ? cn(theme.status.success.bg, theme.status.success.text, theme.status.success.border) : cn(theme.status.warning.bg, theme.status.warning.text, theme.status.warning.border))}>{pol.status}</span>
                                        <Button size="sm" variant="ghost">View</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'access' && (
                    <AccessGovernance />
                )}
            </div>

            {/* Rule Modal */}
            {editingRule && (
                <Modal isOpen={true} onClose={() => setEditingRule(null)} title="Edit Rule">
                    <div className="p-6 space-y-4">
                        <Input label="Rule Name" value={editingRule.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({ ...editingRule, name: e.target.value })} />
                        <ModalFooter>
                            <Button variant="secondary" onClick={() => setEditingRule(null)}>Cancel</Button>
                            <Button variant="primary" onClick={() => setEditingRule(null)}>Save</Button>
                        </ModalFooter>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default GovernanceConsole;
