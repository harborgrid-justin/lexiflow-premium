
import React, { useState, useTransition, useMemo } from 'react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { CalendarMaster } from './calendar/CalendarMaster.tsx';
import { CalendarDeadlines } from './calendar/CalendarDeadlines.tsx';
import { CalendarTeam } from './calendar/CalendarTeam.tsx';
import { CalendarHearings } from './calendar/CalendarHearings.tsx';
import { CalendarSOL } from './calendar/CalendarSOL.tsx';
import { CalendarRules } from './calendar/CalendarRules.tsx';
import { CalendarSync } from './calendar/CalendarSync.tsx';
import { Calendar as CalendarIcon, Clock, Users, Gavel, AlertOctagon, Settings, RefreshCw } from 'lucide-react';
import { useData } from '../hooks/useData.ts';

type CalendarTab = 'master' | 'deadlines' | 'team' | 'hearings' | 'sol' | 'rules' | 'sync';

export const CalendarView: React.FC = () => {
  const tasks = useData(s => s.tasks);
  const cases = useData(s => s.cases);

  const [activeTab, setActiveTab] = useState<CalendarTab>('master');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabId: string) => {
      startTransition(() => {
          setActiveTab(tabId as CalendarTab);
      });
  };

  const tabs = useMemo(() => [
    { id: 'master', label: 'Master Schedule', icon: CalendarIcon },
    { id: 'deadlines', label: 'Court Deadlines', icon: Clock },
    { id: 'team', label: 'Team Availability', icon: Users },
    { id: 'hearings', label: 'Hearing Docket', icon: Gavel },
    { id: 'sol', label: 'Statute Watch', icon: AlertOctagon },
    { id: 'rules', label: 'Rule Sets', icon: Settings },
    { id: 'sync', label: 'Sync & Feeds', icon: RefreshCw },
  ], []);

  return (
    <div className="h-full flex flex-col animate-fade-in bg-slate-50">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Master Calendar" 
            subtitle="Centralized deadlines, court filings, and team schedules."
        />
        
        <TabNavigation 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 min-h-0 overflow-hidden p-6 pt-2 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="h-full flex flex-col max-w-[1920px] mx-auto">
            {activeTab === 'master' && <CalendarMaster tasks={tasks} cases={cases} />}
            {activeTab !== 'master' && (
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'deadlines' && <CalendarDeadlines tasks={tasks} />}
                    {activeTab === 'team' && <CalendarTeam />}
                    {activeTab === 'hearings' && <CalendarHearings />}
                    {activeTab === 'sol' && <CalendarSOL />}
                    {activeTab === 'rules' && <CalendarRules />}
                    {activeTab === 'sync' && <CalendarSync />}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
