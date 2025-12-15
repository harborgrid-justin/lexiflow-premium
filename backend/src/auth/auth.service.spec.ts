import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.CLIENT_USER,
    isActive: true,
    mfaEnabled: false,
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        JWT_SECRET: 'test-secret',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_EXPIRATION: '15m',
        JWT_REFRESH_EXPIRATION: '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('should register a new user and return tokens', async () => {
      const newUser = { ...mockUser, ...registerDto, id: 'new-user-id' };
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: Role.CLIENT_USER,
        isActive: true,
        mfaEnabled: false,
      });
    });

    it('should use provided role if specified', async () => {
      const registerWithRole = { ...registerDto, role: Role.ASSOCIATE };
      const newUser = { ...mockUser, ...registerWithRole, id: 'new-user-id' };
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.register(registerWithRole);

      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: Role.ASSOCIATE }),
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user and return tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return MFA token if MFA is enabled', async () => {
      const mfaUser = { ...mockUser, mfaEnabled: true };
      mockUsersService.findByEmail.mockResolvedValue(mfaUser);
      mockUsersService.findById.mockResolvedValue(mfaUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mfa-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('requiresMfa', true);
      expect(result).toHaveProperty('mfaToken');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to store refresh token
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      const loginResult = await service.login({ email: mockUser.email, password: 'password' });

      // Now set up mocks for refresh - clear previous mocks first
      jest.clearAllMocks();
      const payload = { sub: mockUser.id, email: mockUser.email, role: mockUser.role, type: 'refresh' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await service.refresh((loginResult as any).refreshToken || 'mock-refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong token type', async () => {
      const payload = { sub: mockUser.id, type: 'access' };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      await expect(service.refresh('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const result = await service.logout(mockUser.id);

      expect(result).toHaveProperty('message', 'Logged out successfully');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const result = await service.changePassword(
        mockUser.id,
        'currentPassword',
        'newPassword',
      );

      expect(result).toHaveProperty('message', 'Password changed successfully');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(
        mockUser.id,
        'newPassword',
      );
    });

    it('should throw UnauthorizedException for incorrect current password', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('reset-token');

      const result = await service.forgotPassword(mockUser.email);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('resetToken');
    });

    it('should return generic message for non-existing user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toHaveProperty('message');
      expect(result).not.toHaveProperty('resetToken');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // First generate a reset token
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('valid-reset-token');
      const forgotResult = await service.forgotPassword(mockUser.email);

      mockUsersService.updatePassword.mockResolvedValue(undefined);

      const result = await service.resetPassword(forgotResult.resetToken, 'newPassword');

      expect(result).toHaveProperty('message', 'Password reset successfully');
    });

    it('should throw BadRequestException for invalid/expired token', async () => {
      await expect(
        service.resetPassword('invalid-token', 'newPassword'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyMfa', () => {
    it('should verify MFA with valid code', async () => {
      // First trigger MFA login
      const mfaUser = { ...mockUser, mfaEnabled: true };
      mockUsersService.findByEmail.mockResolvedValue(mfaUser);
      mockUsersService.findById.mockResolvedValue(mfaUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mfa-token');
      const loginResult = await service.login({ email: mfaUser.email, password: 'password' });

      // Now verify MFA
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.verifyMfa(loginResult.mfaToken, '123456');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid MFA code format', async () => {
      // First trigger MFA login
      const mfaUser = { ...mockUser, mfaEnabled: true };
      mockUsersService.findByEmail.mockResolvedValue(mfaUser);
      mockUsersService.findById.mockResolvedValue(mfaUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mfa-token');
      await service.login({ email: mfaUser.email, password: 'password' });

      await expect(service.verifyMfa('mfa-token', 'invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid MFA token', async () => {
      await expect(service.verifyMfa('invalid-token', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user for valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.findById.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(mockUser.email, 'wrongPassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existing user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});
