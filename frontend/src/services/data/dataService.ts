/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                         LEXIFLOW DATA SERVICE                             ║
 * ║                    Enterprise Data Access Layer v2.0                      ║
 * ║                       PhD-Level Systems Architecture                      ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * @module services/data/dataService
 * @architecture Backend-First Facade Pattern with Fallback Strategy
 * @author LexiFlow Engineering Team
 * @since 2025-12-18 (Complete Backend Migration)
 * @status PRODUCTION READY
 */

import { repositoryRegistry as legacyRepositoryRegistry } from "@/services/core/RepositoryFactory";
import { RepositoryRegistry } from "./repositories/RepositoryRegistry";

import { AdminDescriptors } from "./descriptors/AdminDescriptors";
import { AnalyticsDescriptors } from "./descriptors/AnalyticsDescriptors";
import { BusinessDescriptors } from "./descriptors/BusinessDescriptors";
import { ClientEntitiesDescriptors } from "./descriptors/ClientEntitiesDescriptors";
import { CommunicationDescriptors } from "./descriptors/CommunicationDescriptors";
import { ComplianceDescriptors } from "./descriptors/ComplianceDescriptors";
import { DiscoveryDescriptors } from "./descriptors/DiscoveryDescriptors";
import { FinancialDescriptors } from "./descriptors/FinancialDescriptors";
import { HRDescriptors } from "./descriptors/HRDescriptors";
import { LegalResearchDescriptors } from "./descriptors/LegalResearchDescriptors";
import { LitigationDescriptors } from "./descriptors/LitigationDescriptors";
import { OperationsDescriptors } from "./descriptors/OperationsDescriptors";
import { TrialDescriptors } from "./descriptors/TrialDescriptors";

// ═══════════════════════════════════════════════════════════════════════════
//                          ╔═══════════════════════╗
//                          ║  DATA SERVICE FACADE  ║
//                          ╚═══════════════════════╝
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Internal base object for DataService facade.
 * Uses `any` for property descriptors added via Object.defineProperties.
 * Type safety is enforced at the property access level through the descriptors.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required for dynamic property descriptor pattern
const DataServiceBase: any = {};

const allDescriptors = {
  ...LitigationDescriptors,
  ...DiscoveryDescriptors,
  ...TrialDescriptors,
  ...FinancialDescriptors,
  ...ClientEntitiesDescriptors,
  ...ComplianceDescriptors,
  ...AnalyticsDescriptors,
  ...CommunicationDescriptors,
  ...OperationsDescriptors,
  ...HRDescriptors,
  ...BusinessDescriptors,
  ...AdminDescriptors,
  ...LegalResearchDescriptors,
};

Object.defineProperties(DataServiceBase, allDescriptors);

// ═══════════════════════════════════════════════════════════════════════════
//                       MEMORY MANAGEMENT & DIAGNOSTICS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get memory usage statistics for the DataService
 *
 * Tracks the number of active repositories and event listeners.
 * Used for debugging memory leaks and monitoring system health.
 *
 * @returns Memory statistics object
 */
export function getDataServiceMemoryStats() {
  try {
    const registryStats = legacyRepositoryRegistry.getMemoryStats();
    const singletonCount = RepositoryRegistry.size();

    return {
      ...registryStats,
      refactoredSingletons: singletonCount,
      refactoredKeys: RepositoryRegistry.keys(),
      legacyRepositories: registryStats.repositoryCount,
      totalRepositories: singletonCount + registryStats.repositoryCount,
      estimatedMemoryKB: (singletonCount + registryStats.repositoryCount) * 2, // ~2KB per repo
    };
  } catch (error) {
    console.error("[DataService.getDataServiceMemoryStats] ❌ Error:", error);
    return {
      refactoredSingletons: 0,
      refactoredKeys: [],
      legacyRepositories: 0,
      totalListeners: 0,
      totalRepositories: 0,
      estimatedMemoryKB: 0,
      repositories: [],
    };
  }
}

/**
 * Log memory usage to console in formatted table
 *
 * Useful for debugging memory issues and monitoring repository lifecycle.
 * Outputs a detailed breakdown of all active repositories and their state.
 */
/**
 * Manually cleanup DataService (clear listeners and legacy caches)
 *
 * Use this during app unmount or to prevent memory leaks in hot-reload scenarios.
 */
export function cleanupDataService(): void {
  try {
    // Clean up legacy repositories
    if (
      legacyRepositoryRegistry &&
      typeof (legacyRepositoryRegistry as { cleanup?: unknown }).cleanup ===
        "function"
    ) {
      (
        legacyRepositoryRegistry as unknown as { cleanup: () => void }
      ).cleanup();
    }
    console.log("[DataService] ✅ Cleaned up legacy repositories");

    // Clean up backend/refactored repositories - clear the registry
    RepositoryRegistry.clear();

    console.log("[DataService] ✅ Cleanup complete");
  } catch (error) {
    console.error("[DataService] ❌ Cleanup failed:", error);
  }
}

export function logDataServiceMemory(): void {
  try {
    const stats = getDataServiceMemoryStats();
    console.group("[DataService] 📊 Memory Usage");
    console.log(`Total Repositories: ${stats.totalRepositories}`);
    console.log(`├─ Backend Singletons: ${stats.refactoredSingletons}`);
    console.log(`└─ Legacy Repositories: ${stats.legacyRepositories}`);
    console.log(`Total Listeners: ${stats.totalListeners}`);
    console.log(`Estimated Memory: ${stats.estimatedMemoryKB} KB`);

    if (stats.repositories?.length > 0) {
      console.log("\nRepository Details:");
      console.table(stats.repositories);
    }

    if (stats.refactoredKeys?.length > 0) {
      console.log("\nActive Backend Repositories:", stats.refactoredKeys);
    }

    console.groupEnd();
  } catch (error) {
    console.error("[DataService.logDataServiceMemory] ❌ Error:", error);
  }
}

export const DataService = DataServiceBase;
