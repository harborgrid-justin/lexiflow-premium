import React, { useState } from 'react';
import { DollarSign, Plus, Edit, Trash2, Users, Clock } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { cn } from '@utils/cn';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { Input } from '../../common/Inputs';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { useNotify } from '@hooks/useNotify';

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

const mockRateTables: RateTable[] = [
  {
    id: '1',
    name: 'Standard Client Rates 2024',
    description: 'Default billing rates for standard clients',
    defaultRate: 350,
    currency: 'USD',
    status: 'Active',
    effectiveDate: '2024-01-01',
    rates: [
      { role: 'Senior Partner', rate: 650 },
      { role: 'Partner', rate: 550 },
      { role: 'Associate', rate: 350 },
      { role: 'Paralegal', rate: 175 },
    ],
    createdAt: '2023-12-15',
  },
  {
    id: '2',
    name: 'Premium Client Rates',
    description: 'Rates for premium/enterprise clients',
    defaultRate: 450,
    currency: 'USD',
    status: 'Active',
    effectiveDate: '2024-01-01',
    rates: [
      { role: 'Senior Partner', rate: 750 },
      { role: 'Partner', rate: 650 },
      { role: 'Associate', rate: 450 },
      { role: 'Paralegal', rate: 225 },
    ],
    createdAt: '2023-12-15',
  },
];

export const RateTableManagement: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [rateTables, setRateTables] = useState<RateTable[]>(mockRateTables);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<RateTable | null>(null);
  const [formData, setFormData] = useState<Partial<RateTable>>({ rates: [] });

  const handleCreate = () => {
    if (!formData.name || !formData.defaultRate) {
      notify.error('Name and default rate are required');
      return;
    }
    const newTable: RateTable = {
      id: `rate-${Date.now()}`,
      name: formData.name,
      description: formData.description || '',
      defaultRate: formData.defaultRate,
      currency: 'USD',
      status: 'Draft',
      effectiveDate: formData.effectiveDate || new Date().toISOString().split('T')[0],
      rates: formData.rates || [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setRateTables([...rateTables, newTable]);
    setIsCreateModalOpen(false);
    setFormData({ rates: [] });
    notify.success('Rate table created successfully');
  };

  const handleEdit = () => {
    if (!selectedTable) return;
    setRateTables(rateTables.map(t =>
      t.id === selectedTable.id ? { ...t, ...formData } : t
    ));
    setIsEditModalOpen(false);
    setSelectedTable(null);
    setFormData({ rates: [] });
    notify.success('Rate table updated successfully');
  };

  const handleDelete = () => {
    if (!selectedTable) return;
    setRateTables(rateTables.filter(t => t.id !== selectedTable.id));
    setIsDeleteModalOpen(false);
    setSelectedTable(null);
    notify.success('Rate table deleted successfully');
  };

  const openEditModal = (table: RateTable) => {
    setSelectedTable(table);
    setFormData(table);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (table: RateTable) => {
    setSelectedTable(table);
    setIsDeleteModalOpen(true);
  };

  const addRate = () => {
    setFormData({
      ...formData,
      rates: [...(formData.rates || []), { role: '', rate: 0 }],
    });
  };

  const updateRate = (index: number, field: 'role' | 'rate', value: string | number) => {
    const newRates = [...(formData.rates || [])];
    newRates[index] = { ...newRates[index], [field]: value };
    setFormData({ ...formData, rates: newRates });
  };

  const removeRate = (index: number) => {
    const newRates = (formData.rates || []).filter((_, i) => i !== index);
    setFormData({ ...formData, rates: newRates });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <DollarSign className="h-5 w-5 mr-2 text-green-500"/> Rate Table Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Configure billing rates for different roles and clients.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setFormData({ rates: [] }); setIsCreateModalOpen(true); }}>
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
                  <Users className="h-3 w-3 mr-1"/> {table.rates.length} roles
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
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
        title={isCreateModalOpen ? 'Create Rate Table' : 'Edit Rate Table'}
      >
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Table Name"
            value={formData.name || ''}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g., Standard Client Rates 2024"
          />
          <Input
            label="Description"
            value={formData.description || ''}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Brief description of this rate table"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Rate ($/hr)"
              type="number"
              value={formData.defaultRate || ''}
              onChange={e => setFormData({...formData, defaultRate: parseFloat(e.target.value)})}
            />
            <Input
              label="Effective Date"
              type="date"
              value={formData.effectiveDate || ''}
              onChange={e => setFormData({...formData, effectiveDate: e.target.value})}
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
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Role name"
                    value={rate.role}
                    onChange={e => updateRate(index, 'role', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={rate.rate}
                    onChange={e => updateRate(index, 'rate', parseFloat(e.target.value))}
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
            <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
            <Button variant="primary" onClick={isCreateModalOpen ? handleCreate : handleEdit}>
              {isCreateModalOpen ? 'Create Table' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Rate Table">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete <strong>{selectedTable?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete Table</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RateTableManagement;
