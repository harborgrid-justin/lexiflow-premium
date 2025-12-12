// Base Entity
export { BaseEntity } from './base.entity';

// Core Case Management Entities
export { Case } from './case.entity';
export { Party } from './party.entity';
export { CaseTeamMember } from './case-team-member.entity';
export { CasePhase } from './case-phase.entity';
export { Motion } from './motion.entity';
export { DocketEntry } from './docket-entry.entity';
export { Project } from './project.entity';

// Financial Entities
export { TimeEntry } from './time-entry.entity';
export { Invoice } from './invoice.entity';
export { RateTable } from './rate-table.entity';
export { TrustTransaction } from './trust-transaction.entity';
export { FirmExpense } from './firm-expense.entity';

// Document Entities
export { LegalDocument } from './legal-document.entity';
export { DocumentVersion } from './document-version.entity';
export { Clause } from './clause.entity';
export { PleadingDocument } from './pleading-document.entity';

// Discovery Entities
export { DiscoveryRequest } from './discovery-request.entity';
export { Deposition } from './deposition.entity';
export { ESISource } from './esi-source.entity';
export { LegalHold } from './legal-hold.entity';
export { PrivilegeLogEntry } from './privilege-log-entry.entity';

// Evidence Entities
export { EvidenceItem } from './evidence-item.entity';
export { ChainOfCustodyEvent } from './chain-of-custody-event.entity';
export { TrialExhibit } from './trial-exhibit.entity';
export { Witness } from './witness.entity';

// Users & Auth Entities
export { User } from './user.entity';
export { UserProfile } from './user-profile.entity';
export { Session } from './session.entity';

// Compliance Entities
export { AuditLog } from './audit-log.entity';
export { ConflictCheck } from './conflict-check.entity';
export { EthicalWall } from './ethical-wall.entity';

// Communications Entities
export { Conversation } from './conversation.entity';
export { Message } from './message.entity';
export { Notification } from './notification.entity';

// Organization Entities
export { Client } from './client.entity';
export { Organization } from './organization.entity';
export { LegalEntity } from './legal-entity.entity';

// Array of all entities for TypeORM configuration
export const entities = [
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
  PleadingDocument,

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
