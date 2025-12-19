import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as MasterConfig from '../config/master.config';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ROLE_PERMISSIONS } from '../common/constants/role-permissions.constant';
import { Role } from '../common/enums/role.enum';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Create default admin user for testing only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      await this.createDefaultAdmin();
    }
  }

  private async createDefaultAdmin() {
    try {
      // Check if admin already exists
      const existingAdmin = await this.userRepository.findOne({
        where: { email: 'admin@lexiflow.com' },
      });

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin123!', MasterConfig.BCRYPT_ROUNDS);
        const admin = this.userRepository.create({
          email: 'admin@lexiflow.com',
          passwordHash: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          twoFactorEnabled: false,
          emailVerified: true,
        });
        await this.userRepository.save(admin);
        console.log('✅ Default admin user created successfully');
      }
    } catch (error) {
      // Silently fail if table doesn't exist yet (during initial schema creation)
      // The admin will be created on next restart or can be seeded manually
      console.log('⏳ Skipping default admin creation - database schema not ready yet');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<AuthenticatedUser> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, MasterConfig.BCRYPT_ROUNDS);

    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: this.mapToUserRole(createUserDto.role) || UserRole.STAFF,
      status: (createUserDto.isActive ?? true) ? UserStatus.ACTIVE : UserStatus.INACTIVE,
      twoFactorEnabled: createUserDto.mfaEnabled ?? false,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);
    return this.toAuthenticatedUser(savedUser);
  }

  async findAll(): Promise<AuthenticatedUser[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.toAuthenticatedUser(user));
  }

  async findById(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? this.toAuthenticatedUser(user) : null;
  }

  async findByEmail(email: string): Promise<AuthenticatedUser | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return this.toAuthenticatedUser(user);
  }

  /**
   * Find user by email with password hash (for authentication only)
   * WARNING: Should only be used internally by AuthService
   */
  async findByEmailWithPassword(email: string): Promise<(AuthenticatedUser & { passwordHash: string }) | null> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'passwordHash', 'emailVerified']
    });
    if (!user) {
      return null;
    }
    const authUser = this.toAuthenticatedUser(user);
    return {
      ...authUser,
      passwordHash: user.passwordHash,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Update fields
    if (updateUserDto.email) user.email = updateUserDto.email;
    if (updateUserDto.firstName) user.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
    if (updateUserDto.role) user.role = this.mapToUserRole(updateUserDto.role);
    if (updateUserDto.isActive !== undefined) {
      user.status = updateUserDto.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    }
    if (updateUserDto.mfaEnabled !== undefined) {
      user.twoFactorEnabled = updateUserDto.mfaEnabled;
    }

    const updatedUser = await this.userRepository.save(user);
    return this.toAuthenticatedUser(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, MasterConfig.BCRYPT_ROUNDS);
    user.passwordHash = hashedPassword;

    await this.userRepository.save(user);
  }

  async setMfaEnabled(id: string, enabled: boolean): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.twoFactorEnabled = enabled;
    const updatedUser = await this.userRepository.save(user);

    return this.toAuthenticatedUser(updatedUser);
  }

  async setTotpSecret(id: string, totpSecret: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.totpSecret = totpSecret;
    await this.userRepository.save(user);
  }

  async getTotpSecret(id: string): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.totpSecret || null;
  }

  async setActive(id: string, isActive: boolean): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
    const updatedUser = await this.userRepository.save(user);

    return this.toAuthenticatedUser(updatedUser);
  }

  async findByRole(role: string): Promise<AuthenticatedUser[]> {
    const userRole = this.mapToUserRole(role);
    const users = await this.userRepository.find({ where: { role: userRole } });
    return users.map((u) => this.toAuthenticatedUser(u));
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    // Map User entity to AuthenticatedUser interface
    const role = this.mapFromUserRole(user.role);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: role,
      permissions: ROLE_PERMISSIONS[role] || [],
      isActive: user.status === UserStatus.ACTIVE,
      mfaEnabled: user.twoFactorEnabled,
      totpSecret: user.totpSecret,
    };
  }

  // Map between old Role enum and new UserRole enum
  private mapToUserRole(role: any): UserRole {
    const roleMapping: Record<string, UserRole> = {
      super_admin: UserRole.SUPER_ADMIN,
      admin: UserRole.ADMIN,
      partner: UserRole.PARTNER,
      attorney: UserRole.ATTORNEY,
      paralegal: UserRole.PARALEGAL,
      staff: UserRole.STAFF,
      client: UserRole.CLIENT,
      client_user: UserRole.CLIENT,
    };
    return roleMapping[role] || UserRole.STAFF;
  }

  private mapFromUserRole(userRole: UserRole): Role {
    const roleMapping: Record<UserRole, Role> = {
      [UserRole.SUPER_ADMIN]: Role.SUPER_ADMIN,
      [UserRole.ADMIN]: Role.ADMINISTRATOR,
      [UserRole.PARTNER]: Role.PARTNER,
      [UserRole.SENIOR_ASSOCIATE]: Role.ASSOCIATE,
      [UserRole.ASSOCIATE]: Role.ASSOCIATE,
      [UserRole.JUNIOR_ASSOCIATE]: Role.ASSOCIATE,
      [UserRole.ATTORNEY]: Role.ASSOCIATE,
      [UserRole.PARALEGAL]: Role.PARALEGAL,
      [UserRole.LEGAL_ASSISTANT]: Role.PARALEGAL,
      [UserRole.CLERK]: Role.LEGAL_SECRETARY,
      [UserRole.INTERN]: Role.LEGAL_SECRETARY,
      [UserRole.ACCOUNTANT]: Role.LEGAL_SECRETARY,
      [UserRole.BILLING_SPECIALIST]: Role.LEGAL_SECRETARY,
      [UserRole.IT_ADMIN]: Role.ADMINISTRATOR,
      [UserRole.STAFF]: Role.LEGAL_SECRETARY,
      [UserRole.USER]: Role.LEGAL_SECRETARY,
      [UserRole.CLIENT]: Role.CLIENT_USER,
    };
    return roleMapping[userRole] || Role.LEGAL_SECRETARY;
  }
}
