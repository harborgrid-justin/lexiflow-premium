/**
 * Clients Context Definitions
 * Split state/actions contexts for optimal performance
 *
 * @module lib/clients
 */

import { createContext } from "react";

import type { ClientsActionsValue, ClientsStateValue } from "./types";

export const ClientsStateContext = createContext<ClientsStateValue | null>(
  null
);
ClientsStateContext.displayName = "ClientsStateContext";

export const ClientsActionsContext = createContext<ClientsActionsValue | null>(
  null
);
ClientsActionsContext.displayName = "ClientsActionsContext";
