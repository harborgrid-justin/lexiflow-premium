
import React, { useState } from 'react';
import { Modal } from '../../../components/molecules/Modal';
import { Button } from '../../../components/atoms/Button';
import { Input } from '../../../components/atoms';
import { StaffMember } from '../../../../types';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '@/utils/cn';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (staff: Partial<StaffMember>) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { theme } = useTheme();
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({});

  const handleSave = () => {
      if (!newStaff.name || !newStaff.email) return;
      onAdd(newStaff);
      setNewStaff({});
  };

  return (
      <Modal isOpen={isOpen} onClose={onClose} title="Add Staff Member">
          <div className="p-6 space-y-4">
              <Input label="Full Name" value={newStaff.name || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaff({...newStaff, name: e.target.value})} placeholder="e.g. John Doe"/>
              <Input label="Email" value={newStaff.email || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaff({...newStaff, email: e.target.value})} placeholder="email@firm.com"/>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Role</label>
                    <select 
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={newStaff.role}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStaff({...newStaff, role: e.target.value as any})}
                    >
                        <option value="Associate">Associate</option>
                        <option value="Paralegal">Paralegal</option>
                        <option value="Senior Partner">Senior Partner</option>
                        <option value="Administrator">Administrator</option>
                    </select>
                </div>
                <Input label="Phone" value={newStaff.phone || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaff({...newStaff, phone: e.target.value})}/>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Billable Target (Hrs)" type="number" value={newStaff.billableTarget || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaff({...newStaff, billableTarget: Number(e.target.value)})}/>
                <Input label="Salary" type="number" value={newStaff.salary || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewStaff({...newStaff, salary: Number(e.target.value)})}/>
              </div>

              <div className={cn("pt-4 flex justify-end gap-2 border-t mt-4", theme.border.default)}>
                  <Button variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave}>Create Profile</Button>
              </div>
          </div>
      </Modal>
  );
};
