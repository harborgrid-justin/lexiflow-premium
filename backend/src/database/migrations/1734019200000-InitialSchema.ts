import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1734019200000 implements MigrationInterface {
  name = 'InitialSchema1734019200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL UNIQUE,
        "password" varchar(255) NOT NULL,
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "role" varchar(50) NOT NULL,
        "department" varchar(200),
        "title" varchar(100),
        "phone" varchar(50),
        "extension" varchar(50),
        "mobilePhone" varchar(50),
        "avatarUrl" varchar(500),
        "isActive" boolean DEFAULT true,
        "isVerified" boolean DEFAULT false,
        "verificationToken" varchar(100),
        "verificationTokenExpiry" timestamp,
        "resetPasswordToken" varchar(100),
        "resetPasswordExpiry" timestamp,
        "lastLoginAt" timestamp,
        "lastLoginIp" varchar(100),
        "loginAttempts" integer DEFAULT 0,
        "lockedUntil" timestamp,
        "twoFactorEnabled" boolean DEFAULT false,
        "twoFactorSecret" varchar(255),
        "preferences" jsonb,
        "permissions" jsonb,
        "employeeId" varchar(100),
        "hireDate" date,
        "terminationDate" date,
        "managerId" uuid,
        "officeLocation" varchar(100),
        "timeZone" varchar(50),
        "language" varchar(10) DEFAULT 'en',
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create indexes for Users
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_department" ON "users" ("department")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")`);

    // Create UserProfile table
    await queryRunner.query(`
      CREATE TABLE "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL UNIQUE,
        "bio" text,
        "address" text,
        "city" varchar(100),
        "state" varchar(100),
        "zipCode" varchar(20),
        "country" varchar(100),
        "dateOfBirth" date,
        "gender" varchar(20),
        "nationality" varchar(100),
        "barNumber" varchar(100),
        "barState" varchar(100),
        "barAdmissionDate" date,
        "specializations" text[],
        "education" jsonb,
        "certifications" jsonb,
        "languages" text[],
        "linkedinUrl" varchar(500),
        "twitterUrl" varchar(500),
        "professionalWebsite" varchar(500),
        "emergencyContactName" varchar(255),
        "emergencyContactPhone" varchar(50),
        "emergencyContactRelation" varchar(100),
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Sessions table
    await queryRunner.query(`
      CREATE TABLE "sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "token" varchar(500) NOT NULL UNIQUE,
        "refreshToken" varchar(500),
        "ipAddress" varchar(100),
        "userAgent" text,
        "expiresAt" timestamp NOT NULL,
        "isActive" boolean DEFAULT true,
        "lastActivityAt" timestamp,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_sessions_userId" ON "sessions" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_token" ON "sessions" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_sessions_isActive" ON "sessions" ("isActive")`);

    // Create Clients table
    await queryRunner.query(`
      CREATE TABLE "clients" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "clientNumber" varchar(100) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "clientType" varchar(50) NOT NULL,
        "status" varchar(50) DEFAULT 'active',
        "email" varchar(255),
        "phone" varchar(50),
        "fax" varchar(50),
        "website" varchar(500),
        "address" text,
        "city" varchar(100),
        "state" varchar(100),
        "zipCode" varchar(20),
        "country" varchar(100),
        "billingAddress" text,
        "billingCity" varchar(100),
        "billingState" varchar(100),
        "billingZipCode" varchar(20),
        "billingCountry" varchar(100),
        "taxId" varchar(100),
        "industry" varchar(255),
        "establishedDate" date,
        "primaryContactName" varchar(255),
        "primaryContactEmail" varchar(255),
        "primaryContactPhone" varchar(50),
        "primaryContactTitle" varchar(100),
        "accountManagerId" uuid,
        "referralSource" varchar(255),
        "clientSince" date,
        "paymentTerms" varchar(50) DEFAULT 'net_30',
        "preferredPaymentMethod" varchar(100),
        "creditLimit" decimal(15, 2) DEFAULT 0,
        "currentBalance" decimal(15, 2) DEFAULT 0,
        "totalBilled" decimal(15, 2) DEFAULT 0,
        "totalPaid" decimal(15, 2) DEFAULT 0,
        "totalCases" integer DEFAULT 0,
        "activeCases" integer DEFAULT 0,
        "isVip" boolean DEFAULT false,
        "requiresConflictCheck" boolean DEFAULT false,
        "lastConflictCheckDate" date,
        "hasRetainer" boolean DEFAULT false,
        "retainerAmount" decimal(15, 2),
        "retainerBalance" decimal(15, 2),
        "customFields" jsonb,
        "tags" jsonb,
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_clients_clientNumber" ON "clients" ("clientNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_clientType" ON "clients" ("clientType")`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_status" ON "clients" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_email" ON "clients" ("email")`);

    // Create Organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "legalName" varchar(255),
        "organizationType" varchar(100),
        "taxId" varchar(100),
        "email" varchar(255),
        "phone" varchar(50),
        "website" varchar(500),
        "address" text,
        "city" varchar(100),
        "state" varchar(100),
        "zipCode" varchar(20),
        "country" varchar(100),
        "parentOrganizationId" uuid,
        "industryType" varchar(255),
        "employeeCount" integer,
        "annualRevenue" decimal(15, 2),
        "foundedDate" date,
        "description" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Legal Entities table
    await queryRunner.query(`
      CREATE TABLE "legal_entities" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "entityType" varchar(100),
        "jurisdictionState" varchar(100),
        "jurisdictionCountry" varchar(100),
        "registrationNumber" varchar(100),
        "registrationDate" date,
        "status" varchar(50),
        "ein" varchar(100),
        "address" text,
        "city" varchar(100),
        "state" varchar(100),
        "zipCode" varchar(20),
        "country" varchar(100),
        "agentName" varchar(255),
        "agentAddress" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Cases table
    await queryRunner.query(`
      CREATE TABLE "cases" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseNumber" varchar(100) NOT NULL UNIQUE,
        "title" varchar(500) NOT NULL,
        "caseType" varchar(100) NOT NULL,
        "status" varchar(50) DEFAULT 'open',
        "jurisdictionId" uuid,
        "clientId" uuid,
        "filingDate" date,
        "closedDate" date,
        "description" text,
        "practiceArea" varchar(200),
        "courtName" varchar(200),
        "judgeAssigned" varchar(100),
        "estimatedValue" decimal(15, 2) DEFAULT 0,
        "isConfidential" boolean DEFAULT false,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_cases_caseNumber" ON "cases" ("caseNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_cases_status" ON "cases" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_cases_caseType" ON "cases" ("caseType")`);
    await queryRunner.query(`CREATE INDEX "IDX_cases_filingDate" ON "cases" ("filingDate")`);
    await queryRunner.query(`CREATE INDEX "IDX_cases_clientId" ON "cases" ("clientId")`);

    // Create Parties table
    await queryRunner.query(`
      CREATE TABLE "parties" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "partyType" varchar(50) NOT NULL,
        "name" varchar(255) NOT NULL,
        "role" varchar(100),
        "email" varchar(255),
        "phone" varchar(50),
        "address" text,
        "city" varchar(100),
        "state" varchar(100),
        "zipCode" varchar(20),
        "country" varchar(100),
        "attorney" varchar(255),
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_parties_caseId" ON "parties" ("caseId")`);

    // Create Case Team Members table
    await queryRunner.query(`
      CREATE TABLE "case_team_members" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "role" varchar(100) NOT NULL,
        "assignedDate" date,
        "isLead" boolean DEFAULT false,
        "hourlyRate" decimal(10, 2),
        "permissions" jsonb,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_case_team_members_caseId" ON "case_team_members" ("caseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_case_team_members_userId" ON "case_team_members" ("userId")`);

    // Create Case Phases table
    await queryRunner.query(`
      CREATE TABLE "case_phases" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "phaseName" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(50) DEFAULT 'pending',
        "startDate" date,
        "endDate" date,
        "estimatedDuration" integer,
        "actualDuration" integer,
        "order" integer DEFAULT 0,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_case_phases_caseId" ON "case_phases" ("caseId")`);

    // Create Projects table
    await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "projectName" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(50) DEFAULT 'active',
        "startDate" date,
        "endDate" date,
        "estimatedHours" decimal(10, 2),
        "actualHours" decimal(10, 2) DEFAULT 0,
        "budget" decimal(15, 2),
        "actualCost" decimal(15, 2) DEFAULT 0,
        "projectManagerId" uuid,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_projects_caseId" ON "projects" ("caseId")`);

    // Create Time Entries table
    await queryRunner.query(`
      CREATE TABLE "time_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "caseId" uuid NOT NULL,
        "projectId" uuid,
        "date" date NOT NULL,
        "hours" decimal(10, 2) NOT NULL,
        "description" text NOT NULL,
        "billable" boolean DEFAULT true,
        "billed" boolean DEFAULT false,
        "hourlyRate" decimal(10, 2),
        "amount" decimal(15, 2),
        "taskType" varchar(100),
        "status" varchar(50) DEFAULT 'pending',
        "approvedBy" uuid,
        "approvedAt" timestamp,
        "invoiceId" uuid,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_time_entries_userId" ON "time_entries" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_caseId" ON "time_entries" ("caseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_date" ON "time_entries" ("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_billable" ON "time_entries" ("billable")`);
    await queryRunner.query(`CREATE INDEX "IDX_time_entries_billed" ON "time_entries" ("billed")`);

    // Create Rate Tables table
    await queryRunner.query(`
      CREATE TABLE "rate_tables" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "effectiveDate" date NOT NULL,
        "expirationDate" date,
        "isActive" boolean DEFAULT true,
        "rates" jsonb NOT NULL,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Invoices table
    await queryRunner.query(`
      CREATE TABLE "invoices" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "invoiceNumber" varchar(100) NOT NULL UNIQUE,
        "clientId" uuid NOT NULL,
        "caseId" uuid,
        "invoiceDate" date NOT NULL,
        "dueDate" date NOT NULL,
        "status" varchar(50) DEFAULT 'draft',
        "subtotal" decimal(15, 2) DEFAULT 0,
        "taxAmount" decimal(15, 2) DEFAULT 0,
        "discountAmount" decimal(15, 2) DEFAULT 0,
        "totalAmount" decimal(15, 2) DEFAULT 0,
        "paidAmount" decimal(15, 2) DEFAULT 0,
        "balanceAmount" decimal(15, 2) DEFAULT 0,
        "currency" varchar(10) DEFAULT 'USD',
        "notes" text,
        "terms" text,
        "sentDate" timestamp,
        "paidDate" timestamp,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_invoices_invoiceNumber" ON "invoices" ("invoiceNumber")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_clientId" ON "invoices" ("clientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_invoices_status" ON "invoices" ("status")`);

    // Create Firm Expenses table
    await queryRunner.query(`
      CREATE TABLE "firm_expenses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "caseId" uuid,
        "expenseDate" date NOT NULL,
        "category" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "amount" decimal(15, 2) NOT NULL,
        "billable" boolean DEFAULT true,
        "billed" boolean DEFAULT false,
        "reimbursable" boolean DEFAULT false,
        "status" varchar(50) DEFAULT 'pending',
        "receiptUrl" varchar(500),
        "approvedBy" uuid,
        "approvedAt" timestamp,
        "invoiceId" uuid,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_firm_expenses_userId" ON "firm_expenses" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_firm_expenses_caseId" ON "firm_expenses" ("caseId")`);

    // Create Trust Transactions table
    await queryRunner.query(`
      CREATE TABLE "trust_transactions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "clientId" uuid NOT NULL,
        "caseId" uuid,
        "transactionDate" date NOT NULL,
        "transactionType" varchar(50) NOT NULL,
        "amount" decimal(15, 2) NOT NULL,
        "balance" decimal(15, 2) NOT NULL,
        "description" text,
        "referenceNumber" varchar(100),
        "checkNumber" varchar(50),
        "status" varchar(50) DEFAULT 'completed',
        "reconciledDate" date,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_trust_transactions_clientId" ON "trust_transactions" ("clientId")`);
    await queryRunner.query(`CREATE INDEX "IDX_trust_transactions_caseId" ON "trust_transactions" ("caseId")`);

    // Create Legal Documents table
    await queryRunner.query(`
      CREATE TABLE "legal_documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "title" varchar(500) NOT NULL,
        "documentType" varchar(100),
        "description" text,
        "fileName" varchar(500),
        "filePath" varchar(1000),
        "fileSize" bigint,
        "mimeType" varchar(100),
        "status" varchar(50) DEFAULT 'draft',
        "version" integer DEFAULT 1,
        "isTemplate" boolean DEFAULT false,
        "templateCategory" varchar(100),
        "creatorId" uuid,
        "confidentialityLevel" varchar(50),
        "tags" text[],
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_legal_documents_caseId" ON "legal_documents" ("caseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_legal_documents_documentType" ON "legal_documents" ("documentType")`);
    await queryRunner.query(`CREATE INDEX "IDX_legal_documents_status" ON "legal_documents" ("status")`);

    // Create Document Versions table
    await queryRunner.query(`
      CREATE TABLE "document_versions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "documentId" uuid NOT NULL,
        "versionNumber" integer NOT NULL,
        "fileName" varchar(500),
        "filePath" varchar(1000),
        "fileSize" bigint,
        "changeDescription" text,
        "createdBy" uuid,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_document_versions_documentId" ON "document_versions" ("documentId")`);

    // Create Clauses table
    await queryRunner.query(`
      CREATE TABLE "clauses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(500) NOT NULL,
        "content" text NOT NULL,
        "category" varchar(100),
        "subcategory" varchar(100),
        "description" text,
        "isStandard" boolean DEFAULT false,
        "language" varchar(10) DEFAULT 'en',
        "jurisdiction" varchar(100),
        "tags" text[],
        "usageCount" integer DEFAULT 0,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_clauses_category" ON "clauses" ("category")`);

    // Create Pleading Documents table
    await queryRunner.query(`
      CREATE TABLE "pleading_documents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "pleadingType" varchar(100) NOT NULL,
        "title" varchar(500) NOT NULL,
        "filingDate" date,
        "filedBy" varchar(255),
        "status" varchar(50) DEFAULT 'draft',
        "documentPath" varchar(1000),
        "summary" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_pleading_documents_caseId" ON "pleading_documents" ("caseId")`);

    // Create Motions table
    await queryRunner.query(`
      CREATE TABLE "motions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "motionType" varchar(100) NOT NULL,
        "title" varchar(500) NOT NULL,
        "description" text,
        "filingDate" date,
        "hearingDate" date,
        "status" varchar(50) DEFAULT 'pending',
        "filedBy" varchar(255),
        "outcome" varchar(100),
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_motions_caseId" ON "motions" ("caseId")`);

    // Create Docket Entries table
    await queryRunner.query(`
      CREATE TABLE "docket_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "entryNumber" integer NOT NULL,
        "entryDate" date NOT NULL,
        "description" text NOT NULL,
        "filingParty" varchar(255),
        "documentType" varchar(100),
        "documentUrl" varchar(1000),
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_docket_entries_caseId" ON "docket_entries" ("caseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_docket_entries_entryDate" ON "docket_entries" ("entryDate")`);

    // Create Discovery Requests table
    await queryRunner.query(`
      CREATE TABLE "discovery_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "requestType" varchar(100) NOT NULL,
        "title" varchar(500) NOT NULL,
        "description" text,
        "requestDate" date NOT NULL,
        "dueDate" date,
        "status" varchar(50) DEFAULT 'pending',
        "requestedBy" varchar(255),
        "respondedDate" date,
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_discovery_requests_caseId" ON "discovery_requests" ("caseId")`);

    // Create Depositions table
    await queryRunner.query(`
      CREATE TABLE "depositions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "deponentName" varchar(255) NOT NULL,
        "deponentType" varchar(100),
        "scheduledDate" date,
        "location" text,
        "duration" integer,
        "status" varchar(50) DEFAULT 'scheduled',
        "transcriptUrl" varchar(1000),
        "videoUrl" varchar(1000),
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_depositions_caseId" ON "depositions" ("caseId")`);

    // Create ESI Sources table
    await queryRunner.query(`
      CREATE TABLE "esi_sources" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "sourceName" varchar(255) NOT NULL,
        "sourceType" varchar(100),
        "description" text,
        "custodian" varchar(255),
        "collectionDate" date,
        "volumeSize" bigint,
        "itemCount" integer,
        "status" varchar(50) DEFAULT 'identified',
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Legal Holds table
    await queryRunner.query(`
      CREATE TABLE "legal_holds" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "holdName" varchar(255) NOT NULL,
        "description" text,
        "issueDate" date NOT NULL,
        "releaseDate" date,
        "status" varchar(50) DEFAULT 'active',
        "custodianCount" integer DEFAULT 0,
        "acknowledgmentRequired" boolean DEFAULT true,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Privilege Log Entries table
    await queryRunner.query(`
      CREATE TABLE "privilege_log_entries" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "documentId" varchar(255),
        "documentDate" date,
        "author" varchar(255),
        "recipient" varchar(255),
        "description" text,
        "privilegeType" varchar(100),
        "basisForPrivilege" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_privilege_log_entries_caseId" ON "privilege_log_entries" ("caseId")`);

    // Create Evidence Items table
    await queryRunner.query(`
      CREATE TABLE "evidence_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "evidenceNumber" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "evidenceType" varchar(100),
        "collectedDate" date,
        "collectedBy" varchar(255),
        "location" text,
        "status" varchar(50) DEFAULT 'collected',
        "tags" text[],
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_evidence_items_caseId" ON "evidence_items" ("caseId")`);

    // Create Chain of Custody Events table
    await queryRunner.query(`
      CREATE TABLE "chain_of_custody_events" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "evidenceItemId" uuid NOT NULL,
        "eventType" varchar(100) NOT NULL,
        "eventDate" timestamp NOT NULL,
        "performedBy" uuid,
        "fromLocation" text,
        "toLocation" text,
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_chain_of_custody_events_evidenceItemId" ON "chain_of_custody_events" ("evidenceItemId")`);

    // Create Trial Exhibits table
    await queryRunner.query(`
      CREATE TABLE "trial_exhibits" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid NOT NULL,
        "exhibitNumber" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "exhibitType" varchar(100),
        "admittedDate" date,
        "admittedBy" varchar(255),
        "status" varchar(50) DEFAULT 'proposed',
        "documentPath" varchar(1000),
        "notes" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_trial_exhibits_caseId" ON "trial_exhibits" ("caseId")`);

    // Create Witnesses table
    await queryRunner.query(`
      CREATE TABLE "witnesses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "firstName" varchar(100) NOT NULL,
        "lastName" varchar(100) NOT NULL,
        "witnessType" varchar(100),
        "email" varchar(255),
        "phone" varchar(50),
        "address" text,
        "expertise" text,
        "testimony" text,
        "status" varchar(50) DEFAULT 'identified',
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Audit Logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "entityType" varchar(100) NOT NULL,
        "entityId" uuid NOT NULL,
        "action" varchar(100) NOT NULL,
        "changes" jsonb,
        "ipAddress" varchar(100),
        "userAgent" text,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_userId" ON "audit_logs" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entityType" ON "audit_logs" ("entityType")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entityId" ON "audit_logs" ("entityId")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_createdAt" ON "audit_logs" ("createdAt")`);

    // Create Conflict Checks table
    await queryRunner.query(`
      CREATE TABLE "conflict_checks" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "clientId" uuid,
        "checkDate" date NOT NULL,
        "checkedBy" uuid,
        "status" varchar(50) DEFAULT 'pending',
        "conflictFound" boolean DEFAULT false,
        "conflictDetails" text,
        "resolution" text,
        "approvedBy" uuid,
        "approvedDate" date,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_conflict_checks_caseId" ON "conflict_checks" ("caseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_conflict_checks_clientId" ON "conflict_checks" ("clientId")`);

    // Create Ethical Walls table
    await queryRunner.query(`
      CREATE TABLE "ethical_walls" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "description" text,
        "reason" text,
        "effectiveDate" date NOT NULL,
        "expirationDate" date,
        "status" varchar(50) DEFAULT 'active',
        "restrictedUsers" jsonb,
        "restrictedCases" jsonb,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    // Create Conversations table
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "caseId" uuid,
        "subject" varchar(500),
        "conversationType" varchar(100),
        "participants" jsonb,
        "status" varchar(50) DEFAULT 'active',
        "lastMessageAt" timestamp,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_conversations_caseId" ON "conversations" ("caseId")`);

    // Create Messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "conversationId" uuid NOT NULL,
        "senderId" uuid NOT NULL,
        "content" text NOT NULL,
        "messageType" varchar(50) DEFAULT 'text',
        "attachments" jsonb,
        "readBy" jsonb,
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_messages_conversationId" ON "messages" ("conversationId")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_senderId" ON "messages" ("senderId")`);

    // Create Notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" varchar(500) NOT NULL,
        "message" text NOT NULL,
        "notificationType" varchar(100),
        "priority" varchar(50) DEFAULT 'normal',
        "isRead" boolean DEFAULT false,
        "readAt" timestamp,
        "actionUrl" varchar(1000),
        "metadata" jsonb,
        "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" timestamp
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_userId" ON "notifications" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_isRead" ON "notifications" ("isRead")`);

    // Add Foreign Key Constraints
    await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_user_profiles_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_cases_clientId" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "parties" ADD CONSTRAINT "FK_parties_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "case_team_members" ADD CONSTRAINT "FK_case_team_members_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "case_team_members" ADD CONSTRAINT "FK_case_team_members_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "case_phases" ADD CONSTRAINT "FK_case_phases_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_projects_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "time_entries" ADD CONSTRAINT "FK_time_entries_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "time_entries" ADD CONSTRAINT "FK_time_entries_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_clientId" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "firm_expenses" ADD CONSTRAINT "FK_firm_expenses_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "firm_expenses" ADD CONSTRAINT "FK_firm_expenses_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "trust_transactions" ADD CONSTRAINT "FK_trust_transactions_clientId" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "legal_documents" ADD CONSTRAINT "FK_legal_documents_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "document_versions" ADD CONSTRAINT "FK_document_versions_documentId" FOREIGN KEY ("documentId") REFERENCES "legal_documents"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "pleading_documents" ADD CONSTRAINT "FK_pleading_documents_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "motions" ADD CONSTRAINT "FK_motions_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "docket_entries" ADD CONSTRAINT "FK_docket_entries_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "discovery_requests" ADD CONSTRAINT "FK_discovery_requests_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "depositions" ADD CONSTRAINT "FK_depositions_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "privilege_log_entries" ADD CONSTRAINT "FK_privilege_log_entries_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "evidence_items" ADD CONSTRAINT "FK_evidence_items_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "chain_of_custody_events" ADD CONSTRAINT "FK_chain_of_custody_events_evidenceItemId" FOREIGN KEY ("evidenceItemId") REFERENCES "evidence_items"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "trial_exhibits" ADD CONSTRAINT "FK_trial_exhibits_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "conflict_checks" ADD CONSTRAINT "FK_conflict_checks_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "conflict_checks" ADD CONSTRAINT "FK_conflict_checks_clientId" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_conversations_caseId" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL`);
    await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_conversationId" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);

    // Create Full-Text Search indexes
    await queryRunner.query(`CREATE INDEX "IDX_legal_documents_title_fulltext" ON "legal_documents" USING gin(to_tsvector('english', title))`);
    await queryRunner.query(`CREATE INDEX "IDX_cases_title_fulltext" ON "cases" USING gin(to_tsvector('english', title))`);
    await queryRunner.query(`CREATE INDEX "IDX_clients_name_fulltext" ON "clients" USING gin(to_tsvector('english', name))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all foreign key constraints first
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_userId"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversationId"`);
    await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_conversations_caseId"`);
    await queryRunner.query(`ALTER TABLE "conflict_checks" DROP CONSTRAINT "FK_conflict_checks_clientId"`);
    await queryRunner.query(`ALTER TABLE "conflict_checks" DROP CONSTRAINT "FK_conflict_checks_caseId"`);
    await queryRunner.query(`ALTER TABLE "trial_exhibits" DROP CONSTRAINT "FK_trial_exhibits_caseId"`);
    await queryRunner.query(`ALTER TABLE "chain_of_custody_events" DROP CONSTRAINT "FK_chain_of_custody_events_evidenceItemId"`);
    await queryRunner.query(`ALTER TABLE "evidence_items" DROP CONSTRAINT "FK_evidence_items_caseId"`);
    await queryRunner.query(`ALTER TABLE "privilege_log_entries" DROP CONSTRAINT "FK_privilege_log_entries_caseId"`);
    await queryRunner.query(`ALTER TABLE "depositions" DROP CONSTRAINT "FK_depositions_caseId"`);
    await queryRunner.query(`ALTER TABLE "discovery_requests" DROP CONSTRAINT "FK_discovery_requests_caseId"`);
    await queryRunner.query(`ALTER TABLE "docket_entries" DROP CONSTRAINT "FK_docket_entries_caseId"`);
    await queryRunner.query(`ALTER TABLE "motions" DROP CONSTRAINT "FK_motions_caseId"`);
    await queryRunner.query(`ALTER TABLE "pleading_documents" DROP CONSTRAINT "FK_pleading_documents_caseId"`);
    await queryRunner.query(`ALTER TABLE "document_versions" DROP CONSTRAINT "FK_document_versions_documentId"`);
    await queryRunner.query(`ALTER TABLE "legal_documents" DROP CONSTRAINT "FK_legal_documents_caseId"`);
    await queryRunner.query(`ALTER TABLE "trust_transactions" DROP CONSTRAINT "FK_trust_transactions_clientId"`);
    await queryRunner.query(`ALTER TABLE "firm_expenses" DROP CONSTRAINT "FK_firm_expenses_caseId"`);
    await queryRunner.query(`ALTER TABLE "firm_expenses" DROP CONSTRAINT "FK_firm_expenses_userId"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_caseId"`);
    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_clientId"`);
    await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT "FK_time_entries_caseId"`);
    await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT "FK_time_entries_userId"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_projects_caseId"`);
    await queryRunner.query(`ALTER TABLE "case_phases" DROP CONSTRAINT "FK_case_phases_caseId"`);
    await queryRunner.query(`ALTER TABLE "case_team_members" DROP CONSTRAINT "FK_case_team_members_userId"`);
    await queryRunner.query(`ALTER TABLE "case_team_members" DROP CONSTRAINT "FK_case_team_members_caseId"`);
    await queryRunner.query(`ALTER TABLE "parties" DROP CONSTRAINT "FK_parties_caseId"`);
    await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_cases_clientId"`);
    await queryRunner.query(`ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_userId"`);
    await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_user_profiles_userId"`);

    // Drop all tables
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "messages"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
    await queryRunner.query(`DROP TABLE "ethical_walls"`);
    await queryRunner.query(`DROP TABLE "conflict_checks"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP TABLE "witnesses"`);
    await queryRunner.query(`DROP TABLE "trial_exhibits"`);
    await queryRunner.query(`DROP TABLE "chain_of_custody_events"`);
    await queryRunner.query(`DROP TABLE "evidence_items"`);
    await queryRunner.query(`DROP TABLE "privilege_log_entries"`);
    await queryRunner.query(`DROP TABLE "legal_holds"`);
    await queryRunner.query(`DROP TABLE "esi_sources"`);
    await queryRunner.query(`DROP TABLE "depositions"`);
    await queryRunner.query(`DROP TABLE "discovery_requests"`);
    await queryRunner.query(`DROP TABLE "docket_entries"`);
    await queryRunner.query(`DROP TABLE "motions"`);
    await queryRunner.query(`DROP TABLE "pleading_documents"`);
    await queryRunner.query(`DROP TABLE "clauses"`);
    await queryRunner.query(`DROP TABLE "document_versions"`);
    await queryRunner.query(`DROP TABLE "legal_documents"`);
    await queryRunner.query(`DROP TABLE "trust_transactions"`);
    await queryRunner.query(`DROP TABLE "firm_expenses"`);
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(`DROP TABLE "rate_tables"`);
    await queryRunner.query(`DROP TABLE "time_entries"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "case_phases"`);
    await queryRunner.query(`DROP TABLE "case_team_members"`);
    await queryRunner.query(`DROP TABLE "parties"`);
    await queryRunner.query(`DROP TABLE "cases"`);
    await queryRunner.query(`DROP TABLE "legal_entities"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TABLE "user_profiles"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop UUID extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
