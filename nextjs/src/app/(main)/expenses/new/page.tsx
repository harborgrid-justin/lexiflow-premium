/**
 * Add Expense entry page
 * @module app/expenses/new/page
 * @status PRODUCTION READY
 * @description Integrated expense logging with case association and real-time validation
 */
"use client";

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useEntityAutocomplete } from '@/hooks/useEntityAutocomplete';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services/data/dataService';
import { Case, CreateExpenseDto } from '@/types';
import { ArrowLeft, Check, Save, Search, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

// Form Interface
interface ExpenseForm extends Omit<CreateExpenseDto, 'amount'> {
  amount: string; // Handle input as string for better UX
  caseTitle: string;
}

const EXPENSE_CATEGORIES = [
  { value: 'travel', label: 'Travel' },
  { value: 'meals', label: 'Meals' },
  { value: 'court_fees', label: 'Court Fees' },
  { value: 'printing', label: 'Printing / Copies' },
  { value: 'research', label: 'Research Services' },
  { value: 'delivery', label: 'Courier / Delivery' },
  { value: 'filing_fees', label: 'Filing Fees' },
  { value: 'expert_witness', label: 'Expert Witness' },
  { value: 'other', label: 'Other' },
];

export default function NewExpensePage() {
  const router = useRouter();
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    values,
    errors,
    setFieldValue,
    validateForm,
  } = useEnhancedFormValidation<ExpenseForm>({
    caseId: '',
    caseTitle: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: '',
    description: '',
    billable: true,
    reimbursable: true,
    status: 'draft'
  });

  const rules = useMemo(() => ({
    caseId: [(v: string) => !v ? 'Related case is required' : null],
    amount: [(v: string) => !v || parseFloat(v) <= 0 ? 'Valid amount is required' : null],
    category: [(v: string) => !v ? 'Category is required' : null],
    date: [(v: string) => !v ? 'Date is required' : null],
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
    if (Object.keys(formErrors).some(k => formErrors[k as keyof ExpenseForm])) {
      notify({ title: 'Validation Error', message: 'Please fix the errors in the form', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateExpenseDto = {
        caseId: values.caseId,
        date: values.date,
        amount: parseFloat(values.amount),
        category: values.category,
        description: values.description,
        billable: values.billable,
        reimbursable: values.reimbursable,
        status: 'submitted'
      };

      await DataService.expenses.add(payload as any);

      notify({ title: 'Success', message: 'Expense logged successfully', type: 'success' });
      router.push('/expenses');

    } catch (error) {
      console.error('Failed to log expense', error);
      notify({ title: 'Error', message: 'Failed to log expense', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Log Expense"
        description="Record a new expense for billing or reimbursement"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Expenses', href: '/expenses' },
          { label: 'Log Expense' },
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
                      Case / Matter <span className="text-red-500">*</span>
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
                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.caseId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
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
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={values.date}
                      onChange={(e) => setFieldValue('date', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Expense Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={values.category}
                      onChange={(e) => setFieldValue('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.category ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                    >
                      <option value="">Select category...</option>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <input
                        type="number"
                        step="0.01"
                        value={values.amount}
                        onChange={(e) => setFieldValue('amount', e.target.value)}
                        className={`w-full pl-9 px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.amount ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description / Justification
                  </label>
                  <textarea
                    value={values.description}
                    onChange={(e) => setFieldValue('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex space-x-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={values.billable}
                      onChange={(e) => setFieldValue('billable', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Billable to Client</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={values.reimbursable}
                      onChange={(e) => setFieldValue('reimbursable', e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Reimbursable</span>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/expenses">
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
              Log Expense
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
