/// <reference types="cypress" />

/**
 * E2E Test Suite: Document Management Workflow
 *
 * Tests document management features including:
 * - Document upload (single and bulk)
 * - Document preview and viewing
 * - Document search and filtering
 * - Version history tracking
 * - Document sharing and permissions
 */

describe('Document Management Workflow', () => {
  beforeEach(() => {
    cy.login('attorney@firm.com', 'password123');
    cy.setupTestUser('attorney');

    // Mock documents API
    cy.intercept('GET', '/api/documents*', {
      fixture: 'documents.json'
    }).as('getDocuments');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Document Upload', () => {
    beforeEach(() => {
      // Mock document upload API
      cy.intercept('POST', '/api/documents/upload', (req) => {
        req.reply({
          statusCode: 201,
          body: {
            id: `doc-${Date.now()}`,
            name: req.body.name || 'uploaded-document.pdf',
            size: 1024000,
            type: 'application/pdf',
            uploadedBy: 'Jane Doe',
            uploadedAt: new Date().toISOString(),
            caseId: req.body.caseId
          }
        });
      }).as('uploadDocument');
    });

    it('should upload a single document successfully', () => {
      // Navigate to documents page
      cy.visit('/#/documents');
      cy.url().should('include', '/documents');

      // Click upload button
      cy.get('[data-testid="upload-document-button"]')
        .click();

      // Verify upload modal appears
      cy.get('[data-testid="upload-modal"]')
        .should('be.visible');

      // Upload file
      cy.get('[data-testid="file-input"]')
        .selectFile('cypress/fixtures/sample-document.pdf', { force: true });

      // Fill document metadata
      cy.get('[data-testid="document-name-input"]')
        .clear()
        .type('Complaint - Final Draft');

      cy.get('[data-testid="document-category-select"]')
        .select('Pleadings');

      cy.get('[data-testid="document-case-select"]')
        .select('Smith v. Johnson Industries');

      cy.get('[data-testid="document-description-textarea"]')
        .type('Final complaint ready for filing');

      // Submit upload
      cy.get('[data-testid="confirm-upload-button"]')
        .click();

      // Verify upload progress
      cy.get('[data-testid="upload-progress-bar"]')
        .should('be.visible');

      // Wait for upload to complete
      cy.wait('@uploadDocument');

      // Verify success notification
      cy.get('[data-testid="toast-notification"]')
        .should('be.visible')
        .and('contain', 'Document uploaded successfully');

      // Verify document appears in list
      cy.get('[data-testid="document-list"]')
        .should('contain', 'Complaint - Final Draft');
    });

    it('should upload multiple documents in bulk', () => {
      cy.visit('/#/documents');

      cy.get('[data-testid="upload-document-button"]').click();

      // Select multiple files
      cy.get('[data-testid="file-input"]')
        .selectFile([
          'cypress/fixtures/sample-document.pdf',
          'cypress/fixtures/sample-image.jpg',
          'cypress/fixtures/sample-spreadsheet.xlsx'
        ], { force: true });

      // Verify multiple files listed
      cy.get('[data-testid="upload-file-list"]')
        .find('[data-testid="upload-file-item"]')
        .should('have.length', 3);

      // Set bulk metadata
      cy.get('[data-testid="bulk-category-select"]')
        .select('Discovery');

      cy.get('[data-testid="bulk-case-select"]')
        .select('Smith v. Johnson Industries');

      // Start upload
      cy.get('[data-testid="confirm-upload-button"]')
        .click();

      // Verify all uploads complete
      cy.get('[data-testid="upload-file-item"]')
        .each(($item) => {
          cy.wrap($item)
            .find('[data-testid="upload-status"]')
            .should('contain', 'Complete');
        });

      // Verify success notification
      cy.get('[data-testid="toast-notification"]')
        .should('contain', '3 documents uploaded successfully');
    });

    it('should validate file size and type restrictions', () => {
      cy.visit('/#/documents');
      cy.get('[data-testid="upload-document-button"]').click();

      // Mock oversized file
      cy.intercept('POST', '/api/documents/upload', {
        statusCode: 413,
        body: { error: 'File size exceeds maximum limit of 50MB' }
      }).as('uploadError');

      cy.get('[data-testid="file-input"]')
        .selectFile('cypress/fixtures/large-file.pdf', { force: true });

      cy.get('[data-testid="confirm-upload-button"]').click();

      // Verify error message
      cy.get('[data-testid="upload-error"]')
        .should('be.visible')
        .and('contain', 'File size exceeds maximum limit');
    });

    it('should allow drag and drop file upload', () => {
      cy.visit('/#/documents');
      cy.get('[data-testid="upload-document-button"]').click();

      // Verify drop zone is visible
      cy.get('[data-testid="file-drop-zone"]')
        .should('be.visible')
        .and('contain', 'Drag and drop files here');

      // Simulate file drop
      cy.get('[data-testid="file-drop-zone"]')
        .selectFile('cypress/fixtures/sample-document.pdf', {
          action: 'drag-drop',
          force: true
        });

      // Verify file added
      cy.get('[data-testid="upload-file-list"]')
        .should('contain', 'sample-document.pdf');
    });
  });

  describe('Document Preview', () => {
    beforeEach(() => {
      cy.visit('/#/documents');
      cy.wait('@getDocuments');

      // Mock document preview API
      cy.intercept('GET', '/api/documents/*/preview', {
        statusCode: 200,
        body: {
          url: 'https://example.com/document-preview.pdf',
          type: 'application/pdf'
        }
      }).as('getPreview');
    });

    it('should preview PDF documents', () => {
      // Click on document to preview
      cy.get('[data-testid="document-item"]')
        .first()
        .click();

      // Verify preview modal opens
      cy.get('[data-testid="document-preview-modal"]')
        .should('be.visible');

      // Wait for preview to load
      cy.wait('@getPreview');

      // Verify PDF viewer displayed
      cy.get('[data-testid="pdf-viewer"]')
        .should('be.visible');

      // Test zoom controls
      cy.get('[data-testid="zoom-in-button"]')
        .click();

      cy.get('[data-testid="zoom-level"]')
        .should('contain', '110%');

      // Test page navigation
      cy.get('[data-testid="next-page-button"]')
        .click();

      cy.get('[data-testid="current-page"]')
        .should('contain', '2');
    });

    it('should preview images', () => {
      // Filter for image documents
      cy.get('[data-testid="document-type-filter"]')
        .select('Images');

      cy.get('[data-testid="document-item"]')
        .contains('.jpg')
        .click();

      // Verify image viewer
      cy.get('[data-testid="document-preview-modal"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="image-viewer"]')
            .should('be.visible');

          cy.get('img')
            .should('have.attr', 'src')
            .and('include', 'preview');
        });
    });

    it('should download document from preview', () => {
      cy.get('[data-testid="document-item"]').first().click();
      cy.wait('@getPreview');

      // Click download button
      cy.get('[data-testid="download-document-button"]')
        .click();

      // Verify download initiated (can't verify actual file download in Cypress)
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Download started');
    });

    it('should print document from preview', () => {
      cy.get('[data-testid="document-item"]').first().click();
      cy.wait('@getPreview');

      // Stub window.print
      cy.window().then((win) => {
        cy.stub(win, 'print').as('printStub');
      });

      // Click print button
      cy.get('[data-testid="print-document-button"]')
        .click();

      // Verify print dialog triggered
      cy.get('@printStub').should('have.been.called');
    });

    it('should close preview modal', () => {
      cy.get('[data-testid="document-item"]').first().click();
      cy.wait('@getPreview');

      // Click close button
      cy.get('[data-testid="close-preview-button"]')
        .click();

      // Verify modal closed
      cy.get('[data-testid="document-preview-modal"]')
        .should('not.exist');
    });
  });

  describe('Document Search', () => {
    beforeEach(() => {
      cy.visit('/#/documents');
      cy.wait('@getDocuments');
    });

    it('should search documents by name', () => {
      // Mock search API
      cy.intercept('GET', '/api/documents*search=complaint*', {
        statusCode: 200,
        body: [
          {
            id: 'doc-001',
            name: 'Complaint - Final Draft.pdf',
            type: 'application/pdf',
            size: 1024000,
            category: 'Pleadings'
          }
        ]
      }).as('searchDocuments');

      // Enter search query
      cy.get('[data-testid="document-search-input"]')
        .type('complaint');

      // Wait for debounced search
      cy.wait(500);
      cy.wait('@searchDocuments');

      // Verify search results
      cy.get('[data-testid="document-item"]')
        .should('have.length', 1)
        .and('contain', 'Complaint');
    });

    it('should filter documents by category', () => {
      // Select category filter
      cy.get('[data-testid="document-category-filter"]')
        .select('Pleadings');

      // Verify filtered results
      cy.get('[data-testid="document-item"]')
        .each(($item) => {
          cy.wrap($item)
            .find('[data-testid="document-category"]')
            .should('contain', 'Pleadings');
        });
    });

    it('should filter documents by date range', () => {
      // Open date filter
      cy.get('[data-testid="document-date-filter"]')
        .click();

      // Select date range
      cy.get('[data-testid="date-from-input"]')
        .type('2024-01-01');

      cy.get('[data-testid="date-to-input"]')
        .type('2024-12-31');

      cy.get('[data-testid="apply-date-filter"]')
        .click();

      // Verify URL updated
      cy.url()
        .should('include', 'dateFrom=2024-01-01')
        .and('include', 'dateTo=2024-12-31');
    });

    it('should filter documents by case', () => {
      // Select case filter
      cy.get('[data-testid="document-case-filter"]')
        .select('Smith v. Johnson Industries');

      // Verify filtered results
      cy.get('[data-testid="document-item"]')
        .should('have.length.greaterThan', 0);

      cy.get('[data-testid="filter-chip"]')
        .should('contain', 'Smith v. Johnson Industries');
    });

    it('should combine multiple filters', () => {
      // Apply multiple filters
      cy.get('[data-testid="document-category-filter"]')
        .select('Discovery');

      cy.get('[data-testid="document-case-filter"]')
        .select('Smith v. Johnson Industries');

      cy.get('[data-testid="document-search-input"]')
        .type('interrogatories');

      // Verify all filters active
      cy.get('[data-testid="active-filters"]')
        .should('contain', 'Discovery')
        .and('contain', 'Smith v. Johnson Industries');
    });

    it('should clear all filters', () => {
      // Apply filters
      cy.get('[data-testid="document-category-filter"]')
        .select('Discovery');

      cy.get('[data-testid="document-search-input"]')
        .type('test');

      // Clear filters
      cy.get('[data-testid="clear-all-filters-button"]')
        .click();

      // Verify filters cleared
      cy.get('[data-testid="document-search-input"]')
        .should('have.value', '');

      cy.get('[data-testid="active-filters"]')
        .should('not.exist');
    });
  });

  describe('Document Version History', () => {
    beforeEach(() => {
      // Mock version history API
      cy.intercept('GET', '/api/documents/doc-001/versions', {
        statusCode: 200,
        body: [
          {
            id: 'version-003',
            version: 3,
            name: 'Complaint - Final Draft v3.pdf',
            uploadedBy: 'Jane Doe',
            uploadedAt: '2024-12-20T10:00:00Z',
            size: 1024000,
            changes: 'Final edits before filing'
          },
          {
            id: 'version-002',
            version: 2,
            name: 'Complaint - Draft v2.pdf',
            uploadedBy: 'Robert Chen',
            uploadedAt: '2024-12-15T14:30:00Z',
            size: 1020000,
            changes: 'Added exhibits and updated damages section'
          },
          {
            id: 'version-001',
            version: 1,
            name: 'Complaint - Initial Draft.pdf',
            uploadedBy: 'Jane Doe',
            uploadedAt: '2024-12-10T09:15:00Z',
            size: 1000000,
            changes: 'Initial version'
          }
        ]
      }).as('getVersions');

      cy.visit('/#/documents');
      cy.wait('@getDocuments');
    });

    it('should display version history', () => {
      // Click on document
      cy.get('[data-testid="document-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="document-menu"]').click();
        });

      // Click version history option
      cy.get('[data-testid="view-versions-option"]')
        .click();

      // Wait for versions to load
      cy.wait('@getVersions');

      // Verify version history modal
      cy.get('[data-testid="version-history-modal"]')
        .should('be.visible')
        .within(() => {
          // Verify all versions displayed
          cy.get('[data-testid="version-item"]')
            .should('have.length', 3);

          // Verify latest version marked
          cy.get('[data-testid="version-item"]')
            .first()
            .should('contain', 'v3')
            .and('contain', 'Current')
            .and('contain', 'Jane Doe');
        });
    });

    it('should preview previous version', () => {
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="view-versions-option"]').click();
      cy.wait('@getVersions');

      // Mock preview for specific version
      cy.intercept('GET', '/api/documents/doc-001/versions/version-002/preview', {
        statusCode: 200,
        body: {
          url: 'https://example.com/document-v2-preview.pdf',
          type: 'application/pdf'
        }
      }).as('getVersionPreview');

      // Click preview on version 2
      cy.get('[data-testid="version-item"]')
        .contains('v2')
        .parent()
        .within(() => {
          cy.get('[data-testid="preview-version-button"]')
            .click();
        });

      cy.wait('@getVersionPreview');

      // Verify preview opens
      cy.get('[data-testid="document-preview-modal"]')
        .should('be.visible');
    });

    it('should restore previous version', () => {
      // Mock restore version API
      cy.intercept('POST', '/api/documents/doc-001/restore', {
        statusCode: 200,
        body: {
          id: 'doc-001',
          currentVersion: 4,
          message: 'Version restored successfully'
        }
      }).as('restoreVersion');

      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="view-versions-option"]').click();
      cy.wait('@getVersions');

      // Restore version 2
      cy.get('[data-testid="version-item"]')
        .contains('v2')
        .parent()
        .within(() => {
          cy.get('[data-testid="restore-version-button"]')
            .click();
        });

      // Confirm restoration
      cy.get('[data-testid="confirm-restore-dialog"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-button"]')
            .click();
        });

      cy.wait('@restoreVersion');

      // Verify success message
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Version restored successfully');
    });

    it('should download specific version', () => {
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="view-versions-option"]').click();
      cy.wait('@getVersions');

      // Download version 1
      cy.get('[data-testid="version-item"]')
        .contains('v1')
        .parent()
        .within(() => {
          cy.get('[data-testid="download-version-button"]')
            .click();
        });

      // Verify download notification
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Download started');
    });

    it('should compare two versions', () => {
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="view-versions-option"]').click();
      cy.wait('@getVersions');

      // Enable compare mode
      cy.get('[data-testid="enable-compare-mode"]')
        .click();

      // Select two versions to compare
      cy.get('[data-testid="version-item"]')
        .contains('v3')
        .parent()
        .find('[data-testid="version-checkbox"]')
        .check();

      cy.get('[data-testid="version-item"]')
        .contains('v2')
        .parent()
        .find('[data-testid="version-checkbox"]')
        .check();

      // Click compare button
      cy.get('[data-testid="compare-versions-button"]')
        .click();

      // Verify comparison view opens
      cy.get('[data-testid="version-comparison-modal"]')
        .should('be.visible');
    });
  });

  describe('Document Sharing', () => {
    beforeEach(() => {
      cy.visit('/#/documents');
      cy.wait('@getDocuments');

      // Mock sharing API
      cy.intercept('POST', '/api/documents/*/share', {
        statusCode: 200,
        body: {
          shareLink: 'https://lexiflow.com/shared/abc123',
          expiresAt: '2024-12-31T23:59:59Z'
        }
      }).as('shareDocument');

      // Mock team members API
      cy.intercept('GET', '/api/team/members', {
        statusCode: 200,
        body: [
          { id: 'user-001', name: 'Jane Doe', email: 'jane@firm.com' },
          { id: 'user-002', name: 'Robert Chen', email: 'robert@firm.com' },
          { id: 'user-003', name: 'Lisa Park', email: 'lisa@firm.com' }
        ]
      }).as('getTeamMembers');
    });

    it('should share document with team members', () => {
      // Open document menu
      cy.get('[data-testid="document-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="document-menu"]').click();
        });

      // Click share option
      cy.get('[data-testid="share-document-option"]')
        .click();

      cy.wait('@getTeamMembers');

      // Verify share modal
      cy.get('[data-testid="share-modal"]')
        .should('be.visible')
        .within(() => {
          // Select team members
          cy.get('[data-testid="share-user-select"]')
            .click();

          cy.get('[data-testid="user-option-user-002"]')
            .click();

          // Set permissions
          cy.get('[data-testid="permission-select"]')
            .select('View Only');

          // Add message
          cy.get('[data-testid="share-message-textarea"]')
            .type('Please review this document');

          // Share document
          cy.get('[data-testid="confirm-share-button"]')
            .click();
        });

      cy.wait('@shareDocument');

      // Verify success notification
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Document shared successfully');
    });

    it('should generate shareable link with expiration', () => {
      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="share-document-option"]').click();

      // Switch to link sharing tab
      cy.get('[data-testid="share-link-tab"]')
        .click();

      // Set link expiration
      cy.get('[data-testid="link-expiration-select"]')
        .select('7 days');

      // Set link permissions
      cy.get('[data-testid="link-permission-select"]')
        .select('View Only');

      // Generate link
      cy.get('[data-testid="generate-link-button"]')
        .click();

      cy.wait('@shareDocument');

      // Verify link displayed
      cy.get('[data-testid="share-link-input"]')
        .should('have.value')
        .and('include', 'https://lexiflow.com/shared/');

      // Test copy link button
      cy.get('[data-testid="copy-link-button"]')
        .click();

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Link copied to clipboard');
    });

    it('should revoke document access', () => {
      // Mock get shared users API
      cy.intercept('GET', '/api/documents/doc-001/shared-with', {
        statusCode: 200,
        body: [
          {
            userId: 'user-002',
            name: 'Robert Chen',
            email: 'robert@firm.com',
            permission: 'View Only',
            sharedAt: '2024-12-15T10:00:00Z'
          }
        ]
      }).as('getSharedWith');

      // Mock revoke access API
      cy.intercept('DELETE', '/api/documents/doc-001/share/user-002', {
        statusCode: 200,
        body: { success: true }
      }).as('revokeAccess');

      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="share-document-option"]').click();

      cy.wait('@getSharedWith');

      // Verify shared users list
      cy.get('[data-testid="shared-users-list"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="shared-user-item"]')
            .should('contain', 'Robert Chen')
            .within(() => {
              // Revoke access
              cy.get('[data-testid="revoke-access-button"]')
                .click();
            });
        });

      // Confirm revocation
      cy.get('[data-testid="confirm-revoke-dialog"]')
        .within(() => {
          cy.get('[data-testid="confirm-button"]').click();
        });

      cy.wait('@revokeAccess');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Access revoked successfully');
    });

    it('should update sharing permissions', () => {
      // Mock update permissions API
      cy.intercept('PATCH', '/api/documents/doc-001/share/user-002', {
        statusCode: 200,
        body: { success: true }
      }).as('updatePermissions');

      cy.intercept('GET', '/api/documents/doc-001/shared-with', {
        statusCode: 200,
        body: [
          {
            userId: 'user-002',
            name: 'Robert Chen',
            permission: 'View Only'
          }
        ]
      }).as('getSharedWith');

      cy.get('[data-testid="document-item"]').first()
        .find('[data-testid="document-menu"]').click();

      cy.get('[data-testid="share-document-option"]').click();
      cy.wait('@getSharedWith');

      // Update permissions
      cy.get('[data-testid="shared-user-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="permission-dropdown"]')
            .select('Can Edit');
        });

      cy.wait('@updatePermissions');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Permissions updated');
    });
  });

  describe('Document Organization', () => {
    it('should organize documents in folders', () => {
      cy.visit('/#/documents');
      cy.wait('@getDocuments');

      // Create new folder
      cy.get('[data-testid="create-folder-button"]')
        .click();

      cy.get('[data-testid="folder-name-input"]')
        .type('Discovery Documents');

      cy.get('[data-testid="confirm-create-folder"]')
        .click();

      // Verify folder created
      cy.get('[data-testid="folder-item"]')
        .should('contain', 'Discovery Documents');
    });

    it('should move documents to folders', () => {
      // Mock move document API
      cy.intercept('PATCH', '/api/documents/doc-001/move', {
        statusCode: 200,
        body: { success: true }
      }).as('moveDocument');

      cy.visit('/#/documents');
      cy.wait('@getDocuments');

      // Select document
      cy.get('[data-testid="document-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="document-menu"]').click();
        });

      // Click move option
      cy.get('[data-testid="move-document-option"]')
        .click();

      // Select destination folder
      cy.get('[data-testid="folder-select"]')
        .select('Discovery Documents');

      cy.get('[data-testid="confirm-move-button"]')
        .click();

      cy.wait('@moveDocument');

      // Verify success
      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Document moved successfully');
    });

    it('should delete documents', () => {
      // Mock delete API
      cy.intercept('DELETE', '/api/documents/doc-001', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteDocument');

      cy.visit('/#/documents');
      cy.wait('@getDocuments');

      cy.get('[data-testid="document-item"]')
        .first()
        .within(() => {
          cy.get('[data-testid="document-menu"]').click();
        });

      cy.get('[data-testid="delete-document-option"]')
        .click();

      // Confirm deletion
      cy.get('[data-testid="confirm-delete-dialog"]')
        .should('be.visible')
        .within(() => {
          cy.get('[data-testid="confirm-button"]')
            .click();
        });

      cy.wait('@deleteDocument');

      cy.get('[data-testid="toast-notification"]')
        .should('contain', 'Document deleted successfully');
    });
  });
});
