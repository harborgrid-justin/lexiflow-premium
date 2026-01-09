/**
 * New Document / Upload Page
 * @module app/documents/new/page
 * @status PRODUCTION READY
 * @description Integrated document upload with case association and metadata validation
 */
"use client";

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody } from '@/components/ui';
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';
import { useEntityAutocomplete } from '@/hooks/useEntityAutocomplete';
import { useNotify } from '@/hooks/useNotify';
import { DataService } from '@/services/data/dataService';
import { Case, LegalDocument } from '@/types';
import { ArrowLeft, CloudUpload, FileUp, Check, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useRef } from 'react';

// Form Interface
interface UploadDocumentForm {
  title: string;
  type: string;
  caseId: string;
  caseTitle: string;
  date: string;
  tags: string;
  privileged: boolean;
  ocr: boolean;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const { notify } = useNotify();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Validation
  const {
    values,
    errors,
    setFieldValue,
    validateForm,
    validateField,
  } = useEnhancedFormValidation<UploadDocumentForm>({
    title: '',
    type: 'pleading',
    caseId: '',
    caseTitle: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    privileged: false,
    ocr: true
  });

  // Validation Rules
  const rules = useMemo(() => ({
    caseId: [(v: string) => !v ? 'Related case is required' : null],
    type: [(v: string) => !v ? 'Document type is required' : null],
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

  // Handle Case Select
  const handleCaseSelect = (c: Case) => {
    selectCase(c);
    setFieldValue('caseId', c.id);
    setFieldValue('caseTitle', c.title);
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-populate title if empty
      if (!values.title) {
        setFieldValue('title', file.name);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!values.title) {
        setFieldValue('title', file.name);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedFile) {
      notify({ title: 'Error', message: 'Please select a file to upload', type: 'error' });
      return;
    }

    const formErrors = await validateForm(rules);
    if (Object.keys(formErrors).some(k => formErrors[k as keyof UploadDocumentForm])) {
      notify({
        title: 'Validation Error',
        message: 'Please check the form for errors.',
        type: 'error'
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const meta: Partial<LegalDocument> = {
        title: values.title,
        type: values.type as any, // Cast to enum
        caseId: values.caseId,
        date: values.date,
        tags: values.tags.split(',').map(t => t.trim()).filter(Boolean),
        isPrivileged: values.privileged,
        // OCR flag would be handled by backend logic or job queue
      };

      await DataService.documents.uploadDocument(selectedFile, meta);

      notify({
        title: 'Success',
        message: 'Document uploaded successfully.',
        type: 'success'
      });

      router.push('/documents');
    } catch (error) {
      console.error('Failed to upload document:', error);
      notify({
        title: 'Error',
        message: 'Failed to upload document. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Upload Document"
        description="Add a new file to the document management system"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Documents', href: '/documents' },
          { label: 'Upload' },
        ]}
      />

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-6">

                {/* Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${selectedFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.txt,.rtf,.msg,.eml,.xlsx,.xls,.png,.jpg,.jpeg"
                  />

                  {selectedFile ? (
                    <div>
                      <FileUp className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">{selectedFile.name}</h3>
                      <p className="text-sm text-slate-500 mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <CloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">Drag and drop file here</h3>
                      <p className="text-sm text-slate-500 mb-4">or click to browse from your computer</p>
                      <Button type="button" variant="outline" size="sm">Select File</Button>
                      <p className="text-xs text-slate-400 mt-4">Supported: PDF, DOCX, MSG, EML, XLSX (Max 50MB)</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={values.title}
                      onChange={(e) => setFieldValue('title', e.target.value)}
                      placeholder="File name will be used if blank"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Category / Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={values.type}
                      onChange={(e) => setFieldValue('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    >
                      <option value="pleading">Pleading / Court Filing</option>
                      <option value="correspondence">Correspondence</option>
                      <option value="evidence">Evidence / Discovery</option>
                      <option value="contract">Contract / Agreement</option>
                      <option value="memo">Memo / Notes</option>
                      <option value="admin">Administrative</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {errors.caseId && <p className="mt-1 text-sm text-red-500">Related case is required</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Document Date
                    </label>
                    <input
                      type="date"
                      value={values.date}
                      onChange={(e) => setFieldValue('date', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags / Keywords
                  </label>
                  <input
                    type="text"
                    value={values.tags}
                    onChange={(e) => setFieldValue('tags', e.target.value)}
                    placeholder="Comma separated tags..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Options</h4>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={values.privileged}
                      onChange={(e) => setFieldValue('privileged', e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Privileged</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={values.ocr}
                      onChange={(e) => setFieldValue('ocr', e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Run OCR (Text Recognition)</span>
                  </label>
                </div>

              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between">
            <Link href="/documents">
              <Button type="button" variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              icon={<FileUp className="h-4 w-4" />}
              disabled={isSubmitting || !selectedFile}
              loading={isSubmitting}
            >
              Start Upload
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
