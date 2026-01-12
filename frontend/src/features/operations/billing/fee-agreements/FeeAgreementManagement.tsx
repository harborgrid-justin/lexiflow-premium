import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button/Button';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Modal } from '@/shared/ui/molecules/Modal';
import { Input } from '@/shared/ui/atoms/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/ui/organisms/Table';
import { useNotify } from '@/hooks/useNotify';
import { useModalState } from '@/hooks/core';
import { useQuery } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
import { DataService } from '@/services/data/dataService';

interface FeeAgreement {
  id: string;
  caseId?: string;
  clientId: string;
  clientName: string;
  type: 'Hourly' | 'Contingency' | 'Flat Fee' | 'Retainer' | 'Hybrid';
  status: 'Draft' | 'Pending Signature' | 'Active' | 'Suspended' | 'Terminated';
  effectiveDate: string;
  terminationDate?: string;
  terms: string;
  hourlyRate?: number;
  contingencyPercent?: number;
  flatFeeAmount?: number;
  retainerAmount?: number;
  createdAt: string;
}

export const FeeAgreementManagement: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Fetch fee agreements from backend API
  const { data: agreements = [], refetch } = useQuery<FeeAgreement[]>(
    queryKeys.billing.feeAgreements?.() || ['billing', 'feeAgreements'],
    () => DataService.feeAgreements.getAll()
  );

  const createModal = useModalState();
  const editModal = useModalState();
  const deleteModal = useModalState();
  const [selectedAgreement, setSelectedAgreement] = useState<FeeAgreement | null>(null);
  const [formData, setFormData] = useState<Partial<FeeAgreement>>({});

  const handleCreate = async () => {
    if (!formData.clientName || !formData.type) {
      notify.error('Client name and fee type are required');
      return;
    }
    try {
      await DataService.feeAgreements.add(formData);
      await refetch();
      createModal.close();
      setFormData({});
      notify.success('Fee agreement created successfully');
    } catch {
      notify.error('Failed to create fee agreement');
    }
  };

  const handleEdit = async () => {
    if (!selectedAgreement) return;
    try {
      await DataService.feeAgreements.update(selectedAgreement.id, formData);
      await refetch();
      editModal.close();
      setSelectedAgreement(null);
      setFormData({});
      notify.success('Fee agreement updated successfully');
    } catch {
      notify.error('Failed to update fee agreement');
    }
  };

  const handleDelete = async () => {
    if (!selectedAgreement) return;
    try {
      await DataService.feeAgreements.delete(selectedAgreement.id);
      await refetch();
      deleteModal.close();
      setSelectedAgreement(null);
      notify.success('Fee agreement deleted successfully');
    } catch {
      notify.error('Failed to delete fee agreement');
    }
  };

  const handleStatusChange = async (agreement: FeeAgreement, newStatus: FeeAgreement['status']) => {
    try {
      await DataService.feeAgreements.update(agreement.id, { status: newStatus });
      await refetch();
      notify.success(`Agreement status updated to ${newStatus}`);
    } catch {
      notify.error('Failed to update agreement status');
    }
  };

  const openEditModal = (agreement: FeeAgreement) => {
    setSelectedAgreement(agreement);
    setFormData(agreement);
    editModal.open();
  };

  const getStatusIcon = (status: FeeAgreement['status']) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'Pending Signature': return <Clock className="h-3 w-3 mr-1" />;
      case 'Suspended': case 'Terminated': return <AlertTriangle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: FeeAgreement['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending Signature': return 'warning';
      case 'Draft': return 'info';
      case 'Suspended': case 'Terminated': return 'error';
      default: return 'neutral';
    }
  };

  const getFeeDisplay = (agreement: FeeAgreement) => {
    switch (agreement.type) {
      case 'Hourly': return `$${agreement.hourlyRate}/hr`;
      case 'Contingency': return `${agreement.contingencyPercent}%`;
      case 'Flat Fee': return `$${agreement.flatFeeAmount?.toLocaleString()}`;
      case 'Retainer': return `$${agreement.retainerAmount?.toLocaleString()}/mo`;
      case 'Hybrid': return 'See terms';
      default: return '-';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <FileText className="h-5 w-5 mr-2 text-indigo-500"/> Fee Agreement Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage client fee agreements and engagement terms.</p>
        </div>
          <Button variant="primary" icon={Plus} onClick={() => { setFormData({}); createModal.open(); }}>
          Create Agreement
        </Button>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Client</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Fee Structure</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Effective Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {agreements.map(agreement => (
            <TableRow key={agreement.id}>
              <TableCell>
                <span className={cn("font-medium", theme.text.primary)}>{agreement.clientName}</span>
              </TableCell>
              <TableCell>
                <Badge variant="info">{agreement.type}</Badge>
              </TableCell>
              <TableCell>
                <span className={cn("font-semibold", theme.text.primary)}>{getFeeDisplay(agreement)}</span>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(agreement.status)}>
                  {getStatusIcon(agreement.status)}
                  {agreement.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {agreement.effectiveDate || 'Not set'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {agreement.status === 'Draft' && (
                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange(agreement, 'Pending Signature')}>
                      Send for Signature
                    </Button>
                  )}
                  {agreement.status === 'Pending Signature' && (
                    <Button size="sm" variant="ghost" onClick={() => handleStatusChange(agreement, 'Active')}>
                      Mark Signed
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => openEditModal(agreement)}>Edit</Button>
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => { setSelectedAgreement(agreement); deleteModal.open(); }}>Delete</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createModal.isOpen || editModal.isOpen}
        onClose={() => { createModal.close(); editModal.close(); }}
        title={createModal.isOpen ? 'Create Fee Agreement' : 'Edit Fee Agreement'}
      >
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Client Name" value={formData.clientName || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, clientName: e.target.value})} placeholder="Enter client name" />

          <div>
            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Fee Type</label>
            <select
              title="Select fee type"
              className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
              value={formData.type || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, type: e.target.value as FeeAgreement['type']})}
            >
              <option value="">Select fee type...</option>
              <option value="Hourly">Hourly</option>
              <option value="Contingency">Contingency</option>
              <option value="Flat Fee">Flat Fee</option>
              <option value="Retainer">Retainer</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {formData.type === 'Hourly' && (
            <Input label="Hourly Rate ($)" type="number" value={formData.hourlyRate || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})} />
          )}
          {formData.type === 'Contingency' && (
            <Input label="Contingency Percentage (%)" type="number" value={formData.contingencyPercent || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, contingencyPercent: parseFloat(e.target.value)})} />
          )}
          {formData.type === 'Flat Fee' && (
            <Input label="Flat Fee Amount ($)" type="number" value={formData.flatFeeAmount || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, flatFeeAmount: parseFloat(e.target.value)})} />
          )}
          {formData.type === 'Retainer' && (
            <Input label="Monthly Retainer ($)" type="number" value={formData.retainerAmount || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, retainerAmount: parseFloat(e.target.value)})} />
          )}

          <Input label="Effective Date" type="date" value={formData.effectiveDate || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, effectiveDate: e.target.value})} />

          <TextArea label="Terms & Conditions" value={formData.terms || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, terms: e.target.value})} rows={4} placeholder="Enter agreement terms..." />

          {editModal.isOpen && (
            <div>
              <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Status</label>
              <select
                title="Select agreement status"
                className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
                value={formData.status || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({...formData, status: e.target.value as FeeAgreement['status']})}
              >
                <option value="Draft">Draft</option>
                <option value="Pending Signature">Pending Signature</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => { createModal.close(); editModal.close(); }}>Cancel</Button>
            <Button variant="primary" onClick={createModal.isOpen ? handleCreate : handleEdit}>
              {createModal.isOpen ? 'Create Agreement' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Fee Agreement">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete the fee agreement for <strong>{selectedAgreement?.clientName}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={deleteModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete Agreement</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FeeAgreementManagement;