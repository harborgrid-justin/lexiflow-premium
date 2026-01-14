import { Form, Link, useNavigate } from 'react-router';

export interface PleadingTemplate {
  id: string;
  name: string;
  type: 'complaint' | 'answer' | 'motion' | 'brief' | 'other';
  jurisdiction: string;
  description: string;
}

export interface Court {
  id: string;
  name: string;
  jurisdiction: string;
  level: 'federal' | 'state' | 'appellate' | 'supreme';
}

export interface PleadingBuilderProps {
  templates: PleadingTemplate[];
  courts: Court[];
}

export function PleadingBuilder({ templates, courts }: PleadingBuilderProps) {
  const navigate = useNavigate();

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
