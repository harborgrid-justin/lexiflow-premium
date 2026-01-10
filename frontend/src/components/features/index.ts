/**
 * @module features
 * @category Domain Features
 * @description Domain-specific feature modules for LexiFlow Legal OS
 *
 * Each domain contains:
 * - components/ - Domain-specific organisms
 * - pages/      - Complete page compositions
 * - hooks/      - Domain-specific React hooks
 * - utils/      - Domain-specific utilities
 * - types/      - Domain-specific TypeScript types
 *
 * @example
 * ```tsx
 * import { CaseList } from '@/features/cases/ui';
 * import { DocumentViewer } from '@/features/documents/ui';
 * import { DiscoveryDashboard } from '@/features/discovery/ui';
 * ```
 */

// ============================================================================
// DOMAIN FEATURES
// ============================================================================

// Matter lifecycle management
export * from "./cases";

// Discovery & evidence management
export * from "./discovery";

export * from "./documents";

// Trial & litigation management
export * from "./litigation";

// Firm operations & administration
export * from "./operations";


// Legal research & knowledge management
export * from "./knowledge";

// Billing & financial management
export * from "./billing";

// System administration
export * from "./admin";

// Analytics & dashboards
export * from "./dashboard";
