// This file is a registry of all TypeORM entities in the application.
// It imports each entity from its respective module and exports them in a 
// single array for the data source configuration.

import { BaseEntity } from './base.entity';

// Import entities from their respective modules
import { Case } from '../cases/entities/case.entity';
import { Party } from './party.entity';
import { CaseTeamMember } from '../case-teams/entities/case-team.entity';
import { CasePhase } from '../case-phases/entities/case-phase.entity';
import { Motion } from '../motions/entities/motion.entity';
import { DocketEntry } from '../docket/entities/docket-entry.entity';
import { Project } from '../projects/entities/project.entity';
import { TimeEntry } from '../billing/time-entries/entities/time-entry.entity';
import { Invoice } from '../billing/invoices/entities/invoice.entity';
import { RateTable } from '../billing/rate-tables/entities/rate-table.entity';
import { TrustTransaction } from '../billing/trust-accounts/entities/trust-transaction.entity';
import { Expense as FirmExpense } from '../billing/expenses/entities/expense.entity';
import { Document as LegalDocument } from '../documents/entities/document.entity';
import { DocumentVersion } from '../document-versions/entities/document-version.entity';
import { Clause } from '../clauses/entities/clause.entity';
import { Pleading } from '../pleadings/entities/pleading.entity';
import { DiscoveryRequest } from '../discovery/discovery-requests/entities/discovery-request.entity';
import { Deposition } from '../discovery/depositions/entities/deposition.entity';
import { ESISource } from '../discovery/esi-sources/entities/esi-source.entity';
import { LegalHold } from '../discovery/legal-holds/entities/legal-hold.entity';
import { PrivilegeLogEntry } from '../discovery/privilege-log/entities/privilege-log-entry.entity';
import { EvidenceItem } from './evidence-item.entity';
import { ChainOfCustodyEvent } from './chain-of-custody-event.entity';
import { TrialExhibit } from './trial-exhibit.entity';
import { Witness } from './witness.entity';
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';
import { Session } from './session.entity';
import { AuditLog } from './audit-log.entity';
import { ConflictCheck } from './conflict-check.entity';
import { EthicalWall } from './ethical-wall.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { Client } from './client.entity';
import { Organization } from './organization.entity';
import { LegalEntity } from './legal-entity.entity';

// Array of all entities for TypeORM configuration
export const entities = [
  BaseEntity,
  // Core Case Management
  Case,
  Party,
  CaseTeamMember,
  CasePhase,
  Motion,
  DocketEntry,
  Project,

  // Financial
  TimeEntry,
  Invoice,
  RateTable,
  TrustTransaction,
  FirmExpense,

  // Documents
  LegalDocument,
  DocumentVersion,
  Clause,
  Pleading,

  // Discovery
  DiscoveryRequest,
  Deposition,
  ESISource,
  LegalHold,
  PrivilegeLogEntry,

  // Evidence
  EvidenceItem,
  ChainOfCustodyEvent,
  TrialExhibit,
  Witness,

  // Users & Auth
  User,
  UserProfile,
  Session,

  // Compliance
  AuditLog,
  ConflictCheck,
  EthicalWall,

  // Communications
  Conversation,
  Message,
  Notification,

  // Organization
  Client,
  Organization,
  LegalEntity,
];
