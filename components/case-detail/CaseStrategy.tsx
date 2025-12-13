/**
 * CaseStrategy.tsx
 * 
 * Legal strategy management with arguments, defenses, citations, and supporting evidence.
 * Tabbed interface for organizing strategic elements.
 * 
 * @module components/case-detail/CaseStrategy
 * @category Case Management - Legal Strategy
 */

// External Dependencies
import React, { useState } from 'react';
import { Target, Shield, Plus, Scale } from 'lucide-react';

// Internal Dependencies - Components
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';
import { StrategySection } from './strategy/StrategySection';

// Internal Dependencies - Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Internal Dependencies - Services & Utils
import { cn } from '../../utils/cn';

// Types & Interfaces
import { Citation, LegalArgument, Defense, EvidenceItem } from '../../types';

interface CaseStrategyProps {
  citations?: Citation[];
  arguments?: LegalArgument[];
  defenses?: Defense[];
  evidence?: EvidenceItem[];
}

export const CaseStrategy: React.FC<CaseStrategyProps> = ({ 
  citations: initialCitations = [], 
  arguments: initialArgs = [], 
  defenses: initialDefenses = [],
  evidence = []
}) => {
  const { theme } = useTheme();
  const [citations, setCitations] = useState(initialCitations);
  const [args, setArgs] = useState(initialArgs);
  const [defenses, setDefenses] = useState(initialDefenses);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Citation' | 'Argument' | 'Defense'>('Citation');
  const [newItem, setNewItem] = useState<any>({});

  const handleSave = () => {
    const id = `${Date.now()}`;
    if (modalType === 'Citation') {
      setCitations([...citations, { ...newItem, id, relevance: 'Medium' }]);
    } else if (modalType === 'Argument') {
      setArgs([...args, { ...newItem, id, strength: 50, status: 'Draft', relatedCitationIds: [], relatedEvidenceIds: [] }]);
    } else {
      setDefenses([...defenses, { ...newItem, id, status: 'Asserted' }]);
    }
    setIsModalOpen(false);
    setNewItem({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn("text-xl font-bold", theme.text.primary)}>Legal Strategy & Authority</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage case law, affirmative arguments, and defenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setModalType('Citation'); setIsModalOpen(true); }} icon={Plus}>Citation</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalType('Argument'); setIsModalOpen(true); }} icon={Plus}>Argument</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalType('Defense'); setIsModalOpen(true); }} icon={Plus}>Defense</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StrategySection 
            title="Arguments" 
            items={args} 
            type="Argument" 
            icon={Target} 
            colorClass={theme.text.link}
            evidence={evidence}
            citations={citations}
        />
        <StrategySection 
            title="Defenses" 
            items={defenses} 
            type="Defense" 
            icon={Shield} 
            colorClass={theme.status.warning.text}
        />
        <StrategySection 
            title="Authority" 
            items={citations} 
            type="Citation" 
            icon={Scale} 
            colorClass={theme.action.primary.text}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Add ${modalType}`}>
        <div className="p-6 space-y-4">
            <Input label="Title / Citation" placeholder={modalType === 'Citation' ? 'e.g. 123 U.S. 456' : 'Title'} value={newItem.title || ''} onChange={e => setNewItem({...newItem, title: e.target.value, citation: e.target.value})} />
            
            {modalType === 'Defense' && (
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
                    <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)} onChange={e => setNewItem({...newItem, type: e.target.value})}>
                        <option value="Affirmative">Affirmative</option>
                        <option value="Procedural">Procedural</option>
                        <option value="Factual">Factual</option>
                    </select>
                </div>
            )}

            <TextArea label="Description" rows={4} value={newItem.description || ''} onChange={e => setNewItem({...newItem, description: e.target.value})} />
            
            <div className={cn("flex justify-end pt-4 border-t", theme.border.default)}>
                <Button variant="primary" onClick={handleSave}>Save {modalType}</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
