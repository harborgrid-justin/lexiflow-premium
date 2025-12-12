import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as SamlStrategy, Profile } from '@node-saml/passport-saml';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export interface SamlConfig {
  entryPoint: string;
  issuer: string;
  callbackUrl: string;
  cert: string;
  privateKey?: string;
  decryptionPvk?: string;
  signatureAlgorithm?: string;
  identifierFormat?: string;
  wantAssertionsSigned?: boolean;
  wantAuthnResponseSigned?: boolean;
  acceptedClockSkewMs?: number;
}

/**
 * SAML 2.0 Authentication Strategy
 * Implements enterprise SSO using SAML 2.0 protocol
 * OWASP ASVS V2.7 - Out of Band Verifier
 */
@Injectable()
export class SamlAuthStrategy extends PassportStrategy(SamlStrategy, 'saml') {
  private readonly logger = new Logger(SamlAuthStrategy.name);

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      // Identity Provider (IdP) configuration
      entryPoint: configService.get<string>('SAML_ENTRY_POINT'),
      issuer: configService.get<string>('SAML_ISSUER') || 'lexiflow-legal',
      callbackUrl:
        configService.get<string>('SAML_CALLBACK_URL') ||
        'https://app.lexiflow.com/auth/saml/callback',

      // Service Provider (SP) certificate for signing
      cert: configService.get<string>('SAML_IDP_CERT'),
      privateKey: configService.get<string>('SAML_SP_PRIVATE_KEY'),

      // Optional: Decryption private key if assertions are encrypted
      decryptionPvk: configService.get<string>('SAML_DECRYPTION_KEY'),

      // Signature algorithm
      signatureAlgorithm:
        configService.get<string>('SAML_SIGNATURE_ALGORITHM') ||
        'sha256',

      // SAML identifier format
      identifierFormat:
        configService.get<string>('SAML_IDENTIFIER_FORMAT') ||
        'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',

      // Security settings
      wantAssertionsSigned:
        configService.get<string>('SAML_WANT_ASSERTIONS_SIGNED') !== 'false',
      wantAuthnResponseSigned:
        configService.get<string>('SAML_WANT_RESPONSE_SIGNED') !== 'false',

      // Allow for clock skew between IdP and SP
      acceptedClockSkewMs: parseInt(
        configService.get<string>('SAML_CLOCK_SKEW_MS') || '5000',
        10,
      ),

      // Optional: Attribute mappings
      // attributeCallbackUrl: configService.get<string>('SAML_ATTRIBUTE_CALLBACK_URL'),
    });

    this.logger.log('SAML authentication strategy initialized');
  }

  /**
   * Validate SAML assertion and create/update user
   */
  async validate(profile: Profile): Promise<AuthenticatedUser> {
    try {
      this.logger.debug(
        `SAML authentication attempt for: ${profile.nameID}`,
      );

      // Extract user information from SAML assertion
      const email = this.extractEmail(profile);
      const firstName = this.extractFirstName(profile);
      const lastName = this.extractLastName(profile);
      const roles = this.extractRoles(profile);
      const department = this.extractDepartment(profile);
      const organizationId = this.extractOrganizationId(profile);

      if (!email) {
        throw new UnauthorizedException('Email not provided in SAML assertion');
      }

      // Find existing user or create new one (JIT provisioning)
      let user = await this.usersService.findByEmail(email);

      if (!user) {
        // Just-In-Time (JIT) User Provisioning
        this.logger.log(`Creating new user via SAML JIT provisioning: ${email}`);

        user = await this.usersService.create({
          email,
          firstName: firstName || 'Unknown',
          lastName: lastName || 'User',
          password: this.generateRandomPassword(), // Won't be used for SSO
          role: this.determineRole(roles),
          isActive: true,
          mfaEnabled: false,
          isVerified: true, // Trust IdP verification
          metadata: {
            ssoProvider: 'saml',
            ssoProviderId: profile.nameID,
            samlSessionIndex: profile.sessionIndex,
            organizationId,
            department,
            provisionedAt: new Date(),
          },
        });
      } else {
        // Update user information from SAML assertion
        await this.usersService.update(user.id, {
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          department: department || user.department,
          metadata: {
            ...user.metadata,
            lastSamlLogin: new Date(),
            samlSessionIndex: profile.sessionIndex,
          },
        });
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }

      this.logger.log(`SAML authentication successful for: ${email}`);

      return user;
    } catch (error) {
      this.logger.error(
        `SAML authentication failed: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('SAML authentication failed');
    }
  }

  /**
   * Extract email from SAML profile
   */
  private extractEmail(profile: Profile): string | null {
    // Try nameID first (common for email format)
    if (profile.nameID) {
      return profile.nameID;
    }

    // Try attributes
    const attributes = profile as any;

    // Common SAML attribute names for email
    const emailAttributes = [
      'email',
      'mail',
      'emailAddress',
      'Email',
      'Mail',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
      'urn:oid:0.9.2342.19200300.100.1.3', // OID for mail
    ];

    for (const attr of emailAttributes) {
      const value = attributes[attr];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }

    return null;
  }

  /**
   * Extract first name from SAML profile
   */
  private extractFirstName(profile: Profile): string | null {
    const attributes = profile as any;

    const firstNameAttributes = [
      'firstName',
      'givenName',
      'FirstName',
      'GivenName',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
      'urn:oid:2.5.4.42', // OID for givenName
    ];

    for (const attr of firstNameAttributes) {
      const value = attributes[attr];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }

    return null;
  }

  /**
   * Extract last name from SAML profile
   */
  private extractLastName(profile: Profile): string | null {
    const attributes = profile as any;

    const lastNameAttributes = [
      'lastName',
      'surname',
      'sn',
      'LastName',
      'Surname',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
      'urn:oid:2.5.4.4', // OID for surname
    ];

    for (const attr of lastNameAttributes) {
      const value = attributes[attr];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }

    return null;
  }

  /**
   * Extract roles from SAML profile
   */
  private extractRoles(profile: Profile): string[] {
    const attributes = profile as any;

    const roleAttributes = [
      'roles',
      'role',
      'groups',
      'group',
      'memberOf',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      'http://schemas.xmlsoap.org/claims/Group',
    ];

    for (const attr of roleAttributes) {
      const value = attributes[attr];
      if (value) {
        return Array.isArray(value) ? value : [value];
      }
    }

    return [];
  }

  /**
   * Extract department from SAML profile
   */
  private extractDepartment(profile: Profile): string | null {
    const attributes = profile as any;

    const departmentAttributes = [
      'department',
      'Department',
      'organizationalUnit',
      'ou',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/department',
      'urn:oid:2.5.4.11', // OID for ou
    ];

    for (const attr of departmentAttributes) {
      const value = attributes[attr];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }

    return null;
  }

  /**
   * Extract organization ID from SAML profile
   */
  private extractOrganizationId(profile: Profile): string | null {
    const attributes = profile as any;

    const orgAttributes = [
      'organizationId',
      'tenantId',
      'companyId',
      'OrganizationId',
      'TenantId',
    ];

    for (const attr of orgAttributes) {
      const value = attributes[attr];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }

    return null;
  }

  /**
   * Determine user role based on SAML groups/roles
   */
  private determineRole(roles: string[]): string {
    // Map SAML groups to application roles
    const roleMap: Record<string, string> = {
      'LexiFlow-Admins': 'admin',
      'LexiFlow-Partners': 'partner',
      'LexiFlow-Associates': 'associate',
      'LexiFlow-Paralegals': 'paralegal',
      'LexiFlow-Users': 'user',
    };

    // Find first matching role
    for (const role of roles) {
      if (roleMap[role]) {
        return roleMap[role];
      }
    }

    // Default role
    return 'user';
  }

  /**
   * Generate random password for SSO users
   * These passwords won't be used as users authenticate via SSO
   */
  private generateRandomPassword(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Generate SAML metadata XML
   * This can be provided to IdP for configuration
   */
  static generateMetadata(config: SamlConfig): string {
    const entityId = config.issuer;
    const acsUrl = config.callbackUrl;
    const cert = config.cert?.replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\n/g, '');

    return `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
                     entityID="${entityId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"
                      AuthnRequestsSigned="true"
                      WantAssertionsSigned="true">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${cert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:KeyDescriptor use="encryption">
      <ds:KeyInfo>
        <ds:X509Data>
          <ds:X509Certificate>${cert}</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:NameIDFormat>${config.identifierFormat || 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'}</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                Location="${acsUrl}"
                                index="1"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
  }
}
