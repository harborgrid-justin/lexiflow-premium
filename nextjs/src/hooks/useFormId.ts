/**
 * @module hooks/useFormId
 * @category Hooks - Accessibility
 * @description React 18 useId wrapper for form field accessibility and SSR-safe unique IDs.
 * Generates stable unique IDs that work across server and client rendering without mismatches.
 * 
 * React 18 Best Practice: useId ensures hydration safety and proper accessibility
 * 
 * @example
 * ```tsx
 * function FormField() {
 *   const id = useFormId('email');
 *   return (
 *     <>
 *       <label htmlFor={id}>Email</label>
 *       <input id={id} type="email" />
 *     </>
 *   );
 * }
 * ```
 */

import { useId } from 'react';

/**
 * Generate a unique ID for form fields with optional prefix
 * 
 * @param prefix - Optional prefix for the ID (e.g., 'email', 'password')
 * @returns Stable unique ID string
 */
export function useFormId(prefix?: string): string {
  const id = useId();
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generate multiple unique IDs for related form fields
 * 
 * @param count - Number of IDs to generate
 * @param prefix - Optional prefix for all IDs
 * @returns Array of unique ID strings
 * 
 * @example
 * ```tsx
 * function MultiFieldForm() {
 *   const [fieldId, errorId, helpId] = useFormIds(3, 'username');
 *   return (
 *     <>
 *       <input id={fieldId} aria-describedby={`${errorId} ${helpId}`} />
 *       <span id={errorId}>Error message</span>
 *       <span id={helpId}>Help text</span>
 *     </>
 *   );
 * }
 * ```
 */
export function useFormIds(count: number, prefix?: string): string[] {
  const baseId = useId();
  return Array.from({ length: count }, (_, i) => 
    prefix ? `${prefix}-${baseId}-${i}` : `${baseId}-${i}`
  );
}

/**
 * Generate IDs for aria-labelledby and aria-describedby patterns
 * 
 * @param fieldName - Name of the form field
 * @returns Object with labelId, fieldId, errorId, helpId
 * 
 * @example
 * ```tsx
 * function AccessibleField() {
 *   const ids = useAriaIds('email');
 *   return (
 *     <>
 *       <label id={ids.labelId} htmlFor={ids.fieldId}>Email</label>
 *       <input 
 *         id={ids.fieldId} 
 *         aria-labelledby={ids.labelId}
 *         aria-describedby={`${ids.errorId} ${ids.helpId}`}
 *       />
 *       <span id={ids.errorId} role="alert">Error</span>
 *       <span id={ids.helpId}>Help text</span>
 *     </>
 *   );
 * }
 * ```
 */
export function useAriaIds(fieldName: string) {
  const [labelId, fieldId, errorId, helpId] = useFormIds(4, fieldName);
  
  return {
    labelId,
    fieldId,
    errorId,
    helpId
  };
}
