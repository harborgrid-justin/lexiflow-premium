/**
 * Authentication & Security Domain API Services
 * Auth, users, permissions, API keys, ethical walls
 */

import { AuthApiService } from '../auth-api';
import { UsersApiService } from '../users-api';
import { ApiKeysApiService } from '../api-keys-api';
import { PermissionsApiService } from '../permissions-api';
import { EthicalWallsApiService } from '../ethical-walls-api';
import { TokenBlacklistAdminApiService } from '../token-blacklist-admin-api';

// Export service classes
export {
  AuthApiService,
  UsersApiService,
  ApiKeysApiService,
  PermissionsApiService,
  EthicalWallsApiService,
  TokenBlacklistAdminApiService,
};

// Export singleton instances
export const authApi = {
  auth: new AuthApiService(),
  users: new UsersApiService(),
  apiKeys: new ApiKeysApiService(),
  permissions: new PermissionsApiService(),
  ethicalWalls: new EthicalWallsApiService(),
  tokenBlacklist: new TokenBlacklistAdminApiService(),
} as const;
