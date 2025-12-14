import { faker } from '@faker-js/faker';
import { v4 as uuidv4 } from 'uuid';

/**
 * Mock factory for generating test data
 */
export class MockFactory {
  /**
   * Generate a mock user
   */
  static createMockUser(overrides?: Partial<any>) {
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
  static createMockCase(overrides?: Partial<any>) {
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
  static createMockClient(overrides?: Partial<any>) {
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
  static createMockDocument(overrides?: Partial<any>) {
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
  static createMockTimeEntry(overrides?: Partial<any>) {
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
    factory: () => T,
    count: number,
    overrides?: Partial<T>[],
  ): T[] {
    return Array.from({ length: count }, (_, index) =>
      factory.call(this, overrides?.[index]),
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
  static createMockEmail(overrides?: Partial<any>) {
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
  static createMockNotification(overrides?: Partial<any>) {
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
