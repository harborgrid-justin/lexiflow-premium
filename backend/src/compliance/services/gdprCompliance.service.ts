import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Consent, ConsentStatus } from '@compliance/entities/consent.entity';
import { User } from '@users/entities/user.entity';
import { AuditLog } from '@compliance/entities/audit-log.entity';
import { DataExportRequestDto, DataDeletionRequestDto, ConsentDto, RevokeConsentDto } from '@compliance/dto/compliance.dto';

export interface DataExportResult {
  userId: string;
  exportDate: Date;
  format: string;
  data: {
    personalInfo: unknown;
    cases: unknown[];
    documents: unknown[];
    communications: unknown[];
    billing: unknown[];
    auditLogs: unknown[];
    consents: unknown[];
    [key: string]: unknown;
  };
  metadata: {
    totalRecords: number;
    dataCategories: string[];
    exportedBy: string;
  };
}

export interface DataDeletionResult {
  userId: string;
  deletionDate: Date;
  deletedCategories: string[];
  recordsDeleted: number;
  recordsAnonymized: number;
  status: 'completed' | 'partial' | 'failed';
  details: Record<string, unknown>;
}

export interface DataProcessingRecord {
  userId: string;
  processingActivities: Array<{
    activity: string;
    purpose: string;
    legalBasis: string;
    dataCategories: string[];
    recipients: string[];
    retentionPeriod: string;
    securityMeasures: string[];
  }>;
  generatedAt: Date;
}

/**
 * ╔=================================================================================================================╗
 * ║GDPRCOMPLIANCE                                                                                                   ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class GdprComplianceService {
  private readonly logger = new Logger(GdprComplianceService.name);

  constructor(
    @InjectRepository(Consent)
    private readonly consentRepository: Repository<Consent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async handleDataSubjectAccessRequest(request: DataExportRequestDto): Promise<DataExportResult> {
    this.logger.log(`Processing DSAR for user: ${request.userId}`);

    const user = await this.userRepository.findOne({ where: { id: request.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${request.userId} not found`);
    }

    const consents = await this.consentRepository.find({
      where: { userId: request.userId },
      order: { grantedAt: 'DESC' },
    });

    const auditLogs = await this.auditLogRepository.find({
      where: { userId: request.userId },
      order: { timestamp: 'DESC' },
      take: 1000,
    });

    const personalInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      phone: user.phone,
      title: user.title,
      department: user.department,
      permissions: user.permissions,
      preferences: user.preferences,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const exportData: DataExportResult = {
      userId: request.userId,
      exportDate: new Date(),
      format: request.format || 'json',
      data: {
        personalInfo,
        cases: [],
        documents: [],
        communications: [],
        billing: [],
        auditLogs: auditLogs.map(log => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          timestamp: log.timestamp,
          ipAddress: log.ipAddress,
          result: log.result,
          description: log.description,
        })),
        consents: consents.map(consent => ({
          id: consent.id,
          consentType: consent.consentType,
          purpose: consent.purpose,
          scope: consent.scope,
          status: consent.status,
          grantedAt: consent.grantedAt,
          revokedAt: consent.revokedAt,
          expiresAt: consent.expiresAt,
          consentVersion: consent.consentVersion,
          dataCategories: consent.dataCategories,
          thirdParties: consent.thirdParties,
        })),
      },
      metadata: {
        totalRecords: auditLogs.length + consents.length + 1,
        dataCategories: request.dataCategories || ['all'],
        exportedBy: 'system',
      },
    };

    await this.auditLogRepository.save({
      userId: request.userId,
      action: 'export',
      entityType: 'user',
      entityId: request.userId,
      timestamp: new Date(),
      description: 'GDPR data export request processed',
      result: 'success',
      details: `Exported ${exportData.metadata.totalRecords} records`,
    } as AuditLog);

    return exportData;
  }

  async handleRightToBeForgotten(request: DataDeletionRequestDto): Promise<DataDeletionResult> {
    this.logger.log(`Processing Right to Be Forgotten request for user: ${request.userId}`);

    const user = await this.userRepository.findOne({ where: { id: request.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${request.userId} not found`);
    }

    const activeConsents = await this.consentRepository.find({
      where: {
        userId: request.userId,
        status: ConsentStatus.GRANTED,
      },
    });

    if (activeConsents.length > 0 && !request.softDelete) {
      this.logger.warn(`User ${request.userId} has active consents, will anonymize instead of delete`);
    }

    const recordsDeleted = 0;
    let recordsAnonymized = 0;
    const deletedCategories: string[] = [];

    if (request.softDelete !== false) {
      user.email = `deleted-${user.id}@anonymized.local`;
      user.firstName = 'Deleted';
      user.lastName = 'User';
      user.phone = '';
      user.avatarUrl = '';
      user.preferences = {};
      user.status = 'inactive' as any;
      await this.userRepository.save(user);
      recordsAnonymized = 1;
      deletedCategories.push('personal_info');
    }

    await this.consentRepository.update(
      { userId: request.userId, status: ConsentStatus.GRANTED },
      {
        status: ConsentStatus.REVOKED,
        revokedAt: new Date(),
        revocationReason: request.reason || 'User requested data deletion (GDPR Article 17)',
      },
    );

    const result: DataDeletionResult = {
      userId: request.userId,
      deletionDate: new Date(),
      deletedCategories,
      recordsDeleted,
      recordsAnonymized,
      status: 'completed',
      details: {
        reason: request.reason,
        softDelete: request.softDelete !== false,
        requestedBy: request.requestedBy,
      },
    };

    await this.auditLogRepository.save({
      userId: request.userId,
      action: 'delete',
      entityType: 'user',
      entityId: request.userId,
      timestamp: new Date(),
      description: 'GDPR Right to Be Forgotten request processed',
      result: 'success',
      details: JSON.stringify(result),
    } as AuditLog);

    return result;
  }

  async exportUserData(userId: string, format: string = 'json'): Promise<DataExportResult> {
    return this.handleDataSubjectAccessRequest({
      userId,
      format,
      includeArchived: true,
      includeDeleted: false,
    });
  }

  async grantConsent(consentDto: ConsentDto, ipAddress?: string, userAgent?: string): Promise<Consent> {
    this.logger.log(`Granting consent for user ${consentDto.userId}: ${consentDto.consentType}`);

    const user = await this.userRepository.findOne({ where: { id: consentDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${consentDto.userId} not found`);
    }

    const existingConsent = await this.consentRepository.findOne({
      where: {
        userId: consentDto.userId,
        consentType: consentDto.consentType,
        status: In([ConsentStatus.GRANTED, ConsentStatus.PENDING]),
      },
      order: { grantedAt: 'DESC' },
    });

    if (existingConsent) {
      this.logger.warn(`Consent already exists for ${consentDto.userId}: ${consentDto.consentType}`);
      return existingConsent;
    }

    const consent = this.consentRepository.create({
      userId: consentDto.userId,
      consentType: consentDto.consentType,
      purpose: consentDto.purpose,
      scope: consentDto.scope,
      status: ConsentStatus.GRANTED,
      grantedAt: new Date(),
      consentVersion: consentDto.consentVersion || '1.0',
      dataCategories: consentDto.dataCategories || [],
      thirdParties: consentDto.thirdParties || [],
      legalBasis: consentDto.legalBasis || 'consent',
      ipAddress,
      userAgent,
      metadata: consentDto.metadata,
      expiresAt: consentDto.expiresAt ? new Date(consentDto.expiresAt) : null,
    });

    const saved = await this.consentRepository.save(consent);

    await this.auditLogRepository.save({
      userId: consentDto.userId,
      action: 'create',
      entityType: 'consent',
      entityId: saved.id,
      timestamp: new Date(),
      description: `User granted consent: ${consentDto.consentType}`,
      result: 'success',
      ipAddress,
      userAgent,
    } as AuditLog);

    return saved;
  }

  async revokeConsent(revokeDto: RevokeConsentDto): Promise<Consent> {
    this.logger.log(`Revoking consent: ${revokeDto.consentId}`);

    const consent = await this.consentRepository.findOne({
      where: { id: revokeDto.consentId },
    });

    if (!consent) {
      throw new NotFoundException(`Consent with ID ${revokeDto.consentId} not found`);
    }

    if (consent.status === ConsentStatus.REVOKED) {
      throw new BadRequestException('Consent is already revoked');
    }

    consent.status = ConsentStatus.REVOKED;
    consent.revokedAt = new Date();
    consent.revocationReason = revokeDto.reason || 'User revoked consent';

    const saved = await this.consentRepository.save(consent);

    await this.auditLogRepository.save({
      userId: consent.userId,
      action: 'update',
      entityType: 'consent',
      entityId: consent.id,
      timestamp: new Date(),
      description: `Consent revoked: ${consent.consentType}`,
      result: 'success',
      details: revokeDto.reason,
    } as AuditLog);

    return saved;
  }

  async getUserConsents(userId: string): Promise<Consent[]> {
    return this.consentRepository.find({
      where: { userId },
      order: { grantedAt: 'DESC' },
    });
  }

  async getActiveConsents(userId: string): Promise<Consent[]> {
    return this.consentRepository.find({
      where: {
        userId,
        status: ConsentStatus.GRANTED,
      },
      order: { grantedAt: 'DESC' },
    });
  }

  async checkConsentValidity(userId: string, consentType: string): Promise<boolean> {
    const now = new Date();
    const consent = await this.consentRepository.findOne({
      where: {
        userId,
        consentType: consentType as any,
        status: ConsentStatus.GRANTED,
      },
      order: { grantedAt: 'DESC' },
    });

    if (!consent) {
      return false;
    }

    if (consent.expiresAt && consent.expiresAt < now) {
      await this.consentRepository.update(
        { id: consent.id },
        { status: ConsentStatus.EXPIRED },
      );
      return false;
    }

    return true;
  }

  async generateDataProcessingRecord(userId: string): Promise<DataProcessingRecord> {
    this.logger.log(`Generating data processing record for user: ${userId}`);

    const consents = await this.getActiveConsents(userId);

    const processingActivities = consents.map(consent => ({
      activity: consent.consentType,
      purpose: consent.purpose,
      legalBasis: consent.legalBasis || 'consent',
      dataCategories: consent.dataCategories,
      recipients: consent.thirdParties,
      retentionPeriod: consent.expiresAt
        ? `Until ${consent.expiresAt.toISOString()}`
        : 'As long as account is active',
      securityMeasures: [
        'Encryption at rest and in transit',
        'Access control and authentication',
        'Regular security audits',
        'Incident response procedures',
      ],
    }));

    const record: DataProcessingRecord = {
      userId,
      processingActivities,
      generatedAt: new Date(),
    };

    await this.auditLogRepository.save({
      userId,
      action: 'read',
      entityType: 'data_processing_record',
      entityId: userId,
      timestamp: new Date(),
      description: 'Generated data processing record (GDPR Article 30)',
      result: 'success',
    } as AuditLog);

    return record;
  }

  async expireOldConsents(): Promise<number> {
    const now = new Date();
    const result = await this.consentRepository
      .createQueryBuilder()
      .update(Consent)
      .set({ status: ConsentStatus.EXPIRED })
      .where('status = :status', { status: ConsentStatus.GRANTED })
      .andWhere('expires_at IS NOT NULL')
      .andWhere('expires_at < :now', { now })
      .execute();

    this.logger.log(`Expired ${result.affected || 0} consents`);
    return result.affected || 0;
  }
}
