import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { DataFactory } from './factories/data-factory';

// Import entities
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { Client } from '../../entities/client.entity';
import { Case } from '../../entities/case.entity';
import { Party } from '../../entities/party.entity';
import { Motion } from '../../entities/motion.entity';
import { DocketEntry } from '../../entities/docket-entry.entity';
import { LegalDocument } from '../../entities/legal-document.entity';
import { TimeEntry } from '../../entities/time-entry.entity';
import { Invoice } from '../../entities/invoice.entity';
import { FirmExpense } from '../../entities/firm-expense.entity';
import { DiscoveryRequest } from '../../entities/discovery-request.entity';
import { Deposition } from '../../entities/deposition.entity';
import { EvidenceItem } from '../../entities/evidence-item.entity';
import { Notification } from '../../entities/notification.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Project } from '../../entities/project.entity';

@Injectable()
export class ComprehensiveSeederService {
  private readonly logger = new Logger(ComprehensiveSeederService.name);

  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async seedAll(): Promise<void> {
    this.logger.log('Starting comprehensive database seeding...');

    try {
      // Seed in order of dependencies
      const organizations = await this.seedOrganizations(5);
      const users = await this.seedUsers(50);
      const clients = await this.seedClients(100);
      const cases = await this.seedCases(200, clients, users);
      const parties = await this.seedParties(400, cases);
      const documents = await this.seedDocuments(500, cases, users);
      const motions = await this.seedMotions(150, cases);
      const docketEntries = await this.seedDocketEntries(800, cases);
      const timeEntries = await this.seedTimeEntries(2000, cases, users);
      const expenses = await this.seedExpenses(500, cases, users);
      const invoices = await this.seedInvoices(300, cases, clients, timeEntries);
      const discoveryRequests = await this.seedDiscoveryRequests(200, cases);
      const depositions = await this.seedDepositions(100, cases);
      const evidenceItems = await this.seedEvidenceItems(300, cases);
      const notifications = await this.seedNotifications(1000, users);
      const auditLogs = await this.seedAuditLogs(2000, users);
      const projects = await this.seedProjects(500, cases);

      this.logger.log('✓ Comprehensive database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      throw error;
    }
  }

  private async seedOrganizations(count: number): Promise<Organization[]> {
    this.logger.log(`Seeding ${count} organizations...`);
    const orgRepo = this.dataSource.getRepository(Organization);

    const organizations: Organization[] = [];
    for (let i = 0; i < count; i++) {
      const org = orgRepo.create({
        name: faker.company.name(),
        legalName: `${faker.company.name()} ${faker.company.companySuffix()}`,
        organizationType: faker.helpers.arrayElement([
          'corporation',
          'llc',
          'partnership',
          'sole_proprietorship',
          'nonprofit',
        ]),
        taxId: `${faker.number.int({ min: 10, max: 99 })}-${faker.number.int({ min: 1000000, max: 9999999 })}`,
        registrationNumber: `REG-${faker.number.int({ min: 100000, max: 999999 })}`,
        jurisdiction: faker.location.state(),
        incorporationDate: faker.date.past({ years: 10 }),
        status: 'active',
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        country: 'United States',
        phone: faker.phone.number(),
        email: faker.internet.email().toLowerCase(),
        website: faker.internet.url(),
        industry: faker.company.buzzNoun(),
        description: faker.company.catchPhrase(),
        numberOfEmployees: faker.number.int({ min: 10, max: 10000 }),
        annualRevenue: faker.number.float({ min: 1000000, max: 100000000, fractionDigits: 2 }),
      });
      organizations.push(org);
    }

    await orgRepo.save(organizations);
    this.logger.log(`✓ Seeded ${organizations.length} organizations`);
    return organizations;
  }

  private async seedUsers(count: number): Promise<User[]> {
    this.logger.log(`Seeding ${count} users...`);
    const userRepo = this.dataSource.getRepository(User);

    const roles = ['partner', 'senior_associate', 'associate', 'junior_associate', 'paralegal', 'legal_assistant', 'clerk'];
    const departments = ['Corporate Law', 'Litigation', 'IP Law', 'Family Law', 'Criminal Defense', 'Estate Planning'];
    const locations = ['New York', 'San Francisco', 'Chicago', 'Dallas', 'Seattle', 'Boston', 'Los Angeles'];

    const password = await bcrypt.hash('password123', 10);
    const users: User[] = [];

    for (let i = 0; i < count; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const role = faker.helpers.arrayElement(roles);

      const user = userRepo.create({
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password,
        firstName,
        lastName,
        role,
        department: faker.helpers.arrayElement(departments),
        title: this.getTitleForRole(role),
        phone: faker.phone.number(),
        extension: faker.number.int({ min: 100, max: 999 }).toString(),
        mobilePhone: faker.phone.number(),
        isActive: true,
        isVerified: faker.datatype.boolean(0.9),
        employeeId: `EMP-${String(i + 1).padStart(4, '0')}`,
        hireDate: faker.date.past({ years: 10 }),
        officeLocation: faker.helpers.arrayElement(locations),
        timeZone: 'America/New_York',
        language: 'en',
      });
      users.push(user);
    }

    await userRepo.save(users);
    this.logger.log(`✓ Seeded ${users.length} users`);
    return users;
  }

  private async seedClients(count: number): Promise<Client[]> {
    this.logger.log(`Seeding ${count} clients...`);
    const clientRepo = this.dataSource.getRepository(Client);

    const clients: Client[] = [];
    for (let i = 0; i < count; i++) {
      const clientType = faker.helpers.arrayElement(['individual', 'corporation', 'partnership', 'llc', 'nonprofit']);
      const name = clientType === 'individual' ? faker.person.fullName() : faker.company.name();

      const client = clientRepo.create({
        clientNumber: DataFactory.generateClientNumber(i + 1),
        name,
        clientType,
        status: faker.helpers.arrayElement(['active', 'inactive', 'prospective']),
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        country: 'United States',
        primaryContactName: faker.person.fullName(),
        primaryContactEmail: faker.internet.email().toLowerCase(),
        primaryContactPhone: faker.phone.number(),
        clientSince: faker.date.past({ years: 5 }),
        paymentTerms: faker.helpers.arrayElement(['net_15', 'net_30', 'net_45', 'net_60']),
        creditLimit: faker.number.float({ min: 10000, max: 500000, fractionDigits: 2 }),
        currentBalance: faker.number.float({ min: 0, max: 50000, fractionDigits: 2 }),
        totalBilled: faker.number.float({ min: 50000, max: 1000000, fractionDigits: 2 }),
        totalPaid: faker.number.float({ min: 40000, max: 950000, fractionDigits: 2 }),
        isVip: faker.datatype.boolean(0.2),
      });
      clients.push(client);
    }

    await clientRepo.save(clients);
    this.logger.log(`✓ Seeded ${clients.length} clients`);
    return clients;
  }

  private async seedCases(count: number, clients: Client[], users: User[]): Promise<Case[]> {
    this.logger.log(`Seeding ${count} cases...`);
    const caseRepo = this.dataSource.getRepository(Case);

    const caseTypes = ['civil', 'criminal', 'family', 'corporate', 'bankruptcy', 'probate'];
    const practiceAreas = ['Civil Litigation', 'Criminal Defense', 'Family Law', 'Corporate Law', 'Estate Planning', 'IP Law'];
    const startYear = 2022;

    const cases: Case[] = [];
    for (let i = 0; i < count; i++) {
      const year = faker.number.int({ min: startYear, max: 2024 });
      const caseType = faker.helpers.arrayElement(caseTypes);

      const caseEntity = caseRepo.create({
        caseNumber: DataFactory.generateCaseNumber(year, i + 1),
        title: DataFactory.generateCaseTitle(caseType),
        caseType: caseType,
        status: faker.helpers.arrayElement(['open', 'pending', 'closed', 'on_hold']),
        clientId: faker.helpers.arrayElement(clients).id,
        filingDate: faker.date.between({ from: new Date(`${year}-01-01`), to: new Date(`${year}-12-31`) }),
        description: faker.lorem.paragraph(),
        practiceArea: faker.helpers.arrayElement(practiceAreas),
        courtName: DataFactory.generateCourtName(),
        judgeAssigned: DataFactory.generateJudgeName(),
        estimatedValue: faker.number.float({ min: 10000, max: 5000000, fractionDigits: 2 }),
        isConfidential: faker.datatype.boolean(0.3),
      });
      cases.push(caseEntity);
    }

    await caseRepo.save(cases);
    this.logger.log(`✓ Seeded ${cases.length} cases`);
    return cases;
  }

  private async seedParties(count: number, cases: Case[]): Promise<Party[]> {
    this.logger.log(`Seeding ${count} parties...`);
    const partyRepo = this.dataSource.getRepository(Party);

    const roles = ['plaintiff', 'defendant', 'petitioner', 'respondent', 'appellant', 'appellee', 'third_party'];
    const types = ['individual', 'corporation', 'government', 'organization'];

    const parties: Party[] = [];
    for (let i = 0; i < count; i++) {
      const type = faker.helpers.arrayElement(types);
      const party = partyRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        name: type === 'individual' ? faker.person.fullName() : faker.company.name(),
        role: faker.helpers.arrayElement(roles),
        type,
        email: faker.internet.email().toLowerCase(),
        phone: faker.phone.number(),
        address: DataFactory.generateLegalAddress(),
        attorney: faker.person.fullName(),
        attorneyFirm: faker.company.name(),
        attorneyPhone: faker.phone.number(),
        attorneyEmail: faker.internet.email().toLowerCase(),
        isActive: true,
      });
      parties.push(party);
    }

    await partyRepo.save(parties);
    this.logger.log(`✓ Seeded ${parties.length} parties`);
    return parties;
  }

  private async seedDocuments(count: number, cases: Case[], users: User[]): Promise<LegalDocument[]> {
    this.logger.log(`Seeding ${count} documents...`);
    const docRepo = this.dataSource.getRepository(LegalDocument);

    const docTypes = ['contract', 'motion', 'brief', 'pleading', 'discovery', 'correspondence', 'memorandum'];
    const statuses = ['draft', 'review', 'approved', 'final'];

    const documents: LegalDocument[] = [];
    for (let i = 0; i < count; i++) {
      const docType = faker.helpers.arrayElement(docTypes);
      const document = docRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        title: DataFactory.generateDocumentTitle(docType),
        documentType: docType,
        filePath: `/documents/${faker.system.fileName()}`,
        fileName: `${faker.system.commonFileName('pdf')}`,
        fileExtension: 'pdf',
        fileSize: faker.number.int({ min: 10000, max: 5000000 }),
        mimeType: 'application/pdf',
        version: 1,
        status: faker.helpers.arrayElement(statuses),
        createdBy: faker.helpers.arrayElement(users).id,
        description: faker.lorem.sentence(),
        tags: faker.helpers.arrayElements(['important', 'confidential', 'draft', 'final', 'filed'], faker.number.int({ min: 1, max: 3 })),
        isConfidential: faker.datatype.boolean(0.4),
        isPrivileged: faker.datatype.boolean(0.3),
        pageCount: faker.number.int({ min: 1, max: 500 }),
      });
      documents.push(document);
    }

    await docRepo.save(documents);
    this.logger.log(`✓ Seeded ${documents.length} documents`);
    return documents;
  }

  private async seedMotions(count: number, cases: Case[]): Promise<Motion[]> {
    this.logger.log(`Seeding ${count} motions...`);
    const motionRepo = this.dataSource.getRepository(Motion);

    const motionTypes = [
      'motion_to_dismiss',
      'motion_for_summary_judgment',
      'motion_in_limine',
      'motion_to_compel',
      'motion_for_extension',
    ];
    const statuses = ['draft', 'filed', 'pending', 'granted', 'denied', 'partially_granted'];

    const motions: Motion[] = [];
    for (let i = 0; i < count; i++) {
      const filingDate = faker.date.recent({ days: 365 });
      const motion = motionRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        title: DataFactory.generateDocumentTitle('motion'),
        type: faker.helpers.arrayElement(motionTypes),
        filingDate,
        status: faker.helpers.arrayElement(statuses),
        dueDate: faker.date.future({ years: 0.25, refDate: filingDate }),
        hearingDate: faker.date.future({ years: 0.5, refDate: filingDate }),
        filedBy: faker.person.fullName(),
        opposedBy: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        legalBasis: faker.lorem.paragraph(),
        requestedRelief: faker.lorem.sentence(),
      });
      motions.push(motion);
    }

    await motionRepo.save(motions);
    this.logger.log(`✓ Seeded ${motions.length} motions`);
    return motions;
  }

  private async seedDocketEntries(count: number, cases: Case[]): Promise<DocketEntry[]> {
    this.logger.log(`Seeding ${count} docket entries...`);
    const docketRepo = this.dataSource.getRepository(DocketEntry);

    const types = ['filing', 'order', 'hearing', 'motion', 'notice', 'judgment', 'pleading'];

    const entries: DocketEntry[] = [];
    for (let i = 0; i < count; i++) {
      const entry = docketRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        entryNumber: i + 1,
        date: faker.date.recent({ days: 365 }),
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(types),
        filedBy: faker.person.fullName(),
        documentTitle: faker.lorem.words(5),
        pageCount: faker.number.int({ min: 1, max: 100 }),
        isSealed: faker.datatype.boolean(0.1),
        isConfidential: faker.datatype.boolean(0.2),
      });
      entries.push(entry);
    }

    await docketRepo.save(entries);
    this.logger.log(`✓ Seeded ${entries.length} docket entries`);
    return entries;
  }

  private async seedTimeEntries(count: number, cases: Case[], users: User[]): Promise<TimeEntry[]> {
    this.logger.log(`Seeding ${count} time entries...`);
    const timeRepo = this.dataSource.getRepository(TimeEntry);

    const statuses = ['draft', 'submitted', 'approved', 'invoiced'];

    const entries: TimeEntry[] = [];
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      const rate = DataFactory.generateBillingRate(user.role);
      const hours = faker.number.float({ min: 0.25, max: 12, fractionDigits: 2 });
      const amount = parseFloat((rate * hours).toFixed(2));

      const entry = timeRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        userId: user.id,
        date: faker.date.recent({ days: 90 }),
        hours,
        description: DataFactory.generateTimeEntryDescription(),
        rate,
        amount,
        billable: faker.datatype.boolean(0.85),
        status: faker.helpers.arrayElement(statuses),
        activityCode: `ACT-${faker.number.int({ min: 100, max: 999 })}`,
      });
      entries.push(entry);
    }

    await timeRepo.save(entries);
    this.logger.log(`✓ Seeded ${entries.length} time entries`);
    return entries;
  }

  private async seedExpenses(count: number, cases: Case[], users: User[]): Promise<FirmExpense[]> {
    this.logger.log(`Seeding ${count} expenses...`);
    const expenseRepo = this.dataSource.getRepository(FirmExpense);

    const categories = [
      'travel',
      'meals',
      'filing_fees',
      'expert_fees',
      'research',
      'copying',
      'postage',
      'courier',
    ];
    const statuses = ['draft', 'submitted', 'approved', 'invoiced', 'paid'];

    const expenses: FirmExpense[] = [];
    for (let i = 0; i < count; i++) {
      const category = faker.helpers.arrayElement(categories);
      const expense = expenseRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        userId: faker.helpers.arrayElement(users).id,
        description: DataFactory.generateExpenseDescription(category),
        amount: faker.number.float({ min: 10, max: 5000, fractionDigits: 2 }),
        expenseDate: faker.date.recent({ days: 90 }),
        category,
        vendor: faker.company.name(),
        receiptNumber: `RCT-${faker.number.int({ min: 100000, max: 999999 })}`,
        paymentMethod: faker.helpers.arrayElement(['credit_card', 'check', 'cash', 'reimbursement']),
        billable: faker.datatype.boolean(0.7),
        reimbursable: faker.datatype.boolean(0.4),
        status: faker.helpers.arrayElement(statuses),
      });
      expenses.push(expense);
    }

    await expenseRepo.save(expenses);
    this.logger.log(`✓ Seeded ${expenses.length} expenses`);
    return expenses;
  }

  private async seedInvoices(
    count: number,
    cases: Case[],
    clients: Client[],
    timeEntries: TimeEntry[],
  ): Promise<Invoice[]> {
    this.logger.log(`Seeding ${count} invoices...`);
    const invoiceRepo = this.dataSource.getRepository(Invoice);

    const statuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue'];

    const invoices: Invoice[] = [];
    for (let i = 0; i < count; i++) {
      const invoiceDate = faker.date.recent({ days: 180 });
      const subtotal = faker.number.float({ min: 1000, max: 50000, fractionDigits: 2 });
      const taxRate = 0.0;
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;
      const paidAmount = faker.datatype.boolean(0.6) ? totalAmount : faker.number.float({ min: 0, max: totalAmount, fractionDigits: 2 });
      const balanceAmount = totalAmount - paidAmount;

      const invoice = invoiceRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        clientId: faker.helpers.arrayElement(clients).id,
        invoiceNumber: DataFactory.generateInvoiceNumber(2024, i % 12 + 1, i + 1),
        invoiceDate,
        dueDate: faker.date.future({ years: 0.08, refDate: invoiceDate }),
        subtotal,
        taxAmount,
        taxRate,
        totalAmount,
        paidAmount,
        balanceAmount,
        status: faker.helpers.arrayElement(statuses),
        paymentMethod: paidAmount > 0 ? faker.helpers.arrayElement(['check', 'credit_card', 'wire_transfer', 'ach']) : null,
      });
      invoices.push(invoice);
    }

    await invoiceRepo.save(invoices);
    this.logger.log(`✓ Seeded ${invoices.length} invoices`);
    return invoices;
  }

  private async seedDiscoveryRequests(count: number, cases: Case[]): Promise<DiscoveryRequest[]> {
    this.logger.log(`Seeding ${count} discovery requests...`);
    const discoveryRepo = this.dataSource.getRepository(DiscoveryRequest);

    const types = [
      'interrogatories',
      'requests_for_production',
      'requests_for_admission',
      'subpoena',
      'deposition_notice',
    ];
    const statuses = ['draft', 'sent', 'received', 'in_progress', 'completed', 'overdue'];

    const requests: DiscoveryRequest[] = [];
    for (let i = 0; i < count; i++) {
      const requestDate = faker.date.recent({ days: 180 });
      const request = discoveryRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        type: faker.helpers.arrayElement(types),
        requestNumber: `DISC-${String(i + 1).padStart(5, '0')}`,
        title: `${faker.helpers.arrayElement(types).replace(/_/g, ' ')} - Set ${faker.number.int({ min: 1, max: 5 })}`,
        requestDate,
        dueDate: faker.date.future({ years: 0.08, refDate: requestDate }),
        status: faker.helpers.arrayElement(statuses),
        requestedBy: faker.person.fullName(),
        requestedFrom: faker.person.fullName(),
        description: faker.lorem.paragraph(),
        numberOfItems: faker.number.int({ min: 5, max: 50 }),
        hasObjections: faker.datatype.boolean(0.3),
        completionPercentage: faker.number.int({ min: 0, max: 100 }),
      });
      requests.push(request);
    }

    await discoveryRepo.save(requests);
    this.logger.log(`✓ Seeded ${requests.length} discovery requests`);
    return requests;
  }

  private async seedDepositions(count: number, cases: Case[]): Promise<Deposition[]> {
    this.logger.log(`Seeding ${count} depositions...`);
    const depositionRepo = this.dataSource.getRepository(Deposition);

    const statuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    const deponentTypes = ['fact_witness', 'expert_witness', 'party', 'corporate_representative'];

    const depositions: Deposition[] = [];
    for (let i = 0; i < count; i++) {
      const deposition = depositionRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        deponentName: faker.person.fullName(),
        depositionDate: faker.date.future({ years: 0.25 }),
        startTime: '09:00',
        endTime: '17:00',
        location: DataFactory.generateLegalAddress(),
        status: faker.helpers.arrayElement(statuses),
        deponentType: faker.helpers.arrayElement(deponentTypes),
        conductedBy: faker.person.fullName(),
        defendedBy: faker.person.fullName(),
        courtReporter: faker.person.fullName(),
        isVideoRecorded: faker.datatype.boolean(0.6),
        isRemote: faker.datatype.boolean(0.5),
        durationMinutes: faker.number.int({ min: 120, max: 480 }),
        estimatedCost: faker.number.float({ min: 500, max: 5000, fractionDigits: 2 }),
      });
      depositions.push(deposition);
    }

    await depositionRepo.save(depositions);
    this.logger.log(`✓ Seeded ${depositions.length} depositions`);
    return depositions;
  }

  private async seedEvidenceItems(count: number, cases: Case[]): Promise<EvidenceItem[]> {
    this.logger.log(`Seeding ${count} evidence items...`);
    const evidenceRepo = this.dataSource.getRepository(EvidenceItem);

    const types = ['physical', 'digital', 'document', 'photograph', 'video', 'audio'];
    const statuses = ['collected', 'stored', 'analyzed', 'presented'];

    const items: EvidenceItem[] = [];
    for (let i = 0; i < count; i++) {
      const item = evidenceRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        evidenceNumber: DataFactory.generateEvidenceNumber(faker.number.int({ min: 1, max: 200 }), i + 1),
        title: `Evidence Item ${i + 1} - ${faker.lorem.words(3)}`,
        evidenceType: faker.helpers.arrayElement(types),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(statuses),
        collectionDate: faker.date.recent({ days: 180 }),
        collectionLocation: DataFactory.generateLegalAddress(),
        collectedBy: faker.person.fullName(),
        currentCustodian: faker.person.fullName(),
        storageLocation: `Evidence Room ${faker.number.int({ min: 1, max: 10 })} - Shelf ${faker.number.int({ min: 1, max: 50 })}`,
        chainOfCustodyIntact: faker.datatype.boolean(0.95),
        batesNumber: DataFactory.generateBatesNumber('BTN-', i + 1),
        exhibitNumber: `EX-${String(i + 1).padStart(4, '0')}`,
        isAdmitted: faker.datatype.boolean(0.4),
        isSealed: faker.datatype.boolean(0.1),
        isConfidential: faker.datatype.boolean(0.3),
        condition: faker.helpers.arrayElement(['excellent', 'good', 'fair', 'poor']),
        estimatedValue: faker.number.float({ min: 100, max: 100000, fractionDigits: 2 }),
      });
      items.push(item);
    }

    await evidenceRepo.save(items);
    this.logger.log(`✓ Seeded ${items.length} evidence items`);
    return items;
  }

  private async seedNotifications(count: number, users: User[]): Promise<Notification[]> {
    this.logger.log(`Seeding ${count} notifications...`);
    const notificationRepo = this.dataSource.getRepository(Notification);

    const types = [
      'case_update',
      'deadline_reminder',
      'task_assigned',
      'document_shared',
      'message_received',
      'court_date',
      'motion_filed',
    ];
    const priorities = ['low', 'medium', 'high', 'urgent'];

    const notifications: Notification[] = [];
    for (let i = 0; i < count; i++) {
      const type = faker.helpers.arrayElement(types);
      const { title, message } = DataFactory.generateNotificationMessage(type);

      const notification = notificationRepo.create({
        userId: faker.helpers.arrayElement(users).id,
        notificationType: type,
        title,
        message,
        isRead: faker.datatype.boolean(0.6),
        readAt: faker.datatype.boolean(0.6) ? faker.date.recent({ days: 7 }) : null,
        priority: faker.helpers.arrayElement(priorities),
        triggeredBy: faker.helpers.arrayElement(users).id,
        requiresAction: faker.datatype.boolean(0.3),
        emailSent: faker.datatype.boolean(0.8),
        emailSentAt: faker.datatype.boolean(0.8) ? faker.date.recent({ days: 7 }) : null,
      });
      notifications.push(notification);
    }

    await notificationRepo.save(notifications);
    this.logger.log(`✓ Seeded ${notifications.length} notifications`);
    return notifications;
  }

  private async seedAuditLogs(count: number, users: User[]): Promise<AuditLog[]> {
    this.logger.log(`Seeding ${count} audit logs...`);
    const auditRepo = this.dataSource.getRepository(AuditLog);

    const actions = ['create', 'read', 'update', 'delete', 'login', 'logout', 'access', 'download', 'upload'];
    const entities = ['case', 'document', 'client', 'invoice', 'time_entry', 'motion', 'evidence'];
    const results = ['success', 'failure', 'warning'];
    const severities = ['low', 'medium', 'high', 'critical'];

    const logs: AuditLog[] = [];
    for (let i = 0; i < count; i++) {
      const user = faker.helpers.arrayElement(users);
      const log = auditRepo.create({
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action: faker.helpers.arrayElement(actions),
        entity: faker.helpers.arrayElement(entities),
        entityId: faker.string.uuid(),
        timestamp: faker.date.recent({ days: 30 }),
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
        endpoint: `/api/${faker.helpers.arrayElement(entities)}/${faker.string.uuid()}`,
        statusCode: faker.helpers.arrayElement([200, 201, 204, 400, 403, 404, 500]),
        description: faker.lorem.sentence(),
        result: faker.helpers.arrayElement(results),
        duration: faker.number.int({ min: 10, max: 5000 }),
        severity: faker.helpers.arrayElement(severities),
      });
      logs.push(log);
    }

    await auditRepo.save(logs);
    this.logger.log(`✓ Seeded ${logs.length} audit logs`);
    return logs;
  }

  private async seedProjects(count: number, cases: Case[]): Promise<Project[]> {
    this.logger.log(`Seeding ${count} projects...`);
    const projectRepo = this.dataSource.getRepository(Project);

    const statuses = ['not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'];
    const priorities = ['low', 'medium', 'high', 'critical'];

    const projects: Project[] = [];
    for (let i = 0; i < count; i++) {
      const project = projectRepo.create({
        caseId: faker.helpers.arrayElement(cases).id,
        name: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(statuses),
        startDate: faker.date.recent({ days: 180 }),
        dueDate: faker.date.future({ years: 0.5 }),
        completionPercentage: faker.number.int({ min: 0, max: 100 }),
        priority: faker.helpers.arrayElement(priorities),
        estimatedBudget: faker.number.float({ min: 5000, max: 500000, fractionDigits: 2 }),
        actualCost: faker.number.float({ min: 2000, max: 400000, fractionDigits: 2 }),
        estimatedHours: faker.number.int({ min: 50, max: 2000 }),
        actualHours: faker.number.int({ min: 20, max: 1800 }),
      });
      projects.push(project);
    }

    await projectRepo.save(projects);
    this.logger.log(`✓ Seeded ${projects.length} projects (tasks)`);
    return projects;
  }

  private getTitleForRole(role: string): string {
    const titles = {
      partner: 'Partner',
      senior_associate: 'Senior Associate',
      associate: 'Associate Attorney',
      junior_associate: 'Junior Associate',
      paralegal: 'Paralegal',
      legal_assistant: 'Legal Assistant',
      clerk: 'File Clerk',
    };
    return titles[role] || 'Staff Member';
  }
}
