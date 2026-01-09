/**
 * Add New Motion Page
 * @module app/motions/new/page
 * @status PRODUCTION READY
 * @description Integrated motion filing with case association and type validation
 */
"use client";

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useEntityAutocomplete } from '@/hooks/useEntityAutocomplete';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services/data/dataService';
import { Case, Motion } from '@/types';
import { ArrowLeft, Check, Save, Search, Gavel } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Form Interface
interface CreateMotionForm {
    title: string;
    caseId: string;
    caseTitle: string;
    motionType: string;
    filedDate: string;
    hearingDate: string;
    movingParty: string;
    opposingParty: string;
    legalIssues: string; // Comma separated
    status: string;
}

const MOTION_TYPES = [
    { value: 'dismiss', label: 'Motion to Dismiss' },
    { value: 'summary_judgment', label: 'Summary Judgment' },
    { value: 'compel', label: 'Motion to Compel' },
    { value: 'limine', label: 'Motion in Limine' },
    { value: 'continuance', label: 'Motion for Continuance' },
    { value: 'sanctions', label: 'Motion for Sanctions' },
    { value: 'other', label: 'Other' }
];

const MOTION_STATUSES = [
    { value: 'filed', label: 'Filed' },
    { value: 'briefed', label: 'Briefed' },
    { value: 'argued', label: 'Argued' },
    { value: 'granted', label: 'Granted' },
    { value: 'denied', label: 'Denied' },
    { value: 'partially_granted', label: 'Partially Granted' }
];

export default function NewMotionPage() {
    const router = useRouter();
    const { notify } = useNotify();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        values,
        errors,
        setFieldValue,
        validateForm,
    } = useEnhancedFormValidation<CreateMotionForm>({
        title: '',
        caseId: '',
        caseTitle: '',
        motionType: '',
        filedDate: new Date().toISOString().split('T')[0],
        hearingDate: '',
        movingParty: 'plaintiff',
        opposingParty: 'defendant',
        legalIssues: '',
        status: 'filed'
    });

    const rules = useMemo(() => ({
        title: [(v: string) => !v ? 'Title is required' : null],
        caseId: [(v: string) => !v ? 'Related case is required' : null],
        motionType: [(v: string) => !v ? 'Motion type is required' : null],
        filedDate: [(v: string) => !v ? 'Filing date is required' : null],
        movingParty: [(v: string) => !v ? 'Moving party is required' : null],
    }), []);

    // Case Autocomplete
    const {
        inputValue: caseSearch,
        setInputValue: setCaseSearch,
        options: caseOptions,
        isLoading: isLoadingCases,
        selectOption: selectCase,
        selectedOption: selectedCase
    } = useEntityAutocomplete<Case>({
        fetchFn: async (query) => {
             if (query.length < 2) return [];
             return await DataService.cases.search(query);
        },
        getLabel: (c) => c.title || c.caseNumber || 'Untitled',
        getValue: (c) => c.id,
        queryKey: ['cases', 'search'],
        debounceMs: 300
    });

    const handleCaseSelect = (c: Case) => {
        selectCase(c);
        setFieldValue('caseId', c.id);
        setFieldValue('caseTitle', c.title);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const formErrors = await validateForm(rules);
        if (Object.keys(formErrors).some(k => formErrors[k as keyof CreateMotionForm])) {
             notify({ title: 'Validation Error', message: 'Please fix the errors in the form', type: 'error' });
             return;
        }

        try {
            setIsSubmitting(true);

            // Construct Motion Entity
            const payload: Partial<Motion> = {
                id: uuidv4(),
                title: values.title, // Extending Motion type if needed or mapping to 'motionType' detail
                caseId: values.caseId,
                motionType: values.motionType,
                filedDate: new Date(values.filedDate),
                hearingDate: values.hearingDate ? new Date(values.hearingDate) : undefined,
                movingParty: values.movingParty,
                opposingParty: values.opposingParty,
                legalIssues: values.legalIssues.split(',').map(s => s.trim()).filter(Boolean),
                citedCases: [],
                status: values.status as any, // Cast to union type
            };

            await DataService.motions.add(payload as any);

            notify({ title: 'Success', message: 'Motion filed successfully', type: 'success' });
            router.push('/motions');

        } catch (error) {
            console.error('Failed to file motion', error);
            notify({ title: 'Error', message: 'Failed to file motion', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <>
      <PageHeader
        title="File Motion"
        description="Create and track a new legal motion"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Litigation', href: '/litigation-strategy' },
          { label: 'Motions', href: '/motions' },
          { label: 'New Motion' },
        ]}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {/* Case Link */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Related Case <span className="text-red-500">*</span>
                    </label>
                     <div className="relative">
                        <input
                            type="text"
                            value={caseSearch}
                            onChange={(e) => {
                                setCaseSearch(e.target.value);
                                if (!e.target.value) {
                                    setFieldValue('caseId', '');
                                    setFieldValue('caseTitle', '');
                                }
                            }}
                            placeholder="Search case..."
                            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${
                                errors.caseId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            }`}
                        />
                         <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                     {/* Case Dropdown */}
                    {caseSearch && caseOptions.length > 0 && !selectedCase && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingCases ? (
                            <div className="p-4 text-center text-slate-500">Loading...</div>
                        ) : (
                            caseOptions.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => handleCaseSelect(c)}
                                className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-medium text-slate-900 dark:text-slate-100">{c.title}</div>
                                    <div className="text-xs text-slate-500">{c.caseNumber}</div>
                                </div>
                                <Check className={`h-4 w-4 ${values.caseId === c.id ? 'text-emerald-500' : 'text-transparent'}`} />
                            </div>
                            ))
                        )}
                        </div>
                    )}
                    {errors.caseId && <p className="text-sm text-red-500 mt-1">{errors.caseId}</p>}
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Motion Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={values.title}
                        onChange={(e) => setFieldValue('title', e.target.value)}
                        placeholder="e.g. Motion for Summary Judgment"
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${
                            errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                  />
                   {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={values.motionType}
                      onChange={(e) => setFieldValue('motionType', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${
                          errors.motionType ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <option value="">Select type...</option>
                      {MOTION_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                     {errors.motionType && <p className="text-sm text-red-500 mt-1">{errors.motionType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Moving Party <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={values.movingParty}
                      onChange={(e) => setFieldValue('movingParty', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="plaintiff">Plaintiff</option>
                      <option value="defendant">Defendant</option>
                      <option value="joint">Joint</option>
                      <option value="third_party">Third Party</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Filing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={values.filedDate}
                      onChange={(e) => setFieldValue('filedDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Hearing Date
                    </label>
                    <input
                      type="date"
                      value={values.hearingDate}
                      onChange={(e) => setFieldValue('hearingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={values.status}
                      onChange={(e) => setFieldValue('status', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      {MOTION_STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Legal Issues (Comma Separated)
                  </label>
                  <textarea
                    value={values.legalIssues}
                    onChange={(e) => setFieldValue('legalIssues', e.target.value)}
                    rows={3}
                    placeholder="e.g. Jurisdiction, Standing, Due Process"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/motions">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button
                type="submit"
                icon={<Gavel className="h-4 w-4" />}
                loading={isSubmitting}
                disabled={isSubmitting}
            >
              File Motion
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
