import React, { useState } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Users, Plus, Mail, Building2, Trash2, Edit } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Modal } from '../common/Modal';
import { Input, TextArea } from '../common/Inputs';
import { useNotify } from '../../hooks/useNotify';
import { useModalState } from '../../hooks';
import { useSelection } from '../../hooks/useSelectionState';
import { useQuery, useMutation, queryClient } from '../../hooks/useQueryHooks';
import { queryKeys } from '../../utils/queryKeys';
import { DataService } from '../../services/data/dataService';

interface Custodian {
  id: string;
  caseId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'Active' | 'On Hold' | 'Released' | 'Pending';
  legalHoldId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const Custodians: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  
  // Load custodians from backend/IndexedDB via useQuery for accurate, cached data
  const { data: custodians = [], isLoading: _isLoading } = useQuery<Custodian[]>(
    queryKeys.discoveryExtended.custodians(),
    () => DataService.custodians.getAll()
  );
  
  const createModal = useModalState();
  const editModal = useModalState();
  const deleteModal = useModalState();
  const custodianSelection = useSelection<Custodian>();
  const [formData, setFormData] = useState<Partial<Custodian>>({});

  // Mutations with automatic cache invalidation
  const { mutate: createCustodian } = useMutation(
    async (custodian: Custodian) => DataService.custodians.create(custodian),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.discoveryExtended.custodians());
        createModal.close();
        setFormData({});
        notify.success('Custodian created successfully');
      },
      onError: () => notify.error('Failed to create custodian')
    }
  );

  const { mutate: updateCustodian } = useMutation(
    async (custodian: Custodian) => DataService.custodians.update(custodian.id, custodian),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.discoveryExtended.custodians());
        editModal.close();
        custodianSelection.deselect();
        setFormData({});
        notify.success('Custodian updated successfully');
      },
      onError: () => notify.error('Failed to update custodian')
    }
  );

  const { mutate: deleteCustodian } = useMutation(
    async (id: string) => DataService.custodians.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidate(queryKeys.discoveryExtended.custodians());
        deleteModal.close();
        custodianSelection.deselect();
        notify.success('Custodian deleted successfully');
      },
      onError: () => notify.error('Failed to delete custodian')
    }
  );

  const handleCreate = () => {
    if (!formData.name || !formData.email) {
      notify.error('Name and email are required');
      return;
    }
    const newCustodian: Custodian = {
      id: `cust-${Date.now()}`,
      caseId: 'case-1',
      name: formData.name,
      email: formData.email,
      department: formData.department || '',
      role: formData.role || '',
      status: 'Pending',
      notes: formData.notes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    createCustodian(newCustodian);
  };

  const handleEdit = () => {
    if (!custodianSelection.selected || !formData.name || !formData.email) {
      notify.error('Name and email are required');
      return;
    }
    const updatedCustodian = {
      ...custodianSelection.selected,
      ...formData,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    updateCustodian(updatedCustodian);
  };

  const handleDelete = () => {
    if (!custodianSelection.selected) return;
    deleteCustodian(custodianSelection.selected.id);
  };

  const openEditModal = (custodian: Custodian) => {
    custodianSelection.select(custodian);
    setFormData(custodian);
    editModal.open();
  };

  const openDeleteModal = (custodian: Custodian) => {
    custodianSelection.select(custodian);
    deleteModal.open();
  };

  const getStatusVariant = (status: Custodian['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'On Hold': return 'warning';
      case 'Released': return 'neutral';
      case 'Pending': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <Users className="h-5 w-5 mr-2 text-blue-500"/> Custodian Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage data custodians and legal hold recipients.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setFormData({}); createModal.open(); }}>
          Add Custodian
        </Button>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {custodians.map(custodian => (
            <TableRow key={custodian.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className={cn("h-4 w-4", theme.text.tertiary)}/>
                  <span className={cn("font-medium", theme.text.primary)}>{custodian.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Mail className={cn("h-3 w-3", theme.text.tertiary)}/>
                  {custodian.email}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Building2 className={cn("h-3 w-3", theme.text.tertiary)}/>
                  {custodian.department || '-'}
                </div>
              </TableCell>
              <TableCell>{custodian.role || '-'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(custodian.status)}>{custodian.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => openEditModal(custodian)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => openDeleteModal(custodian)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {custodians.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className={cn("text-center py-8 italic", theme.text.tertiary)}>
                No custodians found. Click "Add Custodian" to create one.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </TableContainer>

      {/* Create Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Add New Custodian">
        <div className="p-6 space-y-4">
          <Input
            label="Full Name"
            value={formData.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter custodian's full name"
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
            placeholder="custodian@company.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g., Engineering"
            />
            <Input
              label="Role / Title"
              value={formData.role || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, role: e.target.value})}
              placeholder="e.g., Senior Developer"
            />
          </div>
          <TextArea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes about this custodian..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={createModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Create Custodian</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Custodian">
        <div className="p-6 space-y-4">
          <Input
            label="Full Name"
            value={formData.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
          />
          <Input
            label="Email Address"
            type="email"
            value={formData.email || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Department"
              value={formData.department || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, department: e.target.value})}
            />
            <Input
              label="Role / Title"
              value={formData.role || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, role: e.target.value})}
            />
          </div>
          <div>
            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Status</label>
            <select
              title="Select custodian status"
              className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
              value={formData.status || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, status: e.target.value as Custodian['status']})}
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Released">Released</option>
            </select>
          </div>
          <TextArea
            label="Notes"
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, notes: e.target.value})}
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={editModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Custodian">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete <strong>{custodianSelection.selected?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={deleteModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Custodians;

