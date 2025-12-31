/**
 * Authentication & Security Domain API Services
 * Auth, users, permissions, API keys, ethical walls
 */

import { AuthApiService } from '../auth/auth-api';
import { UsersApiService } from '../auth/users-api';
import { ApiKeysApiService } from '../auth/security-credentials-api';
import { PermissionsApiService } from '../auth/access-rights-api';
import { EthicalWallsApiService } from '../auth/info-barriers-api';
import { TokenBlacklistAdminApiService } from '../auth/token-blocklist-api';

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
