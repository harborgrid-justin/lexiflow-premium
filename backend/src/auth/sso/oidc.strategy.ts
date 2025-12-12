import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Client, Issuer, UserinfoResponse, TokenSet } from 'openid-client';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export interface OidcConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  scope: string;
  responseType: string;
  responseMode?: string;
  usePKCE?: boolean;
}

/**
 * OpenID Connect (OIDC) Authentication Strategy
 * Implements enterprise SSO using OpenID Connect protocol
 * OWASP ASVS V2.8 - Single or Multi Factor One Time Verifier
 */
@Injectable()
export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  private readonly logger = new Logger(OidcStrategy.name);
  private client: Client;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      client: null, // Will be set in initialize()
      params: {
        scope:
          configService.get<string>('OIDC_SCOPE') ||
          'openid profile email',
        response_type:
          configService.get<string>('OIDC_RESPONSE_TYPE') || 'code',
        response_mode:
          configService.get<string>('OIDC_RESPONSE_MODE') || 'form_post',
      },
      passReqToCallback: false,
      usePKCE:
        configService.get<string>('OIDC_USE_PKCE') === 'true',
    } as any);

    // Initialize OIDC client
    this.initialize().catch((error) => {
      this.logger.error(`Failed to initialize OIDC client: ${error.message}`);
    });
  }

  /**
   * Initialize OIDC client by discovering issuer configuration
   */
  private async initialize(): Promise<void> {
    try {
      const issuerUrl = this.configService.get<string>('OIDC_ISSUER');
      const clientId = this.configService.get<string>('OIDC_CLIENT_ID');
      const clientSecret = this.configService.get<string>('OIDC_CLIENT_SECRET');
      const callbackUrl =
        this.configService.get<string>('OIDC_CALLBACK_URL') ||
        'https://app.lexiflow.com/auth/oidc/callback';

      if (!issuerUrl || !clientId || !clientSecret) {
        this.logger.warn('OIDC configuration incomplete, SSO will be disabled');
        return;
      }

      // Discover OIDC provider configuration
      const issuer = await Issuer.discover(issuerUrl);
      this.logger.log(
        `Discovered OIDC issuer: ${issuer.metadata.issuer}`,
      );

      // Create OIDC client
      this.client = new issuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [callbackUrl],
        response_types: [
          this.configService.get<string>('OIDC_RESPONSE_TYPE') || 'code',
        ],
        token_endpoint_auth_method: 'client_secret_post',
      });

      this.logger.log('OIDC client initialized successfully');
    } catch (error) {
      this.logger.error(
        `Failed to initialize OIDC: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Validate OIDC tokens and create/update user
   */
  async validate(tokenSet: TokenSet): Promise<AuthenticatedUser> {
    try {
      this.logger.debug('OIDC token validation started');

      if (!this.client) {
        throw new UnauthorizedException('OIDC client not initialized');
      }

      // Verify ID token
      const claims = tokenSet.claims();
      this.logger.debug(
        `OIDC claims received for subject: ${claims.sub}`,
      );

      // Get user info from UserInfo endpoint
      const userinfo = await this.client.userinfo(tokenSet.access_token!);

      // Extract user information
      const email = this.extractEmail(claims, userinfo);
      const firstName = this.extractFirstName(claims, userinfo);
      const lastName = this.extractLastName(claims, userinfo);
      const roles = this.extractRoles(claims, userinfo);
      const department = this.extractDepartment(claims, userinfo);
      const picture = this.extractPicture(claims, userinfo);

      if (!email) {
        throw new UnauthorizedException('Email not provided in OIDC claims');
      }

      // Find existing user or create new one (JIT provisioning)
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Just-In-Time (JIT) User Provisioning
        this.logger.log(`Creating new user via OIDC JIT provisioning: ${email}`);

        user = await this.usersService.create({
          email,
          firstName: firstName || 'Unknown',
          lastName: lastName || 'User',
          password: this.generateRandomPassword(), // Won't be used for SSO
          role: this.determineRole(roles),
          isActive: true,
          mfaEnabled: false,
          isVerified: true, // Trust OIDC provider verification
          avatarUrl: picture || undefined,
          metadata: {
            ssoProvider: 'oidc',
            ssoProviderId: claims.sub,
            oidcIssuer: claims.iss,
            department,
            provisionedAt: new Date(),
          },
        });
      } else {
        // Update user information from OIDC claims
        await this.usersService.update(user.id, {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          department: department || user.department,
          avatarUrl: picture || user.avatarUrl,
          metadata: {
            ...user.metadata,
            lastOidcLogin: new Date(),
            oidcIssuer: claims.iss,
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }

      this.logger.log(`OIDC authentication successful for: ${email}`);

      return user;
    } catch (error) {
      this.logger.error(
        `OIDC authentication failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('OIDC authentication failed');
    }
  }

  /**
   * Extract email from OIDC claims
   */
  private extractEmail(
    claims: any,
    userinfo: UserinfoResponse,
  ): string | null {
    return (
      claims.email ||
      userinfo.email ||
      claims.preferred_username ||
      userinfo.preferred_username ||
      null
    );
  }

  /**
   * Extract first name from OIDC claims
   */
  private extractFirstName(
    claims: any,
    userinfo: UserinfoResponse,
  ): string | null {
    return (
      claims.given_name ||
      userinfo.given_name ||
      claims.name?.split(' ')[0] ||
      userinfo.name?.split(' ')[0] ||
      null
    );
  }

  /**
   * Extract last name from OIDC claims
   */
  private extractLastName(
    claims: any,
    userinfo: UserinfoResponse,
  ): string | null {
    return (
      claims.family_name ||
      userinfo.family_name ||
      claims.name?.split(' ').slice(1).join(' ') ||
      userinfo.name?.split(' ').slice(1).join(' ') ||
      null
    );
  }

  /**
   * Extract roles from OIDC claims
   */
  private extractRoles(
    claims: any,
    userinfo: UserinfoResponse,
  ): string[] {
    const roles =
      claims.roles ||
      userinfo.roles ||
      claims.groups ||
      userinfo.groups ||
      claims['cognito:groups'] || // AWS Cognito
      claims['https://lexiflow.com/roles'] || // Custom claim
      [];

    return Array.isArray(roles) ? roles : [roles];
  }

  /**
   * Extract department from OIDC claims
   */
  private extractDepartment(
    claims: any,
    userinfo: UserinfoResponse,
  ): string | null {
    return (
      claims.department ||
      userinfo.department ||
      claims.organization ||
      userinfo.organization ||
      claims['https://lexiflow.com/department'] ||
      null
    );
  }

  /**
   * Extract picture URL from OIDC claims
   */
  private extractPicture(
    claims: any,
    userinfo: UserinfoResponse,
  ): string | null {
    return claims.picture || userinfo.picture || null;
  }

  /**
   * Determine user role based on OIDC groups/roles
   */
  private determineRole(roles: string[]): string {
    // Map OIDC groups to application roles
    const roleMap: Record<string, string> = {
      'lexiflow-admins': 'admin',
      'lexiflow-partners': 'partner',
      'lexiflow-associates': 'associate',
      'lexiflow-paralegals': 'paralegal',
      'lexiflow-users': 'user',
      // AWS Cognito default groups
      'Admins': 'admin',
      'Partners': 'partner',
      'Associates': 'associate',
      // Azure AD default roles
      'Application.Admin': 'admin',
      'Application.User': 'user',
    };

    // Find first matching role (case-insensitive)
    for (const role of roles) {
      const normalizedRole = role.toLowerCase();
      if (roleMap[normalizedRole]) {
        return roleMap[normalizedRole];
      }
    }

    // Default role
    return 'user';
  }

  /**
   * Generate random password for SSO users
   */
  private generateRandomPassword(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Get OIDC client instance
   */
  getClient(): Client {
    return this.client;
  }

  /**
   * Generate authorization URL
   */
  getAuthorizationUrl(state?: string, nonce?: string): string {
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    const params: any = {
      scope:
        this.configService.get<string>('OIDC_SCOPE') ||
        'openid profile email',
      response_type:
        this.configService.get<string>('OIDC_RESPONSE_TYPE') || 'code',
    };

    if (state) {
      params.state = state;
    }

    if (nonce) {
      params.nonce = nonce;
    }

    // Add PKCE if enabled
    if (this.configService.get<string>('OIDC_USE_PKCE') === 'true') {
      // PKCE will be handled by openid-client automatically
      params.code_challenge_method = 'S256';
    }

    return this.client.authorizationUrl(params);
  }

  /**
   * Handle callback and exchange code for tokens
   */
  async handleCallback(
    callbackParams: any,
    checks?: { state?: string; nonce?: string },
  ): Promise<TokenSet> {
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    const callbackUrl =
      this.configService.get<string>('OIDC_CALLBACK_URL') ||
      'https://app.lexiflow.com/auth/oidc/callback';

    return await this.client.callback(callbackUrl, callbackParams, checks);
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenSet> {
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    return await this.client.refresh(refreshToken);
  }

  /**
   * Revoke tokens (logout)
   */
  async revokeToken(token: string, tokenTypeHint?: string): Promise<void> {
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    await this.client.revoke(token, tokenTypeHint);
  }

  /**
   * Get end session URL for logout
   */
  getEndSessionUrl(idToken: string, postLogoutRedirectUri?: string): string {
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    const redirectUri =
      postLogoutRedirectUri ||
      this.configService.get<string>('OIDC_POST_LOGOUT_REDIRECT_URI') ||
      'https://app.lexiflow.com';

    return this.client.endSessionUrl({
      id_token_hint: idToken,
      post_logout_redirect_uri: redirectUri,
    });
  }

  /**
   * Introspect token to check validity
   */
  async introspectToken(token: string): Promise<any> {
    if (!this.client) {
      throw new Error('OIDC client not initialized');
    }

    return await this.client.introspect(token);
  }
}

/**
 * OIDC Provider Configuration
 * Helper class for managing multiple OIDC providers
 */
export class OidcProviderConfig {
  constructor(
    public name: string,
    public issuer: string,
    public clientId: string,
    public clientSecret: string,
    public callbackUrl: string,
    public scope: string = 'openid profile email',
  ) {}

  /**
   * Common provider configurations
   */
  static readonly PROVIDERS = {
    GOOGLE: {
      name: 'Google',
      issuer: 'https://accounts.google.com',
      scope: 'openid profile email',
    },
    MICROSOFT: {
      name: 'Microsoft',
      issuer: 'https://login.microsoftonline.com/common/v2.0',
      scope: 'openid profile email',
    },
    OKTA: {
      name: 'Okta',
      // issuer: 'https://{your-okta-domain}.okta.com',
      scope: 'openid profile email groups',
    },
    AUTH0: {
      name: 'Auth0',
      // issuer: 'https://{your-tenant}.auth0.com',
      scope: 'openid profile email',
    },
    AWS_COGNITO: {
      name: 'AWS Cognito',
      // issuer: 'https://cognito-idp.{region}.amazonaws.com/{userPoolId}',
      scope: 'openid profile email aws.cognito.signin.user.admin',
    },
    AZURE_AD: {
      name: 'Azure AD',
      // issuer: 'https://login.microsoftonline.com/{tenant-id}/v2.0',
      scope: 'openid profile email',
    },
  };
}
