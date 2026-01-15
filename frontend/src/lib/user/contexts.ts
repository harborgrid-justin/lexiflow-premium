/**
 * Current User Contexts
 * React context definitions for current user state
 *
 * @module lib/user/contexts
 */

import { createContext } from "react";
import type { UserActionsValue, UserStateValue } from "./types";

export const UserStateContext = createContext<UserStateValue | null>(null);
UserStateContext.displayName = "UserStateContext";

export const UserActionsContext = createContext<UserActionsValue | null>(null);
UserActionsContext.displayName = "UserActionsContext";
