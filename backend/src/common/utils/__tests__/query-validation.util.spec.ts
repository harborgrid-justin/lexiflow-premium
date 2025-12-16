import { validateSortField, validateSortOrder } from '../query-validation.util';

describe('Query Validation Utilities', () => {
  describe('validateSortField', () => {
    it('should return the field if it is in allowed list for entity', () => {
      const result = validateSortField('case', 'caseNumber');
      expect(result).toBe('caseNumber');
    });

    it('should return default field when sortBy is undefined', () => {
      const result = validateSortField('case', undefined);
      expect(result).toBe('createdAt');
    });

    it('should return custom default field when sortBy is undefined', () => {
      const result = validateSortField('case', undefined, 'id');
      expect(result).toBe('id');
    });

    it('should return default field for invalid field', () => {
      const result = validateSortField('case', 'invalidField');
      expect(result).toBe('createdAt');
    });

    it('should return custom default for invalid field', () => {
      const result = validateSortField('case', 'invalidField', 'id');
      expect(result).toBe('id');
    });

    it('should reject SQL injection attempts', () => {
      const maliciousInputs = [
        'title; DROP TABLE users;',
        'title OR 1=1',
        'title UNION SELECT',
        '../../../etc/passwd',
      ];

      maliciousInputs.forEach(input => {
        const result = validateSortField('case', input);
        expect(result).toBe('createdAt');
      });
    });

    it('should be case-sensitive for field names', () => {
      const result = validateSortField('case', 'TITLE');
      expect(result).toBe('createdAt');
    });

    it('should handle empty string', () => {
      const result = validateSortField('case', '');
      expect(result).toBe('createdAt');
    });

    it('should handle whitespace-only string', () => {
      const result = validateSortField('case', '   ');
      expect(result).toBe('createdAt');
    });

    it('should use default fields for unknown entity', () => {
      const result = validateSortField('unknownEntity', 'id');
      expect(result).toBe('id');
    });

    it('should work with document entity', () => {
      const result = validateSortField('document', 'fileName');
      expect(result).toBe('fileName');
    });

    it('should work with expense entity', () => {
      const result = validateSortField('expense', 'amount');
      expect(result).toBe('amount');
    });

    it('should work with invoice entity', () => {
      const result = validateSortField('invoice', 'invoiceNumber');
      expect(result).toBe('invoiceNumber');
    });

    it('should work with timeEntry entity', () => {
      const result = validateSortField('timeEntry', 'hours');
      expect(result).toBe('hours');
    });

    it('should work with project entity', () => {
      const result = validateSortField('project', 'name');
      expect(result).toBe('name');
    });

    it('should allow common fields across all entities', () => {
      const entities = ['case', 'document', 'expense', 'invoice', 'timeEntry', 'project'];

      entities.forEach(entity => {
        expect(validateSortField(entity, 'createdAt')).toBe('createdAt');
        expect(validateSortField(entity, 'updatedAt')).toBe('updatedAt');
      });
    });
  });

  describe('validateSortOrder', () => {
    it('should return ASC for "ASC" input', () => {
      const result = validateSortOrder('ASC');
      expect(result).toBe('ASC');
    });

    it('should return DESC for "DESC" input', () => {
      const result = validateSortOrder('DESC');
      expect(result).toBe('DESC');
    });

    it('should return default DESC for undefined input', () => {
      const result = validateSortOrder(undefined);
      expect(result).toBe('DESC');
    });

    it('should return custom default for undefined input', () => {
      const result = validateSortOrder(undefined, 'ASC');
      expect(result).toBe('ASC');
    });

    it('should handle lowercase input', () => {
      expect(validateSortOrder('asc')).toBe('ASC');
      expect(validateSortOrder('desc')).toBe('DESC');
    });

    it('should handle mixed case input', () => {
      expect(validateSortOrder('AsCending')).toBe('DESC');
      expect(validateSortOrder('Asc')).toBe('ASC');
      expect(validateSortOrder('dEsC')).toBe('DESC');
    });

    it('should return default for invalid input', () => {
      const invalidInputs = [
        'ascending',
        'descending',
        'up',
        'down',
        '1',
        'true',
        'asc desc',
        'ASC; DROP TABLE',
      ];

      invalidInputs.forEach(input => {
        const result = validateSortOrder(input);
        expect(result).toBe('DESC');
      });
    });

    it('should return custom default for invalid input', () => {
      const result = validateSortOrder('invalid', 'ASC');
      expect(result).toBe('ASC');
    });

    it('should handle empty string', () => {
      const result = validateSortOrder('');
      expect(result).toBe('DESC');
    });

    it('should handle whitespace by returning default', () => {
      // toUpperCase doesn't trim, so '  ASC  ' becomes '  ASC  ' which doesn't match 'ASC'
      const result = validateSortOrder('  ASC  ');
      expect(result).toBe('DESC'); // Falls back to default
    });
  });

  describe('Integration scenarios', () => {
    it('should work together for valid sorting', () => {
      const field = validateSortField('case', 'title');
      const order = validateSortOrder('ASC');

      expect(field).toBe('title');
      expect(order).toBe('ASC');
    });

    it('should provide safe defaults for invalid inputs', () => {
      const field = validateSortField('case', 'hackField');
      const order = validateSortOrder('hackOrder');

      expect(field).toBe('createdAt');
      expect(order).toBe('DESC');
    });

    it('should handle null values gracefully', () => {
      const field = validateSortField('case', null as any);
      const order = validateSortOrder(null as any);

      expect(field).toBe('createdAt');
      expect(order).toBe('DESC');
    });
  });

  describe('Console warnings', () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should log warning for invalid sort field', () => {
      validateSortField('case', 'invalidField');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid sort field')
      );
    });

    it('should log warning for invalid sort order', () => {
      validateSortOrder('invalidOrder');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid sort order')
      );
    });

    it('should not log warning for valid inputs', () => {
      validateSortField('case', 'title');
      validateSortOrder('ASC');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });
});
