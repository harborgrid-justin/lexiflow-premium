/**
 * Hook for managing connection form state
 * Encapsulates form state and validation for creating new connections.
 */

import { useState } from 'react';

import { DEFAULT_CONNECTION_FORM } from '../constants';

import type { ConnectionFormData } from '../types';

export function useConnectionForm() {
  const [formData, setFormData] = useState<ConnectionFormData>(DEFAULT_CONNECTION_FORM);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const resetForm = () => {
    setFormData(DEFAULT_CONNECTION_FORM);
    setSelectedProvider(null);
    setIsAdding(false);
  };

  const updateField = <K extends keyof ConnectionFormData>(field: K, value: ConnectionFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    selectedProvider,
    isAdding,
    setFormData,
    setSelectedProvider,
    setIsAdding,
    resetForm,
    updateField,
  };
}
