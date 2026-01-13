import { ExtendedUserProfile } from "@/types";
import { useCallback, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type SecurityStatus = "idle" | "revoking" | "success" | "error";

export interface SecurityState {
  status: SecurityStatus;
  activeSessions: ExtendedUserProfile["security"]["activeSessions"];
}

export interface SecurityActions {
  revokeSession: (sessionId: string) => Promise<void>;
  signOutAllOthers: () => Promise<void>;
  changePassword: () => void; // Placeholder for routing to change password flow
  configureMFA: () => void; // Placeholder
}

// ============================================================================
// Hook
// ============================================================================

export const useSecuritySettings = (
  initialSessions: ExtendedUserProfile["security"]["activeSessions"]
) => {
  const [sessions, setSessions] = useState(initialSessions);
  const [status, setStatus] = useState<SecurityStatus>("idle");

  const revokeSession = useCallback(async (sessionId: string) => {
    setStatus("revoking");
    try {
      // Mock API call
      // await DataService.auth.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, []);

  const signOutAllOthers = useCallback(async () => {
    setStatus("revoking");
    try {
      // Mock API call
      // await DataService.auth.revokeAllSessions();
      setSessions((prev) => prev.filter((s) => s.current));
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, []);

  const changePassword = useCallback(() => {
    console.log("Navigate to change password");
  }, []);

  const configureMFA = useCallback(() => {
    console.log("Navigate to MFA config");
  }, []);

  return [
    {
      status,
      activeSessions: sessions,
    },
    {
      revokeSession,
      signOutAllOthers,
      changePassword,
      configureMFA,
    },
  ] as const;
};
