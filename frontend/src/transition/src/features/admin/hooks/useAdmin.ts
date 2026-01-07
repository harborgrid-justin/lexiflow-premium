/**
 * useAdmin - Hook for admin operations
 *
 * Connects to backend admin gateway for system management.
 */

import { useEffect, useState } from "react";
import { adminGateway } from "../../../services/data/api/gateways/adminGateway";
import type { UserIdentity } from "../../../services/data/api/gateways/userGateway";

export function useAdmin() {
  const [users, setUsers] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminGateway.getAllUsers();
      setUsers(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load users";
      console.error("Failed to load users:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (
    userData: Omit<UserIdentity, "id">
  ): Promise<UserIdentity> => {
    const user = await adminGateway.createUser(userData);
    setUsers((prev) => [...prev, user]);
    return user;
  };

  const updateUser = async (
    id: string,
    updates: Partial<UserIdentity>
  ): Promise<void> => {
    await adminGateway.updateUser(id, updates);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const deleteUser = async (id: string): Promise<void> => {
    await adminGateway.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refresh: loadUsers,
  };
}
