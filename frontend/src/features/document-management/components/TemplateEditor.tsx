import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Eye,
  Code,
  Settings,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { DocumentTemplate, TemplateVariable } from '../types';

interface TemplateEditorProps {
  templateId?: string;
  onSave?: (template: Partial<DocumentTemplate>) => Promise<void>;
  onCancel?: () => void;
}

/**
 * TemplateEditor Component
 *
 * Rich template editor with variable management:
 * - WYSIWYG template content editing
 * - Variable placeholder insertion
 * - Variable definition and validation
 * - Template preview
 * - Formatting options
 * - Jurisdiction and category settings
 */
export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  templateId,
  onSave,
  onCancel,
}) => {
  const [template, setTemplate] = useState<Partial<DocumentTemplate>>({
    name: '',
    description: '',
    category: 'motion',
    content: '',
    variables: [],
    status: 'draft',
    outputFormat: 'docx',
  });
  const [activeTab, setActiveTab] = useState<'content' | 'variables' | 'settings'>('content');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    }
  }, [templateId]);

  const loadTemplate = async (id: string) => {
    try {
      // Mock data - replace with actual API call
      const mockTemplate: DocumentTemplate = {
        id,
        name: 'Motion to Dismiss Template',
        description: 'Standard motion to dismiss for federal court',
        category: 'motion',
        content: `MOTION TO DISMISS

TO THE HONORABLE JUDGE OF SAID COURT:

NOW COMES {{defendant_name}}, Defendant in the above-styled and numbered cause, and files this Motion to Dismiss pursuant to {{rule_reference}}, and in support thereof would respectfully show the Court as follows:

I. INTRODUCTION

{{introduction_text}}

II. FACTUAL BACKGROUND

{{factual_background}}

III. LEGAL STANDARD

{{legal_standard}}

IV. ARGUMENT

{{argument}}

V. CONCLUSION

For the foregoing reasons, Defendant respectfully requests that this Court GRANT this Motion to Dismiss.

Respectfully submitted,

{{attorney_name}}
{{attorney_bar_number}}
{{law_firm_name}}
{{law_firm_address}}
{{attorney_email}}
{{attorney_phone}}

ATTORNEY FOR DEFENDANT`,
        variables: [
          {
            name: 'defendant_name',
            label: 'Defendant Name',
            type: 'text',
            required: true,
            placeholder: 'ACME CORPORATION',
          },
          {
            name: 'rule_reference',
            label: 'Rule Reference',
            type: 'text',
            required: true,
            defaultValue: 'Federal Rule of Civil Procedure 12(b)(6)',
          },
          {
            name: 'introduction_text',
            label: 'Introduction',
            type: 'text',
            required: true,
          },
          {
            name: 'factual_background',
            label: 'Factual Background',
            type: 'text',
            required: true,
          },
          {
            name: 'legal_standard',
            label: 'Legal Standard',
            type: 'text',
            required: true,
          },
          {
            name: 'argument',
            label: 'Argument',
            type: 'text',
            required: true,
          },
          {
            name: 'attorney_name',
            label: 'Attorney Name',
            type: 'text',
            required: true,
          },
          {
            name: 'attorney_bar_number',
            label: 'Bar Number',
            type: 'text',
            required: true,
          },
          {
            name: 'law_firm_name',
            label: 'Law Firm',
            type: 'text',
            required: true,
          },
          {
            name: 'law_firm_address',
            label: 'Firm Address',
            type: 'address',
            required: true,
          },
          {
            name: 'attorney_email',
            label: 'Email',
            type: 'text',
            required: true,
          },
          {
            name: 'attorney_phone',
            label: 'Phone',
            type: 'text',
            required: true,
          },
        ],
        jurisdiction: ['federal'],
        practiceAreas: ['civil-litigation'],
        status: 'active',
        templateVersion: '1.0.0',
        outputFormat: 'docx',
        usageCount: 42,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
        tags: ['motion', 'dismissal', 'federal'],
      };

      setTemplate(mockTemplate);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(template);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variableName: string) => {
    const cursorPosition = 0; // In real implementation, track cursor position
    const newContent =
      template.content + `{{${variableName}}}`;
    setTemplate({ ...template, content: newContent });
  };

  const addVariable = () => {
    const newVar: TemplateVariable = {
      name: `variable_${(template.variables?.length || 0) + 1}`,
      label: 'New Variable',
      type: 'text',
      required: false,
    };
    setTemplate({
      ...template,
      variables: [...(template.variables || []), newVar],
    });
  };

  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const variables = [...(template.variables || [])];
    variables[index] = { ...variables[index], ...updates };
    setTemplate({ ...template, variables });
  };

  const removeVariable = (index: number) => {
    const variables = [...(template.variables || [])];
    variables.splice(index, 1);
    setTemplate({ ...template, variables });
  };

  const renderContentTab = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Template Content</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              previewMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {previewMode ? (
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto prose dark:prose-invert">
            <div className="whitespace-pre-wrap">{template.content}</div>
          </div>
        </div>
      ) : (
        <textarea
          value={template.content}
          onChange={(e) => setTemplate({ ...template, content: e.target.value })}
          placeholder="Enter template content here. Use {{variable_name}} for placeholders..."
          className="flex-1 p-6 font-mono text-sm bg-white dark:bg-gray-900 focus:outline-none resize-none"
        />
      )}
    </div>
  );

  const renderVariablesTab = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Variables</h3>
        <button
          onClick={addVariable}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Variable
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {(template.variables || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <AlertCircle className="w-16 h-16 mb-2" />
            <p>No variables defined</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(template.variables || []).map((variable, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={variable.name}
                      onChange={(e) => updateVariable(index, { name: e.target.value })}
                      placeholder="variable_name"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) => updateVariable(index, { label: e.target.value })}
                      placeholder="Display Label"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => removeVariable(index)}
                    className="ml-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={variable.type}
                    onChange={(e) =>
                      updateVariable(index, {
                        type: e.target.value as TemplateVariable['type'],
                      })
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Select</option>
                    <option value="address">Address</option>
                    <option value="party">Party</option>
                    <option value="currency">Currency</option>
                  </select>

                  <label className="flex items-center gap-2 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={variable.required}
                      onChange={(e) =>
                        updateVariable(index, { required: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>

                <button
                  onClick={() => insertVariable(variable.name)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  Insert into template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Template Name</label>
          <input
            type="text"
            value={template.name}
            onChange={(e) => setTemplate({ ...template, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={template.description}
            onChange={(e) => setTemplate({ ...template, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={template.category}
              onChange={(e) => setTemplate({ ...template, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="motion">Motion</option>
              <option value="brief">Brief</option>
              <option value="complaint">Complaint</option>
              <option value="contract">Contract</option>
              <option value="letter">Letter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Output Format</label>
            <select
              value={template.outputFormat}
              onChange={(e) =>
                setTemplate({
                  ...template,
                  outputFormat: e.target.value as DocumentTemplate['outputFormat'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="docx">Word (DOCX)</option>
              <option value="pdf">PDF</option>
              <option value="html">HTML</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={template.status}
            onChange={(e) =>
              setTemplate({
                ...template,
                status: e.target.value as DocumentTemplate['status'],
              })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="deprecated">Deprecated</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <h2 className="text-lg font-semibold">
            {templateId ? 'Edit Template' : 'New Template'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'content'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('variables')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'variables'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Variables
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Settings
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'content' && renderContentTab()}
        {activeTab === 'variables' && renderVariablesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default TemplateEditor;
