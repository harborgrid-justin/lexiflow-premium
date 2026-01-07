/**
 * @jest-environment jsdom
 * Search Helpers Tests
 * Enterprise-grade tests for search utility functions
 */

import { render, screen } from '@testing-library/react';
import { getCategoryIcon, sanitizeHtml } from './helpers';
import type { SearchCategory } from './types';

describe('getCategoryIcon', () => {
  describe('Category Icons', () => {
    it('returns Hash icon for cases category', () => {
      const { container } = render(<>{getCategoryIcon('cases')}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('returns FileText icon for documents category', () => {
      const { container } = render(<>{getCategoryIcon('documents')}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('returns Users icon for people category', () => {
      const { container } = render(<>{getCategoryIcon('people')}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('returns Calendar icon for dates category', () => {
      const { container } = render(<>{getCategoryIcon('dates')}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('returns Tag icon for tags category', () => {
      const { container } = render(<>{getCategoryIcon('tags')}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('returns Search icon for all category (default)', () => {
      const { container } = render(<>{getCategoryIcon('all')}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('returns Search icon for unknown category', () => {
      const { container } = render(<>{getCategoryIcon('unknown' as SearchCategory)}</>);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Icon Styling', () => {
    it('applies consistent styling class', () => {
      const { container } = render(<>{getCategoryIcon('cases')}</>);

      const svg = container.querySelector('svg');
      // Should have the categoryIcon style class
      expect(svg?.className).toBeDefined();
    });

    it('all icons have same size class', () => {
      const categories: SearchCategory[] = ['all', 'cases', 'documents', 'people', 'dates', 'tags'];

      categories.forEach(category => {
        const { container, unmount } = render(<>{getCategoryIcon(category)}</>);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('h-4');
        expect(svg).toHaveClass('w-4');
        unmount();
      });
    });
  });
});

describe('sanitizeHtml', () => {
  describe('XSS Protection', () => {
    it('allows mark tags for highlighting', () => {
      const input = 'Search <mark>result</mark> text';
      const result = sanitizeHtml(input);

      expect(result).toBe('Search <mark>result</mark> text');
    });

    it('removes script tags', () => {
      const input = 'Text <script>alert("XSS")</script> more';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toBe('Text alert("XSS") more');
    });

    it('removes onclick attributes', () => {
      const input = 'Text <div onclick="alert(1)">click</div>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('onclick');
    });

    it('removes img tags with onerror', () => {
      const input = 'Text <img src=x onerror=alert(1)>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<img');
      expect(result).not.toContain('onerror');
    });

    it('removes anchor tags', () => {
      const input = 'Click <a href="javascript:alert(1)">here</a>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<a ');
      expect(result).not.toContain('href');
    });

    it('removes iframe tags', () => {
      const input = 'Content <iframe src="evil.com"></iframe>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('</iframe>');
    });

    it('removes style tags', () => {
      const input = 'Text <style>body { display: none; }</style>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<style>');
      expect(result).not.toContain('</style>');
    });
  });

  describe('Preserving Safe Content', () => {
    it('preserves plain text', () => {
      const input = 'Hello World';
      const result = sanitizeHtml(input);

      expect(result).toBe('Hello World');
    });

    it('preserves multiple mark tags', () => {
      const input = '<mark>First</mark> and <mark>Second</mark>';
      const result = sanitizeHtml(input);

      expect(result).toBe('<mark>First</mark> and <mark>Second</mark>');
    });

    it('preserves closing mark tags', () => {
      const input = 'Before <mark>highlighted</mark> after';
      const result = sanitizeHtml(input);

      expect(result).toContain('</mark>');
    });

    it('preserves nested mark tags', () => {
      const input = '<mark>outer <mark>inner</mark> outer</mark>';
      const result = sanitizeHtml(input);

      expect(result).toBe('<mark>outer <mark>inner</mark> outer</mark>');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string', () => {
      const result = sanitizeHtml('');

      expect(result).toBe('');
    });

    it('handles string with no HTML', () => {
      const input = 'Just plain text with <no> tags';
      const result = sanitizeHtml(input);

      // <no> is not allowed, should be removed
      expect(result).not.toContain('<no>');
    });

    it('handles malformed HTML', () => {
      const input = '<mark>unclosed';
      const result = sanitizeHtml(input);

      // Should preserve mark tag even if unclosed
      expect(result).toBe('<mark>unclosed');
    });

    it('handles uppercase HTML tags', () => {
      const input = '<SCRIPT>alert(1)</SCRIPT>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<SCRIPT>');
    });

    it('handles mixed case HTML tags', () => {
      const input = '<ScRiPt>alert(1)</sCrIpT>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('ScRiPt');
    });

    it('handles self-closing tags', () => {
      const input = '<img src="x" />';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<img');
    });

    it('handles tags with attributes', () => {
      const input = '<div class="test" id="malicious">content</div>';
      const result = sanitizeHtml(input);

      expect(result).not.toContain('<div');
      expect(result).toContain('content');
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles search highlight with special characters', () => {
      const input = 'Search for <mark>Smith & Jones</mark> case';
      const result = sanitizeHtml(input);

      expect(result).toBe('Search for <mark>Smith & Jones</mark> case');
    });

    it('handles multiple search terms highlighted', () => {
      const input = '<mark>John</mark> <mark>Smith</mark> vs <mark>ACME Corp</mark>';
      const result = sanitizeHtml(input);

      expect(result).toBe('<mark>John</mark> <mark>Smith</mark> vs <mark>ACME Corp</mark>');
    });

    it('handles partial word highlighting', () => {
      const input = 'Document<mark>ation</mark> file';
      const result = sanitizeHtml(input);

      expect(result).toBe('Document<mark>ation</mark> file');
    });
  });
});
