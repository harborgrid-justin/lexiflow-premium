
import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, RefreshCw, Flag } from 'lucide-react';
import { Card } from '../common/Card.tsx';
import { MOCK_TASKS } from '../../data/mockWorkflow.ts';
import { Case, CasePhase } from '../../types.ts';
import { DataService } from '../../services/dataService.ts';

interface CasePlanningProps {
  caseData: Case;
}

export const CasePlanning: React.FC<CasePlanningProps> = ({ caseData }) => {
  const [view, setView] = useState<'timeline' | 'calendar'>('timeline');
  const [phases, setPhases] = useState<CasePhase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    
    const loadPhases = async () => {
      setLoading(true);
      try {
        const fetchedPhases = await DataService.phases.getByCaseId(caseData.id);
        // Guideline 7: Strict Mode Readiness - Prevent setting state on unmounted component
        if (!ignore) {
            setPhases(fetchedPhases);
        }
      } catch (e) {
          console.error("Failed to load phases", e);
      } finally {
          if (!ignore) {
             setLoading(false);
          }
      }
    };

    loadPhases();

    return () => {
        ignore = true;
    };
  }, [caseData.id]);

  const getPhaseDates = (startIso: string, duration: number) => {
    const s = new Date(startIso);
    const e = new Date(s);
    e.setDate(e.getDate() + duration);
    return { start: s.toLocaleDateString(), end: e.toLocaleDateString() };
  };

  const totalDuration = phases.reduce((acc, p) => acc + p.duration, 0) || 365;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-purple-600"/> Timeline & Planning</h3>
          <p className="text-sm text-slate-500">Master schedule synced with court deadlines.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('timeline')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'timeline' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Gantt View
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${view === 'calendar' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {view === 'timeline' && (
        <Card title="Case Lifecycle Projection">
          <div className="space-y-8 mt-4">
            {/* Visual Gantt - Updated to match Design System VZ-27 */}
            <div className="relative h-12 w-full bg-slate-100 rounded-lg border border-slate-200 flex overflow-hidden">
                {loading ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Loading...</div>
                ) : phases.map((phase) => (
                    <div 
                        key={phase.id}
                        className={`h-full relative group cursor-pointer transition-all hover:brightness-95 border-r border-white/20 flex items-center justify-center ${phase.color || 'bg-slate-400'}`}
                        style={{ width: `${(phase.duration / totalDuration) * 100}%` }}
                        title={`${phase.name} (${phase.duration} days)`}
                    >
                        <span className="text-[10px] font-bold text-white truncate px-1 drop-shadow-sm">{phase.name}</span>
                    </div>
                ))}
            </div>

            {/* Detailed Phase List */}
            <div className="space-y-3">
                {phases.map((phase) => {
                    const { start, end } = getPhaseDates(phase.startDate, phase.duration);
                    return (
                        <div key={phase.id} className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-all shadow-sm group">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${phase.color || 'bg-slate-400'}`}></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                    <h4 className="font-bold text-sm text-slate-900">{phase.name}</h4>
                                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${phase.status === 'Active' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                        {phase.status}
                                    </span>
                                </div>
                                <div className="flex items-center text-xs text-slate-500 gap-4">
                                    <span className="flex items-center font-mono"><Calendar className="h-3 w-3 mr-1.5 opacity-70"/> {start} — {end}</span>
                                    <span className="flex items-center font-medium"><Flag className="h-3 w-3 mr-1.5 opacity-70"/> {phase.duration} Days</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </Card>
      )}

      {view === 'calendar' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Upcoming Events</h3>
                <div className="space-y-3">
                    {MOCK_TASKS.filter(t => t.caseId === caseData.id).map(task => (
                        <div key={task.id} className="flex gap-4 items-center p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-slate-50 transition-colors bg-white">
                            <div className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded p-2 min-w-[60px] shrink-0">
                                <span className="text-[10px] font-bold text-red-600 uppercase">{new Date(task.dueDate).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-lg font-bold text-slate-900 leading-none">{new Date(task.dueDate).getDate()}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-500">{task.assignee}</span>
                                    <span className={`text-[10px] px-1.5 rounded border ${task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>{task.priority}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {MOCK_TASKS.filter(t => t.caseId === caseData.id).length === 0 && (
                        <p className="text-center text-slate-400 italic py-8 text-sm">No scheduled events for this case.</p>
                    )}
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-amber-800 text-sm mb-3 flex items-center"><AlertCircle className="h-4 w-4 mr-2"/> Critical Deadlines</h4>
                    <ul className="space-y-2 text-xs">
                        <li className="flex justify-between p-2 bg-white/50 rounded border border-amber-100">
                            <span className="text-amber-900">Discovery Cutoff</span>
                            <span className="font-bold text-red-600">Mar 30</span>
                        </li>
                        <li className="flex justify-between p-2 bg-white/50 rounded border border-amber-100">
                            <span className="text-amber-900">Expert Disclosure</span>
                            <span className="font-bold text-red-600">Apr 15</span>
                        </li>
                    </ul>
                </div>
                
                <Card title="Calendar Sync">
                    <div className="space-y-2 text-sm">
                         <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                             <span className="text-slate-600">Google Calendar</span>
                             <span className="text-green-600 font-bold text-xs flex items-center"><RefreshCw className="h-3 w-3 mr-1"/> Active</span>
                         </div>
                         <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                             <span className="text-slate-600">Outlook</span>
                             <span className="text-green-600 font-bold text-xs flex items-center"><RefreshCw className="h-3 w-3 mr-1"/> Active</span>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
};
