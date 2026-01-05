
import { useContext } from "react";
import { ResearchContext } from "./ResearchContext.js";

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearch must be used within a ResearchProvider");
  }
  return context;
};
