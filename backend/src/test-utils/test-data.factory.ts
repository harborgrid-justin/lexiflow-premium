import { faker } from '@faker-js/faker';

interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TestCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestDocument {
  id: string;
  title: string;
  filePath: string;
  mimeType: string;
  size: number;
  caseId: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestInvoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  amount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TestTimeEntry {
  id: string;
  userId: string;
  caseId: string;
  duration: number;
  description: string;
  billable: boolean;
  rate: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TestTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  caseId: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface TestKnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  authorId: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TestDiscoveryRequest {
  id: string;
  caseId: string;
  requestType: string;
  description: string;
  dueDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestComplianceCheck {
  id: string;
  checkType: string;
  status: string;
  result: unknown;
  performedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TestEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  attendees: string[];
  caseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class TestDataFactory {
  /**
   * Generate test user
   */
  static createUser(overrides?: Partial<TestUser>): TestUser {
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
  static createCase(overrides?: Partial<TestCase>): TestCase {
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
  static createDocument(overrides?: Partial<TestDocument>): TestDocument {
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
  static createInvoice(overrides?: Partial<TestInvoice>): TestInvoice {
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
  static createTimeEntry(overrides?: Partial<TestTimeEntry>): TestTimeEntry {
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
  static createTask(overrides?: Partial<TestTask>): TestTask {
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
  static createKnowledgeArticle(overrides?: Partial<TestKnowledgeArticle>): TestKnowledgeArticle {
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
  static createDiscoveryRequest(overrides?: Partial<TestDiscoveryRequest>): TestDiscoveryRequest {
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
  static createComplianceCheck(overrides?: Partial<TestComplianceCheck>): TestComplianceCheck {
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
  static createEvent(overrides?: Partial<TestEvent>): TestEvent {
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
