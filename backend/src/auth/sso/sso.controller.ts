import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Logger,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

/**
 * SSO Controller
 * Handles SAML and OIDC authentication flows
 * OWASP ASVS V2.6 - Look-up Secret Verifier
 */
@Controller('auth/sso')
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * SAML Login - Initiates SAML authentication flow
   */
  @Get('saml/login')
  @UseGuards(AuthGuard('saml'))
  async samlLogin() {
    // Guard redirects to IdP
    this.logger.log('SAML login initiated');
  }

  /**
   * SAML Callback - Handles SAML assertion from IdP
   */
  @Post('saml/callback')
  @UseGuards(AuthGuard('saml'))
  async samlCallback(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('SAML callback received');

      // User is attached to request by SAML strategy
      const user = req.user as any;

      if (!user) {
        this.logger.error('No user found in SAML callback');
        return res.redirect(
          `${this.getFrontendUrl()}/login?error=saml_auth_failed`,
        );
      }

      // Generate JWT tokens
      const tokens = await this.authService.generateTokens(user);

      // Log successful authentication
      this.logger.log(`SAML authentication successful for user: ${user.email}`);

      // Redirect to frontend with tokens
      const redirectUrl = this.buildRedirectUrl(
        tokens.accessToken,
        tokens.refreshToken,
        user,
      );

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(
        `SAML callback error: ${error.message}`,
        error.stack,
      );
      return res.redirect(
        `${this.getFrontendUrl()}/login?error=saml_callback_failed`,
      );
    }
  }

  /**
   * SAML Metadata - Returns SAML SP metadata
   */
  @Get('saml/metadata')
  async samlMetadata(@Res() res: Response) {
    try {
      // In production, generate actual SAML metadata
      const metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${this.configService.get<string>('SAML_ISSUER')}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                Location="${this.configService.get<string>('SAML_CALLBACK_URL')}"
                                index="1"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

      res.type('application/xml');
      return res.send(metadata);
    } catch (error) {
      this.logger.error(`SAML metadata error: ${error.message}`);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to generate SAML metadata',
      });
    }
  }

  /**
   * OIDC Login - Initiates OIDC authentication flow
   */
  @Get('oidc/login')
  @UseGuards(AuthGuard('oidc'))
  async oidcLogin() {
    // Guard redirects to OIDC provider
    this.logger.log('OIDC login initiated');
  }

  /**
   * OIDC Callback - Handles authorization code from OIDC provider
   */
  @Get('oidc/callback')
  @UseGuards(AuthGuard('oidc'))
  async oidcCallback(@Req() req: Request, @Res() res: Response) {
    try {
      this.logger.log('OIDC callback received');

      // User is attached to request by OIDC strategy
      const user = req.user as any;

      if (!user) {
        this.logger.error('No user found in OIDC callback');
        return res.redirect(
          `${this.getFrontendUrl()}/login?error=oidc_auth_failed`,
        );
      }

      // Generate JWT tokens
      const tokens = await this.authService.generateTokens(user);

      // Log successful authentication
      this.logger.log(`OIDC authentication successful for user: ${user.email}`);

      // Redirect to frontend with tokens
      const redirectUrl = this.buildRedirectUrl(
        tokens.accessToken,
        tokens.refreshToken,
        user,
      );

      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(
        `OIDC callback error: ${error.message}`,
        error.stack,
      );
      return res.redirect(
        `${this.getFrontendUrl()}/login?error=oidc_callback_failed`,
      );
    }
  }

  /**
   * OIDC Logout - Handles OIDC logout
   */
  @Post('oidc/logout')
  async oidcLogout(
    @Req() req: Request,
    @Res() res: Response,
    @Query('id_token') idToken?: string,
  ) {
    try {
      // In production, use OIDC strategy to get end session URL
      const postLogoutRedirectUri = this.getFrontendUrl();

      // Construct logout URL (example for generic OIDC provider)
      const logoutUrl = `${this.configService.get<string>('OIDC_ISSUER')}/logout?` +
        `id_token_hint=${idToken}&` +
        `post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

      return res.redirect(logoutUrl);
    } catch (error) {
      this.logger.error(`OIDC logout error: ${error.message}`);
      return res.redirect(this.getFrontendUrl());
    }
  }

  /**
   * SSO Providers - Returns list of configured SSO providers
   */
  @Get('providers')
  async getSsoProviders() {
    const providers = [];

    // Check if SAML is configured
    if (this.configService.get<string>('SAML_ENTRY_POINT')) {
      providers.push({
        id: 'saml',
        name: 'Enterprise SAML',
        type: 'saml',
        loginUrl: '/auth/sso/saml/login',
        enabled: true,
      });
    }

    // Check if OIDC is configured
    if (this.configService.get<string>('OIDC_ISSUER')) {
      providers.push({
        id: 'oidc',
        name: this.configService.get<string>('OIDC_PROVIDER_NAME') || 'OpenID Connect',
        type: 'oidc',
        loginUrl: '/auth/sso/oidc/login',
        enabled: true,
      });
    }

    // Check for specific providers
    if (this.configService.get<string>('GOOGLE_CLIENT_ID')) {
      providers.push({
        id: 'google',
        name: 'Google',
        type: 'oidc',
        loginUrl: '/auth/sso/google/login',
        enabled: true,
        icon: 'google',
      });
    }

    if (this.configService.get<string>('MICROSOFT_CLIENT_ID')) {
      providers.push({
        id: 'microsoft',
        name: 'Microsoft',
        type: 'oidc',
        loginUrl: '/auth/sso/microsoft/login',
        enabled: true,
        icon: 'microsoft',
      });
    }

    return {
      providers,
      count: providers.length,
    };
  }

  /**
   * SSO Status - Check SSO configuration status
   */
  @Get('status')
  async getSsoStatus() {
    return {
      saml: {
        enabled: !!this.configService.get<string>('SAML_ENTRY_POINT'),
        configured: !!(
          this.configService.get<string>('SAML_ENTRY_POINT') &&
          this.configService.get<string>('SAML_IDP_CERT')
        ),
      },
      oidc: {
        enabled: !!this.configService.get<string>('OIDC_ISSUER'),
        configured: !!(
          this.configService.get<string>('OIDC_ISSUER') &&
          this.configService.get<string>('OIDC_CLIENT_ID') &&
          this.configService.get<string>('OIDC_CLIENT_SECRET')
        ),
      },
      providers: {
        google: !!this.configService.get<string>('GOOGLE_CLIENT_ID'),
        microsoft: !!this.configService.get<string>('MICROSOFT_CLIENT_ID'),
        okta: !!this.configService.get<string>('OKTA_DOMAIN'),
        auth0: !!this.configService.get<string>('AUTH0_DOMAIN'),
      },
    };
  }

  /**
   * Build redirect URL with tokens
   */
  private buildRedirectUrl(
    accessToken: string,
    refreshToken: string,
    user: any,
  ): string {
    const frontendUrl = this.getFrontendUrl();
    const params = new URLSearchParams({
      access_token: accessToken,
      refresh_token: refreshToken,
      user_id: user.id,
      email: user.email,
    });

    return `${frontendUrl}/auth/callback?${params.toString()}`;
  }

  /**
   * Get frontend URL from configuration
   */
  private getFrontendUrl(): string {
    return (
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:3000'
    );
  }
}

/**
 * Google SSO Controller
 * Specific implementation for Google OAuth
 */
@Controller('auth/sso/google')
export class GoogleSsoController {
  private readonly logger = new Logger(GoogleSsoController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('login')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {
    this.logger.log('Google login initiated');
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect('/login?error=google_auth_failed');
      }

      const tokens = await this.authService.generateTokens(user);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      return res.redirect(
        `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
      );
    } catch (error) {
      this.logger.error(`Google callback error: ${error.message}`);
      return res.redirect('/login?error=google_callback_failed');
    }
  }
}

/**
 * Microsoft SSO Controller
 * Specific implementation for Microsoft Azure AD
 */
@Controller('auth/sso/microsoft')
export class MicrosoftSsoController {
  private readonly logger = new Logger(MicrosoftSsoController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('login')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftLogin() {
    this.logger.log('Microsoft login initiated');
  }

  @Get('callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;
      if (!user) {
        return res.redirect('/login?error=microsoft_auth_failed');
      }

      const tokens = await this.authService.generateTokens(user);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';

      return res.redirect(
        `${frontendUrl}/auth/callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`,
      );
    } catch (error) {
      this.logger.error(`Microsoft callback error: ${error.message}`);
      return res.redirect('/login?error=microsoft_callback_failed');
    }
  }
}
