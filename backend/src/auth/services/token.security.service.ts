import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '@auth/entities/refresh-token.entity';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
  fingerprint?: string;
  familyId?: string;
}

export interface ClientFingerprint {
  userAgent: string;
  ipAddress: string;
  acceptLanguage?: string;
  acceptEncoding?: string;
}

/**
 * Token Security Service
 *
 * Enterprise-grade token security for LexiFlow Premium.
 * Implements advanced token security features including client fingerprinting,
 * refresh token rotation with family tracking, and automatic revocation.
 *
 * Features:
 * - Token binding to client fingerprint
 * - Refresh token rotation with family tracking
 * - Automatic revocation of token families on reuse detection
 * - Short-lived access tokens with automatic refresh
 * - Secure token generation and validation
 */
@Injectable()
export class TokenSecurityService {
  private readonly logger = new Logger(TokenSecurityService.name);
  private readonly accessTokenTtlSeconds: number;
  private readonly refreshTokenTtlDays: number;
  private readonly enableFingerprinting: boolean;
  private readonly enableFamilyTracking: boolean;

  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenTtlSeconds = parseInt(
      this.configService.get('jwt.expiresIn', '900'),
      10,
    );
    this.refreshTokenTtlDays = parseInt(
      this.configService.get('REFRESH_TOKEN_TTL_DAYS', '7'),
      10,
    );
    this.enableFingerprinting =
      this.configService.get('TOKEN_FINGERPRINTING_ENABLED', 'true') === 'true';
    this.enableFamilyTracking =
      this.configService.get('TOKEN_FAMILY_TRACKING_ENABLED', 'true') === 'true';

    this.logger.log('Token Security Service initialized', {
      accessTokenTtl: `${this.accessTokenTtlSeconds}s`,
      refreshTokenTtl: `${this.refreshTokenTtlDays}d`,
      fingerprinting: this.enableFingerprinting,
      familyTracking: this.enableFamilyTracking,
    });
  }

  /**
   * Generate a new token pair with security features
   */
  async generateTokenPair(
    userId: string,
    email: string,
    role: string,
    fingerprint: ClientFingerprint,
    familyId?: string,
  ): Promise<TokenPair> {
    const accessJti = uuidv4();
    const refreshJti = uuidv4();
    const tokenFamilyId = familyId || uuidv4();

    // Generate client fingerprint hash
    const fingerprintHash = this.enableFingerprinting
      ? this.generateFingerprint(fingerprint)
      : undefined;

    const now = new Date();
    const accessExpiresAt = new Date(
      now.getTime() + this.accessTokenTtlSeconds * 1000,
    );
    const refreshExpiresAt = new Date(
      now.getTime() + this.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    );

    // Access token payload
    const accessPayload: Partial<TokenPayload> = {
      sub: userId,
      email,
      role,
      type: 'access',
      jti: accessJti,
    };

    if (this.enableFingerprinting && fingerprintHash) {
      accessPayload.fingerprint = fingerprintHash;
    }

    // Refresh token payload
    const refreshPayload: Partial<TokenPayload> = {
      sub: userId,
      email,
      role,
      type: 'refresh',
      jti: refreshJti,
    };

    if (this.enableFamilyTracking) {
      refreshPayload.familyId = tokenFamilyId;
    }

    const jwtSecret = this.configService.get<string>('app.jwt.secret');
    const refreshSecret = this.configService.get<string>('app.jwt.refreshSecret');

    if (!jwtSecret || !refreshSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload as object, {
        secret: jwtSecret,
        expiresIn: this.accessTokenTtlSeconds,
      }),
      this.jwtService.signAsync(refreshPayload as object, {
        secret: refreshSecret,
        expiresIn: this.refreshTokenTtlDays * 24 * 60 * 60,
      }),
    ]);

    // Store refresh token in database
    await this.storeRefreshToken(
      refreshJti,
      userId,
      refreshToken,
      tokenFamilyId,
      refreshExpiresAt,
      fingerprint,
    );

    this.logger.debug(
      `Generated token pair for user ${userId}, family ${tokenFamilyId}`,
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: accessExpiresAt,
      refreshTokenExpiresAt: refreshExpiresAt,
    };
  }

  /**
   * Rotate refresh token (generate new pair using existing refresh token)
   * Implements token family tracking to detect reuse attacks
   */
  async rotateRefreshToken(
    oldRefreshToken: string,
    fingerprint: ClientFingerprint,
  ): Promise<TokenPair> {
    // Verify refresh token
    const refreshSecret = this.configService.get<string>('app.jwt.refreshSecret');
    if (!refreshSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        oldRefreshToken,
        { secret: refreshSecret },
      );
    } catch (error) {
      this.logger.warn('Invalid refresh token during rotation', error);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Get stored refresh token
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { userId: payload.sub, token: oldRefreshToken },
    });

    if (!storedToken) {
      this.logger.warn(
        `Refresh token not found in database for user ${payload.sub}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token is revoked
    if (storedToken.revoked) {
      this.logger.error(
        `SECURITY ALERT: Attempted reuse of revoked refresh token by user ${payload.sub}`,
      );

      // Revoke entire token family (reuse attack detected)
      if (this.enableFamilyTracking && payload.familyId) {
        await this.revokeTokenFamily(payload.familyId, payload.sub);
      }

      throw new UnauthorizedException(
        'Refresh token has been revoked. Please log in again.',
      );
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      this.logger.warn(
        `Expired refresh token used by user ${payload.sub}`,
      );
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Validate fingerprint
    if (this.enableFingerprinting) {
      const isValidFingerprint = this.validateFingerprint(
        fingerprint,
        storedToken,
      );
      if (!isValidFingerprint) {
        this.logger.error(
          `SECURITY ALERT: Fingerprint mismatch for user ${payload.sub}`,
        );

        // Revoke token family on fingerprint mismatch
        if (this.enableFamilyTracking && payload.familyId) {
          await this.revokeTokenFamily(payload.familyId, payload.sub);
        }

        throw new UnauthorizedException(
          'Security validation failed. Please log in again.',
        );
      }
    }

    // Revoke old refresh token
    storedToken.revoked = true;
    await this.refreshTokenRepository.save(storedToken);

    // Generate new token pair with same family ID
    const newTokenPair = await this.generateTokenPair(
      payload.sub,
      payload.email,
      payload.role,
      fingerprint,
      payload.familyId,
    );

    this.logger.log(
      `Rotated refresh token for user ${payload.sub}, family ${payload.familyId}`,
    );

    return newTokenPair;
  }

  /**
   * Validate access token fingerprint
   */
  async validateAccessToken(
    token: string,
    fingerprint: ClientFingerprint,
  ): Promise<boolean> {
    if (!this.enableFingerprinting) {
      return true;
    }

    try {
      const jwtSecret = this.configService.get<string>('jwt.secret');
      if (!jwtSecret) {
        return false;
      }

      const payload = await this.jwtService.verifyAsync<TokenPayload>(token, {
        secret: jwtSecret,
      });

      if (!payload.fingerprint) {
        // Token doesn't have fingerprint, skip validation
        return true;
      }

      const currentFingerprint = this.generateFingerprint(fingerprint);
      return payload.fingerprint === currentFingerprint;
    } catch (error) {
      this.logger.error('Error validating access token', error);
      return false;
    }
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeRefreshToken(jti: string, userId: string): Promise<void> {
    const token = await this.refreshTokenRepository.findOne({
      where: { id: jti, userId },
    });

    if (token) {
      token.revoked = true;
      await this.refreshTokenRepository.save(token);

      this.logger.log(`Revoked refresh token ${jti} for user ${userId}`);
    }
  }

  /**
   * Revoke all refresh tokens in a family
   * Used when token reuse or security breach is detected
   */
  async revokeTokenFamily(familyId: string, userId: string): Promise<number> {
    const familyTokens = await this.refreshTokenRepository.find({
      where: { userId },
    });

    // Filter tokens by family ID from JWT payload
    const tokensToRevoke: RefreshToken[] = [];

    for (const token of familyTokens) {
      if (token.revoked) continue;

      try {
        const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
        if (!refreshSecret) continue;

        const payload = await this.jwtService.verifyAsync<TokenPayload>(
          token.token,
          {
            secret: refreshSecret,
            ignoreExpiration: true,
          },
        );

        if (payload.familyId === familyId) {
          tokensToRevoke.push(token);
        }
      } catch {
        // Ignore invalid tokens
        continue;
      }
    }

    // Revoke all tokens in family
    for (const token of tokensToRevoke) {
      token.revoked = true;
    }

    if (tokensToRevoke.length > 0) {
      await this.refreshTokenRepository.save(tokensToRevoke);

      this.logger.error(
        `SECURITY: Revoked ${tokensToRevoke.length} tokens in family ${familyId} for user ${userId}`,
      );
    }

    return tokensToRevoke.length;
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    const userTokens = await this.refreshTokenRepository.find({
      where: { userId, revoked: false },
    });

    for (const token of userTokens) {
      token.revoked = true;
    }

    if (userTokens.length > 0) {
      await this.refreshTokenRepository.save(userTokens);

      this.logger.log(
        `Revoked all ${userTokens.length} refresh tokens for user ${userId}`,
      );
    }

    return userTokens.length;
  }

  /**
   * Cleanup expired refresh tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    const expiredTokens = await this.refreshTokenRepository
      .createQueryBuilder('token')
      .where('token.expiresAt < :now', { now: new Date() })
      .getMany();

    if (expiredTokens.length > 0) {
      await this.refreshTokenRepository.remove(expiredTokens);

      this.logger.log(
        `Cleaned up ${expiredTokens.length} expired refresh tokens`,
      );
    }

    return expiredTokens.length;
  }

  /**
   * Get active refresh tokens for a user
   */
  async getUserRefreshTokens(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: {
        userId,
        revoked: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Generate client fingerprint hash
   */
  private generateFingerprint(fingerprint: ClientFingerprint): string {
    const components = [
      fingerprint.userAgent,
      fingerprint.ipAddress,
      fingerprint.acceptLanguage || '',
      fingerprint.acceptEncoding || '',
    ];

    const fingerprintString = components.join('|');

    return crypto
      .createHash('sha256')
      .update(fingerprintString)
      .digest('hex');
  }

  /**
   * Validate client fingerprint against stored token
   */
  private validateFingerprint(
    currentFingerprint: ClientFingerprint,
    storedToken: RefreshToken,
  ): boolean {
    // For refresh tokens, we mainly validate IP and user agent
    if (
      currentFingerprint.ipAddress !== storedToken.ipAddress ||
      currentFingerprint.userAgent !== storedToken.userAgent
    ) {
      this.logger.warn(
        `Fingerprint mismatch: Expected IP ${storedToken.ipAddress}, got ${currentFingerprint.ipAddress}`,
      );
      return false;
    }

    return true;
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(
    jti: string,
    userId: string,
    token: string,
    familyId: string,
    expiresAt: Date,
    fingerprint: ClientFingerprint,
  ): Promise<void> {
    const refreshToken = this.refreshTokenRepository.create({
      id: jti,
      userId,
      token,
      expiresAt,
      userAgent: fingerprint.userAgent,
      ipAddress: fingerprint.ipAddress,
      revoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);

    this.logger.debug(
      `Stored refresh token ${jti} for user ${userId}, family ${familyId}`,
    );
  }

  /**
   * Get token security statistics
   */
  async getSecurityStats(userId?: string): Promise<{
    totalTokens: number;
    activeTokens: number;
    revokedTokens: number;
    expiredTokens: number;
  }> {
    const queryBuilder = this.refreshTokenRepository.createQueryBuilder('token');

    if (userId) {
      queryBuilder.where('token.userId = :userId', { userId });
    }

    const [totalTokens, activeTokens, revokedTokens, expiredTokens] =
      await Promise.all([
        queryBuilder.getCount(),
        queryBuilder.clone().andWhere('token.revoked = false').getCount(),
        queryBuilder.clone().andWhere('token.revoked = true').getCount(),
        queryBuilder
          .clone()
          .andWhere('token.expiresAt < :now', { now: new Date() })
          .getCount(),
      ]);

    return {
      totalTokens,
      activeTokens,
      revokedTokens,
      expiredTokens,
    };
  }
}
