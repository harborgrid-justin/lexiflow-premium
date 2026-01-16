import { AccessEffect, GranularPermission } from "@/types";
import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type AccessMatrixStatus = "idle" | "saving" | "success" | "error";

export interface AccessMatrixState {
  permissions: GranularPermission[];
  status: AccessMatrixStatus;
  message: string | null;
  newPerm: Partial<GranularPermission>;
}

export interface AccessMatrixActions {
  addPermission: () => void;
  deletePermission: (id: string) => void;
  updateNewPermField: (field: keyof GranularPermission, value: unknown) => void;
  resetNewPerm: () => void;
}

// ============================================================================
// Logic (Pure)
// ============================================================================

const createPermissionObject = (
  draft: Partial<GranularPermission>
): GranularPermission | null => {
  if (!draft.resource || !draft.action) return null;
  return {
    id: `perm-${Date.now()}`,
    resource: draft.resource,
    action: draft.action as GranularPermission["action"],
    effect: (draft.effect || "Allow") as AccessEffect,
    scope: (draft.scope || "Global") as GranularPermission["scope"],
    expiration: draft.expiration,
    conditions: [],
  };
};

// ============================================================================
// Hook
// ============================================================================

export const useAccessMatrix = (
  initialPermissions: GranularPermission[] = []
) => {
  const [permissions, setPermissions] =
    useState<GranularPermission[]>(initialPermissions);
  const [status, setStatus] = useState<AccessMatrixStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [newPerm, setNewPerm] = useState<Partial<GranularPermission>>({
    effect: "Allow",
    scope: "Global",
  });

  // Sync with initial props if they change (optional, depends on usage pattern)
  useEffect(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

  const updateNewPermField = useCallback(
    (field: keyof GranularPermission, value: unknown) => {
      setNewPerm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resetNewPerm = useCallback(() => {
    setNewPerm({ effect: "Allow", scope: "Global" });
    setStatus("idle");
    setMessage(null);
  }, []);

  const addPermission = useCallback(() => {
    const perm = createPermissionObject(newPerm);
    if (!perm) {
      setStatus("error");
      setMessage("Resource and Action are required.");
      return;
    }

    // In a real app, this would be an async API call
    // For now, simulating "saving" to list
    setPermissions((prev) => [...prev, perm]);
    setStatus("success");
    setMessage("Permission added successfully.");

    // Auto-reset after success logic is handled by consumer or explicit reset
    setNewPerm({ effect: "Allow", scope: "Global" });
  }, [newPerm]);

  const deletePermission = useCallback((id: string) => {
    setPermissions((prev) => prev.filter((p) => p.id !== id));
    setStatus("success");
    setMessage("Permission removed.");
  }, []);

  return [
    {
      permissions,
      status,
      message,
      newPerm,
    },
    {
      addPermission,
      deletePermission,
      updateNewPermField,
      resetNewPerm,
    },
  ] as const;
};
