import type { DraftingTemplate } from '@/lib/frontend-api';
import { Form, Link, useNavigate } from 'react-router';
import type { ComposeLoaderData } from './types';
import { useTheme } from '@/contexts/ThemeContext';

interface ComposeCorrespondenceProps {
  data: ComposeLoaderData;
}

export function ComposeCorrespondence({ data }: ComposeCorrespondenceProps) {
  const navigate = useNavigate();
  const { theme, tokens } = useTheme();
  const { templates, draftId } = data;

  const handleCancel = () => {
    navigate('/correspondence');
  };

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/correspondence/compose?template=${templateId}`);
  };

  return (
    <div style={{ padding: tokens.spacing.normal['2xl'] }}>
      {/* Breadcrumb */}
      <nav style={{
        marginBottom: tokens.spacing.normal.lg,
        fontSize: tokens.typography.fontSize.sm,
        color: theme.text.secondary,
      }} className="flex items-center gap-2">
        <Link to="/correspondence" style={{ color: theme.text.secondary }} className="transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = theme.text.primary}
          onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
        >
          Correspondence
        </Link>
        <span>/</span>
        <span style={{ color: theme.text.primary }}>Compose</span>
      </nav>

      {/* Page Header */}
      <div style={{ marginBottom: tokens.spacing.normal['2xl'] }} className="flex items-center justify-between">
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: theme.text.primary,
          }}>
            Compose Correspondence
          </h1>
          <p style={{
            marginTop: tokens.spacing.normal.xs,
            fontSize: tokens.typography.fontSize.sm,
            color: theme.text.secondary,
          }}>
            Create and send legal correspondence
          </p>
        </div>
        {draftId && (
          <span style={{
            borderRadius: tokens.borderRadius.full,
            backgroundColor: theme.status.warning.bg,
            padding: `${tokens.spacing.normal.xs} ${tokens.spacing.normal.md}`,
            fontSize: tokens.typography.fontSize.sm,
            color: theme.status.warning.text,
          }}>
            Draft
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Compose Area */}
        <div className="lg:col-span-2">
          <Form method="post" className="space-y-6">
            {/* Template Selection */}
            <div style={{
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.base,
              padding: tokens.spacing.normal.lg,
            }}>
              <h2 style={{
                marginBottom: tokens.spacing.normal.md,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}>
                Template
              </h2>
              <select
                name="templateId"
                style={{
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  backgroundColor: theme.surface.input,
                  color: theme.text.primary,
                }}
                className="focus:outline-none focus:ring-2"
              >
                <option value="">Select a template (optional)</option>
                {templates.map((template: DraftingTemplate) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipients */}
            <div style={{
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.base,
              padding: tokens.spacing.normal.lg,
            }}>
              <h2 style={{
                marginBottom: tokens.spacing.normal.md,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}>
                Recipients
              </h2>
              <input
                type="text"
                name="recipients"
                placeholder="Enter recipient email addresses, separated by commas"
                style={{
                  width: '100%',
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  backgroundColor: theme.surface.input,
                  color: theme.text.primary,
                }}
                className="focus:outline-none focus:ring-2"
              />
            </div>

            {/* Subject & Body */}
            <div style={{
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.base,
              padding: tokens.spacing.normal.lg,
            }}>
              <h2 style={{
                marginBottom: tokens.spacing.normal.md,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}>
                Message
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" style={{
                    marginBottom: tokens.spacing.normal.xs,
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.primary,
                  }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Enter subject line"
                    style={{
                      width: '100%',
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${theme.border.default}`,
                      padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                      fontSize: tokens.typography.fontSize.sm,
                      backgroundColor: theme.surface.input,
                      color: theme.text.primary,
                    }}
                    className="focus:outline-none focus:ring-2"
                  />
                </div>
                <div>
                  <label htmlFor="body" style={{
                    marginBottom: tokens.spacing.normal.xs,
                    display: 'block',
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.primary,
                  }}>
                    Body
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    rows={12}
                    placeholder="Compose your message..."
                    style={{
                      width: '100%',
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${theme.border.default}`,
                      padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                      fontSize: tokens.typography.fontSize.sm,
                      backgroundColor: theme.surface.input,
                      color: theme.text.primary,
                    }}
                    className="focus:outline-none focus:ring-2"
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div style={{
              backgroundColor: theme.surface.hover,
              borderColor: theme.border.default,
              borderRadius: tokens.borderRadius.lg,
              borderWidth: '1px',
              borderStyle: 'dashed',
              padding: tokens.spacing.normal.lg,
            }}>
              <h2 style={{
                marginBottom: tokens.spacing.normal.sm,
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: theme.text.primary,
              }}>
                Attachments
              </h2>
              <p style={{
                marginBottom: tokens.spacing.normal.md,
                fontSize: tokens.typography.fontSize.sm,
                color: theme.text.muted,
              }}>
                Drag and drop files here, or click to browse
              </p>
              <button
                type="button"
                style={{
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.base,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.base}
              >
                Add Attachments
              </button>
            </div>

            {/* Actions */}
            <div style={{
              borderTop: `1px solid ${theme.border.default}`,
              paddingTop: tokens.spacing.normal.lg,
            }} className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${theme.border.default}`,
                  backgroundColor: theme.surface.base,
                  padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: theme.text.primary,
                  boxShadow: tokens.shadows.sm,
                }}
                className="transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.base}
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="save-draft"
                  style={{
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${theme.border.default}`,
                    backgroundColor: theme.surface.base,
                    padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.primary,
                    boxShadow: tokens.shadows.sm,
                  }}
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.surface.base}
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="preview"
                  style={{
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${theme.primary.DEFAULT}`,
                    backgroundColor: `${theme.primary.DEFAULT}15`,
                    padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.primary.DEFAULT,
                    boxShadow: tokens.shadows.sm,
                  }}
                  className="transition-colors"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="send"
                  style={{
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: theme.primary.DEFAULT,
                    padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.surface.base,
                    boxShadow: tokens.shadows.sm,
                  }}
                  className="transition-colors focus:outline-none focus:ring-2"
                >
                  Send
                </button>
              </div>
            </div>
          </Form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <div style={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${theme.border.default}`,
            backgroundColor: theme.surface.base,
            padding: tokens.spacing.normal.lg,
          }}>
            <h3 style={{
              marginBottom: tokens.spacing.normal.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: theme.text.primary,
            }}>
              Quick Templates
            </h3>
            <div className="space-y-2">
              {templates.slice(0, 4).map((template: DraftingTemplate) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    borderRadius: tokens.borderRadius.md,
                    padding: `${tokens.spacing.normal.sm} ${tokens.spacing.normal.md}`,
                    textAlign: 'left',
                    fontSize: tokens.typography.fontSize.sm,
                    color: theme.text.primary,
                  }}
                  className="transition-colors"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>{template.name}</span>
                  <span style={{
                    display: 'block',
                    fontSize: tokens.typography.fontSize.xs,
                    color: theme.text.muted,
                  }}>
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${theme.primary.DEFAULT}`,
            backgroundColor: `${theme.primary.DEFAULT}10`,
            padding: tokens.spacing.normal.lg,
          }}>
            <h3 style={{
              marginBottom: tokens.spacing.normal.sm,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: theme.primary.DEFAULT,
            }}>
              Composition Tips
            </h3>
            <ul style={{
              fontSize: tokens.typography.fontSize.sm,
              color: theme.primary.DEFAULT,
            }} className="space-y-2">
              <li>Use templates to save time</li>
              <li>Add CC recipients for transparency</li>
              <li>Preview before sending</li>
              <li>Drafts auto-save every 30 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
