import React, { useState, useEffect } from 'react';
import { FileText, ArrowRight, ArrowLeft, Save, Eye, X, CheckCircle } from 'lucide-react';
import { useTheme } from '../../../providers/ThemeContext';
import { useToast } from '../../../providers/ToastContext';
import { draftingApi, DraftingTemplate, TemplateVariable, GenerateDocumentDto, GeneratedDocument } from '../../../api/domains/drafting.api';
import { api } from '../../../api';

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
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [availableClauses, setAvailableClauses] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>(caseId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadInitialData = async () => {
    try {
      const [templatesData, casesData, clausesData] = await Promise.all([
        draftingApi.getAllTemplates(),
        api.cases.getAll(),
        api.clauses.getAll(),
      ]);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      setCases(Array.isArray(casesData) ? casesData : []);
      setAvailableClauses(Array.isArray(clausesData) ? clausesData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      addToast('Failed to load data', 'error');
    }
  };

  const loadTemplate = async (id: string) => {
    try {
      const template = await draftingApi.getTemplateById(id);
      setSelectedTemplate(template);
      setTitle(`${template.name} - ${new Date().toLocaleDateString()}`);
      
      // Initialize variable values with defaults
      const initialValues: Record<string, any> = {};
      template.variables.forEach((v) => {
        initialValues[v.name] = v.defaultValue || '';
      });
      setVariableValues(initialValues);
      
      if (!templateId) {
        setStep('variables');
      }
    } catch (error) {
      console.error('Failed to load template:', error);
      addToast('Failed to load template', 'error');
    }
  };

  const handleSelectTemplate = (template: DraftingTemplate) => {
    loadTemplate(template.id);
  };

  const generatePreview = () => {
    if (!selectedTemplate) return '';

    let content = selectedTemplate.content;

    // Replace variables
    Object.entries(variableValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, String(value || `[${key}]`));
    });

    // Replace case data
    const selectedCase = cases.find(c => c.id === selectedCaseId);
    if (selectedCase) {
      content = content.replace(/\{\{case\.(\w+)\}\}/g, (match, field) => {
        return selectedCase[field]?.toString() || match;
      });
    }

    // Replace clause placeholders with clause titles
    content = content.replace(/\{\{clause:(\d+)\}\}/g, (match, position) => {
      const pos = parseInt(position);
      const clauseId = selectedClauses[pos];
      const clause = availableClauses.find(c => c.id === clauseId);
      return clause ? `\n\n[CLAUSE: ${clause.title}]\n${clause.content}\n` : match;
    });

    return content;
  };

  const handleNext = () => {
    if (step === 'template') {
      if (!selectedTemplate) {
        addToast('Please select a template', 'warning');
        return;
      }
      setStep('variables');
    } else if (step === 'variables') {
      // Validate required variables
      const missing = selectedTemplate!.variables.filter(
        (v) => v.required && !variableValues[v.name]
      );
      if (missing.length > 0) {
        addToast(`Please fill required fields: ${missing.map(v => v.label).join(', ')}`, 'warning');
        return;
      }
      
      if (selectedTemplate!.clauseReferences && selectedTemplate!.clauseReferences.length > 0) {
        setStep('clauses');
      } else {
        const preview = generatePreview();
        setPreviewContent(preview);
        setStep('preview');
      }
    } else if (step === 'clauses') {
      const preview = generatePreview();
      setPreviewContent(preview);
      setStep('preview');
    } else if (step === 'preview') {
      setStep('save');
    }
  };

  const handleBack = () => {
    if (step === 'variables') {
      setStep('template');
    } else if (step === 'clauses') {
      setStep('variables');
    } else if (step === 'preview') {
      if (selectedTemplate!.clauseReferences && selectedTemplate!.clauseReferences.length > 0) {
        setStep('clauses');
      } else {
        setStep('variables');
      }
    } else if (step === 'save') {
      setStep('preview');
    }
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

    setLoading(true);
    try {
      const dto: GenerateDocumentDto = {
        title,
        description,
        templateId: selectedTemplate.id,
        caseId: selectedCaseId,
        variableValues: {
          ...variableValues,
          case: cases.find(c => c.id === selectedCaseId),
        },
        includedClauses: selectedClauses,
      };

      const generated = await draftingApi.generateDocument(dto);
      addToast('Document generated successfully', 'success');
      onComplete(generated);
    } catch (error) {
      console.error('Failed to generate document:', error);
      addToast('Failed to generate document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Select a Template
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              {selectedTemplate?.id === template.id && (
                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {template.name}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
              {template.description || 'No description'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                {template.category}
              </span>
              {template.jurisdiction && (
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
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
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        Fill Template Variables
      </h3>

      {/* Case Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Associated Case (Optional)
        </label>
        <select
          value={selectedCaseId || ''}
          onChange={(e) => setSelectedCaseId(e.target.value || undefined)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No case selected</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.caseNumber} - {c.title}
            </option>
          ))}
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
                value={variableValues[variable.name] || ''}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={variable.required}
              />
            )}
            
            {variable.type === 'date' && (
              <input
                type="date"
                value={variableValues[variable.name] || ''}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={variable.required}
              />
            )}
            
            {variable.type === 'number' && (
              <input
                type="number"
                value={variableValues[variable.name] || ''}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={variable.required}
              />
            )}
            
            {variable.type === 'select' && variable.options && (
              <select
                value={variableValues[variable.name] || ''}
                onChange={(e) => setVariableValues({ ...variableValues, [variable.name]: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={variable.required}
              >
                <option value="">Select...</option>
                {variable.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            
            {variable.type === 'boolean' && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={variableValues[variable.name] || false}
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
          <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
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
                  {availableClauses.map((clause) => (
                    <option key={clause.id} value={clause.id}>
                      {clause.title}
                    </option>
                  ))}
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
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Generate Document
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-2 py-4 border-b border-slate-200 dark:border-slate-700">
        {['template', 'variables', 'clauses', 'preview', 'save'].map((s, index) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                s === step
                  ? 'bg-blue-600 text-white'
                  : index < ['template', 'variables', 'clauses', 'preview', 'save'].indexOf(step)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {index + 1}
            </div>
            {index < 4 && (
              <div className={`w-12 h-0.5 ${
                index < ['template', 'variables', 'clauses', 'preview', 'save'].indexOf(step)
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {step === 'template' && renderTemplateSelection()}
        {step === 'variables' && renderVariableInputs()}
        {step === 'clauses' && renderClauseSelection()}
        {step === 'preview' && renderPreview()}
        {step === 'save' && renderSaveForm()}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleBack}
          disabled={step === 'template'}
          className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center space-x-2">
          {step !== 'save' && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          
          {step === 'save' && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
