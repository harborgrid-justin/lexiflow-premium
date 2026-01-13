# @lexiflow/shared-types Quick Reference

## Installation

```bash
# From root directory
npm install
npm run build:types
```

## Import Syntax

```typescript
// Import specific types
import { Case, CaseStatus, CaseType } from '@lexiflow/shared-types';

// Import multiple types
import {
  Document,
  DocumentStatus,
  DocumentType,
  PaginatedResponse,
  ApiResponse
} from '@lexiflow/shared-types';

// Import everything (not recommended)
import * as SharedTypes from '@lexiflow/shared-types';
```

## Common Entities

```typescript
import {
  BaseEntity,        // Base interface with common fields
  Case,              // Case entity
  CaseSummary,       // Minimal case info
  CaseStats,         // Case statistics
  Document,          // Document entity
  DocumentSummary,   // Minimal document info
  DocumentVersion,   // Document version info
  User,              // User entity
  UserProfile,       // User display profile
  UserSummary        // User summary
} from '@lexiflow/shared-types';
```

## Branded ID Types

```typescript
import {
  UUID,
  CaseId,
  UserId,
  DocumentId,
  ClientId,
  InvoiceId,
  PartyId,
  MotionId,
  DocketId,
  EvidenceId,
  TaskId,
  EntityId,
  ProjectId,
  WorkflowTemplateId
} from '@lexiflow/shared-types';
```

## Case Enums

```typescript
import {
  CaseStatus,      // Open, Active, Discovery, Trial, Settled, Closed, Archived, On Hold
  CaseType,        // Civil, Criminal, Family, Bankruptcy, etc.
  MatterType,      // Litigation, M&A, IP, Real Estate, etc.
  BillingModel     // Hourly, Fixed, Contingency, Hybrid
} from '@lexiflow/shared-types';
```

## Document Enums

```typescript
import {
  DocumentStatus,        // draft, under_review, approved, filed, archived
  DocumentType,          // Motion, Brief, Complaint, Answer, etc.
  DocumentAccessLevel,   // public, internal, confidential, privileged, attorney_work_product
  OcrStatus             // Pending, Processing, Completed, Failed
} from '@lexiflow/shared-types';
```

## User Enums

```typescript
import {
  UserRole,    // super_admin, admin, partner, attorney, paralegal, staff, client, guest
  UserStatus   // active, inactive, suspended, pending
} from '@lexiflow/shared-types';
```

## Discovery Enums

```typescript
import {
  DiscoveryType,              // Production, Interrogatory, Admission, Deposition
  DiscoveryStatus,            // Draft, Served, Responded, Overdue, Closed
  DiscoveryRequestStatus,     // Served, Pending, Responded, Overdue
  ESICollectionStatus,        // Pending, Collecting, Collected, Processing, etc.
  LegalHoldStatus,            // Pending, Acknowledged, Reminder Sent, Released
  PrivilegeBasis,             // Attorney-Client, Work Product, Joint Defense, etc.
  ConferralResult,            // Agreed, Impasse, Partial Agreement, Pending
  ConferralMethod             // Email, Phone, In-Person, Video Conference
} from '@lexiflow/shared-types';
```

## Billing Enums

```typescript
import {
  InvoiceStatus,          // Draft, Pending, Sent, Partial, Paid, Overdue, etc.
  PaymentStatus,          // Pending, Processing, Completed, Failed, Refunded
  WIPStatus,              // Unbilled, Ready to Bill, Billed, Written Off
  ExpenseStatus,          // Draft, Submitted, Approved, Rejected, Billed, Reimbursed
  TrustAccountStatus,     // Active, Inactive, Suspended, Closed
  CurrencyCode            // USD, EUR, GBP, CAD
} from '@lexiflow/shared-types';
```

## Litigation Enums

```typescript
import {
  MotionType,        // Dismiss, Summary Judgment, Compel Discovery, etc.
  MotionStatus,      // Draft, Filed, Opposition Served, Decided, etc.
  MotionOutcome,     // Granted, Denied, Withdrawn, Moot
  DocketEntryType,   // Filing, Order, Notice, Minute Entry, etc.
  ExhibitStatus,     // Marked, Offered, Admitted, Excluded, Withdrawn
  ExhibitParty,      // Plaintiff, Defense, Joint, Court
  ServiceStatus,     // Draft, Out for Service, Attempted, Served, etc.
  ServiceMethod      // Process Server, Mail, Personal, Electronic
} from '@lexiflow/shared-types';
```

## Evidence Enums

```typescript
import {
  EvidenceType,          // Physical, Digital, Document, Testimony, Forensic
  AdmissibilityStatus,   // Admissible, Challenged, Inadmissible, Pending
  CustodyActionType      // Initial Collection, Transfer to Storage, etc.
} from '@lexiflow/shared-types';
```

## Communication Enums

```typescript
import {
  CommunicationType,      // Letter, Email, Fax, Notice, Memo
  CommunicationDirection, // Inbound, Outbound
  CommunicationStatus     // draft, sent, delivered, failed, pending
} from '@lexiflow/shared-types';
```

## Common Enums

```typescript
import {
  TaskStatus,            // Pending, In Progress, Review, Done, Completed, etc.
  StageStatus,           // Pending, Active, Completed
  TaskDependencyType,    // FinishToStart, StartToStart, etc.
  OrganizationType,      // LawFirm, Corporate, Government, Court, Vendor
  EntityType,            // Individual, Corporation, Court, Government, etc.
  EntityRole,            // Client, Opposing Counsel, Judge, Expert, etc.
  RiskCategory,          // Legal, Financial, Reputational, Operational, Strategic
  RiskLevel,             // Low, Medium, High, Critical
  RiskStatus,            // Identified, Mitigated, Accepted, Closed
  LegalRuleType,         // FRE, FRCP, FRAP, Local, State
  NavCategory            // Main, Case Work, Litigation Tools, Operations, etc.
} from '@lexiflow/shared-types';
```

## DTOs

### Pagination

```typescript
import {
  PaginatedResponse,    // Standard paginated response
  PaginationParams,     // Query parameters for pagination
  FilterParams,         // Filter parameters
  QueryParams           // Combined pagination + filters
} from '@lexiflow/shared-types';

// Usage
const response: PaginatedResponse<Case> = {
  data: cases,
  total: 100,
  page: 1,
  limit: 20,
  totalPages: 5,
  hasNextPage: true,
  hasPreviousPage: false
};
```

### API Response

```typescript
import {
  ApiResponse,            // Standard API response wrapper
  ApiError,               // Error structure
  ResponseMeta,           // Response metadata
  SuccessResponse,        // Success response type
  ErrorResponse,          // Error response type
  BatchOperationResult,   // Batch operation result
  BatchOperationError     // Batch operation error
} from '@lexiflow/shared-types';

// Usage
const response: ApiResponse<Case[]> = {
  success: true,
  data: cases,
  timestamp: new Date().toISOString()
};
```

## Authentication Interfaces

```typescript
import {
  LoginCredentials,              // Login request
  LoginResponse,                 // Login response
  AuthenticatedUser,             // Authenticated user info
  JwtPayload,                    // JWT token payload
  RefreshTokenRequest,           // Refresh token request
  TwoFactorSetupResponse,        // 2FA setup response
  TwoFactorVerificationRequest,  // 2FA verification
  PasswordResetRequest,          // Password reset request
  PasswordResetConfirmation,     // Password reset confirmation
  ChangePasswordRequest,         // Change password request
  SessionInfo                    // Session information
} from '@lexiflow/shared-types';
```

## Frontend Usage

### Component

```typescript
import React, { useState } from 'react';
import { Case, CaseStatus } from '@lexiflow/shared-types';

const CaseList: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filter, setFilter] = useState<CaseStatus>(CaseStatus.OPEN);

  // ... component logic
};
```

### Service

```typescript
import { Case, CaseStatus, PaginatedResponse } from '@lexiflow/shared-types';

export class CaseService {
  async getCases(status?: CaseStatus): Promise<PaginatedResponse<Case>> {
    // ... service logic
  }
}
```

## Backend Usage

### TypeORM Entity

```typescript
import { Entity, Column } from 'typeorm';
import { CaseStatus, CaseType } from '@lexiflow/shared-types';

@Entity('cases')
export class Case {
  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.OPEN
  })
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: CaseType,
    default: CaseType.CIVIL
  })
  type: CaseType;
}
```

### Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { CaseStatus, PaginatedResponse, Case } from '@lexiflow/shared-types';

@Controller('cases')
export class CasesController {
  @Get()
  async findAll(
    @Query('status') status: CaseStatus
  ): Promise<PaginatedResponse<Case>> {
    // ... controller logic
  }
}
```

### DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CaseStatus } from '@lexiflow/shared-types';

export class CreateCaseDto {
  @ApiProperty({ enum: CaseStatus })
  @IsEnum(CaseStatus)
  status: CaseStatus;
}
```

## Date Handling

```typescript
// Shared types use strings (for JSON serialization)
interface BaseEntity {
  createdAt: string;  // ISO 8601: "2024-01-15T10:30:00.000Z"
}

// Backend TypeORM uses Date objects
@CreateDateColumn()
createdAt: Date;  // Automatically converted to ISO string in API responses

// Frontend uses strings
const case: Case = {
  createdAt: "2024-01-15T10:30:00.000Z"
};
```

## Build Commands

```bash
# Build shared types
npm run build:types

# Build everything (types + frontend + backend)
npm run build

# Watch mode (auto-rebuild on changes)
cd packages/shared-types && npm run watch
```

## Common Patterns

### Type Guard

```typescript
import { CaseStatus } from '@lexiflow/shared-types';

function isCaseStatus(value: string): value is CaseStatus {
  return Object.values(CaseStatus).includes(value as CaseStatus);
}
```

### Enum to Array

```typescript
import { CaseStatus } from '@lexiflow/shared-types';

const caseStatuses = Object.values(CaseStatus);
// ['Open', 'Active', 'Discovery', 'Trial', ...]
```

### Default Values

```typescript
import { CaseStatus, DocumentStatus } from '@lexiflow/shared-types';

const defaultCaseStatus = CaseStatus.OPEN;
const defaultDocumentStatus = DocumentStatus.DRAFT;
```

## Troubleshooting

### Error: Cannot find module '@lexiflow/shared-types'

```bash
# Solution: Build the package first
npm run build:types
```

### Error: Enum values don't match database

```sql
-- Update database enum values to match shared types
ALTER TYPE case_status RENAME VALUE 'open' TO 'Open';
```

### Type Compatibility Issues

```typescript
// TypeORM entities use Date, shared types use string
// This is expected! class-transformer handles conversion automatically

// Entity (Date)
@CreateDateColumn()
createdAt: Date;

// API Response (string via class-transformer)
{
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## Version

Current version: **1.0.0**

## Documentation

- Full documentation: `packages/shared-types/README.md`
- Migration guide: `MIGRATION-GUIDE-SHARED-TYPES.md`
- Implementation summary: `SHARED-TYPES-IMPLEMENTATION-SUMMARY.md`
