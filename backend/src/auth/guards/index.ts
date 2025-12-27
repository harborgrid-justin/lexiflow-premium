// Re-export consolidated guards from common/guards for backwards compatibility
export { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
export { PermissionsGuard } from '@common/guards/permissions.guard';
// Auth-specific guards
export * from './roles.guard';
export * from './gql-auth.guard';
export * from './token-blacklist.guard';
