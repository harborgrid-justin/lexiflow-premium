# Enterprise Authentication & SSO Implementation

## Overview
This document describes the enterprise-grade authentication features implemented for LexiFlow Legal SaaS, including SAML 2.0 SSO, enhanced MFA, and advanced session management.

## Implementation Summary

### 1. SAML 2.0 SSO Module (`backend/src/auth/sso/`)

#### Files Created:
- **`saml.strategy.ts`** - Passport SAML strategy for authentication
- **`saml.controller.ts`** - REST API endpoints for SSO
- **`saml.service.ts`** - SAML business logic and session management
- **`saml.module.ts`** - NestJS module configuration
- **`entities/saml-config.entity.ts`** - SAML configuration storage
- **`entities/saml-session.entity.ts`** - SAML session tracking
- **`dto/saml-login.dto.ts`** - Data transfer objects

#### Features:
- SP-initiated SAML authentication flow
- Multi-tenant SAML configuration
- JIT (Just-In-Time) user provisioning
- SAML metadata generation
- Single Logout (SLO) support
- Session management and tracking
- Custom attribute mapping

#### API Endpoints:
```
GET    /api/auth/saml/login/:organizationId     - Initiate SSO login
POST   /api/auth/saml/callback                  - Handle IdP response
GET    /api/auth/saml/metadata/:organizationId  - Get SP metadata
POST   /api/auth/saml/logout                    - Initiate SAML logout
POST   /api/auth/saml/logout/callback           - Handle logout response
POST   /api/auth/saml/config                    - Create SAML config (Admin)
GET    /api/auth/saml/config/:organizationId    - Get SAML config
POST   /api/auth/saml/config/:organizationId    - Update SAML config
POST   /api/auth/saml/config/:organizationId/delete - Delete config
GET    /api/auth/saml/sessions                  - Get active SAML sessions
POST   /api/auth/saml/sessions/:id/revoke       - Revoke SAML session
```

#### Database Tables:
- `saml_configs` - Stores SAML configuration per organization
- `saml_sessions` - Tracks active SAML authentication sessions

---

### 2. Enhanced MFA Module (`backend/src/auth/mfa/`)

#### Files Created:
- **`mfa.service.ts`** - Multi-factor authentication service
- **`mfa.controller.ts`** - MFA API endpoints
- **`mfa.module.ts`** - NestJS module configuration
- **`entities/webauthn-credential.entity.ts`** - WebAuthn/FIDO2 credentials
- **`entities/mfa-backup-code.entity.ts`** - Backup recovery codes
- **`entities/mfa-sms-verification.entity.ts`** - SMS verification data
- **`dto/mfa.dto.ts`** - MFA data transfer objects

#### Features:

##### WebAuthn/FIDO2 Support
- Hardware security key registration (YubiKey, etc.)
- Platform authenticators (Touch ID, Windows Hello, Face ID)
- Credential management (register, verify, revoke)
- Device metadata tracking

##### SMS Verification
- Phone number registration and verification
- 6-digit SMS code generation
- Rate limiting and attempt tracking
- Integration-ready for Twilio/AWS SNS

##### TOTP (Time-based One-Time Password)
- QR code generation
- Authenticator app support (Google Authenticator, Authy)
- Secret management

##### Backup Codes
- One-time use recovery codes
- 10 codes per set by default
- Secure hashing and storage
- Regeneration capability

#### API Endpoints:
```
GET    /api/auth/mfa/methods                       - Get available MFA methods
POST   /api/auth/mfa/webauthn/register/start       - Start WebAuthn registration
POST   /api/auth/mfa/webauthn/register/complete    - Complete WebAuthn registration
POST   /api/auth/mfa/webauthn/verify               - Verify WebAuthn authentication
GET    /api/auth/mfa/webauthn/credentials          - List registered keys
DELETE /api/auth/mfa/webauthn/credentials/:id     - Delete security key
POST   /api/auth/mfa/sms/setup                     - Setup SMS MFA
POST   /api/auth/mfa/sms/verify                    - Verify SMS code
POST   /api/auth/mfa/sms/send                      - Send SMS code
POST   /api/auth/mfa/backup-codes/generate         - Generate backup codes
POST   /api/auth/mfa/backup-codes/verify           - Verify backup code
GET    /api/auth/mfa/backup-codes/count            - Get remaining codes
```

#### Database Tables:
- `webauthn_credentials` - Stores WebAuthn public keys and metadata
- `mfa_backup_codes` - Stores hashed backup codes
- `mfa_sms_verifications` - Stores SMS verification requests

---

### 3. Enterprise Session Management

#### Files Created:
- **`services/device.fingerprint.service.ts`** - Device fingerprinting
- **`services/enterprise.session.service.ts`** - Advanced session management

#### Features:

##### Device Fingerprinting
- Unique device identification
- User agent parsing (browser, OS, device type)
- IP geolocation (country, city)
- Suspicious pattern detection
- Risk score calculation

##### Session Management
- Concurrent session limiting (configurable max)
- Session tracking across devices
- Last activity timestamps
- Device trust management
- Force logout capabilities
- Anomaly detection

##### Security Features
- Risk-based authentication
- Location change detection
- VPN/proxy detection
- Session hijacking prevention
- Automatic old session cleanup

#### Enhanced API Endpoints:
```
GET    /api/auth/sessions              - Get active sessions
GET    /api/auth/sessions/stats        - Get session statistics
DELETE /api/auth/sessions/:id          - Revoke specific session
DELETE /api/auth/sessions              - Revoke all other sessions
POST   /api/auth/sessions/trust-device - Mark device as trusted
```

---

### 4. Frontend Components (`frontend/src/features/enterprise-auth/`)

#### Files Created:

##### `SSOLoginButton.tsx`
- SAML SSO login button component
- Organization ID input
- Redirect to IdP
- Full login card UI variant

**Usage:**
```tsx
import { SSOLoginButton, SSOLoginCard } from '@features/enterprise-auth';

<SSOLoginButton
  organizationId="acme-corp"
  onLogin={(result) => console.log(result)}
  onError={(error) => console.error(error)}
/>

<SSOLoginCard
  title="Enterprise Sign-In"
  description="Sign in with your organization"
  organizationId="acme-corp"
/>
```

##### `MFASetupWizard.tsx`
- Multi-step MFA setup wizard
- TOTP QR code display
- SMS verification flow
- WebAuthn registration
- Backup code generation and download

**Usage:**
```tsx
import { MFASetupWizard } from '@features/enterprise-auth';

<MFASetupWizard
  availableMethods={['totp', 'webauthn', 'sms', 'backup']}
  onComplete={() => console.log('Setup complete')}
  onCancel={() => console.log('Setup cancelled')}
/>
```

##### `SessionManager.tsx`
- Display active sessions
- Device information display
- Location and IP tracking
- Risk score visualization
- Revoke individual/all sessions
- Session statistics

**Usage:**
```tsx
import { SessionManager } from '@features/enterprise-auth';

<SessionManager
  apiBaseUrl="/api"
  onSessionRevoked={(id) => console.log('Revoked:', id)}
  onError={(error) => console.error(error)}
/>
```

##### `DeviceTrustPanel.tsx`
- Device trust management
- Trust policy configuration
- Device list with fingerprints
- Risk assessment display
- Trust/untrust actions

**Usage:**
```tsx
import { DeviceTrustPanel } from '@features/enterprise-auth';

<DeviceTrustPanel
  apiBaseUrl="/api"
  onTrustChanged={(deviceId, trusted) => console.log(deviceId, trusted)}
  onError={(error) => console.error(error)}
/>
```

---

## Database Schema

### New Tables Required

```sql
-- SAML Configuration
CREATE TABLE saml_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE,
  entity_id VARCHAR(500) NOT NULL,
  entry_point VARCHAR(500) NOT NULL,
  callback_url VARCHAR(500) NOT NULL,
  issuer VARCHAR(500) NOT NULL,
  certificate TEXT NOT NULL,
  private_key TEXT,
  signature_algorithm VARCHAR(50) DEFAULT 'sha256',
  name_id_format VARCHAR(200) DEFAULT 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  want_assertions_signed BOOLEAN DEFAULT true,
  want_response_signed BOOLEAN DEFAULT true,
  authn_context TEXT[] DEFAULT '{}',
  force_authn BOOLEAN DEFAULT false,
  passive BOOLEAN DEFAULT false,
  provider_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  attribute_mapping JSONB,
  jit_provisioning_enabled BOOLEAN DEFAULT false,
  default_role VARCHAR(50),
  allowed_domains TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SAML Sessions
CREATE TABLE saml_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  name_id VARCHAR(500) NOT NULL UNIQUE,
  session_index VARCHAR(500) NOT NULL,
  saml_config_id UUID NOT NULL,
  attributes JSONB,
  assertion TEXT,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  ip_address VARCHAR(100) NOT NULL,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WebAuthn Credentials
CREATE TABLE webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_type VARCHAR(50) NOT NULL,
  transports TEXT[] DEFAULT '{}',
  aaguid VARCHAR(100),
  friendly_name VARCHAR(100) NOT NULL,
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  backup_eligible BOOLEAN DEFAULT false,
  backup_state BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MFA Backup Codes
CREATE TABLE mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code_hash VARCHAR(255) NOT NULL UNIQUE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  used_from_ip VARCHAR(100),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- MFA SMS Verifications
CREATE TABLE mfa_sms_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  phone_number_verified BOOLEAN DEFAULT false,
  code_hash VARCHAR(255) NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  sent_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saml_configs_org ON saml_configs(organization_id);
CREATE INDEX idx_saml_sessions_user ON saml_sessions(user_id);
CREATE INDEX idx_saml_sessions_name_id ON saml_sessions(name_id);
CREATE INDEX idx_saml_sessions_index ON saml_sessions(session_index);
CREATE INDEX idx_webauthn_user ON webauthn_credentials(user_id);
CREATE INDEX idx_webauthn_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX idx_backup_codes_user ON mfa_backup_codes(user_id);
CREATE INDEX idx_backup_codes_hash ON mfa_backup_codes(code_hash);
CREATE INDEX idx_sms_verifications_user ON mfa_sms_verifications(user_id);
CREATE INDEX idx_sms_verifications_phone ON mfa_sms_verifications(phone_number);
```

---

## Configuration

### Environment Variables

```bash
# SAML Configuration
SAML_CALLBACK_URL=http://localhost:3000/api/auth/saml/callback
SAML_ISSUER=lexiflow-premium
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_NAME=LexiFlow Premium

# Session Management
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT=86400000  # 24 hours in ms

# MFA Settings
MFA_TOKEN_TTL_MINUTES=5
BACKUP_CODE_COUNT=10

# SMS Provider (Twilio/AWS SNS)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Integration Guide

### 1. Setting Up SAML SSO

#### Step 1: Create SAML Configuration
```typescript
POST /api/auth/saml/config
{
  "organizationId": "acme-corp",
  "entityId": "https://idp.acme.com/saml",
  "entryPoint": "https://idp.acme.com/sso",
  "callbackUrl": "https://lexiflow.com/api/auth/saml/callback",
  "issuer": "lexiflow-premium",
  "certificate": "-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----",
  "providerName": "Okta",
  "jitProvisioningEnabled": true,
  "defaultRole": "staff"
}
```

#### Step 2: Configure IdP
1. Download SP metadata: `GET /api/auth/saml/metadata/:organizationId`
2. Upload to your IdP (Okta, Azure AD, Google Workspace, etc.)
3. Configure attribute mappings

#### Step 3: Test SSO Flow
1. Navigate to: `GET /api/auth/saml/login/acme-corp`
2. Authenticate with IdP
3. Receive JWT tokens at callback

### 2. Enabling MFA

#### Step 1: Setup TOTP
```typescript
POST /api/auth/enable-mfa
// Returns QR code and secret
{
  "qrCode": "data:image/png;base64,...",
  "secret": "JBSWY3DPEHPK3PXP"
}
```

#### Step 2: Enable WebAuthn
```typescript
POST /api/auth/mfa/webauthn/register/start
{
  "friendlyName": "YubiKey 5C"
}
// Returns challenge for WebAuthn API
```

#### Step 3: Setup SMS
```typescript
POST /api/auth/mfa/sms/setup
{
  "phoneNumber": "+14155552671"
}
// Sends verification code
```

#### Step 4: Generate Backup Codes
```typescript
POST /api/auth/mfa/backup-codes/generate
{
  "count": 10
}
// Returns array of backup codes
```

### 3. Session Management

#### Monitor Active Sessions
```typescript
GET /api/auth/sessions
// Returns list of active sessions with device info

GET /api/auth/sessions/stats
// Returns session statistics
```

#### Force Logout
```typescript
DELETE /api/auth/sessions/:sessionId  // Logout specific session
DELETE /api/auth/sessions             // Logout all other sessions
```

#### Trust Device
```typescript
POST /api/auth/sessions/trust-device
{
  "sessionId": "session-id-here"
}
```

---

## Security Considerations

### SAML
- Always validate SAML assertions
- Verify signatures on responses
- Use HTTPS for all endpoints
- Store certificates securely
- Implement logout (SLO) properly
- Validate issuer and audience

### MFA
- Hash backup codes with bcrypt
- Rate limit verification attempts
- Expire unused codes
- Secure WebAuthn credential storage
- Use proper SMS provider with delivery tracking

### Sessions
- Implement concurrent session limits
- Track device fingerprints
- Monitor for anomalous activity
- Force re-authentication on high-risk activities
- Clean up expired sessions regularly

---

## Testing

### SAML Testing Tools
- SAMLTest.id - Test IdP
- SAML-tracer browser extension
- Postman for API testing

### MFA Testing
- Use authenticator apps in dev
- Test backup code flow
- Verify WebAuthn with security keys
- Test SMS with Twilio test numbers

### Session Testing
- Test concurrent session limits
- Verify device fingerprinting
- Test force logout scenarios
- Validate trust management

---

## Dependencies

### Backend
```json
{
  "passport-saml": "^3.2.4",
  "@types/passport-saml": "^1.1.3",
  "otplib": "^12.0.1",
  "qrcode": "^1.5.4",
  "ua-parser-js": "^1.0.38",
  "bcrypt": "^6.0.0"
}
```

### Frontend
```json
{
  "lucide-react": "^0.292.0",
  "@simplewebauthn/browser": "^8.0.0"
}
```

Note: Install missing packages with:
```bash
npm install passport-saml @types/passport-saml
npm install @simplewebauthn/browser @simplewebauthn/server
```

---

## Monitoring & Maintenance

### Key Metrics to Track
- SSO authentication success/failure rate
- MFA enrollment rate
- Concurrent sessions per user
- High-risk session count
- Device trust ratio

### Regular Maintenance
- Rotate SAML certificates annually
- Clean up expired sessions daily
- Review and revoke unused MFA methods
- Audit suspicious session activity
- Update security policies quarterly

---

## Support & Troubleshooting

### Common Issues

**SAML Login Fails**
- Check certificate validity
- Verify callback URL configuration
- Review IdP logs
- Check attribute mappings

**MFA Not Working**
- Verify time sync for TOTP
- Check SMS provider configuration
- Validate WebAuthn browser support
- Test backup codes

**Session Issues**
- Check concurrent session limits
- Verify JWT token expiration
- Review device fingerprint logic
- Check IP geolocation service

---

## Future Enhancements

1. **OIDC (OpenID Connect) Support** - Add OAuth 2.0/OIDC alongside SAML
2. **Risk-Based Authentication** - Dynamic MFA requirements based on risk
3. **Biometric Authentication** - Enhanced WebAuthn with biometrics
4. **Passwordless Login** - Magic links and WebAuthn-only auth
5. **Federation** - Cross-organization SSO
6. **Advanced Analytics** - ML-based anomaly detection
7. **Mobile SDK** - Native mobile app authentication
8. **Hardware Token Support** - RSA SecurID, OATH tokens

---

## Conclusion

This implementation provides enterprise-grade authentication with:
- ✅ SAML 2.0 SSO with JIT provisioning
- ✅ Multi-factor authentication (TOTP, WebAuthn, SMS, Backup Codes)
- ✅ Advanced session management with device fingerprinting
- ✅ Production-ready frontend components
- ✅ Comprehensive security controls
- ✅ Scalable architecture

The system is ready for production deployment with proper configuration and security hardening.
