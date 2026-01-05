
import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Button } from '../common/Button.tsx';
import { Input, TextArea } from '../common/Inputs.tsx';
import { DocketEntry, DocketEntryType } from '../../types.ts';
import { MOCK_CASES } from '../../data/mockCases.ts';

interface DocketEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry?: DocketEntry | null;
  onSave: (entry: DocketEntry) => void;
}

export const DocketEntryModal: React.FC<DocketEntryModalProps> = ({ isOpen, onClose, entry, onSave }) => {
  const [formData, setFormData] = useState<Partial<DocketEntry>>({
    type: 'Filing',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    caseId: MOCK_CASES[0]?.id || '',
    sequenceNumber: 0,
    filedBy: 'Plaintiff',
    isSealed: false
  });

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    } else {
      setFormData({
        type: 'Filing',
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        caseId: MOCK_CASES[0]?.id || '',
        sequenceNumber: Math.floor(Math.random() * 100) + 1,
        filedBy: 'Plaintiff',
        isSealed: false
      });
    }
  }, [entry, isOpen]);

  const handleSubmit = () => {
    if (!formData.title || !formData.caseId) return;
    
    const newEntry = {
        ...formData,
        id: entry?.id || `dk-${Date.now()}`
    } as DocketEntry;

    onSave(newEntry);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={entry ? `Edit Entry #${entry.sequenceNumber}` : "New Docket Entry"}
      size="md"
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Related Case</label>
                <select 
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                    value={formData.caseId}
                    onChange={e => setFormData({...formData, caseId: e.target.value})}
                >
                    {MOCK_CASES.map(c => (
                        <option key={c.id} value={c.id}>{c.id} - {c.title.substring(0, 20)}...</option>
                    ))}
                </select>
            </div>
            <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Entry Type</label>
                 <select 
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as DocketEntryType})}
                >
                    <option value="Filing">Filing</option>
                    <option value="Order">Order</option>
                    <option value="Minute Entry">Minute Entry</option>
                    <option value="Notice">Notice</option>
                    <option value="Exhibit">Exhibit</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <Input label="Date Filed" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            <Input label="Sequence #" type="number" value={formData.sequenceNumber} onChange={e => setFormData({...formData, sequenceNumber: parseInt(e.target.value)})} />
             <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Filed By</label>
                 <select 
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                    value={formData.filedBy}
                    onChange={e => setFormData({...formData, filedBy: e.target.value})}
                >
                    <option value="Plaintiff">Plaintiff</option>
                    <option value="Defendant">Defendant</option>
                    <option value="Court">Court</option>
                    <option value="Third Party">Third Party</option>
                </select>
            </div>
        </div>

        <Input label="Title" placeholder="e.g. MOTION to Compel Discovery" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        
        <TextArea label="Description / Text" rows={4} placeholder="Full text of the docket entry..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

        <div className="flex items-center gap-2 pt-2">
            <input 
                type="checkbox" 
                id="sealed" 
                className="rounded text-blue-600"
                checked={formData.isSealed}
                onChange={e => setFormData({...formData, isSealed: e.target.checked})}
            />
            <label htmlFor="sealed" className="text-sm text-slate-700 font-medium">File Under Seal</label>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Save Entry</Button>
        </div>
      </div>
    </Modal>
  );
};
