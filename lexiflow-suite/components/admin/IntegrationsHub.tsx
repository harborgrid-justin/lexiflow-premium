
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const IntegrationsHub: React.FC = () => {
    const integrations = [
        { name: 'Office 365', cat: 'Email/Calendar', status: 'Connected', lastSync: '10 mins ago', icon: 'M' },
        { name: 'iManage', cat: 'DMS', status: 'Connected', lastSync: '1 hour ago', icon: 'iM' },
        { name: 'Clio', cat: 'Practice Mgmt', status: 'Disconnected', lastSync: '-', icon: 'Cl' },
        { name: 'DocuSign', cat: 'E-Signature', status: 'Connected', lastSync: '5 mins ago', icon: 'DS' },
        { name: 'QuickBooks', cat: 'Accounting', status: 'Error', lastSync: 'Failed 2h ago', icon: 'QB' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((app, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                                {app.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">{app.name}</h4>
                                <span className="text-xs text-slate-500">{app.cat}</span>
                            </div>
                        </div>
                        <Badge variant={app.status === 'Connected' ? 'success' : app.status === 'Error' ? 'error' : 'neutral'}>
                            {app.status}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 border-t pt-3">
                        <span className="flex items-center gap-1">
                            <RefreshCw size={12}/> Sync: {app.lastSync}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => alert(`Configuring ${app.name} integration settings...`)}>Configure</Button>
                    </div>
                </div>
            ))}
        </div>
    );
};
