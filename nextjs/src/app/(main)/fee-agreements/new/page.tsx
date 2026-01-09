/**
 * New Fee Agreement Page
 * @module app/fee-agreements/new/page
 * @status PRODUCTION READY
 * @description Integrated fee agreement creation with client search and validation
 */
"use client";

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useEntityAutocomplete } from '@/hooks/useEntityAutocomplete';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services/data/dataService';
import { Client } from '@/types';
import { ArrowLeft, Handshake, Save, Search, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

// Form Interface
interface FeeAgreementForm {
  clientId: string;
  type: string;
  rateTable: string;
  retainer: number;
  date: string;
  terms: string;
  clientName: string; // for display/validation
}

export default function NewFeeAgreementPage() {
  const router = useRouter();
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Validation
  const {
    values,
    errors,
    setFieldValue,
    validateForm,
    validateField,
    isValid,
  } = useEnhancedFormValidation<FeeAgreementForm>({
    clientId: '',
    type: 'hourly',
    rateTable: 'std_2024',
    retainer: 0,
    date: new Date().toISOString().split('T')[0],
    terms: '',
    clientName: ''
  });

  // Validation Rules
  const rules = useMemo(() => ({
    clientId: [(v: string) => !v ? 'Client selection is required' : null],
    date: [(v: string) => !v ? 'Effective date is required' : null],
    retainer: [(v: number) => v < 0 ? 'Retainer cannot be negative' : null],
  }), []);

  // Client Autocomplete
  const {
    inputValue: clientSearch,
    setInputValue: setClientSearch,
    options: clientOptions,
    isLoading: isLoadingClients,
    selectOption: selectClient,
    selectedOption: selectedClient
  } = useEntityAutocomplete<Client>({
    fetchFn: async (query) => {
      // Ensure we have at least 2 chars before searching to save API calls
      if (query.length < 2) return [];
      return await DataService.clients.search(query);
    },
    getLabel: (c) => c.name || 'Unknown Client',
    getValue: (c) => c.id,
    queryKey: ['clients', 'search'],
    debounceMs: 300
  });

  // Handle Client Selection
  const handleClientSelect = (client: Client) => {
    selectClient(client);
    setFieldValue('clientId', client.id);
    setFieldValue('clientName', client.name);
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const formErrors = await validateForm(rules);
    if (Object.keys(formErrors).some(k => formErrors[k as keyof FeeAgreementForm])) {
      notify({
        title: 'Validation Error',
        message: 'Please check the form for errors.',
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        clientId: values.clientId,
        type: values.type,
        rateTableId: values.rateTable, // Mapping to ID
        retainerRequired: values.retainer,
        effectiveDate: values.date,
        specialTerms: values.terms,
        status: 'Draft', // Default status
        clientName: values.clientName
      };

      await DataService.billing.createFeeAgreement(payload);

      notify({
        title: 'Success',
        message: 'Fee agreement created successfully.',
        type: 'success'
      });

      router.push('/fee-agreements');
    } catch (error) {
      console.error('Failed to create fee agreement:', error);
      notify({
        title: 'Error',
        message: 'Failed to create agreement. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Draft Fee Agreement"
        description="Create a new retainer or fee arrangement contract"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fee Agreements', href: '/fee-agreements' },
          { label: 'New Agreement' },
        ]}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                {/* Client Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Client <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        if (!e.target.value) {
                          setFieldValue('clientId', '');
                          setFieldValue('clientName', '');
                        }
                      }}
                      placeholder="Search Client by name..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.clientId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  {errors.clientId && (
                    <p className="mt-1 text-sm text-red-500">Client is required</p>
                  )}

                  {/* Results Dropdown */}
                  {clientSearch && clientOptions.length > 0 && !selectedClient && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingClients ? (
                        <div className="p-4 text-center text-slate-500">Loading...</div>
                      ) : (
                        clientOptions.map((client) => (
                          <div
                            key={client.id}
                            onClick={() => handleClientSelect(client)}
                            className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">{client.name}</div>
                              <div className="text-xs text-slate-500">{client.email}</div>
                            </div>
                            <Check className={`h-4 w-4 ${values.clientId === client.id ? 'text-emerald-500' : 'text-transparent'}`} />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Agreement Type
                    </label>
                    <select
                      value={values.type}
                      onChange={(e) => setFieldValue('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="hourly">Hourly Rate</option>
                      <option value="contingency">Contingency Fee</option>
                      <option value="flat">Flat Fee</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Rate Table
                    </label>
                    <select
                      value={values.rateTable}
                      onChange={(e) => setFieldValue('rateTable', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="std_2024">Standard 2024 Rates</option>
                      <option value="discount_10">VIP Discount (10%)</option>
                      <option value="custom">Custom Rates</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Retainer Amount ($)
                    </label>
                    <input
                      type="number"
                      value={values.retainer}
                      onChange={(e) => setFieldValue('retainer', parseFloat(e.target.value) || 0)}
                      onBlur={() => validateField('retainer', values.retainer, rules.retainer)}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                    {errors.retainer && <p className="mt-1 text-sm text-red-500">{errors.retainer}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Effective Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={values.date}
                      onChange={(e) => setFieldValue('date', e.target.value)}
                      onBlur={() => validateField('date', values.date, rules.date)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.date ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                    />
                    {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Special Terms / Notes
                  </label>
                  <textarea
                    value={values.terms}
                    onChange={(e) => setFieldValue('terms', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    placeholder="e.g. Travel expenses not to exceed $500 without client's approval..."
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/fee-agreements">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              icon={<Handshake className="h-4 w-4" />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Create Agreement
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
