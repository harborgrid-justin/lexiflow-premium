import { Button } from '@/components/ui/atoms/Button/Button';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  item: Record<string, unknown>;
  onSave: (item: Record<string, unknown>) => void;
}

export const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, title, item, onSave }) => {
  const [formData, setFormData] = useState<Record<string, unknown>>(() => ({ ...item }));

  const renderFormFields = () => {
    if (!formData) return null;
    return Object.keys(formData).map(key => {
      // Filter out internal or complex array/object fields for this simple editor
      if (key === 'id' || key === 'parties' || key === 'versions' || key === 'matters' || typeof formData[key] === 'object') return null;

      return (
        <div key={key} className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{key}</label>
          <input
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={String(formData[key] || '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [key]: e.target.value })}
          />
        </div>
      );
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-1 max-h-[60vh] overflow-y-auto">
          {renderFormFields()}
        </div>
        <div className="pt-4 flex justify-end gap-3 border-t mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon={Save} onClick={() => onSave(formData)}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};
