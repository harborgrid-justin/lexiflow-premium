import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Save, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { DiscoveryRequest } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Badge } from '../common/Badge';

interface DiscoveryResponseProps {
  request: DiscoveryRequest | null;
  onBack: () => void;
  onSave: (reqId: string, text: string) => void;
}

export const DiscoveryResponse: React.FC<DiscoveryResponseProps> = ({ request, onBack, onSave }) => {
  const [draftResponse, setDraftResponse] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
      // Auto-generate draft on mount if empty
      if (request && !draftResponse) {
          handleGenerateResponse();
      }
  }, [request]);

  const handleGenerateResponse = async () => {
    if (!request) return;
    setIsDrafting(true);
    const draft = await GeminiService.generateDraft(
      `Draft a legal response to this discovery request pursuant to FRCP 34/33: "${request.title}: ${request.description}". 
      Include standard objections (overly broad, undue burden, vague/ambiguous). 
      Format as a formal legal pleading.`,
      'Discovery Response'
    );
    setDraftResponse(draft);
    setIsDrafting(false);
  };

  if (!request) return <div>No request selected.</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 animate-fade-in">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <div className="flex items-center">
                <button onClick={onBack} className="mr-3 p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                    <ArrowLeft className="h-5 w-5"/>
                </button>
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Drafting Response</h2>
                    <p className="text-xs text-slate-500">Ref: {request.id} • {request.title}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleGenerateResponse} disabled={isDrafting}>
                    {isDrafting ? 'AI Generating...' : 'Re-Generate AI Draft'}
                </Button>
                <Button size="sm" variant="primary" icon={Save} onClick={() => onSave(request.id, draftResponse)}>Save & Mark Responded</Button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left: Request Context */}
            <div className="w-full md:w-1/3 border-r border-slate-200 p-6 overflow-y-auto bg-slate-50/50">
                <div className="mb-4">
                    <Badge variant="neutral">{request.type}</Badge>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{request.title}</h3>
                <p className="text-sm text-slate-700 leading-relaxed mb-6 p-4 bg-white rounded border border-slate-200">
                    {request.description}
                </p>
                
                <div className="space-y-4 text-xs text-slate-500">
                    <div>
                        <span className="font-bold block text-slate-700">Propounding Party</span>
                        {request.propoundingParty}
                    </div>
                    <div>
                        <span className="font-bold block text-slate-700">Responding Party</span>
                        {request.respondingParty}
                    </div>
                    <div>
                        <span className="font-bold block text-slate-700">Deadline</span>
                        {request.dueDate}
                    </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center"><Wand2 className="h-3 w-3 mr-2"/> AI Insight</h4>
                    <p className="text-xs text-blue-700">
                        This request matches patterns often deemed "overly broad" in this jurisdiction. Consider objecting to the timeframe scope.
                    </p>
                </div>
            </div>

            {/* Right: Editor */}
            <div className="flex-1 flex flex-col relative">
                <textarea 
                    className="flex-1 w-full p-8 font-serif text-slate-800 text-base leading-relaxed outline-none resize-none"
                    value={draftResponse}
                    onChange={(e) => setDraftResponse(e.target.value)}
                    placeholder="Draft your legal response here..."
                />
            </div>
        </div>
    </div>
  );
};