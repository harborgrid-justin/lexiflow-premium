/**
 * integrationOrchestrator.test.ts
 * Tests for the IntegrationOrchestrator event-driven integration bus
 */

import { IntegrationOrchestrator } from '@services/integrationOrchestrator';
import { SystemEventType } from '@/types/integration-types';
import { db } from '@services/db';

// Mock dependencies
jest.mock('@/services/db', () => ({
  STORES: {
    CASES: 'cases',
    BILLING: 'billing',
    EVIDENCE: 'evidence',
  },
  db: {
    put: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(undefined),
    getAll: jest.fn().mockResolvedValue([]),
    getByIndex: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('@/services/chainService', () => ({
  ChainService: {
    createEntry: jest.fn().mockResolvedValue({ hash: 'test-hash' }),
  },
}));

// Mock DataService with dynamic import
jest.mock('@/services/dataService', () => ({
  DataService: {
    compliance: {
      runConflictCheck: jest.fn().mockResolvedValue({ conflicts: [] }),
    },
    billing: {
      addTimeEntry: jest.fn().mockResolvedValue({ id: 'time-1' }),
    },
    evidence: {
      add: jest.fn().mockResolvedValue({ id: 'ev-1' }),
    },
    workflow: {
      deploy: jest.fn().mockResolvedValue({ success: true }),
    },
    admin: {
      saveRLSPolicy: jest.fn().mockResolvedValue({ success: true }),
      logAudit: jest.fn().mockResolvedValue({ success: true }),
    },
    users: {
      add: jest.fn().mockResolvedValue({ id: 'user-1' }),
    },
    docket: {
      add: jest.fn().mockResolvedValue({ id: 'dk-1' }),
    },
  },
}));

describe('IntegrationOrchestrator', () => {
  const mockDb = db as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publish', () => {
    it('should return success result with triggered actions', async () => {
      const result = await IntegrationOrchestrator.publish(
        SystemEventType.CASE_CREATED,
        { caseData: { id: 'case-1', title: 'Test Case' } as any }
      );

      expect(result.success).toBe(true);
      expect(result.triggeredActions).toBeDefined();
      expect(Array.isArray(result.triggeredActions)).toBe(true);
    });

    describe('LEAD_STAGE_CHANGED event', () => {
      it('should trigger conflict check on Engagement stage', async () => {
        const { DataService } = await import('@/services/data/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.LEAD_STAGE_CHANGED,
          {
            leadId: 'lead-1',
            stage: 'Engagement',
            clientName: 'Test Client',
            value: '10000',
          }
        );

        expect(DataService.compliance.runConflictCheck).toHaveBeenCalledWith('Test Client');
        expect(result.triggeredActions).toContain('Triggered Automated Conflict Check');
      });

      it('should trigger conflict check on Conflict Check stage', async () => {
        const { DataService } = await import('@/services/dataService');

        await IntegrationOrchestrator.publish(
          SystemEventType.LEAD_STAGE_CHANGED,
          {
            leadId: 'lead-1',
            stage: 'Conflict Check',
            clientName: 'Another Client',
            value: '5000',
          }
        );

        expect(DataService.compliance.runConflictCheck).toHaveBeenCalledWith('Another Client');
      });

      it('should not trigger conflict check on other stages', async () => {
        const { DataService } = await import('@/services/dataService');
        jest.clearAllMocks();

        await IntegrationOrchestrator.publish(
          SystemEventType.LEAD_STAGE_CHANGED,
          {
            leadId: 'lead-1',
            stage: 'Qualification',
            clientName: 'Test Client',
            value: '10000',
          }
        );

        expect(DataService.compliance.runConflictCheck).not.toHaveBeenCalled();
      });
    });

    describe('DOCKET_INGESTED event', () => {
      it('should calculate response deadline for motions', async () => {
        const result = await IntegrationOrchestrator.publish(
          SystemEventType.DOCKET_INGESTED,
          {
            entry: {
              id: 'dk-1',
              sequenceNumber: 1,
              caseId: 'case-1',
              title: 'Motion to Dismiss',
              date: '2024-01-15',
              type: 'Motion',
            } as any,
            caseId: 'case-1',
          }
        );

        expect(mockDb.put).toHaveBeenCalled();
        expect(result.triggeredActions).toContain('Calculated Response Deadline per Local Rules');
      });

      it('should sync hearings to calendar', async () => {
        const result = await IntegrationOrchestrator.publish(
          SystemEventType.DOCKET_INGESTED,
          {
            entry: {
              id: 'dk-2',
              sequenceNumber: 2,
              caseId: 'case-1',
              title: 'Status Hearing',
              date: '2024-02-01',
              type: 'Hearing',
            } as any,
            caseId: 'case-1',
          }
        );

        expect(result.triggeredActions).toContain('Synced Hearing to Master Calendar');
      });
    });

    describe('TASK_COMPLETED event', () => {
      it('should create draft billable entry for high priority tasks', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.TASK_COMPLETED,
          {
            task: {
              id: 'task-1',
              title: 'Review Documents',
              priority: 'High',
              caseId: 'case-1',
              assigneeId: 'user-1',
              status: 'Done',
            } as any,
          }
        );

        expect(DataService.billing.addTimeEntry).toHaveBeenCalled();
        expect(result.triggeredActions).toContain('Created Draft Billable Entry from Task');
      });

      it('should not create billable entry for low priority tasks', async () => {
        const { DataService } = await import('@/services/dataService');
        jest.clearAllMocks();

        await IntegrationOrchestrator.publish(
          SystemEventType.TASK_COMPLETED,
          {
            task: {
              id: 'task-2',
              title: 'Minor Task',
              priority: 'Low',
              caseId: 'case-1',
              status: 'Done',
            } as any,
          }
        );

        expect(DataService.billing.addTimeEntry).not.toHaveBeenCalled();
      });
    });

    describe('DOCUMENT_UPLOADED event', () => {
      it('should replicate production documents to evidence vault', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.DOCUMENT_UPLOADED,
          {
            document: {
              id: 'doc-1',
              title: 'Prod_001',
              caseId: 'case-1',
              tags: ['Production'],
              sourceModule: 'Documents',
              fileSize: 1024,
            } as any,
          }
        );

        expect(DataService.evidence.add).toHaveBeenCalled();
        expect(result.triggeredActions).toContain('Replicated Document to Evidence Vault');
      });

      it('should replicate evidence source documents', async () => {
        const { DataService } = await import('@/services/dataService');

        await IntegrationOrchestrator.publish(
          SystemEventType.DOCUMENT_UPLOADED,
          {
            document: {
              id: 'doc-2',
              title: 'Evidence Doc',
              caseId: 'case-1',
              tags: [],
              sourceModule: 'Evidence',
              fileSize: 2048,
            } as any,
          }
        );

        expect(DataService.evidence.add).toHaveBeenCalled();
      });
    });

    describe('INVOICE_STATUS_CHANGED event', () => {
      it('should deploy collections workflow for overdue invoices', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.INVOICE_STATUS_CHANGED,
          {
            invoice: {
              id: 'inv-1',
              caseId: 'case-1',
              status: 'Overdue',
              amount: 5000,
            } as any,
          }
        );

        expect(DataService.workflow.deploy).toHaveBeenCalledWith('tpl-7', { caseId: 'case-1' });
        expect(result.triggeredActions).toContain('Deployed Collections Workflow');
      });

      it('should log to immutable ledger when invoice is paid', async () => {
        const { ChainService } = await import('@/services/chainService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.INVOICE_STATUS_CHANGED,
          {
            invoice: {
              id: 'inv-2',
              caseId: 'case-1',
              status: 'Paid',
              amount: 3000,
            } as any,
          }
        );

        expect(ChainService.createEntry).toHaveBeenCalled();
        expect(result.triggeredActions).toContain('Logged INVOICE_PAID to immutable ledger');
      });
    });

    describe('WALL_ERECTED event', () => {
      it('should generate RLS policy for ethical wall', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.WALL_ERECTED,
          {
            wall: {
              id: 'wall-1',
              caseId: 'case-1',
              restrictedGroups: ['group-1', 'group-2'],
            } as any,
          }
        );

        expect(DataService.admin.saveRLSPolicy).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'wall_enforce_case-1',
            table: 'documents',
          })
        );
        expect(result.triggeredActions[0]).toContain('Generated RLS Policy');
      });
    });

    describe('STAFF_HIRED event', () => {
      it('should provision user account', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.STAFF_HIRED,
          {
            staff: {
              userId: 'user-new',
              name: 'John Doe',
              email: 'john@firm.com',
              role: 'Associate',
            } as any,
          }
        );

        expect(DataService.users.add).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'user-new',
            name: 'John Doe',
          })
        );
        expect(result.triggeredActions).toContain('Provisioned User Account for John Doe');
      });
    });

    describe('SERVICE_COMPLETED event', () => {
      it('should auto-file proof of service when served', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.SERVICE_COMPLETED,
          {
            job: {
              id: 'svc-1',
              caseId: 'case-1',
              status: 'Served',
              documentTitle: 'Summons',
              targetPerson: 'Jane Smith',
              targetAddress: '123 Main St',
              serverName: 'Process Server Inc',
            } as any,
          }
        );

        expect(DataService.docket.add).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Proof of Service: Summons',
            type: 'Filing',
          })
        );
        expect(result.triggeredActions).toContain('Auto-filed Proof of Service to Docket');
      });
    });

    describe('DATA_SOURCE_CONNECTED event', () => {
      it('should log audit event and queue sync job', async () => {
        const { DataService } = await import('@/services/dataService');

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.DATA_SOURCE_CONNECTED,
          {
            connectionId: 'conn-1',
            provider: 'Snowflake',
            name: 'Data Warehouse',
          }
        );

        expect(DataService.admin.logAudit).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'CONNECTION_ESTABLISHED',
          })
        );
        expect(result.triggeredActions).toContain('Logged connection audit event for Data Warehouse');
        expect(result.triggeredActions).toContain('Queued initial sync job for conn-1');
      });
    });

    describe('Error handling', () => {
      it('should catch and report errors without crashing', async () => {
        const { DataService } = await import('@/services/dataService');
        (DataService.compliance.runConflictCheck as jest.Mock).mockRejectedValueOnce(
          new Error('Compliance service unavailable')
        );

        const result = await IntegrationOrchestrator.publish(
          SystemEventType.LEAD_STAGE_CHANGED,
          {
            leadId: 'lead-1',
            stage: 'Engagement',
            clientName: 'Test',
            value: '1000',
          }
        );

        expect(result.errors).toBeDefined();
        expect(result.errors?.length).toBeGreaterThan(0);
      });
    });
  });
});
