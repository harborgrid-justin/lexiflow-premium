/**
 * dateUtils.test.ts
 * Tests for date utility functions
 */

import {
  getTodayString,
  toDateString,
  formatDateDisplay,
  formatDateTimeDisplay,
  addDays,
  isPast,
  isFuture,
  isToday,
  getDaysUntil,
  generateDateFilename,
  isDateInRange,
} from '../../utils/dateUtils';

describe('DateUtils', () => {
  describe('getTodayString', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const result = getTodayString();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const today = new Date().toISOString().split('T')[0];
      expect(result).toBe(today);
    });
  });

  describe('toDateString', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2025-12-19T10:30:00Z');
      expect(toDateString(date)).toBe('2025-12-19');
    });

    it('should extract date from ISO string', () => {
      expect(toDateString('2025-12-19T15:45:00Z')).toBe('2025-12-19');
    });

    it('should handle date-only strings', () => {
      expect(toDateString('2025-12-19')).toBe('2025-12-19');
    });
  });

  describe('formatDateDisplay', () => {
    it('should format date in readable format', () => {
      const result = formatDateDisplay('2025-12-19');
      expect(result).toMatch(/Dec 19, 2025/);
    });
  });

  describe('formatDateTimeDisplay', () => {
    it('should format date with time', () => {
      const result = formatDateTimeDisplay('2025-12-19T15:30:00Z');
      expect(result).toContain('Dec 19, 2025');
      expect(result).toMatch(/\d{1,2}:\d{2}\s(AM|PM)/);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const result = addDays('2025-12-19', 5);
      expect(result).toBe('2025-12-24');
    });

    it('should subtract with negative days', () => {
      const result = addDays('2025-12-19', -5);
      expect(result).toBe('2025-12-14');
    });

    it('should handle month boundaries', () => {
      const result = addDays('2025-12-30', 5);
      expect(result).toBe('2026-01-04');
    });

    it('should work with Date objects', () => {
      const date = new Date('2025-12-19');
      const result = addDays(date, 10);
      expect(result).toBe('2025-12-29');
    });
  });

  describe('isPast', () => {
    it('should identify past dates', () => {
      expect(isPast('2020-01-01')).toBe(true);
    });

    it('should return false for future dates', () => {
      expect(isPast('2030-12-31')).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should identify future dates', () => {
      expect(isFuture('2030-12-31')).toBe(true);
    });

    it('should return false for past dates', () => {
      expect(isFuture('2020-01-01')).toBe(false);
    });
  });

  describe('isToday', () => {
    it('should identify today', () => {
      const today = getTodayString();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for other dates', () => {
      expect(isToday('2020-01-01')).toBe(false);
    });
  });

  describe('getDaysUntil', () => {
    it('should calculate days until future date', () => {
      const future = addDays(getTodayString(), 10);
      expect(getDaysUntil(future)).toBe(10);
    });

    it('should return negative for past dates', () => {
      const past = addDays(getTodayString(), -5);
      expect(getDaysUntil(past)).toBe(-5);
    });

    it('should return 0 for today', () => {
      const today = getTodayString();
      expect(getDaysUntil(today)).toBe(0);
    });
  });

  describe('generateDateFilename', () => {
    it('should generate filename with current date', () => {
      const result = generateDateFilename('export', 'csv');
      expect(result).toMatch(/^export-\d{4}-\d{2}-\d{2}\.csv$/);
      expect(result).toContain(getTodayString());
    });

    it('should handle different extensions', () => {
      const result = generateDateFilename('report', 'pdf');
      expect(result).toMatch(/^report-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle various prefixes', () => {
      const result = generateDateFilename('data-backup', 'json');
      expect(result).toMatch(/^data-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('isDateInRange', () => {
    it('should return true for date within range', () => {
      expect(isDateInRange('2025-12-19', '2025-12-01', '2025-12-31')).toBe(true);
    });

    it('should return false for date before range', () => {
      expect(isDateInRange('2025-11-30', '2025-12-01', '2025-12-31')).toBe(false);
    });

    it('should return false for date after range', () => {
      expect(isDateInRange('2026-01-01', '2025-12-01', '2025-12-31')).toBe(false);
    });

    it('should include boundary dates', () => {
      expect(isDateInRange('2025-12-01', '2025-12-01', '2025-12-31')).toBe(true);
      expect(isDateInRange('2025-12-31', '2025-12-01', '2025-12-31')).toBe(true);
    });
  });
});
