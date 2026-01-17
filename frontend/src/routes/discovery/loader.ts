/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { discoveryApi } from "@/lib/frontend-api";
import { DataService } from "@/services/data/data-service.service";

import type { DiscoveryRequest, Evidence, ProductionSet } from "@/types";
import type { ActionFunctionArgs } from "react-router";

export interface DiscoveryLoaderData {
  evidence: Evidence[];
  requests: DiscoveryRequest[];
  productions: ProductionSet[];
}

export async function clientLoader() {
  const [evidenceResult, requests, productions] = await Promise.all([
    discoveryApi.getAllEvidence({ page: 1, limit: 200 }),
    DataService.discovery.getRequests(),
    DataService.discovery.getProductions(),
  ]);

  const evidence = evidenceResult.ok ? evidenceResult.data.data : [];

  return { evidence, requests, productions };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "create-evidence": {
      const data = JSON.parse(formData.get("data") as string);
      const result = await discoveryApi.createEvidence(data);

      if (!result.ok) {
        return { success: false, error: result.error.message };
      }

      return { success: true, evidence: result.data };
    }
    case "update-evidence": {
      const id = formData.get("id") as string;
      const updates = JSON.parse(formData.get("data") as string);
      const result = await discoveryApi.updateEvidence(id, updates);

      if (!result.ok) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    }
    case "tag-evidence": {
      const id = formData.get("id") as string;
      const tags = JSON.parse(formData.get("tags") as string);
      const result = await discoveryApi.updateEvidence(id, { tags });

      if (!result.ok) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}
