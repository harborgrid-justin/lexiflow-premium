/**
 * Create Task Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useEntityAutocomplete } from '@/hooks/useEntityAutocomplete';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services/data/dataService';
import { Case, TaskPriorityBackend, TaskStatusBackend, User, WorkflowTask } from '@/types';
import { ArrowLeft, Check, Save, Search } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const metadata: Metadata = {
  title: 'Create Task | Tasks | LexiFlow',
  description: 'Create a new task assignment',
};

export default function NewTaskPage() {
  const router = useRouter();
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Form Validation Logic
  const {
    values,
    errors,
    setFieldValue,
    validateForm,
    validateField,
  } = useEnhancedFormValidation<CreateTaskForm>({
    title: '',
    description: '',
    caseId: '',
    caseTitle: '',
    assigneeId: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: TaskPriorityBackend.MEDIUM,
    status: TaskStatusBackend.TODO
  });

  const rules = useMemo(() => ({
    title: [(v: string) => !v ? 'Title is required' : null],
    assigneeId: [(v: string) => !v ? 'Assignee is required' : null],
    dueDate: [(v: string) => !v ? 'Due date is required' : null],
  }), []);

  // Load Users
  useEffect(() => {
    let mounted = true;
    const loadUsers = async () => {
      try {
        // In a real app, you might want to filter by active status or role
        const allUsers = await DataService.users.getAll();
        if (mounted) setUsers(allUsers || []);
      } catch (error) {
        console.error('Failed to load users', error);
        if (mounted) notify({ title: 'Error', message: 'Failed to load user list', type: 'error' });
      } finally {
        if (mounted) setIsLoadingUsers(false);
      }
    };
    loadUsers();
    return () => { mounted = false; };
  }, []);

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
    if (Object.keys(formErrors).some(k => formErrors[k as keyof CreateTaskForm])) {
      notify({ title: 'Validation Error', message: 'Please check form for errors', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);

      // Construct payload matching WorkflowTaskEntity (WorkflowTask + createdBy)
      // Note: DataService might generate ID if not provided, but we can generate one here for optimistic UI
      const newTask: Partial<WorkflowTask> = {
        id: uuidv4(),
        title: values.title,
        description: values.description,
        caseId: values.caseId || undefined,
        assignedTo: values.assigneeId,
        dueDate: values.dueDate,
        priority: values.priority,
        status: values.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // createdBy would be set by the backend/service based on auth context
      };

      await DataService.tasks.add(newTask as any);

      notify({ title: 'Success', message: 'Task created successfully', type: 'success' });
      router.push('/tasks');

    } catch (error) {
      console.error('Task creation failed:', error);
      notify({ title: 'Error', message: 'Failed to create task', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Create Task"
        description="Assign a new task to team members"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Tasks', href: '/tasks' },
          { label: 'New Task' },
        ]}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                {/* Task Info */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={values.title}
                    onChange={(e) => setFieldValue('title', e.target.value)}
                    placeholder="e.g. Draft Motion to Dismiss"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.title ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                      }`}
                  />
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Related Case
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
                        placeholder="Search case (Optional)..."
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Assignee <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={values.assigneeId}
                      onChange={(e) => setFieldValue('assigneeId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.assigneeId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                      disabled={isLoadingUsers}
                    >
                      <option value="">Select user...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                      ))}
                    </select>
                    {errors.assigneeId && <p className="text-sm text-red-500 mt-1">{errors.assigneeId}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={values.dueDate}
                      onChange={(e) => setFieldValue('dueDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 ${errors.dueDate ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        }`}
                    />
                    {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={values.priority}
                      onChange={(e) => setFieldValue('priority', e.target.value as TaskPriorityBackend)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      {Object.values(TaskPriorityBackend).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      value={values.status}
                      onChange={(e) => setFieldValue('status', e.target.value as TaskStatusBackend)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      {Object.values(TaskStatusBackend).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={values.description}
                    onChange={(e) => setFieldValue('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/tasks">
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
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
