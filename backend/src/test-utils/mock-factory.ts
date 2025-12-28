import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: string;
  status: string;
  priority: string;
  courtName: string;
  jurisdiction: string;
  filingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MockClient {
  id: string;
  clientType: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockDocument {
  id: string;
  title: string;
  description: string;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  version: number;
  isTemplate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface MockTimeEntry {
  id: string;
  description: string;
  hours: number;
  billableRate: number;
  date: Date;
  isBillable: boolean;
  taskType: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MockEmail {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  htmlBody: string;
  sentAt: Date;
  isRead: boolean;
}

interface MockNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

/**
 * Mock factory for generating test data
 */
export class MockFactory {
  /**
   * Generate a mock user
   */
  static createMockUser(overrides?: Partial<MockUser>): MockUser {
    return {
      id: uuidv4(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
      role: faker.helpers.arrayElement([
        'ADMIN',
        'ATTORNEY',
        'PARALEGAL',
        'LEGAL_SECRETARY',
        'CLIENT',
      ]),
      phone: faker.phone.number(),
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a mock case
   */
  static createMockCase(overrides?: Partial<MockCase>): MockCase {
    const caseTypes = [
      'CIVIL',
      'CRIMINAL',
      'FAMILY',
      'CORPORATE',
      'IP',
      'IMMIGRATION',
      'BANKRUPTCY',
    ];
    const statuses = [
      'OPEN',
      'IN_PROGRESS',
      'ON_HOLD',
      'CLOSED',
      'ARCHIVED',
    ];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

    return {
      id: uuidv4(),
      caseNumber: `CASE-${faker.number.int({ min: 2020, max: 2025 })}-${faker.number.int({ min: 1000, max: 9999 })}`,
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      caseType: faker.helpers.arrayElement(caseTypes),
      status: faker.helpers.arrayElement(statuses),
      priority: faker.helpers.arrayElement(priorities),
      courtName: faker.company.name() + ' Court',
      jurisdiction: faker.location.state(),
      filingDate: faker.date.past(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a mock client
   */
  static createMockClient(overrides?: Partial<MockClient>): MockClient {
    const isIndividual = faker.datatype.boolean();

    return {
      id: uuidv4(),
      clientType: isIndividual ? 'INDIVIDUAL' : 'CORPORATE',
      firstName: isIndividual ? faker.person.firstName() : null,
      lastName: isIndividual ? faker.person.lastName() : null,
      companyName: !isIndividual ? faker.company.name() : null,
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: 'USA',
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a mock document
   */
  static createMockDocument(overrides?: Partial<MockDocument>): MockDocument {
    const documentTypes = [
      'COMPLAINT',
      'ANSWER',
      'MOTION',
      'BRIEF',
      'CONTRACT',
      'CORRESPONDENCE',
      'EVIDENCE',
      'PLEADING',
    ];

    return {
      id: uuidv4(),
      title: faker.system.fileName(),
      description: faker.lorem.sentence(),
      documentType: faker.helpers.arrayElement(documentTypes),
      fileName: faker.system.fileName(),
      filePath: `/uploads/${faker.system.fileName()}`,
      fileSize: faker.number.int({ min: 1000, max: 5000000 }),
      mimeType: 'application/pdf',
      version: 1,
      isTemplate: false,
      tags: faker.helpers.arrayElements(
        ['urgent', 'draft', 'final', 'confidential'],
        2,
      ),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate a mock time entry
   */
  static createMockTimeEntry(overrides?: Partial<MockTimeEntry>): MockTimeEntry {
    const billableRates = [150, 200, 250, 300, 350, 400, 450, 500];

    return {
      id: uuidv4(),
      description: faker.lorem.sentence(),
      hours: faker.number.float({ min: 0.25, max: 8, multipleOf: 0.25 }),
      billableRate: faker.helpers.arrayElement(billableRates),
      date: faker.date.recent(),
      isBillable: faker.datatype.boolean({ probability: 0.8 }),
      taskType: faker.helpers.arrayElement([
        'RESEARCH',
        'DRAFTING',
        'REVIEW',
        'CLIENT_MEETING',
        'COURT_APPEARANCE',
        'PHONE_CALL',
        'EMAIL',
      ]),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Generate multiple mock items
   */
  static createMany<T>(
    factory: (overrides?: Partial<T>) => T,
    count: number,
    overrides?: Partial<T>[],
  ): T[] {
    return Array.from({ length: count }, (_, index) =>
      factory(overrides?.[index]),
    );
  }

  /**
   * Generate a mock JWT token
   */
  static createMockJwtToken(userId?: string): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64');
    const payload = Buffer.from(
      JSON.stringify({
        sub: userId || uuidv4(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString('base64');
    const signature = faker.string.alphanumeric(43);

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Generate mock email
   */
  static createMockEmail(overrides?: Partial<MockEmail>): MockEmail {
    return {
      id: uuidv4(),
      from: faker.internet.email(),
      to: [faker.internet.email()],
      cc: [],
      bcc: [],
      subject: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(3),
      htmlBody: `<p>${faker.lorem.paragraphs(3)}</p>`,
      sentAt: faker.date.recent(),
      isRead: faker.datatype.boolean(),
      ...overrides,
    };
  }

  /**
   * Generate mock notification
   */
  static createMockNotification(overrides?: Partial<MockNotification>): MockNotification {
    return {
      id: uuidv4(),
      title: faker.lorem.sentence(),
      message: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement([
        'INFO',
        'WARNING',
        'ERROR',
        'SUCCESS',
      ]),
      isRead: faker.datatype.boolean(),
      createdAt: faker.date.recent(),
      ...overrides,
    };
  }
}
