/// <reference types="cypress" />

/**
 * Password Reset E2E Tests
 *
 * Comprehensive password reset tests covering:
 * - Forgot password request flow
 * - Reset link navigation and validation
 * - Password reset submission
 * - Password policy enforcement
 * - Expired/invalid token handling
 */

describe('Authentication - Password Reset', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();
  });

  describe('Forgot Password Request', () => {
    beforeEach(() => {
      cy.visit('/login');
    });

    it('should navigate to forgot password page from login', () => {
      cy.get('[data-testid="forgot-password-link"]')
        .should('be.visible')
        .click();

      cy.url().should('include', '/forgot-password');

      cy.get('[data-testid="forgot-password-form"]').should('be.visible');

      cy.get('[data-testid="email-input"]').should('be.visible');
    });

    it('should submit forgot password request with valid email', () => {
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Password reset email sent',
        },
      }).as('forgotPasswordRequest');

      cy.visit('/forgot-password');

      cy.get('[data-testid="email-input"]')
        .should('be.visible')
        .type('user@lexiflow.com');

      cy.get('[data-testid="submit-button"]')
        .should('be.visible')
        .click();

      cy.wait('@forgotPasswordRequest').then((interception) => {
        expect(interception.request.body).to.deep.include({
          email: 'user@lexiflow.com',
        });
        expect(interception.response?.statusCode).to.equal(200);
      });

      // Verify success message
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Password reset email sent')
        .and('contain', 'user@lexiflow.com');
    });

    it('should validate email format before submission', () => {
      cy.visit('/forgot-password');

      cy.get('[data-testid="email-input"]').type('invalid-email-format');

      cy.get('[data-testid="submit-button"]').click();

      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'valid email');

      // Should not make API call with invalid email
      cy.url().should('include', '/forgot-password');
    });

    it('should require email field to be filled', () => {
      cy.visit('/forgot-password');

      cy.get('[data-testid="submit-button"]').click();

      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');
    });

    it('should handle non-existent email gracefully', () => {
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'If an account exists, a password reset email has been sent',
        },
      }).as('forgotPasswordRequest');

      cy.visit('/forgot-password');

      cy.get('[data-testid="email-input"]').type('nonexistent@email.com');
      cy.get('[data-testid="submit-button"]').click();

      cy.wait('@forgotPasswordRequest');

      // Should show generic message for security (not revealing if user exists)
      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'If an account exists');
    });

    it('should provide link to return to login', () => {
      cy.visit('/forgot-password');

      cy.get('[data-testid="back-to-login-link"]')
        .should('be.visible')
        .and('contain', 'Back to login')
        .click();

      cy.url().should('include', '/login');
    });

    it('should rate limit multiple reset requests', () => {
      cy.visit('/forgot-password');

      // First request succeeds
      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 200,
        body: { success: true, message: 'Email sent' },
      }).as('firstRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="submit-button"]').click();
      cy.wait('@firstRequest');

      // Reload and try again immediately
      cy.reload();

      cy.intercept('POST', '/api/auth/forgot-password', {
        statusCode: 429,
        body: {
          error: 'Too many requests',
          message: 'Please wait 5 minutes before requesting another reset',
        },
      }).as('rateLimitedRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="submit-button"]').click();

      cy.wait('@rateLimitedRequest');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Too many requests');
    });
  });

  describe('Reset Link Navigation', () => {
    it('should accept valid reset token from email link', () => {
      const validToken = 'valid-reset-token-abc123';

      cy.intercept('GET', `/api/auth/validate-reset-token?token=${validToken}`, {
        statusCode: 200,
        body: {
          valid: true,
          email: 'user@test.com',
        },
      }).as('validateToken');

      cy.visit(`/reset-password?token=${validToken}`);

      cy.wait('@validateToken');

      cy.get('[data-testid="reset-password-form"]').should('be.visible');

      cy.get('[data-testid="email-display"]')
        .should('be.visible')
        .and('contain', 'user@test.com');
    });

    it('should reject expired reset token', () => {
      const expiredToken = 'expired-reset-token-xyz789';

      cy.intercept('GET', `/api/auth/validate-reset-token?token=${expiredToken}`, {
        statusCode: 400,
        body: {
          valid: false,
          error: 'Token expired',
          message: 'This reset link has expired. Please request a new one.',
        },
      }).as('validateExpiredToken');

      cy.visit(`/reset-password?token=${expiredToken}`);

      cy.wait('@validateExpiredToken');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'expired');

      cy.get('[data-testid="request-new-link-button"]')
        .should('be.visible')
        .click();

      cy.url().should('include', '/forgot-password');
    });

    it('should reject invalid reset token', () => {
      const invalidToken = 'invalid-token-123';

      cy.intercept('GET', `/api/auth/validate-reset-token?token=${invalidToken}`, {
        statusCode: 400,
        body: {
          valid: false,
          error: 'Invalid token',
          message: 'This reset link is invalid',
        },
      }).as('validateInvalidToken');

      cy.visit(`/reset-password?token=${invalidToken}`);

      cy.wait('@validateInvalidToken');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'invalid');
    });

    it('should reject already-used reset token', () => {
      const usedToken = 'used-token-456';

      cy.intercept('GET', `/api/auth/validate-reset-token?token=${usedToken}`, {
        statusCode: 400,
        body: {
          valid: false,
          error: 'Token already used',
          message: 'This reset link has already been used',
        },
      }).as('validateUsedToken');

      cy.visit(`/reset-password?token=${usedToken}`);

      cy.wait('@validateUsedToken');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'already been used');
    });

    it('should require token parameter in URL', () => {
      cy.visit('/reset-password');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid or missing reset token');

      cy.get('[data-testid="back-to-login-link"]').should('be.visible');
    });
  });

  describe('Password Reset Submission', () => {
    const validToken = 'valid-reset-token-abc123';

    beforeEach(() => {
      cy.intercept('GET', `/api/auth/validate-reset-token?token=${validToken}`, {
        statusCode: 200,
        body: {
          valid: true,
          email: 'user@test.com',
        },
      }).as('validateToken');

      cy.visit(`/reset-password?token=${validToken}`);
      cy.wait('@validateToken');
    });

    it('should successfully reset password with valid new password', () => {
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Password reset successful',
        },
      }).as('resetPassword');

      cy.get('[data-testid="new-password-input"]')
        .should('be.visible')
        .type('NewSecureP@ssw0rd123');

      cy.get('[data-testid="confirm-password-input"]')
        .should('be.visible')
        .type('NewSecureP@ssw0rd123');

      cy.get('[data-testid="submit-reset-button"]')
        .should('be.visible')
        .click();

      cy.wait('@resetPassword').then((interception) => {
        expect(interception.request.body).to.deep.include({
          token: validToken,
          newPassword: 'NewSecureP@ssw0rd123',
        });
        expect(interception.response?.statusCode).to.equal(200);
      });

      cy.get('[data-testid="success-message"]')
        .should('be.visible')
        .and('contain', 'Password reset successful');

      // Should redirect to login
      cy.url().should('include', '/login');

      // Should show success notification on login page
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'You can now login');
    });

    it('should auto-login user after successful password reset', () => {
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: {
          success: true,
          autoLogin: true,
          token: 'new-auth-token',
          user: {
            id: 'user-123',
            email: 'user@test.com',
          },
        },
      }).as('resetPassword');

      cy.get('[data-testid="new-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.wait('@resetPassword');

      // Should be logged in and redirected to dashboard
      cy.url().should('include', '/dashboard');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.equal('new-auth-token');
      });
    });

    it('should validate password confirmation matches', () => {
      cy.get('[data-testid="new-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPassword123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="confirm-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'Passwords do not match');

      // Should not make API call
      cy.url().should('include', '/reset-password');
    });

    it('should require both password fields', () => {
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="new-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');

      cy.get('[data-testid="confirm-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');
    });

    it('should show password strength indicator', () => {
      cy.get('[data-testid="new-password-input"]').type('weak');

      cy.get('[data-testid="password-strength-indicator"]')
        .should('be.visible')
        .and('contain', 'Weak');

      cy.get('[data-testid="new-password-input"]').clear().type('StrongP@ssw0rd123');

      cy.get('[data-testid="password-strength-indicator"]')
        .should('contain', 'Strong');
    });

    it('should allow toggling password visibility', () => {
      cy.get('[data-testid="new-password-input"]').type('MyPassword123!');

      cy.get('[data-testid="new-password-input"]')
        .should('have.attr', 'type', 'password');

      cy.get('[data-testid="toggle-new-password-visibility"]').click();

      cy.get('[data-testid="new-password-input"]')
        .should('have.attr', 'type', 'text');

      cy.get('[data-testid="toggle-new-password-visibility"]').click();

      cy.get('[data-testid="new-password-input"]')
        .should('have.attr', 'type', 'password');
    });
  });

  describe('Password Policy Enforcement', () => {
    const validToken = 'valid-reset-token-abc123';

    beforeEach(() => {
      cy.intercept('GET', `/api/auth/validate-reset-token?token=${validToken}`, {
        statusCode: 200,
        body: { valid: true, email: 'user@test.com' },
      }).as('validateToken');

      cy.visit(`/reset-password?token=${validToken}`);
      cy.wait('@validateToken');
    });

    it('should enforce minimum password length', () => {
      cy.get('[data-testid="new-password-input"]').type('Short1!');
      cy.get('[data-testid="confirm-password-input"]').type('Short1!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="new-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'at least 8 characters');
    });

    it('should require uppercase letter', () => {
      cy.get('[data-testid="new-password-input"]').type('lowercase123!');
      cy.get('[data-testid="confirm-password-input"]').type('lowercase123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="new-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'uppercase');
    });

    it('should require lowercase letter', () => {
      cy.get('[data-testid="new-password-input"]').type('UPPERCASE123!');
      cy.get('[data-testid="confirm-password-input"]').type('UPPERCASE123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="new-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'lowercase');
    });

    it('should require number', () => {
      cy.get('[data-testid="new-password-input"]').type('NoNumbers!');
      cy.get('[data-testid="confirm-password-input"]').type('NoNumbers!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="new-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'number');
    });

    it('should require special character', () => {
      cy.get('[data-testid="new-password-input"]').type('NoSpecial123');
      cy.get('[data-testid="confirm-password-input"]').type('NoSpecial123');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.get('[data-testid="new-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'special character');
    });

    it('should display all password requirements', () => {
      cy.get('[data-testid="password-requirements"]').should('be.visible');

      // Check that all requirements are listed
      cy.get('[data-testid="password-requirements"]').within(() => {
        cy.contains('8 characters').should('be.visible');
        cy.contains('uppercase').should('be.visible');
        cy.contains('lowercase').should('be.visible');
        cy.contains('number').should('be.visible');
        cy.contains('special character').should('be.visible');
      });
    });

    it('should show real-time password requirement validation', () => {
      cy.get('[data-testid="new-password-input"]').type('a');

      cy.get('[data-testid="requirement-lowercase"]')
        .should('have.class', 'met');

      cy.get('[data-testid="requirement-uppercase"]')
        .should('have.class', 'unmet');

      cy.get('[data-testid="new-password-input"]').type('A');

      cy.get('[data-testid="requirement-uppercase"]')
        .should('have.class', 'met');

      cy.get('[data-testid="new-password-input"]').type('1');

      cy.get('[data-testid="requirement-number"]')
        .should('have.class', 'met');

      cy.get('[data-testid="new-password-input"]').type('!');

      cy.get('[data-testid="requirement-special"]')
        .should('have.class', 'met');

      cy.get('[data-testid="new-password-input"]').type('bcde');

      cy.get('[data-testid="requirement-length"]')
        .should('have.class', 'met');
    });

    it('should prevent reusing old password', () => {
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 400,
        body: {
          error: 'Password reuse not allowed',
          message: 'You cannot reuse your previous password',
        },
      }).as('resetPasswordFail');

      cy.get('[data-testid="new-password-input"]').type('OldPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('OldPassword123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.wait('@resetPasswordFail');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'cannot reuse');
    });

    it('should reject commonly used passwords', () => {
      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 400,
        body: {
          error: 'Weak password',
          message: 'This password is too common. Please choose a more unique password.',
        },
      }).as('resetPasswordFail');

      cy.get('[data-testid="new-password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.wait('@resetPasswordFail');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'too common');
    });
  });

  describe('Security Features', () => {
    it('should invalidate all sessions after password reset', () => {
      const validToken = 'valid-reset-token';

      cy.intercept('GET', `/api/auth/validate-reset-token?token=${validToken}`, {
        statusCode: 200,
        body: { valid: true, email: 'user@test.com' },
      }).as('validateToken');

      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Password reset successful. All other sessions have been logged out.',
          sessionsInvalidated: 3,
        },
      }).as('resetPassword');

      cy.visit(`/reset-password?token=${validToken}`);
      cy.wait('@validateToken');

      cy.get('[data-testid="new-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.wait('@resetPassword');

      cy.get('[data-testid="info-message"]')
        .should('be.visible')
        .and('contain', 'All other sessions have been logged out');
    });

    it('should send email notification about password change', () => {
      const validToken = 'valid-reset-token';

      cy.intercept('GET', `/api/auth/validate-reset-token?token=${validToken}`, {
        statusCode: 200,
        body: { valid: true, email: 'user@test.com' },
      }).as('validateToken');

      cy.intercept('POST', '/api/auth/reset-password', {
        statusCode: 200,
        body: {
          success: true,
          message: 'Password reset successful',
          emailNotificationSent: true,
        },
      }).as('resetPassword');

      cy.visit(`/reset-password?token=${validToken}`);
      cy.wait('@validateToken');

      cy.get('[data-testid="new-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('NewPassword123!');
      cy.get('[data-testid="submit-reset-button"]').click();

      cy.wait('@resetPassword');

      cy.get('[data-testid="info-message"]')
        .should('be.visible')
        .and('contain', 'confirmation email');
    });
  });
});
