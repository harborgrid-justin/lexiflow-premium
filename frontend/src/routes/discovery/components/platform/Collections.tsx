/**
 * Collections.tsx
 * Data Collections Management for E-Discovery
 * Manage data collection from custodians and sources
 */

import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/organisms/Table/Table';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { Input } from '@/shared/ui/atoms/Input';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { LazyLoader } from '@/shared/ui/molecules/LazyLoader/LazyLoader';
import { Modal } from '@/shared/ui/molecules/Modal';
import { useTheme } from '@/features/theme';
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DISCOVERY_QUERY_KEYS, DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import type { DataCollection } from '@/types/discovery-enhanced';
import { CaseId } from '@/types/primitives';
import { cn } from '@/shared/lib/cn';
import { AlertTriangle, CheckCircle, Clock, Database, Download, Pause, Play, Plus } from 'lucide-react';
import { useState } from 'react';

interface CollectionsProps {
  caseId?: string;
}

export function Collections({ caseId }: CollectionsProps) {
  const { theme } = useTheme();
  const notify = useNotify();
  const createModal = useModalState();

  // Access Discovery Repository
  const discoveryRepo = DataService.discovery as unknown as DiscoveryRepository;

  // Fetch Collections
  const { data: collections = [], isLoading } = useQuery<DataCollection[]>(
    caseId ? DISCOVERY_QUERY_KEYS.collections.byCase(caseId) : DISCOVERY_QUERY_KEYS.collections.all(),
    async () => {
      return discoveryRepo.getCollections(caseId);
    }
  );

  // Create Collection Mutation
  const { mutate: createCollection, isLoading: isCreating } = useMutation(
    async (newCollection: Partial<DataCollection>) => {
      return discoveryRepo.createCollection(newCollection);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(
          caseId ? DISCOVERY_QUERY_KEYS.collections.byCase(caseId) : DISCOVERY_QUERY_KEYS.collections.all()
        );
        notify.success('Collection created successfully');
        createModal.close();
        setFormData({ collectionName: '', custodians: '', dataSources: '', dateStart: '', dateEnd: '', method: 'remote', notes: '' });
      },
      onError: (error) => {
        console.error('Failed to create collection:', error);
        notify.error('Failed to create collection');
      }
    }
  );

  // Update Collection Mutation (Pause/Resume)
  const { mutate: updateCollection } = useMutation(
    async ({ id, data }: { id: string; data: Partial<DataCollection> }) => {
      return discoveryRepo.updateCollection(id, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(DISCOVERY_QUERY_KEYS.collections.all());
      },
      onError: (error) => {
        console.error('Failed to update collection:', error);
        notify.error('Failed to update collection');
      }
    }
  );

  const [formData, setFormData] = useState({
    collectionName: '',
    custodians: '',
    dataSources: '',
    dateStart: '',
    dateEnd: '',
    method: 'remote' as DataCollection['collectionMethod'],
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

  const handlePauseResume = (collection: DataCollection) => {
    const newStatus = collection.status === 'in_progress' ? 'paused' : 'in_progress';
    updateCollection({ id: collection.id, data: { status: newStatus } });
    notify.success(`Collection ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
  };

  const handleCreateCollection = () => {
    if (!formData.collectionName || !formData.custodians || !formData.dataSources) {
      notify.error('Please fill in all required fields');
      return;
    }

    const newCollection: Partial<DataCollection> = {
      caseId: (caseId || 'C-2024-001') as CaseId,
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
    };

    createCollection(newCollection);
  };

  const stats = {
    total: collections.length,
    active: collections.filter(c => c.status === 'in_progress').length,
    completed: collections.filter(c => c.status === 'completed').length,
    totalSize: collections.reduce((acc, col) => {
      if (col.actualSize) {
        const sizeMatch = col.actualSize.match(/(\d+.?\d*)\s*(GB|MB|TB)/);
        if (sizeMatch && sizeMatch[1]) {
          const value = parseFloat(sizeMatch[1]);
          const unit = sizeMatch[2];
          return acc + (unit === 'GB' ? value : unit === 'TB' ? value * 1024 : value / 1024);
        }
      }
      return acc;
    }, 0).toFixed(2) + ' GB'
  };

  if (isLoading) {
    return <LazyLoader />;
  }

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
            {collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Database className={cn("h-12 w-12 mb-4", theme.text.tertiary)} />
                    <h3 className={cn("text-lg font-medium", theme.text.primary)}>No Collections Found</h3>
                    <p className={cn("text-sm max-w-sm mt-2 mb-6", theme.text.secondary)}>
                      Start a new data collection to gather evidence from custodians and data sources.
                    </p>
                    <Button variant="primary" icon={Plus} onClick={createModal.open}>
                      Create First Collection
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
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
                          onClick={() => handlePauseResume(collection)}
                        >
                          {collection.status === 'in_progress' ? 'Pause' : 'Resume'}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
              onChange={(e) => setFormData({ ...formData, method: e.target.value as DataCollection['collectionMethod'] })}
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
            <Button variant="primary" onClick={handleCreateCollection} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Collections;
