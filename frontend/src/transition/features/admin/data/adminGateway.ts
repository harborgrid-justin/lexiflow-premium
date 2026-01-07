/**
 * Admin Gateway - API client for admin operations
 */

import type { SystemSettings } from "../domain/settings";
import type { SystemUser } from "../domain/user";

class AdminGateway {
  private apiUrl = "/api/admin";

  async getUsers(): Promise<SystemUser[]> {
    const response = await fetch(`${this.apiUrl}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  }

  async createUser(userData: Partial<SystemUser>): Promise<SystemUser> {
    const response = await fetch(`${this.apiUrl}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error("Failed to create user");
    return await response.json();
  }

  async updateUser(id: string, updates: Partial<SystemUser>): Promise<void> {
    const response = await fetch(`${this.apiUrl}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update user");
  }

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/users/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete user");
  }

  async getSettings(): Promise<SystemSettings> {
    const response = await fetch(`${this.apiUrl}/settings`);
    if (!response.ok) throw new Error("Failed to fetch settings");
    return await response.json();
  }

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    const response = await fetch(`${this.apiUrl}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error("Failed to update settings");
  }
}

export const adminGateway = new AdminGateway();
