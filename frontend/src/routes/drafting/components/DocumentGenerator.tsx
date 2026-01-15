import { validateVariableValues } from '@/api/domains/drafting/utils';
import { useToast } from '@/contexts/toast/ToastContext';
import {
  draftingApi,
  DraftingTemplate,
  GeneratedDocument,
  GenerateDocumentDto,
} from '@/lib/frontend-api';
import { apiClient } from '@/services/infrastructure/apiClient';
import { cn } from '@/lib/cn';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { TabNavigation } from '@/components/organisms/TabNavigation/TabNavigation';
import { useTheme } from '@/theme';
import { CheckCircle, Edit, Eye, FileSearch, FileText, FolderCheck, Layers, List, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface DocumentGeneratorProps {
  templateId?: string;
  caseId?: string;
  onComplete: (document: GeneratedDocument) => void;
  onCancel: () => void;
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  templateId,
  caseId,
  onComplete,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { addToast } = useToast();

  const [step, setStep] = useState<'template' | 'variables' | 'clauses' | 'preview' | 'save'>('template');
  const [templates, setTemplates] = useState<DraftingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DraftingTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, unknown>>({});
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [availableClauses, setAvailableClauses] = useState<unknown[]>([]);
  const [cases, setCases] = useState<unknown[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(caseId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Effect discipline: Synchronize with external data sources (Principle #6)
  // Strict Mode ready: Runs twice in dev, idempotent (Principle #7)
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [templatesData, casesData, clausesData] = await Promise.all([
          draftingApi.getAllTemplates(),
          apiClient.get<unknown[]>('/cases'),
          apiClient.get<unknown[]>('/clauses'),
        ]);

        // Only update state if component is still mounted
        if (isMounted) {
          setTemplates(Array.isArray(templatesData) ? templatesData : []);
          setCases(Array.isArray(casesData) ? casesData : []);
          setAvailableClauses(Array.isArray(clausesData) ? clausesData : []);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load data:', error);
          addToast('Failed to load data', 'error');
        }
      }
    };

    loadData();

    // Cleanup: Prevent state updates after unmount (Principle #6)
    return () => {
      isMounted = false;
    };
  }, [addToast]);

  // Template-specific loading effect
  useEffect(() => {
    if (!templateId) return;

    let isMounted = true;

    const loadData = async () => {
      try {
        const template = await draftingApi.getTemplateById(templateId);
        if (!isMounted) return;

        setSelectedTemplate(template);
        setTitle(`${template.name} - ${new Date().toLocaleDateString()}`);

        // Initialize variable values with defaults
        const initialValues: Record<string, unknown> = {};
        template.variables.forEach((v) => {
          initialValues[v.name] = v.defaultValue || '';
        });
        setVariableValues(initialValues);
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load template:', error);
          addToast('Failed to load template', 'error');
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [templateId, addToast]);

  const loadTemplate = async (id: string) => {
    try {
      const template = await draftingApi.getTemplateById(id);
      setSelectedTemplate(template);
      setTitle(`${template.name} - ${new Date().toLocaleDateString()}`);

      // Initialize variable values with defaults
      const initialValues: Record<string, unknown> = {};
      template.variables.forEach((v) => {
        initialValues[v.name] = v.defaultValue || '';
      });
      setVariableValues(initialValues);
      setStep('variables');
    } catch (error) {
      console.error('Failed to load template:', error);
      addToast('Failed to load template', 'error');
    }
  };

  const handleSelectTemplate = (template: DraftingTemplate) => {
    loadTemplate(template.id);
  };

  const tabs = [
    { id: 'template', label: 'Template', icon: List },
    { id: 'variables', label: 'Variables', icon: Edit },
    ...(selectedTemplate?.clauseReferences && selectedTemplate.clauseReferences.length > 0
      ? [{ id: 'clauses', label: 'Clauses', icon: Layers }]
      : []),
    { id: 'preview', label: 'Preview', icon: FileSearch },
    { id: 'save', label: 'Save', icon: FolderCheck },
  ];

  const generatePreview = useCallback(async () => {
    if (!selectedTemplate) return '';

    try {
      interface ClauseType {
        id: string;
        content?: string;
      }
      interface CaseType {
        id: string;
        [key: string]: unknown;
      }

      const clauseContent: Record<string, string> = {};
      selectedClauses.forEach((clauseId) => {
        const clause = availableClauses.find((c): c is ClauseType =>
          typeof c === 'object' && c !== null && 'id' in c && (c as ClauseType).id === clauseId
        );
        if (clause && clause.content) {
          clauseContent[clauseId] = clause.content;
        }
      });

      const enrichedValues = { ...variableValues };
      if (selectedCaseId) {
        const selectedCase = cases.find((c): c is CaseType =>
          typeof c === 'object' && c !== null && 'id' in c && (c as CaseType).id === selectedCaseId
        );
        if (selectedCase) {
          enrichedValues.case = selectedCase;
        }
      }

      // Simple preview generation using template interpolation
      let preview = selectedTemplate.content || '';
      Object.entries(enrichedValues).forEach(([key, value]) => {
        preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), String(value || ''));
      });

      // Append clause content
      if (clauseContent) {
        preview += '\n\n' + clauseContent;
      }

      return preview;
    } catch (error) {
      console.error('Failed to generate preview:', error);
      addToast('Failed to generate preview', 'error');
      return '';
    }
  }, [selectedTemplate, selectedClauses, availableClauses, variableValues, selectedCaseId, cases, addToast]);

  const validateCurrentStep = async (): Promise<boolean> => {
    setValidationErrors({});

    if (step === 'variables' && selectedTemplate) {
      const validation = validateVariableValues(
        selectedTemplate,
        variableValues
      );

      if (!validation.isValid) {
        setValidationErrors({ variables: validation.missing });
        const errorCount = validation.missing.length;
        addToast(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}`, 'error');
        return false;
      }
      setValidationErrors({});
    }

    if (step === 'clauses' && selectedClauses.length > 0) {
      interface ClauseType {
        id: string;
        title?: string;
        content?: string;
      }
      const clausesToValidate = availableClauses.filter((c): c is ClauseType =>
        typeof c === 'object' && c !== null && 'id' in c && selectedClauses.includes((c as ClauseType).id)
      );
      // Simple clause validation - check for duplicates
      const clauseIds = new Set(clausesToValidate.map(c => c.id));
      const validation = {
        isValid: clauseIds.size === clausesToValidate.length,
        conflicts: clauseIds.size !== clausesToValidate.length ? [{ clause1: '', clause2: '', reason: 'Duplicate clauses detected' }] : []
      };

      if (!validation.isValid) {
        const errors = validation.conflicts
          .map((c: { reason: string }) => c.reason);
        addToast(`Clause conflicts detected: ${errors.join('; ')}`, 'error');
        return false;
      }
    }

    return true;
  };


  const handleGenerate = async () => {
    if (!selectedTemplate) {
      addToast('No template selected', 'error');
      return;
    }

    if (!title.trim()) {
      addToast('Document title is required', 'warning');
      return;
    }

    // Final validation before generation
    if (!(await validateCurrentStep())) {
      return;
    }

    setLoading(true);
    try {
      // Validate variables one more time
      const validation = validateVariableValues(
        selectedTemplate,
        variableValues
      );

      if (!validation.isValid) {
        const errorMessages = validation.missing.join(', ');
        addToast(`Validation failed: Missing required fields: ${errorMessages}`, 'error');
        setLoading(false);
        return;
      }

      const dto: GenerateDocumentDto = {
        title,
        description,
        templateId: selectedTemplate.id,
        caseId: selectedCaseId,
        variableValues, // Use validated values
        includedClauses: selectedClauses,
      };

      const document = await draftingApi.generateDocument(dto);

      addToast('Document generated successfully!', 'success');
      onComplete(document);
    } catch (error: unknown) {
      console.error('Failed to generate document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate document';
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPreview = useCallback(async () => {
    setLoading(true);
    try {
      const preview = await generatePreview();
      setPreviewContent(preview);
      addToast('Preview refreshed', 'success');
    } finally {
      setLoading(false);
    }
  }, [generatePreview, addToast]);

  // Automatically refresh preview when moving to preview tab
  useEffect(() => {
    if (step === 'preview') {
      handleRefreshPreview();
    }
  }, [step, handleRefreshPreview]);

  const renderTemplateSelection = () => (
    <div className="space-y-4">
      <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
        Select a Template
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className={cn(
              "p-4 border-2 rounded-lg cursor-pointer transition-all",
              selectedTemplate?.id === template.id
                ? cn(theme.primary.border, theme.status.info.bg)
                : cn(theme.border.default, `hover:${theme.border.focused}`)
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <FileText className={cn("h-6 w-6", theme.primary.text)} />
              {selectedTemplate?.id === template.id && (
                <CheckCircle className={cn("h-5 w-5", theme.primary.text)} />
              )}
            </div>
            <h4 className={cn("font-semibold mb-1", theme.text.primary)}>
              {template.name}
            </h4>
            <p className={cn("text-sm mb-2 line-clamp-2", theme.text.secondary)}>
              {template.description || 'No description'}
            </p>
            <div className={cn("flex items-center gap-2 text-xs", theme.text.tertiary)}>
              <span className={cn("px-2 py-1 rounded", theme.surface.active)}>
                {template.category}
              </span>
              {template.jurisdiction && (
                <span className={cn("px-2 py-1 rounded", theme.surface.active)}>
                  {template.jurisdiction}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVariableInputs = () => (
    <div className="space-y-4">
      <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
        Fill Template Variables
      </h3>

      {/* Case Selection */}
      <div>
        <label className={cn("block text-sm font-medium mb-1", theme.text.primary)}>
          Associated Case (Optional)
        </label>
        <select
          value={selectedCaseId || ''}
          onChange={(e) => setSelectedCaseId(e.target.value || undefined)}
          className={cn(
            "w-full px-3 py-2 border rounded-lg transition-colors",
            theme.surface.input,
            theme.text.primary,
            theme.border.default,
            "focus:outline-none focus:ring-2",
            theme.border.focused
          )}
        >
          <option value="">No case selected</option>
          {cases.map((c: unknown) => {
            const caseItem = c as { id: string; caseNumber?: string; title?: string };
            return (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.caseNumber || 'N/A'} - {caseItem.title || 'Untitled'}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedTemplate?.variables.map((variable) => (
          <div key={variable.name}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {variable.label} {variable.required && <span className="text-red-500">*</span>}
            </label>
            {variable.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{variable.description}</p>
            )}

            {variable.type === 'text' && (
              <input
                type="text"
                value={String(variableValues[variable.name] || '')}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                  validationErrors[variable.name]
                    ? "border-red-500 focus:ring-red-500"
                    : cn(theme.border.default, theme.border.focused)
                )}
                required={variable.required}
              />
            )}

            {variable.type === 'date' && (
              <input
                type="date"
                value={String(variableValues[variable.name] || '')}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                  validationErrors[variable.name]
                    ? "border-red-500 focus:ring-red-500"
                    : cn(theme.border.default, theme.border.focused)
                )}
                required={variable.required}
              />
            )}

            {variable.type === 'number' && (
              <input
                type="number"
                value={String(variableValues[variable.name] || '')}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                  validationErrors[variable.name]
                    ? "border-red-500 focus:ring-red-500"
                    : cn(theme.border.default, theme.border.focused)
                )}
                required={variable.required}
              />
            )}

            {variable.type === 'select' && variable.options && (
              <select
                value={String(variableValues[variable.name] || '')}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2",
                  validationErrors[variable.name]
                    ? "border-red-500 focus:ring-red-500"
                    : cn(theme.border.default, theme.border.focused)
                )}
                required={variable.required}
              >
                <option value="">Select...</option>
                {variable.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {/* Display validation errors for this field */}
            {validationErrors[variable.name] && (
              <div className="mt-1">
                {validationErrors[variable.name]?.map((error, idx) => (
                  <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                    {error}
                  </p>
                ))}
              </div>
            )}

            {variable.type === 'boolean' && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Boolean(variableValues[variable.name])}
                  onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Yes</span>
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderClauseSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Select Clauses to Include
      </h3>
      <div className="space-y-3">
        {selectedTemplate?.clauseReferences?.map((ref, index) => (
          <div key={`clause-ref-${ref.clauseId}-${index}`} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={!!selectedClauses[index]}
                onChange={(e) => {
                  const newClauses = [...selectedClauses];
                  if (e.target.checked) {
                    newClauses[index] = ref.clauseId;
                  } else {
                    newClauses[index] = '';
                  }
                  setSelectedClauses(newClauses);
                }}
                disabled={!ref.isOptional}
                className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">
                    Position {index}
                  </h4>
                  {ref.isOptional && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">Optional</span>
                  )}
                </div>
                <select
                  value={selectedClauses[index] || ref.clauseId}
                  onChange={(e) => {
                    const newClauses = [...selectedClauses];
                    newClauses[index] = e.target.value;
                    setSelectedClauses(newClauses);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select clause...</option>
                  {availableClauses.map((c: unknown) => {
                    const clause = c as { id: string; title?: string };
                    return (
                      <option key={clause.id} value={clause.id}>
                        {clause.title || 'Untitled Clause'}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Preview Document
      </h3>
      <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 min-h-[500px]">
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
          {previewContent}
        </div>
      </div>
    </div>
  );

  const renderSaveForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Save Document
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Document Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter document title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("h-full flex flex-col animate-fade-in", theme.background)}>
      {/* Header */}
      <div className="px-6 pt-6 shrink-0">
        <PageHeader
          title="Generate Document"
          subtitle="Create a new document from template"
          actions={
            <button
              onClick={onCancel}
              className={cn(
                "p-2 rounded-lg transition-colors",
                theme.text.secondary,
                `hover:${theme.surface.highlight}`
              )}
            >
              <X className="h-5 w-5" />
            </button>
          }
        />
      </div>

      {/* Tab Navigation */}
      <div className="px-6">
        <TabNavigation
          tabs={tabs}
          activeTab={step}
          onTabChange={(id) => setStep(id as typeof step)}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {step === 'template' && renderTemplateSelection()}
          {step === 'variables' && renderVariableInputs()}
          {step === 'clauses' && renderClauseSelection()}
          {step === 'preview' && renderPreview()}
          {step === 'save' && renderSaveForm()}
        </div>
      </div>

      {/* Footer */}
      <div className={cn("flex items-center justify-between px-6 py-4 border-t", theme.border.default)}>
        <button
          onClick={onCancel}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
            theme.action.secondary.bg,
            theme.action.secondary.text,
            theme.action.secondary.border,
            theme.action.secondary.hover
          )}
        >
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </button>

        <div className="flex items-center gap-2">
          {step === 'preview' && (
            <button
              onClick={async () => {
                const preview = await generatePreview();
                setPreviewContent(preview);
                addToast('Preview refreshed', 'success');
              }}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                theme.action.secondary.bg,
                theme.action.secondary.text,
                theme.action.secondary.border,
                theme.action.secondary.hover
              )}
            >
              <Eye className="h-4 w-4" />
              <span>Refresh Preview</span>
            </button>
          )}

          {step === 'save' && (
            <button
              onClick={handleGenerate}
              disabled={loading || !title.trim()}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                theme.action.primary.bg,
                theme.action.primary.text,
                theme.action.primary.hover,
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Generating...' : 'Generate Document'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
