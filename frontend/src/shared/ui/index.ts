/**
 * @module ui
 * @category UI Components
 * @description Enterprise UI component library following Atomic Design principles
 *
 * This is the main UI layer containing all reusable, domain-agnostic components.
 *
 * @example
 * ```tsx
 * import { Button, Badge } from '@/shared/ui/atoms';
 * import { Card, Modal } from '@/shared/ui/molecules';
 * import { PageContainer } from '@/shared/ui/layouts';
 * ```
 */

// ============================================================================
// ATOMIC DESIGN LAYERS
// ============================================================================

// NOTE: Commented out to prevent Vite ERR_INSUFFICIENT_RESOURCES during dev
// Too many barrel exports cause resource exhaustion in the browser
// Import directly from specific component paths instead:
// import { Button } from '@/shared/ui/atoms/Button/Button';
// import { Card } from '@/shared/ui/molecules/Card/Card';

// Atoms - Basic UI primitives
// export * from './atoms';

// Molecules - Simple composed components
// export * from './molecules';

// Organisms - Complex composed components (domain-agnostic)
// export * from './organisms';

// Layouts - Page structure components
// export * from './layouts';
