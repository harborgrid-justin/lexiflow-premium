import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@users/users.service';
import { SamlConfig } from './entities/saml-config.entity';
import { SamlSession } from './entities/saml-session.entity';
import { CreateSamlConfigDto, UpdateSamlConfigDto } from './dto/saml-login.dto';
import { UserRole } from '@common/enums/role.enum';
import * as crypto from 'crypto';

/**
 * SAML SSO Service
 * Manages SAML 2.0 authentication, configuration, and session lifecycle
 */
@Injectable()
export class SamlService {
  private readonly logger = new Logger(SamlService.name);

  constructor(
    @InjectRepository(SamlConfig)
    private samlConfigRepository: Repository<SamlConfig>,
    @InjectRepository(SamlSession)
    private samlSessionRepository: Repository<SamlSession>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Get SAML configuration for an organization
   */
  async getSamlConfig(organizationId: string): Promise<SamlConfig> {
    const config = await this.samlConfigRepository.findOne({
      where: { organizationId, isActive: true },
    });

    if (!config) {
      throw new NotFoundException(
        `SAML configuration not found for organization: ${organizationId}`,
      );
    }

    return config;
  }

  /**
   * Create SAML configuration
   */
  async createSamlConfig(dto: CreateSamlConfigDto): Promise<SamlConfig> {
    // Check if config already exists
    const existing = await this.samlConfigRepository.findOne({
      where: { organizationId: dto.organizationId },
    });

    if (existing) {
      throw new BadRequestException(
        'SAML configuration already exists for this organization',
      );
    }

    const config = this.samlConfigRepository.create({
      organizationId: dto.organizationId,
      entityId: dto.entityId,
      entryPoint: dto.entryPoint,
      callbackUrl: dto.callbackUrl,
      issuer: dto.issuer,
      certificate: dto.certificate,
      providerName: dto.providerName,
      jitProvisioningEnabled: dto.jitProvisioningEnabled || false,
      defaultRole: dto.defaultRole || UserRole.STAFF,
      isActive: true,
      signatureAlgorithm: 'sha256',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      wantAssertionsSigned: true,
      wantResponseSigned: true,
      authnContext: [
        'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
      ],
      forceAuthn: false,
      passive: false,
      allowedDomains: [],
      attributeMapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
      },
    });

    await this.samlConfigRepository.save(config);
    this.logger.log(`Created SAML config for organization: ${dto.organizationId}`);

    return config;
  }

  /**
   * Update SAML configuration
   */
  async updateSamlConfig(
    organizationId: string,
    dto: UpdateSamlConfigDto,
  ): Promise<SamlConfig> {
    const config = await this.getSamlConfig(organizationId);

    Object.assign(config, dto);
    await this.samlConfigRepository.save(config);

    this.logger.log(`Updated SAML config for organization: ${organizationId}`);
    return config;
  }

  /**
   * Delete SAML configuration
   */
  async deleteSamlConfig(organizationId: string): Promise<void> {
    const config = await this.getSamlConfig(organizationId);
    await this.samlConfigRepository.remove(config);
    this.logger.log(`Deleted SAML config for organization: ${organizationId}`);
  }

  /**
   * Generate SAML authentication request (redirect URL)
   */
  async generateAuthRequest(
    organizationId: string,
    relayState?: string,
  ): Promise<{ redirectUrl: string; requestId: string }> {
    const config = await this.getSamlConfig(organizationId);

    // Generate unique request ID
    const requestId = `_${crypto.randomBytes(16).toString('hex')}`;
    const timestamp = new Date().toISOString();

    // Build SAML AuthnRequest
    const authnRequest = this.buildAuthnRequest(
      config,
      requestId,
      timestamp,
    );

    // Base64 encode and URL encode the request
    const encodedRequest = Buffer.from(authnRequest)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Build redirect URL
    const params = new URLSearchParams({
      SAMLRequest: encodedRequest,
    });

    if (relayState) {
      params.append('RelayState', relayState);
    }

    const redirectUrl = `${config.entryPoint}?${params.toString()}`;

    this.logger.log(
      `Generated SAML auth request for organization: ${organizationId}`,
    );

    return { redirectUrl, requestId };
  }

  /**
   * Handle SAML response from IdP
   */
  async handleSamlResponse(
    samlResponse: string,
    relayState?: string,
  ): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Decode SAML response
      const decodedResponse = Buffer.from(samlResponse, 'base64').toString(
        'utf-8',
      );

      // Parse SAML assertion (simplified - in production use proper XML parser)
      const assertion = this.parseSamlAssertion(decodedResponse);

      // Extract user attributes
      const email = assertion.attributes.email;
      const nameId = assertion.nameId;
      const sessionIndex = assertion.sessionIndex;

      if (!email) {
        throw new UnauthorizedException('Email not found in SAML assertion');
      }

      // Find or create user
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Check if JIT provisioning is enabled
        const domain = email.split('@')[1];
        const config = await this.samlConfigRepository.findOne({
          where: { isActive: true },
        });

        if (!config || !config.jitProvisioningEnabled) {
          throw new UnauthorizedException(
            'User not found and JIT provisioning is disabled',
          );
        }

        // Create new user via JIT provisioning
        user = await this.usersService.create({
          email,
          firstName: assertion.attributes.firstName || email.split('@')[0],
          lastName: assertion.attributes.lastName || '',
          role: (config.defaultRole as UserRole) || UserRole.STAFF,
          isActive: true,
          mfaEnabled: false,
          password: crypto.randomBytes(32).toString('hex'), // Random password (won't be used)
        });

        this.logger.log(`JIT provisioned user: ${email}`);
      }

      // Create SAML session
      const samlSession = this.samlSessionRepository.create({
        userId: user.id,
        organizationId: assertion.organizationId || 'default',
        nameId,
        sessionIndex,
        samlConfigId: assertion.configId || 'default',
        attributes: assertion.attributes,
        assertion: decodedResponse,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        lastActivityAt: new Date(),
        isActive: true,
        ipAddress: '0.0.0.0', // Should be extracted from request
        userAgent: '',
      });

      await this.samlSessionRepository.save(samlSession);

      // Generate JWT tokens
      const tokens = await this.generateTokens(user);

      this.logger.log(`SAML authentication successful for user: ${email}`);

      return {
        user,
        ...tokens,
      };
    } catch (error) {
      this.logger.error('SAML response handling failed:', error);
      throw new UnauthorizedException('Invalid SAML response');
    }
  }

  /**
   * Initiate SAML logout
   */
  async initiateLogout(
    userId: string,
  ): Promise<{ redirectUrl: string; logoutRequestId: string }> {
    const session = await this.samlSessionRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!session) {
      throw new NotFoundException('Active SAML session not found');
    }

    const config = await this.getSamlConfig(session.organizationId);

    // Generate logout request
    const logoutRequestId = `_${crypto.randomBytes(16).toString('hex')}`;
    const logoutRequest = this.buildLogoutRequest(
      config,
      session.nameId,
      session.sessionIndex,
      logoutRequestId,
    );

    // Encode logout request
    const encodedRequest = Buffer.from(logoutRequest)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    const redirectUrl = `${config.entryPoint}?SAMLRequest=${encodedRequest}`;

    // Invalidate session
    session.isActive = false;
    await this.samlSessionRepository.save(session);

    this.logger.log(`Initiated SAML logout for user: ${userId}`);

    return { redirectUrl, logoutRequestId };
  }

  /**
   * Handle SAML logout response
   */
  async handleLogoutResponse(logoutResponse: string): Promise<void> {
    // Parse and validate logout response
    // In production, properly validate the response signature and status
    this.logger.log('SAML logout response received');
  }

  /**
   * Get SAML metadata for SP
   */
  async getServiceProviderMetadata(organizationId: string): Promise<string> {
    const config = await this.getSamlConfig(organizationId);

    return `<?xml version="1.0"?>
<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata"
                  entityID="${config.issuer}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
                   AuthnRequestsSigned="${config.wantResponseSigned}"
                   WantAssertionsSigned="${config.wantAssertionsSigned}">
    <NameIDFormat>${config.nameIdFormat}</NameIDFormat>
    <AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                              Location="${config.callbackUrl}"
                              index="0" isDefault="true"/>
  </SPSSODescriptor>
</EntityDescriptor>`;
  }

  /**
   * Build SAML AuthnRequest XML
   */
  private buildAuthnRequest(
    config: SamlConfig,
    requestId: string,
    timestamp: string,
  ): string {
    return `<?xml version="1.0"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                    ID="${requestId}"
                    Version="2.0"
                    IssueInstant="${timestamp}"
                    Destination="${config.entryPoint}"
                    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                    AssertionConsumerServiceURL="${config.callbackUrl}">
  <saml:Issuer>${config.issuer}</saml:Issuer>
  <samlp:NameIDPolicy Format="${config.nameIdFormat}" AllowCreate="true"/>
</samlp:AuthnRequest>`;
  }

  /**
   * Build SAML LogoutRequest XML
   */
  private buildLogoutRequest(
    config: SamlConfig,
    nameId: string,
    sessionIndex: string,
    requestId: string,
  ): string {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0"?>
<samlp:LogoutRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                     xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                     ID="${requestId}"
                     Version="2.0"
                     IssueInstant="${timestamp}"
                     Destination="${config.entryPoint}">
  <saml:Issuer>${config.issuer}</saml:Issuer>
  <saml:NameID Format="${config.nameIdFormat}">${nameId}</saml:NameID>
  <samlp:SessionIndex>${sessionIndex}</samlp:SessionIndex>
</samlp:LogoutRequest>`;
  }

  /**
   * Parse SAML assertion (simplified)
   * In production, use proper XML parser library like xml2js or fast-xml-parser
   */
  private parseSamlAssertion(xml: string): any {
    // This is a simplified parser for demonstration
    // In production, use proper XML parsing with signature validation
    const emailMatch = xml.match(/emailaddress[">]+([^<]+)</i);
    const nameIdMatch = xml.match(/<saml:NameID[^>]*>([^<]+)</i);
    const sessionIndexMatch = xml.match(/<saml:SessionIndex>([^<]+)</i);
    const firstNameMatch = xml.match(/givenname[">]+([^<]+)</i);
    const lastNameMatch = xml.match(/surname[">]+([^<]+)</i);

    return {
      nameId: nameIdMatch?.[1] || '',
      sessionIndex: sessionIndexMatch?.[1] || crypto.randomBytes(8).toString('hex'),
      attributes: {
        email: emailMatch?.[1] || '',
        firstName: firstNameMatch?.[1] || '',
        lastName: lastNameMatch?.[1] || '',
      },
      organizationId: 'default',
      configId: 'default',
    };
  }

  /**
   * Generate JWT tokens for authenticated user
   */
  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const jwtSecret = this.configService.get<string>('app.jwt.secret');
    const refreshSecret = this.configService.get<string>(
      'app.jwt.refreshSecret',
    );

    if (!jwtSecret || !refreshSecret) {
      throw new UnauthorizedException('Server configuration error');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: refreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Get active SAML sessions for a user
   */
  async getUserSamlSessions(userId: string): Promise<SamlSession[]> {
    return this.samlSessionRepository.find({
      where: { userId, isActive: true },
      order: { lastActivityAt: 'DESC' },
    });
  }

  /**
   * Revoke SAML session
   */
  async revokeSamlSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.samlSessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('SAML session not found');
    }

    session.isActive = false;
    await this.samlSessionRepository.save(session);
    this.logger.log(`Revoked SAML session: ${sessionId}`);
  }
}
