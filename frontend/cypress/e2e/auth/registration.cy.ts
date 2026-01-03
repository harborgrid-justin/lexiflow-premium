/// <reference types="cypress" />

/**
 * Registration E2E Tests
 *
 * Comprehensive registration tests covering:
 * - Successful user registration
 * - Password validation rules
 * - Email validation
 * - Duplicate email handling
 * - Terms and conditions acceptance
 */

describe('Authentication - Registration', () => {
  beforeEach(() => {
    // Clear all storage before each test
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();

    // Visit registration page
    cy.visit('/register');
  });

  describe('Successful Registration', () => {
    it('should register a new user successfully with all required fields', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: 'user-new-123',
            email: 'newuser@lexiflow.com',
            name: 'Jane Doe',
            role: 'attorney',
            firm: 'Doe Legal Services',
          },
          token: 'new-user-jwt-token',
          message: 'Registration successful',
        },
      }).as('registerRequest');

      // Fill out registration form
      cy.get('[data-testid="first-name-input"]')
        .should('be.visible')
        .type('Jane');

      cy.get('[data-testid="last-name-input"]')
        .should('be.visible')
        .type('Doe');

      cy.get('[data-testid="email-input"]')
        .should('be.visible')
        .type('newuser@lexiflow.com');

      cy.get('[data-testid="password-input"]')
        .should('be.visible')
        .type('SecurePassword123!');

      cy.get('[data-testid="confirm-password-input"]')
        .should('be.visible')
        .type('SecurePassword123!');

      cy.get('[data-testid="firm-name-input"]')
        .should('be.visible')
        .type('Doe Legal Services');

      cy.get('[data-testid="role-select"]')
        .should('be.visible')
        .select('attorney');

      cy.get('[data-testid="terms-checkbox"]')
        .should('be.visible')
        .check()
        .should('be.checked');

      cy.get('[data-testid="register-button"]')
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      // Wait for registration API call
      cy.wait('@registerRequest').then((interception) => {
        expect(interception.request.body).to.deep.include({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'newuser@lexiflow.com',
          firmName: 'Doe Legal Services',
          role: 'attorney',
          acceptedTerms: true,
        });
        expect(interception.response?.statusCode).to.equal(201);
      });

      // Verify success message
      cy.get('[data-testid="success-notification"]')
        .should('be.visible')
        .and('contain', 'Registration successful');

      // Verify redirect to dashboard or onboarding
      cy.url().should('match', /\/(dashboard|onboarding)/);

      // Verify user data is stored
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.exist;
        expect(win.localStorage.getItem('user_id')).to.equal('user-new-123');
      });
    });

    it('should auto-login user after successful registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: 'user-456',
            email: 'autouser@test.com',
            name: 'Auto User',
          },
          token: 'auto-login-token',
          autoLogin: true,
        },
      }).as('registerRequest');

      cy.get('[data-testid="first-name-input"]').type('Auto');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('autouser@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@registerRequest');

      // Should be logged in automatically
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.equal('auto-login-token');
      });

      cy.url().should('not.include', '/login');
    });

    it('should send verification email after registration', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: {
            id: 'user-789',
            email: 'verify@test.com',
            emailVerified: false,
          },
          message: 'Please check your email to verify your account',
        },
      }).as('registerRequest');

      cy.get('[data-testid="first-name-input"]').type('Verify');
      cy.get('[data-testid="last-name-input"]').type('Test');
      cy.get('[data-testid="email-input"]').type('verify@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@registerRequest');

      // Verify email verification message
      cy.get('[data-testid="verification-message"]')
        .should('be.visible')
        .and('contain', 'check your email');
    });
  });

  describe('Password Validation', () => {
    beforeEach(() => {
      // Fill in required non-password fields
      cy.get('[data-testid="first-name-input"]').type('Test');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('test@valid.com');
      cy.get('[data-testid="terms-checkbox"]').check();
    });

    it('should reject passwords shorter than 8 characters', () => {
      cy.get('[data-testid="password-input"]').type('Short1!');
      cy.get('[data-testid="confirm-password-input"]').type('Short1!');
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'at least 8 characters');
    });

    it('should require at least one uppercase letter', () => {
      cy.get('[data-testid="password-input"]').type('lowercase123!');
      cy.get('[data-testid="confirm-password-input"]').type('lowercase123!');
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'uppercase');
    });

    it('should require at least one lowercase letter', () => {
      cy.get('[data-testid="password-input"]').type('UPPERCASE123!');
      cy.get('[data-testid="confirm-password-input"]').type('UPPERCASE123!');
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'lowercase');
    });

    it('should require at least one number', () => {
      cy.get('[data-testid="password-input"]').type('NoNumbers!');
      cy.get('[data-testid="confirm-password-input"]').type('NoNumbers!');
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'number');
    });

    it('should require at least one special character', () => {
      cy.get('[data-testid="password-input"]').type('NoSpecial123');
      cy.get('[data-testid="confirm-password-input"]').type('NoSpecial123');
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'special character');
    });

    it('should show password strength indicator', () => {
      // Weak password
      cy.get('[data-testid="password-input"]').type('weak');
      cy.get('[data-testid="password-strength-indicator"]')
        .should('be.visible')
        .and('contain', 'Weak');

      // Medium password
      cy.get('[data-testid="password-input"]').clear().type('Medium123');
      cy.get('[data-testid="password-strength-indicator"]')
        .should('contain', 'Medium');

      // Strong password
      cy.get('[data-testid="password-input"]').clear().type('StrongP@ssw0rd123!');
      cy.get('[data-testid="password-strength-indicator"]')
        .should('contain', 'Strong');
    });

    it('should validate password confirmation matches', () => {
      cy.get('[data-testid="password-input"]').type('ValidPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPassword123!');
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="confirm-password-validation-error"]')
        .should('be.visible')
        .and('contain', 'Passwords do not match');
    });

    it('should accept valid password that meets all requirements', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: {
          user: { id: 'user-valid', email: 'test@valid.com' },
          token: 'valid-token',
        },
      }).as('registerRequest');

      cy.get('[data-testid="password-input"]').type('ValidP@ssw0rd123');
      cy.get('[data-testid="confirm-password-input"]').type('ValidP@ssw0rd123');
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@registerRequest');

      // Should not show password validation errors
      cy.get('[data-testid="password-validation-error"]').should('not.exist');
    });
  });

  describe('Email Validation', () => {
    beforeEach(() => {
      cy.get('[data-testid="first-name-input"]').type('Test');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="password-input"]').type('ValidPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('ValidPassword123!');
      cy.get('[data-testid="terms-checkbox"]').check();
    });

    it('should reject invalid email format', () => {
      const invalidEmails = [
        'notanemail',
        '@nodomain.com',
        'missing@domain',
        'spaces in@email.com',
        'double@@domain.com',
      ];

      invalidEmails.forEach((invalidEmail) => {
        cy.get('[data-testid="email-input"]').clear().type(invalidEmail);
        cy.get('[data-testid="register-button"]').click();

        cy.get('[data-testid="email-validation-error"]')
          .should('be.visible')
          .and('contain', 'valid email');
      });
    });

    it('should accept valid email formats', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: { user: { id: 'user-123' }, token: 'token' },
      }).as('registerRequest');

      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.co.uk',
        'user_123@sub.domain.com',
      ];

      validEmails.forEach((validEmail, index) => {
        if (index > 0) {
          cy.visit('/register');
          cy.get('[data-testid="first-name-input"]').type('Test');
          cy.get('[data-testid="last-name-input"]').type('User');
          cy.get('[data-testid="password-input"]').type('ValidPassword123!');
          cy.get('[data-testid="confirm-password-input"]').type('ValidPassword123!');
          cy.get('[data-testid="terms-checkbox"]').check();
        }

        cy.get('[data-testid="email-input"]').clear().type(validEmail);
        cy.get('[data-testid="register-button"]').click();

        // Should not show email validation error
        cy.get('[data-testid="email-validation-error"]').should('not.exist');
      });
    });

    it('should check email availability in real-time', () => {
      cy.intercept('GET', '/api/auth/check-email*', {
        statusCode: 200,
        body: { available: true },
      }).as('checkEmail');

      cy.get('[data-testid="email-input"]').type('available@test.com');

      cy.wait('@checkEmail');

      cy.get('[data-testid="email-availability-indicator"]')
        .should('be.visible')
        .and('contain', 'available');
    });
  });

  describe('Duplicate Email Handling', () => {
    it('should show error when email already exists', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          error: 'Email already exists',
          message: 'An account with this email already exists. Please login instead.',
        },
      }).as('duplicateEmailRequest');

      cy.get('[data-testid="first-name-input"]').type('Duplicate');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('existing@user.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@duplicateEmailRequest');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'already exists');
    });

    it('should provide link to login page for existing users', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 409,
        body: {
          error: 'Email already exists',
          message: 'An account with this email already exists.',
        },
      }).as('duplicateEmailRequest');

      cy.get('[data-testid="first-name-input"]').type('Existing');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('existing@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="register-button"]').click();

      cy.wait('@duplicateEmailRequest');

      cy.get('[data-testid="login-link"]')
        .should('be.visible')
        .and('contain', 'login')
        .click();

      cy.url().should('include', '/login');
    });

    it('should pre-validate email availability before submission', () => {
      cy.intercept('GET', '/api/auth/check-email?email=taken@test.com', {
        statusCode: 200,
        body: { available: false, exists: true },
      }).as('checkEmailTaken');

      cy.get('[data-testid="email-input"]').type('taken@test.com');
      cy.get('[data-testid="email-input"]').blur();

      cy.wait('@checkEmailTaken');

      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'already in use');

      // Submit button should be disabled
      cy.get('[data-testid="register-button"]').should('be.disabled');
    });
  });

  describe('Terms Acceptance', () => {
    beforeEach(() => {
      cy.get('[data-testid="first-name-input"]').type('Test');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('test@valid.com');
      cy.get('[data-testid="password-input"]').type('ValidPassword123!');
      cy.get('[data-testid="confirm-password-input"]').type('ValidPassword123!');
    });

    it('should require terms and conditions acceptance', () => {
      // Try to submit without checking terms
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="terms-validation-error"]')
        .should('be.visible')
        .and('contain', 'accept');

      // Form should not be submitted
      cy.url().should('include', '/register');
    });

    it('should enable submit button only after terms are accepted', () => {
      // Initially, button might be disabled if terms not checked
      cy.get('[data-testid="terms-checkbox"]').should('not.be.checked');

      // Check terms
      cy.get('[data-testid="terms-checkbox"]').check();

      // Button should now be enabled
      cy.get('[data-testid="register-button"]').should('not.be.disabled');
    });

    it('should display terms and conditions in modal', () => {
      cy.get('[data-testid="view-terms-link"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="terms-modal"]')
        .should('be.visible')
        .and('contain', 'Terms and Conditions');

      cy.get('[data-testid="close-terms-modal"]').click();

      cy.get('[data-testid="terms-modal"]').should('not.exist');
    });

    it('should allow accepting terms from modal', () => {
      cy.get('[data-testid="view-terms-link"]').click();

      cy.get('[data-testid="terms-modal"]').should('be.visible');

      cy.get('[data-testid="accept-terms-in-modal"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="terms-modal"]').should('not.exist');

      // Terms checkbox should now be checked
      cy.get('[data-testid="terms-checkbox"]').should('be.checked');
    });

    it('should include privacy policy acceptance', () => {
      cy.get('[data-testid="privacy-policy-link"]')
        .should('be.visible')
        .and('have.attr', 'href')
        .and('include', 'privacy');

      cy.get('[data-testid="terms-checkbox"]').check();

      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        body: { user: { id: 'user-123' }, token: 'token' },
      }).as('registerRequest');

      cy.get('[data-testid="register-button"]').click();

      cy.wait('@registerRequest').then((interception) => {
        expect(interception.request.body.acceptedTerms).to.be.true;
        expect(interception.request.body.acceptedPrivacyPolicy).to.be.true;
      });
    });
  });

  describe('Form Validation and UX', () => {
    it('should show all required field errors when submitting empty form', () => {
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="first-name-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');

      cy.get('[data-testid="last-name-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');

      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');

      cy.get('[data-testid="terms-validation-error"]')
        .should('be.visible');
    });

    it('should clear validation errors when fields are corrected', () => {
      // Submit to trigger validation errors
      cy.get('[data-testid="register-button"]').click();

      cy.get('[data-testid="email-validation-error"]').should('be.visible');

      // Correct the field
      cy.get('[data-testid="email-input"]').type('valid@email.com');

      // Error should disappear
      cy.get('[data-testid="email-validation-error"]').should('not.exist');
    });

    it('should disable submit button while registration is in progress', () => {
      cy.intercept('POST', '/api/auth/register', {
        statusCode: 201,
        delay: 2000, // Simulate slow response
        body: { user: { id: 'user-123' }, token: 'token' },
      }).as('registerRequest');

      cy.get('[data-testid="first-name-input"]').type('Test');
      cy.get('[data-testid="last-name-input"]').type('User');
      cy.get('[data-testid="email-input"]').type('test@test.com');
      cy.get('[data-testid="password-input"]').type('Password123!');
      cy.get('[data-testid="confirm-password-input"]').type('Password123!');
      cy.get('[data-testid="terms-checkbox"]').check();
      cy.get('[data-testid="register-button"]').click();

      // Button should be disabled while request is pending
      cy.get('[data-testid="register-button"]').should('be.disabled');

      // Loading indicator should be visible
      cy.get('[data-testid="loading-indicator"]').should('be.visible');

      cy.wait('@registerRequest');
    });

    it('should have link to login page for existing users', () => {
      cy.get('[data-testid="existing-user-login-link"]')
        .should('be.visible')
        .and('contain', 'Already have an account')
        .click();

      cy.url().should('include', '/login');
    });
  });
});
