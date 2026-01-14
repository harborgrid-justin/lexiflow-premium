/**
 * CaseCollaboration.tsx
 *
 * Multi-party collaboration hub with conferral logs, discovery plan builder,
 * and stipulation management.
 *
 * @module components/case-detail/collaboration/CaseCollaboration
 * @category Case Management - Collaboration
 */

// External Dependencies
import { useState } from 'react';
import { Users, FileText, CalendarClock, PenTool, Loader2 } from 'lucide-react';

// Internal Dependencies - Components
import { ConferralLog } from './ConferralLog';
import { DiscoveryPlanBuilder } from './DiscoveryPlanBuilder';
import { Card } from '@/shared/ui/molecules/Card';
import { Button } from '@/shared/ui/atoms/Button';

// Internal Dependencies - Hooks & Context
import { useTheme } from '@/features/theme';
import { useQuery } from '@/hooks/useQueryHooks';

// Internal Dependencies - Services & Utils
import { DataService } from '@/services/data/dataService';
// ✅ Migrated to backend API (2025-12-21)
import { cn } from '@/shared/lib/cn';

// Types & Interfaces
import { StipulationRequest } from '@/types';

interface CaseCollaborationProps {
  caseId: string;
}

export const CaseCollaboration: React.FC<CaseCollaborationProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState<'conferral' | 'plans' | 'stipulations'>('conferral');

  // Enterprise Data Access
  const { data: stipulations = [], isLoading: loadingStips } = useQuery<StipulationRequest[]>(
      ['stipulations', 'all'], // In real app, filter by caseId
      DataService.collaboration.getStipulations,
      { enabled: activeView === 'stipulations' }
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-1 space-y-2">
        <button
          onClick={() => setActiveView('conferral')}
          className={cn(
            "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3",
            activeView === 'conferral' ? cn(theme.primary.light, theme.primary.text, theme.primary.border, "shadow-sm") : cn(theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)
          )}
        >
          <Users className="h-5 w-5"/>
          <div>
            <span className="block font-bold text-sm">Meet & Confer</span>
            <span className="text-xs opacity-80">Track compliance logs</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('plans')}
          className={cn(
            "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3",
            activeView === 'plans' ? cn(theme.primary.light, theme.primary.text, theme.primary.border, "shadow-sm") : cn(theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)
          )}
        >
          <FileText className="h-5 w-5"/>
          <div>
            <span className="block font-bold text-sm">Joint Discovery Plans</span>
            <span className="text-xs opacity-80">Rule 26(f) Reports</span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('stipulations')}
          className={cn(
            "w-full text-left p-4 rounded-lg border transition-all flex items-center gap-3",
            activeView === 'stipulations' ? cn(theme.primary.light, theme.primary.text, theme.primary.border, "shadow-sm") : cn(theme.surface.default, theme.border.default, theme.text.secondary, `hover:${theme.surface.highlight}`)
          )}
        >
          <CalendarClock className="h-5 w-5"/>
          <div>
            <span className="block font-bold text-sm">Stipulations</span>
            <span className="text-xs opacity-80">Deadline negotiation</span>
          </div>
        </button>
      </div>

      <div className="lg:col-span-3">
        {activeView === 'conferral' && <ConferralLog caseId={caseId} />}
        {activeView === 'plans' && <DiscoveryPlanBuilder caseId={caseId} />}
        {activeView === 'stipulations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className={cn("font-bold", theme.text.primary)}>Stipulation Requests</h3>
              <Button variant="primary" icon={PenTool}>Propose Stipulation</Button>
            </div>
            {loadingStips ? (
                 <div className="flex justify-center p-12"><Loader2 className={cn("animate-spin", theme.text.link)}/></div>
            ) : (
                stipulations.map(stip => (
                <Card key={stip.id} className="border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                    <div>
                        <h4 className={cn("font-bold", theme.text.primary)}>{stip.title}</h4>
                        <p className={cn("text-sm mt-1", theme.text.secondary)}>Requested by: {stip.requestingParty}</p>
                        <p className={cn("text-sm", theme.text.secondary)}>Reason: {stip.reason}</p>
                    </div>
                    <div className="text-right">
                        <div className={cn("text-xs font-bold uppercase mb-1", theme.text.tertiary)}>Proposed Date</div>
                        <div className={cn("text-lg font-mono font-bold", theme.text.primary)}>{stip.proposedDate}</div>
                    </div>
                    </div>
                    <div className={cn("mt-4 pt-4 border-t flex gap-3", theme.border.subtle)}>
                    <Button size="sm" variant="primary" className={cn("bg-green-600 hover:bg-green-700 border-transparent", theme.text.inverse)}>Accept</Button>
                    <Button size="sm" variant="danger">Reject</Button>
                    <Button size="sm" variant="secondary">Counter-Propose</Button>
                    </div>
                </Card>
                ))
            )}
            {!loadingStips && stipulations.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic border-2 border-dashed rounded-lg">No pending stipulations.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

