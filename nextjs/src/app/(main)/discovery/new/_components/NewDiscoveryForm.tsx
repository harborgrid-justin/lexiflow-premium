'use client';

/**
 * New Discovery Request Form Component
 * Client component with form validation and submission
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardBody, Input, Select } from '@/components/ui';
import { Save, X, FileText, Calendar, Users, MessageSquare } from 'lucide-react';
import { createDiscoveryRequest } from '../../_actions';
import {
  DiscoveryRequestType,
  type CreateDiscoveryRequestInput,
  type DiscoveryRequestTypeValue,
} from '../../_types';

const requestTypeOptions = [
  { value: DiscoveryRequestType.INTERROGATORIES, label: 'Interrogatories' },
  { value: DiscoveryRequestType.PRODUCTION, label: 'Request for Production' },
  { value: DiscoveryRequestType.ADMISSION, label: 'Request for Admission' },
  { value: DiscoveryRequestType.DEPOSITION, label: 'Deposition Notice' },
  { value: DiscoveryRequestType.SUBPOENA, label: 'Subpoena' },
];

export function NewDiscoveryForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<CreateDiscoveryRequestInput>>({
    title: '',
    description: '',
    requestType: DiscoveryRequestType.PRODUCTION,
    propoundingParty: '',
    respondingParty: '',
    dueDate: '',
    caseId: '',
  });

  const handleChange = (field: keyof CreateDiscoveryRequestInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.requestType) {
      newErrors.requestType = 'Request type is required';
    }
    if (!formData.propoundingParty?.trim()) {
      newErrors.propoundingParty = 'Propounding party is required';
    }
    if (!formData.respondingParty?.trim()) {
      newErrors.respondingParty = 'Responding party is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (!formData.caseId?.trim()) {
      newErrors.caseId = 'Case is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      const result = await createDiscoveryRequest(formData as CreateDiscoveryRequestInput);

      if (result.success && result.data) {
        router.push(`/discovery/${result.data.id}`);
      } else {
        setErrors({ submit: result.error || 'Failed to create discovery request' });
      }
    });
  };

  const handleCancel = () => {
    router.push('/discovery');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title *
                  </label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., First Set of Interrogatories to Defendant"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Request Type *
                  </label>
                  <Select
                    value={formData.requestType || ''}
                    onChange={(e) => handleChange('requestType', e.target.value as DiscoveryRequestTypeValue)}
                    className={errors.requestType ? 'border-red-500' : ''}
                  >
                    <option value="">Select request type</option>
                    {requestTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.requestType && (
                    <p className="text-sm text-red-600 mt-1">{errors.requestType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the scope and purpose of this discovery request..."
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Parties */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Parties
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Propounding Party *
                  </label>
                  <Input
                    value={formData.propoundingParty || ''}
                    onChange={(e) => handleChange('propoundingParty', e.target.value)}
                    placeholder="Party serving the request"
                    className={errors.propoundingParty ? 'border-red-500' : ''}
                  />
                  {errors.propoundingParty && (
                    <p className="text-sm text-red-600 mt-1">{errors.propoundingParty}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Responding Party *
                  </label>
                  <Input
                    value={formData.respondingParty || ''}
                    onChange={(e) => handleChange('respondingParty', e.target.value)}
                    placeholder="Party receiving the request"
                    className={errors.respondingParty ? 'border-red-500' : ''}
                  />
                  {errors.respondingParty && (
                    <p className="text-sm text-red-600 mt-1">{errors.respondingParty}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Due Date */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Timeline
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Response Due Date *
                </label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600 mt-1">{errors.dueDate}</p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Standard response time is 30 days from service under FRCP Rule 33/34
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Selection */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Case
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Case *
                </label>
                <Select
                  value={formData.caseId || ''}
                  onChange={(e) => handleChange('caseId', e.target.value)}
                  className={errors.caseId ? 'border-red-500' : ''}
                >
                  <option value="">Select a case</option>
                  <option value="case-001">Smith v. Jones (2024-CV-001)</option>
                  <option value="case-002">ABC Corp v. XYZ Inc (2024-CV-002)</option>
                  <option value="case-003">State v. Williams (2024-CR-001)</option>
                </Select>
                {errors.caseId && (
                  <p className="text-sm text-red-600 mt-1">{errors.caseId}</p>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Help */}
          <Card>
            <CardBody>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Be specific about what documents or information you are requesting
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Set appropriate date ranges to narrow the scope
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Consider proportionality to the needs of the case
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">•</span>
                  Track all discovery in one place for easy management
                </li>
              </ul>
            </CardBody>
          </Card>

          {/* Actions */}
          <Card>
            <CardBody>
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                  icon={<Save className="h-4 w-4" />}
                >
                  {isPending ? 'Creating...' : 'Create Request'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={isPending}
                  icon={<X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </form>
  );
}
