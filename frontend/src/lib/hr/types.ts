/**
 * HR Provider Types
 * Type definitions for HR/staff management context
 *
 * @module lib/hr/types
 */

import type { CaseTeamMember } from "@/types/case-team";
import type { User } from "@/types/system";

export interface CaseTeam {
  caseId: string;
  members: CaseTeamMember[];
}

export interface HRStateValue {
  users: User[];
  caseTeams: CaseTeam[];
  activeUserId: string | null;
  activeUser: User | null;
  isLoading: boolean;
  error: Error | null;
}

export interface HRActionsValue {
  loadUsers: () => Promise<void>;
  loadUserById: (id: string) => Promise<User | null>;
  createUser: (data: Partial<User>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  activateUser: (id: string) => Promise<void>;
  loadCaseTeam: (caseId: string) => Promise<CaseTeamMember[]>;
  assignToCaseTeam: (
    caseId: string,
    userId: string,
    role: string
  ) => Promise<CaseTeamMember>;
  removeFromCaseTeam: (caseId: string, userId: string) => Promise<void>;
  updateCaseTeamRole: (
    caseId: string,
    userId: string,
    newRole: string
  ) => Promise<void>;
  setActiveUser: (id: string | null) => void;
  searchUsers: (query: string) => Promise<User[]>;
  refreshUsers: () => Promise<void>;
}

export interface HRProviderProps {
  children: React.ReactNode;
  initialUsers?: User[];
}
