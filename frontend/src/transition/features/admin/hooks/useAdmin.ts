/**
 * useAdmin - Hook for admin operations
 */

import { useEffect, useState } from "react";
import { adminGateway } from "../data/adminGateway";
import type { SystemUser } from "../domain/user";

export function useAdmin() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminGateway.getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (
    userData: Partial<SystemUser>
  ): Promise<SystemUser> => {
    const user = await adminGateway.createUser(userData);
    setUsers((prev) => [...prev, user]);
    return user;
  };

  const updateUser = async (
    id: string,
    updates: Partial<SystemUser>
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
    createUser,
    updateUser,
    deleteUser,
    refresh: loadUsers,
  };
}
