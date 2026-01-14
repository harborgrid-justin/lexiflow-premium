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
import { Plus, Scale, Shield, Target } from 'lucide-react';
import { useEffect, useState } from 'react';

// Internal Dependencies - Components
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Input } from '@/shared/ui/atoms/Input/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea/TextArea';
import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { StrategySection } from './strategy/StrategySection';

// Internal Dependencies - Hooks & Context
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import { useCaseStrategy } from '@/routes/cases/_hooks/useCaseStrategy';
import { useTheme } from '@/theme';

// Internal Dependencies - Services & Utils
import { cn } from '@/shared/lib/cn';
// import { queryKeys } from '@/utils/queryKeys';

// Types & Interfaces
import { Citation, Defense, EvidenceItem, LegalArgument } from '@/types';

interface CaseStrategyProps {
  caseId: string;
  citations?: Citation[];
  arguments?: LegalArgument[];
  defenses?: Defense[];
  evidence?: EvidenceItem[];
}

export const CaseStrategy: React.FC<CaseStrategyProps> = ({
  caseId,
  citations: initialCitations = [],
  arguments: initialArgs = [],
  defenses: initialDefenses = [],
  evidence = []
}) => {
  const { theme } = useTheme();
  const { success, error: notifyError } = useNotify();
  const [citations, setCitations] = useState(initialCitations);
  const [args, setArgs] = useState(initialArgs);
  const [defenses, setDefenses] = useState(initialDefenses);

  // Fetch strategy data
  const { strategyData, saveStrategyItem, deleteStrategyItem, isSaving } = useCaseStrategy(caseId);

  useEffect(() => {
    if (strategyData) {
      const data = strategyData as { arguments?: LegalArgument[]; defenses?: Defense[]; citations?: Citation[] };
      if (data.arguments) setArgs(data.arguments);
      if (data.defenses) setDefenses(data.defenses);
      if (data.citations) setCitations(data.citations);
    }
  }, [strategyData]);

  const strategyModal = useModalState();
  const [modalType, setModalType] = useState<'Citation' | 'Argument' | 'Defense'>('Citation');
  const [newItem, setNewItem] = useState<Partial<Citation | LegalArgument | Defense>>({});
  const [editingItem, setEditingItem] = useState<Citation | LegalArgument | Defense | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null);



  const handleSave = () => {
    const id = editingItem?.id || crypto.randomUUID();
    let itemToSave: Citation | LegalArgument | Defense;

    if (modalType === 'Citation') {
      const citationItem = newItem as Partial<Citation>;
      if (!citationItem.title && !citationItem.citation) {
        notifyError('Title/Citation is required');
        return;
      }
      itemToSave = {
        ...citationItem,
        id,
        citation: citationItem.citation || citationItem.title || '',
        relevance: citationItem.relevance || 'Medium' as const
      } as Citation;
      if (editingItem) {
        setCitations(citations.map(c => c.id === id ? itemToSave as Citation : c));
      } else {
        setCitations([...citations, itemToSave as Citation]);
      }
    } else if (modalType === 'Argument') {
      const argItem = newItem as Partial<LegalArgument>;
      if (!argItem.title) {
        notifyError('Title is required');
        return;
      }
      itemToSave = {
        ...argItem,
        id,
        title: argItem.title,
        strength: argItem.strength || 50,
        status: argItem.status || 'Draft' as const,
        relatedCitationIds: argItem.relatedCitationIds || [],
        relatedEvidenceIds: argItem.relatedEvidenceIds || []
      } as LegalArgument;
      if (editingItem) {
        setArgs(args.map(a => a.id === id ? itemToSave as LegalArgument : a));
      } else {
        setArgs([...args, itemToSave as LegalArgument]);
      }
    } else {
      const defenseItem = newItem as Partial<Defense>;
      if (!defenseItem.title) {
        notifyError('Title is required');
        return;
      }
      itemToSave = {
        ...defenseItem,
        id,
        title: defenseItem.title,
        status: defenseItem.status || 'Asserted' as const,
        type: defenseItem.type || 'Affirmative'
      } as Defense;
      if (editingItem) {
        setDefenses(defenses.map(d => d.id === id ? itemToSave as Defense : d));
      } else {
        setDefenses([...defenses, itemToSave as Defense]);
      }
    }

    // Persist to DataService
    saveStrategyItem({
      type: modalType,
      item: itemToSave,
      isEditing: !!editingItem
    }, {
      onSuccess: () => {
        success(`${modalType} ${editingItem ? 'updated' : 'saved'} successfully`);
      },
      onError: (error: Error) => {
        notifyError(`Failed to save: ${error.message}`);
      }
    });

    strategyModal.close();
    setNewItem({});
    setEditingItem(null);
  };

  const handleEdit = (type: 'Citation' | 'Argument' | 'Defense', item: Citation | LegalArgument | Defense) => {
    setModalType(type);
    setEditingItem(item);
    setNewItem(item);
    strategyModal.open();
  };

  const handleDelete = (type: 'Citation' | 'Argument' | 'Defense', id: string) => {
    setItemToDelete({ type, id });
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteStrategyItem(itemToDelete, {
        onSuccess: (data: { type: string; id: string }) => {
          success(`${data.type} deleted successfully`);

          // Update local state
          if (data.type === 'Citation') {
            setCitations(citations.filter(c => c.id !== data.id));
          } else if (data.type === 'Argument') {
            setArgs(args.filter(a => a.id !== data.id));
          } else {
            setDefenses(defenses.filter(d => d.id !== data.id));
          }

          setIsDeleteConfirmOpen(false);
          setItemToDelete(null);
        },
        onError: (error: Error) => {
          notifyError(`Failed to delete: ${error.message}`);
        }
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={cn("text-xl font-bold", theme.text.primary)}>Legal Strategy & Authority</h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage case law, affirmative arguments, and defenses.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setModalType('Citation'); strategyModal.open(); }} icon={Plus}>Citation</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalType('Argument'); strategyModal.open(); }} icon={Plus}>Argument</Button>
          <Button variant="outline" size="sm" onClick={() => { setModalType('Defense'); strategyModal.open(); }} icon={Plus}>Defense</Button>
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
          onEdit={(item) => handleEdit('Argument', item)}
          onDelete={(id) => handleDelete('Argument', id)}
        />
        <StrategySection
          title="Defenses"
          items={defenses}
          type="Defense"
          icon={Shield}
          colorClass={theme.status.warning.text}
          onEdit={(item) => handleEdit('Defense', item)}
          onDelete={(id) => handleDelete('Defense', id)}
        />
        <StrategySection
          title="Authority"
          items={citations}
          type="Citation"
          icon={Scale}
          colorClass={theme.action.primary.text}
          onEdit={(item) => handleEdit('Citation', item)}
          onDelete={(id) => handleDelete('Citation', id)}
        />
      </div>

      <Modal isOpen={strategyModal.isOpen} onClose={() => { strategyModal.close(); setEditingItem(null); setNewItem({}); }} title={`${editingItem ? 'Edit' : 'Add'} ${modalType}`}>
        <div className="p-6 space-y-4">
          <Input label="Title / Citation" placeholder={modalType === 'Citation' ? 'e.g. 123 U.S. 456' : 'Title'} value={newItem.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewItem({ ...newItem, title: e.target.value, citation: e.target.value })} />

          {modalType === 'Defense' && (
            <div>
              <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Type</label>
              <select className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewItem({ ...newItem, type: e.target.value })} aria-label="Defense Type">
                <option value="Affirmative">Affirmative</option>
                <option value="Procedural">Procedural</option>
                <option value="Factual">Factual</option>
              </select>
            </div>
          )}

          <TextArea label="Description" rows={4} value={newItem.description || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewItem({ ...newItem, description: e.target.value })} />

          <div className={cn("flex justify-end gap-2 pt-4 border-t", theme.border.default)}>
            <Button variant="ghost" onClick={() => { strategyModal.close(); setEditingItem(null); setNewItem({}); }}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : `${editingItem ? 'Update' : 'Save'} ${modalType}`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Delete">
        <div className="p-6">
          <p className={cn("text-sm mb-6", theme.text.primary)}>
            Are you sure you want to delete this {itemToDelete?.type?.toLowerCase()}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 border-transparent">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
