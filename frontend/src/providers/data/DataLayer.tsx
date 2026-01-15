/**
 * ================================================================================
 * DATA LAYER - DOMAIN DATA CONTEXTS
 * ================================================================================
 *
 * ENTERPRISE LAYERING: DATA LAYER
 *
 * RESPONSIBILITIES:
 * - Cases Management (CasesProvider)
 * - Document Management (DocumentsProvider)
 * - Discovery/Evidence Management (DiscoveryProvider)
 * - Time Tracking & Billing (BillingProvider)
 * - Error Boundaries (DataErrorProvider)
 *
 * NESTED STRUCTURE:
 * DataErrorProvider → CasesProvider → DocumentsProvider → DiscoveryProvider → BillingProvider → [other providers]
 *
 * RULES:
 * - Depends on Infrastructure Layer (QueryClient, Theme, Toast)
 * - Depends on Application Layer (Auth for user context)
 * - Must NOT depend on Domain/Route Layer
 * - Provides data context for all domain-specific components
 * - Inner providers can access outer provider contexts
 * - All providers use DataService for backend/local routing
 * - DataErrorProvider wraps all domain data operations
 *
 * INTEGRATION:
 * - CasesProvider: Case lifecycle, filtering, activation tracking
 * - DocumentsProvider: File uploads, document metadata, search
 * - DiscoveryProvider: Evidence items, chain of custody, discovery ops
 * - BillingProvider: Time entries, timers, invoices, rates
 *
 * NESTING RATIONALE:
 * - Cases → Documents (documents belong to cases)
 * - Documents → Discovery (evidence often references documents)
 * - Discovery → Billing (time tracking for discovery work)
 *
 * @module providers/data
 */

import type { ReactNode } from 'react';
import { AnalyticsProvider } from './analyticsprovider';
import { BillingProvider } from './billingprovider';
import { CasesProvider } from './casesprovider';
import { ClientsProvider } from './clientsprovider';
import { CommunicationsProvider } from './communicationsprovider';
import { ComplianceProvider } from './complianceprovider';
import { DiscoveryProvider } from './discoveryprovider';
import { DocketProvider } from './docketprovider';
import { DocumentsProvider } from './documentsprovider';
import { DataErrorProvider } from './errorprovider';
import { HRProvider } from './hrprovider';
import { TasksProvider } from './tasksprovider';
import { TrialProvider } from './trialprovider';

export interface DataLayerProps {
  children: ReactNode;
  /**
   * Preload a specific case by ID
   * Useful for deep links and route loaders
   */
  preloadCaseId?: string;
  /**
   * Filter documents and evidence by case
   * Optimizes initial data loading
   */
  filterByCaseId?: string;
}

export function DataLayer({ children, preloadCaseId, filterByCaseId }: DataLayerProps) {
  return (
    <DataErrorProvider>
      <CasesProvider preloadCaseId={preloadCaseId}>
        <DocumentsProvider caseId={filterByCaseId}>
          <DiscoveryProvider caseId={filterByCaseId}>
            <BillingProvider>
              <DocketProvider caseId={filterByCaseId}>
                <ClientsProvider>
                  <TasksProvider caseId={filterByCaseId}>
                    <ComplianceProvider>
                      <CommunicationsProvider caseId={filterByCaseId}>
                        <AnalyticsProvider caseId={filterByCaseId}>
                          <TrialProvider caseId={filterByCaseId}>
                            <HRProvider>
                              {children}
                            </HRProvider>
                          </TrialProvider>
                        </AnalyticsProvider>
                      </CommunicationsProvider>
                    </ComplianceProvider>
                  </TasksProvider>
                </ClientsProvider>
              </DocketProvider>
            </BillingProvider>
          </DiscoveryProvider>
        </DocumentsProvider>
      </CasesProvider>
    </DataErrorProvider>
  );
}
