import React, { useState } from 'react';
import { DiscoveryRequest } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AlertTriangle, Gavel, CheckSquare, MessageSquare, Wand2, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { GeminiService } from '../../services/geminiService';
import { useNotify } from '../../hooks/useNotify';

interface MotionToCompelBuilderProps {
  requests: DiscoveryRequest[];
  onCancel: () => void;
}

export const MotionToCompelBuilder: React.FC<MotionToCompelBuilderProps> = ({ requests, onCancel }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [meetConferDate, setMeetConferDate] = useState('');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const deficientRequests = requests.filter(r => r.status === 'Overdue' || r.status === 'Responded'); // Assuming Responded might be deficient

  const toggleRequest = (id: string) => {
      setSelectedRequests(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
      if (selectedRequests.length === 0 || !meetConferDate) {
          notify.error("Select at least one deficient request and enter meet & confer date.");
          return;
      }
      
      setIsGenerating(true);
      const selectedDetails = requests.filter(r => selectedRequests.includes(r.id)).map(r => `${r.id}: ${r.title} (${r.type})`).join('\n');
      
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
               <div className={cn("flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded border border-red-200 text-xs font-bold")}>
                   <AlertTriangle className="h-4 w-4"/> Sanctions Available
               </div>
           </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
           {/* Left: Configuration */}
           <div className={cn("w-96 border-r p-6 overflow-y-auto space-y-6", theme.surfaceHighlight, theme.border.default)}>
               
               <Card title="1. Select Deficient Requests">
                   <div className="space-y-2 max-h-60 overflow-y-auto">
                       {deficientRequests.map(req => (
                           <div 
                               key={req.id} 
                               onClick={() => toggleRequest(req.id)}
                               className={cn(
                                   "p-3 rounded border cursor-pointer transition-all",
                                   selectedRequests.includes(req.id) ? "bg-red-50 border-red-300" : cn(theme.surface, theme.border.default)
                               )}
                           >
                               <div className="flex items-start gap-3">
                                   <div className={cn("mt-0.5", selectedRequests.includes(req.id) ? "text-red-600" : "text-slate-300")}>
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
                               className={cn("w-full p-2 border rounded text-sm", theme.surface, theme.border.default)}
                               value={meetConferDate}
                               onChange={(e) => setMeetConferDate(e.target.value)}
                           />
                       </div>
                       <Button size="sm" variant="outline" icon={MessageSquare}>View Conferral Log</Button>
                   </div>
               </Card>

               <Button 
                   variant="primary" 
                   className="w-full bg-red-600 hover:bg-red-700 border-red-600 text-white" 
                   icon={isGenerating ? undefined : Wand2}
                   disabled={isGenerating}
                   onClick={handleGenerate}
               >
                   {isGenerating ? 'Drafting Motion...' : 'Generate Motion'}
               </Button>
           </div>

           {/* Right: Preview */}
           <div className={cn("flex-1 p-8 bg-slate-50 overflow-y-auto")}>
               {draft ? (
                   <div className="max-w-3xl mx-auto bg-white shadow-lg p-10 min-h-[800px] border border-slate-200">
                        <div dangerouslySetInnerHTML={{ __html: draft }} className={cn("prose max-w-none font-serif text-sm leading-loose", theme.text.primary)} />
                        <div className="mt-8 pt-8 border-t flex justify-end gap-3">
                            <Button variant="secondary">Save as Draft</Button>
                            <Button variant="primary" icon={Gavel}>File with Court</Button>
                        </div>
                   </div>
               ) : (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400">
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