/**
 * Session Contexts
 * React context definitions for session management
 *
 * @module lib/session/contexts
 */

import { createContext } from "react";
import type { SessionActionsValue, SessionStateValue } from "./types";

export const SessionStateContext = createContext<SessionStateValue | null>(
  null
);
SessionStateContext.displayName = "SessionStateContext";

export const SessionActionsContext = createContext<SessionActionsValue | null>(
  null
);
SessionActionsContext.displayName = "SessionActionsContext";
