import React from 'react';
import { ShieldCheck, AlertTriangle, FileSearch, Scale, Edit2 } from 'lucide-react';
import { Card } from '@/shared/ui/molecules/Card';
import { Button } from '@/shared/ui/atoms/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';

interface GovernanceRule {
  id: string;
  name: string;
  status: string;
  impact: string;
}

interface GovernanceDashboardProps {
  rules: GovernanceRule[];
  isScanning: boolean;
  scanProgress: number;
  handleScan: () => void;
  setEditingRule: (rule: GovernanceRule) => void;
}

export const GovernanceDashboard: React.FC<GovernanceDashboardProps> = ({
  rules, isScanning, scanProgress, handleScan, setEditingRule
}) => {
  const { theme } = useTheme();

  return (
    <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, theme.status.success.bg, theme.status.success.border)}>
                <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", theme.status.success.text)}>Compliance Score</p>
                    <p className={cn("text-3xl font-bold mt-1", theme.status.success.text)}>98.5%</p>
                </div>
                <ShieldCheck className={cn("h-10 w-10 opacity-50", theme.status.success.text)}/>
            </div>
            <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, theme.status.warning.bg, theme.status.warning.border)}>
                <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", theme.status.warning.text)}>Risk Items</p>
                    <p className={cn("text-3xl font-bold mt-1", theme.status.warning.text)}>3</p>
                </div>
                <AlertTriangle className={cn("h-10 w-10 opacity-50", theme.status.warning.text)}/>
            </div>
            <div className={cn("border rounded-lg p-6 flex items-center justify-between", theme.border.default, theme.status.info.bg, theme.status.info.border)}>
                <div>
                    <p className={cn("text-xs font-bold uppercase tracking-wider", theme.status.info.text)}>Enforced Rules</p>
                    <p className={cn("text-3xl font-bold mt-1", theme.status.info.text)}>{rules.length}</p>
                </div>
                <FileSearch className={cn("h-10 w-10 opacity-50", theme.status.info.text)}/>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Compliance Frameworks">
                <div className="space-y-4">
                    {['GDPR', 'SOC 2 Type II', 'CCPA', 'HIPAA'].map(fw => (
                        <div key={fw} className={cn("flex items-center justify-between p-3 rounded border", theme.surface.highlight, theme.border.default)}>
                            <div className="flex items-center gap-2">
                                <Scale className={cn("h-5 w-5", theme.text.secondary)}/>
                                <span className={cn("font-bold text-sm", theme.text.primary)}>{fw}</span>
                            </div>
                            <span className={cn("text-xs font-bold px-2 py-1 rounded border", theme.status.success.text, theme.status.success.bg, theme.status.success.border)}>Compliant</span>
                        </div>
                    ))}
                </div>
            </Card>

            <Card title="Active Rules" action={<Button size="sm" variant="outline" onClick={handleScan}>{isScanning ? `Scanning ${scanProgress}%` : 'Run Scan'}</Button>}>
                <div className="space-y-2">
                    {rules.map(r => (
                        <div key={r.id} className={cn("flex justify-between items-center p-3 border rounded-lg", theme.border.default, `hover:${theme.surface.highlight}`)}>
                            <div>
                                <p className={cn("text-sm font-bold", theme.text.primary)}>{r.name}</p>
                                <p className={cn("text-xs", theme.text.secondary)}>{r.status} • {r.impact}</p>
                            </div>
                            <button onClick={() => setEditingRule(r)} className="text-blue-500 hover:text-blue-600"><Edit2 className="h-4 w-4"/></button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </>
  );
};
