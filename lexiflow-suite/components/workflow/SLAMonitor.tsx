
import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface SLAItem {
  id: string;
  task: string;
  deadline: string;
  status: 'On Track' | 'At Risk' | 'Breached';
  progress: number;
}

const MOCK_SLAS: SLAItem[] = [
  { id: '1', task: 'Initial Filing Response', deadline: '2 hours', status: 'At Risk', progress: 85 },
  { id: '2', task: 'Client Intake Review', deadline: '1 day', status: 'On Track', progress: 40 },
  { id: '3', task: 'Conflict Check', deadline: 'Overdue', status: 'Breached', progress: 100 },
];

export const SLAMonitor: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-blue-600" /> SLA Monitor
      </h3>
      <div className="space-y-4">
        {MOCK_SLAS.map(sla => (
          <div key={sla.id} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700">{sla.task}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  sla.status === 'Breached' ? 'bg-red-100 text-red-700' : 
                  sla.status === 'At Risk' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {sla.status}
                </span>
                <span className="text-xs text-slate-500 font-mono">{sla.deadline}</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  sla.status === 'Breached' ? 'bg-red-500' : 
                  sla.status === 'At Risk' ? 'bg-amber-500' : 'bg-green-500'
                }`} 
                style={{ width: `${sla.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
