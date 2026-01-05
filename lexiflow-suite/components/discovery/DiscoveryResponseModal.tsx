
import React, { useState, useTransition } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Button } from '../common/Button.tsx';
import { Badge } from '../common/Badge.tsx';
import { Wand2 } from 'lucide-react';
import { DiscoveryRequest } from '../../types.ts';
import { GeminiService } from '../../services/geminiService.ts';

interface DiscoveryResponseModalProps {
  request: DiscoveryRequest | null;
  onClose: () => void;
}

export const DiscoveryResponseModal: React.FC<DiscoveryResponseModalProps> = ({ request, onClose }) => {
  const [draftResponse, setDraftResponse] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  
  // Guideline 3: Transition for AI result rendering
  const [isPending, startTransition] = useTransition();

  const handleGenerateResponse = async () => {
    if (!request) return;
    setIsDrafting(true);
    const draft = await GeminiService.generateDraft(
      `Draft a legal response to this discovery request pursuant to FRCP 34/33: "${request.title}: ${request.description}". 
      Include standard objections (overly broad, undue burden, vague/ambiguous). 
      Format as a formal legal pleading.`,
      'Discovery Response'
    );
    startTransition(() => {
        setDraftResponse(draft);
        setIsDrafting(false);
    });
  };

  const initialDraft = 'Click "Regenerate" to create a legally formatted response with standard objections.';

  return (
    <Modal 
      isOpen={!!request} 
      onClose={onClose} 
      title={`Drafting Response: ${request?.id}`}
      size="lg"
    >
      <div className={`p-6 space-y-6 transition-opacity duration-200 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">{request?.title}</h4>
              <p className="text-sm text-slate-700 mb-2">{request?.description}</p>
            </div>
            <Badge variant="neutral">{request?.type}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mt-2">
            <div><strong>Propounding:</strong> {request?.propoundingParty}</div>
            <div><strong>Responding:</strong> {request?.respondingParty}</div>
          </div>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-purple-600"/> AI Draft (FRCP Compliant)
              </h4>
              <Button size="sm" variant="outline" onClick={handleGenerateResponse} disabled={isDrafting}>
                  {isDrafting ? 'Generating...' : 'Regenerate'}
              </Button>
           </div>
           <div className="relative">
             <textarea 
                className="w-full h-64 p-4 border rounded-lg bg-white text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={draftResponse || initialDraft}
                onChange={(e) => setDraftResponse(e.target.value)}
             />
             {!draftResponse && !isDrafting && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <p className="text-slate-400 text-sm">AI Assistant Ready</p>
                </div>
             )}
           </div>
           <p className="text-xs text-slate-500">
             *This draft includes standard objections pursuant to Rule 33/34. Review for specific privilege claims before finalizing.
           </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
           <Button variant="secondary" onClick={onClose}>Discard</Button>
           <Button variant="primary" onClick={() => { alert('Response saved to Drafts.'); onClose(); }}>Save to Matter File</Button>
        </div>
      </div>
    </Modal>
  );
};
