import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ColumnEncryptionService } from './services/column.encryption.service';
import { QuerySanitizationService } from './services/query.sanitization.service';
import { ConnectionPoolService } from './services/connection.pool.service';
import { DataMaskingService } from './services/data.masking.service';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { setEncryptionService } from './decorators/encrypted.column.decorator';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([])],
  providers: [
    ColumnEncryptionService,
    QuerySanitizationService,
    ConnectionPoolService,
    DataMaskingService,
    AuditSubscriber,
  ],
  exports: [
    ColumnEncryptionService,
    QuerySanitizationService,
    ConnectionPoolService,
    DataMaskingService,
    AuditSubscriber,
  ],
})
export class DatabaseSecurityModule implements OnModuleInit {
  constructor(private readonly encryptionService: ColumnEncryptionService) {}

  onModuleInit(): void {
    setEncryptionService(this.encryptionService);
  }
}
