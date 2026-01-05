
import React from 'react';
import { Card } from '../common/Card.tsx';
import { Plus, Calendar, GripVertical } from 'lucide-react';
import { Button } from '../common/Button.tsx';

export const CaseTimelineBuilder: React.FC = () => {
  const facts = [
      { date: '2023-01-10', time: '09:00 AM', title: 'Contract Signed', desc: 'Parties executed MSA.' },
      { date: '2023-02-15', time: '02:30 PM', title: 'First Breach', desc: 'Missed delivery deadline per Exhibit A.' },
      { date: '2023-03-01', time: '10:00 AM', title: 'Notice of Default', desc: 'Plaintiff sent formal notice via email.' },
  ];

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div>
                <h3 className="font-bold text-slate-900 text-lg">Case Fact Chronology</h3>
                <p className="text-sm text-slate-500">Build the narrative for trial presentation.</p>
            </div>
            <Button variant="primary" icon={Plus}>Add Fact</Button>
        </div>

        <div className="relative pl-8 border-l-2 border-slate-200 space-y-6">
            {facts.map((fact, i) => (
                <div key={i} className="relative group">
                    <div className="absolute -left-[41px] top-4 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-move flex gap-4">
                        <div className="text-slate-300 flex flex-col justify-center"><GripVertical size={16}/></div>
                        <div className="border-r pr-4 min-w-[100px] text-right">
                            <div className="font-bold text-slate-900">{fact.date}</div>
                            <div className="text-xs text-slate-500 flex items-center justify-end gap-1"><Calendar size={10}/> {fact.time}</div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-blue-700">{fact.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{fact.desc}</p>
                        </div>
                    </div>
                </div>
            ))}
            <div className="relative">
                <div className="absolute -left-[39px] top-2 w-5 h-5 bg-slate-200 rounded-full border-4 border-white"></div>
                <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors font-medium text-sm">
                    + Add Timeline Entry
                </button>
            </div>
        </div>
    </div>
  );
};
