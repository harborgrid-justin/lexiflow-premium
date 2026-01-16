/**
 * CaseRiskManager.tsx
 *
 * Risk assessment and management dashboard with risk matrix visualization,
 * impact/probability tracking, and mitigation planning.
 *
 * @module components/case-detail/CaseRiskManager
 * @category Case Management - Risk Assessment
 */

// External Dependencies
import React from 'react';
import { AlertTriangle, Loader2, Plus, ShieldAlert, TrendingUp } from 'lucide-react';
// Internal Dependencies - Components
import { Button } from '@/components/atoms/Button';
import { MetricCard } from '@/components/molecules/MetricCard/MetricCard';
import { RiskDetail } from './risk/RiskDetail';
import { RiskList } from './risk/RiskList';

// Internal Dependencies - Hooks & Context
import { useWindow } from '@/providers';
import { useTheme } from "@/hooks/useTheme";

// Internal Dependencies - Services & Utils
import { useCaseRisks } from '@/routes/cases/hooks/useCaseRisks';
import { cn } from '@/lib/cn';

// Types & Interfaces
import { Case, Risk, RiskImpact, RiskProbability, RiskStatusEnum } from '@/types';

interface CaseRiskManagerProps {
    caseData: Case;
}

export const CaseRiskManager: React.FC<CaseRiskManagerProps> = ({ caseData }) => {
    const { theme } = useTheme();
    const { openWindow, closeWindow } = useWindow();

    // Enterprise Data Access
    const { risks, isLoading, addRisk, updateRisk, deleteRisk } = useCaseRisks(caseData.id, {
        onUpdateSuccess: (data: Risk) => closeWindow(`risk-detail-${data.id}`),
        onDeleteSuccess: (_, id) => closeWindow(`risk-detail-${id}`)
    });

    const handleAddRisk = () => {
        const newRisk: Risk = {
            id: `risk-${Date.now()}`,
            caseId: caseData.id,
            title: 'New Risk',
            description: '',
            category: 'Legal',
            probability: RiskProbability.MEDIUM,
            impact: RiskImpact.MEDIUM,
            status: RiskStatusEnum.IDENTIFIED,
            dateIdentified: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        addRisk(newRisk);
        handleOpenDetail(newRisk);
    };

    const handleOpenDetail = (risk: Risk) => {
        const winId = `risk-detail-${risk.id}`;
        openWindow(
            winId,
            `Risk: ${risk.title}`,
            <RiskDetail
                risk={risk}
                onUpdate={updateRisk}
                onDelete={deleteRisk}
                onClose={() => closeWindow(winId)}
            />
        );
    };

    const highRisks = risks.filter(r => r.probability === 'High' || r.impact === 'High').length;

    // Calculate estimated financial exposure based on risk impact
    const IMPACT_VALUES: Record<string, number> = {
        'Low': 10000,
        'Medium': 50000,
        'High': 150000,
        'Critical': 500000,
    };

    const exposure = risks.reduce((sum, r) => sum + (IMPACT_VALUES[r.impact] || 0), 0);

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className={cn("animate-spin", theme.text.link)} /></div>;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Header Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <MetricCard
                    label="Total Risks Identified"
                    value={risks.length}
                    icon={ShieldAlert}
                    className="border-l-4 border-l-blue-500"
                />
                <MetricCard
                    label="Critical Exposure"
                    value={highRisks}
                    icon={AlertTriangle}
                    trend="Requires Action"
                    trendUp={false}
                    className="border-l-4 border-l-red-500"
                />
                <MetricCard
                    label="Est. Financial Impact"
                    value={`$${(exposure / 1000).toFixed(0)}k`}
                    icon={TrendingUp}
                    className="border-l-4 border-l-amber-500"
                />
            </div>

            <div className={cn("flex-1 flex flex-col rounded-lg border shadow-sm overflow-hidden min-h-0", theme.surface.default, theme.border.default)}>
                <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surface.highlight)}>
                    <h3 className={cn("font-bold text-sm uppercase tracking-wide", theme.text.secondary)}>Risk Register</h3>
                    <Button size="sm" variant="ghost" icon={Plus} onClick={handleAddRisk}>Add</Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <RiskList risks={risks} onSelect={handleOpenDetail} />
                </div>
            </div>
        </div>
    );
};
