/**
 * MotionModal.tsx
 * 
 * Motion creation/editing modal with rule selector, document linking,
 * and AI-assisted brief generation.
 * 
 * @module components/case-detail/motions/MotionModal
 * @category Case Management - Motions
 */

// External Dependencies
import React, { useState, useEffect } from 'react';
import { Wand2, ArrowRight, CheckSquare, Clock } from 'lucide-react';

// Internal Dependencies - Components
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { Button } from '../../common/Button';
import { RuleSelector } from '../../common/RuleSelector';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../../utils/cn';

// Types & Interfaces
import { Motion, MotionType, LegalDocument, MotionId, CaseId } from '../../../types';

interface MotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (motion: Partial<Motion>) => void;
  documents: LegalDocument[];
  initialMotion: Partial<Motion>;
  isOrbital?: boolean;
}

export const MotionModal: React.FC<MotionModalProps> = ({ isOpen, onClose, onSave, documents, initialMotion, isOrbital }) => {
  const { theme } = useTheme();
  const [newMotion, setNewMotion] = useState<Partial<Motion>>(initialMotion);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setNewMotion(initialMotion);
  }, [initialMotion]);

  // Auto-calculate deadlines
  useEffect(() => {
    if (newMotion.hearingDate) {
      const hearing = new Date(newMotion.hearingDate);
      if (!isNaN(hearing.getTime())) {
        const opp = new Date(hearing);
        opp.setDate(hearing.getDate() - 14);
        const reply = new Date(hearing);
        reply.setDate(hearing.getDate() - 7);
        
        setNewMotion(prev => ({
          ...prev,
          oppositionDueDate: opp.toISOString().split('T')[0],
          replyDueDate: reply.toISOString().split('T')[0]
        }));
      }
    }
  }, [newMotion.hearingDate]);

  const handleGenerateStrategy = async () => {
    if (!newMotion.title) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, DEBUG_API_SIMULATION_DELAY_MS + 500));
    alert(`AI Strategy Generated for ${newMotion.title}`);
    setIsGenerating(false);
  };

  const handleToggleDoc = (docId: string) => {
    const currentDocs = newMotion.documents || [];
    if (currentDocs.includes(docId)) {
        setNewMotion({ ...newMotion, documents: currentDocs.filter(d => d !== docId) });
    } else {
        setNewMotion({ ...newMotion, documents: [...currentDocs, docId] });
    }
  };

  const content = (
      <div className={cn("p-6 space-y-4 h-full overflow-y-auto", theme.surface.default)}>
        <div>
          <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Motion Type</label>
          <select 
            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
            value={newMotion.type}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMotion({...newMotion, type: e.target.value as MotionType})}
            aria-label="Motion Type"
          >
            <option value="Dismiss">Motion to Dismiss</option>
            <option value="Summary Judgment">Summary Judgment</option>
            <option value="Compel Discovery">Compel Discovery</option>
            <option value="In Limine">Motion In Limine</option>
            <option value="Continuance">Motion for Continuance</option>
          </select>
        </div>
        
        <Input 
          label="Title" 
          placeholder="e.g. Motion to Dismiss Count III"
          value={newMotion.title || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMotion({...newMotion, title: e.target.value})}
        />

        <div>
          <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Hearing Date (Optional)</label>
          <input 
            type="date"
            className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
            value={newMotion.hearingDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMotion({...newMotion, hearingDate: e.target.value})}
            aria-label="Hearing Date"
          />
          {newMotion.hearingDate && (
            <div className={cn("mt-2 text-xs flex items-center gap-4 p-2 rounded border", theme.text.link, theme.surface.highlight, theme.border.default)}>
              <span><Clock className="h-3 w-3 inline mr-1"/> Opp: {newMotion.oppositionDueDate}</span>
              <span><Clock className="h-3 w-3 inline mr-1"/> Reply: {newMotion.replyDueDate}</span>
            </div>
          )}
        </div>

        <div>
          <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Governing Rules</label>
          <RuleSelector 
            selectedRules={newMotion.linkedRules || []}
            onRulesChange={(rules) => setNewMotion({...newMotion, linkedRules: rules})}
          />
        </div>

        <div>
            <label className={cn("block text-xs font-semibold uppercase mb-2", theme.text.secondary)}>Link Exhibits / Documents</label>
            <div className={cn("border rounded-md p-2 max-h-32 overflow-y-auto", theme.surface.highlight, theme.border.default)}>
                {documents.map(doc => (
                    <div key={doc.id} className={cn("flex items-center p-1 rounded cursor-pointer", `hover:${theme.surface.default}`)} onClick={() => handleToggleDoc(doc.id)}>
                        <div className={cn("w-4 h-4 mr-2 border rounded flex items-center justify-center", newMotion.documents?.includes(doc.id) ? cn(theme.action.primary.bg, theme.action.primary.border) : 'bg-white border-slate-300')}>
                            {newMotion.documents?.includes(doc.id) && <CheckSquare className="h-3 w-3 text-white"/>}
                        </div>
                        <span className={cn("text-xs truncate", theme.text.primary)}>{doc.title}</span>
                    </div>
                ))}
                {documents.length === 0 && <p className={cn("text-xs italic", theme.text.tertiary)}>No case documents available.</p>}
            </div>
        </div>

        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg flex items-start gap-3">
          <Wand2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5"/>
          <div>
            <h4 className="text-sm font-bold text-indigo-900">AI Strategy Assistance</h4>
            <p className="text-xs text-indigo-700 mt-1 mb-2">Analyze case facts and local rules to suggest arguments.</p>
            <button 
              onClick={handleGenerateStrategy}
              disabled={isGenerating || !newMotion.title}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? 'Analyzing...' : 'Generate Arguments'}
            </button>
          </div>
        </div>

        <div className={cn("pt-4 flex justify-end gap-3 border-t mt-2", theme.border.default)}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(newMotion)} icon={ArrowRight}>Create Draft</Button>
        </div>
      </div>
  );

  if (isOrbital) return content;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Draft New Motion">
        {content}
    </Modal>
  );
};