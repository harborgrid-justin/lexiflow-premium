
import { DataService } from "./dataService.ts";
import { BackgroundJobService } from "./backgroundJobService.ts";
import { Case, WorkflowTask, DocketEntry } from "../types.ts";

export interface ActivationConfig {
  responsibleAttorney: string;
  paralegal: string;
  billingCode: string;
  budgetCap: number;
  isPortalVisible: boolean;
  autoRedact: boolean;
}

export const MatterActivationService = {
  /**
   * Step 23-37: Finalize matter setup and activate enterprise modules.
   */
  async activateMatter(caseId: string, config: ActivationConfig) {
    console.log(`[ACTIVATION] Initiating matter ${caseId}...`);

    // 1. Ownership & RBAC (Step 23/24)
    await DataService.cases.update(caseId, {
      judge: config.responsibleAttorney, // Assigning to judge field for demo
      value: config.budgetCap,
      description: `Billing Code: ${config.billingCode}`
    });

    // 2. Client Visibility (Step 32)
    if (config.isPortalVisible) {
      this.syncToPortal(caseId, config.autoRedact);
    }

    // 3. Autonomous Monitoring (Step 33)
    await BackgroundJobService.schedulePostImportTasks(caseId);

    // 4. Analytics Scoring (Step 35)
    const healthScore = this.calculateInitialHealth();
    
    return {
      activated: true,
      healthScore,
      correlationId: `ACT-${Date.now()}`
    };
  },

  syncToPortal(caseId: string, autoRedact: boolean) {
    console.log(`[PORTAL] Syncing Case ${caseId}. Redaction: ${autoRedact}`);
  },

  calculateInitialHealth() {
    // Step 35: Standardized health scoring
    return 98; // Fresh matters start with high health
  }
};
