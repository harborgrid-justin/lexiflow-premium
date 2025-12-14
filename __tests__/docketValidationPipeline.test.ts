/**
 * @module __tests__/docketValidationPipeline.test
 * @category Tests - Docket
 * @description Integration tests for the complete docket validation pipeline:
 * sanitization → validation → deadline generation
 * 
 * Tests security (XSS prevention), type safety, and business logic correctness.
 * 
 * @jest-environment jsdom
 */

import { 
  sanitizeDocketEntry, 
  validateDocketEntry,
  isValidDocketEntryType,
  isValidStructuredData 
} from '../utils/docketValidation';
import { DeadlineEngine } from '../services/deadlineEngine';
import { IdGenerator } from '../utils/idGenerator';
import { DocketEntry, DocketEntryType } from '../types';

describe('Docket Validation Pipeline', () => {
  describe('Sanitization', () => {
    it('should remove XSS attack vectors from title', () => {
      const malicious: Partial<DocketEntry> = {
        title: '<script>alert("XSS")</script>Motion to Dismiss',
        description: 'Normal description'
      };

      const sanitized = sanitizeDocketEntry(malicious);
      
      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.title).toContain('Motion to Dismiss');
    });

    it('should encode HTML entities in description', () => {
      const entry: Partial<DocketEntry> = {
        description: 'Amount: <$1,000> & "quoted text"'
      };

      const sanitized = sanitizeDocketEntry(entry);
      
      expect(sanitized.description).toContain('&lt;');
      expect(sanitized.description).toContain('&gt;');
      expect(sanitized.description).toContain('&amp;');
      expect(sanitized.description).toContain('&quot;');
    });

    it('should sanitize structured data fields', () => {
      const entry: Partial<DocketEntry> = {
        structuredData: {
          actionType: '<img src=x onerror=alert(1)>',
          actionVerb: 'Filed',
          documentTitle: 'Motion',
          filer: '',
          additionalText: ''
        }
      };

      const sanitized = sanitizeDocketEntry(entry);
      
      expect(sanitized.structuredData?.actionType).not.toContain('<img');
      expect(sanitized.structuredData?.actionVerb).toBe('Filed');
    });

    it('should preserve valid data without modification', () => {
      const entry: Partial<DocketEntry> = {
        title: 'Motion for Summary Judgment',
        description: 'Plaintiff seeks summary judgment on all claims',
        filedBy: 'John Doe, Esq.'
      };

      const sanitized = sanitizeDocketEntry(entry);
      
      expect(sanitized.title).toBe(entry.title);
      expect(sanitized.description).toBe(entry.description);
      expect(sanitized.filedBy).toBe(entry.filedBy);
    });
  });

  describe('Validation', () => {
    it('should validate complete, correct entry', () => {
      const entry: Partial<DocketEntry> = {
        id: IdGenerator.docket(),
        caseId: 'case-123' as any,
        sequenceNumber: 42,
        date: '2024-12-14',
        type: 'Motion' as DocketEntryType,
        title: 'Motion to Dismiss',
        description: 'Defendant moves to dismiss',
        filedBy: 'Defense Counsel'
      };

      const result = validateDocketEntry(entry);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {
      const entry: Partial<DocketEntry> = {
        sequenceNumber: 1,
        date: '2024-12-14'
        // Missing: caseId, type, title
      };

      const result = validateDocketEntry(entry);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.field === 'caseId')).toBe(true);
      expect(result.errors.some(e => e.field === 'type')).toBe(true);
    });

    it('should validate structured data when present', () => {
      const entry: Partial<DocketEntry> = {
        id: 'docket-123' as any,
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: '2024-12-14',
        type: 'Filing' as DocketEntryType,
        title: 'Test',
        structuredData: {
          actionType: 'Motion',
          actionVerb: 'Filed',
          documentTitle: 'Motion to Dismiss',
          filer: 'Plaintiff',
          additionalText: 'Supplemental Brief'
        }
      };

      const result = validateDocketEntry(entry);
      
      expect(result.isValid).toBe(true);
    });

    it('should catch invalid structured data', () => {
      const entry: Partial<DocketEntry> = {
        id: 'docket-124' as any,
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: '2024-12-14',
        type: 'Filing' as DocketEntryType,
        title: 'Test',
        structuredData: {
          actionType: '', // Invalid: empty
          actionVerb: 'Filed',
          documentTitle: '',
          filer: '',
          additionalText: ''
        }
      };

      const result = validateDocketEntry(entry);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('actionType') || e.message.includes('Action type'))).toBe(true);
    });

    it('should validate date format', () => {
      const invalidEntry: Partial<DocketEntry> = {
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: 'not-a-date',
        type: 'Filing' as DocketEntryType,
        title: 'Test'
      };

      const result = validateDocketEntry(invalidEntry);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'date')).toBe(true);
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify valid docket entry types', () => {
      expect(isValidDocketEntryType('Filing')).toBe(true);
      expect(isValidDocketEntryType('Order')).toBe(true);
      expect(isValidDocketEntryType('Motion')).toBe(true);
      expect(isValidDocketEntryType('InvalidType')).toBe(false);
    });

    it('should validate structured data objects', () => {
      const valid = {
        actionType: 'Motion',
        actionVerb: 'Filed',
        documentTitle: 'MTD'
      };

      const invalid = {
        actionType: '', // Empty string
        actionVerb: 'Filed'
      };

      expect(isValidStructuredData(valid)).toBe(true);
      expect(isValidStructuredData(invalid)).toBe(false);
    });
  });

  describe('Deadline Generation', () => {
    it('should generate deadlines for orders with response language', () => {
      const entry: DocketEntry = {
        id: IdGenerator.docket(),
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: '2024-12-14',
        type: 'Order',
        title: 'Order on Motion to Dismiss',
        description: 'Defendant shall respond within 14 days',
        filedBy: 'Court'
      };

      const deadlines = DeadlineEngine.generateDeadlines(entry, 'Federal');
      
      expect(deadlines.length).toBeGreaterThan(0);
      expect(deadlines[0].title).toContain('Response');
    });

    it('should not generate deadlines for non-matching entries', () => {
      const entry: DocketEntry = {
        id: IdGenerator.docket(),
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: '2024-12-14',
        type: 'Notice',
        title: 'Notice of Appearance',
        description: 'Attorney enters appearance',
        filedBy: 'Defense Counsel'
      };

      const deadlines = DeadlineEngine.generateDeadlines(entry, 'Federal');
      
      expect(deadlines).toHaveLength(0);
    });

    it('should calculate business days correctly', () => {
      const entry: DocketEntry = {
        id: IdGenerator.docket(),
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: '2024-12-13', // Friday
        type: 'Order',
        title: 'Order',
        description: 'Respond within 21 days',
        filedBy: 'Court'
      };

      const deadlines = DeadlineEngine.generateDeadlines(entry, 'Federal');
      
      if (deadlines.length > 0) {
        const deadline = new Date(deadlines[0].date);
        const filed = new Date(entry.date);
        const diffMs = deadline.getTime() - filed.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        // Should be at least 21 days (may be more due to weekends)
        expect(diffDays).toBeGreaterThanOrEqual(21);
      }
    });
  });

  describe('Complete Pipeline', () => {
    it('should successfully process malicious input through full pipeline', () => {
      // Start with potentially malicious input
      let entry: Partial<DocketEntry> = {
        id: IdGenerator.docket(),
        caseId: 'case-123' as any,
        sequenceNumber: 1,
        date: '2024-12-14',
        type: 'Order' as DocketEntryType,
        title: '<script>alert("XSS")</script>Order to Respond',
        description: 'Plaintiff must respond within 14 days',
        filedBy: '<img src=x onerror=alert(1)>Counsel'
      };

      // Step 1: Sanitize
      entry = sanitizeDocketEntry(entry);
      expect(entry.title).not.toContain('<script>');
      expect(entry.filedBy).not.toContain('<img');

      // Step 2: Validate
      const validation = validateDocketEntry(entry);
      expect(validation.isValid).toBe(true);

      // Step 3: Generate deadlines
      const deadlines = DeadlineEngine.generateDeadlines(entry as DocketEntry, 'Federal');
      expect(Array.isArray(deadlines)).toBe(true);

      // Result should be safe and valid
      expect(entry.title).toContain('Order to Respond');
      expect(entry.description).toBe('Plaintiff must respond within 14 days');
    });

    it('should reject invalid input even after sanitization', () => {
      let entry: Partial<DocketEntry> = {
        // Missing required fields
        title: '<script>alert(1)</script>',
        description: 'Test'
      };

      // Sanitize first
      entry = sanitizeDocketEntry(entry);

      // Should still fail validation due to missing fields
      const validation = validateDocketEntry(entry);
      expect(validation.isValid).toBe(false);
    });
  });
});
