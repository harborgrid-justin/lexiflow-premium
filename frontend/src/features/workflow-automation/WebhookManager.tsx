import React, { useState, useEffect } from 'react';
import { WebhookEndpoint } from './types';

/**
 * WebhookManager Component
 * Manage webhook endpoints and integrations
 */
export const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookEndpoint>>({
    name: '',
    url: '',
    method: 'POST',
    events: [],
    active: true,
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await fetch('/api/webhooks');
      // setWebhooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
      setLoading(false);
    }
  };

  const handleAddWebhook = async () => {
    try {
      // API call would go here
      // await fetch('/api/webhooks', { method: 'POST', body: newWebhook });
      alert('Webhook created successfully!');
      setShowAddModal(false);
      setNewWebhook({
        name: '',
        url: '',
        method: 'POST',
        events: [],
        active: true,
      });
      loadWebhooks();
    } catch (error) {
      console.error('Failed to create webhook:', error);
      alert('Failed to create webhook');
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      // API call would go here
      // await fetch(`/api/webhooks/${webhookId}/test`, { method: 'POST' });
      alert('Test webhook sent successfully!');
    } catch (error) {
      console.error('Failed to test webhook:', error);
      alert('Failed to test webhook');
    }
  };

  const handleToggleActive = async (webhookId: string, active: boolean) => {
    try {
      // API call would go here
      // await fetch(`/api/webhooks/${webhookId}`, { method: 'PATCH', body: { active } });
      loadWebhooks();
    } catch (error) {
      console.error('Failed to update webhook:', error);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      try {
        // API call would go here
        // await fetch(`/api/webhooks/${webhookId}`, { method: 'DELETE' });
        loadWebhooks();
      } catch (error) {
        console.error('Failed to delete webhook:', error);
      }
    }
  };

  const availableEvents = [
    'workflow.started',
    'workflow.completed',
    'workflow.failed',
    'step.completed',
    'approval.requested',
    'approval.granted',
    'approval.rejected',
    'document.uploaded',
    'matter.created',
    'invoice.generated',
    'task.created',
    '*',
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webhook Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage webhook endpoints for external integrations
          </p>
        </div>
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          Add Webhook
        </button>
      </div>

      {/* Webhooks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading webhooks...</p>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No webhooks configured</p>
          <button
            className="mt-4 text-blue-600 hover:text-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            Create your first webhook
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {webhook.name}
                    </h3>
                    {webhook.active && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded ${
                      webhook.status === 'active' ? 'bg-green-100 text-green-800' :
                      webhook.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {webhook.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <div className="font-mono">{webhook.method} {webhook.url}</div>
                    {webhook.description && <div className="mt-1">{webhook.description}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>Success: {webhook.successCount}</span>
                    <span>Failed: {webhook.failureCount}</span>
                    {webhook.lastDeliveredAt && (
                      <span>
                        Last: {new Date(webhook.lastDeliveredAt).toLocaleString()}
                      </span>
                    )}
                    {webhook.lastStatusCode && (
                      <span>Status: {webhook.lastStatusCode}</span>
                    )}
                  </div>
                  {webhook.lastError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      {webhook.lastError}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    onClick={() => handleTestWebhook(webhook.id)}
                  >
                    Test
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded ${
                      webhook.active
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    onClick={() => handleToggleActive(webhook.id, !webhook.active)}
                  >
                    {webhook.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    onClick={() => handleDelete(webhook.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Webhook Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Webhook</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="My Integration"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={newWebhook.method}
                  onChange={(e) => setNewWebhook({ ...newWebhook, method: e.target.value as any })}
                >
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Events (select all that apply)
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {availableEvents.map((event) => (
                    <label key={event} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={newWebhook.events?.includes(event)}
                        onChange={(e) => {
                          const events = e.target.checked
                            ? [...(newWebhook.events || []), event]
                            : newWebhook.events?.filter((e) => e !== event) || [];
                          setNewWebhook({ ...newWebhook, events });
                        }}
                      />
                      <span className="text-sm text-gray-700">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setShowAddModal(false);
                  setNewWebhook({
                    name: '',
                    url: '',
                    method: 'POST',
                    events: [],
                    active: true,
                  });
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                onClick={handleAddWebhook}
              >
                Create Webhook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookManager;
