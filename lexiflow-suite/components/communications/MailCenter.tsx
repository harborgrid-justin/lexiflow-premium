
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Mail, ScanLine, Trash2, Archive, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge.tsx';

export const MailCenter: React.FC = () => {
    const items = [
        { id: 1, from: 'IRS', date: 'Today', summary: 'Notice of Audit', type: 'Urgent', status: 'Unread' },
        { id: 2, from: 'Superior Court', date: 'Yesterday', summary: 'Returned Summons', type: 'Legal', status: 'Read' },
        { id: 3, from: 'Amex', date: 'Oct 10', summary: 'Statement', type: 'Finance', status: 'Archived' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 text-white p-6 rounded-lg flex justify-between items-center shadow-lg">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2"><Mail className="h-6 w-6"/> Digital Mailroom</h3>
                    <p className="text-slate-400 text-sm">Physical mail scanned and indexed daily.</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">New Items</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <Card key={item.id} noPadding className="hover:border-blue-400 transition-colors group cursor-pointer">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant={item.type === 'Urgent' ? 'error' : 'neutral'}>{item.type}</Badge>
                                <span className="text-xs text-slate-400">{item.date}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 mb-1">{item.from}</h4>
                            <p className="text-sm text-slate-600 mb-4">{item.summary}</p>
                            
                            <div className="h-32 bg-slate-100 rounded border border-slate-200 flex items-center justify-center relative overflow-hidden group-hover:opacity-75 transition-opacity">
                                <ScanLine className="h-8 w-8 text-slate-400"/>
                                <span className="absolute bottom-2 text-[10px] text-slate-500 font-mono">SCAN_PREVIEW.PDF</span>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-2 border-t border-slate-100 flex justify-end gap-2">
                             <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                             <button className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"><Archive size={16}/></button>
                             <button className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded ml-auto">
                                View <ArrowRight size={14}/>
                             </button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
