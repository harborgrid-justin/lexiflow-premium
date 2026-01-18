/**
 * User Repository
 * Enterprise-grade repository for user management with backend API integration
 */

import { UsersApiService } from "@/api/auth/users-api";
import { GenericRepository, createQueryKeys, type IApiService } from "@/services/core/factories";
import { type User } from "@/types";

export const USER_QUERY_KEYS = {
  ...createQueryKeys('users'),
  byRole: (role: string) => ["users", "role", role] as const,
} as const;

export class UserRepository extends GenericRepository<User> {
  protected apiService: IApiService<User> = new UsersApiService();
  protected repositoryName = 'UserRepository';

  constructor() {
    super('users');
    console.log(`[UserRepository] Initialized with Backend API`);
  }

  // CRUD operations inherited from GenericRepository

  // Custom methods
  async getByRole(role: string): Promise<User[]> {
    const users = await this.getAll();
    return users.filter((u) => u.role === role);
  }

  override async search(query: string): Promise<User[]> {
    if (!query) return [];
    return super.search(query, ['name', 'email']);
  }
}
