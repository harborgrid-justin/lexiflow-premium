/**
 * API Types Index
 * Central export for all API-related types
 */

// Common types
export * from './common';

// Domain-specific types
export * from './auth.types';
export * from './case.types';
export * from './document.types';
export * from './billing.types';
export * from './user.types';
export * from './notification.types';

// Re-export for convenience
export type { PaginatedResponse, SuccessResponse, ErrorResponse } from './common';
export type { LoginRequest, LoginResponse, AuthUser } from './auth.types';
export type { CaseItem, CaseDetails, CaseListResponse } from './case.types';
