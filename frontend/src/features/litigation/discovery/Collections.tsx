/**
 * Collections.tsx
 * Data Collections Management for E-Discovery
 * Manage data collection from custodians and sources
 */

import React, { useState } from 'react';
import { Plus, Download, Pause, Play, AlertTriangle, CheckCircle, Clock, Database } from 'lucide-react';
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { Modal } from '@/components/ui/molecules/Modal';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useNotify } from '@/hooks/useNotify';
import { useModalState } from '@/hooks/core';
import { cn } from '@/utils/cn';
import type { DataCollection } from '@/types/discovery-enhanced';

export const Collections: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const createModal = useModalState();

  // Mock data - in production, this would come from API
  const [collections, setCollections] = useState<DataCollection[]>([
    {
      id: 'COL-001',
      caseId: 'C-2024-001',
      collectionName: 'Executive Email Collection',
      custodians: ['John Doe', 'Jane Smith'],
      dataSources: ['Exchange Server', 'Gmail'],
      dateRange: { start: '2023-01-01', end: '2023-12-31' },
      status: 'completed',
      progress: 100,
      totalItems: 15420,
      collectedItems: 15420,
      estimatedSize: '4.2 GB',
      actualSize: '4.18 GB',
      collectionMethod: 'remote',
      assignedTo: 'IT Team',
      startedAt: '2024-01-15T09:00:00Z',
      completedAt: '2024-01-15T14:30:00Z',
      notes: 'Collection completed successfully',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 'COL-002',
      caseId: 'C-2024-001',
      collectionName: 'SharePoint Document Collection',
      custodians: ['Legal Team'],
      dataSources: ['SharePoint Site A', 'SharePoint Site B'],
      dateRange: { start: '2023-06-01', end: '2023-12-31' },
      status: 'in_progress',
      progress: 67,
      totalItems: 8500,
      collectedItems: 5695,
      estimatedSize: '12.5 GB',
      collectionMethod: 'api',
      assignedTo: 'Discovery Team',
      startedAt: '2024-01-20T10:00:00Z',
      notes: 'In progress - expected completion tomorrow',
      createdAt: '2024-01-20',
      updatedAt: '2024-01-20'
    },
    {
      id: 'COL-003',
      caseId: 'C-2024-001',
      collectionName: 'Laptop Forensic Image',
      custodians: ['Michael Chen'],
      dataSources: ['Dell Laptop #4521'],
      dateRange: { start: '2023-01-01', end: '2024-01-20' },
      status: 'pending',
      progress: 0,
      totalItems: 0,
      collectedItems: 0,
      estimatedSize: '500 GB',
      collectionMethod: 'forensic',
      assignedTo: 'Forensics Team',
      notes: 'Waiting for device handover',
      createdAt: '2024-01-18',
      updatedAt: '2024-01-18'
    }
  ]);

  const [formData, setFormData] = useState({
    collectionName: '',
    custodians: '',
    dataSources: '',
    dateStart: '',
    dateEnd: '',
    method: 'remote' as const,
    notes: ''
  });

  const getStatusIcon = (status: DataCollection['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: DataCollection['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'failed': return 'danger';
      case 'paused': return 'warning';
      case 'pending': return 'neutral';
    }
  };

  const handlePauseResume = (collectionId: string) => {
    setCollections(prev => prev.map(col => {
      if (col.id === collectionId) {
        const newStatus = col.status === 'in_progress' ? 'paused' : 'in_progress';
        notify.success(`Collection ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
        return { ...col, status: newStatus };
      }
      return col;
    }));
  };

  const handleCreateCollection = () => {
    if (!formData.collectionName || !formData.custodians || !formData.dataSources) {
      notify.error('Please fill in all required fields');
      return;
    }

    const newCollection: DataCollection = {
      id: `COL-${String(collections.length + 1).padStart(3, '0')}`,
      caseId: 'C-2024-001',
      collectionName: formData.collectionName,
      custodians: formData.custodians.split(',').map(c => c.trim()),
      dataSources: formData.dataSources.split(',').map(s => s.trim()),
      dateRange: { start: formData.dateStart, end: formData.dateEnd },
      status: 'pending',
      progress: 0,
      totalItems: 0,
      collectedItems: 0,
      estimatedSize: 'TBD',
      collectionMethod: formData.method,
      notes: formData.notes,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setCollections(prev => [...prev, newCollection]);
    notify.success('Collection created successfully');
    createModal.close();
    setFormData({ collectionName: '', custodians: '', dataSources: '', dateStart: '', dateEnd: '', method: 'remote', notes: '' });
  };

  const stats = {
    total: collections.length,
    active: collections.filter(c => c.status === 'in_progress').length,
    completed: collections.filter(c => c.status === 'completed').length,
    totalSize: collections.reduce((acc, col) => {
      if (col.actualSize) {
        const sizeMatch = col.actualSize.match(/(\d+\.?\d*)\s*(GB|MB|TB)/);
        if (sizeMatch) {
          const value = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2];
          return acc + (unit === 'GB' ? value : unit === 'TB' ? value * 1024 : value / 1024);
        }
      }
      return acc;
    }, 0).toFixed(2) + ' GB'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Total Collections</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.total}</p>
            </div>
            <Database className={cn("h-8 w-8", theme.text.tertiary)} />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Active</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.active}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Completed</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Total Data</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.totalSize}</p>
            </div>
            <Download className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Collections Table */}
      <div className={cn("rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>Data Collections</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Manage data collection from custodians and sources</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={createModal.open}>
            New Collection
          </Button>
        </div>

        <TableContainer>
          <TableHeader>
            <TableHead>Collection Name</TableHead>
            <TableHead>Custodians</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  <div>
                    <div className={cn("font-medium", theme.text.primary)}>{collection.collectionName}</div>
                    <div className={cn("text-xs", theme.text.tertiary)}>{collection.id}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {collection.custodians.slice(0, 2).map((custodian, idx) => (
                      <div key={idx} className="text-sm">{custodian}</div>
                    ))}
                    {collection.custodians.length > 2 && (
                      <div className={cn("text-xs", theme.text.tertiary)}>+{collection.custodians.length - 2} more</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(collection.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(collection.status)}
                    {collection.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className={cn("w-32 h-2 rounded-full", theme.surface.highlight)}>
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${collection.progress}%` }}
                      />
                    </div>
                    <div className={cn("text-xs", theme.text.tertiary)}>{collection.progress}%</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {collection.collectedItems.toLocaleString()} / {collection.totalItems.toLocaleString() || '—'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{collection.actualSize || collection.estimatedSize}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(collection.status === 'in_progress' || collection.status === 'paused') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={collection.status === 'in_progress' ? Pause : Play}
                        onClick={() => handlePauseResume(collection.id)}
                      >
                        {collection.status === 'in_progress' ? 'Pause' : 'Resume'}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">View</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableContainer>
      </div>

      {/* Create Collection Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Collection">
        <div className="p-6 space-y-4">
          <Input
            label="Collection Name"
            value={formData.collectionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, collectionName: e.target.value })}
            placeholder="e.g., Executive Email Collection"
            required
          />
          <Input
            label="Custodians (comma-separated)"
            value={formData.custodians}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, custodians: e.target.value })}
            placeholder="John Doe, Jane Smith"
            required
          />
          <Input
            label="Data Sources (comma-separated)"
            value={formData.dataSources}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dataSources: e.target.value })}
            placeholder="Exchange Server, SharePoint"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.dateStart}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateStart: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={formData.dateEnd}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dateEnd: e.target.value })}
            />
          </div>
          <div>
            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Collection Method</label>
            <select
              title="Select collection method"
              className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as 'remote' | 'onsite' | 'forensic' | 'api' })}
            >
              <option value="remote">Remote Collection</option>
              <option value="onsite">On-Site Collection</option>
              <option value="forensic">Forensic Imaging</option>
              <option value="api">API Collection</option>
            </select>
          </div>
          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional collection notes..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={createModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateCollection}>Create Collection</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Collections;
