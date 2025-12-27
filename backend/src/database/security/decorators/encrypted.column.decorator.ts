import { Column, ColumnOptions, ValueTransformer } from 'typeorm';
import { ColumnEncryptionService } from '@database/security/services/column.encryption.service';

let encryptionService: ColumnEncryptionService | null = null;

export function setEncryptionService(service: ColumnEncryptionService): void {
  encryptionService = service;
}

export function getEncryptionService(): ColumnEncryptionService {
  if (!encryptionService) {
    throw new Error(
      'EncryptionService not initialized. Make sure DatabaseSecurityModule is imported in your app module.'
    );
  }
  return encryptionService;
}

export interface EncryptedColumnOptions extends ColumnOptions {
  nullable?: boolean;
  length?: number;
  type?: any;
}

const encryptionTransformer: ValueTransformer = {
  to(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    try {
      const service = getEncryptionService();
      return service.encrypt(value);
    } catch (error) {
      console.error('Encryption error in transformer:', error);
      throw error;
    }
  },

  from(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    try {
      const service = getEncryptionService();
      return service.decrypt(value);
    } catch (error) {
      console.error('Decryption error in transformer:', error);
      return null;
    }
  },
};

export function EncryptedColumn(options?: EncryptedColumnOptions): PropertyDecorator {
  const columnOptions: ColumnOptions = {
    type: 'text',
    nullable: options?.nullable !== false,
    transformer: encryptionTransformer,
    ...options,
  };

  return Column(columnOptions);
}

export interface SensitiveFieldOptions {
  maskInLogs?: boolean;
  auditAccess?: boolean;
}

export function SensitiveField(options?: SensitiveFieldOptions): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const metadataKey = 'sensitiveFields';
    const existingFields = Reflect.getMetadata(metadataKey, target.constructor) || [];

    existingFields.push({
      propertyKey,
      maskInLogs: options?.maskInLogs !== false,
      auditAccess: options?.auditAccess === true,
    });

    Reflect.defineMetadata(metadataKey, existingFields, target.constructor);
  };
}

export function getSensitiveFields(target: any): string[] {
  const metadataKey = 'sensitiveFields';
  const fields = Reflect.getMetadata(metadataKey, target.constructor) || [];
  return fields.map((f: any) => f.propertyKey);
}

export function EncryptedSSN(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Social Security Number',
  });
}

export function EncryptedCreditCard(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Credit Card Number',
  });
}

export function EncryptedBankAccount(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Bank Account Number',
  });
}

export function EncryptedDriverLicense(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Driver License Number',
  });
}

export function EncryptedPassport(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Passport Number',
  });
}

export function EncryptedTaxId(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Tax ID',
  });
}

export function EncryptedHealthRecord(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Health Record',
  });
}

export function EncryptedPersonalInfo(options?: EncryptedColumnOptions): PropertyDecorator {
  return EncryptedColumn({
    ...options,
    comment: 'Encrypted Personal Information',
  });
}
