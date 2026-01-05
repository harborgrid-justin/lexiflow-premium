
import React from "react";
import { MatterProvider } from "./MatterProvider";
import { DocProvider } from "./DocProvider";
import { BillingProvider } from "./BillingProvider";
import { WorkflowProvider } from "./WorkflowProvider";
import { ResearchProvider } from "./ResearchProvider";

/**
 * MainAppProvider: The architectural root for the LexiFlow logic layer.
 * Composition of specialized domain providers ensures clean state separation.
 */
export const MainAppProvider = ({ children }) => {
  return (
    <MatterProvider>
      <DocProvider>
        <BillingProvider>
          <WorkflowProvider>
            <ResearchProvider>
              {children}
            </ResearchProvider>
          </WorkflowProvider>
        </BillingProvider>
      </DocProvider>
    </MatterProvider>
  );
};
