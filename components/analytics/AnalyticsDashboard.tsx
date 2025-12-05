
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader } from './common/PageHeader';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { BarChart3, Gavel, Users, TrendingUp, BrainCircuit, Download, Search } from 'lucide-react';
import { Button } from './common/Button';
import { DataService } from '../../services/dataService';

// Sub-components
import { JudgeAnalytics } from './analytics/JudgeAnalytics';
import { CounselAnalytics } from './analytics/CounselAnalytics';
import { CasePrediction } from './analytics/CasePrediction';

// Mock Data (Still needed for stats until backend supports full analytics)
import { MOCK_COUNSEL, MOCK_JUDGE_STATS, MOCK_OUTCOME_DATA } from '../../data/mockAnalytics';
import { JudgeProfile } from '../../types';

type AnalyticsView = 'judge' | 'counsel' | 'prediction';

const PARENT_TABS = [
  {
    id: 'intel', label: 'Litigation Intelligence', icon: BarChart3,
    subTabs: [
      { id: 'judge', label: 'Judge Analytics', icon: Gavel },
      { id: 'counsel', label: 'Opposing Counsel', icon: Users },
    ]
  },
  {
    id: 'model', label: 'Predictive Modeling', icon: BrainCircuit,
    subTabs: [
      { id: 'prediction', label: 'Outcome Forecast', icon: TrendingUp },
    ]
  }
];

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<AnalyticsView>('judge');
  const [judges, setJudges] = useState<JudgeProfile[]>([]);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');

  useEffect(() => {
      const loadJudges = async () => {
          const data = await DataService.analytics.getJudgeProfiles();
          setJudges(data);
          if (data.length > 0) setSelectedJudgeId(data[0].id);
      };
      loadJudges();
  }, []);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as AnalyticsView);
    }
  }, []);

  const renderContent = () => {
    const currentJudge = judges.find(j => j.id === selectedJudgeId) || judges[0];
    
    switch (activeTab) {
      case 'judge': return (
          <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                  <label className={cn("text-sm font-medium", theme.text.secondary)}>Select Judge:</label>
                  <select 
                    className={cn("p-2 rounded border text-sm outline-none", theme.surface, theme.border.default, theme.text.primary)}
                    value={selectedJudgeId}
                    onChange={(e) => setSelectedJudgeId(e.target.value)}
                  >
                      {judges.map(j => (
                          <option key={j.id} value={j.id}>{j.name} ({j.court})</option>
                      ))}
                  </select>
              </div>
              {currentJudge && <JudgeAnalytics judge={currentJudge} stats={MOCK_JUDGE_STATS} />}
          </div>
      );
      case 'counsel': return <CounselAnalytics counsel={MOCK_COUNSEL[0]} />;
      case 'prediction': return <CasePrediction outcomeData={MOCK_OUTCOME_DATA} />;
      default: return null;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Analytics & Prediction" 
          subtitle="Data-driven insights for litigation strategy and outcome modeling."
          actions={
            <Button variant="outline" size="sm" icon={Download}>Export Report</Button>
          }
        />

        {/* Desktop Parent Navigation */}
        <div className={cn("hidden md:flex space-x-6 border-b mb-4", theme.border.default)}>
            {PARENT_TABS.map(parent => (
                <button
                    key={parent.id}
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex items-center pb-3 px-1 text-sm font-medium transition-all border-b-2",
                        activeParentTab.id === parent.id 
                            ? cn("border-current", theme.primary.text)
                            : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                    )}
                >
                    <parent.icon className={cn("h-4 w-4 mr-2", activeParentTab.id === parent.id ? theme.primary.text : theme.text.tertiary)}/>
                    {parent.label}
                </button>
            ))}
        </div>

        {/* Sub-Navigation (Pills) */}
        {activeParentTab.subTabs.length > 1 && (
            <div className={cn("flex space-x-2 overflow-x-auto no-scrollbar py-3 px-4 md:px-6 rounded-lg border mb-4", theme.surfaceHighlight, theme.border.default)}>
                {activeParentTab.subTabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as AnalyticsView)} 
                        className={cn(
                            "flex-shrink-0 px-3 py-1.5 rounded-full font-medium text-xs md:text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2 border",
                            activeTab === tab.id 
                                ? cn(theme.surface, theme.primary.text, "shadow-sm border-transparent ring-1", theme.primary.border) 
                                : cn("bg-transparent", theme.text.secondary, "border-transparent", `hover:${theme.surface}`)
                        )}
                    >
                        <tab.icon className={cn("h-3.5 w-3.5", activeTab === tab.id ? theme.primary.text : theme.text.tertiary)}/>
                        {tab.label}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
            {renderContent()}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className={cn("md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around items-center p-2 z-40 pb-safe safe-area-inset-bottom", theme.surface, theme.border.default)}>
          {PARENT_TABS.map(parent => {
              const isActive = activeParentTab.id === parent.id;
              return (
                  <button 
                    key={parent.id} 
                    onClick={() => handleParentTabChange(parent.id)}
                    className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-lg flex-1 transition-all",
                        isActive ? theme.primary.text : theme.text.tertiary
                    )}
                  >
                      <parent.icon className={cn("h-6 w-6 mb-1", isActive ? "fill-current opacity-20" : "")}/>
                      <span className="text-[10px] font-medium">{parent.label}</span>
                  </button>
              );
          })}
      </div>
    </div>
  );
};
