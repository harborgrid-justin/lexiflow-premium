
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wand2, Save, FileText } from 'lucide-react';
import { Button } from '../common/Button';
import { DiscoveryRequest } from '../../types';
import { GeminiService } from '../../services/geminiService';
import { Badge } from '../common/Badge';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface DiscoveryResponseProps {
  request: DiscoveryRequest | null;
  onBack: () => void;
  onSave: (reqId: string, text: string) => void;
}

export const DiscoveryResponse: React.FC<DiscoveryResponseProps> = ({ request, onBack, onSave }) => {
  const { theme } = useTheme();
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
    <div className={cn("flex flex-col h-full rounded-lg shadow-sm border animate-fade-in", theme.surface, theme.border.default)}>
        <div className={cn("p-4 border-b flex justify-between items-center", theme.border.default, theme.surfaceHighlight)}>
            <div className="flex items-center">
                <button onClick={onBack} className={cn("mr-3 p-2 rounded-full transition-colors", theme.text.secondary, `hover:${theme.surface}`)}>
                    <ArrowLeft className="h-5 w-5"/>
                </button>
                <div>
                    <h2 className={cn("text-lg font-bold", theme.text.primary)}>Drafting Response</h2>
                    <p className={cn("text-xs", theme.text.secondary)}>Ref: {request.id} • {request.title}</p>
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
            <div className={cn("w-full md:w-1/3 border-r p-6 overflow-y-auto", theme.border.default, theme.surfaceHighlight)}>
                <div className="mb-4">
                    <Badge variant="neutral">{request.type}</Badge>
                </div>
                <h3 className={cn("font-bold mb-2", theme.text.primary)}>{request.title}</h3>
                <p className={cn("text-sm leading-relaxed mb-6 p-4 rounded border", theme.surface, theme.border.default, theme.text.secondary)}>
                    {request.description}
                </p>
                
                <div className={cn("space-y-4 text-xs", theme.text.secondary)}>
                    <div>
                        <span className={cn("font-bold block", theme.text.primary)}>Propounding Party</span>
                        {request.propoundingParty}
                    </div>
                    <div>
                        <span className={cn("font-bold block", theme.text.primary)}>Responding Party</span>
                        {request.respondingParty}
                    </div>
                    <div>
                        <span className={cn("font-bold block", theme.text.primary)}>Deadline</span>
                        {request.dueDate}
                    </div>
                </div>
                
                <div className={cn("mt-8 p-4 rounded border", theme.status.info.bg, theme.status.info.border)}>
                    <h4 className={cn("text-sm font-bold mb-2 flex items-center", theme.status.info.text)}><Wand2 className="h-3 w-3 mr-2"/> AI Insight</h4>
                    <p className={cn("text-xs", theme.status.info.text)}>
                        This request matches patterns often deemed "overly broad" in this jurisdiction. Consider objecting to the timeframe scope.
                    </p>
                </div>
            </div>

            {/* Right: Editor */}
            <div className="flex-1 flex flex-col relative">
                <textarea 
                    className={cn("flex-1 w-full p-8 font-serif text-base leading-relaxed outline-none resize-none", theme.surface, theme.text.primary)}
                    value={draftResponse}
                    onChange={(e) => setDraftResponse(e.target.value)}
                    placeholder="Draft your legal response here..."
                />
            </div>
        </div>
    </div>
  );
};
