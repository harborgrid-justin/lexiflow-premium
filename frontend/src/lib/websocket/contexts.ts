/**
 * WebSocket Contexts
 * React context definitions for WebSocket connections
 *
 * @module lib/websocket/contexts
 */

import { createContext } from "react";

import type { WebSocketActionsValue, WebSocketStateValue } from "./types";

export const WebSocketStateContext = createContext<WebSocketStateValue | null>(
  null
);
WebSocketStateContext.displayName = "WebSocketStateContext";

export const WebSocketActionsContext =
  createContext<WebSocketActionsValue | null>(null);
WebSocketActionsContext.displayName = "WebSocketActionsContext";
