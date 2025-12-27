import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaseLoader } from './case.loader';
import { UserLoader } from './user.loader';
import { DocumentLoader } from './document.loader';
import { Case } from '@cases/entities/case.entity';
import { User } from '@users/entities/user.entity';
import { Document } from '@documents/entities/document.entity';
import { DocumentVersion } from '@document-versions/entities/document-version.entity';

/**
 * DataLoader Module
 * Provides request-scoped DataLoaders for preventing N+1 queries in GraphQL
 * All loaders are scoped to REQUEST to ensure data isolation between requests
 */
@Module({
  imports: [TypeOrmModule.forFeature([Case, User, Document, DocumentVersion])],
  providers: [CaseLoader, UserLoader, DocumentLoader],
  exports: [CaseLoader, UserLoader, DocumentLoader],
})
export class DataLoaderModule {}
