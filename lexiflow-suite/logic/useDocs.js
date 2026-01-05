
import { useContext } from "react";
import { DocContext } from "./DocContext.js";

export const useDocs = () => {
  const context = useContext(DocContext);
  if (!context) {
    throw new Error("useDocs must be used within a DocProvider");
  }
  return context;
};
