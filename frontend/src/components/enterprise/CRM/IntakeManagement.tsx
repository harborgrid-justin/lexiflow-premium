/**
 * @module components/enterprise/CRM/IntakeManagement
 * @category Enterprise CRM
 * @description Client intake management with conflict check integration,
 * intake form builder, engagement letter automation, and fee agreement tracking.
 */

import { MetricCard } from '@/shared/ui/molecules/MetricCard/MetricCard';
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Save,
  Search,
  Send,
  Shield,
  Trash2,
  UserPlus,
  XCircle
} from 'lucide-react';
import React, { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface IntakeRequest {
  id: string;
  prospectName: string;
  prospectEmail: string;
  prospectPhone: string;
  practiceArea: string;
  matterDescription: string;
  estimatedValue: number;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'Conflict Check' | 'Approved' | 'Rejected' | 'Engaged';
  submittedDate: string;
  assignedTo?: string;
  conflictCheckStatus?: 'Pending' | 'Clear' | 'Potential Conflict' | 'Conflict';
  conflictDetails?: string;
  engagementLetterSent?: boolean;
  feeAgreementSigned?: boolean;
}

interface ConflictCheckResult {
  status: 'Clear' | 'Potential Conflict' | 'Conflict';
  matchedClients: string[];
  matchedMatters: string[];
  matchedParties: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  details: string;
  checkedBy: string;
  checkedDate: string;
}

interface IntakeFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'email' | 'phone' | 'number' | 'date' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  order: number;
}

interface FeeAgreement {
  id: string;
  intakeId: string;
  type: 'Hourly' | 'Fixed Fee' | 'Contingency' | 'Retainer' | 'Hybrid';
  hourlyRate?: number;
  fixedAmount?: number;
  contingencyPercentage?: number;
  retainerAmount?: number;
  terms: string;
  status: 'Draft' | 'Sent' | 'Signed' | 'Declined';
  sentDate?: string;
  signedDate?: string;
  version: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const IntakeManagement: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'requests' | 'forms' | 'conflicts' | 'agreements'>('requests');
  const [showFormBuilder, setShowFormBuilder] = useState(false);

  // Mock data
  const intakeRequests: IntakeRequest[] = [
    {
      id: '1',
      prospectName: 'Acme Corporation',
      prospectEmail: 'legal@acme.com',
      prospectPhone: '555-0123',
      practiceArea: 'Corporate Law',
      matterDescription: 'M&A transaction advisory for acquisition of competitor',
      estimatedValue: 500000,
      urgency: 'High',
      status: 'Conflict Check',
      submittedDate: '2026-01-02',
      assignedTo: 'John Smith',
      conflictCheckStatus: 'Pending'
    },
    {
      id: '2',
      prospectName: 'Tech Startup Inc.',
      prospectEmail: 'ceo@techstartup.com',
      prospectPhone: '555-0456',
      practiceArea: 'IP Litigation',
      matterDescription: 'Patent infringement defense',
      estimatedValue: 350000,
      urgency: 'Medium',
      status: 'Approved',
      submittedDate: '2026-01-01',
      assignedTo: 'Sarah Johnson',
      conflictCheckStatus: 'Clear',
      engagementLetterSent: true,
      feeAgreementSigned: false
    },
    {
      id: '3',
      prospectName: 'Individual - Jane Doe',
      prospectEmail: 'jane.doe@email.com',
      prospectPhone: '555-0789',
      practiceArea: 'Employment Law',
      matterDescription: 'Wrongful termination claim',
      estimatedValue: 75000,
      urgency: 'Low',
      status: 'Rejected',
      submittedDate: '2025-12-30',
      assignedTo: 'Mike Wilson',
      conflictCheckStatus: 'Conflict',
      conflictDetails: 'Opposing party is current client'
    }
  ];

  const conflictCheckResults: ConflictCheckResult[] = [
    {
      status: 'Potential Conflict',
      matchedClients: ['Global Industries LLC'],
      matchedMatters: ['Vendor Contract Dispute 2024'],
      matchedParties: ['Acme Subsidiary Holdings'],
      riskLevel: 'Medium',
      details: 'Potential adverse party relationship through subsidiary',
      checkedBy: 'Conflict Team',
      checkedDate: '2026-01-02 14:30'
    }
  ];

  const formFields: IntakeFormField[] = [
    { id: '1', label: 'Prospect Name', type: 'text', required: true, order: 1 },
    { id: '2', label: 'Email Address', type: 'email', required: true, order: 2 },
    { id: '3', label: 'Phone Number', type: 'phone', required: true, order: 3 },
    {
      id: '4',
      label: 'Practice Area',
      type: 'select',
      required: true,
      options: ['Corporate Law', 'Litigation', 'IP Law', 'Employment Law', 'Real Estate'],
      order: 4
    },
    { id: '5', label: 'Matter Description', type: 'textarea', required: true, order: 5 },
    { id: '6', label: 'Estimated Value', type: 'number', required: false, order: 6 }
  ];

  const feeAgreements: FeeAgreement[] = [
    {
      id: '1',
      intakeId: '2',
      type: 'Hourly',
      hourlyRate: 450,
      terms: 'Standard hourly billing with monthly invoicing',
      status: 'Sent',
      sentDate: '2026-01-02',
      version: 1
    }
  ];

  // Calculate metrics
  const totalRequests = intakeRequests.length;
  const pendingConflictChecks = intakeRequests.filter(r => r.conflictCheckStatus === 'Pending').length;
  const approvedRequests = intakeRequests.filter(r => r.status === 'Approved').length;
  const potentialRevenue = intakeRequests
    .filter(r => r.status !== 'Rejected')
    .reduce((acc, r) => acc + r.estimatedValue, 0);

  // ============================================================================
  // RENDER: INTAKE REQUESTS TAB
  // ============================================================================

  const renderIntakeRequestsTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <div className={cn("flex gap-4 p-4 rounded-lg", theme.surface.default, theme.border.default, "border")}>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Statuses</option>
          <option>New</option>
          <option>Conflict Check</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Practice Areas</option>
          <option>Corporate Law</option>
          <option>Litigation</option>
          <option>IP Law</option>
        </select>
        <select className={cn("px-4 py-2 rounded-md border", theme.surface.default, theme.text.primary, theme.border.default)}>
          <option>All Urgencies</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {intakeRequests.map(request => (
          <div
            key={request.id}
            className={cn("p-6 rounded-lg border hover:shadow-lg transition-all", theme.surface.default, theme.border.default)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={cn("font-bold text-lg", theme.text.primary)}>{request.prospectName}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    request.urgency === 'Critical' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      request.urgency === 'High' ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" :
                        request.urgency === 'Medium' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {request.urgency} Priority
                  </span>
                </div>
                <p className={cn("text-sm mb-2", theme.text.secondary)}>{request.practiceArea}</p>
                <p className={cn("text-sm", theme.text.secondary)}>{request.matterDescription}</p>
              </div>
              <div className="text-right">
                <span className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  request.status === 'Approved' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                    request.status === 'Rejected' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                )}>
                  {request.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Submitted</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{request.submittedDate}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Estimated Value</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>
                  ${request.estimatedValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Assigned To</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{request.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Conflict Check</p>
                <div className="flex items-center gap-1">
                  {request.conflictCheckStatus === 'Clear' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {request.conflictCheckStatus === 'Pending' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {request.conflictCheckStatus === 'Conflict' && <XCircle className="h-4 w-4 text-red-600" />}
                  {request.conflictCheckStatus === 'Potential Conflict' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                  <span className={cn("text-sm font-medium", theme.text.primary)}>
                    {request.conflictCheckStatus || 'Not Started'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={cn("flex gap-2 pt-4 border-t", theme.border.default)}>
              <button className={cn("px-3 py-2 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Search className="h-4 w-4 inline mr-1" />
                Run Conflict Check
              </button>
              <button className={cn("px-3 py-2 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <FileText className="h-4 w-4 inline mr-1" />
                Generate Engagement Letter
              </button>
              <button className={cn("px-3 py-2 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <DollarSign className="h-4 w-4 inline mr-1" />
                Create Fee Agreement
              </button>
              <button className="px-3 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: FORM BUILDER TAB
  // ============================================================================

  const renderFormBuilderTab = () => (
    <div className="space-y-4">
      {/* Form Templates */}
      <div className="flex justify-between items-center">
        <h3 className={cn("font-medium", theme.text.primary)}>Intake Form Templates</h3>
        <button
          onClick={() => setShowFormBuilder(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 inline mr-1" />
          Create New Template
        </button>
      </div>

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: '1', name: 'General Intake Form', fields: 8, lastModified: '2026-01-01', active: true },
          { id: '2', name: 'Corporate Client Intake', fields: 12, lastModified: '2025-12-28', active: true },
          { id: '3', name: 'Personal Injury Intake', fields: 15, lastModified: '2025-12-15', active: false }
        ].map(template => (
          <div key={template.id} className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className={cn("font-bold", theme.text.primary)}>{template.name}</h4>
                <p className={cn("text-sm", theme.text.secondary)}>{template.fields} fields</p>
              </div>
              <span className={cn(
                "px-2 py-1 rounded text-xs",
                template.active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
              )}>
                {template.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className={cn("text-xs mb-3", theme.text.tertiary)}>Last modified: {template.lastModified}</p>
            <div className="flex gap-2">
              <button className={cn("px-3 py-1 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Eye className="h-4 w-4 inline mr-1" />
                Preview
              </button>
              <button className={cn("px-3 py-1 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Edit className="h-4 w-4 inline mr-1" />
                Edit
              </button>
              <button className={cn("px-3 py-1 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Download className="h-4 w-4 inline mr-1" />
                Export
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Fields Editor */}
      {showFormBuilder && (
        <div className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex justify-between items-center mb-4">
            <h4 className={cn("font-bold", theme.text.primary)}>Form Fields</h4>
            <button
              onClick={() => setShowFormBuilder(false)}
              className={cn("px-3 py-2 rounded text-sm border", theme.border.default)}
            >
              Close
            </button>
          </div>
          <div className="space-y-3">
            {formFields.sort((a, b) => a.order - b.order).map(field => (
              <div key={field.id} className={cn("p-3 rounded border", theme.border.default)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={cn("font-medium", theme.text.primary)}>{field.label}</p>
                    <p className={cn("text-xs", theme.text.secondary)}>
                      Type: {field.type} • {field.required ? 'Required' : 'Optional'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className={cn("p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800", theme.text.secondary)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className={cn("p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800", theme.text.secondary)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4 inline mr-1" />
              Add Field
            </button>
            <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">
              <Save className="h-4 w-4 inline mr-1" />
              Save Template
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER: CONFLICT CHECKS TAB
  // ============================================================================

  const renderConflictChecksTab = () => (
    <div className="space-y-4">
      {/* Run New Conflict Check */}
      <div className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
        <h3 className={cn("font-bold mb-4", theme.text.primary)}>Run Conflict Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Prospect Name"
            className={cn("px-3 py-2 rounded border", theme.surface.default, theme.border.default)}
          />
          <input
            type="text"
            placeholder="Opposing Party"
            className={cn("px-3 py-2 rounded border", theme.surface.default, theme.border.default)}
          />
          <input
            type="text"
            placeholder="Related Companies"
            className={cn("px-3 py-2 rounded border", theme.surface.default, theme.border.default)}
          />
          <input
            type="text"
            placeholder="Key Individuals"
            className={cn("px-3 py-2 rounded border", theme.surface.default, theme.border.default)}
          />
        </div>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Search className="h-4 w-4 inline mr-1" />
          Run Comprehensive Check
        </button>
      </div>

      {/* Recent Conflict Checks */}
      <h3 className={cn("font-medium", theme.text.primary)}>Recent Conflict Checks</h3>
      <div className="space-y-3">
        {conflictCheckResults.map((result, idx) => (
          <div key={idx} className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {result.status === 'Clear' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                {result.status === 'Potential Conflict' && <AlertTriangle className="h-6 w-6 text-orange-600" />}
                {result.status === 'Conflict' && <XCircle className="h-6 w-6 text-red-600" />}
                <div>
                  <h4 className={cn("font-bold", theme.text.primary)}>{result.status}</h4>
                  <p className={cn("text-sm", theme.text.secondary)}>
                    Checked by {result.checkedBy} on {result.checkedDate}
                  </p>
                </div>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                result.riskLevel === 'High' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                  result.riskLevel === 'Medium' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              )}>
                {result.riskLevel} Risk
              </span>
            </div>

            <p className={cn("text-sm mb-4", theme.text.primary)}>{result.details}</p>

            {(result.matchedClients.length > 0 || result.matchedMatters.length > 0 || result.matchedParties.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.matchedClients.length > 0 && (
                  <div>
                    <p className={cn("text-xs font-medium mb-2", theme.text.tertiary)}>Matched Clients</p>
                    <ul className="space-y-1">
                      {result.matchedClients.map((client, i) => (
                        <li key={i} className={cn("text-sm", theme.text.primary)}>{client}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.matchedMatters.length > 0 && (
                  <div>
                    <p className={cn("text-xs font-medium mb-2", theme.text.tertiary)}>Matched Matters</p>
                    <ul className="space-y-1">
                      {result.matchedMatters.map((matter, i) => (
                        <li key={i} className={cn("text-sm", theme.text.primary)}>{matter}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.matchedParties.length > 0 && (
                  <div>
                    <p className={cn("text-xs font-medium mb-2", theme.text.tertiary)}>Matched Parties</p>
                    <ul className="space-y-1">
                      {result.matchedParties.map((party, i) => (
                        <li key={i} className={cn("text-sm", theme.text.primary)}>{party}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: FEE AGREEMENTS TAB
  // ============================================================================

  const renderFeeAgreementsTab = () => (
    <div className="space-y-4">
      {/* Fee Agreement Templates */}
      <div className="flex justify-between items-center">
        <h3 className={cn("font-medium", theme.text.primary)}>Fee Agreements</h3>
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 inline mr-1" />
          Create Fee Agreement
        </button>
      </div>

      {/* Agreements List */}
      <div className="space-y-3">
        {feeAgreements.map(agreement => (
          <div key={agreement.id} className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={cn("font-bold", theme.text.primary)}>{agreement.type} Agreement</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    agreement.status === 'Signed' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                      agreement.status === 'Sent' ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                        agreement.status === 'Declined' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  )}>
                    {agreement.status}
                  </span>
                </div>
                <p className={cn("text-sm", theme.text.secondary)}>{agreement.terms}</p>
              </div>
              <div className="text-right">
                {agreement.hourlyRate && (
                  <p className={cn("text-xl font-bold", theme.text.primary)}>
                    ${agreement.hourlyRate}/hr
                  </p>
                )}
                {agreement.fixedAmount && (
                  <p className={cn("text-xl font-bold", theme.text.primary)}>
                    ${agreement.fixedAmount.toLocaleString()}
                  </p>
                )}
                {agreement.contingencyPercentage && (
                  <p className={cn("text-xl font-bold", theme.text.primary)}>
                    {agreement.contingencyPercentage}%
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Version</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{agreement.version}</p>
              </div>
              {agreement.sentDate && (
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Sent Date</p>
                  <p className={cn("text-sm font-medium", theme.text.primary)}>{agreement.sentDate}</p>
                </div>
              )}
              {agreement.signedDate && (
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Signed Date</p>
                  <p className={cn("text-sm font-medium", theme.text.primary)}>{agreement.signedDate}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button className={cn("px-3 py-2 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Eye className="h-4 w-4 inline mr-1" />
                View
              </button>
              <button className={cn("px-3 py-2 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Edit className="h-4 w-4 inline mr-1" />
                Edit
              </button>
              <button className={cn("px-3 py-2 rounded text-sm border", theme.border.default, "hover:shadow")}>
                <Download className="h-4 w-4 inline mr-1" />
                Download
              </button>
              {agreement.status === 'Draft' && (
                <button className="px-3 py-2 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">
                  <Send className="h-4 w-4 inline mr-1" />
                  Send for Signature
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Intake Requests"
          value={totalRequests.toString()}
          icon={UserPlus}
          className="border-l-4 border-l-blue-600"
        />
        <MetricCard
          label="Pending Conflict Checks"
          value={pendingConflictChecks.toString()}
          icon={Shield}
          className="border-l-4 border-l-yellow-600"
        />
        <MetricCard
          label="Approved Requests"
          value={approvedRequests.toString()}
          icon={CheckCircle2}
          trend="+15% this month"
          trendUp={true}
          className="border-l-4 border-l-green-600"
        />
        <MetricCard
          label="Potential Revenue"
          value={`$${(potentialRevenue / 1000).toFixed(0)}k`}
          icon={DollarSign}
          className="border-l-4 border-l-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <div className="flex gap-6">
          {[
            { id: 'requests' as const, label: 'Intake Requests', icon: UserPlus },
            { id: 'forms' as const, label: 'Form Builder', icon: Edit },
            { id: 'conflicts' as const, label: 'Conflict Checks', icon: Shield },
            { id: 'agreements' as const, label: 'Fee Agreements', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : cn("border-transparent", theme.text.secondary, "hover:text-blue-600")
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'requests' && renderIntakeRequestsTab()}
        {activeTab === 'forms' && renderFormBuilderTab()}
        {activeTab === 'conflicts' && renderConflictChecksTab()}
        {activeTab === 'agreements' && renderFeeAgreementsTab()}
      </div>
    </div>
  );
};
