import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { Role } from '../common/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.CLIENT_USER,
    isActive: true,
  };

  const mockAuthResponse = {
    user: mockUser,
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  const mockAuthService = {
    register: jest.fn().mockResolvedValue(mockAuthResponse),
    login: jest.fn().mockResolvedValue(mockAuthResponse),
    refresh: jest.fn().mockResolvedValue({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
    logout: jest.fn().mockResolvedValue({ message: 'Logged out successfully' }),
    changePassword: jest.fn().mockResolvedValue({ message: 'Password changed successfully' }),
    forgotPassword: jest.fn().mockResolvedValue({ message: 'Reset link sent' }),
    resetPassword: jest.fn().mockResolvedValue({ message: 'Password reset successfully' }),
    verifyMfa: jest.fn().mockResolvedValue(mockAuthResponse),
  };

  const mockUsersService = {
    update: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle MFA response', async () => {
      const mfaResponse = { requiresMfa: true, mfaToken: 'mfa-token' };
      mockAuthService.login.mockResolvedValueOnce(mfaResponse);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(loginDto);

      expect(result).toEqual(mfaResponse);
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const result = await controller.logout(mockUser.id);

      expect(result).toHaveProperty('message', 'Logged out successfully');
      expect(authService.logout).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getProfile(mockUser as any);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = { firstName: 'Updated' };

      const result = await controller.updateProfile(mockUser.id, updateDto);

      expect(result).toEqual(mockUser);
      expect(usersService.update).toHaveBeenCalledWith(mockUser.id, updateDto);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      const result = await controller.changePassword(mockUser.id, changePasswordDto);

      expect(result).toHaveProperty('message', 'Password changed successfully');
      expect(authService.changePassword).toHaveBeenCalledWith(
        mockUser.id,
        'oldPassword',
        'newPassword',
      );
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(result).toHaveProperty('message');
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('resetPassword', () => {
    it('should reset password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        newPassword: 'newPassword123',
      };

      const result = await controller.resetPassword(resetPasswordDto);

      expect(result).toHaveProperty('message', 'Password reset successfully');
      expect(authService.resetPassword).toHaveBeenCalledWith(
        'reset-token',
        'newPassword123',
      );
    });
  });

  describe('verifyMfa', () => {
    it('should verify MFA', async () => {
      const verifyMfaDto: VerifyMfaDto = {
        token: 'mfa-token',
        code: '123456',
      };

      const result = await controller.verifyMfa(verifyMfaDto);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.verifyMfa).toHaveBeenCalledWith('mfa-token', '123456');
    });
  });
});
