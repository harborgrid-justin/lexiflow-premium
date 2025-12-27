/**
 * LexiFlow Database Security - Usage Examples
 *
 * This file demonstrates how to use the database security features
 * in a production enterprise application.
 */

import { Entity, Column, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseEntity } from '@common/base/base.entity';
import {
  EncryptedColumn,
  EncryptedSSN,
  EncryptedCreditCard,
  EncryptedBankAccount,
  ColumnEncryptionService,
  QuerySanitizationService,
  DataMaskingService,
  ConnectionPoolService,
} from './index';

@Entity('secure_clients')
export class SecureClient extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone!: string;

  @EncryptedSSN({ name: 'social_security_number', nullable: true })
  socialSecurityNumber!: string;

  @EncryptedCreditCard({ name: 'credit_card_number', nullable: true })
  creditCardNumber!: string;

  @EncryptedBankAccount({ name: 'bank_account_number', nullable: true })
  bankAccountNumber!: string;

  @EncryptedColumn({ name: 'drivers_license', nullable: true })
  driversLicense!: string;

  @EncryptedColumn({ name: 'passport_number', nullable: true })
  passportNumber!: string;

  @EncryptedColumn({ name: 'medical_record_number', nullable: true })
  medicalRecordNumber!: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth!: Date;

  @Column({ type: 'text', nullable: true })
  notes!: string;
}

@Injectable()
export class SecureClientService {
  constructor(
    @InjectRepository(SecureClient)
    private readonly clientRepository: Repository<SecureClient>,
    private readonly encryptionService: ColumnEncryptionService,
    private readonly sanitizationService: QuerySanitizationService,
    private readonly maskingService: DataMaskingService,
    private readonly poolService: ConnectionPoolService,
  ) {}

  async createSecureClient(data: Partial<SecureClient>): Promise<SecureClient> {
    const client = this.clientRepository.create(data);

    return await this.clientRepository.save(client);
  }

  async findClientById(id: string): Promise<SecureClient | null> {
    const sanitizedId = this.sanitizationService.sanitizeIdentifier(id);

    return await this.clientRepository.findOne({
      where: { id: sanitizedId },
    });
  }

  async findClientsByQuery(
    searchQuery: string,
    limit: number = 100,
  ): Promise<SecureClient[]> {
    const safeLimit = this.sanitizationService.createSafeLimit(limit, 100, 1000);

    const result = this.sanitizationService.validateQuery(searchQuery);
    if (!result.isSafe) {
      throw new Error(`Invalid query: ${result.violations.join(', ')}`);
    }

    return await this.clientRepository
      .createQueryBuilder('client')
      .where('client.fullName ILIKE :search', { search: `%${searchQuery}%` })
      .take(safeLimit)
      .getMany();
  }

  async exportClientData(
    clientId: string,
    userRole: 'public' | 'internal' | 'restricted',
  ): Promise<any> {
    const client = await this.findClientById(clientId);

    if (!client) {
      throw new Error('Client not found');
    }

    const masked = this.maskingService.maskForExport(client, userRole);

    return masked;
  }

  async logClientAccess(client: SecureClient): Promise<void> {
    const maskedData = this.maskingService.maskForLogging(client);

    console.log('Client accessed:', {
      id: client.id,
      name: client.fullName,
      data: maskedData,
    });
  }

  async rotateEncryptionKeys(): Promise<number> {
    const totalRotated =
      (await this.encryptionService.rotateKey(
        'socialSecurityNumber',
        SecureClient,
        this.clientRepository,
      )) +
      (await this.encryptionService.rotateKey(
        'creditCardNumber',
        SecureClient,
        this.clientRepository,
      )) +
      (await this.encryptionService.rotateKey(
        'bankAccountNumber',
        SecureClient,
        this.clientRepository,
      ));

    console.log(`Rotated encryption keys for ${totalRotated} records`);
    return totalRotated;
  }

  async getDatabaseHealth(): Promise<any> {
    const health = await this.poolService.performHealthCheck();
    const metrics = await this.poolService.getPoolMetrics();

    return {
      healthy: health.isHealthy,
      errors: health.errors,
      connections: {
        active: metrics.activeConnections,
        idle: metrics.idleConnections,
        total: metrics.totalConnections,
      },
      performance: {
        averageAcquireTime: metrics.averageAcquireTime,
        averageQueryTime: metrics.averageQueryTime,
        totalQueries: metrics.totalQueries,
        failedQueries: metrics.failedQueries,
      },
      issues: {
        leakedConnections: metrics.leakedConnections,
      },
    };
  }

  async searchWithSanitization(
    tableName: string,
    whereClause: Record<string, any>,
    limit: number,
    offset: number,
  ): Promise<any[]> {
    const safeTable = this.sanitizationService.sanitizeTableName(tableName);

    this.sanitizationService.validateWhereClause(whereClause);

    const safeLimit = this.sanitizationService.createSafeLimit(limit);
    const safeOffset = this.sanitizationService.createSafeOffset(offset);

    return await this.clientRepository.find({
      where: whereClause,
      take: safeLimit,
      skip: safeOffset,
    });
  }

  async bulkUpdateWithAudit(
    clientIds: string[],
    updates: Partial<SecureClient>,
  ): Promise<void> {
    for (const id of clientIds) {
      const client = await this.findClientById(id);
      if (client) {
        Object.assign(client, updates);
        await this.clientRepository.save(client);
      }
    }
  }

  async encryptSensitiveField(value: string): Promise<string> {
    return this.encryptionService.encrypt(value);
  }

  async decryptSensitiveField(encryptedValue: string): Promise<string> {
    return this.encryptionService.decrypt(encryptedValue);
  }

  async hashForSearch(value: string): Promise<string> {
    return this.encryptionService.hashValue(value);
  }

  async verifyHash(value: string, hash: string): Promise<boolean> {
    return this.encryptionService.compareHash(value, hash);
  }

  async maskPhoneNumber(phone: string): Promise<string> {
    return this.maskingService.maskPhone(phone);
  }

  async maskEmail(email: string): Promise<string> {
    return this.maskingService.maskEmail(email);
  }

  async createReversibleMask(value: string): Promise<string> {
    return this.maskingService.reversibleMask(value);
  }

  async unmaskReversible(
    maskedValue: string,
    isAuthorized: boolean,
  ): Promise<string> {
    return this.maskingService.reversibleUnmask(maskedValue, isAuthorized);
  }
}

@Injectable()
export class DatabaseSecurityHealthService {
  constructor(private readonly poolService: ConnectionPoolService) {}

  async performHealthCheck(): Promise<{
    status: string;
    timestamp: Date;
    database: any;
  }> {
    const health = await this.poolService.performHealthCheck();

    return {
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: health.lastCheck,
      database: {
        poolSize: health.poolSize,
        activeConnections: health.activeConnections,
        idleConnections: health.idleConnections,
        errors: health.errors,
      },
    };
  }

  async getPoolMetrics(): Promise<any> {
    return await this.poolService.getPoolMetrics();
  }

  async validateConnection(): Promise<boolean> {
    return await this.poolService.validateConnection();
  }

  async closeIdleConnections(): Promise<number> {
    return await this.poolService.closeIdleConnections();
  }

  getHealthStatus(): string {
    return this.poolService.getHealthStatus();
  }
}

@Injectable()
export class QuerySecurityService {
  constructor(private readonly sanitizer: QuerySanitizationService) {}

  validateAndExecuteQuery(query: string, params?: any[]): void {
    this.sanitizer.blockDangerousOperations(query);

    const result = this.sanitizer.validateQuery(query, params);

    if (!result.isSafe) {
      this.sanitizer.logSuspiciousQuery(query, params, {
        timestamp: new Date().toISOString(),
        source: 'QuerySecurityService',
      });

      throw new Error(`Unsafe query detected: ${result.violations.join(', ')}`);
    }

    console.log('Query validated successfully');
  }

  sanitizeUserInput(input: {
    tableName: string;
    columns: string[];
    whereClause: Record<string, any>;
  }): any {
    return {
      tableName: this.sanitizer.sanitizeTableName(input.tableName),
      columns: input.columns.map(c => this.sanitizer.sanitizeColumnName(c)),
      whereClause: input.whereClause,
    };
  }
}

export {
  SecureClient,
  SecureClientService,
  DatabaseSecurityHealthService,
  QuerySecurityService,
};
