
import React, { useTransition } from 'react';
import { Briefcase, Users, Calendar, FileText, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button.tsx';

interface ParsedDocketPreviewProps {
  parsedData: any;
  setStep: (step: number) => void;
  handleFinish: () => void;
}

export const ParsedDocketPreview: React.FC<ParsedDocketPreviewProps> = ({ parsedData, setStep, handleFinish }) => {
  const [isPending, startTransition] = useTransition();

  const handleFinishWrapper = () => {
      startTransition(() => {
          handleFinish();
      });
  };

  return (
    <div className={`space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full"><Briefcase className="h-6 w-6 text-blue-600"/></div>
            <div>
            <h4 className="font-bold text-lg text-blue-900">{parsedData.caseInfo?.title || 'Unknown Case'}</h4>
            <div className="flex flex-wrap gap-4 text-xs text-blue-700 mt-1">
                <span className="font-mono bg-blue-100 px-1 rounded">{parsedData.caseInfo?.id || parsedData.caseInfo?.caseNumber}</span>
                <span>{parsedData.caseInfo?.court}</span>
                {parsedData.caseInfo?.judge && <span>Judge: {parsedData.caseInfo?.judge}</span>}
                <span className="bg-white border px-1 rounded">{parsedData.caseInfo?.matterType}</span>
            </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center">
                <Users className="h-4 w-4 mr-2 text-slate-500"/>
                <span className="font-bold text-xs uppercase text-slate-600">Parties Found ({parsedData.parties?.length || 0})</span>
            </div>
            <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                {parsedData.parties?.map((p: any, i: number) => (
                <div key={i} className="flex flex-col text-sm p-2 bg-white rounded border border-slate-100">
                    <div className="flex justify-between">
                        <span className="font-medium text-slate-900">{p.name}</span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">{p.role}</span>
                    </div>
                    {p.counsel && <span className="text-xs text-slate-400 mt-1">Counsel: {p.counsel}</span>}
                </div>
                ))}
            </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-slate-500"/>
                <span className="font-bold text-xs uppercase text-slate-600">Events / Deadlines ({parsedData.deadlines?.length || 0})</span>
            </div>
            <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                {parsedData.deadlines?.length > 0 ? parsedData.deadlines.map((d: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-slate-100">
                    <span className="text-red-600 font-medium">{d.date}</span>
                    <span className="text-xs text-slate-600">{d.title}</span>
                </div>
                )) : <div className="p-4 text-center text-xs text-slate-400">No deadlines extracted.</div>}
            </div>
            </div>
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-slate-500"/>
                <span className="font-bold text-xs uppercase text-slate-600">Recent Docket Entries ({parsedData.docketEntries?.length || 0})</span>
            </div>
            <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                {parsedData.docketEntries?.slice().reverse().slice(0, 8).map((e: any, i: number) => (
                <div key={i} className="text-sm p-2 bg-white rounded border border-slate-100 group">
                    <div className="flex gap-2 mb-1 justify-between">
                        <div className="flex gap-2">
                            <span className="font-mono text-xs bg-slate-100 px-1 rounded text-slate-500">#{e.sequenceNumber || e.entryNumber}</span>
                            <span className="text-xs font-medium text-slate-900">{e.date}</span>
                            <span className={`text-[10px] px-1 rounded border ${e.type === 'Order' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500'}`}>{e.type}</span>
                        </div>
                        {e.docLink && <ExternalLink className="h-3 w-3 text-blue-400 opacity-50 group-hover:opacity-100"/>}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{e.description}</p>
                </div>
                ))}
                {(parsedData.docketEntries?.length || 0) > 8 && (
                <p className="text-xs text-center text-slate-400 italic pt-2">...and {parsedData.docketEntries.length - 8} earlier entries</p>
                )}
            </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button variant="primary" icon={CheckCircle} onClick={handleFinishWrapper} isLoading={isPending}>Create Case & Import All</Button>
        </div>
    </div>
  );
};
