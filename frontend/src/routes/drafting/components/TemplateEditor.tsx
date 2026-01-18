import { Code, Eye, FileText, List, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { api } from '@/api';
import { EmptyState } from '@/routes/_shared/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/providers';
import { draftingApi, TemplateCategory, TemplateStatus } from '@api/domains/drafting';

import type {
  ClauseReference,
  CreateTemplateDto,
  DraftingTemplate,
  TemplateVariable,
  UpdateTemplateDto,
} from '@api/domains/drafting';

interface TemplateEditorProps {
  template?: DraftingTemplate;
  onSave: (template: DraftingTemplate) => void;
  onCancel: () => void;
}

export function TemplateEditor({
  template,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  const { addToast } = useToast();
  const { theme, tokens } = useTheme();

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

  const loadClauses = useCallback(async () => {
    try {
      const clauses = await api.clauses.getAll();
      setAvailableClauses(Array.isArray(clauses) ? clauses as unknown as ClauseItem[] : []);
    } catch (error) {
      console.error('Failed to load clauses:', error);
      setAvailableClauses([]);
    }
  }, []);

  useEffect(() => {
    void loadClauses();
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
    updated[index] = { ...updated[index], ...updates } as TemplateVariable;
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
    updated[index] = { ...updated[index], ...updates } as ClauseReference;
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
      const dto: CreateTemplateDto = {
        name,
        description,
        category,
        content,
        variables,
        clauseReferences: clauseRefs,
        jurisdiction,
        practiceArea,
        tags,
        status: TemplateStatus.ACTIVE,
      };

      const saved = template
        ? await draftingApi.updateTemplate(template.id, dto as UpdateTemplateDto)
        : await draftingApi.createTemplate(dto);

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
    preview = preview.replace(/\{\{case.(\w+)\}\}/g, '<span class="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1 rounded">{{case.$1}}</span>');
    preview = preview.replace(/\{\{party.(\w+)\}\}/g, '<span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1 rounded">{{party.$1}}</span>');
    preview = preview.replace(/\{\{clause:(\d+)\}\}/g, '<span class="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-1 rounded">{{clause:$1}}</span>');

    return { __html: preview.replace(/\n/g, '<br/>') };
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.surface.base }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: tokens.spacing.normal.lg,
        borderBottom: `1px solid ${theme.border.default}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.normal.md }}>
          <FileText style={{ height: '1.5rem', width: '1.5rem', color: theme.primary.DEFAULT }} />
          <h2 style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: theme.text.primary,
          }}>
            {template ? 'Edit Template' : 'Create Template'}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.normal.sm }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.secondary,
              backgroundColor: 'transparent',
              borderRadius: tokens.borderRadius.lg,
            }}
            className="transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {showPreview ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: theme.text.secondary,
              backgroundColor: 'transparent',
              borderRadius: tokens.borderRadius.lg,
              opacity: loading ? 0.5 : 1,
            }}
            className="transition-colors"
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = theme.surface.hover)}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="h-4 w-4" />
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={loading}
            style={{
              padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.lg}`,
              backgroundColor: theme.primary.DEFAULT,
              color: theme.surface.base,
              borderRadius: tokens.borderRadius.lg,
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.normal.sm,
            }}
            className="transition-opacity"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : 'Save Template'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ padding: tokens.spacing.normal['2xl'] }}>
          {/* Main Editor */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.normal['2xl'] }}>
            {/* Basic Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.normal.lg }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.secondary,
                  marginBottom: tokens.spacing.compact.xs,
                }}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                    border: `1px solid ${theme.border.default}`,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: theme.surface.input,
                    color: theme.text.primary,
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                  className="focus:outline-none focus:ring-2"
                  placeholder="e.g., Motion to Dismiss"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.secondary,
                  marginBottom: tokens.spacing.compact.xs,
                }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                    border: `1px solid ${theme.border.default}`,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: theme.surface.input,
                    color: theme.text.primary,
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                  className="focus:outline-none focus:ring-2"
                  placeholder="Brief description of the template..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.secondary,
                    marginBottom: tokens.spacing.compact.xs,
                  }}>
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                      border: `1px solid ${theme.border.default}`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: theme.surface.input,
                      color: theme.text.primary,
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                    className="focus:outline-none focus:ring-2"
                  >
                    {Object.values(TemplateCategory).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.secondary,
                    marginBottom: tokens.spacing.compact.xs,
                  }}>
                    Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                      border: `1px solid ${theme.border.default}`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: theme.surface.input,
                      color: theme.text.primary,
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                    className="focus:outline-none focus:ring-2"
                    placeholder="e.g., Federal"
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.secondary,
                    marginBottom: tokens.spacing.compact.xs,
                  }}>
                    Practice Area
                  </label>
                  <input
                    type="text"
                    value={practiceArea}
                    onChange={(e) => setPracticeArea(e.target.value)}
                    style={{
                      width: '100%',
                      padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                      border: `1px solid ${theme.border.default}`,
                      borderRadius: tokens.borderRadius.lg,
                      backgroundColor: theme.surface.input,
                      color: theme.text.primary,
                      fontSize: tokens.typography.fontSize.sm,
                    }}
                    className="focus:outline-none focus:ring-2"
                    placeholder="e.g., Civil"
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing.compact.sm,
              }}>
                <label style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.secondary,
                }}>
                  Template Content *
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.normal.sm,
                  fontSize: tokens.typography.fontSize.xs,
                }}>
                  <button
                    onClick={() => insertPlaceholder('{{variable_name}}')}
                    style={{
                      padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                      backgroundColor: theme.primary.DEFAULT + '20',
                      color: theme.primary.DEFAULT,
                      borderRadius: tokens.borderRadius.md,
                    }}
                    className="transition-opacity"
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    + Variable
                  </button>
                  <button
                    onClick={() => insertPlaceholder('{{case.field}}')}
                    style={{
                      padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                      backgroundColor: theme.status.success.bg,
                      color: theme.status.success.text,
                      borderRadius: tokens.borderRadius.md,
                    }}
                    className="transition-opacity"
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    + Case Data
                  </button>
                  <button
                    onClick={() => insertPlaceholder('{{clause:0}}')}
                    style={{
                      padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                      backgroundColor: theme.status.warning.bg,
                      color: theme.status.warning.text,
                      borderRadius: tokens.borderRadius.md,
                    }}
                    className="transition-opacity"
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                    border: `1px solid ${theme.border.default}`,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: theme.surface.input,
                    color: theme.text.primary,
                    fontFamily: 'monospace',
                    fontSize: tokens.typography.fontSize.sm,
                  }}
                  className="focus:outline-none focus:ring-2"
                  placeholder="Enter template content with placeholders like {{variable_name}}, {{case.title}}, {{party.plaintiff}}..."
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    minHeight: '500px',
                    padding: `${tokens.spacing.compact.sm} ${tokens.spacing.normal.md}`,
                    border: `1px solid ${theme.border.default}`,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: theme.surface.muted,
                    color: theme.text.primary,
                  }}
                  dangerouslySetInnerHTML={renderPreview()}
                />
              )}
            </div>
          </div>

          {/* Sidebar - Variables & Clauses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.normal['2xl'] }}>
            {/* Variables */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing.normal.md,
              }}>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: theme.text.primary,
                }}>
                  Variables
                </h3>
                <button
                  onClick={handleAddVariable}
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: theme.primary.DEFAULT,
                  }}
                  className="hover:underline"
                >
                  + Add
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing.normal.sm,
                maxHeight: '24rem',
                overflowY: 'auto',
              }}>
                {variables.map((variable, index) => (
                  <div
                    key={`variable-${variable.name}-${index}`}
                    style={{
                      padding: tokens.spacing.normal.md,
                      backgroundColor: theme.surface.elevated,
                      borderRadius: tokens.borderRadius.lg,
                      border: `1px solid ${theme.border.light}`,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: tokens.spacing.compact.sm,
                    }}>
                      <input
                        type="text"
                        value={variable.name}
                        onChange={(e) => handleUpdateVariable(index, { name: e.target.value })}
                        style={{
                          flex: 1,
                          fontSize: tokens.typography.fontSize.sm,
                          fontFamily: 'monospace',
                          padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                          border: `1px solid ${theme.border.default}`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: theme.surface.input,
                          color: theme.text.primary,
                        }}
                        placeholder="variable_name"
                      />
                      <button
                        onClick={() => handleRemoveVariable(index)}
                        style={{
                          marginLeft: tokens.spacing.compact.sm,
                          color: theme.status.error.text,
                        }}
                        className="transition-opacity hover:opacity-70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={variable.label}
                      onChange={(e) => handleUpdateVariable(index, { label: e.target.value })}
                      style={{
                        width: '100%',
                        fontSize: tokens.typography.fontSize.xs,
                        padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                        border: `1px solid ${theme.border.default}`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: theme.surface.input,
                        color: theme.text.primary,
                        marginBottom: tokens.spacing.compact.xs,
                      }}
                      placeholder="Display Label"
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.normal.sm }}>
                      <select
                        value={variable.type}
                        onChange={(e) => handleUpdateVariable(index, { type: e.target.value as TemplateVariable['type'] })}
                        style={{
                          flex: 1,
                          fontSize: tokens.typography.fontSize.xs,
                          padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                          border: `1px solid ${theme.border.default}`,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: theme.surface.input,
                          color: theme.text.primary,
                        }}
                      >
                        <option value="text">Text</option>
                        <option value="date">Date</option>
                        <option value="number">Number</option>
                        <option value="select">Select</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: tokens.typography.fontSize.xs,
                        color: theme.text.secondary,
                      }}>
                        <input
                          type="checkbox"
                          checked={variable.required}
                          onChange={(e) => handleUpdateVariable(index, { required: e.target.checked })}
                          style={{ marginRight: tokens.spacing.compact.xs }}
                        />
                        Required
                      </label>
                    </div>
                  </div>
                ))}
                {variables.length === 0 && (
                  <EmptyState 
                    icon={List}
                    title="No variables defined"
                    message="Add variables to make your template dynamic"
                    size="sm"
                  />
                )}
              </div>
            </div>

            {/* Clause References */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: tokens.spacing.normal.md,
              }}>
                <h3 style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: theme.text.primary,
                }}>
                  Clause References
                </h3>
                <button
                  onClick={handleAddClauseRef}
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: theme.primary.DEFAULT,
                  }}
                  className="hover:underline"
                >
                  + Add
                </button>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: tokens.spacing.normal.sm,
                maxHeight: '24rem',
                overflowY: 'auto',
              }}>
                {clauseRefs.map((ref, index) => (
                  <div
                    key={index}
                    style={{
                      padding: tokens.spacing.normal.md,
                      backgroundColor: theme.surface.elevated,
                      borderRadius: tokens.borderRadius.lg,
                      border: `1px solid ${theme.border.light}`,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: tokens.spacing.compact.sm,
                    }}>
                      <span style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: theme.text.muted,
                      }}>
                        Position {ref.position}
                      </span>
                      <button
                        onClick={() => handleRemoveClauseRef(index)}
                        style={{ color: theme.status.error.text }}
                        className="transition-opacity hover:opacity-70"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <select
                      value={ref.clauseId}
                      onChange={(e) => handleUpdateClauseRef(index, { clauseId: e.target.value })}
                      style={{
                        width: '100%',
                        fontSize: tokens.typography.fontSize.xs,
                        padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                        border: `1px solid ${theme.border.default}`,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: theme.surface.input,
                        color: theme.text.primary,
                        marginBottom: tokens.spacing.compact.xs,
                      }}
                    >
                      <option value="">Select Clause</option>
                      {availableClauses.map((clause) => (
                        <option key={clause.id} value={clause.id}>
                          {clause.title}
                        </option>
                      ))}
                    </select>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: tokens.typography.fontSize.xs,
                      color: theme.text.secondary,
                    }}>
                      <input
                        type="checkbox"
                        checked={ref.isOptional}
                        onChange={(e) => handleUpdateClauseRef(index, { isOptional: e.target.checked })}
                        style={{ marginRight: tokens.spacing.compact.xs }}
                      />
                      Optional
                    </label>
                  </div>
                ))}
                {clauseRefs.length === 0 && (
                  <EmptyState 
                    icon={FileText}
                    title="No clause references"
                    message="Link standard clauses to reuse common legal language"
                    size="sm"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
