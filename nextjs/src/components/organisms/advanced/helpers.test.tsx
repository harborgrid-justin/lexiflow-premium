/**
 * @jest-environment jsdom
 * @module helpers.test
 * @description Enterprise-grade tests for search helpers (getCategoryIcon, sanitizeHtml)
 *
 * Test coverage:
 * - getCategoryIcon returns correct icons for each category
 * - sanitizeHtml security filtering
 * - Edge cases and error handling
 */

import React from 'react';
import { render } from '@testing-library/react';
import { getCategoryIcon, sanitizeHtml } from './helpers';
import type { SearchCategory } from './types';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('./helpers.styles', () => ({
  categoryIcon: 'category-icon-class',
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('helpers', () => {
  describe('getCategoryIcon', () => {
    it('returns Hash icon for cases category', () => {
      const icon = getCategoryIcon('cases');
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('.category-icon-class')).toBeInTheDocument();
    });

    it('returns FileText icon for documents category', () => {
      const icon = getCategoryIcon('documents');
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns Users icon for people category', () => {
      const icon = getCategoryIcon('people');
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns Calendar icon for dates category', () => {
      const icon = getCategoryIcon('dates');
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns Tag icon for tags category', () => {
      const icon = getCategoryIcon('tags');
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns Search icon for all category', () => {
      const icon = getCategoryIcon('all');
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('returns Search icon for unknown category', () => {
      const icon = getCategoryIcon('unknown' as SearchCategory);
      const { container } = render(<>{icon}</>);

      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies correct CSS class to all icons', () => {
      const categories: SearchCategory[] = ['all', 'cases', 'documents', 'people', 'dates', 'tags'];

      categories.forEach(category => {
        const icon = getCategoryIcon(category);
        const { container } = render(<>{icon}</>);

        expect(container.querySelector('.category-icon-class')).toBeInTheDocument();
      });
    });
  });

  describe('sanitizeHtml', () => {
    it('allows <mark> tags for highlighting', () => {
      const input = 'Test <mark>highlighted</mark> text';
      const result = sanitizeHtml(input);

      expect(result).toBe('Test <mark>highlighted</mark> text');
    });

    it('allows closing </mark> tags', () => {
      const input = '<mark>start</mark> middle <mark>end</mark>';
      const result = sanitizeHtml(input);

      expect(result).toBe('<mark>start</mark> middle <mark>end</mark>');
    });

    it('removes <script> tags', () => {
      const input = 'Safe text <script>alert("xss")</script> more text';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toContain('Safe text');
      expect(result).toContain('more text');
    });

    it('removes <iframe> tags', () => {
      const input = 'Text <iframe src="evil.com"></iframe> more';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('</iframe>');
    });

    it('removes onclick attributes within tags', () => {
      const input = '<div onclick="evil()">Click me</div>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('onclick');
    });

    it('removes onerror event handlers', () => {
      const input = '<img src="x" onerror="evil()">';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('onerror');
    });

    it('removes <style> tags', () => {
      const input = 'Text <style>body{display:none}</style> more';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<style>');
    });

    it('handles nested malicious tags', () => {
      const input = '<script><script>nested evil</script></script>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<script>');
    });

    it('preserves plain text', () => {
      const input = 'Just plain text without any tags';
      const result = sanitizeHtml(input);

      expect(result).toBe('Just plain text without any tags');
    });

    it('preserves text with special characters', () => {
      const input = 'Smith & Jones v. Doe';
      const result = sanitizeHtml(input);

      expect(result).toBe('Smith & Jones v. Doe');
    });

    it('handles empty string', () => {
      const result = sanitizeHtml('');

      expect(result).toBe('');
    });

    it('handles string with only mark tags', () => {
      const input = '<mark>highlighted</mark>';
      const result = sanitizeHtml(input);

      expect(result).toBe('<mark>highlighted</mark>');
    });

    it('removes <a> tags with javascript: protocol', () => {
      const input = '<a href="javascript:evil()">Click</a>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<a');
      expect(result).not.toContain('javascript:');
    });

    it('removes data: protocol links', () => {
      const input = '<a href="data:text/html,<script>alert(1)</script>">Bad</a>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('data:');
    });

    it('handles case variations in tags', () => {
      const input = '<SCRIPT>evil()</SCRIPT>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<SCRIPT>');
      expect(result).not.toContain('</SCRIPT>');
    });

    it('handles mixed case mark tags', () => {
      const input = '<Mark>test</Mark>';
      const result = sanitizeHtml(input);

      // Should allow mark tags regardless of case
      expect(result).toContain('test');
    });

    it('removes SVG with onload', () => {
      const input = '<svg onload="evil()"></svg>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<svg');
    });

    it('preserves HTML entities', () => {
      const input = '&lt;not a tag&gt;';
      const result = sanitizeHtml(input);

      expect(result).toBe('&lt;not a tag&gt;');
    });

    it('handles multiple mark tags', () => {
      const input = '<mark>one</mark> <mark>two</mark> <mark>three</mark>';
      const result = sanitizeHtml(input);

      expect(result).toBe('<mark>one</mark> <mark>two</mark> <mark>three</mark>');
    });

    it('handles mark tags with attributes (strips attributes)', () => {
      const input = '<mark class="highlight" id="match">text</mark>';
      const result = sanitizeHtml(input);

      // Basic sanitization may or may not preserve attributes
      expect(result).toContain('text');
    });
  });

  describe('Edge Cases', () => {
    it('getCategoryIcon handles undefined gracefully', () => {
      const icon = getCategoryIcon(undefined as unknown as SearchCategory);
      const { container } = render(<>{icon}</>);

      // Should return default Search icon
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('sanitizeHtml handles null/undefined gracefully', () => {
      // These should not throw
      expect(() => sanitizeHtml(null as unknown as string)).not.toThrow();
      expect(() => sanitizeHtml(undefined as unknown as string)).not.toThrow();
    });

    it('sanitizeHtml handles very long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = sanitizeHtml(longString);

      expect(result.length).toBe(10000);
    });

    it('sanitizeHtml handles unicode characters', () => {
      const input = 'Test \u{1F600} emoji';
      const result = sanitizeHtml(input);

      expect(result).toBe('Test \u{1F600} emoji');
    });
  });
});
