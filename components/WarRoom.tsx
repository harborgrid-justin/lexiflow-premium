
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Target, Monitor, Layers, FileText, Gavel, Users, Mic2, Shield, CheckCircle, Briefcase, Swords, ChevronDown } from 'lucide-react';
import { Button } from './common/Button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { DataService } from '../services/dataService';
import { Case } from '../types';

// Sub-components
import { CommandCenter } from './war-room/CommandCenter';
import { EvidenceWall } from './war-room/EvidenceWall';
import { WitnessPrep } from './war-room/WitnessPrep';
import { TrialBinder } from './war-room/TrialBinder';
import { AdvisoryBoard } from './war-room/AdvisoryBoard';
import { OppositionManager } from './war-room/OppositionManager';
import { WarRoomSidebar } from './war-room/WarRoomSidebar';
import { LazyLoader } from './common/LazyLoader';
import { useQuery } from '../services/queryClient';
import { STORES } from '../services/db';

type WarRoomView = 'command' | 'evidence' | 'witnesses' | 'binder' | 'advisory' | 'opposition';

interface WarRoomProps {
    initialTab?: WarRoomView;
    caseId?: string; // Optional direct case injection
}

const PARENT_TABS = [
  {
    id: 'strategy', label: 'Strategy', icon: Target,
    subTabs: [
      { id: 'command', label: 'Command Center', icon: Monitor },
      { id: 'advisory', label: 'Advisory Board', icon: Briefcase },
      { id: 'opposition', label: 'Opposition Intel', icon: Swords },
    ]
  },
  {
    id: 'presentation', label: 'Presentation', icon: Layers,
    subTabs: [
      { id: 'evidence', label: 'Evidence Wall', icon: FileText },
      { id: 'binder', label: 'Trial Notebook', icon: Gavel },
    ]
  },
  {
    id: 'witnesses', label: 'Witnesses', icon: Users,
    subTabs: [
      { id: 'witnesses', label: 'Witness Prep', icon: Mic2 },
    ]
  }
];

export const WarRoom: React.FC<WarRoomProps> = ({ initialTab, caseId }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<WarRoomView>('command');
  const [defcon, setDefcon] = useState<'normal' | 'elevated' | 'critical'>('elevated');
  
  // Default to the detailed case provided in context, or first available if not found
  const [currentCaseId, setCurrentCaseId] = useState(caseId || '25-1229');

  // Fetch all cases for selector if not in scoped mode
  const { data: allCases = [] } = useQuery<Case[]>(
      [STORES.CASES, 'all'],
      DataService.cases.getAll,
      { enabled: !caseId }
  );

  // Sync prop change
  useEffect(() => {
    if (caseId) setCurrentCaseId(caseId);
  }, [caseId]);

  // Ensure currentCaseId is valid if initial load happens without prop
  useEffect(() => {
      if (!caseId && allCases.length > 0 && !allCases.find(c => c.id === currentCaseId)) {
          setCurrentCaseId(allCases[0].id);
      }
  }, [allCases, currentCaseId, caseId]);

  // Enterprise Data Access for specific case
  const { data: trialData, isLoading } = useQuery(
      [STORES.CASES, currentCaseId, 'warRoom'],
      () => DataService.warRoom.getData(currentCaseId),
      { enabled: !!currentCaseId }
  );

  // Shared state for inter-component linking
  const [selectedWitnessId, setSelectedWitnessId] = useState<string | null>(null);

  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const activeParentTab = useMemo(() => 
    PARENT_TABS.find(p => p.subTabs.some(s => s.id === activeTab)) || PARENT_TABS[0],
  [activeTab]);

  const handleParentTabChange = useCallback((parentId: string) => {
    const parent = PARENT_TABS.find(p => p.id === parentId);
    if (parent && parent.subTabs.length > 0) {
      setActiveTab(parent.subTabs[0].id as WarRoomView);
    }
  }, []);

  const handleNavigate = (tab: WarRoomView, context?: any) => {
      setActiveTab(tab);
      if (tab === 'witnesses' && context?.witnessId) {
          setSelectedWitnessId(context.witnessId);
      }
  };

  if (isLoading) return <LazyLoader message="Initializing War Room..." />;

  if (!trialData) {
      return (
          <div className={cn("h-full flex flex-col items-center justify-center p-6", theme.background)}>
               <div className="text-center">
                   <Target className={cn("h-12 w-12 mx-auto mb-4 opacity-20", theme.text.tertiary)} />
                   <h3 className={cn("text-lg font-bold mb-2", theme.text.primary)}>Select a Matter</h3>
                   <p className={cn("text-sm mb-4", theme.text.secondary)}>Choose a case to enter the War Room.</p>
                   <select 
                        value={currentCaseId} 
                        onChange={(e) => setCurrentCaseId(e.target.value)}
                        className={cn("p-2 border rounded-md outline-none", theme.surface, theme.border.default, theme.text.primary)}
                    >
                        {allCases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
               </div>
          </div>
      );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'command': return <CommandCenter caseId={currentCaseId} warRoomData={trialData} onNavigate={handleNavigate} />;
      case 'evidence': return <EvidenceWall caseId={currentCaseId} warRoomData={trialData} />; 
      case 'witnesses': return <WitnessPrep caseId={currentCaseId} warRoomData={trialData} initialWitnessId={selectedWitnessId} onClearSelection={() => setSelectedWitnessId(null)} />;
      case 'binder': return <TrialBinder caseId={currentCaseId} warRoomData={trialData} />;
      case 'advisory': return <AdvisoryBoard caseId={currentCaseId} />;
      case 'opposition': return <OppositionManager caseId={currentCaseId} />;
      default: return <CommandCenter caseId={currentCaseId} warRoomData={trialData} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                    <h2 className={cn("text-2xl font-bold tracking-tight leading-tight", theme.text.primary)}>Trial War Room</h2>
                    {defcon === 'critical' && <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">DEFCON 1</span>}
                    {defcon === 'elevated' && <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">ACTIVE APPEAL</span>}
                    {defcon === 'normal' && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">READY</span>}
                </div>
                
                {/* Case Selector (Hidden if caseId prop provided) */}
                {!caseId && (
                    <div className="mt-2 flex items-center gap-3">
                        <div className="relative group">
                            <select 
                                value={currentCaseId} 
                                onChange={(e) => setCurrentCaseId(e.target.value)}
                                className={cn(
                                    "appearance-none bg-transparent font-semibold text-sm pr-6 py-1 outline-none cursor-pointer border-b border-dashed transition-colors hover:border-solid max-w-[300px] md:max-w-[500px] truncate",
                                    theme.text.secondary,
                                    theme.border.default,
                                    `hover:${theme.text.primary}`,
                                    `hover:${theme.border.default}`
                                )}
                            >
                                {allCases.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                            <ChevronDown className={cn("absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none", theme.text.tertiary)}/>
                        </div>
                        <span className={cn("text-sm font-mono px-1.5 py-0.5 rounded bg-slate-100 border", theme.text.tertiary)}>{currentCaseId}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <Button variant="outline" size="sm" icon={Shield} className={defcon === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : ''} onClick={() => setDefcon(defcon === 'critical' ? 'normal' : 'critical')}>Escalate</Button>
                <Button variant="primary" size="sm" icon={CheckCircle}>Readiness Check</Button>
            </div>
        </div>

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
                        onClick={() => setActiveTab(tab.id as WarRoomView)} 
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

      <div className={cn("flex-1 flex overflow-hidden border-t", theme.border.default)}>
        <WarRoomSidebar caseData={trialData.case} />
        <div className={cn("flex-1 overflow-y-auto px-6 py-6 custom-scrollbar")}>
            {renderContent()}
        </div>
      </div>
    </div>
  );
};
