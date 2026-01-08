/**
 * CSRF Hidden Input Component
 *
 * A React Server Component that renders a hidden input field containing
 * a CSRF token for form submissions. The token is automatically generated
 * and stored in an HttpOnly cookie.
 *
 * Usage:
 * ```tsx
 * import { CSRFInput } from '@/components/forms/CSRFInput';
 *
 * <form action={myServerAction}>
 *   <CSRFInput />
 *   <input type="text" name="data" />
 *   <button type="submit">Submit</button>
 * </form>
 * ```
 *
 * Security Notes:
 * - The token is stored in an HttpOnly, SameSite=Strict cookie
 * - Tokens expire after 1 hour
 * - The server action must validate the token using validateCSRFToken()
 */

import { getCSRFToken } from '@/lib/csrf';

/**
 * Hidden input component for CSRF protection
 * This is a Server Component that fetches the token on render
 */
export async function CSRFInput() {
  const token = await getCSRFToken();

  return (
    <input
      type="hidden"
      name="_csrf"
      value={token}
      aria-hidden="true"
      data-testid="csrf-input"
    />
  );
}

/**
 * Client-side CSRF Input component
 * Use this when you need to include CSRF in a client component form
 * The token must be passed as a prop from a server component
 */
export function CSRFInputClient({ token }: { token: string }) {
  return (
    <input
      type="hidden"
      name="_csrf"
      value={token}
      aria-hidden="true"
      data-testid="csrf-input"
    />
  );
}

/**
 * Re-export for convenience
 */
export { getCSRFToken } from '@/lib/csrf';
