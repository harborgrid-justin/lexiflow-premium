/**
 * Components Barrel Export
 * 
 * This directory contains PRESENTATION COMPONENTS ONLY.
 * 
 * Architectural Rules:
 * - Components receive data via props
 * - Components emit events via callbacks
 * - NO data fetching (use ../hooks/ or route loader)
 * - NO business logic (belongs in services)
 * - NO routing logic (handled by route.tsx)
 * 
 * All exports from this file should be pure UI components.
 */

// Export all presentation components here
export * from './index';
