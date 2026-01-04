/**
 * LegalHoldsEnhanced.tsx
 * Enhanced Legal Hold Management with Notification Tracking
 * Tracks custodian acknowledgments and escalations
 */

import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/ui/atoms/Badge';
import { Button } from '@/components/ui/atoms/Button';
import { Modal } from '@/components/ui/molecules/Modal';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useModalState } from '@/hooks/core';
import { useNotify } from '@/hooks/useNotify';
import type { CaseId, UserId } from '@/types';
import type { LegalHoldEnhanced } from '@/types/discovery-enhanced';
import { cn } from '@/utils/cn';
import { AlertTriangle, BarChart, CheckCircle, Clock, Eye, Mail, Plus, Send } from 'lucide-react';
import React, { useState } from 'react';

export const LegalHoldsEnhanced: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const detailsModal = useModalState();

  const [selectedHold, setSelectedHold] = useState<LegalHoldEnhanced | null>(null);

  // Mock data with notification tracking
  const [holds] = useState<LegalHoldEnhanced[]>([
    {
      id: 'LH-001',
      caseId: 'C-2024-001' as CaseId,
      holdName: 'Executive Communications Hold',
      matter: 'Smith v. Acme Corp',
      description: 'Preserve all communications related to Q3 2023 financial reporting',
      scope: 'Email, documents, and instant messages from 2023-06-01 to 2023-12-31',
      issuedDate: '2024-01-10',
      status: 'active',
      custodianCount: 15,
      acknowledgedCount: 12,
      dataSources: ['Exchange Server', 'SharePoint', 'Slack'],
      createdBy: 'Legal Team' as UserId,
      escalationLevel: 'warning',
      notifications: [
        {
          id: 'NOTIF-001',
          legalHoldId: 'LH-001',
          custodianId: 'CUST-001',
          custodianName: 'John Doe',
          custodianEmail: 'john.doe@company.com',
          sentAt: '2024-01-10T09:00:00Z',
          acknowledgedAt: '2024-01-10T14:30:00Z',
          acknowledgmentMethod: 'email',
          remindersSent: 0,
          status: 'acknowledged',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-10'
        },
        {
          id: 'NOTIF-002',
          legalHoldId: 'LH-001',
          custodianId: 'CUST-002',
          custodianName: 'Jane Smith',
          custodianEmail: 'jane.smith@company.com',
          sentAt: '2024-01-10T09:00:00Z',
          remindersSent: 2,
          lastReminderAt: '2024-01-18T09:00:00Z',
          status: 'overdue',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-18'
        }
      ],
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20'
    },
    {
      id: 'LH-002',
      caseId: 'C-2024-001' as CaseId,
      holdName: 'Product Development Hold',
      matter: 'Patent Litigation Case',
      description: 'Preserve all product development records',
      scope: 'Engineering documents, source code, design specifications',
      issuedDate: '2024-01-15',
      status: 'active',
      custodianCount: 8,
      acknowledgedCount: 8,
      dataSources: ['GitHub', 'Jira', 'Confluence'],
      createdBy: 'IP Team' as UserId,
      escalationLevel: 'none',
      notifications: [],
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    }
  ]);

  const getStatusBadge = (status: LegalHoldEnhanced['status']) => {
    switch (status) {
      case 'active': return <Badge variant="success">Active</Badge>;
      case 'released': return <Badge variant="neutral">Released</Badge>;
      case 'draft': return <Badge variant="warning">Draft</Badge>;
    }
  };

  const getEscalationBadge = (level?: LegalHoldEnhanced['escalationLevel']) => {
    switch (level) {
      case 'critical': return <Badge variant="danger" size="sm">Critical</Badge>;
      case 'warning': return <Badge variant="warning" size="sm">Warning</Badge>;
      default: return null;
    }
  };

  const handleViewDetails = (hold: LegalHoldEnhanced) => {
    setSelectedHold(hold);
    detailsModal.open();
  };

  const handleSendReminder = (_holdId: string) => {
    notify.success('Reminder sent to pending custodians');
  };

  const stats = {
    total: holds.length,
    active: holds.filter(h => h.status === 'active').length,
    totalCustodians: holds.reduce((acc, h) => acc + h.custodianCount, 0),
    pendingAck: holds.reduce((acc, h) => acc + (h.custodianCount - h.acknowledgedCount), 0),
    escalated: holds.filter(h => h.escalationLevel !== 'none').length
  };

  const acknowledgmentRate = stats.totalCustodians > 0
    ? Math.round(((stats.totalCustodians - stats.pendingAck) / stats.totalCustodians) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Active Holds</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.active}</p>
            </div>
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Custodians</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.totalCustodians}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Pending Ack</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.pendingAck}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Ack Rate</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{acknowledgmentRate}%</p>
            </div>
            <BarChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className={cn("p-4 rounded-lg border", theme.surface.default, theme.border.default)}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn("text-xs uppercase font-bold", theme.text.secondary)}>Escalated</p>
              <p className={cn("text-2xl font-bold mt-1", theme.text.primary)}>{stats.escalated}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* FRCP Warning */}
      <div className={cn("border p-4 rounded-lg flex gap-3", theme.status.warning.bg, theme.status.warning.border)}>
        <AlertTriangle className={cn("h-6 w-6 shrink-0", theme.status.warning.text)} />
        <div>
          <h4 className={cn("font-bold text-sm", theme.status.warning.text)}>FRCP 37(e) Spoliation Warning</h4>
          <p className={cn("text-xs mt-1", theme.status.warning.text)}>
            Ensure all custodians acknowledge legal holds. Failure to preserve evidence may result in adverse inference sanctions.
          </p>
        </div>
      </div>

      {/* Legal Holds Table */}
      <div className={cn("rounded-lg border", theme.surface.default, theme.border.default)}>
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h3 className={cn("font-bold text-lg", theme.text.primary)}>Legal Holds</h3>
            <p className={cn("text-sm", theme.text.secondary)}>Track preservation obligations and custodian acknowledgments</p>
          </div>
          <Button variant="primary" icon={Plus}>
            Issue New Hold
          </Button>
        </div>

        <TableContainer>
          <TableHeader>
            <TableHead>Hold Name</TableHead>
            <TableHead>Matter</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Issued Date</TableHead>
            <TableHead>Custodians</TableHead>
            <TableHead>Acknowledgment</TableHead>
            <TableHead>Actions</TableHead>
          </TableHeader>
          <TableBody>
            {holds.map((hold) => {
              const ackPercentage = Math.round((hold.acknowledgedCount / hold.custodianCount) * 100);
              return (
                <TableRow key={hold.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className={cn("font-medium", theme.text.primary)}>{hold.holdName}</div>
                        <div className={cn("text-xs", theme.text.tertiary)}>{hold.id}</div>
                      </div>
                      {getEscalationBadge(hold.escalationLevel)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{hold.matter}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(hold.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">{hold.issuedDate}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">{hold.custodianCount} custodians</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={theme.text.secondary}>
                          {hold.acknowledgedCount} / {hold.custodianCount}
                        </span>
                        <span className={cn("font-bold", ackPercentage === 100 ? 'text-green-600' : 'text-yellow-600')}>
                          {ackPercentage}%
                        </span>
                      </div>
                      <div className={cn("w-32 h-1.5 rounded-full", theme.surface.highlight)}>
                        <div
                          className={cn("h-1.5 rounded-full", ackPercentage === 100 ? 'bg-green-600' : 'bg-yellow-600')}
                          style={{ width: `${ackPercentage}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" icon={Eye} onClick={() => handleViewDetails(hold)}>
                        Details
                      </Button>
                      {hold.acknowledgedCount < hold.custodianCount && (
                        <Button size="sm" variant="ghost" icon={Send} onClick={() => handleSendReminder(hold.id)}>
                          Remind
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableContainer>
      </div>

      {/* Hold Details Modal */}
      <Modal isOpen={detailsModal.isOpen} onClose={detailsModal.close} title="Legal Hold Details">
        {selectedHold && (
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Hold Name</div>
                <div className={cn("font-medium", theme.text.primary)}>{selectedHold.holdName}</div>
              </div>
              <div>
                <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Matter</div>
                <div className={cn("text-sm", theme.text.primary)}>{selectedHold.matter}</div>
              </div>
              <div>
                <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Scope</div>
                <div className={cn("text-sm", theme.text.primary)}>{selectedHold.scope}</div>
              </div>
              <div>
                <div className={cn("text-xs uppercase font-bold mb-1", theme.text.secondary)}>Data Sources</div>
                <div className="flex gap-2">
                  {selectedHold.dataSources.map((source, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">{source}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className={cn("border-t pt-4", theme.border.default)}>
              <h4 className={cn("font-bold mb-3", theme.text.primary)}>Custodian Notifications</h4>
              <div className="space-y-2">
                {selectedHold.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn("p-3 rounded border", theme.surface.highlight, theme.border.default)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={cn("font-medium text-sm", theme.text.primary)}>
                        {notification.custodianName}
                      </div>
                      <Badge
                        variant={notification.status === 'acknowledged' ? 'success' : notification.status === 'overdue' ? 'danger' : 'warning'}
                        size="sm"
                      >
                        {notification.status}
                      </Badge>
                    </div>
                    <div className={cn("text-xs space-y-1", theme.text.secondary)}>
                      <div>Email: {notification.custodianEmail}</div>
                      <div>Sent: {new Date(notification.sentAt).toLocaleDateString()}</div>
                      {notification.acknowledgedAt && (
                        <div className="text-green-600">
                          Acknowledged: {new Date(notification.acknowledgedAt).toLocaleDateString()}
                        </div>
                      )}
                      {notification.remindersSent > 0 && (
                        <div className="text-yellow-600">
                          Reminders sent: {notification.remindersSent}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalHoldsEnhanced;
