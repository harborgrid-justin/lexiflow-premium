import { Module } from '@nestjs/common';
import { CaseLoader } from './case.loader';
import { UserLoader } from './user.loader';
import { DocumentLoader } from './document.loader';
import { ClientLoader } from './client.loader';
import { BillingLoader } from './billing.loader';
import { ComplianceLoader } from './compliance.loader';
import { DiscoveryLoader } from './discovery.loader';
import { PartyLoader } from './party.loader';
import { MotionLoader } from './motion.loader';
import { DocketLoader } from './docket.loader';

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
 * - PartyLoader: Batch load parties and party contacts
 * - MotionLoader: Batch load motions and motion hearings
 * - DocketLoader: Batch load docket entries and related documents
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
    PartyLoader,
    MotionLoader,
    DocketLoader,
  ],
  exports: [
    CaseLoader,
    UserLoader,
    DocumentLoader,
    ClientLoader,
    BillingLoader,
    ComplianceLoader,
    DiscoveryLoader,
    PartyLoader,
    MotionLoader,
    DocketLoader,
  ],
})
export class DataLoaderModule {}
