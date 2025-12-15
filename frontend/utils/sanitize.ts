/**
 * HTML Sanitization Utilities
 *
 * Provides XSS prevention by sanitizing HTML content before rendering.
 * Used throughout the application where dangerouslySetInnerHTML is needed.
 *
 * @module utils/sanitize
 * @category Security - XSS Prevention
 */

/**
 * Sanitize HTML string by removing script tags, iframes, and event handlers.
 * This is a lightweight sanitizer for trusted content that may contain HTML formatting.
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * import { sanitizeHtml } from '../utils/sanitize';
 *
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(userContent) }} />
 * ```
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html
    // Remove script tags and their content
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
    // Remove iframe tags
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, '')
    // Remove object tags (Flash, Java applets)
    .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gim, '')
    // Remove embed tags
    .replace(/<embed\b[^>]*>/gim, '')
    // Remove event handlers (onclick, onerror, onload, etc.)
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
    // Remove javascript: URLs
    .replace(/javascript\s*:/gi, '')
    // Remove data: URLs that could contain scripts
    .replace(/data\s*:\s*text\/html/gi, 'data:text/plain')
    // Remove vbscript: URLs (IE specific)
    .replace(/vbscript\s*:/gi, '');
};

/**
 * Sanitize text content by encoding HTML entities.
 * Use this for plain text that should never contain HTML.
 *
 * @param text - Text to encode
 * @returns HTML-encoded text safe for display
 */
export const encodeHtmlEntities = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sanitize code content for syntax highlighting.
 * Encodes HTML entities while preserving structure for highlighting.
 *
 * @param code - Code string to sanitize
 * @returns Sanitized code safe for syntax highlighting
 */
export const sanitizeCodeForHighlight = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }

  // First encode HTML entities
  return encodeHtmlEntities(code);
};
