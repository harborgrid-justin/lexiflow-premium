
import React, { useState, useTransition, useMemo } from 'react';
import { PageHeader } from './common/PageHeader.tsx';
import { TabNavigation } from './common/TabNavigation.tsx';
import { Landmark, Map, Gavel, Globe, ScrollText, Scale, Building2, Lock } from 'lucide-react';
import { JurisdictionFederal } from './jurisdiction/JurisdictionFederal.tsx';
import { JurisdictionState } from './jurisdiction/JurisdictionState.tsx';
import { JurisdictionRegulatory } from './jurisdiction/JurisdictionRegulatory.tsx';
import { JurisdictionInternational } from './jurisdiction/JurisdictionInternational.tsx';
import { JurisdictionArbitration } from './jurisdiction/JurisdictionArbitration.tsx';
import { JurisdictionLocalRules } from './jurisdiction/JurisdictionLocalRules.tsx';
import { JurisdictionGeoMap } from './jurisdiction/JurisdictionGeoMap.tsx';
import { User } from '../types.ts';

type JurisdictionView = 'federal' | 'state' | 'regulatory' | 'international' | 'arbitration' | 'local' | 'map';

interface JurisdictionManagerProps {
  currentUser?: User;
}

export const JurisdictionManager: React.FC<JurisdictionManagerProps> = ({ currentUser }) => {
  const [view, setView] = useState<JurisdictionView>('federal');
  const [isPending, startTransition] = useTransition();

  const handleViewChange = (newView: string) => {
      startTransition(() => {
          setView(newView as JurisdictionView);
      });
  };

  const tabs = useMemo(() => [
    { id: 'federal', label: 'Federal Circuit', icon: Landmark },
    { id: 'state', label: 'State Venues', icon: Building2 },
    { id: 'regulatory', label: 'Regulatory', icon: Scale },
    { id: 'international', label: 'International', icon: Globe },
    { id: 'arbitration', label: 'Arbitration', icon: Gavel },
    { id: 'local', label: 'Local Rules', icon: ScrollText },
    { id: 'map', label: 'Geo Map', icon: Map },
  ], []);

  return (
    <div className="h-full flex flex-col bg-slate-50 animate-fade-in">
      <div className="px-6 pt-6 pb-2 shrink-0">
        <PageHeader 
            title="Jurisdiction & Venues" 
            subtitle="Manage courts, regulatory bodies, and jurisdictional rules."
            actions={
            currentUser ? (
                <div className="flex items-center text-xs text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                <span className={`w-2 h-2 rounded-full mr-2 ${currentUser.role === 'Senior Partner' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                Viewing as: <span className="font-bold ml-1">{currentUser.role}</span>
                </div>
            ) : undefined
            }
        />
        <TabNavigation 
            tabs={tabs} 
            activeTab={view} 
            onTabChange={handleViewChange} 
            className="bg-white rounded-lg border border-slate-200 p-1 shadow-sm"
        />
      </div>

      <div className={`flex-1 overflow-y-auto min-h-0 p-6 pt-4 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="max-w-[1920px] mx-auto h-full">
            {view === 'federal' && <JurisdictionFederal />}
            {view === 'state' && <JurisdictionState />}
            {view === 'regulatory' && <JurisdictionRegulatory />}
            {view === 'international' && <JurisdictionInternational />}
            {view === 'arbitration' && <JurisdictionArbitration />}
            {view === 'local' && <JurisdictionLocalRules />}
            {view === 'map' && <div className="h-full"><JurisdictionGeoMap /></div>}
        </div>
      </div>
    </div>
  );
};
