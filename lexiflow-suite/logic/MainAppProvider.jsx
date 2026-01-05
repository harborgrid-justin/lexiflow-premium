
import React from "react";
import { MatterProvider } from "./MatterProvider.jsx";
import { DocProvider } from "./DocProvider.jsx";
import { BillingProvider } from "./BillingProvider.jsx";
import { WorkflowProvider } from "./WorkflowProvider.jsx";
import { ResearchProvider } from "./ResearchProvider.jsx";
import { JurisdictionProvider } from "./JurisdictionProvider.jsx";

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
              <JurisdictionProvider>
                {children}
              </JurisdictionProvider>
            </ResearchProvider>
          </WorkflowProvider>
        </BillingProvider>
      </DocProvider>
    </MatterProvider>
  );
};
