import { useContext } from "react";
import { DataPlatformContext } from "../DataPlatformContext";

export function useDataPlatform() {
  const context = useContext(DataPlatformContext);
  if (!context) {
    throw new Error("useDataPlatform must be used within DataPlatformProvider");
  }
  return context;
}
