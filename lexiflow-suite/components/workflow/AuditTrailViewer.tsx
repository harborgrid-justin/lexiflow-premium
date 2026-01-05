
import React from 'react';
import { History, User, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  detail: string;
  type: 'success' | 'warning' | 'info';
}

const MOCK_AUDIT: AuditEvent[] = [
  { id: '1', timestamp: '2024-03-15 10:30 AM', user: 'Alexandra H.', action: 'Stage Completed', detail: 'Discovery Phase marked complete', type: 'success' },
  { id: '2', timestamp: '2024-03-14 02:15 PM', user: 'James Doe', action: 'Task Reassigned', detail: 'Moved "Review Brief" to Sarah Jenkins', type: 'info' },
  { id: '3', timestamp: '2024-03-12 09:00 AM', user: 'System', action: 'SLA Warning', detail: 'Task overdue by 24h', type: 'warning' },
];

export const AuditTrailViewer: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 flex items-center">
          <History className="h-4 w-4 mr-2 text-slate-500" /> Workflow Audit Trail
        </h3>
        <button className="text-xs text-blue-600 hover:underline flex items-center">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </button>
      </div>
      <div className="max-h-[300px] overflow-y-auto p-4 space-y-4">
        {MOCK_AUDIT.map((evt, idx) => (
          <div key={evt.id} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-0 last:pb-0">
            <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center ${
              evt.type === 'success' ? 'bg-green-500' : evt.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
            }`}>
              {evt.type === 'success' ? <Check className="h-2 w-2 text-white" /> : evt.type === 'warning' ? <AlertCircle className="h-2 w-2 text-white" /> : <User className="h-2 w-2 text-white" />}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-900">{evt.action}</p>
                <p className="text-xs text-slate-500">{evt.detail}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</p>
                <p className="text-[10px] text-slate-500 font-medium">{evt.user}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
