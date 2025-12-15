import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  // In-memory storage for refresh tokens (replace with Redis in production)
  private refreshTokens: Map<string, string> = new Map();
  // In-memory storage for password reset tokens
  private resetTokens: Map<string, { userId: string; expires: Date }> =
    new Map();
  // In-memory storage for MFA tokens
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

    // TODO: Implement proper TOTP verification using speakeasy or similar library
    // For now, reject all codes until proper TOTP is implemented
    // This ensures MFA cannot be bypassed
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

  // Verify TOTP code - placeholder for proper implementation
  // In production, use speakeasy or similar library with user's stored TOTP secret
  private async verifyTotpCode(
    user: AuthenticatedUser,
    code: string,
  ): Promise<boolean> {
    // TODO: Implement proper TOTP verification
    // Example with speakeasy:
    // return speakeasy.totp.verify({
    //   secret: user.totpSecret,
    //   encoding: 'base32',
    //   token: code,
    //   window: 1,
    // });

    // For now, MFA verification requires proper implementation
    // Returning false ensures MFA cannot be bypassed
    return false;
  }
}
