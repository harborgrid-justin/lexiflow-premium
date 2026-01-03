/**
 * @module components/enterprise/CRM/ClientPortal
 * @category Enterprise CRM
 * @description Secure client portal with document sharing, case status updates,
 * invoice viewing/payment, secure messaging, and appointment scheduling.
 */

import React, { useState } from 'react';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/molecules/Card/Card';
import {
  FileText,
  Download,
  Upload,
  Lock,
  Shield,
  Calendar,
  MessageSquare,
  CreditCard,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Paperclip,
  Video,
  Phone,
  Mail,
  Briefcase
} from 'lucide-react';
import type { Client } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface PortalDocument {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Available' | 'Pending Review' | 'Restricted';
  category: 'Pleading' | 'Contract' | 'Discovery' | 'Invoice' | 'General';
  encrypted: boolean;
  requiresSignature?: boolean;
}

interface CaseUpdate {
  id: string;
  caseId: string;
  caseTitle: string;
  status: 'Active' | 'Pending' | 'Closed';
  lastUpdate: string;
  nextDeadline?: string;
  progress: number; // 0-100
  recentActivity: string;
  assignedAttorney: string;
}

interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  caseTitle: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  billingPeriod: string;
  downloadUrl?: string;
}

interface SecureMessage {
  id: string;
  from: string;
  fromRole: 'Client' | 'Attorney' | 'Staff';
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
  encrypted: boolean;
  attachments?: { name: string; size: string }[];
}

interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  duration: number; // minutes
  attorneyName: string;
  type: 'In-Person' | 'Video Call' | 'Phone Call';
  available: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ClientPortal: React.FC<{ client?: Client }> = ({ client }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'documents' | 'cases' | 'invoices' | 'messages' | 'appointments'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Mock data
  const documents: PortalDocument[] = [
    {
      id: '1',
      caseId: 'case-1',
      fileName: 'Engagement_Letter_2026.pdf',
      fileType: 'PDF',
      size: '245 KB',
      uploadedBy: 'John Smith',
      uploadedAt: '2026-01-02 10:30',
      status: 'Available',
      category: 'Contract',
      encrypted: true,
      requiresSignature: true
    },
    {
      id: '2',
      caseId: 'case-1',
      fileName: 'December_Invoice.pdf',
      fileType: 'PDF',
      size: '128 KB',
      uploadedBy: 'Billing Department',
      uploadedAt: '2026-01-01 14:00',
      status: 'Available',
      category: 'Invoice',
      encrypted: true
    },
    {
      id: '3',
      caseId: 'case-2',
      fileName: 'Discovery_Response_Draft.docx',
      fileType: 'DOCX',
      size: '512 KB',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2025-12-28 16:45',
      status: 'Pending Review',
      category: 'Discovery',
      encrypted: true
    }
  ];

  const caseUpdates: CaseUpdate[] = [
    {
      id: '1',
      caseId: 'case-1',
      caseTitle: 'Contract Dispute - Acme Corp',
      status: 'Active',
      lastUpdate: '2026-01-02',
      nextDeadline: '2026-01-15',
      progress: 65,
      recentActivity: 'Response to motion filed',
      assignedAttorney: 'John Smith'
    },
    {
      id: '2',
      caseId: 'case-2',
      caseTitle: 'IP Litigation Support',
      status: 'Active',
      lastUpdate: '2025-12-30',
      nextDeadline: '2026-02-01',
      progress: 40,
      recentActivity: 'Discovery responses reviewed',
      assignedAttorney: 'Sarah Johnson'
    }
  ];

  const invoices: PortalInvoice[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2026-001',
      caseTitle: 'Contract Dispute - Acme Corp',
      amount: 15000,
      amountPaid: 15000,
      dueDate: '2026-01-15',
      status: 'Paid',
      billingPeriod: 'December 2025'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2026-002',
      caseTitle: 'IP Litigation Support',
      amount: 8500,
      amountPaid: 0,
      dueDate: '2026-01-30',
      status: 'Pending',
      billingPeriod: 'December 2025'
    }
  ];

  const messages: SecureMessage[] = [
    {
      id: '1',
      from: 'John Smith',
      fromRole: 'Attorney',
      subject: 'Update on Motion Response',
      message: 'We have filed the response to the motion and expect a ruling within 30 days.',
      timestamp: '2026-01-02 15:30',
      read: false,
      encrypted: true
    },
    {
      id: '2',
      from: 'Billing Department',
      fromRole: 'Staff',
      subject: 'December Invoice Available',
      message: 'Your invoice for December is now available in the portal.',
      timestamp: '2026-01-01 09:00',
      read: true,
      encrypted: true
    }
  ];

  const appointmentSlots: AppointmentSlot[] = [
    {
      id: '1',
      date: '2026-01-10',
      time: '10:00 AM',
      duration: 60,
      attorneyName: 'John Smith',
      type: 'Video Call',
      available: true
    },
    {
      id: '2',
      date: '2026-01-12',
      time: '2:00 PM',
      duration: 30,
      attorneyName: 'Sarah Johnson',
      type: 'Phone Call',
      available: true
    },
    {
      id: '3',
      date: '2026-01-15',
      time: '11:00 AM',
      duration: 90,
      attorneyName: 'John Smith',
      type: 'In-Person',
      available: true
    }
  ];

  // ============================================================================
  // RENDER: DOCUMENTS TAB
  // ============================================================================

  const renderDocumentsTab = () => (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className={cn("p-6 rounded-lg border-2 border-dashed", theme.border.default, "text-center")}>
        <Upload className={cn("h-12 w-12 mx-auto mb-3", theme.text.tertiary)} />
        <h3 className={cn("font-medium mb-2", theme.text.primary)}>Upload Documents</h3>
        <p className={cn("text-sm mb-4", theme.text.secondary)}>
          Drag and drop files here or click to browse
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Select Files
        </button>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <h3 className={cn("font-medium", theme.text.primary)}>Shared Documents</h3>
        {documents.map(doc => (
          <div
            key={doc.id}
            className={cn(
              "p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer",
              theme.surface.default,
              theme.border.default
            )}
            onClick={() => setSelectedDocument(doc.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn("p-2 rounded", theme.surface.highlight)}>
                  <FileText className={cn("h-5 w-5", theme.text.secondary)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={cn("font-medium", theme.text.primary)}>{doc.fileName}</h4>
                    {doc.encrypted && <Lock className="h-4 w-4 text-green-600" aria-label="Encrypted" />}
                    {doc.requiresSignature && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded">
                        Signature Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={cn("text-xs", theme.text.secondary)}>{doc.category}</span>
                    <span className={cn("text-xs", theme.text.tertiary)}>{doc.size}</span>
                    <span className={cn("text-xs", theme.text.tertiary)}>
                      Uploaded {doc.uploadedAt} by {doc.uploadedBy}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded text-xs",
                  doc.status === 'Available' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                  doc.status === 'Pending Review' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {doc.status}
                </span>
                <button className={cn("p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800", theme.text.secondary)}>
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: CASES TAB
  // ============================================================================

  const renderCasesTab = () => (
    <div className="space-y-4">
      {caseUpdates.map(caseUpdate => (
        <div
          key={caseUpdate.id}
          className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={cn("font-bold text-lg", theme.text.primary)}>{caseUpdate.caseTitle}</h3>
              <p className={cn("text-sm", theme.text.secondary)}>
                Attorney: {caseUpdate.assignedAttorney}
              </p>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              caseUpdate.status === 'Active' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
              caseUpdate.status === 'Pending' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
              "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {caseUpdate.status}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className={cn("text-sm", theme.text.secondary)}>Case Progress</span>
              <span className={cn("text-sm font-medium", theme.text.primary)}>{caseUpdate.progress}%</span>
            </div>
            <div className={cn("w-full h-2 rounded-full", theme.surface.highlight)}>
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${caseUpdate.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Clock className={cn("h-4 w-4", theme.text.tertiary)} />
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Last Update</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{caseUpdate.lastUpdate}</p>
              </div>
            </div>
            {caseUpdate.nextDeadline && (
              <div className="flex items-center gap-2">
                <AlertCircle className={cn("h-4 w-4", theme.text.tertiary)} />
                <div>
                  <p className={cn("text-xs", theme.text.tertiary)}>Next Deadline</p>
                  <p className={cn("text-sm font-medium", theme.text.primary)}>{caseUpdate.nextDeadline}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle2 className={cn("h-4 w-4", theme.text.tertiary)} />
              <div>
                <p className={cn("text-xs", theme.text.tertiary)}>Recent Activity</p>
                <p className={cn("text-sm font-medium", theme.text.primary)}>{caseUpdate.recentActivity}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ============================================================================
  // RENDER: INVOICES TAB
  // ============================================================================

  const renderInvoicesTab = () => (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={cn("text-sm", theme.text.tertiary)}>Total Outstanding</p>
            <p className={cn("text-2xl font-bold", theme.text.primary)}>
              ${invoices.filter(inv => inv.status !== 'Paid').reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className={cn("text-sm", theme.text.tertiary)}>Total Paid (YTD)</p>
            <p className={cn("text-2xl font-bold text-green-600")}>
              ${invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.amountPaid, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className={cn("text-sm", theme.text.tertiary)}>Invoices</p>
            <p className={cn("text-2xl font-bold", theme.text.primary)}>{invoices.length}</p>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {invoices.map(invoice => (
          <div
            key={invoice.id}
            className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={cn("font-bold", theme.text.primary)}>{invoice.invoiceNumber}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    invoice.status === 'Paid' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                    invoice.status === 'Overdue' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                    invoice.status === 'Partial' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {invoice.status}
                  </span>
                </div>
                <p className={cn("text-sm mb-1", theme.text.secondary)}>{invoice.caseTitle}</p>
                <p className={cn("text-xs", theme.text.tertiary)}>
                  Billing Period: {invoice.billingPeriod} • Due: {invoice.dueDate}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("text-xl font-bold mb-2", theme.text.primary)}>
                  ${invoice.amount.toLocaleString()}
                </p>
                <div className="flex gap-2">
                  <button className={cn("px-3 py-1 rounded text-sm border", theme.border.default, "hover:shadow")}>
                    <Eye className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                  {invoice.status !== 'Paid' && (
                    <button className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700">
                      <CreditCard className="h-4 w-4 inline mr-1" />
                      Pay
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: MESSAGES TAB
  // ============================================================================

  const renderMessagesTab = () => (
    <div className="space-y-4">
      {/* Compose Message */}
      <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-green-600" />
          <h3 className={cn("font-medium", theme.text.primary)}>Secure Message</h3>
        </div>
        <input
          type="text"
          placeholder="Subject"
          className={cn("w-full px-3 py-2 rounded border mb-3", theme.surface.default, theme.border.default)}
        />
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your secure message..."
          className={cn("w-full px-3 py-2 rounded border mb-3 min-h-32", theme.surface.default, theme.border.default)}
        />
        <div className="flex justify-between items-center">
          <button className={cn("px-3 py-2 rounded border", theme.border.default, "hover:shadow")}>
            <Paperclip className="h-4 w-4 inline mr-1" />
            Attach File
          </button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            <Send className="h-4 w-4 inline mr-1" />
            Send Message
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        <h3 className={cn("font-medium", theme.text.primary)}>Recent Messages</h3>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={cn(
              "p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all",
              theme.surface.default,
              theme.border.default,
              !msg.read && "border-l-4 border-l-blue-600"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <h4 className={cn("font-medium", theme.text.primary)}>{msg.subject}</h4>
                {msg.encrypted && <Lock className="h-4 w-4 text-green-600" aria-label="Encrypted" />}
                {!msg.read && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded">
                    New
                  </span>
                )}
              </div>
              <span className={cn("text-xs", theme.text.tertiary)}>{msg.timestamp}</span>
            </div>
            <p className={cn("text-sm mb-2", theme.text.secondary)}>{msg.message}</p>
            <div className="flex items-center gap-4">
              <span className={cn("text-xs", theme.text.tertiary)}>
                From: {msg.from} ({msg.fromRole})
              </span>
              {msg.attachments && msg.attachments.length > 0 && (
                <span className={cn("text-xs", theme.text.tertiary)}>
                  <Paperclip className="h-3 w-3 inline" /> {msg.attachments.length} attachment(s)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================================
  // RENDER: APPOINTMENTS TAB
  // ============================================================================

  const renderAppointmentsTab = () => (
    <div className="space-y-4">
      {/* Available Slots */}
      <h3 className={cn("font-medium", theme.text.primary)}>Available Appointment Slots</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointmentSlots.map(slot => (
          <div
            key={slot.id}
            className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className={cn("font-bold", theme.text.primary)}>{slot.date} at {slot.time}</h4>
                <p className={cn("text-sm", theme.text.secondary)}>{slot.attorneyName}</p>
              </div>
              <div className={cn("p-2 rounded", theme.surface.highlight)}>
                {slot.type === 'Video Call' && <Video className={cn("h-5 w-5", theme.text.secondary)} />}
                {slot.type === 'Phone Call' && <Phone className={cn("h-5 w-5", theme.text.secondary)} />}
                {slot.type === 'In-Person' && <Calendar className={cn("h-5 w-5", theme.text.secondary)} />}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className={cn("text-xs px-2 py-1 rounded", theme.surface.highlight)}>
                  {slot.type}
                </span>
                <span className={cn("text-xs ml-2", theme.text.tertiary)}>
                  {slot.duration} minutes
                </span>
              </div>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
                Book Now
              </button>
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
      {/* Header */}
      <div className={cn("p-6 rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-full bg-green-100 dark:bg-green-900/30")}>
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className={cn("text-2xl font-bold", theme.text.primary)}>Secure Client Portal</h1>
              <p className={cn("text-sm", theme.text.secondary)}>
                All communications and documents are encrypted end-to-end
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-600" />
            <span className={cn("text-sm font-medium text-green-600")}>Secure Connection</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={cn("border-b", theme.border.default)}>
        <div className="flex gap-6">
          {[
            { id: 'documents' as const, label: 'Documents', icon: FileText },
            { id: 'cases' as const, label: 'Case Status', icon: Briefcase },
            { id: 'invoices' as const, label: 'Invoices', icon: CreditCard },
            { id: 'messages' as const, label: 'Messages', icon: MessageSquare },
            { id: 'appointments' as const, label: 'Appointments', icon: Calendar }
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
        {activeTab === 'documents' && renderDocumentsTab()}
        {activeTab === 'cases' && renderCasesTab()}
        {activeTab === 'invoices' && renderInvoicesTab()}
        {activeTab === 'messages' && renderMessagesTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
      </div>
    </div>
  );
};
