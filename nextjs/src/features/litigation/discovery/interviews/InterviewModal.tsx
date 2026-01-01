import React, { useState } from 'react';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';
import { Button } from '@/components/ui/atoms/Button';
import { CustodianInterview } from '@/types';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interview: Partial<CustodianInterview>) => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({ isOpen, onClose, onSave }) => {
  const [interview, setInterview] = useState<Partial<CustodianInterview>>({});

  const handleSave = () => {
    onSave(interview);
    setInterview({}); // Reset after save
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Interview">
      <div className="p-6 space-y-4">
        <Input
          label="Custodian Name"
          value={interview.custodianName || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterview({...interview, custodianName: e.target.value})}
          placeholder="e.g. John Doe"
        />
        <Input
          label="Department"
          value={interview.department || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterview({...interview, department: e.target.value})}
          placeholder="e.g. Engineering"
        />
        <Input
          label="Date"
          type="date"
          value={interview.interviewDate || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterview({...interview, interviewDate: e.target.value})}
        />
        <TextArea
          label="Notes / Agenda"
          value={interview.notes || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInterview({...interview, notes: e.target.value})}
          placeholder="Topics to discuss..."
        />
        <div className="flex justify-end pt-4">
          <Button variant="primary" onClick={handleSave}>Save Schedule</Button>
        </div>
      </div>
    </Modal>
  );
};

export default InterviewModal;
