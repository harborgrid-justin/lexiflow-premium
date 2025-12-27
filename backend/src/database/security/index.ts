export { DatabaseSecurityModule } from './database.security.module';

export { ColumnEncryptionService } from './services/column.encryption.service';
export { QuerySanitizationService } from './services/query.sanitization.service';
export { ConnectionPoolService } from './services/connection.pool.service';
export { DataMaskingService } from './services/data.masking.service';

export { AuditSubscriber } from './subscribers/audit.subscriber';

export {
  EncryptedColumn,
  EncryptedSSN,
  EncryptedCreditCard,
  EncryptedBankAccount,
  EncryptedDriverLicense,
  EncryptedPassport,
  EncryptedTaxId,
  EncryptedHealthRecord,
  EncryptedPersonalInfo,
  SensitiveField,
  setEncryptionService,
  getEncryptionService,
  getSensitiveFields,
  type EncryptedColumnOptions,
  type SensitiveFieldOptions,
} from './decorators/encrypted.column.decorator';

export type { EncryptionKeyConfig, EncryptedValue } from './services/column.encryption.service';
export type { QueryComplexityLimits, SanitizationResult } from './services/query.sanitization.service';
export type { ConnectionPoolMetrics, ConnectionHealthStatus } from './services/connection.pool.service';
export type { MaskingRule, MaskingConfig } from './services/data.masking.service';
export type { AuditLogEntry } from './subscribers/audit.subscriber';
