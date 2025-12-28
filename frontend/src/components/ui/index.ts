/**
 * @module ui
 * @category UI Components
 * @description Enterprise UI component library following Atomic Design principles
 * 
 * This is the main UI layer containing all reusable, domain-agnostic components.
 * 
 * @example
 * ```tsx
 * import { Button, Badge } from '@/components/ui/atoms';
 * import { Card, Modal } from '@/components/ui/molecules';
 * import { PageContainer } from '@/components/ui/layouts';
 * ```
 */

// ============================================================================
// ATOMIC DESIGN LAYERS
// ============================================================================

// Atoms - Basic UI primitives
export * from './atoms';

// Molecules - Simple composed components
export * from './molecules';

// Organisms - Complex composed components (domain-agnostic)
export * from './organisms';

// Layouts - Page structure components
export * from './layouts';
