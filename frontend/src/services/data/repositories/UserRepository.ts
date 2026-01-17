/**
 * User Repository
 * Enterprise-grade repository for user management with backend API integration
 */

import { UsersApiService } from "@/api/auth/users-api";
import { Repository } from "@/services/core/Repository";
import { type User } from "@/types";

export const USER_QUERY_KEYS = {
  all: () => ["users"] as const,
  byId: (id: string) => ["users", id] as const,
  byRole: (role: string) => ["users", "role", role] as const,
} as const;

export class UserRepository extends Repository<User> {
  private usersApi: UsersApiService;

  constructor() {
    super("users");
    this.usersApi = new UsersApiService();
    console.log(`[UserRepository] Initialized with Backend API`);
  }

  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === "") {
      throw new Error(`[UserRepository.${methodName}] Invalid id parameter`);
    }
  }

  override async getAll(): Promise<User[]> {
    try {
      return await this.usersApi.getAll();
    } catch (error) {
      console.error("[UserRepository] Backend API error", error);
      throw error;
    }
  }

  override async getById(id: string): Promise<User | undefined> {
    this.validateId(id, "getById");
    try {
      return await this.usersApi.getById(id);
    } catch (error) {
      console.error("[UserRepository] Backend API error", error);
      throw error;
    }
  }

  override async update(id: string, updates: Partial<User>): Promise<User> {
    this.validateId(id, "update");
    try {
      return await this.usersApi.update(id, updates);
    } catch (error) {
      console.error("[UserRepository] Backend API error", error);
      throw error;
    }
  }

  override async delete(id: string): Promise<void> {
    this.validateId(id, "delete");
    try {
      await this.usersApi.delete(id);
      return;
    } catch (error) {
      console.error("[UserRepository] Backend API error", error);
      throw error;
    }
  }

  async getByRole(role: string): Promise<User[]> {
    const users = await this.getAll();
    return users.filter((u) => u.role === role);
  }

  async search(query: string): Promise<User[]> {
    if (!query) return [];
    const users = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lowerQuery) ||
        u.email?.toLowerCase().includes(lowerQuery)
    );
  }
}
