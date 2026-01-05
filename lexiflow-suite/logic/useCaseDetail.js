
import { useContext } from "react";
import { CaseDetailContext } from "./CaseDetailContext.js";

export const useCaseDetail = () => {
  const context = useContext(CaseDetailContext);
  if (!context) {
    throw new Error("useCaseDetail must be used within a CaseDetailProvider");
  }
  return context;
};
