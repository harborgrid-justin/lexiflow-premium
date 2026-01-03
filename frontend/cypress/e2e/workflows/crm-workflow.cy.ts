/// <reference types="cypress" />

/**
 * E2E Test Suite: CRM Workflow
 *
 * Tests client relationship management features including:
 * - Client creation and management
 * - Contact management and organization
 * - Intake form submission and processing
 * - Conflict check procedures
 * - Lead tracking and conversion
 */

describe('CRM Workflow', () => {
  beforeEach(() => {
    cy.login('attorney@firm.com', 'password123');
    cy.setupTestUser('attorney');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Client Creation', () => {
    beforeEach(() => {
      // Mock clients API
      cy.intercept('GET', '/api/crm/clients*', {
        statusCode: 200,
        body: []
      }).as('getClients');

      cy.visit('/#/crm/clients');
      cy.wait('@getClients');
    });

    it('should create new individual client successfully', () => {
      // Mock create client API
      cy.intercept('POST', '/api/crm/clients', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `client-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createClient');

      // Click add client button
      cy.get('[data-testid="add-client-button"]')
        .click();

      // Verify client creation modal
      cy.get('[data-testid="client-modal"]')
        .should('be.visible')
        .within(() => {
          // Select client type
          cy.get('[data-testid="client-type-select"]')
            .select('Individual');

          // Basic information
          cy.get('[data-testid="client-first-name-input"]')
            .type('Michael');

          cy.get('[data-testid="client-last-name-input"]')
            .type('Anderson');

          cy.get('[data-testid="client-email-input"]')
            .type('manderson@email.com');

          cy.get('[data-testid="client-phone-input"]')
            .type('(555) 123-4567');

          // Address information
          cy.get('[data-testid="client-address-line1-input"]')
            .type('123 Main Street');

          cy.get('[data-testid="client-city-input"]')
            .type('San Francisco');

          cy.get('[data-testid="client-state-select"]')
            .select('California');

          cy.get('[data-testid="client-zip-input"]')
            .type('94102');

          // Additional details
          cy.get('[data-testid="client-preferred-contact-select"]')
            .select('Email');

          cy.get('[data-testid="client-source-select"]')
            .select('Referral');

          cy.get('[data-testid="client-notes-textarea"]')
            .type('Referred by John Smith - employment law matter');

          // Save client
          cy.get('[data-testid="save-client-button"]')
            .click();
        });

      cy.wait('@createClient');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Client created successfully');

      // Verify client appears in list
      cy.get('[data-testid="client-list"]')
        .should('contain', 'Michael Anderson')
        .and('contain', 'manderson@email.com');
    });

    it('should create new business client successfully', () => {
      cy.intercept('POST', '/api/crm/clients', {
        statusCode: 201,
        body: {
          id: 'client-business-001',
          type: 'Business'
        }
      }).as('createClient');

      cy.get('[data-testid="add-client-button"]').click();

      cy.get('[data-testid="client-modal"]')
        .within(() => {
          // Select business type
          cy.get('[data-testid="client-type-select"]')
            .select('Business');

          // Business information
          cy.get('[data-testid="client-company-name-input"]')
            .type('TechStart Industries LLC');

          cy.get('[data-testid="client-tax-id-input"]')
            .type('12-3456789');

          cy.get('[data-testid="client-business-type-select"]')
            .select('LLC');

          // Primary contact
          cy.get('[data-testid="client-contact-name-input"]')
            .type('Sarah Johnson');

          cy.get('[data-testid="client-contact-title-input"]')
            .type('CEO');

          cy.get('[data-testid="client-email-input"]')
            .type('sjohnson@techstart.com');

          cy.get('[data-testid="client-phone-input"]')
            .type('(555) 987-6543');

          // Address
          cy.get('[data-testid="client-address-line1-input"]')
            .type('456 Tech Boulevard, Suite 200');

          cy.get('[data-testid="client-city-input"]')
            .type('Palo Alto');

          cy.get('[data-testid="client-state-select"]')
            .select('California');

          cy.get('[data-testid="client-zip-input"]')
            .type('94301');

          cy.get('[data-testid="save-client-button"]').click();
        });

      cy.wait('@createClient');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Client created successfully');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-client-button"]').click();

      // Try to save without required fields
      cy.get('[data-testid="save-client-button"]')
        .should('be.disabled');

      // Fill only name
      cy.get('[data-testid="client-type-select"]')
        .select('Individual');

      cy.get('[data-testid="client-first-name-input"]')
        .type('John');

      // Still disabled without last name
      cy.get('[data-testid="save-client-button"]')
        .should('be.disabled');

      // Add last name
      cy.get('[data-testid="client-last-name-input"]')
        .type('Doe');

      // Add email (required contact method)
      cy.get('[data-testid="client-email-input"]')
        .type('jdoe@email.com');

      // Now should be enabled
      cy.get('[data-testid="save-client-button"]')
        .should('be.enabled');
    });

    it('should validate email format', () => {
      cy.get('[data-testid="add-client-button"]').click();

      cy.get('[data-testid="client-type-select"]')
        .select('Individual');

      cy.get('[data-testid="client-first-name-input"]')
        .type('John');

      cy.get('[data-testid="client-last-name-input"]')
        .type('Doe');

      // Enter invalid email
      cy.get('[data-testid="client-email-input"]')
        .type('invalid-email');

      // Verify error message
      cy.get('[data-testid="email-validation-error"]')
        .should('be.visible')
        .and('contain', 'Invalid email format');

      cy.get('[data-testid="save-client-button"]')
        .should('be.disabled');

      // Fix email
      cy.get('[data-testid="client-email-input"]')
        .clear()
        .type('jdoe@email.com');

      // Error should disappear
      cy.get('[data-testid="email-validation-error"]')
        .should('not.exist');

      cy.get('[data-testid="save-client-button"]')
        .should('be.enabled');
    });

    it('should search for existing clients before creating', () => {
      // Mock duplicate check API
      cy.intercept('GET', '/api/crm/clients/check-duplicate*', {
        statusCode: 200,
        body: {
          exists: true,
          matches: [
            {
              id: 'client-001',
              name: 'John Doe',
              email: 'jdoe@email.com'
            }
          ]
        }
      }).as('checkDuplicate');

      cy.get('[data-testid="add-client-button"]').click();

      cy.get('[data-testid="client-type-select"]')
        .select('Individual');

      cy.get('[data-testid="client-first-name-input"]')
        .type('John');

      cy.get('[data-testid="client-last-name-input"]')
        .type('Doe');

      cy.get('[data-testid="client-email-input"]')
        .type('jdoe@email.com');

      // Trigger duplicate check
      cy.wait(1000); // Debounce
      cy.wait('@checkDuplicate');

      // Verify warning shown
      cy.get('[data-testid="duplicate-warning"]')
        .should('be.visible')
        .and('contain', 'A similar client already exists');

      // Option to view existing client
      cy.get('[data-testid="view-existing-client-button"]')
        .should('be.visible');
    });
  });

  describe('Contact Management', () => {
    beforeEach(() => {
      // Mock client with contacts
      cy.intercept('GET', '/api/crm/clients/client-001', {
        statusCode: 200,
        body: {
          id: 'client-001',
          name: 'TechStart Industries LLC',
          type: 'Business',
          contacts: []
        }
      }).as('getClient');

      cy.intercept('GET', '/api/crm/clients/client-001/contacts', {
        statusCode: 200,
        body: []
      }).as('getContacts');

      cy.visit('/#/crm/clients/client-001');
      cy.wait('@getClient');
    });

    it('should add contact to business client', () => {
      // Mock create contact API
      cy.intercept('POST', '/api/crm/clients/client-001/contacts', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `contact-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createContact');

      // Navigate to contacts tab
      cy.get('[data-testid="client-tab-contacts"]')
        .click();

      // Click add contact
      cy.get('[data-testid="add-contact-button"]')
        .click();

      cy.get('[data-testid="contact-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="contact-first-name-input"]')
            .type('David');

          cy.get('[data-testid="contact-last-name-input"]')
            .type('Miller');

          cy.get('[data-testid="contact-title-input"]')
            .type('General Counsel');

          cy.get('[data-testid="contact-email-input"]')
            .type('dmiller@techstart.com');

          cy.get('[data-testid="contact-phone-input"]')
            .type('(555) 234-5678');

          cy.get('[data-testid="contact-role-select"]')
            .select('Legal Contact');

          cy.get('[data-testid="contact-primary-toggle"]')
            .check();

          cy.get('[data-testid="save-contact-button"]')
            .click();
        });

      cy.wait('@createContact');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Contact added successfully');

      // Verify contact appears in list
      cy.get('[data-testid="contacts-list"]')
        .should('contain', 'David Miller')
        .and('contain', 'General Counsel')
        .and('contain', 'Primary');
    });

    it('should edit existing contact', () => {
      // Mock contacts with data
      cy.intercept('GET', '/api/crm/clients/client-001/contacts', {
        statusCode: 200,
        body: [
          {
            id: 'contact-001',
            firstName: 'David',
            lastName: 'Miller',
            title: 'General Counsel',
            email: 'dmiller@techstart.com',
            phone: '(555) 234-5678',
            isPrimary: true
          }
        ]
      }).as('getContacts');

      cy.intercept('PATCH', '/api/crm/clients/client-001/contacts/contact-001', {
        statusCode: 200,
        body: { success: true }
      }).as('updateContact');

      cy.reload();
      cy.get('[data-testid="client-tab-contacts"]').click();
      cy.wait('@getContacts');

      // Click edit on contact
      cy.get('[data-testid="contact-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="edit-contact-button"]')
            .click();
        });

      // Update contact
      cy.get('[data-testid="contact-modal"]')
        .within(() => {
          cy.get('[data-testid="contact-title-input"]')
            .clear()
            .type('Chief Legal Officer');

          cy.get('[data-testid="save-contact-button"]')
            .click();
        });

      cy.wait('@updateContact');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Contact updated successfully');
    });

    it('should delete contact', () => {
      cy.intercept('GET', '/api/crm/clients/client-001/contacts', {
        statusCode: 200,
        body: [
          {
            id: 'contact-001',
            firstName: 'David',
            lastName: 'Miller'
          }
        ]
      }).as('getContacts');

      cy.intercept('DELETE', '/api/crm/clients/client-001/contacts/contact-001', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteContact');

      cy.reload();
      cy.get('[data-testid="client-tab-contacts"]').click();
      cy.wait('@getContacts');

      cy.get('[data-testid="contact-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="delete-contact-button"]')
            .click();
        });

      // Confirm deletion
      cy.get('[data-testid="confirm-delete-dialog"]')
        .within(() => {
          cy.get('[data-testid="confirm-button"]')
            .click();
        });

      cy.wait('@deleteContact');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Contact deleted successfully');
    });

    it('should set primary contact', () => {
      cy.intercept('GET', '/api/crm/clients/client-001/contacts', {
        statusCode: 200,
        body: [
          {
            id: 'contact-001',
            firstName: 'David',
            lastName: 'Miller',
            isPrimary: false
          },
          {
            id: 'contact-002',
            firstName: 'Sarah',
            lastName: 'Chen',
            isPrimary: true
          }
        ]
      }).as('getContacts');

      cy.intercept('POST', '/api/crm/clients/client-001/contacts/contact-001/set-primary', {
        statusCode: 200,
        body: { success: true }
      }).as('setPrimary');

      cy.reload();
      cy.get('[data-testid="client-tab-contacts"]').click();
      cy.wait('@getContacts');

      // Set first contact as primary
      cy.get('[data-testid="contact-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="set-primary-button"]')
            .click();
        });

      cy.wait('@setPrimary');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Primary contact updated');
    });
  });

  describe('Intake Form Submission', () => {
    beforeEach(() => {
      // Mock intake form template
      cy.intercept('GET', '/api/crm/intake/template', {
        statusCode: 200,
        body: {
          id: 'template-001',
          name: 'General Intake Form',
          sections: [
            {
              title: 'Personal Information',
              fields: [
                { name: 'firstName', type: 'text', required: true },
                { name: 'lastName', type: 'text', required: true },
                { name: 'email', type: 'email', required: true },
                { name: 'phone', type: 'tel', required: true }
              ]
            },
            {
              title: 'Case Information',
              fields: [
                { name: 'caseType', type: 'select', required: true },
                { name: 'caseDescription', type: 'textarea', required: true },
                { name: 'incidentDate', type: 'date', required: false }
              ]
            }
          ]
        }
      }).as('getIntakeTemplate');

      cy.visit('/#/crm/intake');
    });

    it('should submit intake form successfully', () => {
      // Mock intake submission API
      cy.intercept('POST', '/api/crm/intake', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `intake-${Date.now()}`,
            ...req.body,
            status: 'Submitted',
            submittedAt: new Date().toISOString()
          }
        });
      }).as('submitIntake');

      cy.wait('@getIntakeTemplate');

      // Fill intake form
      cy.get('[data-testid="intake-form"]')
        .within(() => {
          // Personal information
          cy.get('[data-testid="field-firstName"]')
            .type('Jennifer');

          cy.get('[data-testid="field-lastName"]')
            .type('Williams');

          cy.get('[data-testid="field-email"]')
            .type('jwilliams@email.com');

          cy.get('[data-testid="field-phone"]')
            .type('(555) 345-6789');

          // Case information
          cy.get('[data-testid="field-caseType"]')
            .select('Personal Injury');

          cy.get('[data-testid="field-caseDescription"]')
            .type('Car accident on Highway 101. Other driver ran red light and caused collision. Sustained back and neck injuries.');

          cy.get('[data-testid="field-incidentDate"]')
            .type('2024-12-01');

          // Submit form
          cy.get('[data-testid="submit-intake-button"]')
            .click();
        });

      cy.wait('@submitIntake');

      // Verify success message
      cy.get('[data-testid="intake-success-message"]')
        .should('be.visible')
        .and('contain', 'Thank you for submitting your information');

      cy.get('[data-testid="confirmation-number"]')
        .should('be.visible');
    });

    it('should validate required fields on intake form', () => {
      cy.wait('@getIntakeTemplate');

      // Try to submit without filling required fields
      cy.get('[data-testid="submit-intake-button"]')
        .should('be.disabled');

      // Fill only some required fields
      cy.get('[data-testid="field-firstName"]')
        .type('Jennifer');

      cy.get('[data-testid="submit-intake-button"]')
        .should('be.disabled');

      // Fill all required fields
      cy.get('[data-testid="field-lastName"]')
        .type('Williams');

      cy.get('[data-testid="field-email"]')
        .type('jwilliams@email.com');

      cy.get('[data-testid="field-phone"]')
        .type('(555) 345-6789');

      cy.get('[data-testid="field-caseType"]')
        .select('Personal Injury');

      cy.get('[data-testid="field-caseDescription"]')
        .type('Case description');

      // Now should be enabled
      cy.get('[data-testid="submit-intake-button"]')
        .should('be.enabled');
    });

    it('should save draft intake form', () => {
      cy.intercept('POST', '/api/crm/intake/draft', {
        statusCode: 200,
        body: {
          draftId: 'draft-001',
          saved: true
        }
      }).as('saveDraft');

      cy.wait('@getIntakeTemplate');

      // Fill some fields
      cy.get('[data-testid="field-firstName"]')
        .type('Jennifer');

      cy.get('[data-testid="field-email"]')
        .type('jwilliams@email.com');

      // Click save draft
      cy.get('[data-testid="save-draft-button"]')
        .click();

      cy.wait('@saveDraft');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Draft saved');
    });

    it('should attach documents to intake form', () => {
      cy.wait('@getIntakeTemplate');

      // Fill required fields
      cy.get('[data-testid="field-firstName"]').type('Jennifer');
      cy.get('[data-testid="field-lastName"]').type('Williams');
      cy.get('[data-testid="field-email"]').type('jwilliams@email.com');
      cy.get('[data-testid="field-phone"]').type('(555) 345-6789');
      cy.get('[data-testid="field-caseType"]').select('Personal Injury');
      cy.get('[data-testid="field-caseDescription"]').type('Description');

      // Attach documents
      cy.get('[data-testid="intake-document-upload"]')
        .selectFile('cypress/fixtures/sample-document.pdf', { force: true });

      // Verify file listed
      cy.get('[data-testid="attached-files-list"]')
        .should('contain', 'sample-document.pdf');
    });
  });

  describe('Conflict Check', () => {
    beforeEach(() => {
      cy.visit('/#/crm/conflict-check');
    });

    it('should perform conflict check for new matter', () => {
      // Mock conflict check API
      cy.intercept('POST', '/api/crm/conflict-check', {
        statusCode: 200,
        body: {
          checkId: 'check-001',
          status: 'Clear',
          conflicts: [],
          checkedAt: new Date().toISOString()
        }
      }).as('conflictCheck');

      cy.get('[data-testid="conflict-check-form"]')
        .within(() => {
          // Enter client information
          cy.get('[data-testid="check-client-name-input"]')
            .type('Jennifer Williams');

          cy.get('[data-testid="check-matter-description-textarea"]')
            .type('Personal injury matter - car accident');

          // Enter opposing parties
          cy.get('[data-testid="add-opposing-party-button"]')
            .click();

          cy.get('[data-testid="opposing-party-name-input"]')
            .type('ABC Insurance Company');

          cy.get('[data-testid="confirm-add-party-button"]')
            .click();

          // Add another opposing party
          cy.get('[data-testid="add-opposing-party-button"]')
            .click();

          cy.get('[data-testid="opposing-party-name-input"]')
            .type('Robert Thompson');

          cy.get('[data-testid="confirm-add-party-button"]')
            .click();

          // Run conflict check
          cy.get('[data-testid="run-conflict-check-button"]')
            .click();
        });

      cy.wait('@conflictCheck');

      // Verify results
      cy.get('[data-testid="conflict-check-results"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="check-status"]')
            .should('contain', 'Clear')
            .and('have.class', 'status-clear');

          cy.get('[data-testid="no-conflicts-message"]')
            .should('contain', 'No conflicts found');
        });
    });

    it('should identify conflicts when found', () => {
      cy.intercept('POST', '/api/crm/conflict-check', {
        statusCode: 200,
        body: {
          checkId: 'check-002',
          status: 'Conflict',
          conflicts: [
            {
              type: 'opposing_party',
              description: 'ABC Insurance Company is a current client',
              severity: 'high',
              relatedCase: 'Johnson v. XYZ Corp',
              details: 'We currently represent ABC Insurance in another matter'
            },
            {
              type: 'related_party',
              description: 'Robert Thompson related to former client',
              severity: 'medium',
              details: 'Robert Thompson is listed as contact for former client Thompson Industries'
            }
          ],
          checkedAt: new Date().toISOString()
        }
      }).as('conflictCheck');

      cy.get('[data-testid="check-client-name-input"]')
        .type('Jennifer Williams');

      cy.get('[data-testid="check-matter-description-textarea"]')
        .type('Personal injury matter');

      cy.get('[data-testid="add-opposing-party-button"]').click();
      cy.get('[data-testid="opposing-party-name-input"]')
        .type('ABC Insurance Company');
      cy.get('[data-testid="confirm-add-party-button"]').click();

      cy.get('[data-testid="run-conflict-check-button"]').click();

      cy.wait('@conflictCheck');

      // Verify conflict results
      cy.get('[data-testid="conflict-check-results"]')
        .within(() => {
          cy.get('[data-testid="check-status"]')
            .should('contain', 'Conflict')
            .and('have.class', 'status-conflict');

          // Verify conflicts listed
          cy.get('[data-testid="conflict-item"]')
            .should('have.length', 2);

          // Verify high severity conflict highlighted
          cy.get('[data-testid="conflict-item"]')
            .first()
            .should('contain', 'ABC Insurance Company is a current client')
            .within(() => {
              cy.get('[data-testid="severity-badge"]')
                .should('contain', 'High')
                .and('have.class', 'severity-high');
            });
        });
    });

    it('should request waiver for identified conflicts', () => {
      // Mock conflict check with conflicts
      cy.intercept('POST', '/api/crm/conflict-check', {
        statusCode: 200,
        body: {
          checkId: 'check-002',
          status: 'Conflict',
          conflicts: [
            {
              type: 'opposing_party',
              description: 'Potential conflict identified'
            }
          ]
        }
      }).as('conflictCheck');

      // Mock waiver request
      cy.intercept('POST', '/api/crm/conflict-check/check-002/request-waiver', {
        statusCode: 200,
        body: {
          waiverId: 'waiver-001',
          status: 'Pending'
        }
      }).as('requestWaiver');

      cy.get('[data-testid="check-client-name-input"]')
        .type('Test Client');

      cy.get('[data-testid="run-conflict-check-button"]').click();
      cy.wait('@conflictCheck');

      // Click request waiver button
      cy.get('[data-testid="request-waiver-button"]')
        .click();

      // Fill waiver request form
      cy.get('[data-testid="waiver-request-modal"]')
        .within(() => {
          cy.get('[data-testid="waiver-justification-textarea"]')
            .type('Client has been informed of the potential conflict and wishes to proceed. Matter involves separate and unrelated legal issues.');

          cy.get('[data-testid="waiver-reviewer-select"]')
            .select('Managing Partner');

          cy.get('[data-testid="submit-waiver-request-button"]')
            .click();
        });

      cy.wait('@requestWaiver');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Waiver request submitted');
    });

    it('should save conflict check report', () => {
      cy.intercept('POST', '/api/crm/conflict-check', {
        statusCode: 200,
        body: {
          checkId: 'check-001',
          status: 'Clear'
        }
      }).as('conflictCheck');

      cy.intercept('POST', '/api/crm/conflict-check/check-001/save-report', {
        statusCode: 200,
        body: {
          reportUrl: 'https://example.com/conflict-report.pdf'
        }
      }).as('saveReport');

      cy.get('[data-testid="check-client-name-input"]')
        .type('Test Client');

      cy.get('[data-testid="run-conflict-check-button"]').click();
      cy.wait('@conflictCheck');

      // Save report
      cy.get('[data-testid="save-conflict-report-button"]')
        .click();

      cy.wait('@saveReport');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Conflict check report saved');
    });
  });

  describe('Client Search and Filtering', () => {
    beforeEach(() => {
      cy.intercept('GET', '/api/crm/clients*', {
        statusCode: 200,
        body: [
          {
            id: 'client-001',
            name: 'Michael Anderson',
            type: 'Individual',
            email: 'manderson@email.com',
            status: 'Active',
            source: 'Referral'
          },
          {
            id: 'client-002',
            name: 'TechStart Industries LLC',
            type: 'Business',
            email: 'contact@techstart.com',
            status: 'Active',
            source: 'Website'
          },
          {
            id: 'client-003',
            name: 'Jennifer Williams',
            type: 'Individual',
            email: 'jwilliams@email.com',
            status: 'Lead',
            source: 'Intake Form'
          }
        ]
      }).as('getClients');

      cy.visit('/#/crm/clients');
      cy.wait('@getClients');
    });

    it('should search clients by name', () => {
      cy.intercept('GET', '/api/crm/clients*search=anderson*', {
        statusCode: 200,
        body: [
          {
            id: 'client-001',
            name: 'Michael Anderson'
          }
        ]
      }).as('searchClients');

      cy.get('[data-testid="client-search-input"]')
        .type('anderson');

      cy.wait(500); // Debounce
      cy.wait('@searchClients');

      cy.get('[data-testid="client-item"]')
        .should('have.length', 1)
        .and('contain', 'Michael Anderson');
    });

    it('should filter clients by type', () => {
      cy.get('[data-testid="client-type-filter"]')
        .select('Business');

      cy.get('[data-testid="client-item"]')
        .should('have.length', 1)
        .and('contain', 'TechStart Industries LLC');
    });

    it('should filter clients by status', () => {
      cy.get('[data-testid="client-status-filter"]')
        .select('Lead');

      cy.get('[data-testid="client-item"]')
        .should('have.length', 1)
        .and('contain', 'Jennifer Williams');
    });

    it('should filter clients by source', () => {
      cy.get('[data-testid="client-source-filter"]')
        .select('Referral');

      cy.get('[data-testid="client-item"]')
        .should('have.length', 1)
        .and('contain', 'Michael Anderson');
    });
  });

  describe('Lead Management', () => {
    it('should convert lead to client', () => {
      cy.intercept('GET', '/api/crm/clients/client-003', {
        statusCode: 200,
        body: {
          id: 'client-003',
          name: 'Jennifer Williams',
          status: 'Lead'
        }
      }).as('getClient');

      cy.intercept('POST', '/api/crm/clients/client-003/convert-to-client', {
        statusCode: 200,
        body: {
          id: 'client-003',
          status: 'Active'
        }
      }).as('convertLead');

      cy.visit('/#/crm/clients/client-003');
      cy.wait('@getClient');

      // Click convert to client button
      cy.get('[data-testid="convert-to-client-button"]')
        .click();

      // Confirm conversion
      cy.get('[data-testid="convert-confirmation-modal"]')
        .within(() => {
          cy.get('[data-testid="confirm-convert-button"]')
            .click();
        });

      cy.wait('@convertLead');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Lead converted to active client');

      // Verify status updated
      cy.get('[data-testid="client-status-badge"]')
        .should('contain', 'Active');
    });
  });
});
