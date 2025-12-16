import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  /**
   * IMPORTANT: In-memory storage for tokens (NOT suitable for production)
   *
   * SECURITY CONSIDERATIONS:
   * - All tokens stored in these Maps will be LOST on server restart
   * - Does NOT scale across multiple server instances
   * - No persistence means users will be logged out on restart
   *
   * PRODUCTION RECOMMENDATIONS:
   * - Use Redis for distributed token storage
   * - Or use PostgreSQL with proper indexing for token lookups
   * - Implement token cleanup/TTL to prevent memory leaks
   * - Consider using @Scope(Scope.REQUEST) if stateless design is preferred
   */
  private refreshTokens: Map<string, string> = new Map();
  private resetTokens: Map<string, { userId: string; expires: Date }> = new Map();
  private mfaTokens: Map<string, { userId: string; expires: Date }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
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

    // Store refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken);

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

    // Store refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken);

    // Log authentication event (in production, use proper audit logging)
    console.log(
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
      const storedToken = this.refreshTokens.get(payload.sub);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      // Update stored refresh token
      this.refreshTokens.set(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // Remove refresh token from storage
    this.refreshTokens.delete(userId);

    // Log logout event
    console.log(`[AUTH] User ${userId} logged out at ${new Date().toISOString()}`);

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
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, newPassword);

    // Invalidate all refresh tokens
    this.refreshTokens.delete(userId);

    // Log password change event
    console.log(
      `[AUTH] User ${userId} changed password at ${new Date().toISOString()}`,
    );

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return {
        message: 'If an account with that email exists, a reset link has been sent',
      };
    }

    // Generate reset token (6 hours expiry)
    const jwtSecret = this.configService.get<string>('jwt.secret');
    if (!jwtSecret) {
      throw new BadRequestException('Server configuration error');
    }
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, type: 'reset' },
      {
        secret: jwtSecret,
        expiresIn: '6h',
      },
    );

    // Store reset token
    this.resetTokens.set(resetToken, {
      userId: user.id,
      expires: new Date(Date.now() + 6 * 60 * 60 * 1000),
    });

    // In production, send email with reset link
    console.log(
      `[AUTH] Password reset requested for ${email}. Token: ${resetToken}`,
    );

    return {
      message: 'If an account with that email exists, a reset link has been sent',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetData = this.resetTokens.get(token);

    if (!resetData || resetData.expires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    await this.usersService.updatePassword(resetData.userId, newPassword);

    // Remove reset token
    this.resetTokens.delete(token);

    // Invalidate all refresh tokens
    this.refreshTokens.delete(resetData.userId);

    // Log password reset event
    console.log(
      `[AUTH] User ${resetData.userId} reset password at ${new Date().toISOString()}`,
    );

    return { message: 'Password reset successfully' };
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
    const mfaData = this.mfaTokens.get(mfaToken);

    if (!mfaData || mfaData.expires < new Date()) {
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

    // Store refresh token
    this.refreshTokens.set(user.id, tokens.refreshToken);

    // Remove MFA token
    this.mfaTokens.delete(mfaToken);

    // Log MFA verification event
    console.log(
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
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return this.usersService.findById(user.id);
  }

  private async generateTokens(user: AuthenticatedUser) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
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
    const jwtSecret = this.configService.get<string>('jwt.secret');
    if (!jwtSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    const mfaToken = await this.jwtService.signAsync(
      { sub: userId, type: 'mfa' },
      {
        secret: jwtSecret,
        expiresIn: '5m',
      },
    );

    // Store MFA token (5 minutes expiry)
    this.mfaTokens.set(mfaToken, {
      userId,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

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
      console.error('[AUTH] TOTP verification error:', error);
      return false;
    }
  }
}
