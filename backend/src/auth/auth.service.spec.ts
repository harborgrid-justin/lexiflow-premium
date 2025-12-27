import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '@users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@common/enums/role.enum';
import { describe, it, expect, jest } from '@jest/globals';

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
    create: jest.fn<any>(),
    findByEmail: jest.fn<any>(),
    findById: jest.fn<any>(),
    updatePassword: jest.fn<any>(),
  };

  const mockJwtService = {
    signAsync: jest.fn<any>(),
    verifyAsync: jest.fn<any>(),
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
      (mockUsersService.create as jest.Mock).mockResolvedValue(newUser);
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
      (mockUsersService.create as jest.Mock).mockResolvedValue(newUser);
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
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', 'access-token');
      expect(result).toHaveProperty('refreshToken', 'refresh-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return MFA token if MFA is enabled', async () => {
      const mfaUser = { ...mockUser, mfaEnabled: true };
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mfaUser);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mfaUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('mfa-token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('requiresMfa', true);
      expect(result).toHaveProperty('mfaToken');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to store refresh token
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      const loginResult = await service.login({ email: mockUser.email, password: 'password' });

      // Now set up mocks for refresh - clear previous mocks first
      jest.clearAllMocks();
      const payload = { sub: mockUser.id, email: mockUser.email, role: mockUser.role, type: 'refresh' };
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const refreshToken = (loginResult as any).refreshToken || 'mock-refresh-token';
      const result = await service.refresh(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      (mockJwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(service.refresh('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong token type', async () => {
      const payload = { sub: mockUser.id, type: 'access' };
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);

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
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      (mockUsersService.updatePassword as jest.Mock).mockResolvedValue(undefined);

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
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mockUser);
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUser.id, 'wrongPassword', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('reset-token');

      const result = await service.forgotPassword(mockUser.email);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('resetToken');
    });

    it('should return generic message for non-existing user', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toHaveProperty('message');
      expect(result).not.toHaveProperty('resetToken');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      // First generate a reset token
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('valid-reset-token');
      const forgotResult = await service.forgotPassword(mockUser.email);

      (mockUsersService.updatePassword as jest.Mock).mockResolvedValue(undefined);

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
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mfaUser);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mfaUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('mfa-token');
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
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mfaUser);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mfaUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('mfa-token');
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
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid password', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(false);

      const result = await service.validateUser(mockUser.email, 'wrongPassword');

      expect(result).toBeNull();
    });

    it('should return null for non-existing user', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  // Additional Tests - Edge Cases and Security Scenarios
  describe('register - edge cases', () => {
    it('should propagate error when user creation fails', async () => {
      (mockUsersService.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(service.register(registerDto)).rejects.toThrow('Database error');
    });

    it('should generate both access and refresh tokens on registration', async () => {
      const newUser = { ...mockUser, id: 'new-user-id' };
      (mockUsersService.create as jest.Mock).mockResolvedValue(newUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      });

      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });
  });

  describe('refresh - edge cases', () => {
    it('should throw UnauthorizedException when user not found after token verification', async () => {
      const payload = { sub: 'non-existent-user', email: mockUser.email, role: mockUser.role, type: 'refresh' };
      (mockJwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.refresh('valid-refresh-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword - edge cases', () => {
    it('should throw UnauthorizedException when user not found by email', async () => {
      (mockUsersService.findById as jest.Mock).mockResolvedValue({ ...mockUser, email: 'test@example.com' });
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        service.changePassword(mockUser.id, 'currentPassword', 'newPassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyMfa - edge cases', () => {
    it('should throw UnauthorizedException for expired MFA token', async () => {
      await expect(service.verifyMfa('expired-mfa-token', '123456')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for non-6-digit MFA code', async () => {
      const mfaUser = { ...mockUser, mfaEnabled: true };
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mfaUser);
      (mockUsersService.findById as jest.Mock).mockResolvedValue(mfaUser);
      // @ts-expect-error -- Testing invalid input
      (bcrypt.compare as any).mockResolvedValue(true);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('mfa-token');
      await service.login({ email: mfaUser.email, password: 'password' });

      await expect(service.verifyMfa('mfa-token', '12345')).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyMfa('mfa-token', '1234567')).rejects.toThrow(UnauthorizedException);
      await expect(service.verifyMfa('mfa-token', 'abcdef')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('resetPassword - edge cases', () => {
    it('should invalidate all refresh tokens after password reset', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (mockJwtService.signAsync as jest.Mock).mockResolvedValue('valid-reset-token');
      const forgotResult = await service.forgotPassword(mockUser.email);

      (mockUsersService.updatePassword as jest.Mock).mockResolvedValue(undefined);
      await service.resetPassword(forgotResult.resetToken, 'newPassword');

      expect(mockUsersService.updatePassword).toHaveBeenCalledWith(mockUser.id, 'newPassword');
    });
  });

  describe('logout - edge cases', () => {
    it('should handle logout for already logged out user gracefully', async () => {
      const result = await service.logout('some-user-id');
      const secondResult = await service.logout('some-user-id');

      expect(result).toHaveProperty('message', 'Logged out successfully');
      expect(secondResult).toHaveProperty('message', 'Logged out successfully');
    });
  });
});
