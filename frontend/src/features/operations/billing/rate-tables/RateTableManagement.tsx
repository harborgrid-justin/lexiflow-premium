import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Input } from '@/components/ui/atoms/Input/Input';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import { useQuery } from '@/hooks/useQueryHooks';
import { useSelection } from '@/hooks/useSelectionState';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/utils/cn';
import { queryKeys } from '@/utils/queryKeys';
import { useTheme } from '@providers/ThemeContext';
import { DollarSign, Edit, Plus, Trash2, Users } from 'lucide-react';
import React, { memo, useCallback, useState } from 'react';

interface RateTable {
  id: string;
  name: string;
  description: string;
  defaultRate: number;
  currency: string;
  status: 'Active' | 'Inactive' | 'Draft';
  effectiveDate: string;
  expirationDate?: string;
  rates: { role: string; rate: number }[];
  createdAt: string;
}

const RateTableManagementComponent: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();

  // Fetch rate tables from backend API
  const { data: rateTables = [], refetch } = useQuery<RateTable[]>(
    queryKeys.billing.rateTables?.() || ['billing', 'rateTables'],
    () => DataService.rateTables.getAll()
  );
  const createModal = useModalState();
  const editModal = useModalState();
  const deleteModal = useModalState();
  const tableSelection = useSelection<RateTable>();
  const [formData, setFormData] = useState<Partial<RateTable>>({ rates: [] });

  const handleCreate = async () => {
    if (!formData.name || !formData.defaultRate) {
      notify.error('Name and default rate are required');
      return;
    }
    try {
      const newTable: Partial<RateTable> = {
        name: formData.name,
        description: formData.description || '',
        defaultRate: formData.defaultRate,
        currency: 'USD',
        status: 'Draft',
        effectiveDate: formData.effectiveDate || new Date().toISOString().split('T')[0],
        rates: formData.rates || [],
      };
      await DataService.rateTables.add(newTable);
      await refetch();
      createModal.close();
      setFormData({ rates: [] });
      notify.success('Rate table created successfully');
    } catch {
      notify.error('Failed to create rate table');
    }
  };

  const handleEdit = async () => {
    if (!tableSelection.selected) return;
    try {
      await DataService.rateTables.update(tableSelection.selected.id, formData);
      await refetch();
      editModal.close();
      tableSelection.deselect();
      setFormData({ rates: [] });
      notify.success('Rate table updated successfully');
    } catch (error) {
      console.error('[RateTableManagement.handleEdit] Error:', error);
      notify.error('Failed to update rate table');
    }
  };

  const handleDelete = async () => {
    if (!tableSelection.selected) return;
    try {
      await DataService.rateTables.delete(tableSelection.selected.id);
      await refetch();
      deleteModal.close();
      tableSelection.deselect();
      notify.success('Rate table deleted successfully');
    } catch {
      notify.error('Failed to delete rate table');
    }
  };

  const openEditModal = (table: RateTable) => {
    tableSelection.select(table);
    setFormData(table);
    editModal.open();
  };

  const openDeleteModal = (table: RateTable) => {
    tableSelection.select(table);
    deleteModal.open();
  };

  const addRate = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      rates: [...(prev.rates || []), { role: '', rate: 0 }],
    }));
  }, []);

  const updateRate = useCallback((index: number, field: 'role' | 'rate', value: string | number) => {
    setFormData(prev => {
      const newRates = [...(prev.rates || [])];
      newRates[index] = { ...newRates[index], [field]: value };
      return { ...prev, rates: newRates };
    });
  }, []);

  const removeRate = useCallback((index: number) => {
    setFormData(prev => {
      const newRates = (prev.rates || []).filter((_, i) => i !== index);
      return { ...prev, rates: newRates };
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <DollarSign className="h-5 w-5 mr-2 text-green-500" /> Rate Table Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Configure billing rates for different roles and clients.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setFormData({ rates: [] }); createModal.open(); }}>
          Create Rate Table
        </Button>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Default Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Effective Date</TableHead>
          <TableHead>Roles Configured</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {rateTables.map(table => (
            <TableRow key={table.id}>
              <TableCell>
                <div>
                  <span className={cn("font-medium", theme.text.primary)}>{table.name}</span>
                  <p className={cn("text-xs", theme.text.tertiary)}>{table.description}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className={cn("font-semibold text-green-600")}>${table.defaultRate}/hr</span>
              </TableCell>
              <TableCell>
                <Badge variant={table.status === 'Active' ? 'success' : table.status === 'Draft' ? 'warning' : 'neutral'}>
                  {table.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{table.effectiveDate}</TableCell>
              <TableCell>
                <Badge variant="info">
                  <Users className="h-3 w-3 mr-1" /> {table.rates.length} roles
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => openEditModal(table)}>Edit</Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => openDeleteModal(table)}>Delete</Button>
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
        title={createModal.isOpen ? 'Create Rate Table' : 'Edit Rate Table'}
      >
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Table Name"
            value={formData.name || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Standard Client Rates 2024"
          />
          <Input
            label="Description"
            value={formData.description || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this rate table"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Rate ($/hr)"
              type="number"
              value={formData.defaultRate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, defaultRate: parseFloat(e.target.value) })}
            />
            <Input
              label="Effective Date"
              type="date"
              value={formData.effectiveDate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, effectiveDate: e.target.value })}
            />
          </div>

          {/* Role-specific rates */}
          <div className={cn("p-4 rounded-lg border", theme.surface.highlight, theme.border.default)}>
            <div className="flex justify-between items-center mb-3">
              <label className={cn("text-xs font-bold uppercase", theme.text.secondary)}>Role-Specific Rates</label>
              <Button size="sm" variant="secondary" icon={Plus} onClick={addRate}>Add Role</Button>
            </div>
            <div className="space-y-2">
              {(formData.rates || []).map((rate, index) => (
                <div key={`rate-${index}-${formData.rates?.[index]?.role || 'new'}`} className="flex gap-2 items-center">
                  <Input
                    placeholder="Role name"
                    value={rate.role}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRate(index, 'role', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={rate.rate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRate(index, 'rate', parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeRate(index)} />
                </div>
              ))}
              {(formData.rates || []).length === 0 && (
                <p className={cn("text-sm text-center py-4 italic", theme.text.tertiary)}>
                  No role-specific rates configured. Click "Add Role" to add one.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => { createModal.close(); editModal.close(); }}>Cancel</Button>
            <Button variant="primary" onClick={createModal.isOpen ? handleCreate : handleEdit}>
              {createModal.isOpen ? 'Create Table' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Delete Rate Table">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete <strong>{tableSelection.selected?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={deleteModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete Table</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const RateTableManagement = memo(RateTableManagementComponent);
RateTableManagement.displayName = 'RateTableManagement';

export default RateTableManagement;