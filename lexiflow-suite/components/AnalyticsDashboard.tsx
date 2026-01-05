
import React, { useState, useTransition, useCallback } from 'react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { MOCK_JUDGE, MOCK_COUNSEL, MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '../data/mockAnalytics.ts';
import { JudgeAnalytics } from './analytics/JudgeAnalytics.tsx';
import { CounselAnalytics } from './analytics/CounselAnalytics.tsx';
import { CasePrediction } from './analytics/CasePrediction.tsx';
import { Gavel, Users, TrendingUp } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('judge');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = useCallback((tab: string) => {
      startTransition(() => {
          setActiveTab(tab);
      });
  }, []);

  const tabs = [
      { id: 'judge', label: 'Judicial Analytics', icon: Gavel },
      { id: 'counsel', label: 'Opposing Counsel', icon: Users },
      { id: 'prediction', label: 'Outcome Prediction', icon: TrendingUp },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Analytics & Prediction" 
            subtitle="Data-driven insights for strategy and negotiation."
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-y-auto p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
         <div className="max-w-7xl mx-auto h-full">
            {activeTab === 'judge' && <JudgeAnalytics judge={MOCK_JUDGE} stats={MOCK_JUDGE_STATS} />}
            {activeTab === 'counsel' && <CounselAnalytics counsel={MOCK_COUNSEL} />}
            {activeTab === 'prediction' && <CasePrediction outcomeData={MOCK_OUTCOME_DATA} />}
         </div>
      </div>
    </div>
  );
};
