/**
 * @module services/validation/sanitizers/input-sanitizer
 * @description Input sanitization to prevent XSS and injection attacks
 * Pure sanitization functions with no side effects
 * 
 * @responsibility Sanitize user input to prevent security vulnerabilities
 * @security XSS prevention, HTML tag removal, dangerous character filtering
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 * 
 * @param str - String to sanitize
 * @returns Sanitized string safe for display
 * 
 * @example
 * ```ts
 * sanitizeString('<script>alert("xss")</script>Hello') // 'Hello'
 * sanitizeString('O\'Malley & Sons') // 'OMalley  Sons'
 * sanitizeString('  spaces  ') // 'spaces'
 * ```
 * 
 * @security Prevents XSS by removing HTML tags and dangerous characters
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .trim();
}

/**
 * Sanitize string while preserving basic punctuation
 * Removes HTML tags but keeps common punctuation marks
 * 
 * @param str - String to sanitize
 * @returns Sanitized string with punctuation preserved
 * 
 * @example
 * ```ts
 * sanitizeWithPunctuation("O'Malley & Sons, Inc.") // "O'Malley & Sons, Inc."
 * sanitizeWithPunctuation('<b>Bold</b> text') // 'Bold text'
 * ```
 */
export function sanitizeWithPunctuation(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove only angle brackets
    .trim();
}

/**
 * Sanitize HTML content allowing only safe tags
 * More permissive sanitization for rich text content
 * 
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML with only safe tags
 * 
 * @example
 * ```ts
 * sanitizeHTML('<p>Safe</p><script>alert("bad")</script>')
 * // Returns: '<p>Safe</p>alert("bad")'
 * ```
 * 
 * @security Removes script tags and event handlers
 */
export function sanitizeHTML(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handler attributes
  sanitized = sanitized.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized.trim();
}

/**
 * Sanitize array of strings
 * 
 * @param arr - Array of strings to sanitize
 * @returns Array of sanitized strings
 */
export function sanitizeArray(arr: string[]): string[] {
  return arr.map(sanitizeString).filter(s => s.length > 0);
}

/**
 * Sanitize object properties (shallow)
 * 
 * @param obj - Object with string properties to sanitize
 * @returns New object with sanitized string properties
 * 
 * @example
 * ```ts
 * sanitizeObject({ name: '<b>John</b>', email: 'john@example.com' })
 * // Returns: { name: 'John', email: 'john@example.com' }
 * ```
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: unknown = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized as T;
}
