
import React, { useState } from 'react';
import { Card } from '../common/Card.tsx';
import { Badge } from '../common/Badge.tsx';
import { CheckCircle, XCircle, AlertTriangle, MinusCircle, FileText, ChevronRight, ArrowUpRight } from 'lucide-react';

interface CaseCitation {
  id: string;
  caseName: string;
  citation: string;
  date: string;
  court: string;
  treatment: 'Positive' | 'Caution' | 'Negative' | 'Neutral';
  analysis: string;
}

export const CitationAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'negative' | 'positive'>('all');

  const citations: CaseCitation[] = [
    { id: '1', caseName: 'Roe v. Wade', citation: '410 U.S. 113', date: '1973', court: 'SCOTUS', treatment: 'Negative', analysis: 'Overruled by Dobbs v. Jackson (2022)' },
    { id: '2', caseName: 'Planned Parenthood v. Casey', citation: '505 U.S. 833', date: '1992', court: 'SCOTUS', treatment: 'Negative', analysis: 'Overruled in part.' },
    { id: '3', caseName: 'Griswold v. Connecticut', citation: '381 U.S. 479', date: '1965', court: 'SCOTUS', treatment: 'Positive', analysis: 'Cited favorably for privacy rights.' },
    { id: '4', caseName: 'Obergefell v. Hodges', citation: '576 U.S. 644', date: '2015', court: 'SCOTUS', treatment: 'Caution', analysis: 'Distinguished by recent circuit opinion.' },
  ];

  const getSignalIcon = (treatment: string) => {
    switch (treatment) {
      case 'Positive': return <CheckCircle className="h-5 w-5 text-green-600 fill-green-50" />;
      case 'Negative': return <XCircle className="h-5 w-5 text-red-600 fill-red-50" />;
      case 'Caution': return <AlertTriangle className="h-5 w-5 text-amber-600 fill-amber-50" />;
      default: return <MinusCircle className="h-5 w-5 text-blue-600 fill-blue-50" />;
    }
  };

  const filtered = citations.filter(c => activeTab === 'all' || c.treatment.toLowerCase() === activeTab);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Authority Check</h2>
          <p className="text-sm text-slate-500">Validating legal precedent integrity.</p>
        </div>
        <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100">
                <XCircle size={12}/> 2 Overruled
            </span>
             <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                <AlertTriangle size={12}/> 1 Caution
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title="Citing References">
             <div className="flex gap-2 mb-4 border-b border-slate-100 pb-2">
                {['all', 'negative', 'positive'].map(t => (
                    <button 
                        key={t}
                        onClick={() => setActiveTab(t as any)}
                        className={`text-xs font-bold px-3 py-1 rounded-full capitalize transition-colors ${activeTab === t ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {t}
                    </button>
                ))}
             </div>
             <div className="space-y-3">
                 {filtered.map(c => (
                     <div key={c.id} className="flex items-start gap-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                         <div className="mt-1">{getSignalIcon(c.treatment)}</div>
                         <div className="flex-1">
                             <div className="flex justify-between items-start">
                                 <h4 className="font-bold text-sm text-blue-700 group-hover:underline">{c.caseName}</h4>
                                 <span className="text-[10px] text-slate-400 font-mono">{c.date} • {c.court}</span>
                             </div>
                             <p className="text-xs text-slate-600 font-medium mb-1">{c.citation}</p>
                             <p className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-2">{c.analysis}</p>
                         </div>
                         <ArrowUpRight size={14} className="text-slate-300 group-hover:text-blue-500"/>
                     </div>
                 ))}
             </div>
          </Card>

          <div className="space-y-6">
              <Card title="Depth of Treatment">
                  <div className="space-y-4">
                      <div>
                          <div className="flex justify-between text-xs mb-1"><span>Followed By</span> <span className="font-bold">45</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="w-[45%] bg-green-500 h-full rounded-full"></div></div>
                      </div>
                      <div>
                          <div className="flex justify-between text-xs mb-1"><span>Distinguished By</span> <span className="font-bold">12</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="w-[20%] bg-amber-500 h-full rounded-full"></div></div>
                      </div>
                       <div>
                          <div className="flex justify-between text-xs mb-1"><span>Criticized By</span> <span className="font-bold">5</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="w-[10%] bg-red-500 h-full rounded-full"></div></div>
                      </div>
                  </div>
              </Card>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center"><FileText size={14} className="mr-2"/> Table of Authorities</h4>
                  <p className="text-xs text-blue-800 mb-3">Generate a formatted TOA for your brief based on these citations.</p>
                  <button className="w-full py-2 bg-white text-blue-600 border border-blue-200 rounded text-xs font-bold hover:bg-blue-50">Generate TOA</button>
              </div>
          </div>
      </div>
    </div>
  );
};
