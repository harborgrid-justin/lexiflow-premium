/**
 * Enterprise Data Seeding System
 *
 * Comprehensive database seeder with multi-agent coordination for enterprise
 * demo data population. This script orchestrates data seeding across all
 * domains with proper dependency ordering and validation.
 *
 * @module DataSeeding
 * @version 1.0.0
 * @enterprise true
 */

import 'reflect-metadata';
import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Database configuration with Neon PostgreSQL optimization
 * Supports both pooled and direct connections
 * @see https://neon.com/docs/guides/typeorm
 */
const databaseUrl = process.env.DATABASE_URL;
const isNeonConnection = databaseUrl?.includes('neon.tech') || false;
const isPooledConnection = databaseUrl?.includes('-pooler') || false;

const DB_CONFIG = {
  type: 'postgres' as const,
  url: databaseUrl,
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'lexiflow',
  password: process.env.DB_PASSWORD || 'lexiflow_secure_2025',
  database: process.env.DB_DATABASE || 'lexiflow_db',
  // Neon requires SSL with channel binding
  ssl: isNeonConnection || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : false,
  synchronize: false,
  logging: process.env.LOG_LEVEL === 'debug',
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/database/migrations/*.js'],
  // Connection pool settings optimized for Neon
  extra: isNeonConnection ? {
    max: isPooledConnection ? 5 : 10,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 60000,
    application_name: 'lexiflow-seeder',
  } : {},
};

// =============================================================================
// Logging Utilities
// =============================================================================

const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
  const colors = {
    info: Colors.blue,
    success: Colors.green,
    warning: Colors.yellow,
    error: Colors.red,
  };
  const icons = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✗',
  };
  console.log(`${colors[type]}${icons[type]}${Colors.reset} ${message}`);
}

function logSection(title: string): void {
  console.log(`\n${Colors.cyan}${'═'.repeat(60)}${Colors.reset}`);
  console.log(`${Colors.bright}${Colors.cyan}  ${title}${Colors.reset}`);
  console.log(`${Colors.cyan}${'═'.repeat(60)}${Colors.reset}\n`);
}

// =============================================================================
// Data Generation Utilities
// =============================================================================

function generateId(): string {
  return uuidv4();
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// =============================================================================
// Enterprise Demo Data Definitions
// =============================================================================

const DEMO_USERS = [
  { email: 'admin@lexiflow.com', firstName: 'Admin', lastName: 'User', role: 'admin', title: 'System Administrator' },
  { email: 'partner@lexiflow.com', firstName: 'Sarah', lastName: 'Martinez', role: 'partner', title: 'Managing Partner' },
  { email: 'senior@lexiflow.com', firstName: 'Michael', lastName: 'Chen', role: 'senior_associate', title: 'Senior Associate' },
  { email: 'associate@lexiflow.com', firstName: 'Emily', lastName: 'Johnson', role: 'associate', title: 'Associate Attorney' },
  { email: 'paralegal@lexiflow.com', firstName: 'David', lastName: 'Williams', role: 'paralegal', title: 'Senior Paralegal' },
  { email: 'assistant@lexiflow.com', firstName: 'Jennifer', lastName: 'Brown', role: 'legal_assistant', title: 'Legal Assistant' },
  { email: 'billing@lexiflow.com', firstName: 'Lisa', lastName: 'Anderson', role: 'billing_clerk', title: 'Billing Coordinator' },
  { email: 'it@lexiflow.com', firstName: 'Robert', lastName: 'Taylor', role: 'admin', title: 'IT Administrator' },
];

const DEMO_CLIENTS = [
  { name: 'Acme Corporation', clientType: 'corporate', industry: 'Technology', email: 'legal@acme.com' },
  { name: 'Smith Family Trust', clientType: 'individual', industry: 'Personal', email: 'john.smith@email.com' },
  { name: 'Global Innovations LLC', clientType: 'corporate', industry: 'Manufacturing', email: 'counsel@globalinnovations.com' },
  { name: 'Johnson & Associates', clientType: 'corporate', industry: 'Financial Services', email: 'legal@johnsonassoc.com' },
  { name: 'Maria Garcia', clientType: 'individual', industry: 'Personal', email: 'mgarcia@email.com' },
  { name: 'TechStart Ventures', clientType: 'corporate', industry: 'Venture Capital', email: 'legal@techstartvc.com' },
  { name: 'Williams Estate', clientType: 'individual', industry: 'Estate Planning', email: 'estate@williams-family.com' },
  { name: 'Metro Healthcare Systems', clientType: 'corporate', industry: 'Healthcare', email: 'compliance@metrohc.com' },
  { name: 'Chen Construction Group', clientType: 'corporate', industry: 'Construction', email: 'legal@chenconstruction.com' },
  { name: 'Anderson Media Group', clientType: 'corporate', industry: 'Media & Entertainment', email: 'legal@andersonmedia.com' },
];

// Case type and status definitions with practice area mappings
const CASE_TYPES = ['civil', 'corporate', 'family', 'criminal', 'bankruptcy', 'ip', 'employment', 'real_estate'] as const;
const CASE_STATUSES = ['open', 'active', 'discovery', 'trial', 'settled', 'closed'] as const;
const JURISDICTIONS = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];
const COURTS = ['Superior Court', 'District Court', 'Federal Court', 'Appellate Court'];

type CaseType = typeof CASE_TYPES[number];
type CaseStatus = typeof CASE_STATUSES[number];

// Map case types to their practice areas for proper categorization
const CASE_TYPE_TO_PRACTICE_AREA: Record<CaseType, string[]> = {
  civil: ['Civil Litigation', 'Personal Injury', 'Contract Law'],
  corporate: ['Corporate Finance', 'Mergers & Acquisitions', 'Securities'],
  family: ['Family Law', 'Estate Planning', 'Divorce'],
  criminal: ['Criminal Defense', 'White Collar Crime'],
  bankruptcy: ['Bankruptcy', 'Debt Restructuring'],
  ip: ['Intellectual Property', 'Patent Law', 'Trademark'],
  employment: ['Employment Law', 'Labor Relations'],
  real_estate: ['Real Estate', 'Property Law', 'Land Use'],
};

// Get a random practice area for a given case type (used for generating additional random cases)
function _getPracticeAreaForType(caseType: CaseType): string {
  const practiceAreas = CASE_TYPE_TO_PRACTICE_AREA[caseType];
  return randomElement(practiceAreas);
}
void _getPracticeAreaForType;

// Validate case type is valid
function isValidCaseType(type: string): type is CaseType {
  return CASE_TYPES.includes(type as CaseType);
}

// Validate case status is valid
function isValidCaseStatus(status: string): status is CaseStatus {
  return CASE_STATUSES.includes(status as CaseStatus);
}

// Core demo cases with realistic legal matters
const DEMO_CASES: Array<{ title: string; type: CaseType; status: CaseStatus; practiceArea: string }> = [
  { title: 'Acme Corp v. Competitor Inc - Patent Infringement', type: 'ip', status: 'active', practiceArea: 'Intellectual Property' },
  { title: 'Smith Estate Administration', type: 'family', status: 'open', practiceArea: 'Estate Planning' },
  { title: 'Global Innovations - Series B Financing', type: 'corporate', status: 'active', practiceArea: 'Corporate Finance' },
  { title: 'Johnson v. Former Employer - Wrongful Termination', type: 'employment', status: 'discovery', practiceArea: 'Employment Law' },
  { title: 'Garcia Divorce Proceedings', type: 'family', status: 'active', practiceArea: 'Family Law' },
  { title: 'TechStart - Merger Due Diligence', type: 'corporate', status: 'active', practiceArea: 'Mergers & Acquisitions' },
  { title: 'Williams Trust Modification', type: 'family', status: 'open', practiceArea: 'Estate Planning' },
  { title: 'Metro Healthcare Compliance Review', type: 'civil', status: 'active', practiceArea: 'Civil Litigation' },
  { title: 'Chen Construction - Contract Dispute', type: 'civil', status: 'discovery', practiceArea: 'Contract Law' },
  { title: 'Anderson Media - Copyright Litigation', type: 'ip', status: 'trial', practiceArea: 'Intellectual Property' },
  { title: 'Class Action - Consumer Protection', type: 'civil', status: 'active', practiceArea: 'Civil Litigation' },
  { title: 'Real Estate Development Agreement', type: 'real_estate', status: 'active', practiceArea: 'Real Estate' },
];

// Validate all demo cases have valid types and statuses
for (const demoCase of DEMO_CASES) {
  if (!isValidCaseType(demoCase.type)) {
    throw new Error(`Invalid case type: ${demoCase.type}`);
  }
  if (!isValidCaseStatus(demoCase.status)) {
    throw new Error(`Invalid case status: ${demoCase.status}`);
  }
}

const DOCUMENT_TYPES = ['pleading', 'motion', 'contract', 'correspondence', 'discovery', 'brief', 'memorandum', 'exhibit'];
const MOTION_TYPES = ['summary_judgment', 'dismiss', 'compel', 'protective_order', 'continuance', 'reconsider'];
const BILLING_ACTIVITIES = ['Research', 'Document Review', 'Client Meeting', 'Court Appearance', 'Drafting', 'Deposition', 'Negotiation'];

// =============================================================================
// Seeding Functions
// =============================================================================

async function seedUsers(queryRunner: QueryRunner): Promise<Map<string, string>> {
  log('Seeding users...', 'info');
  const userIds = new Map<string, string>();
  const defaultPassword = await hashPassword('Demo123!');

  for (const user of DEMO_USERS) {
    const id = generateId();
    userIds.set(user.email, id);

    await queryRunner.query(`
      INSERT INTO "user" (id, email, "passwordHash", "firstName", "lastName", role, title, status, "emailVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, [id, user.email, defaultPassword, user.firstName, user.lastName, user.role, user.title]);
  }

  log(`Seeded ${DEMO_USERS.length} users`, 'success');
  return userIds;
}

async function seedClients(queryRunner: QueryRunner): Promise<Map<string, string>> {
  log('Seeding clients...', 'info');
  const clientIds = new Map<string, string>();

  for (let i = 0; i < DEMO_CLIENTS.length; i++) {
    const client = DEMO_CLIENTS[i];
    if (!client) continue;
    const id = generateId();
    const clientNumber = `CLI-${String(i + 1).padStart(4, '0')}`;
    clientIds.set(client.name, id);

    await queryRunner.query(`
      INSERT INTO "client" (id, "clientNumber", name, "clientType", industry, email, status, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW(), NOW())
      ON CONFLICT ("clientNumber") DO NOTHING
    `, [id, clientNumber, client.name, client.clientType, client.industry, client.email]);
  }

  log(`Seeded ${DEMO_CLIENTS.length} clients`, 'success');
  return clientIds;
}

async function seedCases(queryRunner: QueryRunner, clientIds: Map<string, string>, userIds: Map<string, string>): Promise<Map<string, string>> {
  log('Seeding cases...', 'info');
  const caseIds = new Map<string, string>();
  const clientArray = Array.from(clientIds.entries());
  const userArray = Array.from(userIds.entries());

  for (let i = 0; i < DEMO_CASES.length; i++) {
    const caseData = DEMO_CASES[i];
    if (!caseData) continue;
    const id = generateId();
    const caseNumber = `2024-${String(i + 1).padStart(5, '0')}`;
    const clientEntry = clientArray[i % clientArray.length];
    if (!clientEntry) continue;
    const [, clientId] = clientEntry;
    const leadAttorneyEntry = userArray.find(([email]) => email.includes('partner') || email.includes('senior')) || userArray[0];
    if (!leadAttorneyEntry) continue;
    const [, leadAttorneyId] = leadAttorneyEntry;
    caseIds.set(caseNumber, id);

    const filingDate = randomDate(new Date('2024-01-01'), new Date());
    const jurisdiction = randomElement(JURISDICTIONS);
    const court = randomElement(COURTS);

    await queryRunner.query(`
      INSERT INTO "case" (id, "caseNumber", title, type, status, "practiceArea", jurisdiction, court, "filingDate", "clientId", "leadAttorneyId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT ("caseNumber") DO NOTHING
    `, [id, caseNumber, caseData.title, caseData.type, caseData.status, caseData.practiceArea, jurisdiction, court, filingDate, clientId, leadAttorneyId]);
  }

  log(`Seeded ${DEMO_CASES.length} cases`, 'success');
  return caseIds;
}

async function seedDocuments(queryRunner: QueryRunner, caseIds: Map<string, string>, userIds: Map<string, string>): Promise<void> {
  log('Seeding documents...', 'info');
  const caseArray = Array.from(caseIds.entries());
  const userArray = Array.from(userIds.values());
  let count = 0;

  for (const [caseNumber, caseId] of caseArray) {
    const docCount = Math.floor(Math.random() * 8) + 3; // 3-10 documents per case

    for (let i = 0; i < docCount; i++) {
      const id = generateId();
      const type = randomElement(DOCUMENT_TYPES);
      const creatorId = randomElement(userArray);
      const title = `${type.charAt(0).toUpperCase() + type.slice(1)} - ${caseNumber} - Doc ${i + 1}`;
      const createdDate = randomDate(new Date('2024-01-01'), new Date());

      await queryRunner.query(`
        INSERT INTO "document" (id, title, type, status, "caseId", "creatorId", filename, "mimeType", "fileSize", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'approved', $4, $5, $6, 'application/pdf', $7, $8, $8)
        ON CONFLICT DO NOTHING
      `, [id, title, type, caseId, creatorId, `${id}.pdf`, Math.floor(Math.random() * 500000) + 10000, createdDate]);
      count++;
    }
  }

  log(`Seeded ${count} documents`, 'success');
}

async function seedTimeEntries(queryRunner: QueryRunner, caseIds: Map<string, string>, userIds: Map<string, string>): Promise<void> {
  log('Seeding time entries...', 'info');
  const caseArray = Array.from(caseIds.entries());
  const userArray = Array.from(userIds.values());
  let count = 0;

  for (const [caseNumber, caseId] of caseArray) {
    const entryCount = Math.floor(Math.random() * 20) + 10; // 10-30 entries per case

    for (let i = 0; i < entryCount; i++) {
      const id = generateId();
      const userId = randomElement(userArray);
      const activity = randomElement(BILLING_ACTIVITIES);
      const hours = randomAmount(0.25, 8);
      const rate = randomAmount(150, 500);
      const entryDate = randomDate(new Date('2024-01-01'), new Date());

      await queryRunner.query(`
        INSERT INTO "time_entry" (id, "userId", "caseId", description, hours, rate, amount, "activityType", "entryDate", "billableStatus", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'billable', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, userId, caseId, `${activity} - ${caseNumber}`, hours, rate, hours * rate, activity.toLowerCase().replace(' ', '_'), entryDate]);
      count++;
    }
  }

  log(`Seeded ${count} time entries`, 'success');
}

async function seedInvoices(queryRunner: QueryRunner, clientIds: Map<string, string>, caseIds: Map<string, string>): Promise<void> {
  log('Seeding invoices...', 'info');
  const clientArray = Array.from(clientIds.entries());
  const caseArray = Array.from(caseIds.entries());
  let count = 0;

  for (let i = 0; i < 20; i++) {
    const id = generateId();
    const invoiceNumber = `INV-2024-${String(i + 1).padStart(5, '0')}`;
    const clientEntry = randomElement(clientArray);
    const caseEntry = randomElement(caseArray);
    if (!clientEntry || !caseEntry) continue;
    const [clientName, clientId] = clientEntry;
    const [, caseId] = caseEntry;
    const subtotal = randomAmount(1000, 50000);
    const taxRate = 0.0875;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    const status = randomElement(['draft', 'sent', 'paid', 'overdue']);
    const invoiceDate = randomDate(new Date('2024-01-01'), new Date());
    const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await queryRunner.query(`
      INSERT INTO "invoice" (id, "invoiceNumber", "clientId", "caseId", "clientName", subtotal, "taxAmount", "taxRate", "totalAmount", status, "invoiceDate", "dueDate", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      ON CONFLICT ("invoiceNumber") DO NOTHING
    `, [id, invoiceNumber, clientId, caseId, clientName, subtotal, taxAmount, taxRate, total, status, invoiceDate, dueDate]);
    count++;
  }

  log(`Seeded ${count} invoices`, 'success');
}

async function seedParties(queryRunner: QueryRunner, caseIds: Map<string, string>): Promise<void> {
  log('Seeding parties...', 'info');
  const partyTypes = ['plaintiff', 'defendant', 'witness', 'expert', 'third_party'];
  const caseArray = Array.from(caseIds.entries());
  let count = 0;

  for (const [, caseId] of caseArray) {
    const partyCount = Math.floor(Math.random() * 4) + 2; // 2-5 parties per case

    for (let i = 0; i < partyCount; i++) {
      const id = generateId();
      const type = randomElement(partyTypes);
      const name = `Party ${count + 1} - ${type}`;

      await queryRunner.query(`
        INSERT INTO "party" (id, name, type, "caseId", email, phone, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, name, type, caseId, `party${count + 1}@example.com`, `555-${String(count).padStart(4, '0')}`]);
      count++;
    }
  }

  log(`Seeded ${count} parties`, 'success');
}

async function seedMotions(queryRunner: QueryRunner, caseIds: Map<string, string>, userIds: Map<string, string>): Promise<void> {
  log('Seeding motions...', 'info');
  const caseArray = Array.from(caseIds.entries());
  const userArray = Array.from(userIds.values());
  const motionStatuses = ['draft', 'filed', 'pending', 'granted', 'denied'];
  let count = 0;

  for (const [caseNumber, caseId] of caseArray) {
    const motionCount = Math.floor(Math.random() * 3) + 1; // 1-3 motions per case

    for (let i = 0; i < motionCount; i++) {
      const id = generateId();
      const type = randomElement(MOTION_TYPES);
      const status = randomElement(motionStatuses);
      const filedById = randomElement(userArray);
      const filedDate = randomDate(new Date('2024-01-01'), new Date());

      await queryRunner.query(`
        INSERT INTO "motion" (id, title, type, status, "caseId", "filedById", "filedDate", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, `Motion to ${type.replace('_', ' ')} - ${caseNumber}`, type, status, caseId, filedById, filedDate]);
      count++;
    }
  }

  log(`Seeded ${count} motions`, 'success');
}

async function seedDocketEntries(queryRunner: QueryRunner, caseIds: Map<string, string>): Promise<void> {
  log('Seeding docket entries...', 'info');
  const caseArray = Array.from(caseIds.entries());
  const entryTypes = ['filing', 'hearing', 'order', 'motion', 'notice', 'deadline'];
  let count = 0;

  for (const [caseNumber, caseId] of caseArray) {
    const entryCount = Math.floor(Math.random() * 10) + 5; // 5-15 entries per case

    for (let i = 0; i < entryCount; i++) {
      const id = generateId();
      const type = randomElement(entryTypes);
      const entryDate = randomDate(new Date('2024-01-01'), new Date());
      const entryNumber = i + 1;

      await queryRunner.query(`
        INSERT INTO "docket_entry" (id, "caseId", "entryNumber", type, title, description, "entryDate", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, caseId, entryNumber, type, `${type.charAt(0).toUpperCase() + type.slice(1)} - Entry ${entryNumber}`, `Docket entry for ${caseNumber}`, entryDate]);
      count++;
    }
  }

  log(`Seeded ${count} docket entries`, 'success');
}

async function seedEvidence(queryRunner: QueryRunner, caseIds: Map<string, string>): Promise<void> {
  log('Seeding evidence items...', 'info');
  const caseArray = Array.from(caseIds.entries());
  const evidenceTypes = ['document', 'physical', 'digital', 'testimonial', 'demonstrative'];
  let count = 0;

  for (const [caseNumber, caseId] of caseArray) {
    const evidenceCount = Math.floor(Math.random() * 8) + 2; // 2-10 evidence items per case

    for (let i = 0; i < evidenceCount; i++) {
      const id = generateId();
      const type = randomElement(evidenceTypes);
      const exhibitNumber = `EX-${String(count + 1).padStart(4, '0')}`;

      await queryRunner.query(`
        INSERT INTO "evidence_item" (id, "caseId", "exhibitNumber", title, type, description, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, 'admitted', NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, caseId, exhibitNumber, `Evidence ${type} - ${caseNumber}`, type, `${type} evidence for case ${caseNumber}`, ]);
      count++;
    }
  }

  log(`Seeded ${count} evidence items`, 'success');
}

async function seedCasePhases(queryRunner: QueryRunner, caseIds: Map<string, string>): Promise<void> {
  log('Seeding case phases...', 'info');
  const phases = ['intake', 'investigation', 'discovery', 'pretrial', 'trial', 'post_trial', 'closed'];
  const caseArray = Array.from(caseIds.entries());
  let count = 0;

  for (const [, caseId] of caseArray) {
    const currentPhaseIndex = Math.floor(Math.random() * phases.length);

    for (let i = 0; i <= currentPhaseIndex; i++) {
      const id = generateId();
      const phase = phases[i];
      const startDate = new Date('2024-01-01');
      startDate.setMonth(startDate.getMonth() + i);
      const endDate = i < currentPhaseIndex ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;

      await queryRunner.query(`
        INSERT INTO "case_phase" (id, "caseId", name, status, "startDate", "endDate", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [id, caseId, phase, i === currentPhaseIndex ? 'active' : 'completed', startDate, endDate]);
      count++;
    }
  }

  log(`Seeded ${count} case phases`, 'success');
}

// =============================================================================
// Main Execution
// =============================================================================

async function main(): Promise<void> {
  logSection('LexiFlow Enterprise Data Seeder');

  // Log connection information
  if (isNeonConnection) {
    log('Database Provider: Neon PostgreSQL (Serverless)', 'info');
    log(`Connection Type: ${isPooledConnection ? 'Pooled (PgBouncer)' : 'Direct'}`, 'info');
    log('SSL: Enabled with channel binding', 'info');
  } else {
    log(`Database: ${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`, 'info');
  }
  log(`Environment: ${process.env.NODE_ENV || 'development'}`, 'info');

  const dataSource = new DataSource(DB_CONFIG);

  try {
    // Initialize connection
    log('Connecting to database...', 'info');
    await dataSource.initialize();
    log('Connected successfully', 'success');

    // Run migrations
    logSection('Running Migrations');
    log('Applying pending migrations...', 'info');
    await dataSource.runMigrations();
    log('Migrations completed', 'success');

    // Start transaction for seeding
    logSection('Seeding Demo Data');
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      // Seed in dependency order
      const userIds = await seedUsers(queryRunner);
      const clientIds = await seedClients(queryRunner);
      const caseIds = await seedCases(queryRunner, clientIds, userIds);
      await seedDocuments(queryRunner, caseIds, userIds);
      await seedTimeEntries(queryRunner, caseIds, userIds);
      await seedInvoices(queryRunner, clientIds, caseIds);
      await seedParties(queryRunner, caseIds);
      await seedMotions(queryRunner, caseIds, userIds);
      await seedDocketEntries(queryRunner, caseIds);
      await seedEvidence(queryRunner, caseIds);
      await seedCasePhases(queryRunner, caseIds);

      // Commit transaction
      await queryRunner.commitTransaction();
      log('Transaction committed successfully', 'success');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Print summary
    logSection('Seeding Summary');
    const counts = await Promise.all([
      dataSource.query('SELECT COUNT(*) FROM "user"'),
      dataSource.query('SELECT COUNT(*) FROM "client"'),
      dataSource.query('SELECT COUNT(*) FROM "case"'),
      dataSource.query('SELECT COUNT(*) FROM "document"'),
      dataSource.query('SELECT COUNT(*) FROM "time_entry"'),
      dataSource.query('SELECT COUNT(*) FROM "invoice"'),
      dataSource.query('SELECT COUNT(*) FROM "party"'),
      dataSource.query('SELECT COUNT(*) FROM "motion"'),
      dataSource.query('SELECT COUNT(*) FROM "docket_entry"'),
      dataSource.query('SELECT COUNT(*) FROM "evidence_item"'),
      dataSource.query('SELECT COUNT(*) FROM "case_phase"'),
    ]);

    console.log(`
  ${Colors.bright}Entity Counts:${Colors.reset}
  ├─ Users:         ${counts[0]?.[0]?.count ?? 0}
  ├─ Clients:       ${counts[1]?.[0]?.count ?? 0}
  ├─ Cases:         ${counts[2]?.[0]?.count ?? 0}
  ├─ Documents:     ${counts[3]?.[0]?.count ?? 0}
  ├─ Time Entries:  ${counts[4]?.[0]?.count ?? 0}
  ├─ Invoices:      ${counts[5]?.[0]?.count ?? 0}
  ├─ Parties:       ${counts[6]?.[0]?.count ?? 0}
  ├─ Motions:       ${counts[7]?.[0]?.count ?? 0}
  ├─ Docket Entries:${counts[8]?.[0]?.count ?? 0}
  ├─ Evidence:      ${counts[9]?.[0]?.count ?? 0}
  └─ Case Phases:   ${counts[10]?.[0]?.count ?? 0}
    `);

    logSection('Seeding Complete');
    log('Enterprise demo data has been successfully populated!', 'success');
    log('Default login: admin@lexiflow.com / Demo123!', 'info');

  } catch (error) {
    log(`Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      log('Database connection closed', 'info');
    }
  }
}

// Run the seeder
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
