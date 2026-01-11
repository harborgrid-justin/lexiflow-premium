import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '@compliance/entities/audit-log.entity';

export enum DataSensitivityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted',
  HIGHLY_RESTRICTED = 'highly_restricted',
}

export enum DataCategory {
  PII = 'pii',
  PHI = 'phi',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  BUSINESS = 'business',
  TECHNICAL = 'technical',
  METADATA = 'metadata',
}

export interface ClassificationResult {
  entityType: string;
  entityId: string;
  sensitivityLevel: DataSensitivityLevel;
  categories: DataCategory[];
  piiFields: string[];
  phiFields: string[];
  financialFields: string[];
  confidence: number;
  detectedPatterns: Array<{
    field: string;
    pattern: string;
    category: DataCategory;
  }>;
  recommendedAccess: string[];
  classifiedAt: Date;
  requiresEncryption: boolean;
  requiresAudit: boolean;
}

interface PIIPattern {
  name: string;
  pattern: RegExp;
  category: DataCategory;
  sensitivityLevel: DataSensitivityLevel;
}

/**
 * ╔=================================================================================================================╗
 * ║DATACLASSIFICATION                                                                                               ║
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
export class DataClassificationService {
  private readonly logger = new Logger(DataClassificationService.name);

  private readonly piiPatterns: PIIPattern[] = [
    {
      name: 'ssn',
      pattern: /\b\d{3}-\d{2}-\d{4}\b/,
      category: DataCategory.PII,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
    {
      name: 'email',
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Z|a-z]{2,}\b/,
      category: DataCategory.PII,
      sensitivityLevel: DataSensitivityLevel.CONFIDENTIAL,
    },
    {
      name: 'phone',
      pattern: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/,
      category: DataCategory.PII,
      sensitivityLevel: DataSensitivityLevel.CONFIDENTIAL,
    },
    {
      name: 'credit_card',
      pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/,
      category: DataCategory.FINANCIAL,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
    {
      name: 'date_of_birth',
      pattern: /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/,
      category: DataCategory.PII,
      sensitivityLevel: DataSensitivityLevel.RESTRICTED,
    },
    {
      name: 'passport',
      pattern: /\b[A-Z]{1,2}[0-9]{6,9}\b/,
      category: DataCategory.PII,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
    {
      name: 'drivers_license',
      pattern: /\b[A-Z]{1,2}[0-9]{5,8}\b/,
      category: DataCategory.PII,
      sensitivityLevel: DataSensitivityLevel.RESTRICTED,
    },
    {
      name: 'medical_record_number',
      pattern: /\b(?:MRN|mrn)[:\s-]?[A-Z0-9]{6,12}\b/i,
      category: DataCategory.PHI,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
    {
      name: 'health_insurance',
      pattern: /\b[A-Z]{3}[0-9]{9,12}\b/,
      category: DataCategory.PHI,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
    {
      name: 'bank_account',
      pattern: /\b[0-9]{8,17}\b/,
      category: DataCategory.FINANCIAL,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
    {
      name: 'routing_number',
      pattern: /\b[0-9]{9}\b/,
      category: DataCategory.FINANCIAL,
      sensitivityLevel: DataSensitivityLevel.HIGHLY_RESTRICTED,
    },
  ];

  private readonly piiFieldNames = [
    'ssn',
    'socialSecurityNumber',
    'social',
    'taxId',
    'ein',
    'firstName',
    'lastName',
    'fullName',
    'name',
    'email',
    'phone',
    'phoneNumber',
    'mobile',
    'address',
    'street',
    'city',
    'state',
    'zip',
    'zipCode',
    'postalCode',
    'dateOfBirth',
    'dob',
    'birthDate',
    'passport',
    'passportNumber',
    'driversLicense',
    'licenseNumber',
  ];

  private readonly phiFieldNames = [
    'medicalRecordNumber',
    'mrn',
    'healthInsurance',
    'insuranceNumber',
    'diagnosis',
    'medication',
    'prescription',
    'treatment',
    'procedure',
    'healthCondition',
    'mentalHealth',
    'disability',
    'geneticInformation',
    'biometric',
  ];

  private readonly financialFieldNames = [
    'creditCard',
    'cardNumber',
    'accountNumber',
    'bankAccount',
    'routingNumber',
    'iban',
    'swift',
    'sortCode',
    'pin',
    'cvv',
    'securityCode',
    'salary',
    'income',
    'netWorth',
    'balance',
  ];

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async classifyData(entityType: string, entityId: string, data: Record<string, unknown>): Promise<ClassificationResult> {
    this.logger.log(`Classifying data for ${entityType}:${entityId}`);

    const piiFields: string[] = [];
    const phiFields: string[] = [];
    const financialFields: string[] = [];
    const detectedPatterns: Array<{ field: string; pattern: string; category: DataCategory }> = [];
    const categories = new Set<DataCategory>();

    this.analyzeObject(data, '', piiFields, phiFields, financialFields, detectedPatterns, categories);

    const sensitivityLevel = this.determineSensitivityLevel(piiFields, phiFields, financialFields);
    const categoriesArray = Array.from(categories);
    const confidence = this.calculateConfidence(detectedPatterns.length, Object.keys(data).length);

    const result: ClassificationResult = {
      entityType,
      entityId,
      sensitivityLevel,
      categories: categoriesArray,
      piiFields,
      phiFields,
      financialFields,
      confidence,
      detectedPatterns,
      recommendedAccess: this.getRecommendedAccess(sensitivityLevel),
      classifiedAt: new Date(),
      requiresEncryption: this.requiresEncryption(sensitivityLevel),
      requiresAudit: this.requiresAudit(sensitivityLevel),
    };

    await this.auditLogRepository.save({
      userId: 'system',
      action: 'read',
      entityType: 'data_classification',
      entityId: `${entityType}:${entityId}`,
      timestamp: new Date(),
      description: `Data classification completed: ${sensitivityLevel}`,
      result: 'success',
      details: JSON.stringify({
        sensitivityLevel,
        categories: categoriesArray,
        piiFieldsCount: piiFields.length,
        phiFieldsCount: phiFields.length,
        financialFieldsCount: financialFields.length,
      }),
    } as AuditLog);

    return result;
  }

  private analyzeObject(
    obj: Record<string, unknown>,
    prefix: string,
    piiFields: string[],
    phiFields: string[],
    financialFields: string[],
    detectedPatterns: Array<{ field: string; pattern: string; category: DataCategory }>,
    categories: Set<DataCategory>,
  ): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      const lowerKey = key.toLowerCase();
      if (this.piiFieldNames.some(piiField => lowerKey.includes(piiField.toLowerCase()))) {
        piiFields.push(fullKey);
        categories.add(DataCategory.PII);
      }

      if (this.phiFieldNames.some(phiField => lowerKey.includes(phiField.toLowerCase()))) {
        phiFields.push(fullKey);
        categories.add(DataCategory.PHI);
      }

      if (this.financialFieldNames.some(finField => lowerKey.includes(finField.toLowerCase()))) {
        financialFields.push(fullKey);
        categories.add(DataCategory.FINANCIAL);
      }

      if (typeof value === 'string') {
        for (const pattern of this.piiPatterns) {
          if (pattern.pattern.test(value)) {
            detectedPatterns.push({
              field: fullKey,
              pattern: pattern.name,
              category: pattern.category,
            });
            categories.add(pattern.category);

            if (pattern.category === DataCategory.PII && !piiFields.includes(fullKey)) {
              piiFields.push(fullKey);
            } else if (pattern.category === DataCategory.PHI && !phiFields.includes(fullKey)) {
              phiFields.push(fullKey);
            } else if (pattern.category === DataCategory.FINANCIAL && !financialFields.includes(fullKey)) {
              financialFields.push(fullKey);
            }
          }
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.analyzeObject(
          value as Record<string, unknown>,
          fullKey,
          piiFields,
          phiFields,
          financialFields,
          detectedPatterns,
          categories,
        );
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            this.analyzeObject(
              item as Record<string, unknown>,
              `${fullKey}[${index}]`,
              piiFields,
              phiFields,
              financialFields,
              detectedPatterns,
              categories,
            );
          } else if (typeof item === 'string') {
            for (const pattern of this.piiPatterns) {
              if (pattern.pattern.test(item)) {
                detectedPatterns.push({
                  field: `${fullKey}[${index}]`,
                  pattern: pattern.name,
                  category: pattern.category,
                });
                categories.add(pattern.category);
              }
            }
          }
        });
      }
    }
  }

  private determineSensitivityLevel(
    piiFields: string[],
    phiFields: string[],
    financialFields: string[],
  ): DataSensitivityLevel {
    if (phiFields.length > 0 || financialFields.some(f => f.toLowerCase().includes('creditcard') || f.toLowerCase().includes('ssn'))) {
      return DataSensitivityLevel.HIGHLY_RESTRICTED;
    }

    if (piiFields.length > 5 || financialFields.length > 0) {
      return DataSensitivityLevel.RESTRICTED;
    }

    if (piiFields.length > 0) {
      return DataSensitivityLevel.CONFIDENTIAL;
    }

    return DataSensitivityLevel.INTERNAL;
  }

  private calculateConfidence(patternsDetected: number, totalFields: number): number {
    if (totalFields === 0) return 0;

    const detectionRate = patternsDetected / totalFields;
    return Math.min(100, Math.round(detectionRate * 100 + 50));
  }

  private getRecommendedAccess(level: DataSensitivityLevel): string[] {
    switch (level) {
      case DataSensitivityLevel.HIGHLY_RESTRICTED:
        return ['super_admin', 'admin', 'compliance_officer'];
      case DataSensitivityLevel.RESTRICTED:
        return ['super_admin', 'admin', 'partner', 'compliance_officer'];
      case DataSensitivityLevel.CONFIDENTIAL:
        return ['super_admin', 'admin', 'partner', 'attorney'];
      case DataSensitivityLevel.INTERNAL:
        return ['super_admin', 'admin', 'partner', 'attorney', 'paralegal', 'staff'];
      case DataSensitivityLevel.PUBLIC:
        return ['all'];
      default:
        return ['super_admin', 'admin'];
    }
  }

  private requiresEncryption(level: DataSensitivityLevel): boolean {
    return [
      DataSensitivityLevel.HIGHLY_RESTRICTED,
      DataSensitivityLevel.RESTRICTED,
      DataSensitivityLevel.CONFIDENTIAL,
    ].includes(level);
  }

  private requiresAudit(level: DataSensitivityLevel): boolean {
    return [
      DataSensitivityLevel.HIGHLY_RESTRICTED,
      DataSensitivityLevel.RESTRICTED,
    ].includes(level);
  }

  async identifyPII(text: string): Promise<Array<{ type: string; value: string; position: number }>> {
    const findings: Array<{ type: string; value: string; position: number }> = [];

    for (const pattern of this.piiPatterns) {
      if (pattern.category === DataCategory.PII) {
        const matches = text.matchAll(new RegExp(pattern.pattern, 'g'));
        for (const match of matches) {
          if (match.index !== undefined) {
            findings.push({
              type: pattern.name,
              value: match[0],
              position: match.index,
            });
          }
        }
      }
    }

    return findings;
  }

  async identifyPHI(text: string): Promise<Array<{ type: string; value: string; position: number }>> {
    const findings: Array<{ type: string; value: string; position: number }> = [];

    for (const pattern of this.piiPatterns) {
      if (pattern.category === DataCategory.PHI) {
        const matches = text.matchAll(new RegExp(pattern.pattern, 'g'));
        for (const match of matches) {
          if (match.index !== undefined) {
            findings.push({
              type: pattern.name,
              value: match[0],
              position: match.index,
            });
          }
        }
      }
    }

    return findings;
  }

  async maskSensitiveData(data: Record<string, unknown>, classification: ClassificationResult): Promise<Record<string, unknown>> {
    const masked = JSON.parse(JSON.stringify(data));

    const allSensitiveFields = [
      ...classification.piiFields,
      ...classification.phiFields,
      ...classification.financialFields,
    ];

    for (const field of allSensitiveFields) {
      this.maskField(masked, field.split('.'));
    }

    return masked;
  }

  private maskField(obj: Record<string, unknown>, path: string[]): void {
    if (path.length === 0) return;

    const [current, ...rest] = path;
    if (!current) return;
    const arrayMatch = current.match(/^(.+)\[(\d+)\]$/);

    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      if (!key || !index) return;
      const arr = obj[key];
      if (Array.isArray(arr) && arr[parseInt(index)]) {
        if (rest.length === 0) {
          arr[parseInt(index)] = '***MASKED***';
        } else {
          this.maskField(arr[parseInt(index)] as Record<string, unknown>, rest);
        }
      }
    } else if (rest.length === 0) {
      if (obj[current] !== undefined) {
        obj[current] = '***MASKED***';
      }
    } else {
      if (typeof obj[current] === 'object' && obj[current] !== null) {
        this.maskField(obj[current] as Record<string, unknown>, rest);
      }
    }
  }

  async getSensitivityLabel(level: DataSensitivityLevel): Promise<{
    level: DataSensitivityLevel;
    label: string;
    color: string;
    description: string;
  }> {
    const labels = {
      [DataSensitivityLevel.PUBLIC]: {
        level: DataSensitivityLevel.PUBLIC,
        label: 'Public',
        color: '#00FF00',
        description: 'Information that can be freely shared',
      },
      [DataSensitivityLevel.INTERNAL]: {
        level: DataSensitivityLevel.INTERNAL,
        label: 'Internal',
        color: '#0000FF',
        description: 'Information for internal use only',
      },
      [DataSensitivityLevel.CONFIDENTIAL]: {
        level: DataSensitivityLevel.CONFIDENTIAL,
        label: 'Confidential',
        color: '#FFA500',
        description: 'Sensitive information requiring protection',
      },
      [DataSensitivityLevel.RESTRICTED]: {
        level: DataSensitivityLevel.RESTRICTED,
        label: 'Restricted',
        color: '#FF0000',
        description: 'Highly sensitive information with restricted access',
      },
      [DataSensitivityLevel.HIGHLY_RESTRICTED]: {
        level: DataSensitivityLevel.HIGHLY_RESTRICTED,
        label: 'Highly Restricted',
        color: '#8B0000',
        description: 'Most sensitive information requiring highest level of protection',
      },
    };

    return labels[level];
  }

  async validateAccessPermission(
    userRoles: string[],
    sensitivityLevel: DataSensitivityLevel,
  ): Promise<boolean> {
    const recommendedAccess = this.getRecommendedAccess(sensitivityLevel);

    if (recommendedAccess.includes('all')) {
      return true;
    }

    return userRoles.some(role => recommendedAccess.includes(role));
  }
}
