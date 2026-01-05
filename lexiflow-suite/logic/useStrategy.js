
import { useContext } from "react";
import { StrategyContext } from "./StrategyContext.js";

export const useStrategy = () => {
  const context = useContext(StrategyContext);
  if (!context) {
    throw new Error("useStrategy must be used within a StrategyProvider");
  }
  return context;
};
