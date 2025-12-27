/**
 * Authentication & Security Domain API Services
 * Auth, users, permissions, API keys, ethical walls
 */

import { AuthApiService } from '@/api';
import { UsersApiService } from '@/api';
import { ApiKeysApiService } from '@/api';
import { PermissionsApiService } from '@/api';
import { EthicalWallsApiService } from '@/api';
import { TokenBlacklistAdminApiService } from '@/api';

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
