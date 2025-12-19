import React, { useState } from 'react';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { Input, TextArea } from '../../common/Inputs';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { useNotify } from '../../../hooks/useNotify';
import { useModalState } from '../../../hooks';
import { getTodayString } from '../../../utils/dateUtils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  status: 'Active' | 'Revoked' | 'Expired';
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

const mockApiKeys: ApiKey[] = [
  { id: '1', name: 'Production API Key', key: 'lxf_prod_xxxxxxxxxxxxxxxxxxxx', prefix: 'lxf_prod', scopes: ['read:cases', 'write:cases', 'read:documents'], status: 'Active', lastUsed: '2024-01-15T10:30:00Z', createdAt: '2023-06-15', createdBy: 'Admin User' },
  { id: '2', name: 'Integration Key - Slack', key: 'lxf_int_yyyyyyyyyyyyyyyyyyyy', prefix: 'lxf_int', scopes: ['read:notifications'], status: 'Active', lastUsed: '2024-01-14T16:45:00Z', createdAt: '2023-08-20', createdBy: 'John Smith' },
  { id: '3', name: 'Legacy API Key', key: 'lxf_leg_zzzzzzzzzzzzzzzzzzzz', prefix: 'lxf_leg', scopes: ['read:cases'], status: 'Revoked', createdAt: '2022-10-01', createdBy: 'Admin User' },
];

const availableScopes = [
  { id: 'read:cases', label: 'Read Cases', description: 'View case information' },
  { id: 'write:cases', label: 'Write Cases', description: 'Create and update cases' },
  { id: 'read:documents', label: 'Read Documents', description: 'Download and view documents' },
  { id: 'write:documents', label: 'Write Documents', description: 'Upload and modify documents' },
  { id: 'read:billing', label: 'Read Billing', description: 'View invoices and time entries' },
  { id: 'write:billing', label: 'Write Billing', description: 'Create invoices and log time' },
  { id: 'read:users', label: 'Read Users', description: 'View user information' },
  { id: 'admin', label: 'Admin Access', description: 'Full administrative access' },
];

export const ApiKeyManagement: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
  const createModal = useModalState();
  const deleteModal = useModalState();
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [formData, setFormData] = useState<{ name: string; scopes: string[]; expiresAt?: string }>({ name: '', scopes: [] });
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const generateKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let key = 'lxf_';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleCreate = () => {
    if (!formData.name || !formData.scopes.length) {
      notify.error('Name and at least one scope are required');
      return;
    }
    const newKey = generateKey();
    const apiKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: formData.name,
      key: newKey,
      prefix: newKey.substring(0, 8),
      scopes: formData.scopes,
      status: 'Active',
      expiresAt: formData.expiresAt,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
    };
    setApiKeys([...apiKeys, apiKey]);
    setNewKeyValue(newKey);
    setFormData({ name: '', scopes: [] });
    notify.success('API key created successfully');
  };

  const handleRevoke = () => {
    if (!selectedKey) return;
    setApiKeys(apiKeys.map(k =>
      k.id === selectedKey.id ? { ...k, status: 'Revoked' } : k
    ));
    setIsDeleteModalOpen(false);
    setSelectedKey(null);
    notify.success('API key revoked successfully');
  };

  const handleDelete = () => {
    if (!selectedKey) return;
    setApiKeys(apiKeys.filter(k => k.id !== selectedKey.id));
    setIsDeleteModalOpen(false);
    setSelectedKey(null);
    notify.success('API key deleted successfully');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    notify.success('Copied to clipboard');
  };

  const toggleScope = (scope: string) => {
    if (formData.scopes.includes(scope)) {
      setFormData({ ...formData, scopes: formData.scopes.filter(s => s !== scope) });
    } else {
      setFormData({ ...formData, scopes: [...formData.scopes, scope] });
    }
  };

  const maskKey = (key: string) => {
    return key.substring(0, 8) + '••••••••••••••••••••••••';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <Key className="h-5 w-5 mr-2 text-amber-500"/> API Key Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Manage API keys for external integrations.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setFormData({ name: '', scopes: [] }); setNewKeyValue(null); setIsCreateModalOpen(true); }}>
          Create API Key
        </Button>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>Key</TableHead>
          <TableHead>Scopes</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Used</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {apiKeys.map(apiKey => (
            <TableRow key={apiKey.id}>
              <TableCell>
                <div>
                  <span className={cn("font-medium", theme.text.primary)}>{apiKey.name}</span>
                  <p className={cn("text-xs", theme.text.tertiary)}>Created by {apiKey.createdBy}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className={cn("text-xs px-2 py-1 rounded", theme.surface.highlight)}>
                    {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                  </code>
                  <Button size="sm" variant="ghost" onClick={() => setShowKey({ ...showKey, [apiKey.id]: !showKey[apiKey.id] })}>
                    {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(apiKey.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="info">{apiKey.scopes.length} scopes</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={apiKey.status === 'Active' ? 'success' : apiKey.status === 'Revoked' ? 'error' : 'warning'}>
                  {apiKey.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {apiKey.status === 'Active' && (
                    <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => { setSelectedKey(apiKey); setIsDeleteModalOpen(true); }}>
                      Revoke
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => { setSelectedKey(apiKey); setIsDeleteModalOpen(true); }}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create API Key">
        <div className="p-6 space-y-4">
          {newKeyValue ? (
            <div className="space-y-4">
              <div className={cn("p-4 rounded-lg bg-green-50 border border-green-200")}>
                <p className="text-green-800 font-medium mb-2">API Key Created Successfully!</p>
                <p className="text-green-700 text-sm mb-3">Make sure to copy your API key now. You won't be able to see it again!</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-white rounded border text-sm font-mono">{newKeyValue}</code>
                  <Button variant="secondary" icon={Copy} onClick={() => copyToClipboard(newKeyValue)}>Copy</Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="primary" onClick={() => setIsCreateModalOpen(false)}>Done</Button>
              </div>
            </div>
          ) : (
            <>
              <Input label="Key Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Production API Key" />
              <Input label="Expiration Date (optional)" type="date" value={formData.expiresAt || ''} onChange={e => setFormData({...formData, expiresAt: e.target.value})} />

              <div>
                <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Scopes (Permissions)</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableScopes.map(scope => (
                    <label key={scope.id} className={cn("flex items-start p-3 rounded border cursor-pointer", formData.scopes.includes(scope.id) ? theme.primary.background : theme.surface.default, theme.border.default)}>
                      <input type="checkbox" checked={formData.scopes.includes(scope.id)} onChange={() => toggleScope(scope.id)} className="mt-1 mr-3" />
                      <div>
                        <span className={cn("font-medium", theme.text.primary)}>{scope.label}</span>
                        <p className={cn("text-xs", theme.text.tertiary)}>{scope.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleCreate}>Generate Key</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete/Revoke Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={selectedKey?.status === 'Active' ? 'Revoke API Key' : 'Delete API Key'}>
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to {selectedKey?.status === 'Active' ? 'revoke' : 'delete'} <strong>{selectedKey?.name}</strong>?
            {selectedKey?.status === 'Active' && ' Any applications using this key will lose access immediately.'}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={selectedKey?.status === 'Active' ? handleRevoke : handleDelete}>
              {selectedKey?.status === 'Active' ? 'Revoke Key' : 'Delete Key'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApiKeyManagement;
