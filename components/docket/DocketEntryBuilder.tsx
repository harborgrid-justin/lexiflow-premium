
import React, { useState, useEffect } from 'react';
import { DocketEntry, DocketEntryType, WorkflowTask, TaskId, CaseId } from '../../types';
import { Input, TextArea } from '../common/Inputs';
import { Button } from '../common/Button';
import { RuleSelector } from '../common/RuleSelector';
import { UserSelect } from '../common/UserSelect';
import { FileText, Save, CheckSquare } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { DataService } from '../../services/dataService';
import { useNotify } from '../../hooks/useNotify';

interface DocketEntryBuilderProps {
  initialData?: Partial<DocketEntry>;
  caseParties?: string[]; // Names of parties for dropdown
  onSave: (entry: Partial<DocketEntry>) => void;
  onCancel: () => void;
}

export const DocketEntryBuilder: React.FC<DocketEntryBuilderProps> = ({ 
  initialData, caseParties = [], onSave, onCancel 
}) => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Core Data
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [internalSeq, setInternalSeq] = useState(initialData?.sequenceNumber?.toString() || '');
  const [pacerSeq, setPacerSeq] = useState(initialData?.pacerSequenceNumber?.toString() || '');
  const [entryType, setEntryType] = useState<DocketEntryType>(initialData?.type as DocketEntryType || 'Filing');
  const [isSealed, setIsSealed] = useState(initialData?.isSealed || false);

  // Automation Options
  const [createReviewTask, setCreateReviewTask] = useState(false);

  // Structured Data Variables
  const [structActionType, setStructActionType] = useState(initialData?.structuredData?.actionType || 'Motion');
  const [structVerb, setStructVerb] = useState(initialData?.structuredData?.actionVerb || 'filed');
  const [structDocTitle, setStructDocTitle] = useState(initialData?.structuredData?.documentTitle || '');
  const [structFiler, setStructFiler] = useState(initialData?.structuredData?.filer || '');
  const [structAdditional, setStructAdditional] = useState(initialData?.structuredData?.additionalText || '');

  // Computed Full Description for Preview
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    // Construct the narrative
    let text = `${structActionType}`;
    
    if (structDocTitle) text += ` ${structDocTitle}`;
    if (structVerb) text += ` ${structVerb}`;
    if (structFiler) text += ` by ${structFiler}`;
    if (structAdditional) text += `. ${structAdditional}`;

    setPreviewText(text);
  }, [structActionType, structVerb, structDocTitle, structFiler, structAdditional]);

  const handleSave = async () => {
    const entry: Partial<DocketEntry> = {
      ...initialData,
      date,
      sequenceNumber: parseInt(internalSeq) || 0,
      pacerSequenceNumber: parseInt(pacerSeq) || undefined,
      type: entryType,
      isSealed,
      title: structDocTitle || structActionType, 
      description: previewText, 
      filedBy: structFiler,
      structuredData: {
        actionType: structActionType,
        actionVerb: structVerb,
        documentTitle: structDocTitle,
        filer: structFiler,
        additionalText: structAdditional
      }
    };

    // Auto-Create Task Logic
    if (createReviewTask && initialData?.caseId) {
        const task: WorkflowTask = {
            id: `t-${Date.now()}` as TaskId,
            title: `Review Docket Entry: ${entry.title}`,
            status: 'Pending',
            assignee: 'Current User',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 2 days
            priority: 'High',
            caseId: initialData.caseId as CaseId,
            description: `Review newly filed docket entry: ${previewText}`,
            relatedModule: 'Motions', // Assuming it relates to motion practice
            actionLabel: 'Open Docket'
        };
        await DataService.tasks.add(task);
        notify.success("Automated review task created.");
    }

    onSave(entry);
  };

  return (
    <div className="space-y-6">
      {/* 1. Meta Data */}
      <div className={cn("p-4 rounded-lg border", theme.surfaceHighlight, theme.border.default)}>
          <h4 className={cn("text-xs font-bold uppercase tracking-wide mb-3", theme.text.secondary)}>Entry Metadata</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Date Filed" type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Input label="Internal Seq #" type="number" value={internalSeq} onChange={e => setInternalSeq(e.target.value)} />
              <Input label="PACER Seq #" type="number" value={pacerSeq} onChange={e => setPacerSeq(e.target.value)} placeholder="Optional"/>
              <div>
                  <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                  <select 
                      className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
                      value={entryType}
                      onChange={(e) => setEntryType(e.target.value as DocketEntryType)}
                  >
                      <option value="Filing">Filing</option>
                      <option value="Order">Order</option>
                      <option value="Notice">Notice</option>
                      <option value="Minute Entry">Minute Entry</option>
                      <option value="Exhibit">Exhibit</option>
                  </select>
              </div>
          </div>
          <div className="mt-3 flex items-center">
             <input type="checkbox" id="sealed" className="rounded text-blue-600 mr-2" checked={isSealed} onChange={e => setIsSealed(e.target.checked)}/>
             <label htmlFor="sealed" className={cn("text-sm font-medium", theme.text.secondary)}>Seal this entry</label>
          </div>
      </div>

      {/* 2. Structured Builder */}
      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className={cn("text-xs font-bold uppercase tracking-wide", theme.text.secondary)}>Entry Construction</h4>
            <span className={cn("text-[10px] px-2 py-0.5 rounded border", theme.primary.light, theme.primary.text, theme.primary.border)}>Variable Mode</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                 <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Action Type</label>
                 <select 
                    className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
                    value={structActionType}
                    onChange={e => setStructActionType(e.target.value)}
                 >
                     <option>Motion</option>
                     <option>Order</option>
                     <option>Notice</option>
                     <option>Affidavit</option>
                     <option>Brief</option>
                     <option>Complaint</option>
                     <option>Answer</option>
                 </select>
             </div>
             <div>
                 <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Document Title / Target</label>
                 <Input 
                    value={structDocTitle} 
                    onChange={e => setStructDocTitle(e.target.value)}
                    placeholder="e.g. to Dismiss Count II"
                 />
             </div>
             <div>
                 <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Verb / Action</label>
                 <select 
                    className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
                    value={structVerb}
                    onChange={e => setStructVerb(e.target.value)}
                 >
                     <option value="filed">filed</option>
                     <option value="granting">granting</option>
                     <option value="denying">denying</option>
                     <option value="regarding">regarding</option>
                     <option value="in support of">in support of</option>
                     <option value="submitted">submitted</option>
                 </select>
             </div>
             <div>
                 <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Filing Party / Entity</label>
                 <div className="relative">
                    <input 
                        list="parties" 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface, theme.border.default, theme.text.primary)}
                        value={structFiler}
                        onChange={e => setStructFiler(e.target.value)}
                        placeholder="Select or type..."
                    />
                    <datalist id="parties">
                        <option value="Court" />
                        <option value="Plaintiff" />
                        <option value="Defendant" />
                        {caseParties.map((p, i) => <option key={i} value={p} />)}
                    </datalist>
                 </div>
             </div>
          </div>
          
          <div>
             <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Additional Text (Optional)</label>
             <TextArea 
                rows={2} 
                value={structAdditional} 
                onChange={e => setStructAdditional(e.target.value)} 
                placeholder="Details, exhibits attached, etc."
             />
          </div>
      </div>

      {/* 3. Preview */}
      <div className={cn("p-4 rounded-lg border-l-4 border-l-purple-500", theme.border.default, theme.surfaceHighlight)}>
          <h5 className={cn("text-xs font-bold mb-1 uppercase", theme.text.tertiary)}>Generated Docket Text</h5>
          <p className={cn("text-sm font-medium font-serif leading-relaxed", theme.text.primary)}>
              "{previewText}"
          </p>
      </div>

      <div className={cn("flex justify-between items-center pt-4 border-t", theme.border.light)}>
          <label className={cn("flex items-center text-sm cursor-pointer font-medium", theme.primary.text)}>
              <input 
                  type="checkbox" 
                  className="mr-2 rounded text-blue-600"
                  checked={createReviewTask}
                  onChange={(e) => setCreateReviewTask(e.target.checked)}
              />
              <CheckSquare className="h-4 w-4 mr-1"/> Auto-Create Review Task
          </label>
          <div className="flex gap-3">
              <Button variant="secondary" onClick={onCancel}>Cancel</Button>
              <Button variant="primary" icon={Save} onClick={handleSave}>Save Entry</Button>
          </div>
      </div>
    </div>
  );
};
