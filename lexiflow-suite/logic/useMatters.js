
import { useContext } from "react";
import { MatterContext } from "./MatterContext.js";

/**
 * useMatters: Consumer hook for accessing matter state and operations.
 */
export const useMatters = () => {
  const context = useContext(MatterContext);
  if (!context) {
    throw new Error("useMatters must be used within a MatterProvider");
  }
  return context;
};
