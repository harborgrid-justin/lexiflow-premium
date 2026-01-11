import React, { useState, useEffect } from 'react';
import { FileText, Save, X, Eye, Code } from 'lucide-react';
import { useToast } from '@providers/ToastContext';
import { draftingApi, DraftingTemplate, TemplateVariable, TemplateCategory, ClauseReference } from '@api/domains/drafting.api';
import { api } from '@/api';

interface TemplateEditorProps {
  template?: DraftingTemplate;
  onSave: (template: DraftingTemplate) => void;
  onCancel: () => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const { addToast } = useToast();

  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [category, setCategory] = useState<TemplateCategory>(template?.category || TemplateCategory.PLEADING);
  const [content, setContent] = useState(template?.content || '');
  const [variables, setVariables] = useState<TemplateVariable[]>(template?.variables || []);
  const [clauseRefs, setClauseRefs] = useState<ClauseReference[]>(template?.clauseReferences || []);
  const [jurisdiction, setJurisdiction] = useState(template?.jurisdiction || '');
  const [practiceArea, setPracticeArea] = useState(template?.practiceArea || '');
  const [tags] = useState<string[]>(template?.tags || []);
  const [showPreview, setShowPreview] = useState(false);
  interface ClauseItem {
    id: string;
    title: string;
  }

  const [availableClauses, setAvailableClauses] = useState<ClauseItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClauses = React.useCallback(async () => {
    try {
      const clauses = await api.clauses.getAll();
      setAvailableClauses(Array.isArray(clauses) ? clauses as unknown as ClauseItem[] : []);
    } catch (error) {
      console.error('Failed to load clauses:', error);
      setAvailableClauses([]);
    }
  }, []);

  useEffect(() => {
    loadClauses();
  }, [loadClauses]);

  const handleAddVariable = () => {
    setVariables([
      ...variables,
      {
        name: `var_${variables.length + 1}`,
        label: 'New Variable',
        type: 'text',
        required: false,
      },
    ]);
  };

  const handleUpdateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], ...updates };
    setVariables(updated);
  };

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleAddClauseRef = () => {
    setClauseRefs([
      ...clauseRefs,
      {
        clauseId: '',
        position: clauseRefs.length,
        isOptional: false,
      },
    ]);
  };

  const handleUpdateClauseRef = (index: number, updates: Partial<ClauseReference>) => {
    const updated = [...clauseRefs];
    updated[index] = { ...updated[index], ...updates };
    setClauseRefs(updated);
  };

  const handleRemoveClauseRef = (index: number) => {
    setClauseRefs(clauseRefs.filter((_, i) => i !== index));
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + placeholder + content.substring(end);
      setContent(newContent);

      // Set cursor after inserted placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      addToast('Template name is required', 'error');
      return;
    }

    if (!content.trim()) {
      addToast('Template content is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const dto = {
        name,
        description,
        category,
        content,
        variables,
        clauseReferences: clauseRefs,
        jurisdiction,
        practiceArea,
        tags,
        status: 'active' as const,
      };

      type TemplateDTO = typeof dto;
      const saved = template
        ? await draftingApi.updateTemplate(template.id, dto as TemplateDTO)
        : await draftingApi.createTemplate(dto as TemplateDTO);

      addToast(`Template ${template ? 'updated' : 'created'} successfully`, 'success');
      onSave(saved);
    } catch (error) {
      console.error('Failed to save template:', error);
      addToast('Failed to save template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    let preview = content;

    // Highlight placeholders
    preview = preview.replace(/\{\{(\w+)\}\}/g, '<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 rounded">{{$1}}</span>');
    preview = preview.replace(/\{\{case\.(\w+)\}\}/g, '<span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1 rounded">{{case.$1}}</span>');
    preview = preview.replace(/\{\{party\.(\w+)\}\}/g, '<span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 rounded">{{party.$1}}</span>');
    preview = preview.replace(/\{\{clause:(\d+)\}\}/g, '<span class="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1 rounded">{{clause:$1}}</span>');

    return { __html: preview.replace(/\n/g, '<br/>') };
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Motion to Dismiss"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the template..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(TemplateCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Federal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Practice Area
                  </label>
                  <input
                    type="text"
                    value={practiceArea}
                    onChange={(e) => setPracticeArea(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Civil"
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Template Content *
                </label>
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    onClick={() => insertPlaceholder('{{variable_name}}')}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  >
                    + Variable
                  </button>
                  <button
                    onClick={() => insertPlaceholder('{{case.field}}')}
                    className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                  >
                    + Case Data
                  </button>
                  <button
                    onClick={() => insertPlaceholder('{{clause:0}}')}
                    className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50"
                  >
                    + Clause
                  </button>
                </div>
              </div>

              {!showPreview ? (
                <textarea
                  id="content-editor"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter template content with placeholders like {{variable_name}}, {{case.title}}, {{party.plaintiff}}..."
                />
              ) : (
                <div
                  className="w-full min-h-[500px] px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  dangerouslySetInnerHTML={renderPreview()}
                />
              )}
            </div>
          </div>

          {/* Sidebar - Variables & Clauses */}
          <div className="space-y-6">
            {/* Variables */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Variables</h3>
                <button
                  onClick={handleAddVariable}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {variables.map((variable, index) => (
                  <div
                    key={`variable-${variable.name}-${index}`}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => handleUpdateVariable(index, { name: e.target.value })}
                        className="flex-1 text-sm font-mono px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        placeholder="variable_name"
                      />
                      <button
                        onClick={() => handleRemoveVariable(index)}
                        className="ml-2 text-red-600 dark:text-red-400 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) => handleUpdateVariable(index, { label: e.target.value })}
                      className="w-full text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 mb-1"
                      placeholder="Display Label"
                    />
                    <div className="flex items-center space-x-2">
                      <select
                        value={variable.type}
                        onChange={(e) => handleUpdateVariable(index, { type: e.target.value as 'text' | 'date' | 'number' | 'select' })}
                        className="flex-1 text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      >
                        <option value="text">Text</option>
                        <option value="date">Date</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <label className="flex items-center text-xs text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => handleUpdateVariable(index, { required: e.target.checked })}
                          className="mr-1"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
                {variables.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                    No variables defined
                  </p>
                )}
              </div>
            </div>

            {/* Clause References */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Clause References</h3>
                <button
                  onClick={handleAddClauseRef}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clauseRefs.map((ref, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Position {ref.position}</span>
                      <button
                        onClick={() => handleRemoveClauseRef(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <select
                      value={ref.clauseId}
                      onChange={(e) => handleUpdateClauseRef(index, { clauseId: e.target.value })}
                      className="w-full text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 mb-1"
                    >
                      <option value="">Select Clause</option>
                      {availableClauses.map((clause) => (
                        <option key={clause.id} value={clause.id}>
                          {clause.title}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={ref.isOptional}
                        onChange={(e) => handleUpdateClauseRef(index, { isOptional: e.target.checked })}
                        className="mr-1"
                      />
                      Optional
                    </label>
                  </div>
                ))}
                {clauseRefs.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                    No clause references
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
