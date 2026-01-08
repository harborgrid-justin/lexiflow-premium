import { Injectable, Logger } from '@nestjs/common';
import { WorkflowDefinition, WorkflowBuilderService, StepDefinition } from './workflow-builder.service';
import { WorkflowTriggerType, StepType } from './entities';

/**
 * WorkflowTemplatesService
 * Provides pre-built workflow templates for common legal processes
 */
@Injectable()
export class WorkflowTemplatesService {
  private readonly logger = new Logger(WorkflowTemplatesService.name);

  constructor(private readonly builderService: WorkflowBuilderService) {}

  /**
   * Get all available workflow templates
   */
  getAvailableTemplates(): Array<{ id: string; name: string; description: string; category: string }> {
    return [
      {
        id: 'new-matter-intake',
        name: 'New Matter Intake',
        description: 'Complete intake process for new legal matters',
        category: 'Matter Management',
      },
      {
        id: 'document-approval',
        name: 'Document Approval',
        description: 'Multi-level document review and approval workflow',
        category: 'Document Management',
      },
      {
        id: 'invoice-approval',
        name: 'Invoice Approval',
        description: 'Automated invoice review and approval process',
        category: 'Billing',
      },
      {
        id: 'conflict-check',
        name: 'Conflict Check',
        description: 'Comprehensive conflict of interest verification',
        category: 'Compliance',
      },
      {
        id: 'contract-review',
        name: 'Contract Review',
        description: 'Structured contract review and negotiation workflow',
        category: 'Contract Management',
      },
      {
        id: 'client-onboarding',
        name: 'Client Onboarding',
        description: 'Complete client intake and onboarding process',
        category: 'Client Management',
      },
      {
        id: 'litigation-filing',
        name: 'Litigation Filing',
        description: 'Document preparation and court filing workflow',
        category: 'Litigation',
      },
      {
        id: 'discovery-response',
        name: 'Discovery Response',
        description: 'Systematic discovery request response process',
        category: 'Discovery',
      },
    ];
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(
    templateId: string,
    tenantId: string,
    customizations?: Partial<WorkflowDefinition>,
  ): Promise<any> {
    this.logger.log(`Creating workflow from template: ${templateId}`);

    let definition: WorkflowDefinition;

    switch (templateId) {
      case 'new-matter-intake':
        definition = this.getNewMatterIntakeTemplate(tenantId);
        break;
      case 'document-approval':
        definition = this.getDocumentApprovalTemplate(tenantId);
        break;
      case 'invoice-approval':
        definition = this.getInvoiceApprovalTemplate(tenantId);
        break;
      case 'conflict-check':
        definition = this.getConflictCheckTemplate(tenantId);
        break;
      case 'contract-review':
        definition = this.getContractReviewTemplate(tenantId);
        break;
      case 'client-onboarding':
        definition = this.getClientOnboardingTemplate(tenantId);
        break;
      case 'litigation-filing':
        definition = this.getLitigationFilingTemplate(tenantId);
        break;
      case 'discovery-response':
        definition = this.getDiscoveryResponseTemplate(tenantId);
        break;
      default:
        throw new Error(`Template ${templateId} not found`);
    }

    // Apply customizations
    if (customizations) {
      definition = { ...definition, ...customizations };
    }

    return this.builderService.createWorkflow(definition);
  }

  /**
   * New Matter Intake Template
   */
  private getNewMatterIntakeTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'New Matter Intake',
      description: 'Automated workflow for new matter intake and setup',
      tenantId,
      trigger: WorkflowTriggerType.MATTER_CREATED,
      category: 'Matter Management',
      tags: ['intake', 'matter', 'onboarding'],
      steps: [
        {
          name: 'Run Conflict Check',
          description: 'Perform automated conflict of interest check',
          type: StepType.CONFLICT_CHECK,
          order: 0,
          required: true,
          config: {
            checkType: 'comprehensive',
            includeProspective: true,
          },
        },
        {
          name: 'Assign Matter Manager',
          description: 'Assign responsible attorney to matter',
          type: StepType.ASSIGNMENT,
          order: 1,
          required: true,
          config: {
            assignmentType: 'attorney',
            notifyAssignee: true,
          },
        },
        {
          name: 'Create Matter Folder',
          description: 'Set up document management folder structure',
          type: StepType.TASK,
          order: 2,
          config: {
            taskType: 'create_folder',
            folderStructure: 'standard',
          },
        },
        {
          name: 'Generate Engagement Letter',
          description: 'Generate engagement letter from template',
          type: StepType.DOCUMENT_GENERATION,
          order: 3,
          config: {
            templateId: 'engagement-letter',
            requireReview: true,
          },
        },
        {
          name: 'Request Engagement Approval',
          description: 'Get partner approval for engagement',
          type: StepType.APPROVAL,
          order: 4,
          required: true,
          assignedRole: 'partner',
          config: {
            approvalType: 'sequential',
            requiredApprovers: 1,
          },
        },
        {
          name: 'Send Welcome Email',
          description: 'Send welcome email to client',
          type: StepType.EMAIL,
          order: 5,
          config: {
            templateId: 'client-welcome',
            attachEngagementLetter: true,
          },
        },
        {
          name: 'Create Initial Tasks',
          description: 'Generate initial matter tasks from template',
          type: StepType.TASK,
          order: 6,
          config: {
            taskTemplateId: 'matter-setup',
            assignToManager: true,
          },
        },
        {
          name: 'Notify Team',
          description: 'Notify team members of new matter',
          type: StepType.NOTIFICATION,
          order: 7,
          config: {
            notificationType: 'team',
            includeDetails: true,
          },
        },
      ],
    };
  }

  /**
   * Document Approval Template
   */
  private getDocumentApprovalTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Document Approval Workflow',
      description: 'Multi-level document review and approval process',
      tenantId,
      trigger: WorkflowTriggerType.DOCUMENT_UPLOAD,
      category: 'Document Management',
      tags: ['approval', 'document', 'review'],
      steps: [
        {
          name: 'Initial Review',
          description: 'First-level document review',
          type: StepType.APPROVAL,
          order: 0,
          required: true,
          assignedRole: 'associate',
          config: {
            approvalType: 'sequential',
            timeoutHours: 24,
          },
        },
        {
          name: 'Senior Review',
          description: 'Senior attorney review',
          type: StepType.APPROVAL,
          order: 1,
          required: true,
          assignedRole: 'senior_associate',
          config: {
            approvalType: 'sequential',
            timeoutHours: 48,
          },
          conditions: [
            {
              field: 'documentType',
              operator: 'in',
              value: ['contract', 'brief', 'motion'],
            },
          ],
        },
        {
          name: 'Partner Approval',
          description: 'Final partner approval',
          type: StepType.APPROVAL,
          order: 2,
          required: true,
          assignedRole: 'partner',
          config: {
            approvalType: 'sequential',
            timeoutHours: 72,
          },
        },
        {
          name: 'Update Document Status',
          description: 'Mark document as approved',
          type: StepType.TASK,
          order: 3,
          config: {
            action: 'update_status',
            status: 'approved',
          },
        },
        {
          name: 'Notify Requestor',
          description: 'Notify document owner of approval',
          type: StepType.NOTIFICATION,
          order: 4,
          config: {
            notificationType: 'approval_complete',
            includeComments: true,
          },
        },
      ],
    };
  }

  /**
   * Invoice Approval Template
   */
  private getInvoiceApprovalTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Invoice Approval Workflow',
      description: 'Automated invoice review and approval',
      tenantId,
      trigger: WorkflowTriggerType.INVOICE_GENERATED,
      category: 'Billing',
      tags: ['invoice', 'approval', 'billing'],
      steps: [
        {
          name: 'Validate Invoice Data',
          description: 'Automated invoice data validation',
          type: StepType.DATA_VALIDATION,
          order: 0,
          required: true,
          config: {
            validations: ['amount', 'client', 'matter', 'line_items'],
          },
        },
        {
          name: 'Matter Attorney Review',
          description: 'Review by matter attorney',
          type: StepType.APPROVAL,
          order: 1,
          required: true,
          config: {
            approvalType: 'sequential',
            autoApproveThreshold: 5000,
            timeoutHours: 48,
          },
        },
        {
          name: 'Partner Approval (High Value)',
          description: 'Partner approval for invoices over threshold',
          type: StepType.APPROVAL,
          order: 2,
          required: true,
          assignedRole: 'partner',
          config: {
            approvalType: 'sequential',
            timeoutHours: 72,
          },
          conditions: [
            {
              field: 'totalAmount',
              operator: 'greater_than',
              value: 25000,
            },
          ],
        },
        {
          name: 'Send to Client',
          description: 'Email invoice to client',
          type: StepType.EMAIL,
          order: 3,
          config: {
            templateId: 'invoice-email',
            attachInvoice: true,
            attachBackupDocs: true,
          },
        },
        {
          name: 'Update Accounting System',
          description: 'Sync with accounting system',
          type: StepType.WEBHOOK,
          order: 4,
          config: {
            webhookType: 'accounting_sync',
          },
        },
        {
          name: 'Create Payment Follow-up Task',
          description: 'Schedule payment follow-up',
          type: StepType.TASK,
          order: 5,
          config: {
            taskType: 'payment_follow_up',
            dueInDays: 30,
          },
        },
      ],
    };
  }

  /**
   * Conflict Check Template
   */
  private getConflictCheckTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Conflict Check Workflow',
      description: 'Comprehensive conflict of interest verification',
      tenantId,
      trigger: WorkflowTriggerType.CLIENT_INTAKE,
      category: 'Compliance',
      tags: ['conflict', 'compliance', 'ethics'],
      steps: [
        {
          name: 'Automated Conflict Search',
          description: 'Search existing clients and matters',
          type: StepType.CONFLICT_CHECK,
          order: 0,
          required: true,
          config: {
            searchType: 'comprehensive',
            includeFormerClients: true,
            searchParties: true,
          },
        },
        {
          name: 'Review Potential Conflicts',
          description: 'Manual review of flagged conflicts',
          type: StepType.APPROVAL,
          order: 1,
          required: true,
          assignedRole: 'conflicts_attorney',
          config: {
            approvalType: 'sequential',
            requireComments: true,
          },
          conditions: [
            {
              field: 'conflictsFound',
              operator: 'greater_than',
              value: 0,
            },
          ],
        },
        {
          name: 'Partner Conflict Waiver',
          description: 'Get partner approval for conflict waiver',
          type: StepType.APPROVAL,
          order: 2,
          required: true,
          assignedRole: 'partner',
          config: {
            approvalType: 'sequential',
            requireWaiverDocumentation: true,
          },
          conditions: [
            {
              field: 'requiresWaiver',
              operator: 'equals',
              value: true,
            },
          ],
        },
        {
          name: 'Document Conflict Check',
          description: 'Create conflict check memorandum',
          type: StepType.DOCUMENT_GENERATION,
          order: 3,
          config: {
            templateId: 'conflict-check-memo',
          },
        },
        {
          name: 'Update Conflicts Database',
          description: 'Record parties and relationships',
          type: StepType.TASK,
          order: 4,
          config: {
            action: 'update_conflicts_db',
          },
        },
        {
          name: 'Notify Intake Team',
          description: 'Send conflict check results',
          type: StepType.NOTIFICATION,
          order: 5,
          config: {
            notificationType: 'conflict_check_complete',
            includeResults: true,
          },
        },
      ],
    };
  }

  /**
   * Contract Review Template
   */
  private getContractReviewTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Contract Review Workflow',
      description: 'Structured contract review and negotiation',
      tenantId,
      trigger: WorkflowTriggerType.DOCUMENT_UPLOAD,
      category: 'Contract Management',
      tags: ['contract', 'review', 'negotiation'],
      steps: [
        {
          name: 'Initial Analysis',
          description: 'AI-powered contract analysis',
          type: StepType.TASK,
          order: 0,
          config: {
            taskType: 'ai_analysis',
            analysisType: 'contract',
          },
        },
        {
          name: 'Risk Assessment',
          description: 'Identify and flag risk areas',
          type: StepType.TASK,
          order: 1,
          config: {
            taskType: 'risk_assessment',
            generateReport: true,
          },
        },
        {
          name: 'Attorney Review',
          description: 'Detailed contract review',
          type: StepType.APPROVAL,
          order: 2,
          required: true,
          config: {
            approvalType: 'sequential',
            timeoutHours: 72,
          },
        },
        {
          name: 'Client Consultation',
          description: 'Schedule client review meeting',
          type: StepType.TASK,
          order: 3,
          config: {
            taskType: 'schedule_meeting',
            includeReviewNotes: true,
          },
        },
        {
          name: 'Generate Redlines',
          description: 'Create marked-up version',
          type: StepType.DOCUMENT_GENERATION,
          order: 4,
          config: {
            documentType: 'redline',
            includeComments: true,
          },
        },
        {
          name: 'Final Approval',
          description: 'Client approval of changes',
          type: StepType.APPROVAL,
          order: 5,
          required: true,
          config: {
            approvalType: 'client',
            allowComments: true,
          },
        },
      ],
    };
  }

  /**
   * Client Onboarding Template
   */
  private getClientOnboardingTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Client Onboarding Workflow',
      description: 'Complete client intake and setup',
      tenantId,
      trigger: WorkflowTriggerType.CLIENT_INTAKE,
      category: 'Client Management',
      tags: ['client', 'onboarding', 'intake'],
      steps: [
        {
          name: 'Collect Client Information',
          description: 'Gather required client data',
          type: StepType.TASK,
          order: 0,
          required: true,
          config: {
            formId: 'client-intake-form',
          },
        },
        {
          name: 'Run KYC Checks',
          description: 'Know Your Client verification',
          type: StepType.TASK,
          order: 1,
          required: true,
          config: {
            checkType: 'kyc',
            includeBackground: true,
          },
        },
        {
          name: 'Conflict Check',
          description: 'Verify no conflicts of interest',
          type: StepType.CONFLICT_CHECK,
          order: 2,
          required: true,
          config: {
            comprehensive: true,
          },
        },
        {
          name: 'Create Client Profile',
          description: 'Set up client in system',
          type: StepType.TASK,
          order: 3,
          config: {
            action: 'create_client_profile',
          },
        },
        {
          name: 'Generate Engagement Letter',
          description: 'Create engagement agreement',
          type: StepType.DOCUMENT_GENERATION,
          order: 4,
          config: {
            templateId: 'engagement-letter',
          },
        },
        {
          name: 'Setup Billing',
          description: 'Configure billing and rates',
          type: StepType.TASK,
          order: 5,
          config: {
            action: 'setup_billing',
          },
        },
        {
          name: 'Send Welcome Package',
          description: 'Email welcome materials',
          type: StepType.EMAIL,
          order: 6,
          config: {
            templateId: 'client-welcome-package',
            attachments: ['engagement-letter', 'billing-guide'],
          },
        },
      ],
    };
  }

  /**
   * Litigation Filing Template
   */
  private getLitigationFilingTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Litigation Filing Workflow',
      description: 'Document preparation and court filing',
      tenantId,
      trigger: WorkflowTriggerType.MANUAL,
      category: 'Litigation',
      tags: ['litigation', 'filing', 'court'],
      steps: [
        {
          name: 'Draft Filing Document',
          description: 'Prepare court filing',
          type: StepType.TASK,
          order: 0,
          required: true,
          config: {
            documentType: 'court_filing',
          },
        },
        {
          name: 'Citation Check',
          description: 'Verify legal citations',
          type: StepType.TASK,
          order: 1,
          config: {
            checkType: 'citations',
            validateBluebook: true,
          },
        },
        {
          name: 'Senior Attorney Review',
          description: 'Review by senior attorney',
          type: StepType.APPROVAL,
          order: 2,
          required: true,
          assignedRole: 'senior_associate',
          config: {
            approvalType: 'sequential',
          },
        },
        {
          name: 'Partner Sign-off',
          description: 'Final partner approval',
          type: StepType.APPROVAL,
          order: 3,
          required: true,
          assignedRole: 'partner',
          config: {
            approvalType: 'sequential',
          },
        },
        {
          name: 'File with Court',
          description: 'Submit filing to court',
          type: StepType.TASK,
          order: 4,
          required: true,
          config: {
            action: 'court_filing',
            method: 'electronic',
          },
        },
        {
          name: 'Update Docket',
          description: 'Record filing in case docket',
          type: StepType.TASK,
          order: 5,
          config: {
            action: 'update_docket',
          },
        },
        {
          name: 'Notify Opposing Counsel',
          description: 'Send courtesy notice',
          type: StepType.EMAIL,
          order: 6,
          config: {
            recipientType: 'opposing_counsel',
            attachFiling: true,
          },
        },
      ],
    };
  }

  /**
   * Discovery Response Template
   */
  private getDiscoveryResponseTemplate(tenantId: string): WorkflowDefinition {
    return {
      name: 'Discovery Response Workflow',
      description: 'Systematic discovery request response',
      tenantId,
      trigger: WorkflowTriggerType.MANUAL,
      category: 'Discovery',
      tags: ['discovery', 'response', 'litigation'],
      steps: [
        {
          name: 'Log Discovery Request',
          description: 'Record in discovery tracking',
          type: StepType.TASK,
          order: 0,
          required: true,
          config: {
            action: 'log_discovery',
            calculateDeadline: true,
          },
        },
        {
          name: 'Assign to Team',
          description: 'Assign responsible attorneys',
          type: StepType.ASSIGNMENT,
          order: 1,
          required: true,
          config: {
            assignmentType: 'discovery_team',
          },
        },
        {
          name: 'Document Collection',
          description: 'Gather responsive documents',
          type: StepType.TASK,
          order: 2,
          config: {
            taskType: 'document_collection',
            deadline: 'calculated',
          },
        },
        {
          name: 'Privilege Review',
          description: 'Review for privileged materials',
          type: StepType.TASK,
          order: 3,
          required: true,
          config: {
            reviewType: 'privilege',
            createPrivilegeLog: true,
          },
        },
        {
          name: 'Draft Response',
          description: 'Prepare discovery responses',
          type: StepType.TASK,
          order: 4,
          required: true,
          config: {
            documentType: 'discovery_response',
          },
        },
        {
          name: 'Attorney Review',
          description: 'Review responses',
          type: StepType.APPROVAL,
          order: 5,
          required: true,
          config: {
            approvalType: 'sequential',
          },
        },
        {
          name: 'Client Approval',
          description: 'Get client sign-off',
          type: StepType.APPROVAL,
          order: 6,
          required: true,
          config: {
            approvalType: 'client',
          },
        },
        {
          name: 'Produce Documents',
          description: 'Deliver discovery production',
          type: StepType.TASK,
          order: 7,
          required: true,
          config: {
            action: 'produce_documents',
            method: 'electronic',
          },
        },
      ],
    };
  }
}
