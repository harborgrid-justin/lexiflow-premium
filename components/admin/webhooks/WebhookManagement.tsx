import React, { useState } from 'react';
import { Webhook, Plus, Edit, Trash2, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { Button } from '../../common/Button';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { Input, TextArea } from '../../common/Inputs';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { useNotify } from '../../../hooks/useNotify';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'Active' | 'Inactive' | 'Error';
  secret?: string;
  lastTriggered?: string;
  failureCount: number;
  createdAt: string;
}

const mockWebhooks: WebhookConfig[] = [
  { id: '1', name: 'Case Update Notification', url: 'https://api.example.com/webhooks/cases', events: ['case.created', 'case.updated'], status: 'Active', lastTriggered: '2024-01-15T10:30:00Z', failureCount: 0, createdAt: '2023-06-15' },
  { id: '2', name: 'Document Upload Alert', url: 'https://slack.example.com/incoming/docs', events: ['document.created'], status: 'Active', lastTriggered: '2024-01-14T16:45:00Z', failureCount: 0, createdAt: '2023-08-20' },
  { id: '3', name: 'Billing Sync', url: 'https://billing.example.com/api/sync', events: ['invoice.created', 'payment.received'], status: 'Error', lastTriggered: '2024-01-10T09:00:00Z', failureCount: 5, createdAt: '2023-10-01' },
];

const availableEvents = [
  'case.created', 'case.updated', 'case.closed',
  'document.created', 'document.updated', 'document.deleted',
  'invoice.created', 'invoice.sent', 'payment.received',
  'user.created', 'user.updated',
  'deadline.approaching', 'deadline.passed',
];

export const WebhookManagement: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(mockWebhooks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [formData, setFormData] = useState<Partial<WebhookConfig>>({ events: [] });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCreate = () => {
    if (!formData.name || !formData.url || !formData.events?.length) {
      notify.error('Name, URL, and at least one event are required');
      return;
    }
    const newWebhook: WebhookConfig = {
      id: `webhook-${Date.now()}`,
      name: formData.name,
      url: formData.url,
      events: formData.events,
      status: 'Inactive',
      secret: formData.secret,
      failureCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setWebhooks([...webhooks, newWebhook]);
    setIsCreateModalOpen(false);
    setFormData({ events: [] });
    notify.success('Webhook created successfully');
  };

  const handleEdit = () => {
    if (!selectedWebhook) return;
    setWebhooks(webhooks.map(w =>
      w.id === selectedWebhook.id ? { ...w, ...formData } : w
    ));
    setIsEditModalOpen(false);
    setSelectedWebhook(null);
    setFormData({ events: [] });
    notify.success('Webhook updated successfully');
  };

  const handleDelete = () => {
    if (!selectedWebhook) return;
    setWebhooks(webhooks.filter(w => w.id !== selectedWebhook.id));
    setIsDeleteModalOpen(false);
    setSelectedWebhook(null);
    notify.success('Webhook deleted successfully');
  };

  const handleTest = () => {
    // Simulate webhook test
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setTestResult({
        success,
        message: success ? 'Webhook responded successfully (200 OK)' : 'Webhook failed to respond (Connection timeout)',
      });
    }, 1000);
  };

  const openEditModal = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setFormData(webhook);
    setIsEditModalOpen(true);
  };

  const openTestModal = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setTestResult(null);
    setIsTestModalOpen(true);
  };

  const toggleEvent = (event: string) => {
    const currentEvents = formData.events || [];
    if (currentEvents.includes(event)) {
      setFormData({ ...formData, events: currentEvents.filter(e => e !== event) });
    } else {
      setFormData({ ...formData, events: [...currentEvents, event] });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn("flex justify-between items-center p-4 rounded-lg border shadow-sm", theme.surface.default, theme.border.default)}>
        <div>
          <h3 className={cn("font-bold flex items-center", theme.text.primary)}>
            <Webhook className="h-5 w-5 mr-2 text-purple-500"/> Webhook Management
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>Configure outgoing webhooks for system events.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setFormData({ events: [] }); setIsCreateModalOpen(true); }}>
          Create Webhook
        </Button>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Events</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Triggered</TableHead>
          <TableHead>Actions</TableHead>
        </TableHeader>
        <TableBody>
          {webhooks.map(webhook => (
            <TableRow key={webhook.id}>
              <TableCell>
                <span className={cn("font-medium", theme.text.primary)}>{webhook.name}</span>
              </TableCell>
              <TableCell>
                <code className={cn("text-xs px-2 py-1 rounded", theme.surface.highlight)}>{webhook.url}</code>
              </TableCell>
              <TableCell>
                <Badge variant="info">{webhook.events.length} events</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={webhook.status === 'Active' ? 'success' : webhook.status === 'Error' ? 'error' : 'default'}>
                  {webhook.status === 'Error' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {webhook.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" icon={Play} onClick={() => openTestModal(webhook)}>Test</Button>
                  <Button size="sm" variant="ghost" icon={Edit} onClick={() => openEditModal(webhook)}>Edit</Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => { setSelectedWebhook(webhook); setIsDeleteModalOpen(true); }}>Delete</Button>
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
        title={isCreateModalOpen ? 'Create Webhook' : 'Edit Webhook'}
      >
        <div className="p-6 space-y-4">
          <Input label="Webhook Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Case Update Notification" />
          <Input label="Endpoint URL" value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://api.example.com/webhook" />
          <Input label="Secret (optional)" value={formData.secret || ''} onChange={e => setFormData({...formData, secret: e.target.value})} placeholder="Shared secret for signature verification" />

          <div>
            <label className={cn("block text-xs font-bold uppercase mb-2", theme.text.secondary)}>Events to Subscribe</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {availableEvents.map(event => (
                <label key={event} className={cn("flex items-center p-2 rounded border cursor-pointer", formData.events?.includes(event) ? theme.primary.background : theme.surface.default, theme.border.default)}>
                  <input type="checkbox" checked={formData.events?.includes(event)} onChange={() => toggleEvent(event)} className="mr-2" />
                  <span className="text-sm">{event}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
            <Button variant="primary" onClick={isCreateModalOpen ? handleCreate : handleEdit}>
              {isCreateModalOpen ? 'Create Webhook' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Test Modal */}
      <Modal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} title="Test Webhook">
        <div className="p-6">
          <p className={cn("mb-4", theme.text.secondary)}>
            Send a test payload to: <code className={cn("px-2 py-1 rounded text-sm", theme.surface.highlight)}>{selectedWebhook?.url}</code>
          </p>
          {testResult && (
            <div className={cn("p-4 rounded-lg mb-4 flex items-center gap-2", testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800')}>
              {testResult.success ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
              {testResult.message}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsTestModalOpen(false)}>Close</Button>
            <Button variant="primary" icon={Play} onClick={handleTest}>Send Test</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Webhook">
        <div className="p-6">
          <p className={cn("mb-6", theme.text.primary)}>
            Are you sure you want to delete <strong>{selectedWebhook?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDelete}>Delete Webhook</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WebhookManagement;
