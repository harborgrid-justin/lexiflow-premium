import { faker } from '@faker-js/faker';

export class TestDataFactory {
  /**
   * Generate test user
   */
  static createUser(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password(),
      role: 'user',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test case
   */
  static createCase(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      caseNumber: `CASE-${faker.number.int({ min: 1000, max: 9999 })}`,
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      status: 'open',
      priority: 'medium',
      clientId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test document
   */
  static createDocument(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      title: faker.system.fileName(),
      filePath: faker.system.filePath(),
      mimeType: 'application/pdf',
      size: faker.number.int({ min: 1000, max: 1000000 }),
      caseId: faker.string.uuid(),
      uploadedBy: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test invoice
   */
  static createInvoice(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
      clientId: faker.string.uuid(),
      amount: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
      status: 'pending',
      dueDate: faker.date.future(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test time entry
   */
  static createTimeEntry(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      caseId: faker.string.uuid(),
      duration: faker.number.int({ min: 15, max: 480 }),
      description: faker.lorem.sentence(),
      billable: true,
      rate: faker.number.float({ min: 100, max: 500, fractionDigits: 2 }),
      date: faker.date.recent(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test task
   */
  static createTask(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      status: 'pending',
      priority: 'medium',
      assignedTo: faker.string.uuid(),
      caseId: faker.string.uuid(),
      dueDate: faker.date.future(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test knowledge article
   */
  static createKnowledgeArticle(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(3),
      category: faker.helpers.arrayElement([
        'procedures',
        'templates',
        'guidelines',
        'precedents',
      ]),
      tags: [faker.lorem.word(), faker.lorem.word()],
      status: 'published',
      authorId: faker.string.uuid(),
      viewCount: faker.number.int({ min: 0, max: 1000 }),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test discovery request
   */
  static createDiscoveryRequest(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      caseId: faker.string.uuid(),
      requestType: faker.helpers.arrayElement([
        'interrogatories',
        'document_requests',
        'admissions',
        'depositions',
      ]),
      description: faker.lorem.paragraph(),
      dueDate: faker.date.future(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test compliance check
   */
  static createComplianceCheck(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      checkType: faker.helpers.arrayElement([
        'conflict',
        'ethical_wall',
        'audit',
      ]),
      status: 'pending',
      result: null,
      performedBy: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate test event
   */
  static createEvent(overrides?: Partial<any>) {
    return {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      startDate: faker.date.future(),
      endDate: faker.date.future(),
      location: faker.location.streetAddress(),
      attendees: [faker.string.uuid(), faker.string.uuid()],
      caseId: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate multiple entities
   */
  static createMany<T>(
    factory: (overrides?: Partial<T>) => T,
    count: number,
    overrides?: Partial<T>,
  ): T[] {
    return Array.from({ length: count }, () => factory(overrides));
  }
}
