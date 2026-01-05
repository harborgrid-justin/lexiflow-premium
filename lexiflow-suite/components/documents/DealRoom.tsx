
import React, { useState } from 'react';
import { Folder, FileText, Lock, Users, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';

export const DealRoom: React.FC = () => {
    const [folders, setFolders] = useState([
        { id: '1', name: '01. Corporate Formation', count: 12, access: 'All Parties' },
        { id: '2', name: '02. Financial Statements', count: 45, access: 'Restricted' },
        { id: '3', name: '03. Intellectual Property', count: 8, access: 'Restricted' },
        { id: '4', name: '04. Employee Matters', count: 22, access: 'All Parties' },
    ]);

    return (
        <div className="flex h-full gap-6">
            <div className="w-64 flex-shrink-0 space-y-4">
                <div className="bg-slate-900 text-white p-4 rounded-lg shadow-md">
                    <h3 className="font-bold text-lg mb-1">Project Blue VDR</h3>
                    <p className="text-xs text-slate-400">Secure Data Room #9942</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                        <ShieldCheck size={14}/> Watermarking Active
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase px-2 py-1">Authorized Groups</h4>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer text-sm">
                            <span className="flex items-center gap-2"><Users size={14}/> Buyer Counsel</span>
                            <Badge variant="success">View</Badge>
                        </div>
                        <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded cursor-pointer text-sm">
                            <span className="flex items-center gap-2"><Users size={14}/> Auditors</span>
                            <Badge variant="warning">Ltd</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                    <h3 className="font-bold text-slate-800">Data Room Index</h3>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" icon={Eye}>Preview As...</Button>
                        <Button size="sm" variant="primary">Upload Files</Button>
                    </div>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
                    {folders.map(f => (
                        <div key={f.id} className="border border-slate-200 p-4 rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <Folder className="h-8 w-8 text-blue-200 fill-blue-50 group-hover:text-blue-500 transition-colors"/>
                                {f.access === 'Restricted' && <Lock size={14} className="text-red-400"/>}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{f.name}</h4>
                            <p className="text-xs text-slate-500">{f.count} Documents</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
