import { Module } from '@nestjs/common';
import { DataCatalogController } from './data-catalog.controller';
import { DataCatalogService } from './data-catalog.service';
import { SchemaManagementModule } from '../schema-management/schema-management.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    SchemaManagementModule,
    AuthModule,
  ],
  controllers: [DataCatalogController],
  providers: [DataCatalogService],
  exports: [DataCatalogService],
})
export class DataCatalogModule {}
