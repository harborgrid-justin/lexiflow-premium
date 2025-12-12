import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export interface UserFactoryOptions {
  role?: string;
  organization?: string;
  isActive?: boolean;
}

export class UserFactory {
  /**
   * Generate a random user
   */
  static async generateUser(options: UserFactoryOptions = {}): Promise<any> {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const role = options.role || faker.helpers.arrayElement([
      'partner',
      'senior_associate',
      'associate',
      'junior_associate',
      'paralegal',
      'legal_assistant',
      'clerk',
      'billing_specialist',
      'accountant',
      'it_admin',
      'intern',
    ]);

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    return {
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role,
      department: this.getDepartmentForRole(role),
      title: this.getTitleForRole(role),
      phone: faker.phone.number('+1-###-###-####'),
      extension: faker.string.numeric(3),
      mobilePhone: faker.phone.number('+1-###-###-####'),
      isActive: options.isActive ?? true,
      isVerified: true,
      employeeId: `EMP-${faker.string.numeric(3)}`,
      hireDate: faker.date.past({ years: 10 }).toISOString().split('T')[0],
      officeLocation: faker.helpers.arrayElement([
        'New York',
        'Los Angeles',
        'Chicago',
        'San Francisco',
        'Dallas',
        'Seattle',
        'Boston',
        'Miami',
      ]),
      timeZone: 'America/New_York',
      language: 'en',
    };
  }

  /**
   * Generate multiple users
   */
  static async generateUsers(count: number, options: UserFactoryOptions = {}): Promise<any[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.generateUser(options));
    }
    return users;
  }

  /**
   * Get department for role
   */
  private static getDepartmentForRole(role: string): string {
    const departments = {
      partner: faker.helpers.arrayElement(['Corporate Law', 'Litigation', 'IP Law']),
      senior_associate: faker.helpers.arrayElement(['Corporate Law', 'Litigation', 'IP Law', 'Real Estate']),
      associate: faker.helpers.arrayElement(['Corporate Law', 'Litigation', 'IP Law', 'Employment', 'Tax']),
      junior_associate: faker.helpers.arrayElement(['Litigation', 'Corporate Law', 'Family Law']),
      paralegal: faker.helpers.arrayElement(['Litigation', 'Corporate Law', 'IP Law']),
      legal_assistant: 'Administration',
      clerk: 'Administration',
      billing_specialist: 'Finance',
      accountant: 'Finance',
      it_admin: 'IT',
      intern: faker.helpers.arrayElement(['Litigation', 'Corporate Law']),
    };
    return departments[role] || 'General Practice';
  }

  /**
   * Get title for role
   */
  private static getTitleForRole(role: string): string {
    const titles = {
      partner: faker.helpers.arrayElement(['Managing Partner', 'Senior Partner', 'Equity Partner']),
      senior_associate: 'Senior Associate',
      associate: 'Associate Attorney',
      junior_associate: 'Junior Associate',
      paralegal: faker.helpers.arrayElement(['Senior Paralegal', 'Paralegal']),
      legal_assistant: 'Legal Assistant',
      clerk: 'File Clerk',
      billing_specialist: faker.helpers.arrayElement(['Billing Specialist', 'Billing Coordinator']),
      accountant: faker.helpers.arrayElement(['Senior Accountant', 'Staff Accountant']),
      it_admin: 'IT Administrator',
      intern: faker.helpers.arrayElement(['Legal Intern', 'Summer Associate']),
    };
    return titles[role] || 'Attorney';
  }
}
