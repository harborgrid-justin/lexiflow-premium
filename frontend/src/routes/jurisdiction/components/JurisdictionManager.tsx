/**
 * @module components/jurisdiction/JurisdictionManager
 * @category Jurisdiction
 * @description Main jurisdiction explorer with federal, state, and international tabs.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { Plus } from 'lucide-react';
import React, { Suspense, useState, useTransition } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Components
import { Button } from '@/shared/ui/atoms/Button/Button';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { PageHeader } from '@/shared/ui/organisms/PageHeader/PageHeader';

// Utils & Constants
import { cn } from '@/shared/lib/cn';
import { JURISDICTION_TABS, JurisdictionView } from './utils';

const JurisdictionFederal = React.lazy(() => import('./JurisdictionFederal').then(m => ({ default: m.JurisdictionFederal })));
const JurisdictionState = React.lazy(() => import('./JurisdictionState').then(m => ({ default: m.JurisdictionState })));
const JurisdictionRegulatory = React.lazy(() => import('./JurisdictionRegulatory').then(m => ({ default: m.JurisdictionRegulatory })));
const JurisdictionInternational = React.lazy(() => import('./JurisdictionInternational').then(m => ({ default: m.JurisdictionInternational })));
const JurisdictionArbitration = React.lazy(() => import('./JurisdictionArbitration').then(m => ({ default: m.JurisdictionArbitration })));
const JurisdictionLocalRules = React.lazy(() => import('./JurisdictionLocalRules').then(m => ({ default: m.JurisdictionLocalRules })));
const JurisdictionGeoMap = React.lazy(() => import('./JurisdictionGeoMap').then(m => ({ default: m.JurisdictionGeoMap })));

export function JurisdictionManager() {
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
            {JURISDICTION_TABS.map(tab => (
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
                <tab.icon className="h-4 w-4 mr-2" />
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
