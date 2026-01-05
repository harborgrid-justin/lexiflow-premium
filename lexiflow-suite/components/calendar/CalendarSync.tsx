
import React from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const CalendarSync: React.FC = () => {
  const accounts = [
    { provider: 'Office 365', user: 'alex@lexiflow.com', status: 'Connected', lastSync: '2 mins ago' },
    { provider: 'Google Calendar', user: 'admin@lexiflow.com', status: 'Connected', lastSync: '15 mins ago' },
    { provider: 'CourtAPI (ECF)', user: 'Firm Account', status: 'Error', lastSync: '2 hours ago' },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-900">Calendar Integrations</h3>
          <p className="text-sm text-slate-500">Manage 2-way sync with external providers.</p>
        </div>
        <Button variant="outline" size="sm" icon={RefreshCw} className="hidden md:flex">Force Sync All</Button>
        <Button variant="outline" size="sm" className="md:hidden"><RefreshCw className="h-4 w-4"/></Button>
      </div>
      <div className="divide-y divide-slate-100">
        {accounts.map((acc, i) => (
          <div key={i} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 gap-4 md:gap-0">
            <div className="flex items-center gap-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shrink-0 ${acc.provider.includes('Office') ? 'bg-blue-600' : acc.provider.includes('Google') ? 'bg-red-500' : 'bg-slate-700'}`}>
                {acc.provider.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{acc.provider}</h4>
                <p className="text-sm text-slate-500">{acc.user}</p>
              </div>
            </div>
            <div className="flex justify-between md:block md:text-right items-center">
              <div className={`flex items-center md:justify-end text-sm font-medium ${acc.status === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
                {acc.status === 'Connected' ? <CheckCircle className="h-4 w-4 mr-1"/> : <XCircle className="h-4 w-4 mr-1"/>}
                {acc.status}
              </div>
              <p className="text-xs text-slate-400 mt-1">Last Sync: {acc.lastSync}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <Button variant="primary" className="w-full md:w-auto">Add New Account</Button>
      </div>
    </div>
  );
};
