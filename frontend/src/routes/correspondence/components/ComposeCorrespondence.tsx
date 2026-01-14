import type { DraftingTemplate } from '@/api/domains/drafting';
import { Form, Link, useNavigate } from 'react-router';
import type { ComposeLoaderData } from './types';

interface ComposeCorrespondenceProps {
  data: ComposeLoaderData;
}

export function ComposeCorrespondence({ data }: ComposeCorrespondenceProps) {
  const navigate = useNavigate();
  const { templates, draftId } = data;

  const handleCancel = () => {
    navigate('/correspondence');
  };

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/correspondence/compose?template=${templateId}`);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/correspondence" className="hover:text-gray-700 dark:hover:text-gray-200">
          Correspondence
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Compose</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Compose Correspondence
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create and send legal correspondence
          </p>
        </div>
        {draftId && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            Draft
          </span>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Compose Area */}
        <div className="lg:col-span-2">
          <Form method="post" className="space-y-6">
            {/* Template Selection */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Template
              </h2>
              <select
                name="templateId"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
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
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recipients
              </h2>
              <input
                type="text"
                name="recipients"
                placeholder="Enter recipient email addresses, separated by commas"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            {/* Subject & Body */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Message
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="Enter subject line"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label htmlFor="body" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Body
                  </label>
                  <textarea
                    id="body"
                    name="body"
                    rows={12}
                    placeholder="Compose your message..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
              <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Attachments
              </h2>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Drag and drop files here, or click to browse
              </p>
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Add Attachments
              </button>
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
                  value="save-draft"
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Save Draft
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
                  value="send"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Quick Templates
            </h3>
            <div className="space-y-2">
              {templates.slice(0, 4).map((template: DraftingTemplate) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
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

          {/* Tips */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
              Composition Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
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
