
import React from 'react';
import { Bell, Check, X } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const notifications = [
    { id: 1, text: 'Approval required for Doc #442', time: '10m ago', type: 'action' },
    { id: 2, text: 'SLA Breach imminent on Task T-103', time: '1h ago', type: 'alert' },
    { id: 3, text: 'Discovery Phase completed automatically', time: '2h ago', type: 'info' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h4 className="text-sm font-bold text-slate-800 flex items-center">
          <Bell className="h-4 w-4 mr-2 text-blue-600" /> Notifications
        </h4>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 rounded">{notifications.length}</span>
      </div>
      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
        {notifications.map(n => (
          <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors group">
            <p className="text-xs text-slate-800 mb-1">{n.text}</p>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-slate-400">{n.time}</span>
              {n.type === 'action' && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 hover:bg-green-100 text-green-600 rounded"><Check className="h-3 w-3"/></button>
                  <button className="p-1 hover:bg-red-100 text-red-600 rounded"><X className="h-3 w-3"/></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
