import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortalUser } from './entities/portal-user.entity';
import { Client } from '@clients/entities/client.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ClientPortalService {
  constructor(
    @InjectRepository(PortalUser)
    private readonly portalUserRepository: Repository<PortalUser>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new portal user
   */
  async register(data: {
    clientId: string;
    email: string;
    password: string;
  }): Promise<{ portalUser: PortalUser; verificationToken: string }> {
    // Check if client exists
    const client = await this.clientRepository.findOne({
      where: { id: data.clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if email already exists
    const existingUser = await this.portalUserRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours

    const portalUser = this.portalUserRepository.create({
      clientId: data.clientId,
      email: data.email,
      passwordHash,
      mfaEnabled: false,
      status: 'pending_verification',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
      loginAttempts: 0,
      preferences: {},
      notificationSettings: {
        email: true,
        sms: false,
        inApp: true,
      },
    });

    const savedUser = await this.portalUserRepository.save(portalUser);

    return { portalUser: savedUser, verificationToken };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<PortalUser> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!portalUser) {
      throw new NotFoundException('Invalid verification token');
    }

    if (portalUser.emailVerificationExpiry < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    portalUser.emailVerified = true;
    portalUser.status = 'active';
    portalUser.emailVerificationToken = null;
    portalUser.emailVerificationExpiry = null;

    return await this.portalUserRepository.save(portalUser);
  }

  /**
   * Login to portal
   */
  async login(email: string, password: string): Promise<{
    accessToken: string;
    refreshToken: string;
    portalUser: PortalUser;
    requiresMfa: boolean;
  }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { email },
      relations: ['client'],
    });

    if (!portalUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (portalUser.lockedUntil && portalUser.lockedUntil > new Date()) {
      throw new UnauthorizedException('Account is locked. Please try again later.');
    }

    // Check if email is verified
    if (!portalUser.emailVerified) {
      throw new UnauthorizedException('Email not verified. Please check your email for verification link.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, portalUser.passwordHash);

    if (!isPasswordValid) {
      // Increment login attempts
      portalUser.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (portalUser.loginAttempts >= 5) {
        portalUser.lockedUntil = new Date();
        portalUser.lockedUntil.setMinutes(portalUser.lockedUntil.getMinutes() + 30); // Lock for 30 minutes
        portalUser.status = 'locked';
      }

      await this.portalUserRepository.save(portalUser);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    portalUser.loginAttempts = 0;
    portalUser.lastLogin = new Date();

    if (portalUser.status === 'locked') {
      portalUser.status = 'active';
      portalUser.lockedUntil = null;
    }

    // Generate tokens
    const payload = {
      sub: portalUser.id,
      email: portalUser.email,
      clientId: portalUser.clientId,
      type: 'portal',
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store tokens
    portalUser.accessToken = accessToken;
    portalUser.refreshToken = refreshToken;
    portalUser.tokenExpiry = new Date();
    portalUser.tokenExpiry.setHours(portalUser.tokenExpiry.getHours() + 1);

    await this.portalUserRepository.save(portalUser);

    return {
      accessToken,
      refreshToken,
      portalUser,
      requiresMfa: portalUser.mfaEnabled,
    };
  }

  /**
   * Logout from portal
   */
  async logout(portalUserId: string): Promise<void> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (portalUser) {
      portalUser.accessToken = null;
      portalUser.refreshToken = null;
      portalUser.tokenExpiry = null;
      portalUser.sessionData = null;

      await this.portalUserRepository.save(portalUser);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      const portalUser = await this.portalUserRepository.findOne({
        where: { id: payload.sub },
      });

      if (!portalUser || portalUser.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const newPayload = {
        sub: portalUser.id,
        email: portalUser.email,
        clientId: portalUser.clientId,
        type: 'portal',
      };

      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '1h' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      portalUser.accessToken = newAccessToken;
      portalUser.refreshToken = newRefreshToken;
      portalUser.tokenExpiry = new Date();
      portalUser.tokenExpiry.setHours(portalUser.tokenExpiry.getHours() + 1);

      await this.portalUserRepository.save(portalUser);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { email },
    });

    if (!portalUser) {
      // Don't reveal if email exists
      return { resetToken: 'mock-token' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1); // 1 hour

    portalUser.resetToken = resetToken;
    portalUser.resetTokenExpiry = resetExpiry;

    await this.portalUserRepository.save(portalUser);

    return { resetToken };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { resetToken: token },
    });

    if (!portalUser) {
      throw new NotFoundException('Invalid reset token');
    }

    if (portalUser.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    portalUser.passwordHash = passwordHash;
    portalUser.resetToken = null;
    portalUser.resetTokenExpiry = null;
    portalUser.lastPasswordChange = new Date();
    portalUser.loginAttempts = 0;

    await this.portalUserRepository.save(portalUser);
  }

  /**
   * Change password (when logged in)
   */
  async changePassword(
    portalUserId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, portalUser.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    portalUser.passwordHash = passwordHash;
    portalUser.lastPasswordChange = new Date();

    await this.portalUserRepository.save(portalUser);
  }

  /**
   * Get portal user profile
   */
  async getProfile(portalUserId: string): Promise<PortalUser> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      relations: ['client'],
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    return portalUser;
  }

  /**
   * Update portal user profile
   */
  async updateProfile(
    portalUserId: string,
    data: {
      preferences?: Record<string, unknown>;
      notificationSettings?: Record<string, unknown>;
    },
  ): Promise<PortalUser> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    if (data.preferences) {
      portalUser.preferences = { ...portalUser.preferences, ...data.preferences };
    }

    if (data.notificationSettings) {
      portalUser.notificationSettings = {
        ...portalUser.notificationSettings,
        ...data.notificationSettings,
      };
    }

    portalUser.updatedBy = portalUserId;

    return await this.portalUserRepository.save(portalUser);
  }

  /**
   * Enable MFA
   */
  async enableMfa(portalUserId: string): Promise<{ secret: string; qrCode: string }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    // Generate MFA secret (in production, use speakeasy or similar)
    const mfaSecret = crypto.randomBytes(20).toString('hex');

    portalUser.mfaSecret = mfaSecret;
    portalUser.mfaEnabled = true;

    await this.portalUserRepository.save(portalUser);

    // In production, generate actual QR code
    const qrCode = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+`;

    return { secret: mfaSecret, qrCode };
  }

  /**
   * Disable MFA
   */
  async disableMfa(portalUserId: string): Promise<void> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    portalUser.mfaEnabled = false;
    portalUser.mfaSecret = null;

    await this.portalUserRepository.save(portalUser);
  }

  /**
   * Get dashboard summary for portal user
   */
  async getDashboardSummary(portalUserId: string): Promise<{
    unreadMessages: number;
    upcomingAppointments: number;
    pendingDocuments: number;
    unpaidInvoices: number;
    recentActivity: Array<{
      type: string;
      message: string;
      timestamp: Date;
    }>;
  }> {
    const portalUser = await this.portalUserRepository.findOne({
      where: { id: portalUserId },
      relations: ['messages', 'appointments', 'sharedDocuments', 'notifications'],
    });

    if (!portalUser) {
      throw new NotFoundException('Portal user not found');
    }

    const now = new Date();

    const summary = {
      unreadMessages: portalUser.messages?.filter((m) => !m.read).length || 0,
      upcomingAppointments:
        portalUser.appointments?.filter(
          (a) => a.datetime >= now && ['scheduled', 'confirmed'].includes(a.status),
        ).length || 0,
      pendingDocuments:
        portalUser.sharedDocuments?.filter((d) => d.requiresSignature && !d.signedAt).length || 0,
      unpaidInvoices: 0, // TODO: Calculate from billing module
      recentActivity: [],
    };

    return summary;
  }
}
