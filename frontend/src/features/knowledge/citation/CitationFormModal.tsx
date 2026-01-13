import { useState } from 'react';
import { useMutation, queryClient } from '@/hooks/useQueryHooks';
// import { BookOpen, AlertCircle } from 'lucide-react';

import { Modal } from '@/shared/ui/molecules/Modal/Modal';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Input } from '@/shared/ui/atoms/Input/Input';
// import { Badge } from '@/shared/ui/atoms/Badge';
import { DataService } from '@/services/data/dataService';
import { useNotify } from '@/hooks/useNotify';
import { Citation } from '@/types';

interface CitationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
}

export const CitationFormModal: React.FC<CitationFormModalProps> = ({ isOpen, onClose, caseId }) => {
  const notify = useNotify();
  const [citationText, setCitationText] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Citation['citationType']>('case_law');
  const [notes, setNotes] = useState('');

  const { mutate: createCitation, isLoading } = useMutation(
    async () => {
      return DataService.citations.create({
        citationText,
        title,
        citationType: type,
        caseId,
        notes,
        status: 'Draft', // Default status
        relevance: 'Medium', // Default relevance
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    },
    {
      onSuccess: () => {
        notify.success('Citation created successfully');
        queryClient.invalidate(['citations']);
        onClose();
        resetForm();
      },
      onError: (err) => {
        notify.error('Failed to create citation');
        console.error(err);
      },
      invalidateKeys: [['citations']]
    }
  );

  const resetForm = () => {
    setCitationText('');
    setTitle('');
    setType('case_law');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citationText) return;
    createCitation(formState);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Citation" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 p-1">
        <div>
          <label className="block text-sm font-medium mb-1">Citation *</label>
          <Input
            value={citationText}
            onChange={(e) => setCitationText(e.target.value)}
            placeholder="e.g., 547 U.S. 518"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Case Name or Statute Title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            className="w-full p-2 border rounded-md"
            value={type as string}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="case_law">Case Law</option>
            <option value="statute">Statute</option>
            <option value="regulation">Regulation</option>
            <option value="constitution">Constitution</option>
            <option value="treatise">Treatise</option>
            <option value="law_review">Law Review</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            className="w-full p-2 border rounded-md h-24"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes or analysis..."
          />
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!citationText}>
            Save Citation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
