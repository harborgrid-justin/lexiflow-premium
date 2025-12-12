import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  defaultFormat: string;
  availableFilters: FilterDefinition[];
  availableParameters: ParameterDefinition[];
}

interface FilterDefinition {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
  required: boolean;
  defaultValue: any;
}

interface ParameterDefinition {
  name: string;
  label: string;
  type: 'boolean' | 'select' | 'number';
  options?: Array<{ value: string; label: string }>;
  defaultValue: any;
  description?: string;
}

interface GeneratedReport {
  id: string;
  title: string;
  status: string;
  format: string;
  createdAt: Date;
  fileUrl?: string;
}

export const ReportBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [format, setFormat] = useState<string>('pdf');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadRecentReports();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      // Initialize filters and parameters with defaults
      const defaultFilters: Record<string, any> = {};
      selectedTemplate.availableFilters.forEach((filter) => {
        defaultFilters[filter.name] = filter.defaultValue;
      });
      setFilters(defaultFilters);

      const defaultParams: Record<string, any> = {};
      selectedTemplate.availableParameters.forEach((param) => {
        defaultParams[param.name] = param.defaultValue;
      });
      setParameters(defaultParams);

      setFormat(selectedTemplate.defaultFormat);
      setTitle(selectedTemplate.name);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const templateList = await reportService.getReportTemplates();
      setTemplates(templateList);
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadRecentReports = async () => {
    try {
      const reports = await reportService.getReports(1, 5);
      setGeneratedReports(reports.reports);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    // Validate required filters
    const missingFilters = selectedTemplate.availableFilters
      .filter((f) => f.required && !filters[f.name])
      .map((f) => f.label);

    if (missingFilters.length > 0) {
      setError(`Please fill in required fields: ${missingFilters.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await reportService.generateReport({
        type: selectedTemplate.type,
        title,
        description,
        format,
        filters,
        parameters,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      await loadRecentReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportId: string) => {
    try {
      const downloadUrl = await reportService.getDownloadUrl(reportId);
      window.open(downloadUrl.downloadUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Report Builder</h2>
        <p className="text-gray-600 mt-1">Create custom reports with filters and parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Template Selection & Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Select Report Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {template.defaultFormat.toUpperCase()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <>
              {/* Report Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Report Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Report Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter report title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter report description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format *
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Filters */}
              {selectedTemplate.availableFilters.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">3. Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.availableFilters.map((filter) => (
                      <div key={filter.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {filter.label} {filter.required && <span className="text-red-500">*</span>}
                        </label>
                        {filter.type === 'select' && filter.options ? (
                          <select
                            value={filters[filter.name] || ''}
                            onChange={(e) =>
                              setFilters({ ...filters, [filter.name]: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select...</option>
                            {filter.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : filter.type === 'date' ? (
                          <input
                            type="date"
                            value={filters[filter.name] || ''}
                            onChange={(e) =>
                              setFilters({ ...filters, [filter.name]: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <input
                            type={filter.type}
                            value={filters[filter.name] || ''}
                            onChange={(e) =>
                              setFilters({ ...filters, [filter.name]: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parameters */}
              {selectedTemplate.availableParameters.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">4. Options</h3>
                  <div className="space-y-3">
                    {selectedTemplate.availableParameters.map((param) => (
                      <div key={param.name} className="flex items-start gap-3">
                        {param.type === 'boolean' ? (
                          <>
                            <input
                              type="checkbox"
                              checked={parameters[param.name] || false}
                              onChange={(e) =>
                                setParameters({ ...parameters, [param.name]: e.target.checked })
                              }
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <label className="text-sm font-medium text-gray-700">
                                {param.label}
                              </label>
                              {param.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{param.description}</p>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {param.label}
                            </label>
                            <select
                              value={parameters[param.name] || param.defaultValue}
                              onChange={(e) =>
                                setParameters({ ...parameters, [param.name]: e.target.value })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                              {param.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                {showSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      Report generation started! Check Recent Reports for status.
                    </p>
                  </div>
                )}
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Generating Report...
                    </span>
                  ) : (
                    'Generate Report'
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Recent Reports */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
            <div className="space-y-3">
              {generatedReports.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No reports generated yet</p>
              ) : (
                generatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{report.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'generating'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    {report.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadReport(report.id)}
                        className="mt-2 w-full px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        📥 Download {report.format.toUpperCase()}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• PDF format best for presentations</li>
              <li>• Excel for data analysis</li>
              <li>• CSV for importing into other systems</li>
              <li>• Reports expire after 30 days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
