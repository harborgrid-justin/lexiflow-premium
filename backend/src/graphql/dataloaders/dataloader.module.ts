import { Module } from '@nestjs/common';
import { CaseLoader } from './case.loader';
import { UserLoader } from './user.loader';
import { DocumentLoader } from './document.loader';

/**
 * DataLoader Module
 * Provides request-scoped DataLoaders for preventing N+1 queries in GraphQL
 * All loaders are scoped to REQUEST to ensure data isolation between requests
 */
@Module({
  providers: [CaseLoader, UserLoader, DocumentLoader],
  exports: [CaseLoader, UserLoader, DocumentLoader],
})
export class DataLoaderModule {}
