import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ROLE_PERMISSIONS } from '../common/constants/role-permissions.constant';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  // In-memory storage (replace with database in production)
  private users: Map<string, any> = new Map();

  constructor() {
    // Create default admin user for testing only if not in test environment
    if (process.env.NODE_ENV !== 'test') {
      this.createDefaultAdmin();
    }
  }

  private async createDefaultAdmin() {
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    const adminId = uuidv4();
    this.users.set(adminId, {
      id: adminId,
      email: 'admin@lexiflow.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async create(createUserDto: CreateUserDto): Promise<AuthenticatedUser> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userId = uuidv4();

    const user = {
      id: userId,
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role || Role.CLIENT_USER,
      isActive: createUserDto.isActive ?? true,
      mfaEnabled: createUserDto.mfaEnabled ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(userId, user);

    return this.toAuthenticatedUser(user);
  }

  async findAll(): Promise<AuthenticatedUser[]> {
    return Array.from(this.users.values()).map((user) =>
      this.toAuthenticatedUser(user),
    );
  }

  async findById(id: string): Promise<AuthenticatedUser | null> {
    const user = this.users.get(id);
    return user ? this.toAuthenticatedUser(user) : null;
  }

  async findByEmail(email: string): Promise<any | null> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email === email,
    );
    return user ? user : null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<AuthenticatedUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedUser = {
      ...user,
      ...updateUserDto,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);

    return this.toAuthenticatedUser(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.users.delete(id);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.updatedAt = new Date();

    this.users.set(id, user);
  }

  async setMfaEnabled(id: string, enabled: boolean): Promise<AuthenticatedUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.mfaEnabled = enabled;
    user.updatedAt = new Date();
    this.users.set(id, user);

    return this.toAuthenticatedUser(user);
  }

  async setActive(id: string, isActive: boolean): Promise<AuthenticatedUser> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = isActive;
    user.updatedAt = new Date();
    this.users.set(id, user);

    return this.toAuthenticatedUser(user);
  }

  async findByRole(role: string): Promise<AuthenticatedUser[]> {
    const users = Array.from(this.users.values()).filter(
      (u) => u.role === role,
    );
    return users.map((u) => this.toAuthenticatedUser(u));
  }

  private toAuthenticatedUser(user: any): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      isActive: user.isActive,
      mfaEnabled: user.mfaEnabled,
    };
  }
}
