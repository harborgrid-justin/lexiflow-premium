import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Role } from '../common/enums/role.enum';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenStorageService } from './token-storage.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private tokenStorage: TokenStorageService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: registerDto.role || Role.CLIENT_USER,
      isActive: true,
      mfaEnabled: false,
    });

    const tokens = await this.generateTokens(user);

    // Store refresh token with TTL
    const ttlDays = parseInt(this.configService.get('REFRESH_TOKEN_TTL_DAYS', '7'), 10);
    await this.tokenStorage.storeRefreshToken(
      user.id,
      {
        userId: user.id,
        token: tokens.refreshToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
      },
      ttlDays * 24 * 60 * 60,
    );

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // If MFA is enabled, generate MFA token
    if (user.mfaEnabled) {
      const mfaToken = await this.generateMfaToken(user.id);
      return {
        requiresMfa: true,
        mfaToken,
      };
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token with TTL
    const ttlDays = parseInt(this.configService.get('REFRESH_TOKEN_TTL_DAYS', '7'), 10);
    await this.tokenStorage.storeRefreshToken(
      user.id,
      {
        userId: user.id,
        token: tokens.refreshToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
      },
      ttlDays * 24 * 60 * 60,
    );

    // Log authentication event (in production, use proper audit logging)
    this.logger.log(
      `[AUTH] User ${user.email} logged in at ${new Date().toISOString()}`,
    );

    return {
      user,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
      if (!refreshSecret) {
        throw new UnauthorizedException('Server configuration error');
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: refreshSecret,
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify refresh token is in storage
      const storedTokenData = await this.tokenStorage.getRefreshToken(payload.sub);
      if (!storedTokenData || storedTokenData.token !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      // Update stored refresh token with TTL
      const ttlDays = parseInt(this.configService.get('REFRESH_TOKEN_TTL_DAYS', '7'), 10);
      await this.tokenStorage.storeRefreshToken(
        user.id,
        {
          userId: user.id,
          token: tokens.refreshToken,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
        },
        ttlDays * 24 * 60 * 60,
      );

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, jti?: string, exp?: number) {
    // Remove refresh token from storage
    await this.tokenStorage.deleteRefreshToken(userId);

    // Blacklist the current access token if JTI is provided
    if (jti && exp) {
      const expiresAt = new Date(exp * 1000); // Convert seconds to milliseconds
      await this.tokenBlacklistService.blacklistToken(jti, expiresAt);
      this.logger.log(`[AUTH] Blacklisted token ${jti} for user ${userId}`);
    }

    // Log logout event
    this.logger.log(`[AUTH] User ${userId} logged out at ${new Date().toISOString()}`);

    return { message: 'Logged out successfully' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findByEmail(
      (await this.usersService.findById(userId))?.email || '',
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, newPassword);

    // Invalidate all refresh tokens for this user
    await this.tokenStorage.deleteUserRefreshTokens(userId);

    // Blacklist all existing access tokens for this user
    await this.tokenBlacklistService.blacklistUserTokens(userId);

    // Log password change event
    this.logger.log(
      `[AUTH] User ${userId} changed password at ${new Date().toISOString()}`,
    );

    return { message: 'Password changed successfully. All sessions have been invalidated.' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If an account with that email exists, a reset link has been sent',
      };
    }

    // Generate reset token
    const ttlHours = parseInt(this.configService.get('RESET_TOKEN_TTL_HOURS', '1'), 10);
    const jwtSecret = this.configService.get<string>('jwt.secret');
    if (!jwtSecret) {
      throw new BadRequestException('Server configuration error');
    }
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'reset' },
      {
        secret: jwtSecret,
        expiresIn: `${ttlHours}h`,
      },
    );

    // Store reset token with TTL
    await this.tokenStorage.storeResetToken(
      resetToken,
      {
        userId: user.id,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString(),
      },
      ttlHours * 60 * 60,
    );

    // In production, send email with reset link
    this.logger.log(
      `[AUTH] Password reset requested for ${email}. Token: ${resetToken}`,
    );

    return {
      message: 'If an account with that email exists, a reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetData = await this.tokenStorage.getResetToken(token);

    if (!resetData || new Date(resetData.expiresAt) < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(resetData.userId, newPassword);

    // Remove reset token
    await this.tokenStorage.deleteResetToken(token);

    // Invalidate all refresh tokens for this user
    await this.tokenStorage.deleteUserRefreshTokens(resetData.userId);

    // Blacklist all existing access tokens for this user
    await this.tokenBlacklistService.blacklistUserTokens(resetData.userId);

    // Log password reset event
    this.logger.log(
      `[AUTH] User ${resetData.userId} reset password at ${new Date().toISOString()}`,
    );

    return { message: 'Password reset successfully. All sessions have been invalidated.' };
  }

  /**
   * Setup MFA for a user
   * Generates a TOTP secret and returns it with a QR code for scanning
   */
  async setupMfa(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate TOTP secret
    const secret = authenticator.generateSecret();

    // Store the secret for this user
    await this.usersService.setTotpSecret(userId, secret);

    // Generate otpauth URL for QR code
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'LexiFlow Premium',
      secret,
    );

    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    return {
      secret,
      qrCode: qrCodeDataUrl,
      otpauthUrl,
    };
  }

  /**
   * Enable MFA for a user after verifying they can generate valid codes
   */
  async enableMfa(userId: string, verificationCode: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const totpSecret = await this.usersService.getTotpSecret(userId);
    if (!totpSecret) {
      throw new BadRequestException('MFA not set up. Please call /auth/mfa/setup first');
    }

    // Verify the code
    const isValid = authenticator.verify({
      token: verificationCode,
      secret: totpSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Enable MFA for the user
    await this.usersService.setMfaEnabled(userId, true);

    return { message: 'MFA enabled successfully' };
  }

  /**
   * Disable MFA for a user
   */
  async disableMfa(userId: string, verificationCode: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled for this user');
    }

    const totpSecret = await this.usersService.getTotpSecret(userId);
    if (!totpSecret) {
      throw new BadRequestException('MFA secret not found');
    }

    // Verify the code before disabling
    const isValid = authenticator.verify({
      token: verificationCode,
      secret: totpSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Disable MFA and clear the secret
    await this.usersService.setMfaEnabled(userId, false);
    await this.usersService.setTotpSecret(userId, '');

    return { message: 'MFA disabled successfully' };
  }

  async verifyMfa(mfaToken: string, code: string) {
    const mfaData = await this.tokenStorage.getMfaToken(mfaToken);

    if (!mfaData || new Date(mfaData.expiresAt) < new Date()) {
      throw new UnauthorizedException('Invalid or expired MFA token');
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      throw new UnauthorizedException('Invalid MFA code format');
    }

    // Verify the MFA code against user's stored TOTP secret
    const user = await this.usersService.findById(mfaData.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValidCode = await this.verifyTotpCode(user, code);
    if (!isValidCode) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token with TTL
    const ttlDays = parseInt(this.configService.get('REFRESH_TOKEN_TTL_DAYS', '7'), 10);
    await this.tokenStorage.storeRefreshToken(
      user.id,
      {
        userId: user.id,
        token: tokens.refreshToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
      },
      ttlDays * 24 * 60 * 60,
    );

    // Remove MFA token
    await this.tokenStorage.deleteMfaToken(mfaToken);

    // Log MFA verification event
    this.logger.log(
      `[AUTH] User ${user.id} verified MFA at ${new Date().toISOString()}`,
    );

    return {
      user,
      ...tokens,
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      this.logger.warn(`Authentication failed: User not found`);
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      this.logger.warn(`Authentication failed: Invalid password for user ${user.id}`);
      return null;
    }

    return this.usersService.findById(user.id);
  }

  private async generateTokens(user: AuthenticatedUser) {
    // Generate unique JTI for each token to enable blacklisting
    const accessJti = uuidv4();
    const refreshJti = uuidv4();

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
      jti: accessJti,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
      jti: refreshJti,
    };

    const jwtSecret = this.configService.get<string>('jwt.secret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');

    if (!jwtSecret || !refreshSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: jwtSecret,
        expiresIn: (this.configService.get<string>('jwt.expiresIn') || '900') as any,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') || '604800') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateMfaToken(userId: string): Promise<string> {
    const ttlMinutes = parseInt(this.configService.get('MFA_TOKEN_TTL_MINUTES', '5'), 10);
    const jwtSecret = this.configService.get<string>('jwt.secret');
    if (!jwtSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    const mfaToken = await this.jwtService.signAsync(
      { sub: userId, type: 'mfa' },
      {
        secret: jwtSecret,
        expiresIn: `${ttlMinutes}m`,
      },
    );

    // Store MFA token with TTL
    await this.tokenStorage.storeMfaToken(
      mfaToken,
      {
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
      },
      ttlMinutes * 60,
    );

    return mfaToken;
  }

  /**
   * Verify TOTP code using otplib
   * Validates the 6-digit code against the user's stored TOTP secret
   */
  private async verifyTotpCode(
    user: AuthenticatedUser,
    code: string,
  ): Promise<boolean> {
    if (!user.mfaEnabled) {
      return false;
    }

    const totpSecret = await this.usersService.getTotpSecret(user.id);
    if (!totpSecret) {
      return false;
    }

    try {
      // Verify the TOTP code with a window of 1 (allows for time drift)
      const isValid = authenticator.verify({
        token: code,
        secret: totpSecret,
      });

      return isValid;
    } catch (error) {
      this.logger.error('[AUTH] TOTP verification error:', error);
      return false;
    }
  }
}
