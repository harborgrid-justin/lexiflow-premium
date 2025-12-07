
import React, { useState, useMemo, useCallback, useEffect, Suspense, useTransition } from 'react';
import { PageHeader } from './common/PageHeader';
import { Button } from './common/Button';
import { Globe, Scale, Building2, Shield, Users, Map as MapIcon, Plus, Gavel } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/cn';
import { LazyLoader } from './common/LazyLoader';

const JurisdictionFederal = React.lazy(() => import('./jurisdiction/JurisdictionFederal').then(m => ({ default: m.JurisdictionFederal })));
const JurisdictionState = React.lazy(() => import('./jurisdiction/JurisdictionState').then(m => ({ default: m.JurisdictionState })));
const JurisdictionRegulatory = React.lazy(() => import('./jurisdiction/JurisdictionRegulatory').then(m => ({ default: m.JurisdictionRegulatory })));
const JurisdictionInternational = React.lazy(() => import('./jurisdiction/JurisdictionInternational').then(m => ({ default: m.JurisdictionInternational })));
const JurisdictionArbitration = React.lazy(() => import('./jurisdiction/JurisdictionArbitration').then(m => ({ default: m.JurisdictionArbitration })));
const JurisdictionLocalRules = React.lazy(() => import('./jurisdiction/JurisdictionLocalRules').then(m => ({ default: m.JurisdictionLocalRules })));
const JurisdictionGeoMap = React.lazy(() => import('./jurisdiction/JurisdictionGeoMap').then(m => ({ default: m.JurisdictionGeoMap })));

type JurisdictionView = 'federal' | 'state' | 'regulatory' | 'international' | 'arbitration' | 'local' | 'map';

const TABS = [
  { id: 'federal', label: 'Federal', icon: Scale },
  { id: 'state', label: 'State', icon: Building2 },
  { id: 'map', label: 'Geo Map', icon: MapIcon },
  { id: 'regulatory', label: 'Regulatory', icon: Shield },
  { id: 'international', label: 'International', icon: Globe },
  { id: 'arbitration', label: 'Arbitration', icon: Users },
  { id: 'local', label: 'Local Rules', icon: Gavel },
];

export const JurisdictionManager: React.FC = () => {
  const { theme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [activeTab, _setActiveTab] = useState<JurisdictionView>('federal');

  const setActiveTab = (tab: JurisdictionView) => {
    startTransition(() => {
        _setActiveTab(tab);
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'federal': return <JurisdictionFederal />;
      case 'state': return <JurisdictionState />;
      case 'regulatory': return <JurisdictionRegulatory />;
      case 'international': return <JurisdictionInternational />;
      case 'arbitration': return <JurisdictionArbitration />;
      case 'local': return <JurisdictionLocalRules />;
      case 'map': return <JurisdictionGeoMap />;
      default: return <JurisdictionFederal />;
    }
  };

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      <div className="px-6 pt-6 shrink-0">
        <PageHeader 
          title="Jurisdiction Explorer" 
          subtitle="Federal, state, and international court systems, rules, and procedures."
          actions={<Button variant="primary" icon={Plus}>Add Jurisdiction</Button>}
        />
        <div className={cn("border-b overflow-x-auto no-scrollbar", theme.border.default)}>
          <nav className="-mb-px flex space-x-8">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as JurisdictionView)}
                className={cn(
                  "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center",
                  activeTab === tab.id
                    ? cn("border-blue-500", theme.primary.text)
                    : cn("border-transparent", theme.text.secondary, `hover:${theme.text.primary}`)
                )}
              >
                <tab.icon className="h-4 w-4 mr-2"/>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
        <Suspense fallback={<LazyLoader message="Loading Jurisdiction Data..." />}>
          <div className={cn(isPending && 'opacity-60 transition-opacity')}>
            {renderContent()}
          </div>
        </Suspense>
      </div>
    </div>
  );
};
export default JurisdictionManager;