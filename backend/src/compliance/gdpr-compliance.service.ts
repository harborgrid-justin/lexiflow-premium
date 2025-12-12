import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export enum GDPRRequestType {
  ACCESS = 'ACCESS', // Right to access (Art. 15)
  RECTIFICATION = 'RECTIFICATION', // Right to rectification (Art. 16)
  ERASURE = 'ERASURE', // Right to erasure / "Right to be forgotten" (Art. 17)
  RESTRICTION = 'RESTRICTION', // Right to restriction of processing (Art. 18)
  PORTABILITY = 'PORTABILITY', // Right to data portability (Art. 20)
  OBJECTION = 'OBJECTION', // Right to object (Art. 21)
  AUTOMATED_DECISION = 'AUTOMATED_DECISION', // Rights related to automated decision making (Art. 22)
}

export enum GDPRRequestStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  IDENTITY_VERIFICATION = 'IDENTITY_VERIFICATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum ProcessingBasis {
  CONSENT = 'CONSENT',
  CONTRACT = 'CONTRACT',
  LEGAL_OBLIGATION = 'LEGAL_OBLIGATION',
  VITAL_INTERESTS = 'VITAL_INTERESTS',
  PUBLIC_INTEREST = 'PUBLIC_INTEREST',
  LEGITIMATE_INTERESTS = 'LEGITIMATE_INTERESTS',
}

export interface GDPRDataSubjectRequest {
  id: string;
  requestType: GDPRRequestType;
  status: GDPRRequestStatus;
  dataSubjectId: string;
  dataSubjectEmail: string;
  dataSubjectName: string;
  submittedAt: Date;
  identityVerifiedAt?: Date;
  verificationMethod?: string;
  processingStartedAt?: Date;
  completedAt?: Date;
  dueDate: Date; // Must respond within 30 days (Art. 12.3)
  assignedTo?: string;
  description: string;
  affectedSystems: string[];
  dataExported?: DataExportPackage;
  notes: RequestNote[];
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataExportPackage {
  packageId: string;
  generatedAt: Date;
  expiresAt: Date;
  downloadUrl: string;
  fileSize: number;
  format: 'JSON' | 'CSV' | 'PDF';
  categories: string[];
  recordCount: number;
}

export interface RequestNote {
  id: string;
  author: string;
  timestamp: Date;
  content: string;
  isInternal: boolean;
}

export interface ProcessingActivity {
  id: string;
  name: string;
  description: string;
  processingBasis: ProcessingBasis;
  dataCategories: string[];
  dataSubjectCategories: string[];
  recipients: string[];
  retentionPeriod: string;
  securityMeasures: string[];
  thirdCountryTransfers: boolean;
  transferSafeguards?: string;
  dpia: boolean; // Data Protection Impact Assessment
  dpiaDate?: Date;
  lastReviewed: Date;
  controller: string;
  processor?: string;
}

export interface ConsentRecord {
  id: string;
  dataSubjectId: string;
  purpose: string;
  processingActivity: string;
  consentGivenAt: Date;
  consentMethod: string;
  consentText: string;
  withdrawnAt?: Date;
  version: string;
  ipAddress: string;
  userAgent: string;
}

export interface DataBreachIncident {
  id: string;
  discoveredAt: Date;
  reportedAt?: Date;
  reportedToAuthority: boolean;
  authorityNotificationDate?: Date;
  dataSubjectsNotified: boolean;
  subjectNotificationDate?: Date;
  description: string;
  affectedDataCategories: string[];
  numberOfAffectedSubjects: number;
  consequences: string;
  mitigationMeasures: string[];
  responsibleParty: string;
  status: 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
}

@Injectable()
export class GdprComplianceService {
  private readonly logger = new Logger(GdprComplianceService.name);
  private dataSubjectRequests: Map<string, GDPRDataSubjectRequest> = new Map();
  private processingActivities: Map<string, ProcessingActivity> = new Map();
  private consentRecords: Map<string, ConsentRecord[]> = new Map();
  private breachIncidents: Map<string, DataBreachIncident> = new Map();

  // GDPR compliance deadline: 30 days
  private readonly RESPONSE_DEADLINE_DAYS = 30;

  constructor(
    // @InjectRepository would be used for actual database entities
  ) {
    this.initializeDefaultProcessingActivities();
  }

  /**
   * Initialize default processing activities
   */
  private initializeDefaultProcessingActivities(): void {
    const activities: ProcessingActivity[] = [
      {
        id: 'activity-client-management',
        name: 'Client Management',
        description: 'Processing client data for legal service delivery',
        processingBasis: ProcessingBasis.CONTRACT,
        dataCategories: ['Personal identifiers', 'Contact details', 'Financial data'],
        dataSubjectCategories: ['Clients', 'Prospects'],
        recipients: ['Legal team', 'Billing department'],
        retentionPeriod: '7 years after case closure',
        securityMeasures: ['Encryption at rest', 'Access controls', 'Audit logging'],
        thirdCountryTransfers: false,
        dpia: true,
        dpiaDate: new Date(),
        lastReviewed: new Date(),
        controller: 'LexiFlow Legal Suite',
      },
      {
        id: 'activity-document-processing',
        name: 'Document Processing',
        description: 'AI-powered document analysis and management',
        processingBasis: ProcessingBasis.CONTRACT,
        dataCategories: ['Document content', 'Metadata', 'Timestamps'],
        dataSubjectCategories: ['Clients', 'Opposing parties', 'Witnesses'],
        recipients: ['Legal team', 'AI processing service'],
        retentionPeriod: '7 years after case closure',
        securityMeasures: [
          'End-to-end encryption',
          'Pseudonymization',
          'Regular security audits',
        ],
        thirdCountryTransfers: false,
        dpia: true,
        dpiaDate: new Date(),
        lastReviewed: new Date(),
        controller: 'LexiFlow Legal Suite',
      },
    ];

    activities.forEach(activity => {
      this.processingActivities.set(activity.id, activity);
    });

    this.logger.log(`Initialized ${activities.length} processing activities`);
  }

  /**
   * Submit GDPR data subject request
   */
  async submitDataSubjectRequest(
    requestData: Partial<GDPRDataSubjectRequest>,
  ): Promise<GDPRDataSubjectRequest> {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + this.RESPONSE_DEADLINE_DAYS);

    const request: GDPRDataSubjectRequest = {
      id: requestData.id || `dsr-${Date.now()}`,
      requestType: requestData.requestType!,
      status: GDPRRequestStatus.SUBMITTED,
      dataSubjectId: requestData.dataSubjectId!,
      dataSubjectEmail: requestData.dataSubjectEmail!,
      dataSubjectName: requestData.dataSubjectName!,
      submittedAt: now,
      dueDate,
      description: requestData.description || '',
      affectedSystems: requestData.affectedSystems || [],
      notes: [],
      createdAt: now,
      updatedAt: now,
    };

    this.dataSubjectRequests.set(request.id, request);

    this.logger.log(
      `Submitted GDPR ${request.requestType} request: ${request.id} for ${request.dataSubjectEmail}`,
    );

    // Auto-send acknowledgment to data subject
    await this.sendRequestAcknowledgment(request);

    return request;
  }

  /**
   * Send acknowledgment to data subject
   */
  private async sendRequestAcknowledgment(
    request: GDPRDataSubjectRequest,
  ): Promise<void> {
    // In production, send actual email
    this.logger.log(
      `Sent acknowledgment for request ${request.id} to ${request.dataSubjectEmail}`,
    );
  }

  /**
   * Verify identity of data subject
   */
  async verifyIdentity(
    requestId: string,
    verificationMethod: string,
    verifiedBy: string,
  ): Promise<void> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    request.status = GDPRRequestStatus.IN_PROGRESS;
    request.identityVerifiedAt = new Date();
    request.verificationMethod = verificationMethod;
    request.updatedAt = new Date();

    this.addRequestNote(
      requestId,
      verifiedBy,
      `Identity verified using: ${verificationMethod}`,
      true,
    );

    this.dataSubjectRequests.set(requestId, request);

    this.logger.log(`Identity verified for request ${requestId} by ${verifiedBy}`);
  }

  /**
   * Process right to access request (Art. 15)
   */
  async processAccessRequest(requestId: string): Promise<DataExportPackage> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    if (request.requestType !== GDPRRequestType.ACCESS) {
      throw new Error(`Invalid request type for access request: ${request.requestType}`);
    }

    // Collect all personal data
    const personalData = await this.collectPersonalData(request.dataSubjectId);

    // Generate export package
    const exportPackage: DataExportPackage = {
      packageId: `export-${Date.now()}`,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      downloadUrl: `/api/gdpr/export/${request.id}`,
      fileSize: JSON.stringify(personalData).length,
      format: 'JSON',
      categories: Object.keys(personalData),
      recordCount: Object.keys(personalData).length,
    };

    request.dataExported = exportPackage;
    request.status = GDPRRequestStatus.COMPLETED;
    request.completedAt = new Date();
    request.updatedAt = new Date();

    this.dataSubjectRequests.set(requestId, request);

    this.logger.log(`Completed access request ${requestId}, generated package ${exportPackage.packageId}`);

    return exportPackage;
  }

  /**
   * Collect all personal data for a data subject
   */
  private async collectPersonalData(dataSubjectId: string): Promise<Record<string, any>> {
    // In production, query all systems and databases
    return {
      profile: {
        userId: dataSubjectId,
        email: 'user@example.com',
        name: 'Data Subject',
        createdAt: new Date(),
      },
      cases: [],
      documents: [],
      communications: [],
      billingRecords: [],
      auditLogs: [],
      consents: this.consentRecords.get(dataSubjectId) || [],
    };
  }

  /**
   * Process right to erasure request (Art. 17)
   */
  async processErasureRequest(requestId: string, performedBy: string): Promise<void> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    if (request.requestType !== GDPRRequestType.ERASURE) {
      throw new Error(`Invalid request type for erasure request: ${request.requestType}`);
    }

    // Check if erasure is legally permissible
    const canErase = await this.validateErasureRequest(request.dataSubjectId);

    if (!canErase.allowed) {
      request.status = GDPRRequestStatus.REJECTED;
      request.rejectionReason = canErase.reason;
      request.completedAt = new Date();
      request.updatedAt = new Date();

      this.dataSubjectRequests.set(requestId, request);
      this.logger.warn(`Erasure request ${requestId} rejected: ${canErase.reason}`);
      return;
    }

    // Perform erasure
    await this.erasePersonalData(request.dataSubjectId);

    request.status = GDPRRequestStatus.COMPLETED;
    request.completedAt = new Date();
    request.updatedAt = new Date();

    this.addRequestNote(
      requestId,
      performedBy,
      'Personal data erased from all systems',
      true,
    );

    this.dataSubjectRequests.set(requestId, request);

    this.logger.log(`Completed erasure request ${requestId} for subject ${request.dataSubjectId}`);
  }

  /**
   * Validate if erasure is legally permissible
   */
  private async validateErasureRequest(
    dataSubjectId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check for legal obligations to retain data
    // Art. 17(3): Exceptions to right to erasure

    // Example: Legal profession requires retention of client files
    const hasActiveCase = false; // Would check actual case status
    if (hasActiveCase) {
      return {
        allowed: false,
        reason: 'Data must be retained for ongoing legal matter (Art. 17(3)(b) - Legal obligation)',
      };
    }

    const withinStatuteOfLimitations = false; // Would check actual dates
    if (withinStatuteOfLimitations) {
      return {
        allowed: false,
        reason: 'Data must be retained for establishment, exercise or defense of legal claims (Art. 17(3)(e))',
      };
    }

    return { allowed: true };
  }

  /**
   * Erase personal data across all systems
   */
  private async erasePersonalData(dataSubjectId: string): Promise<void> {
    // In production, systematically delete from all databases
    this.logger.log(`Erasing personal data for subject ${dataSubjectId}`);

    // Delete consent records
    this.consentRecords.delete(dataSubjectId);

    // Anonymize audit logs (retain for security but remove personal identifiers)
    // Delete user profile
    // Delete communications
    // etc.
  }

  /**
   * Process data portability request (Art. 20)
   */
  async processPortabilityRequest(requestId: string): Promise<DataExportPackage> {
    const request = this.dataSubjectRequests.get(requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }

    // Similar to access request but only machine-readable structured data
    const structuredData = await this.collectStructuredData(request.dataSubjectId);

    const exportPackage: DataExportPackage = {
      packageId: `portability-${Date.now()}`,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      downloadUrl: `/api/gdpr/portability/${request.id}`,
      fileSize: JSON.stringify(structuredData).length,
      format: 'JSON',
      categories: Object.keys(structuredData),
      recordCount: Object.keys(structuredData).length,
    };

    request.dataExported = exportPackage;
    request.status = GDPRRequestStatus.COMPLETED;
    request.completedAt = new Date();
    request.updatedAt = new Date();

    this.dataSubjectRequests.set(requestId, request);

    return exportPackage;
  }

  /**
   * Collect structured data for portability
   */
  private async collectStructuredData(dataSubjectId: string): Promise<Record<string, any>> {
    // Only data provided by the data subject and processed by automated means
    return {
      profile: {},
      documents: [],
      communications: [],
    };
  }

  /**
   * Record consent
   */
  async recordConsent(
    dataSubjectId: string,
    purpose: string,
    processingActivity: string,
    consentText: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<ConsentRecord> {
    const consent: ConsentRecord = {
      id: `consent-${Date.now()}`,
      dataSubjectId,
      purpose,
      processingActivity,
      consentGivenAt: new Date(),
      consentMethod: 'WEB_FORM',
      consentText,
      version: '1.0',
      ipAddress,
      userAgent,
    };

    const userConsents = this.consentRecords.get(dataSubjectId) || [];
    userConsents.push(consent);
    this.consentRecords.set(dataSubjectId, userConsents);

    this.logger.log(`Recorded consent ${consent.id} for subject ${dataSubjectId}`);

    return consent;
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(consentId: string, dataSubjectId: string): Promise<void> {
    const userConsents = this.consentRecords.get(dataSubjectId) || [];
    const consent = userConsents.find(c => c.id === consentId);

    if (consent) {
      consent.withdrawnAt = new Date();
      this.consentRecords.set(dataSubjectId, userConsents);

      this.logger.log(`Consent ${consentId} withdrawn by subject ${dataSubjectId}`);
    }
  }

  /**
   * Get active consents for data subject
   */
  async getActiveConsents(dataSubjectId: string): Promise<ConsentRecord[]> {
    const consents = this.consentRecords.get(dataSubjectId) || [];
    return consents.filter(c => !c.withdrawnAt);
  }

  /**
   * Register data breach
   */
  async registerDataBreach(
    breachData: Partial<DataBreachIncident>,
  ): Promise<DataBreachIncident> {
    const breach: DataBreachIncident = {
      id: breachData.id || `breach-${Date.now()}`,
      discoveredAt: breachData.discoveredAt || new Date(),
      reportedAt: breachData.reportedAt,
      reportedToAuthority: breachData.reportedToAuthority || false,
      dataSubjectsNotified: breachData.dataSubjectsNotified || false,
      description: breachData.description || '',
      affectedDataCategories: breachData.affectedDataCategories || [],
      numberOfAffectedSubjects: breachData.numberOfAffectedSubjects || 0,
      consequences: breachData.consequences || '',
      mitigationMeasures: breachData.mitigationMeasures || [],
      responsibleParty: breachData.responsibleParty || '',
      status: 'INVESTIGATING',
    };

    this.breachIncidents.set(breach.id, breach);

    this.logger.error(`Registered data breach: ${breach.id}`);

    // Check if supervisory authority must be notified (Art. 33 - within 72 hours)
    if (breach.numberOfAffectedSubjects > 0) {
      this.logger.warn(
        `Data breach affects ${breach.numberOfAffectedSubjects} subjects - authority notification may be required`,
      );
    }

    return breach;
  }

  /**
   * Add note to request
   */
  private addRequestNote(
    requestId: string,
    author: string,
    content: string,
    isInternal: boolean,
  ): void {
    const request = this.dataSubjectRequests.get(requestId);
    if (request) {
      request.notes.push({
        id: `note-${Date.now()}`,
        author,
        timestamp: new Date(),
        content,
        isInternal,
      });
      this.dataSubjectRequests.set(requestId, request);
    }
  }

  /**
   * Get overdue requests
   */
  async getOverdueRequests(): Promise<GDPRDataSubjectRequest[]> {
    const now = new Date();
    const requests = Array.from(this.dataSubjectRequests.values());

    return requests.filter(
      r => r.status !== GDPRRequestStatus.COMPLETED && r.dueDate < now,
    );
  }

  /**
   * Get all requests
   */
  async getAllRequests(): Promise<GDPRDataSubjectRequest[]> {
    return Array.from(this.dataSubjectRequests.values());
  }

  /**
   * Get processing activities
   */
  async getProcessingActivities(): Promise<ProcessingActivity[]> {
    return Array.from(this.processingActivities.values());
  }
}
