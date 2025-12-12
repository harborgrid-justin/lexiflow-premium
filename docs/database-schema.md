# LexiFlow Database Schema Documentation

**Version**: 1.0.0
**Last Updated**: December 12, 2025
**Database**: PostgreSQL 15
**ORM**: TypeORM
**Total Entities**: 76 entities across 37+ tables

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Entities](#core-entities)
4. [Case Management Entities](#case-management-entities)
5. [Document Management Entities](#document-management-entities)
6. [Billing & Financial Entities](#billing--financial-entities)
7. [Discovery & Evidence Entities](#discovery--evidence-entities)
8. [Compliance & Audit Entities](#compliance--audit-entities)
9. [Communication Entities](#communication-entities)
10. [Integration Entities](#integration-entities)
11. [Indexes & Performance](#indexes--performance)
12. [Migrations](#migrations)
13. [Seed Data](#seed-data)

---

## Overview

The LexiFlow database schema is designed to support enterprise-grade legal practice management with:

- **ACID Compliance**: Full transactional support
- **Referential Integrity**: Foreign key constraints
- **Full-Text Search**: PostgreSQL full-text indexes
- **Audit Trail**: Comprehensive change tracking
- **Soft Deletes**: Soft delete support with deleted_at timestamps
- **Timestamps**: created_at, updated_at on all entities
- **User Tracking**: created_by, updated_by on most entities

### Database Statistics

| Metric | Count |
|--------|-------|
| **Total Tables** | 37+ |
| **Total Entities** | 76 |
| **Foreign Keys** | 30+ |
| **Indexes** | 50+ |
| **Full-Text Indexes** | 4 |
| **Enum Types** | 20+ |

---

## Entity Relationship Diagram

### High-Level Architecture

```
┌─────────────────┐
│   Users         │
│   Organizations │
└────────┬────────┘
         │
         ├─────────────────┬──────────────────┬─────────────────┐
         │                 │                  │                 │
    ┌────▼─────┐     ┌────▼─────┐      ┌────▼─────┐     ┌────▼─────┐
    │  Cases   │     │Documents │      │Billing   │     │Compliance│
    └────┬─────┘     └────┬─────┘      └────┬─────┘     └────┬─────┘
         │                │                  │                 │
    ┌────┴──────┬─────────┼──────────┬───────┴───┬─────────────┴───┐
    │           │         │          │           │                 │
┌───▼───┐  ┌───▼───┐ ┌───▼───┐  ┌───▼───┐  ┌───▼───┐      ┌────▼────┐
│Parties│  │Motions│ │Versions│  │Invoices│  │Audit  │      │Conflicts│
│Teams  │  │Docket │ │Clauses │  │Time    │  │Logs   │      │Ethical  │
│Phases │  │       │ │Templates│  │Trust   │  │       │      │Walls    │
└───────┘  └───────┘ └─────────┘  └────────┘  └───────┘      └─────────┘
```

---

## Core Entities

### Users

**Table**: `users`
**Entity**: `User`

**Purpose**: User accounts and authentication

**Columns**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  avatar VARCHAR(500),
  role VARCHAR(50) NOT NULL, -- SUPER_ADMIN, ADMIN, ATTORNEY, PARALEGAL, etc.
  status VARCHAR(50) NOT NULL, -- ACTIVE, INACTIVE, SUSPENDED
  organization_id UUID REFERENCES organizations(id),
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login_at TIMESTAMP,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ft ON users USING GIN(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));
```

**Relationships**:
- Many-to-One: organization → Organizations
- One-to-Many: cases → Cases (created_by)
- One-to-Many: documents → Documents (uploaded_by)
- One-to-Many: timeEntries → TimeEntries

---

### Organizations

**Table**: `organizations`
**Entity**: `Organization`

**Purpose**: Law firms and organizations

**Columns**:
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- LAW_FIRM, CORPORATE, GOVERNMENT
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  tax_id VARCHAR(50),
  bar_number VARCHAR(100),
  license_state VARCHAR(50),
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_organizations_name ON organizations(name);
```

**Relationships**:
- One-to-Many: users → Users
- One-to-Many: cases → Cases

---

### Clients

**Table**: `clients`
**Entity**: `Client`

**Purpose**: Client information

**Columns**:
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- INDIVIDUAL, CORPORATE
  email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50),
  company_name VARCHAR(255),
  tax_id VARCHAR(50),
  billing_address TEXT,
  billing_contact VARCHAR(255),
  status VARCHAR(50), -- ACTIVE, INACTIVE
  notes TEXT,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_organization ON clients(organization_id);
CREATE INDEX idx_clients_ft ON clients USING GIN(to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company_name, '')));
```

**Relationships**:
- Many-to-One: organization → Organizations
- One-to-Many: cases → Cases

---

## Case Management Entities

### Cases

**Table**: `cases`
**Entity**: `Case`

**Purpose**: Legal cases and matters

**Columns**:
```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  case_type VARCHAR(100) NOT NULL, -- CIVIL_LITIGATION, CRIMINAL, FAMILY_LAW, etc.
  practice_area VARCHAR(100), -- COMMERCIAL, PERSONAL_INJURY, etc.
  status VARCHAR(50) NOT NULL, -- ACTIVE, PENDING, IN_TRIAL, SETTLED, CLOSED
  priority VARCHAR(50), -- LOW, MEDIUM, HIGH, URGENT
  client_id UUID REFERENCES clients(id),
  organization_id UUID REFERENCES organizations(id),
  opposing_counsel VARCHAR(255),
  court_name VARCHAR(255),
  judge_name VARCHAR(255),
  docket_number VARCHAR(100),
  filing_date DATE,
  opened_date DATE NOT NULL,
  closed_date DATE,
  statute_of_limitations DATE,
  estimated_value DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  billing_type VARCHAR(50), -- HOURLY, FLAT_FEE, CONTINGENCY
  notes TEXT,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_client ON cases(client_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_type ON cases(case_type);
CREATE INDEX idx_cases_organization ON cases(organization_id);
CREATE INDEX idx_cases_ft ON cases USING GIN(to_tsvector('english', case_number || ' ' || title || ' ' || COALESCE(description, '')));
```

**Relationships**:
- Many-to-One: client → Clients
- Many-to-One: organization → Organizations
- One-to-Many: documents → Documents
- One-to-Many: parties → Parties
- One-to-Many: team → CaseTeamMembers
- One-to-Many: phases → CasePhases
- One-to-Many: timeEntries → TimeEntries
- One-to-Many: invoices → Invoices

---

### CaseTeamMembers

**Table**: `case_team_members`
**Entity**: `CaseTeamMember`

**Purpose**: Case team assignments

**Columns**:
```sql
CREATE TABLE case_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(100), -- LEAD_ATTORNEY, ASSOCIATE, PARALEGAL, etc.
  permissions TEXT[], -- READ, WRITE, DELETE
  hourly_rate DECIMAL(10, 2),
  assigned_date DATE NOT NULL,
  removed_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_team_case ON case_team_members(case_id);
CREATE INDEX idx_case_team_user ON case_team_members(user_id);
CREATE UNIQUE INDEX idx_case_team_unique ON case_team_members(case_id, user_id) WHERE is_active = true;
```

---

### CasePhases

**Table**: `case_phases`
**Entity**: `CasePhase`

**Purpose**: Case phase tracking (Pre-Trial, Discovery, Trial, etc.)

**Columns**:
```sql
CREATE TABLE case_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  phase_name VARCHAR(100) NOT NULL, -- PRE_TRIAL, DISCOVERY, MEDIATION, TRIAL, APPEAL
  status VARCHAR(50), -- NOT_STARTED, IN_PROGRESS, COMPLETED
  start_date DATE,
  end_date DATE,
  estimated_duration_days INT,
  actual_duration_days INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_phases_case ON case_phases(case_id);
```

---

### Parties

**Table**: `parties`
**Entity**: `Party`

**Purpose**: Case parties (plaintiffs, defendants, witnesses)

**Columns**:
```sql
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  party_type VARCHAR(50) NOT NULL, -- PLAINTIFF, DEFENDANT, WITNESS, EXPERT
  name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50), -- INDIVIDUAL, CORPORATION, GOVERNMENT
  contact_info TEXT,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  address TEXT,
  represented_by VARCHAR(255), -- Attorney name
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_parties_case ON parties(case_id);
CREATE INDEX idx_parties_type ON parties(party_type);
```

---

### Motions

**Table**: `motions`
**Entity**: `Motion`

**Purpose**: Court motions

**Columns**:
```sql
CREATE TABLE motions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  motion_type VARCHAR(100) NOT NULL, -- MOTION_TO_DISMISS, SUMMARY_JUDGMENT, etc.
  title VARCHAR(500) NOT NULL,
  description TEXT,
  filing_date DATE NOT NULL,
  hearing_date DATE,
  decision_date DATE,
  status VARCHAR(50), -- FILED, PENDING, GRANTED, DENIED
  ruling TEXT,
  filed_by_party_id UUID REFERENCES parties(id),
  document_id UUID REFERENCES legal_documents(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_motions_case ON motions(case_id);
CREATE INDEX idx_motions_status ON motions(status);
```

---

### Pleadings

**Table**: `pleadings`
**Entity**: `Pleading`

**Purpose**: Legal pleadings

**Columns**:
```sql
CREATE TABLE pleadings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  pleading_type VARCHAR(100) NOT NULL, -- COMPLAINT, ANSWER, CROSS_CLAIM, etc.
  title VARCHAR(500) NOT NULL,
  filing_date DATE NOT NULL,
  served_date DATE,
  filed_by_party_id UUID REFERENCES parties(id),
  served_on_party_id UUID REFERENCES parties(id),
  document_id UUID REFERENCES legal_documents(id),
  status VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pleadings_case ON pleadings(case_id);
```

---

### DocketEntries

**Table**: `docket_entries`
**Entity**: `DocketEntry`

**Purpose**: Docket/calendar entries

**Columns**:
```sql
CREATE TABLE docket_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  entry_type VARCHAR(50) NOT NULL, -- HEARING, DEADLINE, FILING, CONFERENCE
  title VARCHAR(500) NOT NULL,
  description TEXT,
  entry_date DATE NOT NULL,
  entry_time TIME,
  location VARCHAR(255),
  judge VARCHAR(255),
  participants TEXT,
  reminder_date TIMESTAMP,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_docket_case ON docket_entries(case_id);
CREATE INDEX idx_docket_date ON docket_entries(entry_date);
CREATE INDEX idx_docket_type ON docket_entries(entry_type);
```

---

## Document Management Entities

### LegalDocuments

**Table**: `legal_documents`
**Entity**: `LegalDocument`

**Purpose**: Document metadata

**Columns**:
```sql
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_type VARCHAR(50) NOT NULL, -- PDF, DOCX, XLSX, etc.
  file_size BIGINT, -- bytes
  file_path VARCHAR(1000) NOT NULL,
  thumbnail_path VARCHAR(1000),
  mime_type VARCHAR(100),
  original_filename VARCHAR(500),
  document_category VARCHAR(100), -- PLEADING, EVIDENCE, CORRESPONDENCE, etc.
  confidential BOOLEAN DEFAULT false,
  page_count INT,
  word_count INT,
  language VARCHAR(10),
  tags TEXT[],
  metadata JSONB,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_documents_case ON legal_documents(case_id);
CREATE INDEX idx_documents_uploaded_by ON legal_documents(uploaded_by);
CREATE INDEX idx_documents_file_type ON legal_documents(file_type);
CREATE INDEX idx_documents_category ON legal_documents(document_category);
CREATE INDEX idx_documents_tags ON legal_documents USING GIN(tags);
CREATE INDEX idx_documents_ft ON legal_documents USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

**Relationships**:
- Many-to-One: case → Cases
- Many-to-One: uploadedBy → Users
- One-to-Many: versions → DocumentVersions
- One-to-One: ocrResult → OCRResults

---

### DocumentVersions

**Table**: `document_versions`
**Entity**: `DocumentVersion`

**Purpose**: Document version history

**Columns**:
```sql
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT,
  change_description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doc_versions_document ON document_versions(document_id);
CREATE UNIQUE INDEX idx_doc_versions_unique ON document_versions(document_id, version_number);
```

---

### DocumentVersionChanges

**Table**: `document_version_changes`
**Entity**: `DocumentVersionChange`

**Purpose**: Detailed change tracking

**Columns**:
```sql
CREATE TABLE document_version_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID REFERENCES document_versions(id) ON DELETE CASCADE,
  change_type VARCHAR(50), -- CONTENT, METADATA, FORMATTING
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  change_summary TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_version_changes_version ON document_version_changes(version_id);
```

---

### DocumentTemplates

**Table**: `document_templates`
**Entity**: `DocumentTemplate`

**Purpose**: Reusable document templates

**Columns**:
```sql
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  template_content TEXT NOT NULL, -- Handlebars template
  variables JSONB, -- List of variables
  usage_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_templates_category ON document_templates(category);
CREATE INDEX idx_templates_organization ON document_templates(organization_id);
```

---

### Clauses

**Table**: `clauses`
**Entity**: `Clause`

**Purpose**: Reusable legal clauses

**Columns**:
```sql
CREATE TABLE clauses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  jurisdiction VARCHAR(100),
  practice_area VARCHAR(100),
  tags TEXT[],
  variables JSONB,
  version VARCHAR(20),
  is_public BOOLEAN DEFAULT false,
  usage_count INT DEFAULT 0,
  organization_id UUID REFERENCES organizations(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_clauses_category ON clauses(category);
CREATE INDEX idx_clauses_tags ON clauses USING GIN(tags);
```

---

### OCRResults

**Table**: `ocr_results`
**Entity**: `OCRResult`

**Purpose**: OCR processing results

**Columns**:
```sql
CREATE TABLE ocr_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES legal_documents(id) ON DELETE CASCADE,
  extracted_text TEXT,
  confidence_score DECIMAL(5, 2), -- 0-100
  language VARCHAR(10),
  page_count INT,
  processing_time_ms INT,
  metadata JSONB, -- Word-level confidence, etc.
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ocr_document ON ocr_results(document_id);
```

---

## Billing & Financial Entities

### TimeEntries

**Table**: `time_entries`
**Entity**: `TimeEntry`

**Purpose**: Billable time tracking

**Columns**:
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  duration DECIMAL(10, 2) NOT NULL, -- hours
  rate DECIMAL(10, 2) NOT NULL, -- hourly rate
  total DECIMAL(10, 2) NOT NULL, -- duration * rate
  description TEXT NOT NULL,
  activity_type VARCHAR(100), -- LEGAL_RESEARCH, DRAFTING, COURT_APPEARANCE, etc.
  task_code VARCHAR(50), -- LEDES task code
  phase_code VARCHAR(50), -- LEDES phase code
  billable BOOLEAN DEFAULT true,
  billed BOOLEAN DEFAULT false,
  invoice_id UUID REFERENCES invoices(id),
  status VARCHAR(50), -- DRAFT, SUBMITTED, APPROVED, REJECTED, BILLED
  discount DECIMAL(5, 2), -- percentage
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_time_entries_case ON time_entries(case_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_time_entries_billable ON time_entries(billable);
CREATE INDEX idx_time_entries_billed ON time_entries(billed);
CREATE INDEX idx_time_entries_status ON time_entries(status);
```

**Relationships**:
- Many-to-One: case → Cases
- Many-to-One: user → Users
- Many-to-One: invoice → Invoices

---

### Invoices

**Table**: `invoices`
**Entity**: `Invoice`

**Purpose**: Client invoices

**Columns**:
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id),
  case_id UUID REFERENCES cases(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  tax DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2) DEFAULT 0,
  balance_due DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50), -- DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
  payment_terms VARCHAR(50), -- NET_15, NET_30, NET_45, NET_60
  billing_address TEXT,
  notes TEXT,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_case ON invoices(case_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

---

### InvoiceLineItems

**Table**: `invoice_line_items`
**Entity**: `InvoiceLineItem`

**Purpose**: Invoice line items

**Columns**:
```sql
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  time_entry_id UUID REFERENCES time_entries(id),
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  rate DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
```

---

### Payments

**Table**: `payments`
**Entity**: `Payment`

**Purpose**: Payment records

**Columns**:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50), -- CHECK, CREDIT_CARD, WIRE_TRANSFER, etc.
  reference_number VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

---

### TrustAccounts

**Table**: `trust_accounts`
**Entity**: `TrustAccount`

**Purpose**: Client trust accounts (IOLTA)

**Columns**:
```sql
CREATE TABLE trust_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_number VARCHAR(100) UNIQUE NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50), -- IOLTA, CLIENT_TRUST, OPERATING
  client_id UUID REFERENCES clients(id),
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(100),
  routing_number VARCHAR(50),
  current_balance DECIMAL(15, 2) DEFAULT 0,
  minimum_balance DECIMAL(15, 2) DEFAULT 0,
  opened_date DATE NOT NULL,
  closed_date DATE,
  status VARCHAR(50), -- ACTIVE, CLOSED
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trust_accounts_client ON trust_accounts(client_id);
CREATE INDEX idx_trust_accounts_status ON trust_accounts(status);
```

---

### TrustAccountTransactions

**Table**: `trust_account_transactions`
**Entity**: `TrustAccountTransaction`

**Purpose**: Trust account ledger

**Columns**:
```sql
CREATE TABLE trust_account_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trust_account_id UUID REFERENCES trust_accounts(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- DEPOSIT, WITHDRAWAL, FEE, INTEREST
  amount DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  payor VARCHAR(255),
  payee VARCHAR(255),
  check_number VARCHAR(50),
  reference_number VARCHAR(100),
  reconciled BOOLEAN DEFAULT false,
  reconciled_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trust_tx_account ON trust_account_transactions(trust_account_id);
CREATE INDEX idx_trust_tx_date ON trust_account_transactions(transaction_date);
CREATE INDEX idx_trust_tx_type ON trust_account_transactions(transaction_type);
```

---

### Expenses

**Table**: `expenses`
**Entity**: `Expense`

**Purpose**: Case expenses

**Columns**:
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  expense_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100), -- TRAVEL, FILING_FEE, EXPERT_WITNESS, etc.
  billable BOOLEAN DEFAULT true,
  billed BOOLEAN DEFAULT false,
  reimbursable BOOLEAN DEFAULT false,
  receipt_path VARCHAR(500),
  status VARCHAR(50), -- DRAFT, SUBMITTED, APPROVED, REJECTED
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_case ON expenses(case_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
```

---

## Discovery & Evidence Entities

### DiscoveryRequests

**Table**: `discovery_requests`
**Entity**: `DiscoveryRequest`

**Purpose**: Discovery request tracking

**Columns**:
```sql
CREATE TABLE discovery_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  request_type VARCHAR(100), -- INTERROGATORIES, PRODUCTION, ADMISSION, etc.
  requesting_party_id UUID REFERENCES parties(id),
  responding_party_id UUID REFERENCES parties(id),
  request_date DATE NOT NULL,
  due_date DATE,
  response_date DATE,
  status VARCHAR(50), -- PENDING, RESPONDED, OVERDUE
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_discovery_case ON discovery_requests(case_id);
CREATE INDEX idx_discovery_status ON discovery_requests(status);
```

---

### Depositions

**Table**: `depositions`
**Entity**: `Deposition`

**Purpose**: Deposition scheduling

**Columns**:
```sql
CREATE TABLE depositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  deponent_name VARCHAR(255) NOT NULL,
  deponent_type VARCHAR(50), -- PARTY, WITNESS, EXPERT
  deposition_date TIMESTAMP NOT NULL,
  location VARCHAR(500),
  court_reporter VARCHAR(255),
  videographer VARCHAR(255),
  status VARCHAR(50), -- SCHEDULED, COMPLETED, CANCELLED
  transcript_path VARCHAR(500),
  video_path VARCHAR(500),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_depositions_case ON depositions(case_id);
CREATE INDEX idx_depositions_date ON depositions(deposition_date);
```

---

### ESISources

**Table**: `esi_sources`
**Entity**: `ESISource`

**Purpose**: ESI data source tracking

**Columns**:
```sql
CREATE TABLE esi_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  source_name VARCHAR(255) NOT NULL,
  source_type VARCHAR(100), -- EMAIL, DATABASE, FILE_SERVER, etc.
  custodian VARCHAR(255),
  location VARCHAR(500),
  collection_date DATE,
  size_gb DECIMAL(10, 2),
  status VARCHAR(50), -- IDENTIFIED, COLLECTED, PROCESSED, REVIEWED
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_esi_case ON esi_sources(case_id);
```

---

### LegalHolds

**Table**: `legal_holds`
**Entity**: `LegalHold`

**Purpose**: Legal hold notices

**Columns**:
```sql
CREATE TABLE legal_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  hold_name VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  release_date DATE,
  custodians TEXT[], -- Array of custodian names
  scope TEXT NOT NULL,
  status VARCHAR(50), -- ACTIVE, RELEASED
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_legal_holds_case ON legal_holds(case_id);
```

---

### EvidenceItems

**Table**: `evidence_items`
**Entity**: `EvidenceItem`

**Purpose**: Evidence tracking

**Columns**:
```sql
CREATE TABLE evidence_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  evidence_number VARCHAR(100),
  description TEXT NOT NULL,
  evidence_type VARCHAR(100), -- DOCUMENT, PHYSICAL, DIGITAL
  collected_date DATE,
  collected_by VARCHAR(255),
  location VARCHAR(500),
  chain_of_custody JSONB,
  status VARCHAR(50), -- COLLECTED, IN_STORAGE, IN_ANALYSIS, DISPOSED
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evidence_case ON evidence_items(case_id);
CREATE INDEX idx_evidence_number ON evidence_items(evidence_number);
```

---

### TrialExhibits

**Table**: `trial_exhibits`
**Entity**: `TrialExhibit`

**Purpose**: Trial exhibit management

**Columns**:
```sql
CREATE TABLE trial_exhibits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  exhibit_number VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  evidence_item_id UUID REFERENCES evidence_items(id),
  document_id UUID REFERENCES legal_documents(id),
  offered_by VARCHAR(50), -- PLAINTIFF, DEFENDANT
  admitted BOOLEAN DEFAULT false,
  admission_date DATE,
  objections TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trial_exhibits_case ON trial_exhibits(case_id);
```

---

## Compliance & Audit Entities

### AuditLogs

**Table**: `audit_logs`
**Entity**: `AuditLog`

**Purpose**: System audit trail

**Columns**:
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL, -- USER_LOGIN, DOCUMENT_ACCESSED, CASE_UPDATED, etc.
  entity_type VARCHAR(100), -- User, Case, Document, etc.
  entity_id VARCHAR(100),
  user_id UUID REFERENCES users(id),
  description TEXT NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  session_id VARCHAR(255),
  changes JSONB, -- Before/after values
  metadata JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_session ON audit_logs(session_id);
```

---

### ConflictChecks

**Table**: `conflict_checks`
**Entity**: `ConflictCheck`

**Purpose**: Conflict of interest checking

**Columns**:
```sql
CREATE TABLE conflict_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id),
  check_type VARCHAR(50), -- PARTY, CLIENT, OPPOSING_COUNSEL
  name VARCHAR(255) NOT NULL,
  additional_names TEXT[], -- Aliases, variations
  check_date TIMESTAMP NOT NULL,
  status VARCHAR(50), -- CLEAR, CONFLICT, WAIVED
  conflicts_found JSONB, -- Array of conflict details
  resolution TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conflict_checks_case ON conflict_checks(case_id);
CREATE INDEX idx_conflict_checks_name ON conflict_checks(name);
CREATE INDEX idx_conflict_checks_status ON conflict_checks(status);
```

---

### EthicalWalls

**Table**: `ethical_walls`
**Entity**: `EthicalWall`

**Purpose**: Information barriers

**Columns**:
```sql
CREATE TABLE ethical_walls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  isolated_user_ids UUID[], -- Users behind the wall
  restricted_case_ids UUID[], -- Cases they can't access
  status VARCHAR(50), -- ACTIVE, INACTIVE
  effectiveness_score DECIMAL(5, 2), -- 0-100
  breach_count INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ethical_walls_status ON ethical_walls(status);
```

---

## Communication Entities

### Conversations

**Table**: `conversations`
**Entity**: `Conversation`

**Purpose**: Message threads

**Columns**:
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  conversation_type VARCHAR(50), -- DIRECT, GROUP, CASE
  case_id UUID REFERENCES cases(id),
  participant_ids UUID[], -- Array of user IDs
  last_message_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT false,
  metadata JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_case ON conversations(case_id);
CREATE INDEX idx_conversations_participants ON conversations USING GIN(participant_ids);
```

---

### Messages

**Table**: `messages`
**Entity**: `Message`

**Purpose**: Individual messages

**Columns**:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  attachments JSONB, -- Array of file info
  read_by UUID[], -- Array of user IDs who read
  delivered_to UUID[], -- Array of user IDs delivered to
  sent_at TIMESTAMP DEFAULT NOW(),
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at);
```

---

### Notifications

**Table**: `notifications`
**Entity**: `Notification`

**Purpose**: User notifications

**Columns**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(100), -- CASE_UPDATE, DOCUMENT_UPLOAD, DEADLINE_REMINDER, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(50), -- LOW, NORMAL, HIGH, URGENT
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

---

## Integration Entities

### APIKeys

**Table**: `api_keys`
**Entity**: `APIKey`

**Purpose**: API key management

**Columns**:
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  key_prefix VARCHAR(20), -- First few chars for identification
  key_hash VARCHAR(255) NOT NULL, -- Hashed key
  scopes TEXT[], -- Array of allowed operations
  expires_at TIMESTAMP,
  last_used_at TIMESTAMP,
  request_count INT DEFAULT 0,
  rate_limit INT, -- Requests per minute
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
```

---

### Webhooks

**Table**: `webhooks`
**Entity**: `Webhook`

**Purpose**: Webhook registrations

**Columns**:
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url VARCHAR(1000) NOT NULL,
  events TEXT[], -- Array of event types to subscribe to
  secret VARCHAR(255), -- Signature secret
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_active ON webhooks(is_active);
```

---

### WebhookDeliveries

**Table**: `webhook_deliveries`
**Entity**: `WebhookDelivery`

**Purpose**: Webhook delivery tracking

**Columns**:
```sql
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status_code INT,
  response_body TEXT,
  attempts INT DEFAULT 0,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_delivered ON webhook_deliveries(delivered);
```

---

## Indexes & Performance

### Full-Text Search Indexes

```sql
-- Users full-text search
CREATE INDEX idx_users_ft ON users
USING GIN(to_tsvector('english', first_name || ' ' || last_name || ' ' || email));

-- Clients full-text search
CREATE INDEX idx_clients_ft ON clients
USING GIN(to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(company_name, '')));

-- Cases full-text search
CREATE INDEX idx_cases_ft ON cases
USING GIN(to_tsvector('english', case_number || ' ' || title || ' ' || COALESCE(description, '')));

-- Documents full-text search
CREATE INDEX idx_documents_ft ON legal_documents
USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
```

### Performance Indexes

```sql
-- Foreign key indexes (automatically created)
-- Status/type indexes for filtering
-- Date indexes for range queries
-- Composite indexes for common query patterns
```

---

## Migrations

**Location**: `/backend/src/database/migrations/`

### Initial Schema Migration

**File**: `1734019200000-InitialSchema.ts`

Creates all 37+ tables with:
- Primary keys
- Foreign keys
- Indexes
- Constraints
- Default values

**Run Migration**:
```bash
cd backend
npm run migration:run
```

**Revert Migration**:
```bash
npm run migration:revert
```

---

## Seed Data

**Location**: `/backend/src/database/seeds/test-data/`

### Available Seed Files

1. `users.json` - 10 users with various roles
2. `clients.json` - 15 clients
3. `cases.json` - 20 cases
4. `documents.json` - 50+ documents
5. `time-entries.json` - 100+ time entries
6. `parties.json` - 8 parties
7. `motions.json` - 5 motions
8. `docket-entries.json` - 15 docket entries
9. `invoices.json` - 10 invoices
10. `discovery-requests.json` - 8 discovery requests
11. `depositions.json` - 6 depositions
12. `notifications.json` - 10 notifications
13. `audit-logs.json` - 8 audit logs

**Run Seed**:
```bash
cd backend
npm run seed
```

---

**Total Tables**: 37+
**Total Entities**: 76
**Foreign Keys**: 30+
**Indexes**: 50+
**Full-Text Indexes**: 4

**Last Updated**: December 12, 2025
**Maintained By**: Agent 1 & Agent 11 - Database Infrastructure Team
