import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User, UserProfile, UserSummary } from '../../src/shared-types/entities/user.entity';
import { UserRole, UserStatus } from '../../src/shared-types/enums/user.enums';
import { Role } from '../../src/common/enums/role.enum';

export interface CreateUserOptions {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole | Role;
  status?: UserStatus;
  phone?: string;
  title?: string;
  department?: string;
  barNumber?: string;
  permissions?: string[];
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  passwordHash?: string;
  password?: string;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export class UserFactory {
  static async createUser(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    const password = options.password || 'Password123!';
    const passwordHash = options.passwordHash || await bcrypt.hash(password, 10);

    return {
      id: options.id || faker.string.uuid(),
      email: options.email || faker.internet.email().toLowerCase(),
      firstName: options.firstName || faker.person.firstName(),
      lastName: options.lastName || faker.person.lastName(),
      role: options.role || UserRole.CLIENT_USER,
      status: options.status || UserStatus.ACTIVE,
      phone: options.phone || faker.phone.number('+1-###-###-####'),
      title: options.title,
      department: options.department,
      barNumber: options.barNumber,
      permissions: options.permissions || [],
      preferences: {},
      avatarUrl: faker.image.avatar(),
      lastLoginAt: faker.date.recent().toISOString(),
      emailVerified: options.emailVerified ?? true,
      twoFactorEnabled: options.twoFactorEnabled ?? false,
      passwordHash,
      createdAt: faker.date.past().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
    };
  }

  static async createSuperAdmin(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      role: UserRole.SUPER_ADMIN,
      title: 'System Administrator',
      department: 'IT',
      permissions: ['*'],
      ...options,
    });
  }

  static async createSeniorPartner(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();

    return this.createUser({
      role: UserRole.SENIOR_PARTNER,
      title: 'Senior Partner',
      department: 'Legal',
      barNumber: this.generateBarNumber(),
      permissions: [
        'cases:read',
        'cases:write',
        'cases:delete',
        'documents:read',
        'documents:write',
        'documents:delete',
        'billing:read',
        'billing:write',
        'users:read',
        'users:write',
      ],
      firstName,
      lastName,
      ...options,
    });
  }

  static async createPartner(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();

    return this.createUser({
      role: UserRole.PARTNER,
      title: 'Partner',
      department: 'Legal',
      barNumber: this.generateBarNumber(),
      permissions: [
        'cases:read',
        'cases:write',
        'documents:read',
        'documents:write',
        'billing:read',
        'billing:write',
      ],
      firstName,
      lastName,
      ...options,
    });
  }

  static async createAssociate(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();

    return this.createUser({
      role: UserRole.ASSOCIATE,
      title: 'Associate Attorney',
      department: 'Legal',
      barNumber: this.generateBarNumber(),
      permissions: [
        'cases:read',
        'cases:write',
        'documents:read',
        'documents:write',
        'billing:read',
      ],
      firstName,
      lastName,
      ...options,
    });
  }

  static async createParalegal(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    const firstName = options.firstName || faker.person.firstName();
    const lastName = options.lastName || faker.person.lastName();

    return this.createUser({
      role: UserRole.PARALEGAL,
      title: 'Paralegal',
      department: 'Legal Support',
      permissions: [
        'cases:read',
        'cases:write',
        'documents:read',
        'documents:write',
      ],
      firstName,
      lastName,
      ...options,
    });
  }

  static async createLegalSecretary(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      role: UserRole.LEGAL_SECRETARY,
      title: 'Legal Secretary',
      department: 'Administrative',
      permissions: ['cases:read', 'documents:read', 'documents:write'],
      ...options,
    });
  }

  static async createClientUser(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      role: UserRole.CLIENT_USER,
      title: 'Client',
      permissions: ['cases:read', 'documents:read'],
      ...options,
    });
  }

  static async createAdministrator(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      role: UserRole.ADMINISTRATOR,
      title: 'Administrator',
      department: 'Administration',
      permissions: [
        'users:read',
        'users:write',
        'settings:read',
        'settings:write',
        'billing:read',
      ],
      ...options,
    });
  }

  static async createMultipleUsers(count: number, options: CreateUserOptions = {}): Promise<UserWithPassword[]> {
    const users: UserWithPassword[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.createUser(options));
    }
    return users;
  }

  static async createUserTeam(): Promise<{
    seniorPartner: UserWithPassword;
    partner: UserWithPassword;
    associates: UserWithPassword[];
    paralegal: UserWithPassword;
    secretary: UserWithPassword;
  }> {
    return {
      seniorPartner: await this.createSeniorPartner(),
      partner: await this.createPartner(),
      associates: await this.createMultipleUsers(2, { role: UserRole.ASSOCIATE }),
      paralegal: await this.createParalegal(),
      secretary: await this.createLegalSecretary(),
    };
  }

  static createUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role,
      title: user.title,
      avatarUrl: user.avatarUrl,
    };
  }

  static createUserSummary(user: User): UserSummary {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  }

  static generateBarNumber(): string {
    const state = faker.location.state({ abbreviated: true });
    const number = faker.number.int({ min: 100000, max: 999999 });
    return `${state}-${number}`;
  }

  static generateRandomEmail(domain: string = 'example.com'): string {
    return faker.internet.email({ provider: domain }).toLowerCase();
  }

  static generatePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    const all = lowercase + uppercase + numbers + symbols;
    let password = '';

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static createInactiveUser(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      status: UserStatus.INACTIVE,
      ...options,
    });
  }

  static createSuspendedUser(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      status: UserStatus.SUSPENDED,
      ...options,
    });
  }

  static createPendingUser(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      status: UserStatus.PENDING,
      emailVerified: false,
      ...options,
    });
  }

  static createUserWithMfa(options: CreateUserOptions = {}): Promise<UserWithPassword> {
    return this.createUser({
      twoFactorEnabled: true,
      ...options,
    });
  }

  static removePassword(user: UserWithPassword): User {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default UserFactory;
