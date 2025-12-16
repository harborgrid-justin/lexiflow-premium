# LexiFlow Premium - Entity Relationships

**Generated:** 2025-12-16
**Architect:** EA-8
**Scope:** Complete relationship mapping
**Entities:** 70+ PostgreSQL tables

---

## Overview

This document provides a comprehensive mapping of all entity relationships in LexiFlow Premium's database schema. It covers:
- One-to-Many relationships
- Many-to-One relationships
- One-to-One relationships
- Many-to-Many relationships (via join tables)
- Foreign key constraints
- Cascade behaviors

---

## 1. Core Entity Relationships

### 1.1 User Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| User | Case | One-to-Many | leadAttorneyId | SET NULL | Cases led by attorney |
| User | Task | One-to-Many | assignedTo | SET NULL | Tasks assigned to user |
| User | Document | One-to-Many | creatorId | SET NULL | Documents created by user |
| User | TimeEntry | One-to-Many | userId | CASCADE | Time tracked by user |
| User | RefreshToken | One-to-Many | userId | CASCADE | User's refresh tokens |
| User | LoginAttempt | One-to-Many | userId | CASCADE | User's login history |
| User | ApiKey | One-to-Many | userId | CASCADE | User's API keys |
| User | Session | One-to-Many | userId | CASCADE | Active sessions |

### 1.2 Client Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Client | Case | One-to-Many | clientId | CASCADE | Cases for client |
| Client | Invoice | One-to-Many | clientId | SET NULL | Client invoices |
| Client | FeeAgreement | One-to-Many | clientId | CASCADE | Fee arrangements |
| Client | TrustAccount | One-to-Many | clientId | CASCADE | Client trust accounts |

### 1.3 Case Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Case | Task | One-to-Many | caseId | CASCADE | Case tasks |
| Case | Document | One-to-Many | caseId | CASCADE | Case documents |
| Case | DocketEntry | One-to-Many | caseId | CASCADE | Docket entries |
| Case | Party | One-to-Many | caseId | CASCADE | Case parties |
| Case | Custodian | One-to-Many | caseId | CASCADE | Discovery custodians |
| Case | LegalHold | One-to-Many | caseId | CASCADE | Legal holds |
| Case | CasePhase | One-to-Many | caseId | CASCADE | Case phases |
| Case | Pleading | One-to-Many | caseId | CASCADE | Filed pleadings |
| Case | Motion | One-to-Many | caseId | CASCADE | Filed motions |
| Case | Exhibit | One-to-Many | caseId | CASCADE | Trial exhibits |
| Case | TrialExhibit | One-to-Many | caseId | CASCADE | Admitted exhibits |
| Case | TrialEvent | One-to-Many | caseId | CASCADE | Trial calendar |
| Case | WitnessPrepSession | One-to-Many | caseId | CASCADE | Witness prep |
| Case | Witness | One-to-Many | caseId | CASCADE | Witness list |
| Case | EvidenceItem | One-to-Many | caseId | CASCADE | Evidence tracking |
| Case | DiscoveryRequest | One-to-Many | caseId | CASCADE | Discovery requests |
| Case | Deposition | One-to-Many | caseId | CASCADE | Depositions |
| Case | EsiSource | One-to-Many | caseId | CASCADE | ESI sources |
| Case | Production | One-to-Many | caseId | CASCADE | Productions |
| Case | PrivilegeLogEntry | One-to-Many | caseId | CASCADE | Privilege log |
| Case | TimeEntry | One-to-Many | caseId | CASCADE | Billable time |
| Case | Expense | One-to-Many | caseId | CASCADE | Case expenses |
| Case | Invoice | One-to-Many | caseId | CASCADE | Case invoices |
| Case | FeeAgreement | One-to-Many | caseId | CASCADE | Fee agreements |
| Case | Project | One-to-Many | caseId | CASCADE | Projects |
| Case | Risk | One-to-Many | caseId | CASCADE | Identified risks |
| Case | CaseTeam | One-to-Many | caseId | CASCADE | Team members |
| Case | WarRoom | One-to-Many | caseId | CASCADE | Strategy rooms |
| Case | CalendarEvent | One-to-Many | caseId | CASCADE | Calendar events |
| Case | Communication | One-to-Many | caseId | CASCADE | Communications |
| Case | ConflictCheck | One-to-Many | caseId | CASCADE | Conflict checks |

---

## 2. Document Management Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Document | DocumentVersion | One-to-Many | documentId | CASCADE | Version history |
| Document | ProcessingJob | One-to-Many | documentId | CASCADE | Processing queue |
| Document | OcrJob | One-to-Many | documentId | CASCADE | OCR jobs |
| Document | Pleading | One-to-One | documentId | SET NULL | Associated pleading |
| Document | Exhibit | One-to-One | documentId | SET NULL | Associated exhibit |
| Document | TrialExhibit | One-to-One | documentId | SET NULL | Trial exhibit ref |

---

## 3. Billing Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Invoice | InvoiceItem | One-to-Many | invoiceId | CASCADE | Line items |
| Invoice | TimeEntry | One-to-Many | invoiceId | SET NULL | Billed time |
| Invoice | Expense | One-to-Many | invoiceId | SET NULL | Billed expenses |
| FeeAgreement | Invoice | One-to-Many | feeAgreementId | SET NULL | Invoices under agreement |
| RateTable | TimeEntry | One-to-Many | rateTableId | SET NULL | Time entries using rate |
| TrustAccount | TrustTransaction | One-to-Many | trustAccountId | CASCADE | Trust transactions |

---

## 4. Discovery Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| LegalHold | Custodian | One-to-Many | legalHoldId | SET NULL | Custodians on hold |
| Custodian | EsiSource | One-to-Many | custodianId | SET NULL | Custodian data sources |
| Custodian | CustodianInterview | One-to-Many | custodianId | CASCADE | Interview records |
| Production | TrialExhibit | One-to-Many | productionId | SET NULL | Exhibits from production |
| EvidenceItem | ChainOfCustodyEvent | One-to-Many | evidenceItemId | CASCADE | Custody events |
| Witness | WitnessPrepSession | One-to-Many | witnessId | CASCADE | Prep sessions |

---

## 5. HR & Organization Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Employee | TimeOffRequest | One-to-Many | employeeId | CASCADE | Time-off requests |
| Organization | Case | One-to-Many | organizationId | SET NULL | Org's cases |

---

## 6. Communications Relationships

| Parent Entity | Child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Conversation | Message | One-to-Many | conversationId | CASCADE | Messages in thread |
| Template | Communication | One-to-Many | templateId | SET NULL | Comms using template |

---

## 7. Analytics Relationships

| Parent Entity | child Entity | Relationship | FK Column | Cascade | Description |
|--------------|--------------|--------------|-----------|---------|-------------|
| Dashboard | DashboardSnapshot | One-to-Many | dashboardId | CASCADE | Dashboard snapshots |
| ReportTemplate | Report | One-to-Many | templateId | CASCADE | Generated reports |
| ComplianceRule | ComplianceCheck | One-to-Many | ruleId | CASCADE | Compliance results |

---

## 8. Complete Relationship Matrix

### Alphabetical by Parent Entity

| Parent | Child | Type | FK Column | Notes |
|--------|-------|------|-----------|-------|
| ApiKey | - | - | userId | Belongs to User |
| AuditLog | - | - | userId | References User |
| CalendarEvent | - | - | caseId | Belongs to Case |
| Case | CasePhase | 1:M | caseId | |
| Case | CaseTeam | 1:M | caseId | |
| Case | Communication | 1:M | caseId | |
| Case | Custodian | 1:M | caseId | |
| Case | Deposition | 1:M | caseId | |
| Case | DiscoveryRequest | 1:M | caseId | |
| Case | DocketEntry | 1:M | caseId | |
| Case | Document | 1:M | caseId | |
| Case | EsiSource | 1:M | caseId | |
| Case | EvidenceItem | 1:M | caseId | |
| Case | Exhibit | 1:M | caseId | |
| Case | Expense | 1:M | caseId | |
| Case | FeeAgreement | 1:M | caseId | |
| Case | Invoice | 1:M | caseId | |
| Case | LegalHold | 1:M | caseId | |
| Case | Motion | 1:M | caseId | |
| Case | Party | 1:M | caseId | |
| Case | Pleading | 1:M | caseId | |
| Case | PrivilegeLogEntry | 1:M | caseId | |
| Case | Production | 1:M | caseId | |
| Case | Project | 1:M | caseId | |
| Case | Risk | 1:M | caseId | |
| Case | Task | 1:M | caseId | |
| Case | TimeEntry | 1:M | caseId | |
| Case | TrialEvent | 1:M | caseId | |
| Case | TrialExhibit | 1:M | caseId | |
| Case | WarRoom | 1:M | caseId | |
| Case | Witness | 1:M | caseId | |
| Case | WitnessPrepSession | 1:M | caseId | |
| CaseTeam | - | - | caseId, userId | Join table |
| ChainOfCustodyEvent | - | - | evidenceItemId | Belongs to Evidence |
| Citation | - | - | - | Standalone |
| Clause | - | - | - | Standalone |
| Client | Case | 1:M | clientId | |
| Client | FeeAgreement | 1:M | clientId | |
| Client | Invoice | 1:M | clientId | |
| Client | TrustAccount | 1:M | clientId | |
| Communication | - | - | caseId, templateId | |
| ComplianceCheck | - | - | ruleId | Belongs to Rule |
| ComplianceRule | ComplianceCheck | 1:M | ruleId | |
| ConflictCheck | - | - | caseId, clientId | |
| Conversation | Message | 1:M | conversationId | |
| Custodian | CustodianInterview | 1:M | custodianId | |
| Custodian | EsiSource | 1:M | custodianId | |
| CustodianInterview | - | - | custodianId | Belongs to Custodian |
| Dashboard | DashboardSnapshot | 1:M | dashboardId | |
| DashboardSnapshot | - | - | dashboardId | Belongs to Dashboard |
| Deposition | - | - | caseId | Belongs to Case |
| DiscoveryRequest | - | - | caseId | Belongs to Case |
| DocketEntry | - | - | caseId | Belongs to Case |
| Document | DocumentVersion | 1:M | documentId | |
| Document | OcrJob | 1:M | documentId | |
| Document | Pleading | 1:1 | documentId | |
| Document | ProcessingJob | 1:M | documentId | |
| DocumentVersion | - | - | documentId | Belongs to Document |
| Employee | TimeOffRequest | 1:M | employeeId | |
| EsiSource | - | - | caseId, custodianId | |
| EvidenceItem | ChainOfCustodyEvent | 1:M | evidenceItemId | |
| Exhibit | - | - | caseId, documentId | |
| Expense | - | - | caseId, invoiceId | |
| FeeAgreement | Invoice | 1:M | feeAgreementId | |
| Integration | - | - | - | Standalone |
| Invoice | InvoiceItem | 1:M | invoiceId | |
| Invoice | TimeEntry | 1:M | invoiceId | |
| InvoiceItem | - | - | invoiceId | Belongs to Invoice |
| KnowledgeArticle | - | - | - | Standalone |
| LegalHold | Custodian | 1:M | legalHoldId | |
| LoginAttempt | - | - | userId | Belongs to User |
| Message | - | - | conversationId | Belongs to Conversation |
| Messenger | - | - | fromUserId, toUserId | |
| Motion | - | - | caseId | Belongs to Case |
| Notification | - | - | userId | Belongs to User |
| OcrJob | - | - | documentId | Belongs to Document |
| Organization | Case | 1:M | organizationId | |
| Party | - | - | caseId | Belongs to Case |
| Pleading | - | - | caseId, documentId | |
| PrivilegeLogEntry | - | - | caseId | Belongs to Case |
| ProcessingJob | - | - | documentId | Belongs to Document |
| Production | TrialExhibit | 1:M | productionId | |
| Project | - | - | caseId | Belongs to Case |
| RateTable | TimeEntry | 1:M | rateTableId | |
| RefreshToken | - | - | userId | Belongs to User |
| Report | - | - | templateId | Belongs to Template |
| ReportTemplate | Report | 1:M | templateId | |
| Risk | - | - | caseId | Belongs to Case |
| SearchIndex | - | - | - | Derived data |
| SearchQuery | - | - | userId | Belongs to User |
| Session | - | - | userId | Belongs to User |
| Task | - | - | caseId, assignedTo, parentTaskId | |
| Template | Communication | 1:M | templateId | |
| TimeEntry | - | - | caseId, userId, invoiceId, rateTableId | |
| TimeOffRequest | - | - | employeeId | Belongs to Employee |
| TrialEvent | - | - | caseId | Belongs to Case |
| TrialExhibit | - | - | caseId, productionId | |
| TrustAccount | TrustTransaction | 1:M | trustAccountId | |
| TrustTransaction | - | - | trustAccountId | Belongs to TrustAccount |
| User | ApiKey | 1:M | userId | |
| User | Case | 1:M | leadAttorneyId | Lead attorney |
| User | Document | 1:M | creatorId | Creator |
| User | LoginAttempt | 1:M | userId | |
| User | RefreshToken | 1:M | userId | |
| User | Session | 1:M | userId | |
| User | Task | 1:M | assignedTo | Assignee |
| User | TimeEntry | 1:M | userId | |
| WarRoom | - | - | caseId | Belongs to Case |
| Witness | WitnessPrepSession | 1:M | witnessId | |
| WitnessPrepSession | - | - | caseId, witnessId | |
| WorkflowTemplate | - | - | - | Standalone |

**Legend:**
- 1:M = One-to-Many
- 1:1 = One-to-One
- M:M = Many-to-Many (via join table)

---

## 9. Cascade Behavior Summary

### CASCADE Deletions

When parent is deleted, child records are also deleted:

| Parent | Children (Cascaded) |
|--------|---------------------|
| User | TimeEntry, RefreshToken, LoginAttempt, ApiKey, Session |
| Client | Case, FeeAgreement, TrustAccount |
| Case | Task, Document, DocketEntry, Party, Custodian, LegalHold, CasePhase, Pleading, Motion, Exhibit, TrialExhibit, TrialEvent, WitnessPrepSession, Witness, EvidenceItem, DiscoveryRequest, Deposition, EsiSource, Production, PrivilegeLogEntry, TimeEntry, Expense, Invoice, Project, Risk, CaseTeam, WarRoom, CalendarEvent, Communication, ConflictCheck |
| Document | DocumentVersion, ProcessingJob, OcrJob |
| Invoice | InvoiceItem |
| TrustAccount | TrustTransaction |
| EvidenceItem | ChainOfCustodyEvent |
| Custodian | CustodianInterview |
| Witness | WitnessPrepSession |
| Conversation | Message |
| Dashboard | DashboardSnapshot |
| ReportTemplate | Report |
| ComplianceRule | ComplianceCheck |

### SET NULL Deletions

When parent is deleted, FK in child is set to null:

| Parent | Children (FK Set to NULL) |
|--------|---------------------------|
| User (as creator) | Document.creatorId |
| User (as lead attorney) | Case.leadAttorneyId |
| User (as assignee) | Task.assignedTo |
| Client | Invoice.clientId (optional) |
| Document | Pleading.documentId, Exhibit.documentId |
| FeeAgreement | Invoice.feeAgreementId |
| RateTable | TimeEntry.rateTableId |
| Invoice | TimeEntry.invoiceId, Expense.invoiceId |
| LegalHold | Custodian.legalHoldId |
| Custodian | EsiSource.custodianId |
| Production | TrialExhibit.productionId |
| Template | Communication.templateId |

---

## 10. Join Table Patterns

### Case Team (Many-to-Many)

```typescript
@Entity('case_team_members')
class CaseTeam {
  caseId: string;  // FK to Case
  userId: string;  // FK to User
  role: string;    // Lead, Associate, etc.
  assignedDate: Date;
  isActive: boolean;
}
```

**Relationship:**
- Case ←→ CaseTeam ←→ User

### Custodian-ESI Source (Many-to-Many)

```typescript
@Entity('esi_sources')
class EsiSource {
  caseId: string;       // FK to Case
  custodianId: string;  // FK to Custodian
  sourceName: string;
  type: string;
}
```

**Relationship:**
- Custodian ←→ EsiSource ←→ Case

---

## 11. Soft Delete Relationships

Entities with soft delete (deletedAt column):

| Entity | Soft Delete | Handling |
|--------|-------------|----------|
| Case | ✓ | Filter WHERE deletedAt IS NULL |
| Document | ✗ | Hard delete |
| Party | ✓ | Filter WHERE deletedAt IS NULL |
| Custodian | ✓ | Filter WHERE deletedAt IS NULL |
| LegalHold | ✓ | Filter WHERE deletedAt IS NULL |
| TimeEntry | ✓ | Filter WHERE deletedAt IS NULL |
| Invoice | ✓ | Filter WHERE deletedAt IS NULL |

**Query Pattern:**
```typescript
const cases = await caseRepo.find({
  where: { deletedAt: IsNull() }
});
```

---

## 12. Circular Dependencies

### Potential Circular References

| Entity A | Entity B | Via | Resolution |
|----------|----------|-----|-----------|
| Task | Task | parentTaskId | Self-reference, OK |
| Case | Document | caseId | One-way, OK |
| Document | Pleading | documentId | One-way, OK |

**No problematic circular dependencies detected.**

---

## 13. Orphaned Record Prevention

### Strategies

1. **Cascade Deletes**: Automatically remove children
2. **SET NULL**: Preserve children but remove reference
3. **Prevent Delete**: Check for children before delete
4. **Soft Delete**: Mark as deleted but preserve

### Example: Preventing Case Deletion with Active Tasks

```typescript
async deleteCase(caseId: string) {
  const activeTasks = await taskRepo.count({
    where: {
      caseId,
      status: Not(In(['completed', 'cancelled']))
    }
  });

  if (activeTasks > 0) {
    throw new Error('Cannot delete case with active tasks');
  }

  await caseRepo.softDelete(caseId);
}
```

---

## 14. Referential Integrity Checks

### Database Constraints

All foreign keys have database-level constraints:

```sql
-- Example: Cases table
ALTER TABLE cases
  ADD CONSTRAINT fk_cases_clientId
  FOREIGN KEY (clientId)
  REFERENCES clients(id)
  ON DELETE CASCADE;

-- Example: Documents table
ALTER TABLE documents
  ADD CONSTRAINT fk_documents_caseId
  FOREIGN KEY (caseId)
  REFERENCES cases(id)
  ON DELETE CASCADE;

ALTER TABLE documents
  ADD CONSTRAINT fk_documents_creatorId
  FOREIGN KEY (creatorId)
  REFERENCES users(id)
  ON DELETE SET NULL;
```

### Application-Level Checks

```typescript
// Before creating document
const caseExists = await caseRepo.exist({ where: { id: caseId } });
if (!caseExists) {
  throw new NotFoundException('Case not found');
}
```

---

## 15. Relationship Query Patterns

### Eager Loading

```typescript
// Load case with all relations
const case = await caseRepo.findOne({
  where: { id: caseId },
  relations: [
    'client',
    'parties',
    'documents',
    'tasks',
    'legalHolds'
  ]
});
```

### Lazy Loading

```typescript
// Load relations on demand
const case = await caseRepo.findOne({ where: { id: caseId } });
const parties = await partyRepo.find({ where: { caseId: case.id } });
```

### Query Builder

```typescript
// Complex query with joins
const cases = await caseRepo
  .createQueryBuilder('case')
  .leftJoinAndSelect('case.client', 'client')
  .leftJoinAndSelect('case.parties', 'party')
  .where('case.status = :status', { status: 'Active' })
  .andWhere('client.status = :clientStatus', { clientStatus: 'Active' })
  .getMany();
```

---

## 16. Relationship Cardinality Summary

| Cardinality | Count | Examples |
|-------------|-------|----------|
| One-to-Many | ~150 | Case→Task, Client→Case, User→TimeEntry |
| Many-to-One | ~150 | Task→Case, Case→Client, TimeEntry→User |
| One-to-One | ~5 | Document→Pleading, Document→Exhibit |
| Many-to-Many | ~3 | Case↔User (via CaseTeam), Custodian↔EsiSource |

---

## 17. Relationship Validation Rules

### Business Rules

| Relationship | Rule | Enforcement |
|--------------|------|-------------|
| Case→Client | Client must be Active | Application |
| TimeEntry→Case | Case cannot be Closed | Application |
| Invoice→TimeEntry | Time must be Approved | Application |
| LegalHold→Custodian | Custodian must be notified | Application |
| Document→Case | Case must exist | Database FK |
| Task→Task (parent) | No circular references | Application |

### Example Validation

```typescript
// Validate time entry against case status
async createTimeEntry(dto: CreateTimeEntryDto, userId: string) {
  const case = await caseRepo.findOne({ where: { id: dto.caseId } });

  if (case.status === CaseStatus.CLOSED) {
    throw new BadRequestException('Cannot add time to closed case');
  }

  // Proceed with creation
}
```

---

## 18. Relationship Indexing Strategy

### Indexed Foreign Keys

All foreign keys are indexed for performance:

```typescript
@Entity()
class TimeEntry {
  @Column()
  @Index()  // ← Indexed for fast lookups
  caseId: string;

  @Column()
  @Index()  // ← Indexed for fast lookups
  userId: string;
}
```

### Composite Indexes

```typescript
@Entity()
@Index(['caseId', 'status'])  // ← Compound index
class Task {
  @Column()
  caseId: string;

  @Column()
  status: string;
}
```

**Query Optimization:**
```typescript
// This query uses the compound index
const activeTasks = await taskRepo.find({
  where: {
    caseId: 'case-123',
    status: 'active'
  }
});
```

---

## 19. Relationship Migration Example

### Adding a New Relationship

```typescript
// Migration file: 1234567890-add-case-phase-relation.ts
export class AddCasePhaseRelation1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key column
    await queryRunner.addColumn('case_phases', new TableColumn({
      name: 'caseId',
      type: 'uuid',
      isNullable: false
    }));

    // Create index
    await queryRunner.createIndex('case_phases', new TableIndex({
      name: 'IDX_case_phases_caseId',
      columnNames: ['caseId']
    }));

    // Add foreign key constraint
    await queryRunner.createForeignKey('case_phases', new TableForeignKey({
      name: 'FK_case_phases_caseId',
      columnNames: ['caseId'],
      referencedTableName: 'cases',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE'
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('case_phases', 'FK_case_phases_caseId');
    await queryRunner.dropIndex('case_phases', 'IDX_case_phases_caseId');
    await queryRunner.dropColumn('case_phases', 'caseId');
  }
}
```

---

## 20. Relationship Best Practices

### Do's

1. ✓ Always define foreign key constraints in database
2. ✓ Index all foreign key columns
3. ✓ Use appropriate cascade behavior
4. ✓ Validate relationships in application layer
5. ✓ Use soft deletes for important entities
6. ✓ Document all relationships
7. ✓ Use TypeORM decorators consistently
8. ✓ Test cascade deletions thoroughly

### Don'ts

1. ✗ Don't create circular dependencies
2. ✗ Don't forget to handle orphaned records
3. ✗ Don't use CASCADE without consideration
4. ✗ Don't mix hard and soft deletes carelessly
5. ✗ Don't skip foreign key indexes
6. ✗ Don't allow NULL in required relationships
7. ✗ Don't create redundant relationships
8. ✗ Don't skip referential integrity checks

---

## 21. Troubleshooting Relationship Issues

### Common Problems

| Problem | Cause | Solution |
|---------|-------|----------|
| FK constraint violation | Parent doesn't exist | Check existence before insert |
| Cascade delete too aggressive | Wrong cascade setting | Use SET NULL instead |
| Orphaned records | Missing cascade | Add CASCADE or clean up manually |
| Slow queries | Missing indexes | Add index on FK columns |
| Circular reference | Bad design | Restructure relationships |
| Unable to delete | FK constraint | Check for dependent records |

### Debugging Queries

```typescript
// Log all queries
TypeORM.createConnection({
  ...config,
  logging: ['query', 'error']
});

// Check relationship loading
console.log('Case relations:', caseRepo.metadata.relations);

// Validate FK exists
const exists = await caseRepo.exist({ where: { id: caseId } });
```

---

## End of Entity Relationships Documentation
