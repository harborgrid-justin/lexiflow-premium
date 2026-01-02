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
// NEW UI COMPONENTS (NextJS App)
// ============================================================================

// Layout Components
export { Breadcrumb } from "./Breadcrumb";
export { Card, CardBody, CardFooter, CardHeader } from "./Card";
export { PageHeader } from "./PageHeader";

// Data Display Components
export { Badge } from "./Badge";
export { StatCard } from "./StatCard";
export { Table } from "./Table";

// Form Components
export { Button } from "./Button";
export { Input } from "./Input";
export { Select } from "./Select";

// Feedback Components
export { Alert } from "./Alert";
export { Modal } from "./Modal";

// Navigation Components
export { Tabs } from "./Tabs";

// Utility Components
export { EmptyState } from "./EmptyState";
export { Skeleton, SkeletonLine } from "./Skeleton";

// ============================================================================
// LEGACY ATOMIC DESIGN LAYERS (Commented out)
// ============================================================================

// NOTE: Commented out to prevent Vite ERR_INSUFFICIENT_RESOURCES during dev
// Too many barrel exports cause resource exhaustion in the browser
// Import directly from specific component paths instead:
// import { Button } from '@/components/ui/atoms/Button/Button';
// import { Card } from '@/components/ui/molecules/Card/Card';

// Atoms - Basic UI primitives
// export * from './atoms';

// Molecules - Simple composed components
// export * from './molecules';

// Organisms - Complex composed components (domain-agnostic)
// export * from './organisms';

// Layouts - Page structure components
// export * from './layouts';
