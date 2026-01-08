import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as SamlStrategy } from 'passport-saml';
import { ConfigService } from '@nestjs/config';
import { SamlService } from './saml.service';

/**
 * SAML Passport Strategy
 * Integrates SAML 2.0 authentication with NestJS Passport
 *
 * Note: This requires 'passport-saml' package to be installed:
 * npm install passport-saml @types/passport-saml
 */
@Injectable()
export class SamlAuthStrategy extends PassportStrategy(SamlStrategy, 'saml') {
  constructor(
    private configService: ConfigService,
    private samlService: SamlService,
  ) {
    super({
      // Default configuration - will be overridden per-organization
      callbackUrl: configService.get('SAML_CALLBACK_URL') || 'http://localhost:3000/api/auth/saml/callback',
      entryPoint: configService.get('SAML_ENTRY_POINT') || '',
      issuer: configService.get('SAML_ISSUER') || 'lexiflow-premium',
      cert: configService.get('SAML_CERT') || '',
      passReqToCallback: true,
      decryptionPvk: configService.get('SAML_PRIVATE_KEY'),
      signatureAlgorithm: 'sha256',
      // Allow dynamic configuration per request
      additionalParams: {},
    });
  }

  /**
   * Validate SAML assertion and return user profile
   * This method is called by Passport after successful SAML authentication
   */
  async validate(
    req: any,
    profile: any,
    done: (error: any, user?: any) => void,
  ): Promise<any> {
    try {
      if (!profile) {
        throw new UnauthorizedException('No profile returned from SAML provider');
      }

      // Extract user information from SAML profile
      const email = profile.email || profile.nameID;

      if (!email) {
        throw new UnauthorizedException('Email not found in SAML assertion');
      }

      // The actual user validation and token generation is handled by SamlService
      // This method just validates the SAML assertion structure
      const user = {
        email,
        firstName: profile.givenName || profile.firstName,
        lastName: profile.surname || profile.lastName,
        displayName: profile.displayName,
        nameID: profile.nameID,
        sessionIndex: profile.sessionIndex,
        attributes: profile,
      };

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
}
