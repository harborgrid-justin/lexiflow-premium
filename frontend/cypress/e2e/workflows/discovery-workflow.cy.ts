/// <reference types="cypress" />

/**
 * E2E Test Suite: Discovery Workflow
 *
 * Tests e-discovery and litigation support features including:
 * - Custodian management
 * - Collection creation and tracking
 * - Document review assignment
 * - Production creation and delivery
 * - Hold notice management
 */

describe('Discovery Workflow', () => {
  beforeEach(() => {
    cy.login('attorney@firm.com', 'password123');
    cy.setupTestUser('attorney');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Custodian Management', () => {
    beforeEach(() => {
      // Mock custodians API
      cy.intercept('GET', '/api/discovery/custodians*', {
        statusCode: 200,
        body: []
      }).as('getCustodians');

      cy.visit('/#/discovery/custodians');
      cy.wait('@getCustodians');
    });

    it('should add new custodian successfully', () => {
      // Mock create custodian API
      cy.intercept('POST', '/api/discovery/custodians', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `custodian-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createCustodian');

      // Click add custodian button
      cy.get('[data-testid="add-custodian-button"]')
        .click();

      // Verify custodian modal
      cy.get('[data-testid="custodian-modal"]')
        .should('be.visible')
        .within(() => {
          // Fill custodian information
          cy.get('[data-testid="custodian-name-input"]')
            .type('Sarah Johnson');

          cy.get('[data-testid="custodian-email-input"]')
            .type('sjohnson@company.com');

          cy.get('[data-testid="custodian-title-input"]')
            .type('Senior Vice President, Operations');

          cy.get('[data-testid="custodian-department-input"]')
            .type('Operations');

          cy.get('[data-testid="custodian-location-input"]')
            .type('San Francisco Office');

          // Associate with case
          cy.get('[data-testid="custodian-case-select"]')
            .select('Smith v. Johnson Industries');

          // Add notes
          cy.get('[data-testid="custodian-notes-textarea"]')
            .type('Key custodian - supervised workplace safety department during relevant time period');

          // Save custodian
          cy.get('[data-testid="save-custodian-button"]')
            .click();
        });

      cy.wait('@createCustodian');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Custodian added successfully');

      // Verify custodian appears in list
      cy.get('[data-testid="custodian-list"]')
        .should('contain', 'Sarah Johnson')
        .and('contain', 'sjohnson@company.com')
        .and('contain', 'Senior Vice President, Operations');
    });

    it('should send legal hold notice to custodian', () => {
      // Mock custodian with data
      cy.intercept('GET', '/api/discovery/custodians*', {
        statusCode: 200,
        body: [
          {
            id: 'custodian-001',
            name: 'Sarah Johnson',
            email: 'sjohnson@company.com',
            title: 'Senior Vice President',
            holdStatus: 'Not Sent'
          }
        ]
      }).as('getCustodians');

      // Mock send hold notice API
      cy.intercept('POST', '/api/discovery/custodians/custodian-001/hold-notice', {
        statusCode: 200,
        body: {
          id: 'hold-001',
          sentAt: new Date().toISOString(),
          status: 'Sent'
        }
      }).as('sendHoldNotice');

      cy.reload();
      cy.wait('@getCustodians');

      // Click send hold notice
      cy.get('[data-testid="custodian-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="send-hold-notice-button"]')
            .click();
        });

      // Verify hold notice modal
      cy.get('[data-testid="hold-notice-modal"]')
        .should('be.visible')
        .within(() => {
          // Verify custodian info
          cy.get('[data-testid="hold-recipient"]')
            .should('contain', 'Sarah Johnson')
            .and('contain', 'sjohnson@company.com');

          // Select hold template
          cy.get('[data-testid="hold-template-select"]')
            .select('Standard Litigation Hold');

          // Preview hold notice
          cy.get('[data-testid="hold-preview"]')
            .should('be.visible')
            .and('contain', 'Legal Hold Notice');

          // Customize message
          cy.get('[data-testid="hold-custom-message-textarea"]')
            .type('This matter relates to workplace safety incidents from 2023-2024.');

          // Send notice
          cy.get('[data-testid="send-hold-button"]')
            .click();
        });

      cy.wait('@sendHoldNotice');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Hold notice sent successfully');

      // Verify status updated
      cy.get('[data-testid="custodian-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="hold-status-badge"]')
            .should('contain', 'Sent');
        });
    });

    it('should track hold notice acknowledgment', () => {
      // Mock custodian with sent hold
      cy.intercept('GET', '/api/discovery/custodians*', {
        statusCode: 200,
        body: [
          {
            id: 'custodian-001',
            name: 'Sarah Johnson',
            email: 'sjohnson@company.com',
            holdStatus: 'Sent',
            holdSentAt: '2024-12-15T10:00:00Z',
            holdAcknowledged: false
          }
        ]
      }).as('getCustodians');

      // Mock acknowledgment API
      cy.intercept('GET', '/api/discovery/custodians/custodian-001/hold-status', {
        statusCode: 200,
        body: {
          status: 'Acknowledged',
          acknowledgedAt: '2024-12-16T14:30:00Z',
          acknowledgedBy: 'Sarah Johnson'
        }
      }).as('getHoldStatus');

      cy.reload();
      cy.wait('@getCustodians');

      // Click to view hold status
      cy.get('[data-testid="custodian-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="view-hold-status-button"]')
            .click();
        });

      cy.wait('@getHoldStatus');

      // Verify hold status details
      cy.get('[data-testid="hold-status-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="hold-sent-date"]')
            .should('contain', '12/15/2024');

          cy.get('[data-testid="hold-acknowledgment-status"]')
            .should('contain', 'Acknowledged');

          cy.get('[data-testid="hold-acknowledged-date"]')
            .should('contain', '12/16/2024');
        });
    });

    it('should send reminder for unacknowledged hold notices', () => {
      cy.intercept('GET', '/api/discovery/custodians*', {
        statusCode: 200,
        body: [
          {
            id: 'custodian-001',
            name: 'Sarah Johnson',
            holdStatus: 'Sent',
            holdAcknowledged: false,
            holdSentAt: '2024-12-10T10:00:00Z'
          }
        ]
      }).as('getCustodians');

      cy.intercept('POST', '/api/discovery/custodians/custodian-001/hold-reminder', {
        statusCode: 200,
        body: { success: true }
      }).as('sendReminder');

      cy.reload();
      cy.wait('@getCustodians');

      cy.get('[data-testid="custodian-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="send-reminder-button"]')
            .click();
        });

      cy.wait('@sendReminder');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Reminder sent successfully');
    });

    it('should filter custodians by hold status', () => {
      cy.intercept('GET', '/api/discovery/custodians*', {
        statusCode: 200,
        body: [
          {
            id: 'custodian-001',
            name: 'Sarah Johnson',
            holdStatus: 'Acknowledged'
          },
          {
            id: 'custodian-002',
            name: 'Michael Chen',
            holdStatus: 'Sent'
          },
          {
            id: 'custodian-003',
            name: 'Emily Davis',
            holdStatus: 'Not Sent'
          }
        ]
      }).as('getCustodians');

      cy.reload();
      cy.wait('@getCustodians');

      // Filter by acknowledged
      cy.get('[data-testid="hold-status-filter"]')
        .select('Acknowledged');

      cy.get('[data-testid="custodian-item"]')
        .should('have.length', 1)
        .and('contain', 'Sarah Johnson');
    });
  });

  describe('Collection Creation', () => {
    beforeEach(() => {
      // Mock collections API
      cy.intercept('GET', '/api/discovery/collections*', {
        statusCode: 200,
        body: []
      }).as('getCollections');

      cy.visit('/#/discovery/collections');
      cy.wait('@getCollections');
    });

    it('should create new collection', () => {
      // Mock create collection API
      cy.intercept('POST', '/api/discovery/collections', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `collection-${Date.now()}`,
            ...req.body,
            status: 'Initiated',
            createdAt: new Date().toISOString()
          }
        });
      }).as('createCollection');

      // Mock custodians for selection
      cy.intercept('GET', '/api/discovery/custodians*', {
        statusCode: 200,
        body: [
          {
            id: 'custodian-001',
            name: 'Sarah Johnson',
            email: 'sjohnson@company.com'
          },
          {
            id: 'custodian-002',
            name: 'Michael Chen',
            email: 'mchen@company.com'
          }
        ]
      }).as('getCustodians');

      cy.get('[data-testid="create-collection-button"]')
        .click();

      cy.get('[data-testid="collection-modal"]')
        .should('be.visible')
        .within(() => {
          // Basic information
          cy.get('[data-testid="collection-name-input"]')
            .type('Initial Document Collection - Q4 2023');

          cy.get('[data-testid="collection-case-select"]')
            .select('Smith v. Johnson Industries');

          cy.get('[data-testid="collection-description-textarea"]')
            .type('Collection of emails and documents from key custodians for Q4 2023');

          // Select custodians
          cy.get('[data-testid="select-custodians-button"]')
            .click();
        });

      cy.wait('@getCustodians');

      // Select custodians from list
      cy.get('[data-testid="custodian-selection-modal"]')
        .within(() => {
          cy.get('[data-testid="custodian-checkbox-custodian-001"]')
            .check();

          cy.get('[data-testid="custodian-checkbox-custodian-002"]')
            .check();

          cy.get('[data-testid="confirm-custodians-button"]')
            .click();
        });

      // Set collection parameters
      cy.get('[data-testid="collection-modal"]')
        .within(() => {
          // Date range
          cy.get('[data-testid="collection-date-from"]')
            .type('2023-10-01');

          cy.get('[data-testid="collection-date-to"]')
            .type('2023-12-31');

          // Data sources
          cy.get('[data-testid="source-email"]').check();
          cy.get('[data-testid="source-documents"]').check();
          cy.get('[data-testid="source-sharepoint"]').check();

          // Keywords (optional)
          cy.get('[data-testid="collection-keywords-input"]')
            .type('safety, incident, report, accident');

          // Create collection
          cy.get('[data-testid="create-collection-submit-button"]')
            .click();
        });

      cy.wait('@createCollection');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Collection created successfully');

      // Verify collection appears in list
      cy.get('[data-testid="collection-list"]')
        .should('contain', 'Initial Document Collection - Q4 2023')
        .and('contain', 'Initiated');
    });

    it('should monitor collection progress', () => {
      // Mock collection with progress
      cy.intercept('GET', '/api/discovery/collections*', {
        statusCode: 200,
        body: [
          {
            id: 'collection-001',
            name: 'Initial Document Collection - Q4 2023',
            status: 'In Progress',
            progress: 65,
            itemsCollected: 1250,
            estimatedTotal: 1900,
            startedAt: '2024-12-20T10:00:00Z'
          }
        ]
      }).as('getCollections');

      cy.reload();
      cy.wait('@getCollections');

      // Verify collection card shows progress
      cy.get('[data-testid="collection-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="collection-status"]')
            .should('contain', 'In Progress');

          cy.get('[data-testid="collection-progress-bar"]')
            .should('be.visible')
            .and('have.attr', 'aria-valuenow', '65');

          cy.get('[data-testid="items-collected"]')
            .should('contain', '1,250');

          cy.get('[data-testid="estimated-total"]')
            .should('contain', '1,900');
        });
    });

    it('should view collection details', () => {
      // Mock collection detail API
      cy.intercept('GET', '/api/discovery/collections/collection-001', {
        statusCode: 200,
        body: {
          id: 'collection-001',
          name: 'Initial Document Collection - Q4 2023',
          status: 'Completed',
          caseId: 'case-001',
          caseName: 'Smith v. Johnson Industries',
          custodians: [
            { id: 'custodian-001', name: 'Sarah Johnson', itemsCollected: 850 },
            { id: 'custodian-002', name: 'Michael Chen', itemsCollected: 650 }
          ],
          dateRange: {
            from: '2023-10-01',
            to: '2023-12-31'
          },
          dataSources: ['Email', 'Documents', 'SharePoint'],
          totalItems: 1500,
          totalSize: '15.2 GB',
          completedAt: '2024-12-20T18:45:00Z'
        }
      }).as('getCollectionDetail');

      cy.intercept('GET', '/api/discovery/collections*', {
        statusCode: 200,
        body: [
          {
            id: 'collection-001',
            name: 'Initial Document Collection - Q4 2023',
            status: 'Completed'
          }
        ]
      }).as('getCollections');

      cy.reload();
      cy.wait('@getCollections');

      // Click to view details
      cy.get('[data-testid="collection-item"]')
        .first()
        .click();

      cy.wait('@getCollectionDetail');

      // Verify detail view
      cy.get('[data-testid="collection-detail-panel"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="collection-name"]')
            .should('contain', 'Initial Document Collection - Q4 2023');

          cy.get('[data-testid="collection-status"]')
            .should('contain', 'Completed');

          cy.get('[data-testid="total-items"]')
            .should('contain', '1,500');

          cy.get('[data-testid="total-size"]')
            .should('contain', '15.2 GB');

          // Verify custodian breakdown
          cy.get('[data-testid="custodian-breakdown"]')
            .should('contain', 'Sarah Johnson')
            .and('contain', '850')
            .and('contain', 'Michael Chen')
            .and('contain', '650');
        });
    });

    it('should export collection data', () => {
      cy.intercept('GET', '/api/discovery/collections*', {
        statusCode: 200,
        body: [
          {
            id: 'collection-001',
            name: 'Initial Document Collection - Q4 2023',
            status: 'Completed'
          }
        ]
      }).as('getCollections');

      cy.intercept('POST', '/api/discovery/collections/collection-001/export', {
        statusCode: 200,
        body: {
          exportId: 'export-001',
          status: 'Processing'
        }
      }).as('exportCollection');

      cy.reload();
      cy.wait('@getCollections');

      cy.get('[data-testid="collection-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="collection-menu"]').click();
        });

      cy.get('[data-testid="export-collection-option"]')
        .click();

      // Select export format
      cy.get('[data-testid="export-format-select"]')
        .select('Native Files with Load File');

      cy.get('[data-testid="confirm-export-button"]')
        .click();

      cy.wait('@exportCollection');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Export initiated');
    });
  });

  describe('Review Assignment', () => {
    beforeEach(() => {
      cy.visit('/#/discovery/review');

      // Mock review sets API
      cy.intercept('GET', '/api/discovery/review-sets*', {
        statusCode: 200,
        body: []
      }).as('getReviewSets');
    });

    it('should create document review assignment', () => {
      // Mock create review set API
      cy.intercept('POST', '/api/discovery/review-sets', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `review-set-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createReviewSet');

      // Mock team members
      cy.intercept('GET', '/api/team/members', {
        statusCode: 200,
        body: [
          { id: 'user-001', name: 'Jane Doe', role: 'Attorney' },
          { id: 'user-002', name: 'Robert Chen', role: 'Attorney' },
          { id: 'user-003', name: 'Lisa Park', role: 'Paralegal' }
        ]
      }).as('getTeamMembers');

      cy.get('[data-testid="create-review-set-button"]')
        .click();

      cy.get('[data-testid="review-set-modal"]')
        .should('be.visible')
        .within(() => {
          // Review set details
          cy.get('[data-testid="review-set-name-input"]')
            .type('First Pass Review - Hot Documents');

          cy.get('[data-testid="review-set-case-select"]')
            .select('Smith v. Johnson Industries');

          cy.get('[data-testid="review-set-description-textarea"]')
            .type('Initial review focusing on hot documents and privilege identification');

          // Document selection criteria
          cy.get('[data-testid="review-collection-select"]')
            .select('Initial Document Collection - Q4 2023');

          cy.get('[data-testid="review-date-from"]')
            .type('2023-11-01');

          cy.get('[data-testid="review-date-to"]')
            .type('2023-11-30');

          // Assign reviewers
          cy.get('[data-testid="add-reviewer-button"]')
            .click();
        });

      cy.wait('@getTeamMembers');

      // Select reviewers
      cy.get('[data-testid="reviewer-select"]')
        .select('Lisa Park');

      cy.get('[data-testid="reviewer-document-count"]')
        .type('500');

      cy.get('[data-testid="confirm-add-reviewer"]')
        .click();

      // Set review deadline
      cy.get('[data-testid="review-set-modal"]')
        .within(() => {
          cy.get('[data-testid="review-deadline-input"]')
            .type('2024-12-31');

          cy.get('[data-testid="create-review-set-submit"]')
            .click();
        });

      cy.wait('@createReviewSet');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Review set created successfully');
    });

    it('should track review progress', () => {
      // Mock review set with progress
      cy.intercept('GET', '/api/discovery/review-sets*', {
        statusCode: 200,
        body: [
          {
            id: 'review-set-001',
            name: 'First Pass Review - Hot Documents',
            totalDocuments: 500,
            reviewedDocuments: 325,
            progress: 65,
            assignedTo: [
              {
                reviewer: 'Lisa Park',
                assigned: 500,
                reviewed: 325,
                progress: 65
              }
            ],
            deadline: '2024-12-31',
            status: 'In Progress'
          }
        ]
      }).as('getReviewSets');

      cy.reload();
      cy.wait('@getReviewSets');

      cy.get('[data-testid="review-set-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="review-progress-bar"]')
            .should('have.attr', 'aria-valuenow', '65');

          cy.get('[data-testid="documents-reviewed"]')
            .should('contain', '325 / 500');

          cy.get('[data-testid="reviewer-name"]')
            .should('contain', 'Lisa Park');
        });
    });

    it('should view review statistics', () => {
      cy.intercept('GET', '/api/discovery/review-sets/review-set-001/stats', {
        statusCode: 200,
        body: {
          totalDocuments: 500,
          reviewed: 325,
          responsive: 145,
          nonResponsive: 160,
          privileged: 20,
          avgReviewTime: 2.5,
          reviewerStats: [
            {
              reviewer: 'Lisa Park',
              reviewed: 325,
              avgTime: 2.5,
              responsive: 145,
              privileged: 20
            }
          ]
        }
      }).as('getReviewStats');

      cy.intercept('GET', '/api/discovery/review-sets*', {
        statusCode: 200,
        body: [
          {
            id: 'review-set-001',
            name: 'First Pass Review - Hot Documents'
          }
        ]
      }).as('getReviewSets');

      cy.reload();
      cy.wait('@getReviewSets');

      cy.get('[data-testid="review-set-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="view-stats-button"]')
            .click();
        });

      cy.wait('@getReviewStats');

      cy.get('[data-testid="review-stats-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="total-reviewed"]')
            .should('contain', '325');

          cy.get('[data-testid="responsive-count"]')
            .should('contain', '145');

          cy.get('[data-testid="privileged-count"]')
            .should('contain', '20');

          cy.get('[data-testid="avg-review-time"]')
            .should('contain', '2.5');
        });
    });
  });

  describe('Production Creation', () => {
    beforeEach(() => {
      cy.visit('/#/discovery/productions');

      cy.intercept('GET', '/api/discovery/productions*', {
        statusCode: 200,
        body: []
      }).as('getProductions');
    });

    it('should create document production', () => {
      cy.intercept('POST', '/api/discovery/productions', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `production-${Date.now()}`,
            productionNumber: 'PROD-001',
            ...req.body,
            createdAt: new Date().toISOString()
          }
        });
      }).as('createProduction');

      cy.get('[data-testid="create-production-button"]')
        .click();

      cy.get('[data-testid="production-modal"]')
        .should('be.visible')
        .within(() => {
          // Production details
          cy.get('[data-testid="production-name-input"]')
            .type('Initial Production to Plaintiff');

          cy.get('[data-testid="production-case-select"]')
            .select('Smith v. Johnson Industries');

          cy.get('[data-testid="production-recipient-input"]')
            .type("Plaintiff's Counsel");

          // Select documents
          cy.get('[data-testid="production-review-set-select"]')
            .select('First Pass Review - Hot Documents');

          // Apply filters
          cy.get('[data-testid="production-filter-responsive"]')
            .check();

          cy.get('[data-testid="production-exclude-privileged"]')
            .check();

          // Set production format
          cy.get('[data-testid="production-format-select"]')
            .select('Native Files with Load File');

          cy.get('[data-testid="production-bates-prefix"]')
            .type('DEF');

          cy.get('[data-testid="production-bates-start"]')
            .type('00001');

          // Set delivery method
          cy.get('[data-testid="production-delivery-select"]')
            .select('Secure File Transfer');

          cy.get('[data-testid="create-production-submit"]')
            .click();
        });

      cy.wait('@createProduction');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Production created successfully');
    });

    it('should track production preparation progress', () => {
      cy.intercept('GET', '/api/discovery/productions*', {
        statusCode: 200,
        body: [
          {
            id: 'production-001',
            productionNumber: 'PROD-001',
            name: 'Initial Production to Plaintiff',
            status: 'Processing',
            progress: 45,
            documentCount: 125,
            estimatedCompletion: '2024-12-21T10:00:00Z'
          }
        ]
      }).as('getProductions');

      cy.reload();
      cy.wait('@getProductions');

      cy.get('[data-testid="production-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="production-number"]')
            .should('contain', 'PROD-001');

          cy.get('[data-testid="production-status"]')
            .should('contain', 'Processing');

          cy.get('[data-testid="production-progress-bar"]')
            .should('have.attr', 'aria-valuenow', '45');

          cy.get('[data-testid="document-count"]')
            .should('contain', '125');
        });
    });

    it('should download completed production', () => {
      cy.intercept('GET', '/api/discovery/productions*', {
        statusCode: 200,
        body: [
          {
            id: 'production-001',
            productionNumber: 'PROD-001',
            name: 'Initial Production to Plaintiff',
            status: 'Completed',
            documentCount: 125,
            completedAt: '2024-12-20T18:30:00Z'
          }
        ]
      }).as('getProductions');

      cy.reload();
      cy.wait('@getProductions');

      cy.get('[data-testid="production-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="download-production-button"]')
            .click();
        });

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Download started');
    });

    it('should generate production transmittal letter', () => {
      cy.intercept('GET', '/api/discovery/productions*', {
        statusCode: 200,
        body: [
          {
            id: 'production-001',
            productionNumber: 'PROD-001',
            status: 'Completed'
          }
        ]
      }).as('getProductions');

      cy.intercept('POST', '/api/discovery/productions/production-001/transmittal', {
        statusCode: 200,
        body: {
          documentUrl: 'https://example.com/transmittal.pdf'
        }
      }).as('generateTransmittal');

      cy.reload();
      cy.wait('@getProductions');

      cy.get('[data-testid="production-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="production-menu"]').click();
        });

      cy.get('[data-testid="generate-transmittal-option"]')
        .click();

      cy.wait('@generateTransmittal');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Transmittal letter generated');

      // Verify download option appears
      cy.get('[data-testid="download-transmittal-button"]')
        .should('be.visible');
    });
  });

  describe('Discovery Dashboard', () => {
    it('should display discovery overview metrics', () => {
      cy.intercept('GET', '/api/discovery/dashboard', {
        statusCode: 200,
        body: {
          totalCustodians: 12,
          holdsSent: 10,
          holdsAcknowledged: 8,
          activeCollections: 2,
          documentsCollected: 15250,
          reviewProgress: 65,
          activeProductions: 1,
          completedProductions: 3
        }
      }).as('getDashboard');

      cy.visit('/#/discovery/dashboard');
      cy.wait('@getDashboard');

      // Verify metrics
      cy.get('[data-testid="total-custodians-metric"]')
        .should('contain', '12');

      cy.get('[data-testid="holds-sent-metric"]')
        .should('contain', '10');

      cy.get('[data-testid="holds-acknowledged-metric"]')
        .should('contain', '8');

      cy.get('[data-testid="documents-collected-metric"]')
        .should('contain', '15,250');

      cy.get('[data-testid="review-progress-metric"]')
        .should('contain', '65%');
    });
  });
});
