import { AuthenticatedUser } from "@auth/interfaces/authenticated-user.interface";
import { ROLE_PERMISSIONS } from "@common/constants/role-permissions.constant";
import * as MasterConfig from "@config/master.config";
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserProfile } from "./entities/user-profile.entity";
import { User, UserRole, UserStatus } from "./entities/user.entity";

/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                                      USERS SERVICE - USER & PROFILE MANAGEMENT                                    ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                                                   ║
 * ║  AuthService / Controllers          UsersController                        UsersService                           ║
 * ║       │                                   │                                     │                                 ║
 * ║       │  Create user                      │                                     │                                 ║
 * ║       │  Update profile                   │                                     │                                 ║
 * ║       │  Validate credentials             │                                     │                                 ║
 * ║       └───────────────────────────────────┴─────────────────────────────────────▶                                 ║
 * ║                                                                                 │                                 ║
 * ║                                                               ┌─────────────────┴─────────────┐                   ║
 * ║                                                               │                               │                   ║
 * ║                                                               ▼                               ▼                   ║
 * ║                                                        User Repository              UserProfile Repository         ║
 * ║                                                               │                               │                   ║
 * ║                                                               ▼                               ▼                   ║
 * ║                                                        PostgreSQL (users)       PostgreSQL (user_profiles)        ║
 * ║                                                                                                                   ║
 * ║  DATA IN:  CreateUserDto { email, password, firstName, lastName, role }                                          ║
 * ║            UpdateUserDto { firstName?, lastName?, phone?, avatar?, settings? }                                    ║
 * ║                                                                                                                   ║
 * ║  DATA OUT: User { id, email, role, status, firstName, lastName, ... }                                            ║
 * ║            UserProfile { userId, phone, avatar, bio, preferences, settings }                                      ║
 * ║                                                                                                                   ║
 * ║  OPERATIONS:                                                                                                      ║
 * ║    • create()          - Create user with hashed password                                                        ║
 * ║    • findAll()         - List users with pagination                                                              ║
 * ║    • findOne()         - Get user by ID                                                                          ║
 * ║    • findByEmail()     - Get user by email (for auth)                                                            ║
 * ║    • update()          - Update user details                                                                     ║
 * ║    • updateProfile()   - Update user profile                                                                     ║
 * ║    • deactivate()      - Soft delete / deactivate user                                                           ║
 * ║    • validatePassword() - bcrypt password comparison                                                             ║
 * ║    • onModuleInit()    - Bootstrap default admin user                                                            ║
 * ║                                                                                                                   ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>
  ) {}

  async onModuleInit() {
    // Create default admin user only if enabled and not in test environment
    if (
      process.env.NODE_ENV !== "test" &&
      MasterConfig.DEFAULT_ADMIN_CONFIG.enabled
    ) {
      await this.createDefaultAdmin();
    }
  }

  /**
   * Creates the default global admin user with linked profile based on configuration.
   * Uses settings from master.config.ts which can be overridden via environment variables.
   *
   * This method:
   * 1. Checks if default admin creation is enabled
   * 2. Verifies admin doesn't already exist
   * 3. Creates the admin user with SUPER_ADMIN role
   * 4. Creates a linked UserProfile if profile creation is enabled
   * 5. Associates the profile with the admin user
   */
  private async createDefaultAdmin(): Promise<void> {
    const config = MasterConfig.DEFAULT_ADMIN_CONFIG;

    if (!config.enabled) {
      this.logger.debug("Default admin creation is disabled via configuration");
      return;
    }

    try {
      // Check if admin already exists using configured email
      const existingAdmin = await this.userRepository.findOne({
        where: { email: config.user.email },
      });

      if (existingAdmin) {
        this.logger.debug(`Default admin already exists: ${config.user.email}`);
        // Ensure profile exists if profile creation is enabled
        if (config.profile.enabled) {
          await this.ensureAdminProfile(existingAdmin.id);
        }
        return;
      }

      // Create the admin user with configured values
      const hashedPassword = await bcrypt.hash(
        config.user.password,
        MasterConfig.BCRYPT_ROUNDS
      );

      const admin = this.userRepository.create({
        email: config.user.email,
        passwordHash: hashedPassword,
        firstName: config.user.firstName,
        lastName: config.user.lastName,
        title: config.user.title,
        department: config.user.department,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        twoFactorEnabled: false,
        emailVerified: true,
      });

      const savedAdmin = await this.userRepository.save(admin);

      // Create linked profile if enabled
      if (config.profile.enabled) {
        await this.createAdminProfile(savedAdmin.id);
      }

      // Log success in non-production environments
      if (process.env.NODE_ENV !== "production") {
        this.logger.log(
          `Default global admin created: ${config.user.email} ` +
            `(profile: ${config.profile.enabled ? "created" : "skipped"})`
        );
      }
    } catch (error) {
      // Silently fail if table doesn't exist yet (during initial schema creation)
      // The admin will be created on next restart or can be seeded manually
      if (process.env.NODE_ENV !== "production") {
        this.logger.warn(
          "Skipping default admin creation - database schema not ready yet",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }
  }

  /**
   * Creates a UserProfile linked to the default admin user.
   * Uses configuration values from master.config.ts
   */
  private async createAdminProfile(userId: string): Promise<UserProfile> {
    const profileConfig = MasterConfig.DEFAULT_ADMIN_CONFIG.profile;

    const profile = this.userProfileRepository.create({
      userId,
      barNumber: profileConfig.barNumber ?? "",
      jurisdictions: profileConfig.jurisdictions ?? [],
      practiceAreas: profileConfig.practiceAreas ?? [],
      bio: profileConfig.bio ?? "",
      yearsOfExperience: profileConfig.yearsOfExperience ?? 0,
      defaultHourlyRate: profileConfig.defaultHourlyRate ?? 0,
      skills: [
        "System Administration",
        "User Management",
        "Platform Configuration",
      ],
      specializations: "Global Platform Administration",
    } as Partial<UserProfile> & { userId: string });

    const saved = await this.userProfileRepository.save(profile);
    return saved as UserProfile;
  }

  /**
   * Ensures the admin user has a linked profile.
   * Creates one if it doesn't exist.
   */
  private async ensureAdminProfile(userId: string): Promise<void> {
    const existingProfile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!existingProfile) {
      await this.createAdminProfile(userId);
      if (process.env.NODE_ENV !== "production") {
        this.logger.log(`Created missing profile for existing admin user`);
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<AuthenticatedUser> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      MasterConfig.BCRYPT_ROUNDS
    );

    const user = this.userRepository.create({
      email: createUserDto.email,
      passwordHash: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: this.mapToUserRole(createUserDto.role) || UserRole.STAFF,
      status:
        (createUserDto.isActive ?? true)
          ? UserStatus.ACTIVE
          : UserStatus.INACTIVE,
      twoFactorEnabled: createUserDto.mfaEnabled ?? false,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);
    return this.toAuthenticatedUser(savedUser);
  }

  async findAll(options?: { page?: number; limit?: number }): Promise<{
    data: AuthenticatedUser[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 50 } = options || {};
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return {
      data: users.map((user) => this.toAuthenticatedUser(user)),
      total,
      page,
      limit,
    };
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
  async findByEmailWithPassword(
    email: string
  ): Promise<(AuthenticatedUser & { passwordHash: string }) | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "status",
        "passwordHash",
        "emailVerified",
      ],
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
    updateUserDto: UpdateUserDto
  ): Promise<AuthenticatedUser> {
    // Check if email is being changed and if it already exists
    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException("User with this email already exists");
      }
    }

    // Build update object
    const updateData: Partial<{
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      status: UserStatus;
      twoFactorEnabled: boolean;
    }> = {};
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.firstName) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.role)
      updateData.role = this.mapToUserRole(updateUserDto.role);
    if (updateUserDto.isActive !== undefined) {
      updateData.status = updateUserDto.isActive
        ? UserStatus.ACTIVE
        : UserStatus.INACTIVE;
    }
    if (updateUserDto.mfaEnabled !== undefined) {
      updateData.twoFactorEnabled = updateUserDto.mfaEnabled;
    }

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(updateData)
      .where("id = :id", { id })
      .returning("*")
      .execute();

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException("User not found");
    }

    const rawResult = result.raw as User[];
    if (!rawResult[0]) {
      throw new NotFoundException("User not found");
    }

    return this.toAuthenticatedUser(rawResult[0]);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.userRepository.remove(user);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      MasterConfig.BCRYPT_ROUNDS
    );
    user.passwordHash = hashedPassword;

    await this.userRepository.save(user);
  }

  async setMfaEnabled(
    id: string,
    enabled: boolean
  ): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.twoFactorEnabled = enabled;
    const updatedUser = await this.userRepository.save(user);

    return this.toAuthenticatedUser(updatedUser);
  }

  async setTotpSecret(id: string, totpSecret: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.totpSecret = totpSecret;
    await this.userRepository.save(user);
  }

  async getTotpSecret(id: string): Promise<string | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user.totpSecret || null;
  }

  async setActive(id: string, isActive: boolean): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
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
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      isActive: user.status === UserStatus.ACTIVE,
      mfaEnabled: user.twoFactorEnabled,
      totpSecret: user.totpSecret,
    };
  }

  // Map between old Role enum and new UserRole enum
  private mapToUserRole(role: string): UserRole {
    // If it's already a valid UserRole, return it
    if (Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }

    const roleStr = String(role);
    const roleMapping: Record<string, UserRole> = {
      SUPER_ADMIN: UserRole.SUPER_ADMIN,
      ADMINISTRATOR: UserRole.ADMIN,
      PARTNER: UserRole.PARTNER,
      ASSOCIATE: UserRole.ASSOCIATE,
      PARALEGAL: UserRole.PARALEGAL,
      LEGAL_SECRETARY: UserRole.LEGAL_ASSISTANT,
      CLIENT_USER: UserRole.CLIENT,
    };
    return roleMapping[roleStr] || UserRole.STAFF;
  }
}
