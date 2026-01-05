
import React from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
      { id: 1, type: 'alert', title: 'Deadline Approaching', desc: 'Motion to Dismiss opposition due tomorrow.', time: '10m ago' },
      { id: 2, type: 'success', title: 'Filing Accepted', desc: 'Court accepted filing #49281.', time: '1h ago' },
      { id: 3, type: 'info', title: 'New Document', desc: 'Opposing counsel uploaded "Exhibit C".', time: '2h ago' },
  ];

  const getIcon = (type: string) => {
      switch(type) {
          case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500"/>;
          case 'success': return <CheckCircle className="h-5 w-5 text-green-500"/>;
          default: return <Info className="h-5 w-5 text-blue-500"/>;
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative w-80 bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Bell className="h-4 w-4"/> Notifications</h3>
                <button onClick={onClose}><X className="h-5 w-5 text-slate-400 hover:text-slate-600"/></button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                        <div className="flex gap-3 items-start">
                            {getIcon(n.type)}
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                                <p className="text-xs text-slate-600 mt-1">{n.desc}</p>
                                <span className="text-[10px] text-slate-400 mt-2 block">{n.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-100 text-center">
                <button className="text-xs font-bold text-blue-600 hover:underline">Mark all as read</button>
            </div>
        </div>
    </div>
  );
};
