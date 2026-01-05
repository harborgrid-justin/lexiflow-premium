
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Grid, List, FileImage, FileText, Tag, Eye } from 'lucide-react';

export const TrialBinder: React.FC = () => {
  const exhibits = [
      { id: 'EX-101', name: 'Accident Report', type: 'PDF', status: 'Admitted', tags: ['Liability'] },
      { id: 'EX-102', name: 'Scene Photo A', type: 'IMG', status: 'Pending', tags: ['Scene', 'Damage'] },
      { id: 'EX-103', name: 'Medical Records', type: 'PDF', status: 'Withdrawn', tags: ['Damages'] },
      { id: 'EX-104', name: 'Expert CV', type: 'DOC', status: 'Admitted', tags: ['Expert'] },
      { id: 'EX-105', name: 'Email Thread', type: 'MSG', status: 'Admitted', tags: ['Communication'] },
      { id: 'EX-106', name: 'Contract V1', type: 'PDF', status: 'Pending', tags: ['Contract'] },
  ];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-lg font-bold text-slate-900">Digital Trial Binder</h2>
                <p className="text-xs text-slate-500">Case No. 24-CIV-00912 • Hon. Judge Miller</p>
            </div>
            <div className="flex gap-2">
                <div className="flex bg-slate-100 p-1 rounded">
                    <button className="p-1 bg-white rounded shadow-sm"><Grid size={16}/></button>
                    <button className="p-1 text-slate-500 hover:text-slate-700"><List size={16}/></button>
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded text-xs font-bold hover:bg-slate-800">Present Mode</button>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {exhibits.map(ex => (
                <div key={ex.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all group cursor-pointer relative">
                    <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center relative">
                        {ex.type === 'IMG' ? <FileImage size={32} className="text-slate-400"/> : <FileText size={32} className="text-slate-400"/>}
                        <div className="absolute top-2 right-2 bg-white/90 rounded px-1.5 py-0.5 text-[10px] font-bold shadow-sm">{ex.type}</div>
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="bg-white text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:scale-105 transition-transform">
                                <Eye size={12}/> View
                            </button>
                        </div>
                    </div>
                    <div className="p-2 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-mono font-bold bg-slate-100 px-1 rounded">{ex.id}</span>
                            <div className={`w-2 h-2 rounded-full ${ex.status === 'Admitted' ? 'bg-green-500' : ex.status === 'Withdrawn' ? 'bg-red-500' : 'bg-amber-500'}`} title={ex.status}></div>
                        </div>
                        <h4 className="font-bold text-xs text-slate-800 truncate" title={ex.name}>{ex.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {ex.tags.map(t => (
                                <span key={t} className="text-[8px] bg-blue-50 text-blue-700 px-1 rounded border border-blue-100">{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};
