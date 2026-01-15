/**
 * Service Contexts
 * React context definitions for service layer
 *
 * @module lib/service/contexts
 */

import { createContext } from "react";
import type { ServiceActionsValue, ServiceStateValue } from "./types";

export const ServiceStateContext = createContext<ServiceStateValue | null>(
  null
);
ServiceStateContext.displayName = "ServiceStateContext";

export const ServiceActionsContext = createContext<ServiceActionsValue | null>(
  null
);
ServiceActionsContext.displayName = "ServiceActionsContext";
