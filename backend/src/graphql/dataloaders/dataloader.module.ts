import { Module } from '@nestjs/common';
import { CaseLoader } from './case.loader';
import { UserLoader } from './user.loader';
import { DocumentLoader } from './document.loader';
import { ClientLoader } from './client.loader';
import { BillingLoader } from './billing.loader';
import { ComplianceLoader } from './compliance.loader';
import { DiscoveryLoader } from './discovery.loader';

/**
 * DataLoader Module
 * Provides request-scoped DataLoaders for preventing N+1 queries in GraphQL
 * All loaders are scoped to REQUEST to ensure data isolation between requests
 *
 * DataLoaders included:
 * - CaseLoader: Batch load cases and case relationships
 * - UserLoader: Batch load users and user relationships
 * - DocumentLoader: Batch load documents by various criteria
 * - ClientLoader: Batch load clients and client relationships
 * - BillingLoader: Batch load time entries, invoices, and expenses
 * - ComplianceLoader: Batch load audit logs and compliance data
 * - DiscoveryLoader: Batch load discovery requests, depositions, and productions
 */
@Module({
  providers: [
    CaseLoader,
    UserLoader,
    DocumentLoader,
    ClientLoader,
    BillingLoader,
    ComplianceLoader,
    DiscoveryLoader,
  ],
  exports: [
    CaseLoader,
    UserLoader,
    DocumentLoader,
    ClientLoader,
    BillingLoader,
    ComplianceLoader,
    DiscoveryLoader,
  ],
})
export class DataLoaderModule {}
