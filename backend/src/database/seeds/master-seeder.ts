import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

/**
 * Master Seeder for LexiFlow AI Legal Suite
 * Generates 500+ realistic test records across all entities
 * using Faker.js for production-like data
 */

// =====================================================
// LEGAL DOMAIN DATA GENERATORS
// =====================================================

const CASE_TYPES = [
  'Civil Litigation',
  'Criminal Defense',
  'Corporate Law',
  'Family Law',
  'Real Estate',
  'Employment Law',
  'Intellectual Property',
  'Tax Law',
  'Bankruptcy',
  'Personal Injury',
  'Immigration',
  'Environmental Law',
  'Healthcare Law',
  'Securities Law',
  'Antitrust Law',
];

const PRACTICE_AREAS = [
  'Business Litigation',
  'White Collar Defense',
  'Mergers & Acquisitions',
  'Divorce & Custody',
  'Property Transactions',
  'Labor Disputes',
  'Patent Prosecution',
  'Estate Planning',
  'Chapter 11 Bankruptcy',
  'Medical Malpractice',
  'Visa Applications',
  'Regulatory Compliance',
  'HIPAA Compliance',
  'SEC Filings',
  'Merger Review',
];

const DOCUMENT_TYPES = [
  'Complaint',
  'Answer',
  'Motion',
  'Brief',
  'Memorandum',
  'Order',
  'Judgment',
  'Deposition',
  'Interrogatory',
  'Contract',
  'Agreement',
  'Letter',
  'Email',
  'Invoice',
  'Receipt',
];

const COURT_NAMES = [
  'US District Court, Southern District of New York',
  'US District Court, Central District of California',
  'US District Court, Northern District of Illinois',
  'Superior Court of California, Los Angeles County',
  'Circuit Court of Cook County, Illinois',
  'Supreme Court of New York, New York County',
  'US Court of Appeals for the Second Circuit',
  'US Court of Appeals for the Ninth Circuit',
  'Delaware Court of Chancery',
  'Texas State District Court, Harris County',
];

const JUDGE_NAMES = [
  'Hon. Katherine Failla',
  'Hon. Richard Seeborg',
  'Hon. Matthew Kennelly',
  'Hon. Yvette Palazuelos',
  'Hon. Michael Toomin',
  'Hon. Melissa Crane',
  'Hon. Morgan Christen',
  'Hon. Mark Bennett',
  'Hon. Kathaleen McCormick',
  'Hon. Randy Wilson',
];

const CLIENT_TYPES = [
  'individual',
  'corporation',
  'partnership',
  'llc',
  'nonprofit',
  'government',
  'other',
];

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Energy',
  'Education',
  'Media',
  'Transportation',
  'Telecommunications',
  'Pharmaceuticals',
  'Biotechnology',
  'Consulting',
  'Insurance',
];

const USER_ROLES = [
  'attorney',
  'paralegal',
  'admin',
  'partner',
  'associate',
  'law_clerk',
  'legal_secretary',
];

const TIME_ENTRY_ACTIVITIES = [
  'Legal Research',
  'Document Review',
  'Client Meeting',
  'Court Appearance',
  'Deposition',
  'Conference Call',
  'Draft Pleading',
  'Review Contract',
  'Email Correspondence',
  'Case Strategy',
  'File Organization',
  'Document Preparation',
  'Expert Consultation',
  'Settlement Negotiation',
  'Trial Preparation',
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateCaseNumber(year: number, sequence: number): string {
  return `CASE-${year}-${sequence.toString().padStart(4, '0')}`;
}

function generateClientNumber(sequence: number): string {
  return `CLT-${sequence.toString().padStart(6, '0')}`;
}

function generateInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${sequence.toString().padStart(5, '0')}`;
}

// =====================================================
// SEED FUNCTIONS
// =====================================================

export async function seedUsersAdvanced(dataSource: DataSource, count: number = 50): Promise<any[]> {
  console.log(`\nSeeding ${count} users with Faker...`);
  const userRepository = dataSource.getRepository('User');

  // Check if users already exist
  const existingCount = await userRepository.count();
  if (existingCount >= count) {
    console.log(`Users already seeded (${existingCount} exist), skipping...`);
    const users = await userRepository.find({ take: count });
    return users;
  }

  const users = [];
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet.username({ firstName, lastName }).toLowerCase();
    const role = randomElement(USER_ROLES);

    const user = userRepository.create({
      username,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      phoneNumber: faker.phone.number(),
      barNumber: role === 'attorney' || role === 'partner' || role === 'associate'
        ? `BAR-${faker.number.int({ min: 100000, max: 999999 })}`
        : null,
      isActive: faker.datatype.boolean({ probability: 0.95 }),
      hourlyRate: [300, 350, 400, 450, 500, 550, 600][faker.number.int({ min: 0, max: 6 })],
      metadata: {
        department: randomElement(['Litigation', 'Corporate', 'IP', 'Tax', 'Real Estate']),
        officeLocation: faker.location.city(),
        yearsOfExperience: faker.number.int({ min: 1, max: 30 }),
        specializations: randomElements(PRACTICE_AREAS, faker.number.int({ min: 1, max: 3 })),
      },
    });

    try {
      const savedUser = await userRepository.save(user);
      users.push(savedUser);
    } catch (error) {
      console.error(`Error creating user ${username}:`, error.message);
    }
  }

  console.log(`✓ Seeded ${users.length} users`);
  return users;
}

export async function seedClientsAdvanced(dataSource: DataSource, count: number = 100): Promise<any[]> {
  console.log(`\nSeeding ${count} clients with Faker...`);
  const clientRepository = dataSource.getRepository('Client');

  const existingCount = await clientRepository.count();
  if (existingCount >= count) {
    console.log(`Clients already seeded (${existingCount} exist), skipping...`);
    const clients = await clientRepository.find({ take: count });
    return clients;
  }

  const clients = [];

  for (let i = 0; i < count; i++) {
    const clientType = randomElement(CLIENT_TYPES);
    const isIndividual = clientType === 'individual';

    const name = isIndividual
      ? faker.person.fullName()
      : faker.company.name();

    const client = clientRepository.create({
      clientNumber: generateClientNumber(i + 1),
      name,
      clientType,
      status: randomElement(['active', 'active', 'active', 'inactive', 'prospective']),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      fax: faker.datatype.boolean({ probability: 0.3 }) ? faker.phone.number() : null,
      website: !isIndividual ? faker.internet.url() : null,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'United States',
      billingAddress: faker.datatype.boolean({ probability: 0.7 })
        ? faker.location.streetAddress()
        : faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingState: faker.location.state(),
      billingZipCode: faker.location.zipCode(),
      billingCountry: 'United States',
      taxId: !isIndividual ? faker.number.int({ min: 100000000, max: 999999999 }).toString() : null,
      industry: !isIndividual ? randomElement(INDUSTRIES) : null,
      establishedDate: !isIndividual ? faker.date.past({ years: 50 }) : null,
      primaryContactName: faker.person.fullName(),
      primaryContactEmail: faker.internet.email(),
      primaryContactPhone: faker.phone.number(),
      primaryContactTitle: !isIndividual ? faker.person.jobTitle() : null,
      referralSource: randomElement(['Website', 'Referral', 'Advertisement', 'Social Media', 'Event', 'Other']),
      clientSince: faker.date.past({ years: 10 }),
      paymentTerms: randomElement(['net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt']),
      preferredPaymentMethod: randomElement(['Check', 'Wire Transfer', 'Credit Card', 'ACH']),
      creditLimit: faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }),
      currentBalance: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
      totalBilled: faker.number.float({ min: 50000, max: 5000000, fractionDigits: 2 }),
      totalPaid: faker.number.float({ min: 40000, max: 4500000, fractionDigits: 2 }),
      totalCases: faker.number.int({ min: 1, max: 50 }),
      activeCases: faker.number.int({ min: 0, max: 10 }),
      isVip: faker.datatype.boolean({ probability: 0.15 }),
      requiresConflictCheck: faker.datatype.boolean({ probability: 0.8 }),
      hasRetainer: faker.datatype.boolean({ probability: 0.4 }),
      retainerAmount: faker.datatype.boolean({ probability: 0.4 })
        ? faker.number.float({ min: 10000, max: 100000, fractionDigits: 2 })
        : null,
      retainerBalance: faker.datatype.boolean({ probability: 0.4 })
        ? faker.number.float({ min: 0, max: 50000, fractionDigits: 2 })
        : null,
      customFields: {
        preferredLanguage: randomElement(['English', 'Spanish', 'French', 'German', 'Mandarin']),
        riskLevel: randomElement(['Low', 'Medium', 'High']),
        accountManager: faker.person.fullName(),
      },
      tags: randomElements(['VIP', 'High-Value', 'Recurring', 'Litigation', 'Corporate', 'Risk'], faker.number.int({ min: 0, max: 3 })),
      notes: faker.datatype.boolean({ probability: 0.6 }) ? faker.lorem.paragraph() : null,
      metadata: {
        acquisitionChannel: randomElement(['Direct', 'Referral', 'Marketing', 'Partner']),
        lifetimeValue: faker.number.float({ min: 50000, max: 5000000, fractionDigits: 2 }),
      },
    });

    try {
      const savedClient = await clientRepository.save(client);
      clients.push(savedClient);
    } catch (error) {
      console.error(`Error creating client:`, error.message);
    }
  }

  console.log(`✓ Seeded ${clients.length} clients`);
  return clients;
}

export async function seedCasesAdvanced(
  dataSource: DataSource,
  clients: any[],
  count: number = 150
): Promise<any[]> {
  console.log(`\nSeeding ${count} cases with Faker...`);
  const caseRepository = dataSource.getRepository('Case');

  const existingCount = await caseRepository.count();
  if (existingCount >= count) {
    console.log(`Cases already seeded (${existingCount} exist), skipping...`);
    const cases = await caseRepository.find({ take: count });
    return cases;
  }

  const cases = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const filingYear = faker.date.between({
      from: new Date(currentYear - 5, 0, 1),
      to: new Date(),
    }).getFullYear();

    const caseType = randomElement(CASE_TYPES);
    const practiceArea = randomElement(PRACTICE_AREAS);
    const status = randomElement(['open', 'open', 'open', 'pending', 'closed', 'on_hold']);
    const filingDate = faker.date.between({
      from: new Date(filingYear, 0, 1),
      to: new Date(),
    });

    const closedDate = status === 'closed'
      ? faker.date.between({ from: filingDate, to: new Date() })
      : null;

    const caseEntity = caseRepository.create({
      caseNumber: generateCaseNumber(filingYear, faker.number.int({ min: 1, max: 9999 })),
      title: `${faker.company.name()} v. ${faker.company.name()}`,
      caseType,
      status,
      clientId: randomElement(clients).id,
      filingDate,
      closedDate,
      description: faker.lorem.paragraph({ min: 2, max: 5 }),
      practiceArea,
      courtName: randomElement(COURT_NAMES),
      judgeAssigned: randomElement(JUDGE_NAMES),
      estimatedValue: faker.number.float({ min: 10000, max: 10000000, fractionDigits: 2 }),
      isConfidential: faker.datatype.boolean({ probability: 0.3 }),
      metadata: {
        urgency: randomElement(['Low', 'Medium', 'High', 'Critical']),
        complexity: randomElement(['Simple', 'Moderate', 'Complex', 'Highly Complex']),
        outcome: status === 'closed'
          ? randomElement(['won', 'lost', 'settled', 'dismissed', 'settled_favorably'])
          : null,
        caseManager: faker.person.fullName(),
        jurisdictionCode: faker.location.state({ abbreviated: true }),
        tags: randomElements(['Urgent', 'High-Stakes', 'Class Action', 'Multi-District', 'Appeal'], faker.number.int({ min: 0, max: 3 })),
      },
    });

    try {
      const savedCase = await caseRepository.save(caseEntity);
      cases.push(savedCase);
    } catch (error) {
      console.error(`Error creating case:`, error.message);
    }
  }

  console.log(`✓ Seeded ${cases.length} cases`);
  return cases;
}

export async function seedDocumentsAdvanced(
  dataSource: DataSource,
  cases: any[],
  users: any[],
  count: number = 300
): Promise<any[]> {
  console.log(`\nSeeding ${count} documents with Faker...`);
  const documentRepository = dataSource.getRepository('LegalDocument');

  const existingCount = await documentRepository.count();
  if (existingCount >= count) {
    console.log(`Documents already seeded (${existingCount} exist), skipping...`);
    const documents = await documentRepository.find({ take: count });
    return documents;
  }

  const documents = [];

  for (let i = 0; i < count; i++) {
    const documentType = randomElement(DOCUMENT_TYPES);
    const caseEntity = randomElement(cases);

    const document = documentRepository.create({
      title: `${documentType} - ${faker.lorem.words(3)}`,
      documentType,
      description: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(5, '\n\n'),
      caseId: caseEntity.id,
      filePath: `/documents/${caseEntity.caseNumber}/${faker.system.fileName()}`,
      fileName: `${documentType.toLowerCase().replace(/\s+/g, '-')}-${faker.string.alphanumeric(8)}.pdf`,
      fileSize: faker.number.int({ min: 50000, max: 5000000 }),
      mimeType: 'application/pdf',
      status: randomElement(['draft', 'draft', 'final', 'final', 'filed', 'archived']),
      version: faker.number.int({ min: 1, max: 5 }),
      createdBy: randomElement(users).id,
      tags: randomElements(['Important', 'Confidential', 'Filed', 'Draft', 'Review Required'], faker.number.int({ min: 1, max: 3 })),
      metadata: {
        author: faker.person.fullName(),
        reviewedBy: faker.person.fullName(),
        approvedBy: faker.datatype.boolean({ probability: 0.7 }) ? faker.person.fullName() : null,
        filingDate: faker.datatype.boolean({ probability: 0.4 }) ? faker.date.recent() : null,
        documentDate: faker.date.recent({ days: 90 }),
        pageCount: faker.number.int({ min: 1, max: 200 }),
        classification: randomElement(['Public', 'Confidential', 'Privileged', 'Work Product']),
      },
    });

    try {
      const savedDocument = await documentRepository.save(document);
      documents.push(savedDocument);
    } catch (error) {
      console.error(`Error creating document:`, error.message);
    }
  }

  console.log(`✓ Seeded ${documents.length} documents`);
  return documents;
}

export async function seedTimeEntriesAdvanced(
  dataSource: DataSource,
  cases: any[],
  users: any[],
  count: number = 500
): Promise<any[]> {
  console.log(`\nSeeding ${count} time entries with Faker...`);
  const timeEntryRepository = dataSource.getRepository('TimeEntry');

  const existingCount = await timeEntryRepository.count();
  if (existingCount >= count) {
    console.log(`Time entries already seeded (${existingCount} exist), skipping...`);
    const entries = await timeEntryRepository.find({ take: count });
    return entries;
  }

  const entries = [];

  for (let i = 0; i < count; i++) {
    const user = randomElement(users);
    const hours = faker.number.float({ min: 0.25, max: 10, fractionDigits: 2 });
    const rate = user.hourlyRate || 400;

    const entry = timeEntryRepository.create({
      userId: user.id,
      caseId: randomElement(cases).id,
      date: faker.date.recent({ days: 180 }),
      hours,
      description: `${randomElement(TIME_ENTRY_ACTIVITIES)} - ${faker.lorem.sentence()}`,
      activity: randomElement(TIME_ENTRY_ACTIVITIES),
      isBillable: faker.datatype.boolean({ probability: 0.85 }),
      rate,
      amount: hours * rate,
      status: randomElement(['draft', 'submitted', 'submitted', 'approved', 'approved']),
      metadata: {
        location: randomElement(['Office', 'Court', 'Client Site', 'Remote']),
        taskCode: `TASK-${faker.number.int({ min: 1000, max: 9999 })}`,
        billableStatus: randomElement(['Billable', 'Non-Billable', 'No-Charge', 'Write-Off']),
      },
    });

    try {
      const savedEntry = await timeEntryRepository.save(entry);
      entries.push(savedEntry);
    } catch (error) {
      console.error(`Error creating time entry:`, error.message);
    }
  }

  console.log(`✓ Seeded ${entries.length} time entries`);
  return entries;
}

export async function seedInvoicesAdvanced(
  dataSource: DataSource,
  cases: any[],
  clients: any[],
  count: number = 80
): Promise<any[]> {
  console.log(`\nSeeding ${count} invoices with Faker...`);
  const invoiceRepository = dataSource.getRepository('Invoice');

  const existingCount = await invoiceRepository.count();
  if (existingCount >= count) {
    console.log(`Invoices already seeded (${existingCount} exist), skipping...`);
    const invoices = await invoiceRepository.find({ take: count });
    return invoices;
  }

  const invoices = [];
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const invoiceDate = faker.date.recent({ days: 365 });
    const dueDate = faker.date.soon({ days: 30, refDate: invoiceDate });
    const status = randomElement(['draft', 'sent', 'sent', 'paid', 'paid', 'overdue', 'cancelled']);
    const amount = faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 });
    const caseEntity = randomElement(cases);

    const invoice = invoiceRepository.create({
      invoiceNumber: generateInvoiceNumber(currentYear, i + 1),
      caseId: caseEntity.id,
      clientId: caseEntity.clientId,
      invoiceDate,
      dueDate,
      status,
      subtotal: amount,
      taxRate: faker.number.float({ min: 0, max: 10, fractionDigits: 2 }),
      taxAmount: amount * (faker.number.float({ min: 0, max: 10, fractionDigits: 2 }) / 100),
      amount: amount * (1 + faker.number.float({ min: 0, max: 10, fractionDigits: 2 }) / 100),
      paidAmount: status === 'paid' ? amount : 0,
      balanceDue: status === 'paid' ? 0 : amount,
      paidDate: status === 'paid' ? faker.date.soon({ days: 30, refDate: invoiceDate }) : null,
      notes: faker.datatype.boolean({ probability: 0.5 }) ? faker.lorem.sentence() : null,
      metadata: {
        paymentMethod: status === 'paid' ? randomElement(['Check', 'Wire', 'Credit Card', 'ACH']) : null,
        billingPeriodStart: faker.date.recent({ days: 60 }),
        billingPeriodEnd: faker.date.recent({ days: 30 }),
        approvedBy: faker.person.fullName(),
      },
    });

    try {
      const savedInvoice = await invoiceRepository.save(invoice);
      invoices.push(savedInvoice);
    } catch (error) {
      console.error(`Error creating invoice:`, error.message);
    }
  }

  console.log(`✓ Seeded ${invoices.length} invoices`);
  return invoices;
}

// =====================================================
// MASTER SEED FUNCTION
// =====================================================

export async function runMasterSeeder(dataSource: DataSource): Promise<void> {
  console.log('===========================================');
  console.log('LexiFlow Master Seeder - Advanced Data Generation');
  console.log('Using Faker.js for realistic test data');
  console.log('===========================================\n');

  try {
    // Seed users first
    const users = await seedUsersAdvanced(dataSource, 50);

    // Seed clients
    const clients = await seedClientsAdvanced(dataSource, 100);

    // Seed cases
    const cases = await seedCasesAdvanced(dataSource, clients, 150);

    // Seed documents
    const documents = await seedDocumentsAdvanced(dataSource, cases, users, 300);

    // Seed time entries
    const timeEntries = await seedTimeEntriesAdvanced(dataSource, cases, users, 500);

    // Seed invoices
    const invoices = await seedInvoicesAdvanced(dataSource, cases, clients, 80);

    console.log('\n===========================================');
    console.log('✓ Master Seeding Completed Successfully!');
    console.log('===========================================\n');

    // Print comprehensive summary
    console.log('Summary of Seeded Data:');
    console.log(`  Users:        ${users.length}`);
    console.log(`  Clients:      ${clients.length}`);
    console.log(`  Cases:        ${cases.length}`);
    console.log(`  Documents:    ${documents.length}`);
    console.log(`  Time Entries: ${timeEntries.length}`);
    console.log(`  Invoices:     ${invoices.length}`);
    console.log(`  TOTAL:        ${users.length + clients.length + cases.length + documents.length + timeEntries.length + invoices.length} records`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error in master seeding:', error);
    throw error;
  }
}
