/**
 * ESISourcesList.tsx
 * Electronically Stored Information Sources Management
 * Track and manage data sources for collection
 */

import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Input } from '@/components/ui/atoms/Input';
import { TextArea } from '@/components/ui/atoms/TextArea';
import { LazyLoader } from '@/components/ui/molecules/LazyLoader/LazyLoader';
import { Modal } from '@/components/ui/molecules/Modal';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import { queryClient, useMutation, useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/dataService';
import { DISCOVERY_QUERY_KEYS, DiscoveryRepository } from '@/services/data/repositories/DiscoveryRepository';
import { ESISource } from '@/types';
import { cn } from '@/utils/cn';
import { AlertCircle, CheckCircle, Cloud, Database, HardDrive, Mail, Plus, Server, Smartphone } from 'lucide-react';
import React, { useState } from 'react';

interface ESISourcesListProps {
  caseId?: string;
}

export const ESISourcesList: React.FC<ESISourcesListProps> = ({ caseId }) => {
  const { theme } = useTheme();
  const notify = useNotify();
  const createModal = useModalState();

  // Access Discovery Repository
  const discoveryRepo = DataService.discovery as unknown as DiscoveryRepository;

  // Fetch ESI Sources
  const { data: sources = [], isLoading } = useQuery<ESISource[]>(
    caseId ? DISCOVERY_QUERY_KEYS.esiSources.byCase(caseId) : DISCOVERY_QUERY_KEYS.esiSources.all(),
    async () => {
      return discoveryRepo.getESISources(caseId);
    }
  );

  // Create ESI Source Mutation
  const { mutate: createSource, isLoading: isCreating } = useMutation(
    async (newSource: Partial<ESISource>) => {
      return discoveryRepo.addESISource(newSource as ESISource);
    },
    {
      onSuccess: () => {
        queryClient.invalidate(DISCOVERY_QUERY_KEYS.esiSources.all());
        if (caseId) {
          queryClient.invalidate(DISCOVERY_QUERY_KEYS.esiSources.byCase(caseId));
        }
        notify.success('ESI Source added successfully');
        createModal.close();
        setFormData({
          name: '',
          type: 'email',
          custodian: '',
          location: '',
          estimatedSize: '',
          notes: ''
        });
      },
      onError: () => {
        notify.error('Failed to add ESI Source');
      }
    }
  );

  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as ESISource['type'],
    custodian: '',
    location: '',
    estimatedSize: '',
    notes: ''
  });

  const getSourceIcon = (type: ESISource['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />;
      case 'fileserver': return <Server className="h-5 w-5 text-green-600" />;
      case 'cloud': return <Cloud className="h-5 w-5 text-purple-600" />;
      case 'database': return <Database className="h-5 w-5 text-orange-600" />;
      case 'device': return <HardDrive className="h-5 w-5 text-gray-600" />;
      case 'other': return <Smartphone className="h-5 w-5 text-gray-600" />;
      default: return <Smartphone className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: ESISource['status']) => {
    switch (status) {
      case 'identified': return <Badge variant="neutral">Identified</Badge>;
      case 'preserved': return <Badge variant="warning">Preserved</Badge>;
      case 'collected': return <Badge variant="info">Collected</Badge>;
      case 'processed': return <Badge variant="success">Processed</Badge>;
      default: return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: ESISource['status']) => {
    switch (status) {
      case 'processed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'collected': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleCreateSource = () => {
    if (!formData.name || !formData.custodian || !formData.location) {
      notify.error('Please fill in all required fields');
      return;
    }

    createSource({
      ...formData,
      status: 'identified',
      caseId: caseId
    } as Partial<ESISource>);
  };

  const stats = {
    total: sources.length,
    identified: sources.filter(s => s.status === 'identified').length,
    preserved: sources.filter(s => s.status === 'preserved').length,
    collected: sources.filter(s => s.status === 'collected').length,
    processed: sources.filter(s => s.status === 'processed').length
  };

  if (isLoading) {
    return <LazyLoader message="Loading ESI Sources..." />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Total Sources</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.total}</p>
            </div>
            <Database className={cn("h-8 w-8", theme.text.tertiary)} />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Identified</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.identified}</p>
            </div>
            <Badge variant="neutral">{stats.identified}</Badge>
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Preserved</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.preserved}</p>
            </div>
            <Badge variant="warning">{stats.preserved}</Badge>
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Collected</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.collected}</p>
            </div>
            <Badge variant="info">{stats.collected}</Badge>
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Processed</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.processed}</p>
            </div>
            <Badge variant="success">{stats.processed}</Badge>
          </div>
        </div>
      </div>

      {/* ESI Sources Table */}
      <div className={cn("rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>ESI Sources</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Electronically stored information sources</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={createModal.open}>
            Add Source
          </Button>
        </div>

        <TableContainer>
          <TableHeader>
            <TableHead>Source Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Custodian</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeader>
          <TableBody>
            {sources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No ESI sources found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSourceIcon(source.type)}
                      <div>
                        <div className={cn("font-medium", theme.text.primary)}>{source.name}</div>
                        <div className={cn("text-xs", theme.text.tertiary)}>{source.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {source.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{source.custodian}</div>
                  </TableCell>
                  <TableCell>
                    <div className={cn("text-sm font-mono", theme.text.secondary)}>{(source as ESISource & { location?: string }).location}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(source.status)}
                      {getStatusBadge(source.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{(source as ESISource & { actualSize?: string; estimatedSize?: string }).actualSize || (source as ESISource & { actualSize?: string; estimatedSize?: string }).estimatedSize}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">View</Button>
                      <Button size="sm" variant="ghost">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableContainer>
      </div>

      {/* Create Source Modal */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Add ESI Source">
        <div className="p-6 space-y-4">
          <Input
            label="Source Name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Exchange Server - Executive Mailboxes"
            required
          />
          <div>
            <label className={cn("block text-xs font-bold uppercase mb-1.5", theme.text.secondary)}>Source Type</label>
            <select
              title="Select source type"
              className={cn("w-full p-2 border rounded text-sm", theme.surface.default, theme.border.default)}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ESISource['type'] })}
            >
              <option value="email">Email System</option>
              <option value="fileserver">File Server</option>
              <option value="cloud">Cloud Storage</option>
              <option value="database">Database</option>
              <option value="device">Device</option>
              <option value="other">Other</option>
            </select>
          </div>
          <Input
            label="Custodian"
            value={formData.custodian}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, custodian: e.target.value })}
            placeholder="e.g., IT Department"
            required
          />
          <Input
            label="Location/Identifier"
            value={formData.location}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., exchange.company.com"
            required
          />
          <Input
            label="Estimated Size"
            value={formData.estimatedSize}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, estimatedSize: e.target.value })}
            placeholder="e.g., 1.5 TB"
          />
          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this source..."
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={createModal.close}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateSource} isLoading={isCreating}>Add Source</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ESISourcesList;
