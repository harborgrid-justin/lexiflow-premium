/**
 * @module services/api/users.service
 * @category API Services
 * @description User management service
 */

import { apiClient } from "@/services/infrastructure/apiClient";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: "active" | "inactive" | "pending";
  lastLogin: string | null;
  createdAt: string;
  mfaEnabled: boolean;
}

export class UsersService {
  private readonly baseUrl = "/api/users";

  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>(this.baseUrl);
  }

  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`${this.baseUrl}/${id}`);
  }

  async createUser(
    user: Omit<User, "id" | "lastLogin" | "createdAt">
  ): Promise<User> {
    return apiClient.post<User>(this.baseUrl, user);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return apiClient.put<User>(`${this.baseUrl}/${id}`, user);
  }

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const usersService = new UsersService();
