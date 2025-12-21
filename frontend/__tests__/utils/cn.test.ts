/**
 * cn.test.ts
 * Tests for the cn (classNames) utility function
 */

import { cn } from '../../utils/cn';

describe('cn utility', () => {
  describe('basic usage', () => {
    it('should merge class strings', () => {
      expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });

    it('should handle single class', () => {
      expect(cn('single-class')).toBe('single-class');
    });

    it('should return empty string for no args', () => {
      expect(cn()).toBe('');
    });
  });

  describe('conditional classes', () => {
    it('should filter falsy values', () => {
      expect(cn('class1', null, 'class2', undefined, 'class3')).toBe('class1 class2 class3');
    });

    it('should handle conditional expressions', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn('base', isActive && 'active', isDisabled && 'disabled'))
        .toBe('base active');
    });

    it('should omit false conditions', () => {
      expect(cn('class1', false, 'class2', false)).toBe('class1 class2');
    });

    it('should handle all falsy types', () => {
      expect(cn(null, undefined, false, '', 'valid')).toBe('valid');
    });
  });

  describe('mixed inputs', () => {
    it('should handle combination of valid and invalid inputs', () => {
      expect(cn(
        'base-class',
        true && 'conditional-true',
        false && 'conditional-false',
        null,
        undefined,
        'another-class'
      )).toBe('base-class conditional-true another-class');
    });

    it('should work with dynamic class generation', () => {
      const type = 'primary';
      const size = 'large';
      expect(cn(`btn-${type}`, `size-${size}`, 'rounded')).toBe('btn-primary size-large rounded');
    });
  });

  describe('real-world usage patterns', () => {
    it('should handle Tailwind-style conditional classes', () => {
      const isActive = true;
      const variant = 'primary';
      expect(cn(
        'px-4 py-2 rounded',
        isActive && 'bg-blue-600 text-white',
        variant === 'primary' && 'font-bold'
      )).toBe('px-4 py-2 rounded bg-blue-600 text-white font-bold');
    });

    it('should work with theme-based classes', () => {
      const isDark = false;
      expect(cn(
        'border rounded p-4',
        isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
      )).toBe('border rounded p-4 bg-white text-slate-900');
    });

    it('should handle disabled states', () => {
      const isDisabled = true;
      expect(cn(
        'btn',
        isDisabled && 'opacity-50 cursor-not-allowed',
        !isDisabled && 'hover:bg-blue-700'
      )).toBe('btn opacity-50 cursor-not-allowed');
    });
  });

  describe('edge cases', () => {
    it('should handle empty strings', () => {
      expect(cn('', 'class1', '', 'class2')).toBe('class1 class2');
    });

    it('should handle whitespace', () => {
      expect(cn('  class1  ', 'class2')).toBe('  class1   class2');
    });

    it('should handle only falsy values', () => {
      expect(cn(null, undefined, false)).toBe('');
    });
  });
});
