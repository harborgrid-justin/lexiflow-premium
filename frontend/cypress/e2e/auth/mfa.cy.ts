/// <reference types="cypress" />

/**
 * Multi-Factor Authentication (MFA) E2E Tests
 *
 * Comprehensive MFA tests covering:
 * - MFA setup and enrollment flow
 * - MFA verification with TOTP codes
 * - Backup codes generation and usage
 * - Trusted device management
 * - MFA bypass for remembered devices
 */

describe('Authentication - Multi-Factor Authentication', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
  });

  describe('MFA Setup Flow', () => {
    beforeEach(() => {
      // Login as a user without MFA enabled
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
        win.localStorage.setItem('mfa_enabled', 'false');
      });

      cy.visit('/settings/security');
    });

    it('should initiate MFA setup and display QR code', () => {
      cy.intercept('POST', '/api/auth/mfa/setup', {
        statusCode: 200,
        body: {
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          secret: 'JBSWY3DPEHPK3PXP',
          backupCodes: [
            '123456-789012',
            '234567-890123',
            '345678-901234',
            '456789-012345',
            '567890-123456',
          ],
        },
      }).as('mfaSetup');

      cy.get('[data-testid="enable-mfa-button"]')
        .should('be.visible')
        .click();

      cy.wait('@mfaSetup');

      // Verify MFA setup modal opens
      cy.get('[data-testid="mfa-setup-modal"]').should('be.visible');

      // Verify QR code is displayed
      cy.get('[data-testid="mfa-qr-code"]')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'data:image');

      // Verify secret key is displayed for manual entry
      cy.get('[data-testid="mfa-secret-key"]')
        .should('be.visible')
        .and('contain', 'JBSWY3DPEHPK3PXP');

      // Verify instructions are shown
      cy.get('[data-testid="mfa-setup-instructions"]')
        .should('be.visible')
        .and('contain', 'authenticator app');
    });

    it('should verify MFA setup with valid TOTP code', () => {
      cy.intercept('POST', '/api/auth/mfa/setup', {
        statusCode: 200,
        body: {
          qrCode: 'data:image/png;base64,mock',
          secret: 'TESTSECRET123',
          backupCodes: ['111111-111111', '222222-222222'],
        },
      }).as('mfaSetup');

      cy.intercept('POST', '/api/auth/mfa/verify-setup', {
        statusCode: 200,
        body: {
          success: true,
          message: 'MFA enabled successfully',
          backupCodes: ['111111-111111', '222222-222222'],
        },
      }).as('verifySetup');

      cy.get('[data-testid="enable-mfa-button"]').click();
      cy.wait('@mfaSetup');

      // Enter verification code
      cy.get('[data-testid="mfa-verification-code-input"]')
        .should('be.visible')
        .type('123456');

      cy.get('[data-testid="verify-mfa-button"]')
        .should('be.visible')
        .click();

      cy.wait('@verifySetup').then((interception) => {
        expect(interception.request.body).to.deep.include({
          code: '123456',
          secret: 'TESTSECRET123',
        });
      });

      // Verify success message
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'MFA enabled');

      // Verify backup codes are displayed
      cy.get('[data-testid="backup-codes-display"]').should('be.visible');
    });

    it('should reject invalid TOTP code during setup', () => {
      cy.intercept('POST', '/api/auth/mfa/setup', {
        statusCode: 200,
        body: {
          qrCode: 'data:image/png;base64,mock',
          secret: 'TESTSECRET123',
        },
      }).as('mfaSetup');

      cy.intercept('POST', '/api/auth/mfa/verify-setup', {
        statusCode: 400,
        body: {
          error: 'Invalid verification code',
          message: 'The code you entered is incorrect or expired',
        },
      }).as('verifySetupFail');

      cy.get('[data-testid="enable-mfa-button"]').click();
      cy.wait('@mfaSetup');

      cy.get('[data-testid="mfa-verification-code-input"]').type('000000');
      cy.get('[data-testid="verify-mfa-button"]').click();

      cy.wait('@verifySetupFail');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid verification code');

      // User should still be in setup flow
      cy.get('[data-testid="mfa-setup-modal"]').should('be.visible');
    });

    it('should display and allow downloading backup codes', () => {
      cy.intercept('POST', '/api/auth/mfa/setup', {
        statusCode: 200,
        body: {
          qrCode: 'data:image/png;base64,mock',
          secret: 'TESTSECRET123',
          backupCodes: [
            '111111-111111',
            '222222-222222',
            '333333-333333',
            '444444-444444',
            '555555-555555',
          ],
        },
      }).as('mfaSetup');

      cy.intercept('POST', '/api/auth/mfa/verify-setup', {
        statusCode: 200,
        body: {
          success: true,
          backupCodes: [
            '111111-111111',
            '222222-222222',
            '333333-333333',
            '444444-444444',
            '555555-555555',
          ],
        },
      }).as('verifySetup');

      cy.get('[data-testid="enable-mfa-button"]').click();
      cy.wait('@mfaSetup');

      cy.get('[data-testid="mfa-verification-code-input"]').type('123456');
      cy.get('[data-testid="verify-mfa-button"]').click();
      cy.wait('@verifySetup');

      // Verify all backup codes are displayed
      cy.get('[data-testid="backup-code-item"]').should('have.length', 5);

      cy.get('[data-testid="backup-code-item"]')
        .first()
        .should('contain', '111111-111111');

      // Test download backup codes button
      cy.get('[data-testid="download-backup-codes-button"]')
        .should('be.visible')
        .click();

      // Verify download was triggered (file download)
      cy.readFile('cypress/downloads/lexiflow-backup-codes.txt', { timeout: 5000 })
        .should('exist');
    });

    it('should allow copying backup codes to clipboard', () => {
      cy.intercept('POST', '/api/auth/mfa/setup', {
        statusCode: 200,
        body: {
          qrCode: 'data:image/png;base64,mock',
          secret: 'TESTSECRET123',
        },
      }).as('mfaSetup');

      cy.intercept('POST', '/api/auth/mfa/verify-setup', {
        statusCode: 200,
        body: {
          success: true,
          backupCodes: ['111111-111111', '222222-222222'],
        },
      }).as('verifySetup');

      cy.get('[data-testid="enable-mfa-button"]').click();
      cy.wait('@mfaSetup');

      cy.get('[data-testid="mfa-verification-code-input"]').type('123456');
      cy.get('[data-testid="verify-mfa-button"]').click();
      cy.wait('@verifySetup');

      cy.get('[data-testid="copy-backup-codes-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="copy-success-notification"]')
        .should('be.visible')
        .and('contain', 'Copied');
    });
  });

  describe('MFA Verification During Login', () => {
    it('should prompt for MFA code after successful password authentication', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          requiresMfa: true,
          tempToken: 'temp-auth-token-123',
          userId: 'user-mfa-enabled',
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest');

      // Should show MFA verification screen
      cy.get('[data-testid="mfa-verification-screen"]').should('be.visible');

      cy.get('[data-testid="mfa-code-input"]')
        .should('be.visible')
        .and('have.attr', 'placeholder')
        .and('contain', '6-digit');
    });

    it('should successfully login with valid MFA code', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          requiresMfa: true,
          tempToken: 'temp-token',
        },
      }).as('loginRequest');

      cy.intercept('POST', '/api/auth/mfa/verify', {
        statusCode: 200,
        body: {
          user: {
            id: 'user-123',
            email: 'mfa-user@test.com',
            name: 'MFA User',
          },
          token: 'final-auth-token',
        },
      }).as('mfaVerify');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();
      cy.wait('@loginRequest');

      // Enter MFA code
      cy.get('[data-testid="mfa-code-input"]').type('123456');
      cy.get('[data-testid="verify-mfa-code-button"]').click();

      cy.wait('@mfaVerify').then((interception) => {
        expect(interception.request.body).to.deep.include({
          code: '123456',
          tempToken: 'temp-token',
        });
      });

      // Should be redirected to dashboard
      cy.url().should('include', '/dashboard');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.equal('final-auth-token');
      });
    });

    it('should reject invalid MFA code', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { requiresMfa: true, tempToken: 'temp-token' },
      }).as('loginRequest');

      cy.intercept('POST', '/api/auth/mfa/verify', {
        statusCode: 401,
        body: {
          error: 'Invalid MFA code',
          message: 'The code you entered is incorrect',
          attemptsRemaining: 2,
        },
      }).as('mfaVerifyFail');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();
      cy.wait('@loginRequest');

      cy.get('[data-testid="mfa-code-input"]').type('000000');
      cy.get('[data-testid="verify-mfa-code-button"]').click();

      cy.wait('@mfaVerifyFail');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid MFA code');

      // Should show remaining attempts
      cy.get('[data-testid="attempts-remaining"]')
        .should('be.visible')
        .and('contain', '2');
    });

    it('should allow using backup code instead of TOTP', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { requiresMfa: true, tempToken: 'temp-token' },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();
      cy.wait('@loginRequest');

      // Click "Use backup code" link
      cy.get('[data-testid="use-backup-code-link"]')
        .should('be.visible')
        .click();

      // Backup code input should appear
      cy.get('[data-testid="backup-code-input"]')
        .should('be.visible')
        .type('111111-111111');

      cy.intercept('POST', '/api/auth/mfa/verify-backup', {
        statusCode: 200,
        body: {
          user: { id: 'user-123', email: 'mfa-user@test.com' },
          token: 'final-auth-token',
          backupCodeUsed: true,
        },
      }).as('verifyBackup');

      cy.get('[data-testid="verify-backup-code-button"]').click();

      cy.wait('@verifyBackup');

      cy.url().should('include', '/dashboard');
    });

    it('should show warning when backup code is used', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { requiresMfa: true, tempToken: 'temp-token' },
      }).as('loginRequest');

      cy.intercept('POST', '/api/auth/mfa/verify-backup', {
        statusCode: 200,
        body: {
          user: { id: 'user-123' },
          token: 'auth-token',
          backupCodesRemaining: 3,
        },
      }).as('verifyBackup');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();
      cy.wait('@loginRequest');

      cy.get('[data-testid="use-backup-code-link"]').click();
      cy.get('[data-testid="backup-code-input"]').type('111111-111111');
      cy.get('[data-testid="verify-backup-code-button"]').click();

      cy.wait('@verifyBackup');

      // Should show warning about remaining backup codes
      cy.get('[data-testid="backup-code-warning"]')
        .should('be.visible')
        .and('contain', '3')
        .and('contain', 'remaining');
    });
  });

  describe('Backup Codes Management', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
        win.localStorage.setItem('mfa_enabled', 'true');
      });

      cy.visit('/settings/security');
    });

    it('should display remaining backup codes count', () => {
      cy.intercept('GET', '/api/auth/mfa/status', {
        statusCode: 200,
        body: {
          mfaEnabled: true,
          backupCodesRemaining: 5,
        },
      }).as('mfaStatus');

      cy.wait('@mfaStatus');

      cy.get('[data-testid="backup-codes-remaining"]')
        .should('be.visible')
        .and('contain', '5')
        .and('contain', 'backup codes remaining');
    });

    it('should allow regenerating backup codes', () => {
      cy.intercept('POST', '/api/auth/mfa/regenerate-backup-codes', {
        statusCode: 200,
        body: {
          backupCodes: [
            'NEW-111111',
            'NEW-222222',
            'NEW-333333',
            'NEW-444444',
            'NEW-555555',
          ],
        },
      }).as('regenerateCodes');

      cy.get('[data-testid="regenerate-backup-codes-button"]')
        .should('be.visible')
        .click();

      // Confirm regeneration
      cy.get('[data-testid="confirm-regenerate-button"]')
        .should('be.visible')
        .click();

      cy.wait('@regenerateCodes');

      // New codes should be displayed
      cy.get('[data-testid="backup-codes-display"]').should('be.visible');

      cy.get('[data-testid="backup-code-item"]')
        .first()
        .should('contain', 'NEW-111111');

      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'Backup codes regenerated');
    });

    it('should warn when backup codes are running low', () => {
      cy.intercept('GET', '/api/auth/mfa/status', {
        statusCode: 200,
        body: {
          mfaEnabled: true,
          backupCodesRemaining: 1,
        },
      }).as('mfaStatus');

      cy.wait('@mfaStatus');

      cy.get('[data-testid="low-backup-codes-warning"]')
        .should('be.visible')
        .and('contain', 'running low')
        .and('contain', 'regenerate');
    });
  });

  describe('Trusted Devices - Remember Me', () => {
    it('should offer to remember device after successful MFA verification', () => {
      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { requiresMfa: true, tempToken: 'temp-token' },
      }).as('loginRequest');

      cy.intercept('POST', '/api/auth/mfa/verify', {
        statusCode: 200,
        body: {
          user: { id: 'user-123' },
          token: 'auth-token',
        },
      }).as('mfaVerify');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();
      cy.wait('@loginRequest');

      // Remember device checkbox should be visible
      cy.get('[data-testid="remember-device-checkbox"]')
        .should('be.visible')
        .check();

      cy.get('[data-testid="mfa-code-input"]').type('123456');
      cy.get('[data-testid="verify-mfa-code-button"]').click();

      cy.wait('@mfaVerify').then((interception) => {
        expect(interception.request.body.rememberDevice).to.be.true;
      });
    });

    it('should bypass MFA on trusted device', () => {
      // Set device trust token
      cy.window().then((win) => {
        win.localStorage.setItem('device_trust_token', 'trusted-device-token-123');
      });

      cy.visit('/login');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user-123', email: 'mfa-user@test.com' },
          token: 'auth-token',
          mfaBypassed: true,
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('mfa-user@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body.deviceTrustToken).to.equal('trusted-device-token-123');
      });

      // Should skip MFA and go directly to dashboard
      cy.get('[data-testid="mfa-verification-screen"]').should('not.exist');
      cy.url().should('include', '/dashboard');
    });

    it('should display list of trusted devices in settings', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('mfa_enabled', 'true');
      });

      cy.intercept('GET', '/api/auth/mfa/trusted-devices', {
        statusCode: 200,
        body: {
          devices: [
            {
              id: 'device-1',
              name: 'Chrome on Windows',
              lastUsed: '2026-01-01T10:00:00Z',
              current: true,
            },
            {
              id: 'device-2',
              name: 'Safari on iPhone',
              lastUsed: '2025-12-30T15:30:00Z',
              current: false,
            },
          ],
        },
      }).as('trustedDevices');

      cy.visit('/settings/security');

      cy.wait('@trustedDevices');

      cy.get('[data-testid="trusted-devices-list"]').should('be.visible');

      cy.get('[data-testid="trusted-device-item"]').should('have.length', 2);

      cy.get('[data-testid="trusted-device-item"]')
        .first()
        .should('contain', 'Chrome on Windows')
        .and('contain', 'Current device');
    });

    it('should allow removing trusted device', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('mfa_enabled', 'true');
      });

      cy.intercept('GET', '/api/auth/mfa/trusted-devices', {
        statusCode: 200,
        body: {
          devices: [
            {
              id: 'device-1',
              name: 'Chrome on Windows',
              current: false,
            },
          ],
        },
      }).as('trustedDevices');

      cy.intercept('DELETE', '/api/auth/mfa/trusted-devices/device-1', {
        statusCode: 200,
        body: { success: true },
      }).as('removeDevice');

      cy.visit('/settings/security');
      cy.wait('@trustedDevices');

      cy.get('[data-testid="remove-device-button-device-1"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="confirm-remove-device-button"]')
        .should('be.visible')
        .click();

      cy.wait('@removeDevice');

      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'Device removed');
    });
  });

  describe('Disable MFA', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
        win.localStorage.setItem('mfa_enabled', 'true');
      });

      cy.visit('/settings/security');
    });

    it('should require password confirmation to disable MFA', () => {
      cy.get('[data-testid="disable-mfa-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="confirm-password-modal"]').should('be.visible');

      cy.get('[data-testid="password-confirmation-input"]')
        .should('be.visible')
        .type('WrongPassword');

      cy.intercept('POST', '/api/auth/mfa/disable', {
        statusCode: 401,
        body: { error: 'Invalid password' },
      }).as('disableMfaFail');

      cy.get('[data-testid="confirm-disable-mfa-button"]').click();

      cy.wait('@disableMfaFail');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid password');
    });

    it('should successfully disable MFA with correct password', () => {
      cy.get('[data-testid="disable-mfa-button"]').click();

      cy.get('[data-testid="password-confirmation-input"]').type('CorrectPassword123!');

      cy.intercept('POST', '/api/auth/mfa/disable', {
        statusCode: 200,
        body: { success: true, message: 'MFA disabled' },
      }).as('disableMfa');

      cy.get('[data-testid="confirm-disable-mfa-button"]').click();

      cy.wait('@disableMfa');

      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'MFA disabled');

      // Enable MFA button should now be visible
      cy.get('[data-testid="enable-mfa-button"]').should('be.visible');
    });
  });
});
