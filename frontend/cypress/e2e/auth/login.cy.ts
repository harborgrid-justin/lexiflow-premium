/// <reference types="cypress" />

/**
 * Login E2E Tests
 *
 * Comprehensive authentication tests for login flows including:
 * - Valid/invalid credentials
 * - Remember me functionality
 * - Post-login redirects
 * - Logout functionality
 */

describe('Authentication - Login', () => {
  beforeEach(() => {
    // Clear all storage before each test
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.clearCookies();

    // Visit login page
    cy.visit('/login');
  });

  describe('Successful Login', () => {
    it('should login successfully with valid credentials and redirect to dashboard', () => {
      // Mock successful login API response
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 'user-123',
            email: 'attorney@lexiflow.com',
            name: 'John Attorney',
            role: 'attorney',
            firm: 'Smith & Associates',
          },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
          refreshToken: 'refresh-token-123',
        },
      }).as('loginRequest');

      // Fill in login form
      cy.get('[data-testid="email-input"]')
        .should('be.visible')
        .type('attorney@lexiflow.com');

      cy.get('[data-testid="password-input"]')
        .should('be.visible')
        .type('SecurePassword123!');

      // Submit login form
      cy.get('[data-testid="login-button"]')
        .should('be.visible')
        .should('not.be.disabled')
        .click();

      // Wait for API call
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.deep.include({
          email: 'attorney@lexiflow.com',
          password: 'SecurePassword123!',
        });
        expect(interception.response?.statusCode).to.equal(200);
      });

      // Verify redirect to dashboard
      cy.url().should('include', '/dashboard');

      // Verify user data is stored in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.exist;
        expect(win.localStorage.getItem('user_id')).to.equal('user-123');
        expect(win.localStorage.getItem('user_email')).to.equal('attorney@lexiflow.com');
      });
    });

    it('should display welcome message after successful login', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: {
            id: 'user-456',
            email: 'user@test.com',
            name: 'Test User',
            role: 'paralegal',
          },
          token: 'valid-jwt-token',
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest');

      // Check for success notification or welcome message
      cy.get('[data-testid="success-notification"]', { timeout: 5000 })
        .should('be.visible')
        .and('contain', 'Welcome');
    });
  });

  describe('Failed Login - Invalid Credentials', () => {
    it('should show error message with invalid password', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: {
          error: 'Invalid credentials',
          message: 'The password you entered is incorrect',
        },
      }).as('failedLoginRequest');

      cy.get('[data-testid="email-input"]').type('valid@email.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@failedLoginRequest');

      // Verify error message is displayed
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid credentials');

      // Verify user stays on login page
      cy.url().should('include', '/login');

      // Verify no auth data in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
      });
    });

    it('should show error message with invalid email', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 404,
        body: {
          error: 'User not found',
          message: 'No account exists with this email address',
        },
      }).as('failedLoginRequest');

      cy.get('[data-testid="email-input"]').type('nonexistent@email.com');
      cy.get('[data-testid="password-input"]').type('anypassword');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@failedLoginRequest');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'User not found');

      cy.url().should('include', '/login');
    });

    it('should validate email format before submission', () => {
      cy.get('[data-testid="email-input"]').type('invalid-email-format');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      // Verify validation error for invalid email
      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'valid email');
    });

    it('should require both email and password fields', () => {
      // Try to submit with empty fields
      cy.get('[data-testid="login-button"]').click();

      // Check for field validation errors
      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');

      cy.get('[data-testid="password-validation-error"]')
        .should('be.visible')
        .and('contain', 'required');
    });
  });

  describe('Remember Me Functionality', () => {
    it('should save remember me preference when checked', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user-789', email: 'user@test.com', name: 'Test' },
          token: 'jwt-token',
          refreshToken: 'refresh-token',
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('password123');

      // Check remember me checkbox
      cy.get('[data-testid="remember-me-checkbox"]')
        .should('be.visible')
        .check()
        .should('be.checked');

      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body.rememberMe).to.be.true;
      });

      // Verify remember me flag is stored
      cy.window().then((win) => {
        expect(win.localStorage.getItem('remember_me')).to.equal('true');
      });
    });

    it('should not save remember me preference when unchecked', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user-789', email: 'user@test.com', name: 'Test' },
          token: 'jwt-token',
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('password123');

      // Ensure remember me is unchecked
      cy.get('[data-testid="remember-me-checkbox"]')
        .should('be.visible')
        .should('not.be.checked');

      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest');

      cy.window().then((win) => {
        const rememberMe = win.localStorage.getItem('remember_me');
        expect(rememberMe).to.not.equal('true');
      });
    });
  });

  describe('Redirect After Login', () => {
    it('should redirect to originally requested page after login', () => {
      // Visit a protected page which should redirect to login
      cy.visit('/cases/case-123');

      // Should be redirected to login with return URL
      cy.url().should('include', '/login');
      cy.url().should('include', 'redirect=');

      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user-123', email: 'user@test.com', name: 'Test' },
          token: 'jwt-token',
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest');

      // Should redirect back to originally requested page
      cy.url().should('include', '/cases/case-123');
    });

    it('should redirect to dashboard when no return URL specified', () => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: {
          user: { id: 'user-123', email: 'user@test.com', name: 'Test' },
          token: 'jwt-token',
        },
      }).as('loginRequest');

      cy.get('[data-testid="email-input"]').type('user@test.com');
      cy.get('[data-testid="password-input"]').type('password123');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@loginRequest');

      cy.url().should('include', '/dashboard');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
      // Setup authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'test-jwt-token');
        win.localStorage.setItem('user_id', 'user-123');
        win.localStorage.setItem('user_email', 'user@test.com');
      });

      cy.visit('/dashboard');
    });

    it('should logout successfully and clear auth data', () => {
      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200,
        body: { success: true },
      }).as('logoutRequest');

      // Click logout button
      cy.get('[data-testid="user-menu-button"]')
        .should('be.visible')
        .click();

      cy.get('[data-testid="logout-button"]')
        .should('be.visible')
        .click();

      cy.wait('@logoutRequest');

      // Verify redirect to login page
      cy.url().should('include', '/login');

      // Verify all auth data is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.be.null;
        expect(win.localStorage.getItem('user_id')).to.be.null;
        expect(win.localStorage.getItem('user_email')).to.be.null;
      });
    });

    it('should show logout confirmation dialog', () => {
      cy.get('[data-testid="user-menu-button"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Verify confirmation dialog appears
      cy.get('[data-testid="logout-confirmation-dialog"]')
        .should('be.visible')
        .and('contain', 'Are you sure');

      // Cancel logout
      cy.get('[data-testid="cancel-logout-button"]').click();

      // Should still be on dashboard
      cy.url().should('include', '/dashboard');

      // Auth data should still exist
      cy.window().then((win) => {
        expect(win.localStorage.getItem('auth_token')).to.exist;
      });
    });

    it('should clear session storage on logout', () => {
      // Add some session data
      cy.window().then((win) => {
        win.sessionStorage.setItem('temp_data', 'test');
      });

      cy.intercept('POST', '/api/auth/logout', {
        statusCode: 200,
        body: { success: true },
      }).as('logoutRequest');

      cy.get('[data-testid="user-menu-button"]').click();
      cy.get('[data-testid="logout-button"]').click();

      // Confirm logout if dialog appears
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="confirm-logout-button"]').length > 0) {
          cy.get('[data-testid="confirm-logout-button"]').click();
        }
      });

      cy.wait('@logoutRequest');

      // Verify session storage is cleared
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('temp_data')).to.be.null;
      });
    });
  });

  describe('Security Features', () => {
    it('should handle account lockout after multiple failed attempts', () => {
      // Simulate 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        cy.intercept('POST', '/api/auth/login', {
          statusCode: 401,
          body: {
            error: 'Invalid credentials',
            attemptsRemaining: 5 - i - 1,
          },
        }).as(`failedAttempt${i}`);

        cy.get('[data-testid="email-input"]').clear().type('user@test.com');
        cy.get('[data-testid="password-input"]').clear().type('wrongpassword');
        cy.get('[data-testid="login-button"]').click();

        cy.wait(`@failedAttempt${i}`);
      }

      // On the 6th attempt, account should be locked
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 423,
        body: {
          error: 'Account locked',
          message: 'Too many failed login attempts. Please try again in 30 minutes.',
        },
      }).as('lockedAccount');

      cy.get('[data-testid="email-input"]').clear().type('user@test.com');
      cy.get('[data-testid="password-input"]').clear().type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();

      cy.wait('@lockedAccount');

      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Account locked');
    });

    it('should mask password input', () => {
      cy.get('[data-testid="password-input"]')
        .should('have.attr', 'type', 'password');
    });

    it('should allow toggling password visibility', () => {
      cy.get('[data-testid="password-input"]').type('mypassword');

      // Click show password button
      cy.get('[data-testid="toggle-password-visibility"]')
        .should('be.visible')
        .click();

      // Password should now be visible
      cy.get('[data-testid="password-input"]')
        .should('have.attr', 'type', 'text');

      // Click again to hide
      cy.get('[data-testid="toggle-password-visibility"]').click();

      cy.get('[data-testid="password-input"]')
        .should('have.attr', 'type', 'password');
    });
  });
});
