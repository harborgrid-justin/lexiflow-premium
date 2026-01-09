/**
 * New Docket Entry Page
 * @module app/docket/new/page
 * @status PRODUCTION READY
 * @description Integrated docket entry creation with real-time case search and validation
 */
"use client";

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useCaseList } from '@/hooks/useCaseList';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services/data/dataService';
import { Case, Party } from '@/types/case';
import { DocketEntryType } from '@/types/enums';
import { ArrowLeft, FileText, Save, Search, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';

// Form interface
interface DocketEntryForm {
  caseId: string;
  date: string;
  description: string;
  party: string;
  doc_number: string;
  type: DocketEntryType;
}

export default function NewDocketEntryPage() {
  const router = useRouter();
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Case Search Hooks
  const {
    filteredCases,
    searchTerm,
    setSearchTerm,
    isLoading: isLoadingCases
  } = useCaseList();

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCaseResults, setShowCaseResults] = useState(false);

  // Form Validation Hook
  const {
    values,
    errors,
    isDirty,
    isValid,
    isValidating,
    setFieldValue,
    validateField,
    validateForm,
    resetForm
  } = useEnhancedFormValidation<DocketEntryForm>({
    caseId: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    party: '',
    doc_number: '',
    type: 'Motion' as DocketEntryType
  });

  // Validation Rules
  const rules = useMemo(() => ({
    caseId: [(v: string) => !v ? 'Case selection is required' : null],
    date: [(v: string) => !v ? 'Filing date is required' : null],
    description: [(v: string) => !v ? 'Description is required' : v.length < 5 ? 'Description must be at least 5 characters' : null],
    party: [(v: string) => !v ? 'Filing party is required' : null],
  }), []);

  // Handle Case Selection
  const handleSelectCase = (c: Case) => {
    setSelectedCase(c);
    setFieldValue('caseId', c.id);
    setSearchTerm(c.title); // Show selected case title in search box
    setShowCaseResults(false);

    // Clear party selection if valid parties change
    setFieldValue('party', '');
  };

  // Derived Parties from Selected Case
  const availableParties = useMemo(() => {
    if (!selectedCase || !selectedCase.parties) return [];
    return selectedCase.parties;
  }, [selectedCase]);

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate all fields
    const formErrors = await validateForm(rules);
    if (Object.keys(formErrors).some(k => formErrors[k as keyof DocketEntryForm])) {
      notify({
        title: 'Validation Error',
        message: 'Please check the form for errors.',
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Construct payload
      const payload = {
        caseId: values.caseId,
        dateFiled: values.date,
        entryDate: new Date().toISOString(), // System entry date
        description: values.description,
        type: values.type,
        filedBy: values.party,
        docketNumber: values.doc_number || undefined,
        sequenceNumber: 0, // Backend handles this
      };

      // Call DataService
      await DataService.docket.add(payload as any); // Type assertion needed due to BaseEntity strictness

      notify({
        title: 'Success',
        message: 'Docket entry recorded successfully.',
        type: 'success'
      });

      router.push('/docket');
    } catch (error) {
      console.error('Failed to create docket entry:', error);
      notify({
        title: 'Error',
        message: 'Failed to record entry. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Docket Entry"
        description="Manually record a filing or event on the docket"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Docket', href: '/docket' },
          { label: 'New Entry' },
        ]}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                {/* Case Selection */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Case Reference <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowCaseResults(true);
                        if (!e.target.value) {
                          setSelectedCase(null);
                          setFieldValue('caseId', '');
                        }
                      }}
                      onFocus={() => setShowCaseResults(true)}
                      placeholder="Search for case by name or number..."
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.caseId ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500'
                        }`}
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  {errors.caseId && <p className="mt-1 text-sm text-red-500">{errors.caseId}</p>}

                  {/* Autocomplete Results */}
                  {showCaseResults && searchTerm && filteredCases.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingCases ? (
                        <div className="p-4 text-center text-slate-500">Loading cases...</div>
                      ) : (
                        filteredCases.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCase(c)}
                            className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">{c.title}</div>
                              <div className="text-sm text-slate-500">{c.caseNumber}</div>
                            </div>
                            {selectedCase?.id === c.id && <Check className="h-4 w-4 text-emerald-500" />}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Date & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Filing Date <span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Entry Type
                    </label>
                    <select
                      value={values.type}
                      onChange={(e) => setFieldValue('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="Motion">Motion</option>
                      <option value="Order">Order</option>
                      <option value="Pleading">Pleading</option>
                      <option value="Correspondence">Correspondence</option>
                      <option value="Minute Entry">Minute Entry</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Entry Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={values.description}
                    onChange={(e) => setFieldValue('description', e.target.value)}
                    onBlur={() => validateField('description', values.description, rules.description)}
                    placeholder="e.g. MOTION to Dismiss filed by Defendant..."
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.description ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                </div>

                {/* Party & Doc Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Filing Party <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={values.party}
                      onChange={(e) => setFieldValue('party', e.target.value)}
                      onBlur={() => validateField('party', values.party, rules.party)}
                      disabled={!selectedCase}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.party ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        } ${!selectedCase ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Party...</option>
                      <option value="Court">Court / Judge</option>
                      {availableParties.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({p.role})
                        </option>
                      ))}
                    </select>
                    {!selectedCase && (
                      <p className="mt-1 text-xs text-slate-500">Select a case first to see parties</p>
                    )}
                    {errors.party && <p className="mt-1 text-sm text-red-500">{errors.party}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={values.doc_number}
                      onChange={(e) => setFieldValue('doc_number', e.target.value)}
                      placeholder="e.g. 42"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                {/* Attachment Placeholder - Future: Use useDocumentManager */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Attachment
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer">
                    <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload PDF or drag and drop</p>
                    <p className="text-xs text-slate-400 mt-1">(File upload integration coming soon)</p>
                  </div>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/docket">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              icon={<Save className="h-4 w-4" />}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Record Entry
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
