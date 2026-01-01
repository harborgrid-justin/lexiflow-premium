import React, { useState } from 'react';
import { DiscoveryRequest } from '@/types';
import { Card } from '@/components/ui/molecules/Card/Card';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { AlertTriangle, Gavel, CheckSquare, MessageSquare, Wand2, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { sanitizeHtml } from '@/utils/sanitize';
import { GeminiService } from '@/services/features/research/geminiService';
import { useNotify } from '@/hooks/useNotify';
import { useMultiSelection } from '@/hooks/useMultiSelection';

interface MotionToCompelBuilderProps {
  requests: DiscoveryRequest[];
  onCancel: () => void;
}

export const MotionToCompelBuilder: React.FC<MotionToCompelBuilderProps> = ({ requests, onCancel }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const deficientRequests = requests.filter(r => r.status === 'Overdue' || r.status === 'Responded');
  const requestSelection = useMultiSelection<DiscoveryRequest>([], (a, b) => a.id === b.id);
  const [meetConferDate, setMeetConferDate] = useState('');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
      if (requestSelection.selected.length === 0 || !meetConferDate) {
          notify.error("Select at least one deficient request and enter meet & confer date.");
          return;
      }

      setIsGenerating(true);
      const selectedDetails = requestSelection.selected.map(r => `${r.id}: ${r.title} (${r.type})`).join('\n');

      const prompt = `Draft a Motion to Compel Discovery pursuant to FRCP Rule 37(a).
      The moving party certifies they have conferred in good faith with opposing counsel on ${meetConferDate} but were unable to obtain the disclosure/discovery without court action.

      Deficient Requests:
      ${selectedDetails}

      Structure:
      1. Certification of Meet and Confer (Rule 37(a)(1))
      2. Argument for Relevancy and Proportionality
      3. Failure to Respond/Insufficient Response
      4. Prayer for Relief (Order Compelling + Sanctions Rule 37(a)(5)(A))`;

      const result = await GeminiService.generateDraft(prompt, 'Motion to Compel');
      setDraft(result);
      setIsGenerating(false);
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
       <div className={cn("p-6 border-b flex justify-between items-center", theme.border.default)}>
           <div className="flex items-center gap-4">
                <Button variant="ghost" icon={ArrowLeft} onClick={onCancel}>Back</Button>
                <div>
                    <h3 className={cn("text-xl font-bold", theme.text.primary)}>Motion to Compel Builder</h3>
                    <p className={cn("text-sm", theme.text.secondary)}>FRCP Rule 37(a) Enforcement Workflow</p>
                </div>
           </div>
           <div className="flex gap-2">
               <div className={cn("flex items-center gap-2 px-3 py-1 rounded border text-xs font-bold", theme.status.error.bg, theme.status.error.text, theme.status.error.border)}>
                   <AlertTriangle className="h-4 w-4"/> Sanctions Available
               </div>
           </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
           {/* Left: Configuration */}
           <div className={cn("w-96 border-r p-6 overflow-y-auto space-y-6", theme.surface.highlight, theme.border.default)}>

               <Card title="1. Select Deficient Requests">
                   <div className="space-y-2 max-h-60 overflow-y-auto">
                       {deficientRequests.map(req => (
                           <div
                               key={req.id}
                               onClick={() => requestSelection.toggle(req)}
                               className={cn(
                                   "p-3 rounded border cursor-pointer transition-all",
                                   requestSelection.isSelected(req) ? cn(theme.status.error.bg, theme.status.error.border) : cn(theme.surface.default, theme.border.default)
                               )}
                           >
                               <div className="flex items-start gap-3">
                                   <div className={cn("mt-0.5", requestSelection.isSelected(req) ? theme.status.error.text : theme.text.tertiary)}>
                                       <CheckSquare className="h-4 w-4" />
                                   </div>
                                   <div>
                                       <p className={cn("text-xs font-bold", theme.text.primary)}>{req.title}</p>
                                       <div className="flex justify-between items-center mt-1">
                                           <span className="text-[10px] text-slate-500">{req.id}</span>
                                           <Badge variant={req.status === 'Overdue' ? 'error' : 'warning'}>{req.status}</Badge>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               </Card>

               <Card title="2. Meet & Confer Certification">
                   <div className="space-y-3">
                       <p className={cn("text-xs", theme.text.secondary)}>
                           Rule 37(a)(1) requires certification of good faith effort to resolve without court action.
                       </p>
                       <div className="space-y-1">
                           <label className={cn("text-xs font-bold", theme.text.primary)}>Conference Date</label>
                           <input
                               type="date"
                               title="Select meet and confer date"
                               className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                               value={meetConferDate}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMeetConferDate(e.target.value)}
                           />
                       </div>
                       <Button size="sm" variant="outline" icon={MessageSquare}>View Conferral Log</Button>
                   </div>
               </Card>

               <Button
                   variant="primary"
                   className={cn("w-full", theme.status.error.bg, theme.status.error.border, theme.status.error.text, `hover:${theme.status.error.bg}`)} // Red button for aggressive action
                   icon={isGenerating ? undefined : Wand2}
                   disabled={isGenerating}
                   onClick={handleGenerate}
               >
                   {isGenerating ? 'Drafting Motion...' : 'Generate Motion'}
               </Button>
           </div>

           {/* Right: Preview */}
           <div className={cn("flex-1 p-8 overflow-y-auto", theme.surface.highlight)}>
               {draft ? (
                   <div className={cn("max-w-3xl mx-auto shadow-lg p-10 min-h-[800px] border", theme.surface.default, theme.border.default)}>
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft) }} className={cn("prose max-w-none font-serif text-sm leading-loose", theme.text.primary)} />
                        <div className={cn("mt-8 pt-8 border-t flex justify-end gap-3", theme.border.default)}>
                            <Button variant="secondary">Save as Draft</Button>
                            <Button variant="primary" icon={Gavel}>File with Court</Button>
                        </div>
                   </div>
               ) : (
                   <div className={cn("flex flex-col items-center justify-center h-full", theme.text.tertiary)}>
                       <Gavel className="h-16 w-16 mb-4 opacity-20"/>
                       <p className="font-medium">Configure options to generate motion.</p>
                       <p className="text-sm mt-2 max-w-xs text-center">Ensures compliance with FRCP 37 requirements including certification of conferral.</p>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default MotionToCompelBuilder;
