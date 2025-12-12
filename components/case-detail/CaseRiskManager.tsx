
import React, { useState } from 'react';
import { Case, Risk } from '../../types';
import { ShieldAlert, Plus, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '../common/Button';
import { MetricCard } from '../common/Primitives';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { RiskList } from './risk/RiskList';
import { RiskDetail } from './risk/RiskDetail';
import { DataService } from '../../services/dataService';
import { useQuery, useMutation, queryClient } from '../../services/queryClient';
import { STORES } from '../../services/db';
import { useWindow } from '../../context/WindowContext';

interface CaseRiskManagerProps {
  caseData: Case;
}

export const CaseRiskManager: React.FC<CaseRiskManagerProps> = ({ caseData }) => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  
  // Enterprise Data Access
  const { data: risks = [], isLoading } = useQuery<Risk[]>(
      [STORES.RISKS, caseData.id],
      () => DataService.risks.getByCaseId(caseData.id)
  );

  const { mutate: addRisk } = useMutation(
      DataService.risks.add,
      { invalidateKeys: [[STORES.RISKS, caseData.id]] }
  );

  const { mutate: updateRisk } = useMutation(
      (updated: Risk) => DataService.risks.update(updated.id, updated),
      { 
          invalidateKeys: [[STORES.RISKS, caseData.id]],
          onSuccess: (data) => closeWindow(`risk-detail-${data.id}`)
      }
  );

  const { mutate: deleteRisk } = useMutation(
      DataService.risks.delete,
      { 
          invalidateKeys: [[STORES.RISKS, caseData.id]],
          onSuccess: (_, id) => closeWindow(`risk-detail-${id}`) 
      }
  );

  const handleAddRisk = () => {
    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      caseId: caseData.id,
      title: 'New Risk',
      description: '',
      category: 'Legal',
      probability: 'Medium',
      impact: 'Medium',
      status: 'Identified',
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
  const exposure = risks.length * 150000; // Mock calculation

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600"/></div>;

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
                value={`$${(exposure/1000).toFixed(0)}k`} 
                icon={TrendingUp} 
                className="border-l-4 border-l-amber-500"
            />
        </div>

        <div className={cn("flex-1 flex flex-col rounded-lg border shadow-sm overflow-hidden min-h-0", theme.surface.default, theme.border.default)}>
            <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surfaceHighlight)}>
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
