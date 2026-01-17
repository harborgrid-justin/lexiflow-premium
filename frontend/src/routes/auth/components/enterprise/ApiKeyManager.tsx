/**
 * ApiKeyManager Component
 * Enterprise API key management interface
 *
 * Features:
 * - Create new API keys with scopes
 * - View and manage existing keys
 * - Revoke/delete API keys
 * - Copy keys to clipboard
 * - Expiration date management
 * - Scope/permission configuration
 * - Last used tracking
 * - Secure key display (one-time reveal)
 * - WCAG 2.1 AA compliant
 */

import React, { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { ApiKeysApiService } from '@/lib/frontend-api';

import type { ApiKey } from '@/types';

const apiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  scopes: z.array(z.string()).min(1, 'At least one scope is required'),
  expiresAt: z.string().optional(),
});

type ApiKeyFormData = z.infer<typeof apiKeySchema>;

export interface ApiKeyManagerProps {
  onKeyCreated?: (apiKey: ApiKey) => void;
  onKeyRevoked?: (apiKey: ApiKey) => void;
  className?: string;
}

interface FormErrors {
  [key: string]: string;
}

interface AvailableScope {
  id: string;
  label: string;
  description: string;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  onKeyCreated,
  onKeyRevoked,
  className = '',
}) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [availableScopes, setAvailableScopes] = useState<AvailableScope[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: '',
    scopes: [],
    expiresAt: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const apiKeysService = React.useMemo(() => new ApiKeysApiService(), []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [keys, scopes] = await Promise.all([
        apiKeysService.getAll(),
        apiKeysService.getAvailableScopes(),
      ]);

      setApiKeys(keys);
      setAvailableScopes(scopes);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load API keys';
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }, [apiKeysService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (field: keyof ApiKeyFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleScopeToggle = (scopeId: string) => {
    setFormData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scopeId)
        ? prev.scopes.filter((s) => s !== scopeId)
        : [...prev.scopes, scopeId],
    }));
    if (errors.scopes) {
      setErrors((prev) => ({ ...prev, scopes: '' }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      apiKeySchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        err.issues.forEach((e: z.ZodIssue) => {
          const field = e.path[0] as string;
          fieldErrors[field] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setIsCreating(true);

    try {
      const newKey = await apiKeysService.create({
        name: formData.name,
        scopes: formData.scopes,
        expiresAt: formData.expiresAt || undefined,
      });

      setNewlyCreatedKey(newKey.key);
      setApiKeys((prev) => [newKey, ...prev]);
      onKeyCreated?.(newKey);

      // Reset form
      setFormData({
        name: '',
        scopes: [],
        expiresAt: '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create API key';
      setErrors({ general: message });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone and the key will stop working immediately.')) {
      return;
    }

    setRevokingKeyId(keyId);

    try {
      const revokedKey = await apiKeysService.revoke(keyId);
      setApiKeys((prev) => prev.map((key) => (key.id === keyId ? revokedKey : key)));
      onKeyRevoked?.(revokedKey);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to revoke API key';
      setErrors({ general: message });
    } finally {
      setRevokingKeyId(null);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await apiKeysService.delete(keyId);
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete API key';
      setErrors({ general: message });
    }
  };

  const handleCopyKey = async (key: string, keyId: string) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        setErrors({ general: 'Clipboard not available' });
        return;
      }
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      setErrors({ general: 'Failed to copy to clipboard' });
      console.error('Clipboard error:', error);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (dateString?: string): boolean => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getStatusBadge = (apiKey: ApiKey): React.JSX.Element => {
    if (apiKey.status === 'revoked') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Revoked
        </span>
      );
    }

    if (isExpired(apiKey.expiresAt)) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Expired
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage API keys for programmatic access to LexiFlow
              </p>
            </div>
            {!showCreateForm && !newlyCreatedKey && (
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Key
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {newlyCreatedKey && (
            <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">Save your API key</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p className="mb-3">
                      This is the only time you will see this key. Copy it now and store it securely.
                    </p>
                    <div className="flex items-center bg-white border border-yellow-300 rounded-lg p-3 font-mono text-sm">
                      <code className="flex-1 break-all">{newlyCreatedKey}</code>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(newlyCreatedKey, 'new')}
                        className="ml-3 flex-shrink-0 text-yellow-700 hover:text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1"
                        aria-label="Copy API key"
                      >
                        {copiedKeyId === 'new' ? (
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setNewlyCreatedKey(null)}
                      className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline focus:outline-none"
                    >
                      I've saved my key
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showCreateForm && (
            <form onSubmit={handleCreateSubmit} className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New API Key</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="key-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Key Name *
                  </label>
                  <input
                    type="text"
                    id="key-name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="e.g., Production Server, Mobile App"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    disabled={isCreating}
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expires-at" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="expires-at"
                    value={formData.expiresAt}
                    onChange={handleInputChange('expiresAt')}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isCreating}
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scopes * (Select at least one)
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white">
                    {availableScopes.map((scope) => (
                      <label
                        key={scope.id}
                        className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.scopes.includes(scope.id)}
                          onChange={() => handleScopeToggle(scope.id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isCreating}
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{scope.label}</span>
                          <p className="text-xs text-gray-500">{scope.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.scopes && (
                    <p className="mt-1 text-sm text-red-600">{errors.scopes}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ name: '', scopes: [], expiresAt: '' });
                    setErrors({});
                  }}
                  disabled={isCreating}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create API Key'}
                </button>
              </div>
            </form>
          )}

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new API key.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{apiKey.name}</h4>
                        {getStatusBadge(apiKey)}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center">
                          <span className="font-medium w-24">Key ID:</span>
                          <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{apiKey.id}</code>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-24">Created:</span>
                          <span>{formatDate(apiKey.createdAt)}</span>
                        </div>
                        {apiKey.expiresAt && (
                          <div className="flex items-center">
                            <span className="font-medium w-24">Expires:</span>
                            <span className={isExpired(apiKey.expiresAt) ? 'text-red-600 font-medium' : ''}>
                              {formatDate(apiKey.expiresAt)}
                            </span>
                          </div>
                        )}
                        {apiKey.lastUsedAt && (
                          <div className="flex items-center">
                            <span className="font-medium w-24">Last Used:</span>
                            <span>{formatDate(apiKey.lastUsedAt)}</span>
                          </div>
                        )}
                        <div className="flex items-start">
                          <span className="font-medium w-24">Scopes:</span>
                          <div className="flex flex-wrap gap-1">
                            {apiKey.scopes.map((scope) => (
                              <span
                                key={scope}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      {apiKey.status === 'active' && !isExpired(apiKey.expiresAt) && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(apiKey.id)}
                          disabled={revokingKeyId === apiKey.id}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded text-xs font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {revokingKeyId === apiKey.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                      {(apiKey.status === 'revoked' || isExpired(apiKey.expiresAt)) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-gray-700">
                API keys are used to authenticate requests to the LexiFlow API. Keep your keys secure and never share them publicly. Revoke keys immediately if they are compromised.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
