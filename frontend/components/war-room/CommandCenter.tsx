
/**
 * @module components/war-room/CommandCenter
 * @category WarRoom
 * @description Central dashboard for the War Room, displaying key metrics, status, and recent activity.
 * Provides navigation to other War Room modules.
 *
 * THEME SYSTEM USAGE:
 * This component uses the `useTheme` hook to apply semantic colors for backgrounds,
 * text, and borders, ensuring a consistent look in both light and dark modes.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { CheckSquare, FileText, Activity, AlertCircle, Users, ArrowRight, AlertTriangle } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../../services/data/dataService'';
import { useQuery } from '../../services/queryClient';
import { STORES } from '../../services/data/db'';
import { queryKeys } from '../../utils/queryKeys';

// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Components
import { Card } from '../common/Card';
import { MetricCard } from '../common/Primitives';

// Utils & Constants
import { cn } from '../../utils/cn';

// Types
import type { WarRoomData, SanctionMotion } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface CommandCenterProps {
  /** The ID of the current case. */
  caseId: string;
  /** The comprehensive data object for the war room. */
  warRoomData: WarRoomData;
  /** Callback function to handle navigation to other views. */
  onNavigate: (view: string, context?: any) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================
export const CommandCenter: React.FC<CommandCenterProps> = ({ caseId, warRoomData, onNavigate }) => {
  // ============================================================================
  // HOOKS & CONTEXT
  // ============================================================================
  const { theme } = useTheme();
  
  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const { data: sanctions = [] } = useQuery<SanctionMotion[]>(
    [STORES.SANCTIONS, 'all'], 
    DataService.discovery.getSanctions
  );
  
  // ============================================================================
  // DERIVED STATE & MEMOIZED VALUES
  // ============================================================================
  const exhibitsTotal = warRoomData.evidence?.length || 0;
  const exhibitsAdmitted = warRoomData.evidence?.filter((e) => e.status === 'Admitted').length || 0;
  const witnessCount = warRoomData.witnesses?.length || 0;
  const tasksDue = warRoomData.tasks?.filter((t) => t.priority === 'High' && t.status !== 'Done').length || 0;
  const recentDocket = warRoomData.docket?.slice().reverse().slice(0, 5) || [];
  const sanctionsCount = sanctions.length;

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="space-y-6 animate-fade-in">
        {/* Countdown & Status */}
        <Card className={cn("p-6", theme.surface.raised, "border-2", theme.primary.border)}>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className={cn("text-lg font-bold", theme.text.primary)}>Trial Countdown: 3 Days</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>Current Status: <span className="font-semibold text-green-500">Ready</span></p>
                </div>
                <div className="text-right">
                    <p className={cn("text-2xl font-bold", theme.text.primary)}>Day 1 of 5</p>
                    <p className={cn("text-sm", theme.text.secondary)}>Jury Selection Complete</p>
                </div>
            </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
                label="Exhibits Admitted" 
                value={`${exhibitsAdmitted} / ${exhibitsTotal}`} 
                icon={FileText}
            />
            <MetricCard 
                label="Witnesses Ready" 
                value={`${witnessCount}`} 
                icon={Users}
            />
            <MetricCard 
                label="High-Priority Tasks" 
                value={tasksDue} 
                icon={CheckSquare}
            />
            <MetricCard 
                label="Sanctions Filed" 
                value={sanctionsCount} 
                icon={AlertTriangle}
            />
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={<div className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Docket Activity</div>}>
                    <ul className="space-y-3">
                        {recentDocket.map((entry, index) => (
                            <li key={index} className={cn("flex items-start justify-between text-sm", theme.text.secondary)}>
                                <div className="flex-1 pr-4">
                                    <p className={cn("font-medium", theme.text.primary)}>{entry.description}</p>
                                    <span className="text-xs">{new Date(entry.date).toLocaleDateString()} - Doc #{index + 1}</span>
                                </div>
                                <span className={cn("text-xs font-mono px-2 py-1 rounded", theme.surface.highlight, theme.border.default)}>{entry.type}</span>
                            </li>
                        ))}
                    </ul>
            </Card>
            <Card title={<div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Critical Alerts</div>}>
                    <div className="space-y-3">
                        <div className={cn("p-3 rounded-lg flex items-start gap-3 border-amber-500", theme.surface.highlight, "border")}>
                            <AlertTriangle className={cn("h-5 w-5 mt-0.5 text-amber-500")} />
                            <div>
                                <p className={cn("font-semibold", theme.text.primary)}>Witness Unavailability</p>
                                <p className={cn("text-sm", theme.text.secondary)}>Dr. Eva Rostova has a conflict on Day 3. Mitigation required.</p>
                                <button onClick={() => onNavigate('witnesses', { witnessId: 'W-003' })} className={cn("text-sm font-semibold mt-1 flex items-center gap-1", theme.primary.text)}>
                                    View Witness <ArrowRight className="h-3 w-3"/>
                                </button>
                            </div>
                        </div>
                         <div className={cn("p-3 rounded-lg flex items-start gap-3 border-red-500", theme.surface.highlight, "border")}>
                            <AlertTriangle className={cn("h-5 w-5 mt-0.5 text-red-500")} />
                            <div>
                                <p className={cn("font-semibold", theme.text.primary)}>Evidence Challenge</p>
                                <p className={cn("text-sm", theme.text.secondary)}>Opposing counsel has filed a motion to exclude Exhibit P-78.</p>
                                <button onClick={() => onNavigate('evidence')} className={cn("text-sm font-semibold mt-1 flex items-center gap-1", theme.primary.text)}>
                                    Review Evidence <ArrowRight className="h-3 w-3"/>
                                </button>
                            </div>
                        </div>
                    </div>
            </Card>
        </div>
    </div>
  );
};
