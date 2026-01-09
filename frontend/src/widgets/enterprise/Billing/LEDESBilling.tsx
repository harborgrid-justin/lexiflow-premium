/**
 * LEDESBilling Component
 * LEDES 1998B/2000 format support with UTBMS code management and e-billing integration
 */

import {
  AlertCircle,
  CheckCircle,
  Database,
  Download,
  FileText,
  Filter,
  Search,
  Send,
  Settings,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { cn } from '@/lib/utils';

// Types
interface LEDESFormat {
  id: string;
  version: '1998B' | '2000';
  name: string;
  description: string;
}

interface UTBMSCode {
  code: string;
  category: 'Task' | 'Activity' | 'Expense';
  description: string;
  phase?: string;
  level: number;
}

interface RateSchedule {
  id: string;
  name: string;
  effectiveDate: string;
  expiryDate?: string;
  rates: RateScheduleEntry[];
}

interface RateScheduleEntry {
  timekeeperLevel: string;
  hourlyRate: number;
  currency: string;
}

interface EBillingPortal {
  id: string;
  clientName: string;
  portalName: string;
  url: string;
  format: 'LEDES 1998B' | 'LEDES 2000' | 'Custom';
  status: 'active' | 'inactive';
  lastSubmission?: string;
}

interface LEDESValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  line: number;
  field: string;
  message: string;
}

interface ValidationWarning {
  line: number;
  field: string;
  message: string;
}

interface LEDESBillingProps {
  onExport?: (format: LEDESFormat, invoiceId: string) => void;
  onImport?: (file: File) => void;
  onValidate?: (data: unknown) => Promise<LEDESValidation>;
}

export const LEDESBilling: React.FC<LEDESBillingProps> = ({
  onExport,
  onImport,
  onValidate,
}) => {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'formats' | 'utbms' | 'rates' | 'portals'>('formats');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'1998B' | '2000'>('1998B');
  const [showValidation, setShowValidation] = useState(false);
  const [validationResults, setValidationResults] = useState<LEDESValidation | null>(null);

  const handleExport = async (invoiceId: string) => {
    const format = ledesFormats.find(f => f.version === selectedFormat);
    if (format && onExport) {
      onExport(format, invoiceId);
    }
  };

  const handleValidate = async (data: unknown) => {
    if (onValidate) {
      const results = await onValidate(data);
      setValidationResults(results);
      setShowValidation(true);
    }
  };

  // Mock data
  const ledesFormats: LEDESFormat[] = [
    {
      id: '1',
      version: '1998B',
      name: 'LEDES 1998B',
      description: 'Standard format for time and expense billing',
    },
    {
      id: '2',
      version: '2000',
      name: 'LEDES 2000',
      description: 'Enhanced format with additional fields',
    },
  ];

  const utbmsCodes: UTBMSCode[] = [
    { code: 'L110', category: 'Task', description: 'Case Assessment, Development, and Administration', phase: 'Pre-litigation', level: 1 },
    { code: 'L120', category: 'Task', description: 'Fact Investigation/Development', phase: 'Pre-litigation', level: 1 },
    { code: 'L210', category: 'Task', description: 'Pleadings', phase: 'Litigation', level: 1 },
    { code: 'L220', category: 'Task', description: 'Discovery', phase: 'Litigation', level: 1 },
    { code: 'L230', category: 'Task', description: 'Depositions', phase: 'Litigation', level: 1 },
    { code: 'L310', category: 'Task', description: 'Motions', phase: 'Litigation', level: 1 },
    { code: 'L410', category: 'Task', description: 'Trial Preparation and Support', phase: 'Trial', level: 1 },
    { code: 'L420', category: 'Task', description: 'Trial', phase: 'Trial', level: 1 },
    { code: 'A101', category: 'Activity', description: 'Plan/prepare/schedule for appearance, hearing, or meeting', phase: '', level: 2 },
    { code: 'A102', category: 'Activity', description: 'Appear/participate in appearance, hearing, or meeting', phase: '', level: 2 },
    { code: 'A103', category: 'Activity', description: 'Draft pleading/document', phase: '', level: 2 },
    { code: 'A104', category: 'Activity', description: 'Review/analyze pleading/document', phase: '', level: 2 },
    { code: 'E101', category: 'Expense', description: 'Court Fees', phase: '', level: 1 },
    { code: 'E102', category: 'Expense', description: 'Process Server Fees', phase: '', level: 1 },
    { code: 'E103', category: 'Expense', description: 'Expert/Consultant Fees', phase: '', level: 1 },
  ];

  const rateSchedules: RateSchedule[] = [
    {
      id: '1',
      name: 'Standard Corporate Rates 2024',
      effectiveDate: '2024-01-01',
      rates: [
        { timekeeperLevel: 'Partner', hourlyRate: 650.00, currency: 'USD' },
        { timekeeperLevel: 'Senior Associate', hourlyRate: 475.00, currency: 'USD' },
        { timekeeperLevel: 'Associate', hourlyRate: 350.00, currency: 'USD' },
        { timekeeperLevel: 'Paralegal', hourlyRate: 175.00, currency: 'USD' },
      ],
    },
    {
      id: '2',
      name: 'Discounted Rates - TechCorp',
      effectiveDate: '2024-01-01',
      expiryDate: '2024-12-31',
      rates: [
        { timekeeperLevel: 'Partner', hourlyRate: 585.00, currency: 'USD' },
        { timekeeperLevel: 'Senior Associate', hourlyRate: 425.00, currency: 'USD' },
        { timekeeperLevel: 'Associate', hourlyRate: 315.00, currency: 'USD' },
        { timekeeperLevel: 'Paralegal', hourlyRate: 160.00, currency: 'USD' },
      ],
    },
  ];

  const eBillingPortals: EBillingPortal[] = [
    {
      id: '1',
      clientName: 'Acme Corporation',
      portalName: 'Counsel Link',
      url: 'https://counsellink.lexisnexis.com',
      format: 'LEDES 1998B',
      status: 'active',
      lastSubmission: '2024-01-02',
    },
    {
      id: '2',
      clientName: 'TechStart LLC',
      portalName: 'TyMetrix',
      url: 'https://360.tymetrix.com',
      format: 'LEDES 2000',
      status: 'active',
      lastSubmission: '2023-12-28',
    },
    {
      id: '3',
      clientName: 'GlobalTrade Inc',
      portalName: 'SimpleLegal',
      url: 'https://app.simplelegal.com',
      format: 'LEDES 1998B',
      status: 'active',
    },
  ];

  const filteredCodes = utbmsCodes.filter(
    (code) =>
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className={cn("flex items-center justify-between rounded-lg border p-4", theme.border.default, theme.surface.default)}>
        <div className="flex items-center gap-3">
          <FileText className={cn("h-5 w-5", theme.text.secondary)} />
          <span className={cn("text-sm font-medium", theme.text.primary)}>
            LEDES Format: {selectedFormat}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleValidate({})}
            className={cn(
              "inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700",
              theme.border.default,
              theme.surface.default,
              theme.text.primary
            )}
          >
            <AlertCircle className="h-4 w-4" />
            Validate
          </button>
          <button
            onClick={() => handleExport('invoice-123')}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            Send to Portal
          </button>
        </div>
      </div>

      {/* Validation Results */}
      {showValidation && validationResults && (
        <div className={cn("rounded-lg border p-4", theme.border.default, theme.surface.default)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              Validation Results
            </h3>
            <button
              onClick={() => setShowValidation(false)}
              className={cn("hover:text-gray-700 dark:hover:text-gray-200", theme.text.secondary)}
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {validationResults.isValid ? (
              <div className={cn("flex items-center gap-2", theme.status.success)}>
                <AlertCircle className="h-5 w-5" />
                <span>All validations passed</span>
              </div>
            ) : (
              <div className="space-y-2">
                {validationResults.errors.map((error, idx) => (
                  <div key={idx} className={cn("flex items-start gap-2", theme.status.error)}>
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <span className="text-sm">Line {error.line}: {error.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-bold", theme.text.primary)}>
            LEDES Billing Management
          </h2>
          <p className={cn("mt-1 text-sm", theme.text.secondary)}>
            LEDES format support and UTBMS code management
          </p>
        </div>
        <div className="flex gap-3">
          <label className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700",
            theme.border.default,
            theme.surface.default,
            theme.text.primary,
          )}>
            <Upload className="h-4 w-4" />
            Import LEDES
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
            <Download className="h-4 w-4" />
            Export LEDES
          </button>
        </div>
      </div>

      {/* Format Selection */}
      <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
        <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
          LEDES Format
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {ledesFormats.map((format) => (
            <div
              key={format.id}
              className={cn(
                "cursor-pointer rounded-lg border-2 p-4 transition-colors",
                selectedFormat === format.version
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : cn("hover:border-gray-300", theme.border.default)
              )}
              onClick={() => setSelectedFormat(format.version)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={cn("font-medium", theme.text.primary)}>
                    {format.name}
                  </h4>
                  <p className={cn("mt-1 text-sm", theme.text.secondary)}>
                    {format.description}
                  </p>
                </div>
                {selectedFormat === format.version && (
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <nav className="-mb-px flex space-x-8">
          {(['formats', 'utbms', 'rates', 'portals'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
                selectedTab === tab
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : cn("border-transparent hover:border-gray-300", theme.text.secondary)
              )}
            >
              {tab === 'utbms' ? 'UTBMS Codes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'utbms' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={cn("absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2", theme.text.secondary)} />
                <input
                  type="text"
                  placeholder="Search UTBMS codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full rounded-md border py-2 pl-10 pr-4 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500",
                    theme.border.default,
                    theme.surface.default,
                    theme.text.primary
                  )}
                />
              </div>
            </div>
            <button className={cn(
              "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700",
              theme.border.default,
              theme.surface.default,
              theme.text.primary
            )}>
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>

          {/* UTBMS Codes Table */}
          <div className={cn("rounded-lg border", theme.border.default, theme.surface.default)}>
            <div className="overflow-x-auto">
              <table className={cn("min-w-full divide-y", theme.divide.default)}>
                <thead className={theme.surface.subtle}>
                  <tr>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Code
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Category
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Description
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Phase
                    </th>
                    <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                  {filteredCodes.map((code, index) => (
                    <tr key={index} className={cn("hover:bg-gray-50 dark:hover:bg-gray-700")}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                        {code.code}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${code.category === 'Task'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : code.category === 'Activity'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}
                        >
                          {code.category}
                        </span>
                      </td>
                      <td className={cn("px-6 py-4 text-sm", theme.text.primary)}>
                        {code.description}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.secondary)}>
                        {code.phase || '-'}
                      </td>
                      <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.secondary)}>
                        Level {code.level}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'rates' && (
        <div className="space-y-4">
          {rateSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
                    {schedule.name}
                  </h3>
                  <p className={cn("text-sm", theme.text.secondary)}>
                    Effective: {new Date(schedule.effectiveDate).toLocaleDateString()}
                    {schedule.expiryDate && ` - ${new Date(schedule.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <button className={cn("hover:text-blue-900 dark:hover:text-blue-300", theme.text.accent)}>
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className={cn("min-w-full divide-y", theme.divide.default)}>
                  <thead className={theme.surface.subtle}>
                    <tr>
                      <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                        Timekeeper Level
                      </th>
                      <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                        Hourly Rate
                      </th>
                      <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                        Currency
                      </th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                    {schedule.rates.map((rate, index) => (
                      <tr key={index}>
                        <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                          {rate.timekeeperLevel}
                        </td>
                        <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                          ${rate.hourlyRate.toFixed(2)}
                        </td>
                        <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.secondary)}>
                          {rate.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'portals' && (
        <div className={cn("rounded-lg border", theme.border.default, theme.surface.default)}>
          <div className={cn("border-b px-6 py-4", theme.border.default, theme.surface.subtle)}>
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              E-Billing Portal Integration
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className={cn("min-w-full divide-y", theme.divide.default)}>
              <thead className={theme.surface.subtle}>
                <tr>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Client
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Portal Name
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Format
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Last Submission
                  </th>
                  <th className={cn("px-6 py-3 text-left text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Status
                  </th>
                  <th className={cn("px-6 py-3 text-right text-xs font-medium uppercase tracking-wider", theme.text.secondary)}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme.divide.default, theme.surface.default)}>
                {eBillingPortals.map((portal) => (
                  <tr key={portal.id} className={cn("hover:bg-gray-50 dark:hover:bg-gray-700")}>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm font-medium", theme.text.primary)}>
                      {portal.clientName}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.primary)}>
                      {portal.portalName}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.secondary)}>
                      {portal.format}
                    </td>
                    <td className={cn("whitespace-nowrap px-6 py-4 text-sm", theme.text.secondary)}>
                      {portal.lastSubmission
                        ? new Date(portal.lastSubmission).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${portal.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {portal.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <button className={cn("hover:text-blue-900 dark:hover:text-blue-300", theme.text.accent)}>
                        Submit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'formats' && (
        <div className={cn("rounded-lg border p-6", theme.border.default, theme.surface.default)}>
          <h3 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>
            Format Specifications
          </h3>
          <div className="space-y-4">
            <div className={cn("rounded-lg border p-4", theme.border.default, theme.surface.subtle)}>
              <h4 className={cn("font-medium mb-2", theme.text.primary)}>
                LEDES 1998B Format
              </h4>
              <ul className={cn("space-y-2 text-sm", theme.text.secondary)}>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>20 required fields including Invoice Number, Client ID, Law Firm Matter ID</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Tab-delimited text format (.txt)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>UTBMS Task and Activity codes required</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Supports time entries and expenses</span>
                </li>
              </ul>
            </div>

            <div className={cn("rounded-lg border p-4", theme.border.default, theme.surface.subtle)}>
              <h4 className={cn("font-medium mb-2", theme.text.primary)}>
                LEDES 2000 Format
              </h4>
              <ul className={cn("space-y-2 text-sm", theme.text.secondary)}>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Enhanced format with additional invoice-level data</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Pipe-delimited text format (.txt)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Includes invoice header and line item sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Support for adjustments and write-offs</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">
                <Database className="h-4 w-4" />
                Validate Data
              </button>
              <button className={cn(
                "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700",
                theme.border.default,
                theme.surface.default,
                theme.text.primary
              )}>
                <Download className="h-4 w-4" />
                Download Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
