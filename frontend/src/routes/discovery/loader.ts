/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

import { DataService } from "@/services/data/data-service.service";
import type { DiscoveryRequest, Evidence, ProductionSet } from "@/types";
import type { ActionFunctionArgs } from "react-router";

export interface DiscoveryLoaderData {
  evidence: Evidence[];
  requests: DiscoveryRequest[];
  productions: ProductionSet[];
}

export async function clientLoader() {
  const [evidence, requests, productions] = await Promise.all([
    DataService.evidence.getAll(),
    DataService.discovery.getRequests(),
    DataService.discovery.getProductions(),
  ]);

  return { evidence, requests, productions };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  switch (intent) {
    case "create-evidence": {
      const data = JSON.parse(formData.get("data") as string);
      const evidence = await DataService.evidence.add(data);
      return { success: true, evidence };
    }
    case "update-evidence": {
      const id = formData.get("id") as string;
      const updates = JSON.parse(formData.get("data") as string);
      await DataService.evidence.update(id, updates);
      return { success: true };
    }
    case "tag-evidence": {
      const id = formData.get("id") as string;
      const tags = JSON.parse(formData.get("tags") as string);
      await DataService.evidence.addTags(id, tags);
      return { success: true };
    }
    default:
      return { success: false, error: "Unknown intent" };
  }
}
