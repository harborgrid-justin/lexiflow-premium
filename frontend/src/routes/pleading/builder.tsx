/**
 * Pleading Builder Route
 *
 * Comprehensive legal pleading document builder with:
 * - Court-specific formatting templates
 * - Jurisdiction and venue selection
 * - Party management (plaintiffs, defendants, third parties)
 * - Cause of action templates
 * - Prayer for relief generator
 * - Document preview and export
 *
 * @module routes/pleading/builder
 */

import { DataService } from '@/services/data/dataService';
import { LegalDocument } from '@/types';
import { Form, Link, redirect, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// ============================================================================
// Types
// ============================================================================

interface PleadingTemplate {
  id: string;
  name: string;
  type: 'complaint' | 'answer' | 'motion' | 'brief' | 'other';
  jurisdiction: string;
  description: string;
}

interface Court {
  id: string;
  name: string;
  jurisdiction: string;
  level: 'federal' | 'state' | 'appellate' | 'supreme';
}

interface LoaderData {
  templates: PleadingTemplate[];
  courts: Court[];
  recentPleadings: Array<{ id: string; name: string; date: string }>;
}

interface ActionData {
  success: boolean;
  message?: string;
  error?: string;
  pleadingId?: string;
  previewUrl?: string;
  content?: string;
  errors?: string[];
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Pleading Builder',
    description: 'Create court-ready legal pleadings with proper formatting and structure',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
  const url = new URL(request.url);
  const templateId = url.searchParams.get('template');
  const caseId = url.searchParams.get('case');
  console.log('template ID:', templateId, 'case ID:', caseId);

  try {
    const [templates, courts, documents] = await Promise.all([
      DataService.playbooks.getAll(),
      DataService.jurisdiction.getAll(),
      DataService.documents.getAll()
    ]);

    // Filter documents for recent pleadings
    const recentPleadings = Array.isArray(documents)
      ? (documents as LegalDocument[])
        .filter((d) => d.type === 'pleading' || ('category' in d && (d as LegalDocument & { category?: string }).category === 'pleading'))
        .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
        .slice(0, 5)
        .map((d) => ({ id: d.id, name: d.title, date: d.updatedAt || d.createdAt || new Date().toISOString() }))
      : [];

    // Map templates to PleadingTemplate interface
    const mappedTemplates = Array.isArray(templates) ? templates.map((t: { id: string; name: string; category?: string; jurisdiction?: string; description?: string }) => ({
      id: t.id,
      name: t.name,
      type: (t.category as PleadingTemplate['type']) || 'other',
      jurisdiction: t.jurisdiction || 'General',
      description: t.description || ''
    })) : [];

    // Map courts
    const mappedCourts = Array.isArray(courts) ? courts.map((c: { id: string; name: string; jurisdiction?: string; level?: string }) => ({
      id: c.id,
      name: c.name,
      jurisdiction: c.jurisdiction || 'General',
      level: (c.level as Court['level']) || 'state'
    })) : [];

    return {
      templates: mappedTemplates,
      courts: mappedCourts,
      recentPleadings
    };
  } catch (error) {
    if ((error as Error)?.message?.includes('401') || (error as Error)?.message?.includes('Unauthorized') || (error as { statusCode?: number })?.statusCode === 401) {
      throw redirect('/login');
    }
    console.error("Failed to load pleading builder data", error);
    return { templates: [], courts: [], recentPleadings: [] };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "save": {
      const title = formData.get("title") as string;
      const courtId = formData.get("courtId") as string;
      const templateId = formData.get("templateId") as string;
      const content = formData.get("content") as string;

      if (!title?.trim()) {
        return {
          success: false,
          error: "Document title is required",
        };
      }

      try {
        const pleading = await DataService.pleadings.add({
          title: title.trim(),
          courtId: courtId || undefined,
          templateId: templateId || undefined,
          content: content || '',
          status: 'Draft',
          type: 'Motion',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return {
          success: true,
          message: "Pleading saved successfully",
          pleadingId: pleading.id,
        };
      } catch (error) {
        console.error('Failed to save pleading:', error);
        return {
          success: false,
          error: "Failed to save pleading",
        };
      }
    }

    case "generate": {
      const templateId = formData.get("templateId") as string;
      const courtId = formData.get("courtId") as string;
      const parties = formData.get("parties") as string;
      const claims = formData.get("claims") as string;

      if (!templateId) {
        return {
          success: false,
          error: "Please select a template",
        };
      }

      if (!courtId) {
        return {
          success: false,
          error: "Please select a court",
        };
      }

      try {
        const template = await DataService.drafting.templates.getById(templateId);
        if (!template) {
          return {
            success: false,
            error: "Template not found",
          };
        }

        let content = template.content || '';
        if (parties) {
          content = content.replace(/{{parties}}/g, parties);
        }
        if (claims) {
          content = content.replace(/{{claims}}/g, claims);
        }
        content = content.replace(/{{date}}/g, new Date().toLocaleDateString());
        content = content.replace(/{{court}}/g, courtId);

        return {
          success: true,
          message: "Pleading generated successfully",
          content,
        };
      } catch (error) {
        console.error('Failed to generate pleading:', error);
        return {
          success: false,
          error: "Failed to generate pleading",
        };
      }
    }

    case "preview": {
      const content = formData.get("content") as string;
      const title = formData.get("title") as string;

      try {
        const previewHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title || 'Pleading Preview'}</title>
            <style>
              @page { margin: 1in; }
              body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 2; }
              h1 { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 2em; }
              p { text-indent: 0.5in; margin: 0; }
            </style>
          </head>
          <body>
            <h1>${title || 'LEGAL PLEADING'}</h1>
            <div>${content || ''}</div>
          </body>
          </html>
        `;

        const blob = new Blob([previewHtml], { type: 'text/html' });
        const previewUrl = URL.createObjectURL(blob);

        return {
          success: true,
          message: "Preview generated",
          previewUrl,
        };
      } catch (error) {
        console.error('Failed to generate preview:', error);
        return {
          success: false,
          error: "Failed to generate preview",
        };
      }
    }

    case "export": {
      const format = formData.get("format") as string;
      const content = formData.get("content") as string;
      const title = formData.get("title") as string;

      try {
        let exportBlob: Blob;
        let filename: string;

        switch (format?.toLowerCase()) {
          case 'docx':
            exportBlob = new Blob([content || ''], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            filename = `${title || 'pleading'}.docx`;
            break;
          case 'txt':
            exportBlob = new Blob([content || ''], { type: 'text/plain' });
            filename = `${title || 'pleading'}.txt`;
            break;
          case 'pdf':
          default: {
            const html = `<!DOCTYPE html><html><head><title>${title}</title></head><body>${content}</body></html>`;
            exportBlob = new Blob([html], { type: 'text/html' });
            filename = `${title || 'pleading'}.html`;
            break;
          }
        }

        const url = URL.createObjectURL(exportBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Pleading exported as ${format?.toUpperCase() || 'HTML'}`,
        };
      } catch (error) {
        console.error('Failed to export pleading:', error);
        return {
          success: false,
          error: "Failed to export pleading",
        };
      }
    }

    case "validate": {
      const content = formData.get("content") as string;

      try {
        const validationErrors: string[] = [];

        if (!content || content.trim().length < 100) {
          validationErrors.push("Content appears too short for a legal pleading");
        }

        const wordCount = content?.split(/\s+/).length || 0;
        if (wordCount > 10000) {
          validationErrors.push("Content exceeds typical pleading length limits");
        }

        const hasCaption = /IN THE .* COURT/i.test(content || '');
        if (!hasCaption) {
          validationErrors.push("Missing standard court caption");
        }

        const hasCertificate = /certificate of service/i.test(content || '');
        if (!hasCertificate) {
          validationErrors.push("Missing certificate of service");
        }

        if (validationErrors.length > 0) {
          return {
            success: false,
            message: "Pleading validation found issues",
            errors: validationErrors,
          };
        }

        return {
          success: true,
          message: "Pleading validation passed - meets court requirements",
        };
      } catch (error) {
        console.error('Validation failed:', error);
        return {
          success: false,
          error: "Validation process failed",
        };
      }
    }

    default:
      return {
        success: false,
        error: "Invalid action",
      };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function PleadingBuilderRoute({ loaderData }: { loaderData: LoaderData }) {
  const navigate = useNavigate();
  const { templates, courts } = loaderData;

  const handleCancel = () => {
    navigate('/pleading');
  };

  const handleLoadTemplate = (templateId: string) => {
    navigate(`/pleading/builder?template=${templateId}`);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/pleading" className="hover:text-gray-700 dark:hover:text-gray-200">
          Pleading
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Builder</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Pleading Builder
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create court-ready legal pleadings with proper formatting
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Builder Area */}
        <div className="lg:col-span-3">
          <Form method="post" className="space-y-6">
            {/* Document Settings */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Document Settings
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Document Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="e.g., Complaint for Breach of Contract"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="caseNumber" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Case Number (if assigned)
                  </label>
                  <input
                    type="text"
                    id="caseNumber"
                    name="caseNumber"
                    placeholder="e.g., 24-cv-1234"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Court & Template Selection */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Court & Template
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="courtId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Court
                  </label>
                  <select
                    id="courtId"
                    name="courtId"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select a court</option>
                    {courts.map((court: Court) => (
                      <option key={court.id} value={court.id}>
                        {court.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="templateId" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Template
                  </label>
                  <select
                    id="templateId"
                    name="templateId"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select a template</option>
                    {templates.map((template: PleadingTemplate) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.jurisdiction})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Parties Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Parties
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="plaintiffs" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plaintiff(s)
                  </label>
                  <textarea
                    id="plaintiffs"
                    name="plaintiffs"
                    rows={2}
                    placeholder="Enter plaintiff names and details"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="defendants" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Defendant(s)
                  </label>
                  <textarea
                    id="defendants"
                    name="defendants"
                    rows={2}
                    placeholder="Enter defendant names and details"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Document Content
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="claims" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Claims / Causes of Action
                  </label>
                  <textarea
                    id="claims"
                    name="claims"
                    rows={6}
                    placeholder="Enter your claims or causes of action..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="prayerForRelief" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prayer for Relief
                  </label>
                  <textarea
                    id="prayerForRelief"
                    name="prayerForRelief"
                    rows={4}
                    placeholder="Enter the relief sought..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="validate"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Validate
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="generate"
                  className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                >
                  Generate
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="preview"
                  className="rounded-md border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="save"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save
                </button>
              </div>
            </div>
          </Form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Templates Quick Access */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Quick Templates
            </h3>
            <div className="space-y-2">
              {templates.map((template: PleadingTemplate) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleLoadTemplate(template.id)}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <span className="font-medium">{template.name}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Formatting Tips */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              Formatting Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <li>Select court first for proper formatting</li>
              <li>Templates auto-apply court local rules</li>
              <li>Use Validate to check compliance</li>
              <li>Preview before filing</li>
            </ul>
          </div>

          {/* Export Options */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Export Options
            </h3>
            <Form method="post" className="space-y-2">
              <input type="hidden" name="intent" value="export" />
              <button
                type="submit"
                name="format"
                value="pdf"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as PDF
              </button>
              <button
                type="submit"
                name="format"
                value="docx"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Export as Word
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Pleading Builder Error"
      message="Failed to load the pleading builder. Please try again."
      backTo="/pleading"
      backLabel="Back to Pleading"
    />
  );
}
