import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';

export default function ComplianceReportGenerator() {
  const [reportType, setReportType] = useState('comprehensive');
  const [framework, setFramework] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/compliance/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, framework, dateRange }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${new Date().toISOString()}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Report Generator</h1>
        <p className="text-gray-600 mt-1">Generate comprehensive compliance reports</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="comprehensive">Comprehensive Compliance Report</option>
              <option value="soc2">SOC 2 Audit Package</option>
              <option value="hipaa">HIPAA Compliance Assessment</option>
              <option value="gdpr">GDPR Compliance Report</option>
              <option value="audit">Audit Trail Summary</option>
              <option value="incidents">Security Incidents Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Frameworks</option>
              <option value="SOC2">SOC 2</option>
              <option value="HIPAA">HIPAA</option>
              <option value="GDPR">GDPR</option>
              <option value="ISO27001">ISO 27001</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={generateReport}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generate Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
