import { faker } from '@faker-js/faker';
import { DataFactory } from './data-factory';

export interface ClientFactoryOptions {
  clientType?: string;
  status?: string;
  isVip?: boolean;
}

export class ClientFactory {
  /**
   * Generate a random client
   */
  static generateClient(options: ClientFactoryOptions = {}): any {
    const clientType = options.clientType || faker.helpers.arrayElement([
      'individual',
      'corporation',
      'partnership',
      'llc',
      'nonprofit',
      'government',
    ]);

    const status = options.status || faker.helpers.arrayElement([
      'active',
      'inactive',
      'prospective',
      'former',
    ]);

    if (clientType === 'individual') {
      return this.generateIndividualClient(status, options);
    } else {
      return this.generateBusinessClient(clientType, status, options);
    }
  }

  /**
   * Generate multiple clients
   */
  static generateClients(count: number, options: ClientFactoryOptions = {}): any[] {
    const clients = [];
    for (let i = 0; i < count; i++) {
      clients.push(this.generateClient(options));
    }
    return clients;
  }

  /**
   * Generate individual client
   */
  private static generateIndividualClient(status: string, options: ClientFactoryOptions): any {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    return {
      clientNumber: `CLN-${faker.number.int({ min: 2020, max: 2024 })}-${faker.string.numeric(3)}`,
      name,
      clientType: 'individual',
      status,
      email,
      phone: faker.phone.number('+1-###-###-####'),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
      country: 'United States',
      billingAddress: faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingState: faker.location.state({ abbreviated: true }),
      billingZipCode: faker.location.zipCode(),
      billingCountry: 'United States',
      primaryContactName: name,
      primaryContactEmail: email,
      primaryContactPhone: faker.phone.number('+1-###-###-####'),
      clientSince: faker.date.past({ years: 5 }).toISOString().split('T')[0],
      paymentTerms: faker.helpers.arrayElement(['net_15', 'net_30', 'due_on_receipt']),
      preferredPaymentMethod: faker.helpers.arrayElement(['Credit Card', 'Check', 'Cash']),
      creditLimit: faker.number.int({ min: 5000, max: 50000 }),
      currentBalance: faker.number.int({ min: 0, max: 10000 }),
      totalBilled: faker.number.int({ min: 5000, max: 100000 }),
      totalPaid: faker.number.int({ min: 5000, max: 95000 }),
      totalCases: faker.number.int({ min: 1, max: 5 }),
      activeCases: faker.number.int({ min: 0, max: 2 }),
      isVip: options.isVip ?? faker.datatype.boolean({ probability: 0.1 }),
      requiresConflictCheck: false,
      hasRetainer: faker.datatype.boolean({ probability: 0.2 }),
      retainerAmount: faker.datatype.boolean({ probability: 0.2 }) ? faker.number.int({ min: 5000, max: 25000 }) : null,
      retainerBalance: null,
      tags: this.generateClientTags(faker.helpers.arrayElement(['family-law', 'criminal-defense', 'personal-injury', 'estate-planning'])),
      notes: faker.lorem.sentence(),
    };
  }

  /**
   * Generate business client
   */
  private static generateBusinessClient(clientType: string, status: string, options: ClientFactoryOptions): any {
    const companyName = faker.company.name();
    const email = `legal@${faker.internet.domainName()}`;

    return {
      clientNumber: `CLN-${faker.number.int({ min: 2020, max: 2024 })}-${faker.string.numeric(3)}`,
      name: companyName,
      clientType,
      status,
      email,
      phone: faker.phone.number('+1-###-###-####'),
      fax: faker.datatype.boolean({ probability: 0.3 }) ? faker.phone.number('+1-###-###-####') : null,
      website: `https://www.${faker.internet.domainName()}`,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode(),
      country: 'United States',
      billingAddress: faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingState: faker.location.state({ abbreviated: true }),
      billingZipCode: faker.location.zipCode(),
      billingCountry: 'United States',
      taxId: `${faker.number.int({ min: 10, max: 99 })}-${faker.string.numeric(7)}`,
      industry: faker.helpers.arrayElement([
        'Technology',
        'Healthcare',
        'Finance',
        'Manufacturing',
        'Retail',
        'Real Estate',
        'Energy',
        'Telecommunications',
        'Transportation',
        'Entertainment',
      ]),
      establishedDate: faker.date.past({ years: 30 }).toISOString().split('T')[0],
      primaryContactName: faker.person.fullName(),
      primaryContactEmail: email,
      primaryContactPhone: faker.phone.number('+1-###-###-####'),
      primaryContactTitle: faker.helpers.arrayElement([
        'General Counsel',
        'VP Legal Affairs',
        'Chief Legal Officer',
        'Legal Director',
      ]),
      referralSource: faker.helpers.arrayElement([
        'Existing Client Referral',
        'LinkedIn',
        'Law Firm Partner',
        'Industry Conference',
        'Website',
        'Professional Network',
      ]),
      clientSince: faker.date.past({ years: 5 }).toISOString().split('T')[0],
      paymentTerms: faker.helpers.arrayElement(['net_30', 'net_45', 'net_60']),
      preferredPaymentMethod: faker.helpers.arrayElement(['Wire Transfer', 'ACH', 'Check']),
      creditLimit: faker.number.int({ min: 50000, max: 1000000 }),
      currentBalance: faker.number.int({ min: 0, max: 200000 }),
      totalBilled: faker.number.int({ min: 100000, max: 5000000 }),
      totalPaid: faker.number.int({ min: 100000, max: 4800000 }),
      totalCases: faker.number.int({ min: 5, max: 50 }),
      activeCases: faker.number.int({ min: 1, max: 10 }),
      isVip: options.isVip ?? faker.datatype.boolean({ probability: 0.3 }),
      requiresConflictCheck: true,
      lastConflictCheckDate: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
      hasRetainer: faker.datatype.boolean({ probability: 0.6 }),
      retainerAmount: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 50000, max: 500000 }) : null,
      retainerBalance: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 25000, max: 400000 }) : null,
      tags: this.generateClientTags(faker.helpers.arrayElement(['corporate', 'litigation', 'regulatory', 'ip'])),
      notes: faker.lorem.sentence(),
    };
  }

  /**
   * Generate client tags
   */
  private static generateClientTags(primaryTag: string): string[] {
    const baseTags = [primaryTag];
    const additionalTags = faker.helpers.arrayElements([
      'high-value',
      'retainer',
      'repeat-client',
      'referral-source',
      'vip',
      'net-30',
      'payment-plan',
    ], faker.number.int({ min: 1, max: 3 }));
    return [...baseTags, ...additionalTags];
  }
}
